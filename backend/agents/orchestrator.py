import datetime
from typing import Dict, Any, List
from models.schemas import (
    AIActivityLog, ReviewItem, Task, DischargeDocument, Patient
)
from agents.extraction_agent import DocumentExtractionAgent
from agents.validation_agent import ValidationAgent
from agents.task_generation_agent import TaskGenerationAgent
from agents.explanation_agent import PatientFriendlyExplanationAgent
from agents.safety_escalation_agent import SafetyEscalationAgent
from agents.provider_agent import ProviderFinderAgent
from document_processor.pdf_parser import DocumentParser

class AgentOrchestrator:
    """
    CareFlow AI Agentic Orchestration Layer
    Coordinates specialized agents in a multi-stage post-discharge pipeline:
    Document Processing -> Extraction -> Validation -> Safety Evaluation -> Task Generation -> Provider Matching
    Generates transparent audit logs of all agent actions.
    """
    
    def __init__(self):
        self.extraction_agent = DocumentExtractionAgent()
        self.validation_agent = ValidationAgent()
        self.task_agent = TaskGenerationAgent()
        self.explanation_agent = PatientFriendlyExplanationAgent()
        self.safety_agent = SafetyEscalationAgent()
        self.provider_agent = ProviderFinderAgent()

    def process_discharge_summary(self, raw_text: str, file_name: str = "Discharge_Summary.txt") -> Dict[str, Any]:
        activity_logs: List[AIActivityLog] = []
        now = datetime.datetime.now()
        
        def add_log(agent_name: str, action: str, details: str, offset_seconds: int = 0):
            t = (now + datetime.timedelta(seconds=offset_seconds)).strftime("%I:%M %p")
            activity_logs.append(AIActivityLog(
                id=f"log-{len(activity_logs)+1}",
                timestamp=t,
                agent_name=agent_name,
                action=action,
                details=details
            ))

        # Step 1: Document Processing
        parsed = DocumentParser.parse_text(raw_text, file_name=file_name)
        add_log("Document Ingestion Engine", "Document processed", f"Successfully ingested '{file_name}' ({len(raw_text.split())} words, {parsed['total_pages']} page(s)).", 0)

        # Step 2: Agent 1 - Document Extraction Agent
        extracted = self.extraction_agent.process(parsed)
        total_extracted = (
            len(extracted["appointments"]) +
            len(extracted["tests"]) +
            len(extracted["medications"]) +
            len(extracted["referrals"]) +
            len(extracted["care_instructions"]) +
            len(extracted["warning_signs"])
        )
        add_log(self.extraction_agent.name, f"{total_extracted} instructions extracted", f"Extracted {len(extracted['medications'])} medications, {len(extracted['appointments'])} appointments, {len(extracted['tests'])} tests, {len(extracted['care_instructions'])} care instructions, {len(extracted['warning_signs'])} warning signs.", 1)
        add_log(self.extraction_agent.name, f"{len(extracted['appointments'])} appointments identified", f"Identified appointments including: {', '.join([a.type for a in extracted['appointments'][:3]])}", 2)

        # Step 3: Agent 2 - Validation Agent
        validated = self.validation_agent.process(extracted, raw_text=raw_text)
        review_items: List[ReviewItem] = validated.get("review_items", [])
        if review_items:
            add_log(self.validation_agent.name, f"{len(review_items)} ambiguous instruction(s) detected", f"Detected clinical ambiguities / missing dates in: {', '.join([r.issue for r in review_items])}", 3)
        else:
            add_log(self.validation_agent.name, "Information validated", "Validation check passed. All mandatory fields present.", 3)

        # Step 4: Agent 5 - Safety & Escalation Agent
        is_triggered, safety_result = self.safety_agent.evaluate_text_for_clinical_safety(raw_text, file_name=file_name)
        if is_triggered and safety_result.get("review_item"):
            review_items.append(safety_result["review_item"])
            add_log(self.safety_agent.name, "1 item escalated to human review", "Clinically sensitive medication change / symptom query detected. Escalated immediately to Human Review Center.", 4)

        # Step 5: Agent 3 - Task Generation Agent
        tasks: List[Task] = self.task_agent.generate_tasks(validated)
        add_log(self.task_agent.name, f"{len(tasks)} tasks created", f"Generated {len(tasks)} prioritized actionable tasks across Medication, Appointment, Test, and Care categories.", 5)

        # Step 6: Agent 6 - Synthetic Provider Matches
        provider_matches = self.provider_agent.find_matches(specialty="Cardiology", location="Chennai")
        add_log(self.provider_agent.name, "Synthetic provider matches retrieved", f"Matched {provider_matches['total_matches']} potential synthetic clinics for follow-up needs with non-guarantee disclaimer.", 6)

        return {
            "document": DischargeDocument(
                id=f"doc-{now.strftime('%Y%m%d%H%M%S')}",
                patient_id="SYN-PT-80214",
                file_name=file_name,
                upload_date=now.strftime("%B %d, %Y"),
                raw_text=raw_text,
                summary_type="Synthetic"
            ),
            "discharge_date": extracted.get("discharge_date", "October 14, 2026"),
            "appointments": validated["appointments"],
            "tests": validated["tests"],
            "medications": validated["medications"],
            "referrals": extracted.get("referrals", []),
            "care_instructions": extracted.get("care_instructions", []),
            "warning_signs": extracted.get("warning_signs", []),
            "tasks": tasks,
            "review_items": review_items,
            "provider_matches": provider_matches,
            "activity_logs": activity_logs,
            "total_actionable_items": len(tasks)
        }
