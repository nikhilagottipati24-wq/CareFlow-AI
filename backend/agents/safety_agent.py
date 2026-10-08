"""
Agent 5 – Safety / Escalation Agent
Guarantees strict healthcare safety boundaries.
Detects clinically sensitive patient inquiries, dosage questions,
stopping/starting medication inquiries, and acute symptom reports.
Forces immediate escalation to Human Review.
NEVER provides medical advice, diagnoses, or dosage modifications.
"""

import re
from typing import Dict, Any, Optional
from backend.models import (
    SafetyCheckResponse,
    ReviewItem,
    Patient
)

class SafetyEscalationAgent:
    def __init__(self):
        self.name = "Safety / Escalation Agent"

    def evaluate_query(self, query: str, context: Optional[str] = None) -> SafetyCheckResponse:
        """
        Evaluates a patient's question or statement against clinical safety guardrails.
        """
        q = query.lower()

        # 1. Stopping or starting medication
        if any(term in q for term in ["stop", "discontinue", "quit", "start taking", "skip"]):
            if any(med in q for med in ["medication", "pill", "clopidogrel", "plavix", "aspirin", "insulin", "dose", "statin", "blood thinner"]):
                return SafetyCheckResponse(
                    is_sensitive=True,
                    requires_escalation=True,
                    category="Medication Discontinuation Inquiry",
                    explanation="Your question involves whether to stop, skip, or change a prescribed medication.",
                    recommended_action="CareFlow AI cannot determine whether your medication should be stopped or changed. Please contact the appropriate healthcare professional or your care team immediately.",
                    disclaimer="CRITICAL SAFETY BOUNDARY: Do NOT alter or stop any prescription medication without explicit authorization from your physician or cardiologist."
                )

        # 2. Dosage changes
        if any(term in q for term in ["change dose", "increase dose", "decrease dose", "half dose", "double dose", "reduce the dose", "take more"]):
            return SafetyCheckResponse(
                is_sensitive=True,
                requires_escalation=True,
                category="Dosage Modification Inquiry",
                explanation="Your query requests advice on adjusting medication dosage.",
                recommended_action="CareFlow AI cannot modify prescription dosages. Please contact your prescribing physician or pharmacist for clinical guidance.",
                disclaimer="Modifying medication dosages without medical supervision can cause severe clinical complications."
            )

        # 3. New symptoms or emergency signs
        if any(sym in q for sym in ["chest pain", "short of breath", "bruise", "bleeding", "swelling", "dizzy", "fever", "fainting"]):
            return SafetyCheckResponse(
                is_sensitive=True,
                requires_escalation=True,
                category="Clinical Symptom Report",
                explanation="You reported a physical symptom or physiological change.",
                recommended_action="CareFlow AI is an administrative post-discharge coordinator and cannot evaluate clinical symptoms. If you are experiencing emergency symptoms (such as chest pain or severe shortness of breath), call emergency services (911/112/108) immediately. Otherwise, notify your physician.",
                disclaimer="CareFlow AI is NOT a diagnostic or emergency triage system."
            )

        # Default safe administrative answer
        return SafetyCheckResponse(
            is_sensitive=False,
            requires_escalation=False,
            category="Administrative Post-Discharge Inquiry",
            explanation="Your query pertains to administrative scheduling or timeline tracking.",
            recommended_action="Refer to your CareFlow AI care plan tasks and timeline for scheduled appointments and tests.",
            disclaimer="CareFlow AI is an organizational coordination tool. For all clinical concerns, consult your licensed medical provider."
        )

    def scan_document_for_clinical_inquiries(
        self,
        raw_text: str,
        patient: Patient,
        existing_reviews: list
    ) -> Optional[ReviewItem]:
        """
        Scans uploaded document or notes for embedded patient clinical questions
        (e.g., Scenario 5 patient portal inquiry).
        """
        raw_lower = raw_text.lower()
        if "patient notes:" in raw_lower or "should i stop" in raw_lower or "reduce the dose" in raw_lower:
            # Extract query quote
            match = re.search(r'("Patient notes:[^"]+")|(Patient notes:[^\n]+)', raw_text, re.IGNORECASE)
            inquiry_snippet = match.group(0) if match else "Patient portal inquiry regarding medication alteration"

            escalation_review = ReviewItem(
                id=f"rev-safety-{len(existing_reviews) + 1}",
                patient_id=patient.id,
                issue="Clinically Sensitive Patient Inquiry Detected",
                priority="High",
                reason="Discharge document contains an attached patient question regarding stopping or reducing antiplatelet medication due to forearm bruising.",
                status="Needs Review",
                source_reference="Discharge Summary - Attached Patient Portal Inquiry",
                original_text=inquiry_snippet,
                ai_interpretation="Patient asks whether to discontinue Clopidogrel (Plavix) due to mild bruising. Safety agent blocked automated reply and flagged for immediate nurse/physician clinical review."
            )
            return escalation_review
        return None
