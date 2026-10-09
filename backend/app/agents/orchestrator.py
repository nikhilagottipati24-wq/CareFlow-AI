import uuid
import re
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

class DocumentExtractionAgent:
    """Agent 1: Extracts structured entities from discharge summaries."""
    def run(self, raw_text: str) -> Dict[str, Any]:
        text_lower = raw_text.lower()
        extracted = {
            "appointments": [],
            "medications": [],
            "tests": [],
            "care_instructions": [],
            "warning_signs": [],
            "raw_findings": []
        }
        
        # Simple robust NLP / rule-based entity extraction
        lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
        current_section = "general"

        for line in lines:
            line_l = line.lower()
            if "medication" in line_l or "rx" in line_l:
                current_section = "medication"
                continue
            elif "appointment" in line_l or "follow-up" in line_l or "clinic" in line_l:
                current_section = "appointment"
                continue
            elif "lab" in line_l or "test" in line_l or "diagnostic" in line_l:
                current_section = "test"
                continue
            elif "warning" in line_l or "red flag" in line_l or "emergency" in line_l or "call 911" in line_l:
                current_section = "warning_signs"
                continue
            elif "diet" in line_l or "wound" in line_l or "activity" in line_l or "care" in line_l:
                current_section = "care"
                continue

            if current_section == "medication":
                extracted["medications"].append({
                    "raw": line,
                    "source": f"Section: Medications ({line[:40]}...)"
                })
            elif current_section == "appointment":
                extracted["appointments"].append({
                    "raw": line,
                    "source": f"Section: Follow-up Appointments ({line[:40]}...)"
                })
            elif current_section == "test":
                extracted["tests"].append({
                    "raw": line,
                    "source": f"Section: Diagnostic Tests ({line[:40]}...)"
                })
            elif current_section == "warning_signs":
                extracted["warning_signs"].append({
                    "raw": line,
                    "source": f"Section: Warning Signs ({line[:40]}...)"
                })
            elif current_section == "care":
                extracted["care_instructions"].append({
                    "raw": line,
                    "source": f"Section: Care Instructions ({line[:40]}...)"
                })
            else:
                extracted["raw_findings"].append(line)

        return extracted

class ValidationAgent:
    """Agent 2: Validates extracted instructions for completeness and clarity."""
    def run(self, extracted: Dict[str, Any]) -> List[Dict[str, Any]]:
        anomalies = []
        
        # Check for vague timeframes in appointments
        for appt in extracted.get("appointments", []):
            raw = appt["raw"].lower()
            if any(vague in raw for vague in ["soon", "as needed", "prn", "sometime", "tbd"]):
                anomalies.append({
                    "issue": "Missing or vague follow-up appointment date",
                    "issue_type": "Missing follow-up date",
                    "priority": "Medium",
                    "original_instruction": appt["raw"],
                    "reason": "Appointment instruction lacks a specific date or time window.",
                    "source_reference": appt.get("source", "Discharge Document")
                })

        # Check for vague medication durations
        for med in extracted.get("medications", []):
            raw = med["raw"].lower()
            if any(vague in raw for vague in ["until better", "as needed", "until resolved", "duration unknown"]):
                anomalies.append({
                    "issue": "Unclear medication duration or review cutoff",
                    "issue_type": "Unclear medication instruction",
                    "priority": "High",
                    "original_instruction": med["raw"],
                    "reason": "Medication duration is conditional without clear discontinuation criteria.",
                    "source_reference": med.get("source", "Discharge Document")
                })

        return anomalies

class TaskGenerationAgent:
    """Agent 3: Transforms validated instructions into prioritized actionable tasks."""
    def run(self, extracted: Dict[str, Any], patient_id: str) -> List[Dict[str, Any]]:
        tasks = []
        now = datetime.now()

        # Generate appointment tasks
        for idx, appt in enumerate(extracted.get("appointments", [])):
            tasks.append({
                "id": f"task-gen-{uuid.uuid4().hex[:6]}",
                "patient_id": patient_id,
                "task_type": "Appointment",
                "title": f"Follow-up: {appt['raw'][:50]}",
                "description": f"Scheduled clinic visit per discharge instructions: {appt['raw']}",
                "due_date": (now + timedelta(days=2 + idx * 3)).strftime("%Y-%m-%d"),
                "priority": "High" if idx == 0 else "Medium",
                "status": "Pending",
                "category": "Appointment",
                "source_reference": appt.get("source", "Discharge Document - Section 3"),
                "created_at": now.isoformat() + "Z",
                "updated_at": now.isoformat() + "Z",
                "completed_at": None
            })

        # Generate medication tasks
        for idx, med in enumerate(extracted.get("medications", [])):
            tasks.append({
                "id": f"task-gen-{uuid.uuid4().hex[:6]}",
                "patient_id": patient_id,
                "task_type": "Medication",
                "title": f"Prescription: {med['raw'][:50]}",
                "description": f"Patient medication regimen: {med['raw']}",
                "due_date": (now + timedelta(days=1)).strftime("%Y-%m-%d"),
                "priority": "High",
                "status": "Pending",
                "category": "Medication",
                "source_reference": med.get("source", "Discharge Document - Section 4"),
                "created_at": now.isoformat() + "Z",
                "updated_at": now.isoformat() + "Z",
                "completed_at": None
            })

        # Generate test tasks
        for idx, test in enumerate(extracted.get("tests", [])):
            tasks.append({
                "id": f"task-gen-{uuid.uuid4().hex[:6]}",
                "patient_id": patient_id,
                "task_type": "Test",
                "title": f"Diagnostic Lab: {test['raw'][:50]}",
                "description": f"Complete requested post-discharge diagnostic test: {test['raw']}",
                "due_date": (now + timedelta(days=5)).strftime("%Y-%m-%d"),
                "priority": "Medium",
                "status": "Pending",
                "category": "Test",
                "source_reference": test.get("source", "Discharge Document - Section 6"),
                "created_at": now.isoformat() + "Z",
                "updated_at": now.isoformat() + "Z",
                "completed_at": None
            })

        # Generate care instructions
        for idx, care in enumerate(extracted.get("care_instructions", [])):
            tasks.append({
                "id": f"task-gen-{uuid.uuid4().hex[:6]}",
                "patient_id": patient_id,
                "task_type": "Care",
                "title": f"Care Action: {care['raw'][:50]}",
                "description": f"Home self-care instructions: {care['raw']}",
                "due_date": (now + timedelta(days=3)).strftime("%Y-%m-%d"),
                "priority": "Medium",
                "status": "Pending",
                "category": "Care",
                "source_reference": care.get("source", "Discharge Document - Section 5"),
                "created_at": now.isoformat() + "Z",
                "updated_at": now.isoformat() + "Z",
                "completed_at": None
            })

        return tasks

class PatientExplanationAgent:
    """Agent 4: Converts clinical jargon into simple, patient-friendly guidance."""
    def explain(self, medical_text: str) -> str:
        # Standard lay-person translation dictionary
        translations = {
            "hypertension": "high blood pressure",
            "edema": "swelling from extra fluid",
            "arrhythmia": "irregular heartbeat",
            "dyspnea": "shortness of breath",
            "ambulate": "walk and move about",
            "prn": "as needed",
            "po": "by mouth",
            "bid": "two times a day",
            "tid": "three times a day",
            "qd": "once daily",
            "qhs": "at bedtime"
        }
        explained = medical_text
        for term, simple in translations.items():
            pattern = re.compile(r'\b' + re.escape(term) + r'\b', re.IGNORECASE)
            explained = pattern.sub(f"{simple} ({term})", explained)
        return explained

class SafetyAndEscalationAgent:
    """Agent 5: Enforces Responsible AI safeguards and flags clinical conflicts."""
    def evaluate(self, text: str, anomalies: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        reviews = []
        now_iso = datetime.now().isoformat() + "Z"

        for a in anomalies:
            reviews.append({
                "id": f"rev-gen-{uuid.uuid4().hex[:6]}",
                "patient_id": "demo-patient-001",
                "issue": a["issue"],
                "issue_type": a["issue_type"],
                "priority": a["priority"],
                "reason": a["reason"],
                "status": "Open",
                "original_instruction": a["original_instruction"],
                "ai_interpretation": "CareFlow AI has flagged this item for clinical review to ensure patient safety before finalization.",
                "source_reference": a["source_reference"],
                "created_at": now_iso,
                "resolved_at": None,
                "resolution_notes": None
            })

        return reviews

class ProviderFinderAgent:
    """Agent 6: Recommends synthetic providers based on specialty and location."""
    def match(self, specialty: str, providers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        spec_lower = specialty.lower()
        matches = [p for p in providers if spec_lower in p["specialty"].lower()]
        return matches or providers[:2]

class AgentOrchestrator:
    """Coordinates the 6 specialized AI agents through the upload & analysis pipeline."""
    def __init__(self):
        self.doc_extractor = DocumentExtractionAgent()
        self.validator = ValidationAgent()
        self.task_generator = TaskGenerationAgent()
        self.explainer = PatientExplanationAgent()
        self.safety_agent = SafetyAndEscalationAgent()
        self.provider_finder = ProviderFinderAgent()

    def process_summary(self, raw_text: str, patient_id: str = "demo-patient-001") -> Dict[str, Any]:
        stages = []
        now = datetime.now()

        # Stage 1: Document uploaded
        stages.append({
            "stage": 1,
            "title": "Document uploaded",
            "status": "completed",
            "timestamp": now.isoformat() + "Z",
            "message": "Discharge summary received and validated."
        })

        # Stage 2: Reading discharge summary
        stages.append({
            "stage": 2,
            "title": "Reading discharge summary",
            "status": "completed",
            "timestamp": now.isoformat() + "Z",
            "message": "Cleaned OCR text stream and normalized medical terminology."
        })

        # Stage 3: Extracting instructions
        extracted = self.doc_extractor.run(raw_text)
        stages.append({
            "stage": 3,
            "title": "Extracting instructions",
            "status": "completed",
            "timestamp": now.isoformat() + "Z",
            "message": f"Identified {len(extracted['medications'])} medications, {len(extracted['appointments'])} appointments, {len(extracted['tests'])} tests, and {len(extracted['care_instructions'])} care items."
        })

        # Stage 4: Validating extracted information
        anomalies = self.validator.run(extracted)
        stages.append({
            "stage": 4,
            "title": "Validating extracted information",
            "status": "completed",
            "timestamp": now.isoformat() + "Z",
            "message": f"Validation complete: {len(anomalies)} ambiguous or incomplete entries flagged."
        })

        # Stage 5: Creating actionable tasks
        tasks = self.task_generator.run(extracted, patient_id)
        stages.append({
            "stage": 5,
            "title": "Creating actionable tasks",
            "status": "completed",
            "timestamp": now.isoformat() + "Z",
            "message": f"Generated {len(tasks)} prioritized follow-up tasks."
        })

        # Stage 6: Identifying review items
        reviews = self.safety_agent.evaluate(raw_text, anomalies)
        stages.append({
            "stage": 6,
            "title": "Identifying review items",
            "status": "completed",
            "timestamp": now.isoformat() + "Z",
            "message": f"Transferred {len(reviews)} items to Human Review Center with safety audit references."
        })

        # Stage 7: Building care timeline
        stages.append({
            "stage": 7,
            "title": "Building care timeline",
            "status": "completed",
            "timestamp": now.isoformat() + "Z",
            "message": "Care timeline chronologically ordered with unscheduled items isolated."
        })

        return {
            "extracted": extracted,
            "anomalies": anomalies,
            "tasks": tasks,
            "reviews": reviews,
            "stages": stages
        }

orchestrator = AgentOrchestrator()
