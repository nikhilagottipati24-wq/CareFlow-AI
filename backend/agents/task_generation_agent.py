from typing import List, Dict, Any
from models.schemas import Task, SourceReference
from agents.explanation_agent import PatientFriendlyExplanationAgent

class TaskGenerationAgent:
    """
    Agent 3 – Task Generation Agent
    Transforms validated discharge entities into prioritized, trackable tasks with patient-friendly instructions.
    Statuses: Pending | Completed | Needs Review
    Categories: Medication | Appointment | Test | Referral | Care | Follow-up
    """
    
    def __init__(self):
        self.name = "Task Generation Agent"
        self.explanation_agent = PatientFriendlyExplanationAgent()

    def generate_tasks(self, validated_entities: Dict[str, Any]) -> List[Task]:
        tasks: List[Task] = []
        task_counter = 1
        
        appointments = validated_entities.get("appointments", [])
        tests = validated_entities.get("tests", [])
        medications = validated_entities.get("medications", [])
        referrals = validated_entities.get("referrals", [])
        care_items = validated_entities.get("care_instructions", [])
        
        # 1. Tests -> Tasks
        for test in tests:
            status = test.status
            due_formatted = test.due_date_formatted
            friendly_text = self.explanation_agent.simplify_test(
                test.source_reference.original_text,
                test.test_name,
                due_formatted
            )
            tasks.append(Task(
                id=f"task-{task_counter}",
                patient_id="SYN-PT-80214",
                task_type="Test",
                name=f"Blood Test ({test.test_name})",
                description=test.source_reference.original_text,
                patient_friendly_explanation=friendly_text,
                due_date=test.date,
                due_date_formatted=due_formatted or "October 15, 2026",
                priority="High",
                status=status,
                source_reference=test.source_reference
            ))
            task_counter += 1

        # 2. Appointments -> Tasks
        for appt in appointments:
            status = appt.status
            friendly_text = self.explanation_agent.simplify_appointment(
                appt.source_reference.original_text,
                appt.specialty,
                appt.due_date_formatted
            )
            tasks.append(Task(
                id=f"task-{task_counter}",
                patient_id="SYN-PT-80214",
                task_type="Appointment",
                name=f"{appt.type}",
                description=appt.source_reference.original_text,
                patient_friendly_explanation=friendly_text,
                due_date=appt.date,
                due_date_formatted=appt.due_date_formatted or "Date Unspecified",
                priority="High" if "cardio" in appt.type.lower() else "Medium",
                status=status,
                source_reference=appt.source_reference
            ))
            task_counter += 1

        # 3. Referrals -> Tasks
        for ref in referrals:
            friendly_text = f"Follow up on your outpatient referral for {ref.specialty}."
            tasks.append(Task(
                id=f"task-{task_counter}",
                patient_id="SYN-PT-80214",
                task_type="Referral",
                name=f"Referral ({ref.specialty})",
                description=ref.source_reference.original_text,
                patient_friendly_explanation=friendly_text,
                due_date="2026-11-02",
                due_date_formatted="November 2, 2026",
                priority="Medium",
                status=ref.status,
                source_reference=ref.source_reference
            ))
            task_counter += 1

        # 4. Medications -> Tasks
        for med in medications:
            friendly_text = self.explanation_agent.simplify_medication(med.name, med.instruction)
            tasks.append(Task(
                id=f"task-{task_counter}",
                patient_id="SYN-PT-80214",
                task_type="Medication",
                name=f"Prescription: {med.name}",
                description=med.instruction,
                patient_friendly_explanation=friendly_text,
                due_date="2026-10-14",
                due_date_formatted="Daily Routine",
                priority="High",
                status=med.status,
                source_reference=med.source_reference
            ))
            task_counter += 1

        # 5. Care Instructions -> Tasks
        for care in care_items:
            friendly_text = self.explanation_agent.simplify_care(care.title, care.instruction)
            tasks.append(Task(
                id=f"task-{task_counter}",
                patient_id="SYN-PT-80214",
                task_type="Care",
                name=care.title,
                description=care.instruction,
                patient_friendly_explanation=friendly_text,
                due_date="2026-10-14",
                due_date_formatted="Ongoing Care",
                priority="Medium",
                status="Pending",
                source_reference=care.source_reference
            ))
            task_counter += 1

        return tasks
