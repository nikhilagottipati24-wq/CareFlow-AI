"""
CareFlow AI - Synthetic Healthcare Scenarios and Provider Directory
STRICT SAFETY BOUNDARIES:
- English ONLY.
- Synthetic demo data only (Alex Johnson, 52 M, Synthetic General Hospital).
- No real PHI / HIPAA data.
"""

SYNTHETIC_PATIENT_DEFAULT = {
    "id": "SYN-PT-80214",
    "name": "Alex Johnson",
    "age": 52,
    "gender": "Male",
    "language": "English",
    "hospital": "Synthetic General Hospital",
    "discharge_date": "October 14, 2026",
    "primary_diagnosis": "Acute Anterior STEMI (Post-PCI Status)",
    "procedure": "Primary Percutaneous Coronary Intervention (PCI) with Drug-Eluting Stent (DES) to proximal LAD",
    "allergies": "No Known Drug Allergies (NKDA)",
    "attending_physician": "Dr. Marcus Vance, MD (Cardiology) [Synthetic]",
    "emergency_contact": "Taylor Johnson (Spouse) - Synthetic Contact"
}

SYNTHETIC_PROVIDERS = [
    {
        "id": "prov-1",
        "name": "Dr. Arun Kumar",
        "specialty": "Cardiology",
        "facility": "Synthetic General Hospital",
        "location": "Chennai",
        "synthetic_flag": True,
        "phone": "+91 44 2800 1001 (Synthetic)",
        "address": "Block B, Cardiology Outpatient Wing, Anna Salai, Chennai",
        "disclaimer": "Provider matches are based on synthetic data and do not guarantee availability, suitability, or clinical appropriateness."
    },
    {
        "id": "prov-2",
        "name": "Dr. Sarah Mitchell",
        "specialty": "Cardiology",
        "facility": "Metro Heart & Vascular Institute",
        "location": "Central District",
        "synthetic_flag": True,
        "phone": "+91 44 2800 1002 (Synthetic)",
        "address": "Suite 400, Heart Center Plaza, Central District",
        "disclaimer": "Provider matches are based on synthetic data and do not guarantee availability, suitability, or clinical appropriateness."
    },
    {
        "id": "prov-3",
        "name": "Dr. Priya Raman",
        "specialty": "Endocrinology",
        "facility": "Synthetic Metropolitan Diabetes & Endocrine Center",
        "location": "Chennai",
        "synthetic_flag": True,
        "phone": "+91 44 2800 1003 (Synthetic)",
        "address": "Floor 2, Endocrine Diagnostic Tower, Chennai",
        "disclaimer": "Provider matches are based on synthetic data and do not guarantee availability, suitability, or clinical appropriateness."
    },
    {
        "id": "prov-4",
        "name": "Dr. David Chen",
        "specialty": "Nephrology",
        "facility": "Synthetic Kidney Health Institute",
        "location": "Metro Central",
        "synthetic_flag": True,
        "phone": "+91 44 2800 1004 (Synthetic)",
        "address": "Building 5, Nephrology Research Park, Metro Central",
        "disclaimer": "Provider matches are based on synthetic data and do not guarantee availability, suitability, or clinical appropriateness."
    },
    {
        "id": "prov-5",
        "name": "Apex Diagnostic Labs",
        "specialty": "Diagnostic Pathology & Blood Testing",
        "facility": "Apex Medical Diagnostics",
        "location": "Chennai",
        "synthetic_flag": True,
        "phone": "+91 44 2800 2001 (Synthetic)",
        "address": "12 Mount Road, Diagnostic Hub, Chennai",
        "disclaimer": "Provider matches are based on synthetic data and do not guarantee availability, suitability, or clinical appropriateness."
    },
    {
        "id": "prov-6",
        "name": "City Health Diagnostic Services",
        "specialty": "Diagnostic Pathology & Blood Testing",
        "facility": "City Health Laboratories",
        "location": "Central District",
        "synthetic_flag": True,
        "phone": "+91 44 2800 2002 (Synthetic)",
        "address": "45 Greenway Avenue, Central District",
        "disclaimer": "Provider matches are based on synthetic data and do not guarantee availability, suitability, or clinical appropriateness."
    },
    {
        "id": "prov-7",
        "name": "Elite Physical & Cardiac Rehab Center",
        "specialty": "Physical Therapy & Cardiac Rehabilitation",
        "facility": "Metropolitan Rehabilitation Center",
        "location": "Chennai",
        "synthetic_flag": True,
        "phone": "+91 44 2800 3001 (Synthetic)",
        "address": "88 Beach Promenade, South Chennai",
        "disclaimer": "Provider matches are based on synthetic data and do not guarantee availability, suitability, or clinical appropriateness."
    }
]

# 5 Synthetic Scenarios matching requirements
SCENARIOS = {
    "scenario_1": {
        "id": "scenario_1",
        "title": "Scenario 1 – Normal Discharge Plan",
        "subtitle": "Complete instructions with clear dates, medication, lab tests, and care rules",
        "file_name": "Discharge_Summary_Scenario1_Normal.txt",
        "expected_items_count": 8,
        "raw_text": """SYNTHETIC HOSPITAL DISCHARGE SUMMARY - DEMO DATA ONLY
Patient Name: Alex Johnson
Patient ID: SYN-PT-80214
Age: 52 | Gender: Male | Language: English
Hospital: Synthetic General Hospital
Admission Date: October 11, 2026
Discharge Date: October 14, 2026
Attending Physician: Dr. Marcus Vance, MD (Cardiology)

PRIMARY DIAGNOSIS:
Acute Anterior ST-Elevation Myocardial Infarction (STEMI).
Successful Primary Percutaneous Coronary Intervention (PCI) with Drug-Eluting Stent (DES) to proximal Left Anterior Descending (LAD) coronary artery.

DISCHARGE MEDICATIONS:
1. Atorvastatin 40 mg oral tablet, take 1 tablet once daily in the evening with dinner. Duration: 90 days.
2. Aspirin 81 mg oral tablet, take 1 tablet once daily in the morning with food. Duration: 12 months.
3. Clopidogrel 75 mg oral tablet, take 1 tablet once daily with water. Duration: 12 months (dual antiplatelet therapy).
4. Metoprolol Tartrate 25 mg oral tablet, take 1 tablet twice daily with meals. Duration: 30 days.

SCHEDULED APPOINTMENTS:
- Cardiology Follow-up Clinic: Scheduled with Dr. Arun Kumar at Synthetic General Hospital Outpatient Cardiology Suite on October 20, 2026 at 10:30 AM.
- Surgical Wound Review: Scheduled at Outpatient Surgical Clinic on October 25, 2026 at 2:00 PM.

REQUIRED MEDICAL TESTS:
- Fasting Blood Test: Complete comprehensive metabolic panel, serum creatinine, and fasting lipid panel on October 15, 2026 prior to morning medication. Fasting required for 10 hours.

CARE AND WOUND INSTRUCTIONS:
- Puncture Site Care: Keep the right femoral catheter puncture site clean, dry, and covered for 48 hours. Sponge bathe only until October 17, 2026.
- Activity Restrictions: Strictly avoid lifting any heavy objects weighing greater than 10 pounds (4.5 kg) for 7 days. Avoid strenuous exertion or driving until cleared by cardiologist.

WARNING SIGNS AND EMERGENCY PROTOCOL:
- If you experience severe chest pain, pressure, radiating arm or jaw discomfort, shortness of breath, cold sweat, or sudden dizziness: CALL EMERGENCY MEDICAL SERVICES (911) IMMEDIATELY OR PROCEED TO THE NEAREST EMERGENCY DEPARTMENT.
"""
    },

    "scenario_2": {
        "id": "scenario_2",
        "title": "Scenario 2 – Multiple Follow-ups & Referrals",
        "subtitle": "Complex post-discharge plan with multiple specialists, tests, and rehabilitation",
        "file_name": "Discharge_Summary_Scenario2_MultipleFollowUps.txt",
        "expected_items_count": 9,
        "raw_text": """SYNTHETIC HOSPITAL DISCHARGE SUMMARY - DEMO DATA ONLY
Patient Name: Alex Johnson
Patient ID: SYN-PT-80214
Age: 52 | Gender: Male | Language: English
Hospital: Synthetic General Hospital
Discharge Date: October 14, 2026

PRIMARY DIAGNOSIS:
Post-Myocardial Infarction status with newly diagnosed Type 2 Diabetes Mellitus and mild Left Ventricular dysfunction.

DISCHARGE MEDICATIONS:
1. Metformin 500 mg oral tablet, take 1 tablet twice daily with breakfast and dinner. Duration: 60 days.
2. Lisinopril 10 mg oral tablet, take 1 tablet once daily every morning. Duration: 30 days.
3. Atorvastatin 40 mg oral tablet, take 1 tablet daily at bedtime. Duration: 90 days.

SCHEDULED APPOINTMENTS & REFERRALS:
- Cardiology Post-Discharge Follow-up: Clinic appointment scheduled with Dr. Arun Kumar on October 20, 2026 at 10:30 AM.
- Endocrinology Specialist Referral: Referral generated for Dr. Priya Raman for glycemic control assessment on November 2, 2026 at 11:00 AM.
- Physical Therapy & Cardiac Rehabilitation Referral: Mandatory cardiac rehab enrollment scheduled with Elite Physical & Cardiac Rehab Center on November 5, 2026 at 9:00 AM.

SCHEDULED MEDICAL TESTS:
- Fasting Blood Glucose and Renal Function Test: October 16, 2026 at outpatient lab.
- Transthoracic Echocardiogram (Echo Test): Follow-up left ventricular ejection fraction evaluation scheduled for October 28, 2026 at 1:30 PM.

CARE INSTRUCTIONS:
- Monitor daily morning blood glucose and blood pressure log.
- Limit sodium intake to under 2,000 mg daily.

WARNING SIGNS:
- Call emergency medical services if resting chest tightness, sudden breathlessness, or persistent lightheadedness develops.
"""
    },

    "scenario_3": {
        "id": "scenario_3",
        "title": "Scenario 3 – Ambiguous Instructions (Needs Review)",
        "subtitle": "Contains missing appointment dates and unspecified medication durations",
        "file_name": "Discharge_Summary_Scenario3_Ambiguous.txt",
        "expected_items_count": 7,
        "raw_text": """SYNTHETIC HOSPITAL DISCHARGE SUMMARY - DEMO DATA ONLY
Patient Name: Alex Johnson
Patient ID: SYN-PT-80214
Age: 52 | Gender: Male | Language: English
Hospital: Synthetic General Hospital
Discharge Date: October 14, 2026

DIAGNOSIS:
Unstable Angina, stabilized post-medical management.

DISCHARGE MEDICATIONS:
1. Aspirin 81 mg once daily with food. Duration: 6 months.
2. Clopidogrel 75 mg oral tablet, take 1 tablet daily. Note: Continue until further review by outpatient physician (Duration: Not specified).
3. Atorvastatin 20 mg once daily at night. Duration: 30 days.

FOLLOW-UP APPOINTMENTS:
- Cardiology Follow-up: Follow up with cardiology outpatient clinic as needed or when convenient. (Note: Specific appointment date and timeframe not documented).

MEDICAL TESTS:
- Fasting Lipid Panel: Complete outpatient blood test on October 18, 2026.

CARE INSTRUCTIONS:
- Rest at home for 3 days. Resume gentle walking as tolerated.

WARNING SIGNS:
- Seek immediate medical care if chest pain recurs or if shortness of breath worsens.
"""
    },

    "scenario_4": {
        "id": "scenario_4",
        "title": "Scenario 4 – Conflicting Instructions (Needs Review)",
        "subtitle": "Contains contradictory follow-up timing between medical sections",
        "file_name": "Discharge_Summary_Scenario4_Conflicting.txt",
        "expected_items_count": 7,
        "raw_text": """SYNTHETIC HOSPITAL DISCHARGE SUMMARY - DEMO DATA ONLY
Patient Name: Alex Johnson
Patient ID: SYN-PT-80214
Age: 52 | Gender: Male | Language: English
Hospital: Synthetic General Hospital
Discharge Date: October 14, 2026

DIAGNOSIS:
Post-PCI femoral arteriotomy repair with mild local hematoma.

SECTION 1 - NURSING DISCHARGE NOTE:
"Patient instructed to return to outpatient clinic in exactly 1 week on October 21, 2026 for groin hematoma inspection and suture removal."

SECTION 2 - MEDICATIONS:
1. Cephalexin 500 mg oral capsule, take 1 capsule three times daily for 7 days.
2. Acetaminophen 500 mg as needed for groin discomfort.

SECTION 3 - LABORATORY:
- Complete Blood Count (CBC) test scheduled for October 17, 2026.

SECTION 4 - ATTENDING PHYSICIAN DISCHARGE ORDER:
"Follow up in 2 weeks on October 28, 2026 for surgical follow-up and catheter site re-evaluation."

CARE INSTRUCTIONS:
- Ice groin area intermittently for 24 hours. Keep incision dry.

WARNING SIGNS:
- Expanding hematoma, active bleeding, or leg numbness requires immediate emergency room evaluation.
"""
    },

    "scenario_5": {
        "id": "scenario_5",
        "title": "Scenario 5 – Clinically Sensitive Inquiry (Safety Escalation)",
        "subtitle": "Includes patient question on stopping medication / symptoms requiring immediate clinical review",
        "file_name": "Discharge_Summary_Scenario5_ClinicallySensitive.txt",
        "expected_items_count": 8,
        "raw_text": """SYNTHETIC HOSPITAL DISCHARGE SUMMARY - DEMO DATA ONLY
Patient Name: Alex Johnson
Patient ID: SYN-PT-80214
Age: 52 | Gender: Male | Language: English
Hospital: Synthetic General Hospital
Discharge Date: October 14, 2026

DIAGNOSIS:
Acute Coronary Syndrome, post-stent placement.

DISCHARGE MEDICATIONS:
1. Clopidogrel 75 mg oral tablet daily. Duration: 12 months.
2. Aspirin 81 mg oral tablet daily. Duration: 12 months.
3. Atorvastatin 40 mg daily at bedtime. Duration: 90 days.

SCHEDULED APPOINTMENTS:
- Cardiology Follow-up with Dr. Arun Kumar on October 20, 2026.

LABORATORY ORDERS:
- Fasting Blood Test on October 15, 2026.

PATIENT REPORTED CONCERN & CLINICAL INQUIRY:
Patient Discharge Note:
"Patient reported mild gum bleeding when brushing and asks: 'My gums are bleeding slightly and my stomach feels uncomfortable. Can I stop taking the blood thinner Clopidogrel, or can I reduce the dosage to half a pill every other day?'"

CARE INSTRUCTIONS:
- Maintain soft toothbrush. Take medications with meals.

WARNING SIGNS:
- Any persistent bleeding, black stools, or severe chest pain requires immediate emergency evaluation.
"""
    }
}
