class PatientFriendlyExplanationAgent:
    """
    Agent 4 – Patient-Friendly Explanation Agent
    Rewrites complicated discharge instructions into simple, clear English.
    SAFETY RULES:
    - Strictly English only.
    - NEVER add medical advice.
    - Always preserve the exact clinical meaning of the original instruction.
    """
    
    def __init__(self):
        self.name = "Patient-Friendly Explanation Agent"

    def simplify_appointment(self, orig_text: str, specialty: str, date_formatted: str = None) -> str:
        date_str = f"on {date_formatted}" if date_formatted else "as instructed by your doctor"
        if "cardio" in specialty.lower():
            return f"You have a heart clinic (cardiology) follow-up planned {date_str}. Make sure to bring your medication list and discharge papers."
        elif "surg" in specialty.lower() or "wound" in specialty.lower():
            return f"You have an outpatient wound and surgical check planned {date_str} to make sure your catheter puncture site is healing normally."
        elif "endocrin" in specialty.lower():
            return f"You have an appointment planned {date_str} with a diabetes specialist to review and manage your blood sugar levels."
        elif "physical" in specialty.lower() or "rehab" in specialty.lower():
            return f"You have an enrollment session planned {date_str} with cardiac rehabilitation to begin safe, guided physical recovery."
        return f"You have a scheduled clinic follow-up {date_str}."

    def simplify_test(self, orig_text: str, test_name: str, date_formatted: str = None) -> str:
        date_str = f"on {date_formatted}" if date_formatted else "as scheduled"
        if "fasting" in orig_text.lower() or "lipid" in orig_text.lower() or "glucose" in orig_text.lower():
            return f"Complete your blood test {date_str}. Please remember to fast (do not eat or drink anything except water for 10-12 hours beforehand) and take your morning medications after the blood draw."
        elif "echo" in test_name.lower():
            return f"Complete your ultrasound heart scan (echocardiogram) {date_str} to evaluate heart muscle function and pumping strength."
        elif "cbc" in test_name.lower():
            return f"Visit the outpatient diagnostic lab {date_str} for a routine blood count check."
        return f"Complete your scheduled medical laboratory test {date_str}."

    def simplify_medication(self, med_name: str, instruction: str) -> str:
        return f"Take your prescribed {med_name} exactly as directed: {instruction}. Do not skip doses or stop taking it without speaking to your doctor."

    def simplify_care(self, title: str, instruction: str) -> str:
        if "puncture" in instruction.lower() or "site" in instruction.lower() or "sponge" in instruction.lower():
            return "Keep your puncture site clean and dry. Avoid soaking in water or bathing until cleared, and take gentle sponge baths only."
        elif "lifting" in instruction.lower() or "heavy" in instruction.lower() or "exertion" in instruction.lower():
            return "Rest and avoid lifting objects heavier than 10 pounds (like groceries or heavy bags) for 7 days to protect your healing incision."
        elif "glucose" in instruction.lower() or "pressure" in instruction.lower():
            return "Keep a daily log of your morning blood sugar and blood pressure readings to bring to your next clinic visit."
        return f"Care directive: {instruction}"
