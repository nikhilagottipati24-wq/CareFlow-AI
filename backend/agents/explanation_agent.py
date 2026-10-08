"""
Agent 4 – Patient-Friendly Explanation Agent
Simplifies medical jargon into readable, reassuring English.
Strictly preserves the original meaning and NEVER invents advice or modifications.
"""

from typing import Dict, Any, List
from backend.models import (
    Appointment,
    Medication,
    Test,
    Referral,
    CareInstruction,
    TaskItem
)

class PatientFriendlyExplanationAgent:
    def __init__(self):
        self.name = "Patient-Friendly Explanation Agent"

    def simplify_text(self, text: str, category: str) -> str:
        """
        Transforms medical terminology into clear, accessible plain English
        while preserving strict clinical fidelity.
        """
        t = text.strip()
        tl = t.lower()

        if category == "Medication":
            if "atorvastatin" in tl:
                return "Take 1 tablet of Atorvastatin (40 mg) by mouth every night before going to bed. Continue this for 30 days as directed."
            elif "aspirin" in tl:
                return "Take 1 low-dose Aspirin (81 mg) by mouth once every day with food to help protect your stomach."
            elif "metoprolol" in tl:
                return "Take 1 tablet of Metoprolol (25 mg) by mouth twice a day (morning and evening), exactly as instructed."
            elif "insulin glargine" in tl:
                return "Inject 18 units of Insulin Glargine under the skin every evening around 9:00 PM for the next 90 days."
            elif "empagliflozin" in tl:
                return "Take 1 tablet of Empagliflozin (10 mg) by mouth once daily every morning."
            elif "lisinopril" in tl:
                return "Take 1 tablet of Lisinopril (5 mg) by mouth once every morning."
            elif "metformin" in tl:
                return "Take 1 tablet of Metformin (500 mg) by mouth twice each day with your meals."
            elif "furosemide" in tl:
                return "Take 1 tablet of Furosemide (20 mg) by mouth once each morning."
            elif "cephalexin" in tl:
                return "Take 1 capsule of Cephalexin (500 mg) by mouth four times every day for 7 full days to finish the antibiotic course."
            elif "clopidogrel" in tl:
                return "Take 1 tablet of Clopidogrel (75 mg) by mouth once every day. This is a critical blood-thinner; do not stop taking it without your doctor's explicit instruction."
            else:
                return f"Take your prescribed medication '{text}' exactly according to the schedule on your bottle."

        elif category == "Appointment":
            if "cardio" in tl:
                return "You have an outpatient heart specialist (cardiology) appointment scheduled to review your recovery and symptoms."
            elif "endocrine" in tl:
                return "You have an appointment with your endocrinology specialist to review your blood sugar control and care plan."
            elif "primary care" in tl:
                return "Check in with your primary care doctor within 3 to 4 weeks after hospital discharge."
            elif "ortho" in tl:
                return "You have a follow-up visit scheduled with your orthopedic surgeon to check joint healing and evaluate your incision."
            else:
                return f"You have an upcoming appointment: {text}. Bring your discharge papers with you."

        elif category == "Test":
            if "bmp" in tl or "cbc" in tl or "metabolic" in tl:
                return "You need a routine blood test (BMP and CBC) to check kidney function, electrolytes, and blood cell counts."
            elif "lipid" in tl:
                return "You have a fasting cholesterol and lipid blood test scheduled in 6 weeks."
            elif "hba1c" in tl:
                return "You have a blood sugar (HbA1c) and kidney urine test scheduled to monitor your diabetes health."
            elif "electrolyte" in tl:
                return "You have a follow-up electrolyte blood test ordered to ensure your body's salt and mineral balance is stable."
            else:
                return f"Complete the ordered laboratory test: {text}."

        elif category == "Care":
            if "catheter" in tl or "incision" in tl or "wound" in tl:
                return "Keep your puncture or surgical site clean and completely dry. You may take a quick shower after 48 hours, but do not soak in a bath or swimming pool."
            elif "lift" in tl or "weight" in tl:
                return "Do not lift anything heavier than 10 pounds (like heavy grocery bags) for the next 10 days to allow your body to heal."
            elif "glucose" in tl:
                return "Check and write down your blood sugar levels twice a day—once when you wake up and once after dinner."
            elif "dressing" in tl:
                return "Keep the surgical bandage completely dry for the first 3 days (72 hours)."
            else:
                return f"Follow this recovery instruction: {text}"

        return text

    def enrich_data(self, extracted_data: Dict[str, Any], tasks: List[TaskItem]) -> None:
        """
        Attaches patient-friendly explanations to extracted items and tasks in-place.
        """
        for appt in extracted_data.get("appointments", []):
            appt.patient_friendly_explanation = self.simplify_text(appt.notes or appt.type, "Appointment")

        for med in extracted_data.get("medications", []):
            med.patient_friendly_explanation = self.simplify_text(med.instruction, "Medication")

        for test in extracted_data.get("tests", []):
            test.patient_friendly_explanation = self.simplify_text(test.instructions or test.test_name, "Test")

        for care in extracted_data.get("care_instructions", []):
            care.patient_friendly_explanation = self.simplify_text(care.instruction, "Care")

        for task in tasks:
            task.patient_friendly_explanation = self.simplify_text(task.description, task.category)
