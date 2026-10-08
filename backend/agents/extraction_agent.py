"""
Agent 1 – Document Extraction Agent
Extracts appointments, tests, medications, care instructions, and warning signs
strictly from the discharge summary text. Does NOT infer missing medical info.
"""

import re
from typing import Dict, Any, List
from backend.models import (
    Appointment,
    Medication,
    Test,
    Referral,
    CareInstruction,
    WarningSign,
    Patient
)

class DocumentExtractionAgent:
    def __init__(self):
        self.name = "Document Extraction Agent"

    def extract(self, raw_text: str, patient: Patient) -> Dict[str, Any]:
        """
        Parses discharge summary text and returns structured entities with source references.
        """
        text = raw_text.strip()
        lines = [line.strip() for line in text.split("\n") if line.strip()]

        appointments: List[Appointment] = []
        medications: List[Medication] = []
        tests: List[Test] = []
        referrals: List[Referral] = []
        care_instructions: List[CareInstruction] = []
        warning_signs: List[WarningSign] = []

        # Current section tracker
        current_section = "GENERAL"

        for idx, line in enumerate(lines):
            line_upper = line.upper()

            # Detect sections with word boundaries to avoid false positives (e.g. 'COLLABORATION' containing 'LAB')
            if re.search(r"\b(MEDICATIONS?|PRESCRIPTIONS?)\b", line_upper):
                current_section = "MEDICATIONS"
                continue
            elif re.search(r"\b(APPOINTMENTS?|FOLLOW-?UPS?|CLINIC VISITS?)\b", line_upper):
                current_section = "APPOINTMENTS"
                continue
            elif re.search(r"\b(TESTS?|LABS?|LABORATORY|DIAGNOSTICS?|PANELS?)\b", line_upper):
                current_section = "TESTS"
                continue
            elif re.search(r"\b(REFERRALS?|CONSULTS?)\b", line_upper):
                current_section = "REFERRALS"
                continue
            elif re.search(r"\b(CARE|WOUND|ACTIVITY|DIET)\b", line_upper):
                current_section = "CARE"
                continue
            elif re.search(r"\b(WARNINGS?|RED FLAGS?|EMERGENCY)\b", line_upper):
                current_section = "WARNINGS"
                continue

            # Page detection heuristic if headers contain PAGE
            page_match = re.search(r"Page\s*(\d+)", line, re.IGNORECASE)
            page_num = page_match.group(1) if page_match else "1"

            # Parse based on section or line content
            if current_section == "MEDICATIONS" or re.match(r"^\d+\.\s+[A-Za-z]+", line):
                med_match = re.match(r"^(\d+\.)?\s*(.+)$", line)
                if med_match:
                    content = med_match.group(2).strip()
                    # Skip sub-notes that are not medication names
                    if not content.startswith("[Note") and len(content) > 5 and any(unit in content.lower() for unit in ["mg", "units", "tablet", "capsule", "daily", "oral"]):
                        name_part = content.split(" ")[0]
                        # check for duration
                        duration_match = re.search(r"for\s+(\d+\s+(?:days|weeks|months))", content, re.IGNORECASE)
                        duration = duration_match.group(1) if duration_match else None
                        
                        med_id = f"med-{len(medications) + 1}"
                        medications.append(Medication(
                            id=med_id,
                            patient_id=patient.id,
                            name=f"{name_part} {content.split(' ')[1]}" if len(content.split(' ')) > 1 else name_part,
                            instruction=content,  # PRESERVED EXACTLY AS WRITTEN
                            duration=duration,
                            status="Active",
                            source_reference=f"Discharge Summary - Page {page_num} - Medications section"
                        ))

            elif current_section == "APPOINTMENTS" or "follow-up" in line.lower() or "consult" in line.lower():
                if len(line) > 8 and not line.startswith("[Note"):
                    # Extract date if present
                    date_match = re.search(r"(?:on|target:)?\s*([A-Za-z]+\s+\d{1,2}(?:,\s*\d{4})?)", line)
                    date_val = date_match.group(1) if date_match else None

                    # Specialty detection
                    specialty = "Cardiology" if "cardio" in line.lower() else (
                        "Endocrinology" if "endocrine" in line.lower() else (
                            "Nephrology" if "nephro" in line.lower() else (
                                "Orthopedics" if "ortho" in line.lower() else (
                                    "Primary Care" if "primary" in line.lower() else "General Specialist"
                                )
                            )
                        )
                    )

                    appt_id = f"appt-{len(appointments) + 1}"
                    # Check if it specifies a referral
                    if "referral" in line.lower():
                        referrals.append(Referral(
                            id=f"ref-{len(referrals) + 1}",
                            patient_id=patient.id,
                            specialty=specialty,
                            reason=line.lstrip("- •*"),
                            status="Pending",
                            source_reference=f"Discharge Summary - Page {page_num} - Referrals section"
                        ))
                    else:
                        clean_type = line.lstrip("- •*").split(":")[0] if ":" in line else line.lstrip("- •*")
                        appointments.append(Appointment(
                            id=appt_id,
                            patient_id=patient.id,
                            type=clean_type[:60],
                            specialty=specialty,
                            date=date_val,
                            timeframe=None if date_val else "As indicated in summary",
                            status="Pending",
                            source_reference=f"Discharge Summary - Page {page_num} - Follow-up section",
                            notes=line
                        ))

            elif current_section == "TESTS" or any(kw in line.lower() for kw in ["panel", "test", "cbc", "bmp", "cmp", "glucose", "hba1c", "creatinine"]):
                if len(line) > 5 and not line.startswith("[Note"):
                    date_match = re.search(r"(?:on|by|target:)\s*([A-Za-z]+\s+\d{1,2}(?:,\s*\d{4})?)", line)
                    date_val = date_match.group(1) if date_match else None
                    test_id = f"test-{len(tests) + 1}"
                    clean_name = line.lstrip("- •*").split(" on ")[0] if " on " in line else line.lstrip("- •*")
                    tests.append(Test(
                        id=test_id,
                        patient_id=patient.id,
                        test_name=clean_name[:60],
                        date=date_val,
                        status="Pending",
                        source_reference=f"Discharge Summary - Page {page_num} - Tests & Diagnostics section",
                        instructions=line
                    ))

            elif current_section == "CARE":
                if len(line) > 6 and not line.startswith("[Note"):
                    category = "Wound Care" if any(w in line.lower() for w in ["wound", "incision", "catheter", "dressing", "bath"]) else (
                        "Activity" if any(w in line.lower() for w in ["lift", "weight", "walk", "exercise", "rest"]) else (
                            "Diet" if any(w in line.lower() for w in ["diet", "sodium", "fluid", "glucose log"]) else "General Care"
                        )
                    )
                    care_id = f"care-{len(care_instructions) + 1}"
                    care_instructions.append(CareInstruction(
                        id=care_id,
                        patient_id=patient.id,
                        category=category,
                        instruction=line.lstrip("- •*"),
                        source_reference=f"Discharge Summary - Page {page_num} - Care & Recovery section"
                    ))

            elif current_section == "WARNINGS":
                if len(line) > 8 and not line.startswith("[Note"):
                    warn_id = f"warn-{len(warning_signs) + 1}"
                    warning_signs.append(WarningSign(
                        id=warn_id,
                        patient_id=patient.id,
                        symptom=line.lstrip("- •*"),
                        action="Seek immediate emergency medical attention or contact clinic immediately.",
                        source_reference=f"Discharge Summary - Page {page_num} - Warning Signs & Red Flags section"
                    ))

        return {
            "appointments": appointments,
            "medications": medications,
            "tests": tests,
            "referrals": referrals,
            "care_instructions": care_instructions,
            "warning_signs": warning_signs
        }
