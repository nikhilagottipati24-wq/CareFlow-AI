"""
CareFlow AI Multi-Agent Orchestrator
Coordinates Document Extraction, Validation, Task Generation, Language Simplification,
Safety Escalation, Provider Matching, and Timeline Construction.
Maintains full transparent audit logging.
"""

from datetime import datetime
from typing import Dict, Any, List, Optional
import pymupdf
fitz = pymupdf

from backend.models import (
    Patient,
    DischargeDocument,
    AnalyzeResponse,
    AuditLog,
    TaskItem,
    ReviewItem,
    Provider
)
from backend.agents.extraction_agent import DocumentExtractionAgent
from backend.agents.validation_agent import ValidationAgent
from backend.agents.task_agent import TaskGenerationAgent
from backend.agents.explanation_agent import PatientFriendlyExplanationAgent
from backend.agents.safety_agent import SafetyEscalationAgent
from backend.agents.provider_agent import ProviderFinderAgent

class AgentOrchestrator:
    def __init__(self):
        self.extractor = DocumentExtractionAgent()
        self.validator = ValidationAgent()
        self.task_generator = TaskGenerationAgent()
        self.explainer = PatientFriendlyExplanationAgent()
        self.safety_guard = SafetyEscalationAgent()
        self.provider_finder = ProviderFinderAgent()

    def extract_text_from_pdf_bytes(self, pdf_bytes: bytes) -> str:
        """
        Uses PyMuPDF to extract text from an uploaded synthetic PDF document.
        """
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            extracted_pages = []
            for page_idx in range(len(doc)):
                page = doc[page_idx]
                page_text = page.get_text()
                extracted_pages.append(f"--- Page {page_idx + 1} ---\n{page_text}")
            return "\n\n".join(extracted_pages)
        except Exception as e:
            return f"Error extracting PDF: {str(e)}"

    def run_pipeline(
        self,
        raw_text: str,
        patient: Optional[Patient] = None,
        document_id: str = "doc-001",
        file_name: str = "discharge_summary.txt"
    ) -> AnalyzeResponse:
        """
        Executes the end-to-end multi-agent coordination pipeline.
        """
        if not patient:
            patient = Patient()

        audit_logs: List[AuditLog] = []

        def log_step(agent: str, action: str, detail: str):
            now_str = datetime.now().strftime("%I:%M %p")
            audit_logs.append(AuditLog(
                id=f"log-{len(audit_logs) + 1}",
                timestamp=now_str,
                agent_name=agent,
                action=action,
                detail=detail
            ))

        # Step 1: Ingestion & Document Processing
        log_step(
            "Document Ingestion Service",
            "Document processed",
            f"Successfully parsed synthetic document '{file_name}' ({len(raw_text.splitlines())} lines)."
        )

        # Step 2: Agent 1 – Document Extraction
        extracted_data = self.extractor.extract(raw_text, patient)
        total_extracted = (
            len(extracted_data["appointments"]) +
            len(extracted_data["medications"]) +
            len(extracted_data["tests"]) +
            len(extracted_data["referrals"]) +
            len(extracted_data["care_instructions"]) +
            len(extracted_data["warning_signs"])
        )
        log_step(
            self.extractor.name,
            f"{total_extracted} instructions extracted",
            f"Identified {len(extracted_data['appointments'])} appointments, {len(extracted_data['tests'])} tests, {len(extracted_data['medications'])} medications, and {len(extracted_data['warning_signs'])} warning signs."
        )

        # Step 3: Agent 2 – Validation & Ambiguity Detection
        validated_data, reviews = self.validator.validate(extracted_data, raw_text, patient, file_name)
        if reviews:
            log_step(
                self.validator.name,
                f"{len(reviews)} ambiguous or conflicting instruction(s) detected",
                f"Flagged items for clinical review: {', '.join(r.issue for r in reviews)}."
            )
        else:
            log_step(
                self.validator.name,
                "Validation completed",
                "All extracted dates, dosages, and timelines successfully verified."
            )

        # Step 4: Agent 5 – Safety & Escalation Agent Scan
        safety_review = self.safety_guard.scan_document_for_clinical_inquiries(raw_text, patient, reviews)
        if safety_review:
            reviews.append(safety_review)
            log_step(
                self.safety_guard.name,
                "1 item escalated to human review",
                f"Safety guardrail triggered: {safety_review.issue}. Direct AI answers blocked."
            )

        # Step 5: Agent 3 – Task Generation
        tasks = self.task_generator.generate_tasks(validated_data, patient)
        # Update any task whose related entity is under review
        review_ref_set = {r.source_reference for r in reviews}
        for task in tasks:
            if task.source_reference in review_ref_set or any("DOC" in r.id for r in reviews):
                task.status = "Needs Review"

        log_step(
            self.task_generator.name,
            f"{len(tasks)} tasks created",
            f"Generated {len(tasks)} actionable items across Medication, Appointment, Test, and Care categories."
        )

        # Step 6: Agent 4 – Patient-Friendly Language Simplification
        self.explainer.enrich_data(validated_data, tasks)
        log_step(
            self.explainer.name,
            "Patient-friendly explanations generated",
            "Rewrote clinical terms into plain, reassuring English without modifying clinical meaning."
        )

        # Step 7: Agent 6 – Provider Finder
        specialties = [a.specialty for a in validated_data.get("appointments", [])]
        specialties.extend([r.specialty for r in validated_data.get("referrals", [])])
        matched_providers = self.provider_finder.find_matches(specialties, preferred_location="Chennai")
        log_step(
            self.provider_finder.name,
            f"{len(matched_providers)} potential synthetic provider matches found",
            f"Matched synthetic facilities for: {', '.join(set(specialties) or ['General Care'])}."
        )

        # Step 8: Build Chronological Timeline
        timeline = self._build_timeline(validated_data, patient, reviews)
        log_step(
            "Timeline Orchestrator",
            "Care timeline constructed",
            f"Assembled chronological milestone schedule starting from discharge date {patient.discharge_date}."
        )

        # Calculate Summary Stats
        pending_count = sum(1 for t in tasks if t.status == "Pending")
        completed_count = sum(1 for t in tasks if t.status == "Completed")
        active_reviews_count = len([r for r in reviews if r.status == "Needs Review"])

        stats = {
            "total_tasks": len(tasks),
            "pending": pending_count,
            "completed": completed_count,
            "needs_review": active_reviews_count
        }

        return AnalyzeResponse(
            document_id=document_id,
            patient=patient,
            appointments=validated_data.get("appointments", []),
            medications=validated_data.get("medications", []),
            tests=validated_data.get("tests", []),
            referrals=validated_data.get("referrals", []),
            care_instructions=validated_data.get("care_instructions", []),
            warning_signs=validated_data.get("warning_signs", []),
            tasks=tasks,
            reviews=reviews,
            timeline=timeline,
            matched_providers=matched_providers,
            audit_logs=audit_logs,
            summary_stats=stats
        )

    def _build_timeline(
        self,
        validated_data: Dict[str, Any],
        patient: Patient,
        reviews: Optional[List[ReviewItem]] = None
    ) -> List[Dict[str, Any]]:
        """
        Builds a chronological timeline of post-discharge events.
        """
        timeline = []

        # 0. Check if an invalid document review is flagged
        if reviews:
            for r in reviews:
                if "Unrecognized" in r.issue or "Non-Discharge" in r.issue:
                    timeline.append({
                        "id": "tl-doc-review",
                        "date": "Immediate Action",
                        "title": "Document Verification Required",
                        "description": "Uploaded document flagged for clinical human review due to missing or unrecognized discharge instructions.",
                        "category": "Review",
                        "status": "Needs Review",
                        "source": r.source_reference
                    })

        # 1. Discharge event
        timeline.append({
            "id": "tl-0",
            "date": patient.discharge_date or "October 14, 2026",
            "title": "Discharged from Hospital",
            "description": f"Successfully discharged from {patient.hospital}. Post-discharge care plan activated.",
            "category": "Discharge",
            "status": "Completed",
            "source": "Discharge Record – Page 1"
        })

        # 2. Tests
        for test in validated_data.get("tests", []):
            timeline.append({
                "id": f"tl-test-{test.id}",
                "date": test.date or "Date Pending (Needs Review)",
                "title": f"Laboratory Test: {test.test_name}",
                "description": test.instructions or test.patient_friendly_explanation or "Routine diagnostic follow-up",
                "category": "Test",
                "status": test.status,
                "source": test.source_reference
            })

        # 3. Appointments
        for appt in validated_data.get("appointments", []):
            timeline.append({
                "id": f"tl-appt-{appt.id}",
                "date": appt.date or "Date To Be Confirmed (Needs Review)",
                "title": f"Specialist Visit: {appt.type}",
                "description": appt.patient_friendly_explanation or appt.notes or f"Follow-up consultation with {appt.specialty}",
                "category": "Appointment",
                "status": appt.status,
                "source": appt.source_reference
            })

        # 4. Referrals
        for ref in validated_data.get("referrals", []):
            timeline.append({
                "id": f"tl-ref-{ref.id}",
                "date": "Target: Within 2 to 4 weeks",
                "title": f"Referral Consultation: {ref.specialty}",
                "description": ref.reason or f"Specialist evaluation at referred facility.",
                "category": "Referral",
                "status": ref.status,
                "source": ref.source_reference
            })

        # 5. Follow-up Review milestone
        timeline.append({
            "id": "tl-final",
            "date": "October 28, 2026",
            "title": "Comprehensive Post-Discharge Care Review",
            "description": "Evaluation of medication compliance, symptom recovery, and specialist visit results.",
            "category": "Follow-up",
            "status": "Pending",
            "source": "Care Coordination Protocol"
        })

        return timeline
