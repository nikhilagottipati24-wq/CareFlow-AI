"""
Agent 3 – Task Generation Agent
Converts actionable instructions into trackable, priority-coded tasks
with clear categories, due dates, sources, and initial statuses.
"""

from typing import List, Dict, Any
from backend.models import (
    TaskItem,
    Appointment,
    Medication,
    Test,
    Referral,
    CareInstruction,
    Patient
)

class TaskGenerationAgent:
    def __init__(self):
        self.name = "Task Generation Agent"

    def generate_tasks(
        self,
        extracted_data: Dict[str, Any],
        patient: Patient
    ) -> List[TaskItem]:
        """
        Converts extracted appointments, medications, tests, referrals,
        and care instructions into actionable tasks.
        """
        tasks: List[TaskItem] = []
        task_id = 1

        appointments: List[Appointment] = extracted_data.get("appointments", [])
        medications: List[Medication] = extracted_data.get("medications", [])
        tests: List[Test] = extracted_data.get("tests", [])
        referrals: List[Referral] = extracted_data.get("referrals", [])
        care_instructions: List[CareInstruction] = extracted_data.get("care_instructions", [])

        # 1. Appointments -> Appointment Tasks
        for appt in appointments:
            status = "Needs Review" if appt.status == "Needs Review" else "Pending"
            priority = "High" if "cardio" in appt.specialty.lower() or status == "Needs Review" else "Medium"
            tasks.append(TaskItem(
                id=f"task-{task_id}",
                patient_id=patient.id,
                task_name=f"Attend {appt.type}",
                description=f"Attend scheduled outpatient checkup for {appt.specialty}. Bring discharge paperwork and current medication list.",
                category="Appointment",
                due_date=appt.date,
                priority=priority,
                status=status,
                source_reference=appt.source_reference,
                related_entity_id=appt.id
            ))
            task_id += 1

        # 2. Tests -> Test Tasks
        for test in tests:
            status = "Needs Review" if test.status == "Needs Review" else "Pending"
            priority = "High" if "blood" in test.test_name.lower() or "metabolic" in test.test_name.lower() else "Medium"
            tasks.append(TaskItem(
                id=f"task-{task_id}",
                patient_id=patient.id,
                task_name=f"Complete {test.test_name}",
                description=f"Complete ordered laboratory test ({test.test_name}). Follow fasting guidelines if instructed by your clinic.",
                category="Test",
                due_date=test.date,
                priority=priority,
                status=status,
                source_reference=test.source_reference,
                related_entity_id=test.id
            ))
            task_id += 1

        # 3. Medications -> Medication Tasks
        for med in medications:
            status = "Needs Review" if med.needs_review else "Pending"
            priority = "High" if any(critical in med.name.lower() for critical in ["aspirin", "clopidogrel", "insulin", "metoprolol"]) else "Medium"
            due_date = "Daily" if not med.duration else f"Daily (for {med.duration})"
            tasks.append(TaskItem(
                id=f"task-{task_id}",
                patient_id=patient.id,
                task_name=f"Take {med.name} as prescribed",
                description=f"Follow medication instruction exactly as documented: {med.instruction}",
                category="Medication",
                due_date=due_date,
                priority=priority,
                status=status,
                source_reference=med.source_reference,
                related_entity_id=med.id
            ))
            task_id += 1

        # 4. Care & Wound Instructions -> Care Tasks
        for care in care_instructions:
            tasks.append(TaskItem(
                id=f"task-{task_id}",
                patient_id=patient.id,
                task_name=f"Follow {care.category} Instructions",
                description=care.instruction,
                category="Care",
                due_date="Ongoing during recovery",
                priority="Medium",
                status="Pending",
                source_reference=care.source_reference,
                related_entity_id=care.id
            ))
            task_id += 1

        # 5. Referrals -> Referral Tasks
        for ref in referrals:
            tasks.append(TaskItem(
                id=f"task-{task_id}",
                patient_id=patient.id,
                task_name=f"Schedule {ref.specialty} Referral",
                description=f"Coordinate appointment with referred {ref.specialty} specialist. Reason: {ref.reason or 'Post-discharge specialist consultation'}.",
                category="Referral",
                due_date="Within 14 days",
                priority="Medium",
                status="Pending",
                source_reference=ref.source_reference,
                related_entity_id=ref.id
            ))
            task_id += 1

        # Fallback task for invalid / unrecognized documents
        if len(tasks) == 0:
            tasks.append(TaskItem(
                id="task-verify-doc",
                patient_id=patient.id,
                task_name="Verify Uploaded Document with Care Team",
                description="Uploaded document does not contain verifiable hospital discharge orders. Please confirm the document with your hospital or upload the correct discharge summary.",
                category="Care",
                due_date="Immediate",
                priority="High",
                status="Needs Review",
                source_reference="Uploaded File Validation – Page 1",
                patient_friendly_explanation="We could not find standard hospital discharge instructions in this document. Please check with your care team or re-upload the official discharge summary."
            ))

        return tasks
