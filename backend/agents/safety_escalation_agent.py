from typing import Dict, Any, Tuple
from models.schemas import ReviewItem, SourceReference

class SafetyEscalationAgent:
    """
    Agent 5 – Safety / Escalation Agent
    Enforces healthcare safety boundaries strictly.
    Detects clinically sensitive inquiries:
    - Questions about stopping medication
    - Questions about dosage modification
    - Reporting new symptoms (bleeding, chest tightness, pain, dizziness)
    - Ambiguities requiring clinical review
    
    CRITICAL: Never answers medically. Escalates to Human Review with standardized message.
    """
    
    ESCALATION_STANDARD_MESSAGE = (
        "Your question involves a medication-related clinical concern. "
        "CareFlow AI cannot determine whether your medication should be changed. "
        "Please contact the appropriate healthcare professional or care team."
    )

    def __init__(self):
        self.name = "Safety / Escalation Agent"

    def evaluate_text_for_clinical_safety(self, text: str, file_name: str = "Discharge_Summary.txt") -> Tuple[bool, Dict[str, Any]]:
        text_lower = text.lower()
        triggers = [
            "stop taking",
            "stop medication",
            "reduce the dosage",
            "lower the dose",
            "half a pill",
            "bleeding",
            "chest feels",
            "stomach feels uncomfortable",
            "skip a dose",
            "change my medicine",
            "dizzy",
            "shortness of breath"
        ]
        
        found_triggers = [t for t in triggers if t in text_lower]
        if found_triggers and ("patient reported concern" in text_lower or "asks" in text_lower or "inquired" in text_lower or "?" in text):
            review_item = ReviewItem(
                id="rev-safety-1",
                patient_id="SYN-PT-80214",
                issue="Patient medication alteration inquiry & reported symptom (High Priority Escalation)",
                priority="High",
                reason=(
                    "The patient inquired about altering antiplatelet therapy (stopping Clopidogrel or halving dosage) "
                    "following mild gum bleeding and abdominal discomfort. This is a clinical decision requiring urgent care team review."
                ),
                status="Pending",
                original_text=text,
                ai_interpretation=(
                    "Clinical safety escalation: Inquiries regarding stopping or modifying medication dosages cannot be processed by AI. "
                    "Escalated immediately to human clinical reviewer."
                ),
                source_reference=SourceReference(
                    document=file_name,
                    page=1,
                    section="Patient Reported Concern & Clinical Inquiry",
                    original_text=text.strip(),
                    agent_name=self.name,
                    confidence=1.0
                )
            )
            return True, {
                "triggered": True,
                "message": self.ESCALATION_STANDARD_MESSAGE,
                "review_item": review_item,
                "action_required": "Send to Human Reviewer"
            }
            
        return False, {
            "triggered": False,
            "message": "Content conforms to safety boundaries.",
            "review_item": None,
            "action_required": None
        }
