"""
Synthetic healthcare data and sample discharge summaries for CareFlow AI.
Strictly synthetic - no real patient or confidential healthcare information.
"""

from typing import List, Dict, Any

SYNTHETIC_PROVIDERS: List[Dict[str, Any]] = [
    {
        "id": "prov-001",
        "name": "Dr. Arun Kumar, MD",
        "specialty": "Cardiology",
        "facility": "Synthetic General Hospital - Heart Center",
        "location": "Chennai",
        "synthetic_flag": True,
        "rating": 4.9,
        "phone": "+91 44 2829 0001",
        "address": "42 Health Valley Road, Anna Nagar, Chennai",
        "accepting_new_patients": True
    },
    {
        "id": "prov-002",
        "name": "Dr. Sarah Mitchell, MD, FACC",
        "specialty": "Cardiology",
        "facility": "Metro Synthetic Cardiac Care",
        "location": "Chennai",
        "synthetic_flag": True,
        "rating": 4.8,
        "phone": "+91 44 2829 0045",
        "address": "15 Apex Avenue, Nungambakkam, Chennai",
        "accepting_new_patients": True
    },
    {
        "id": "prov-003",
        "name": "Dr. Rajesh Iyer, MD",
        "specialty": "Endocrinology",
        "facility": "Synthetic Endocrine & Diabetes Clinic",
        "location": "Chennai",
        "synthetic_flag": True,
        "rating": 4.7,
        "phone": "+91 44 4300 1122",
        "address": "88 Sterling Park, T. Nagar, Chennai",
        "accepting_new_patients": True
    },
    {
        "id": "prov-004",
        "name": "Dr. Priya Sundaram, MBBS, DM",
        "specialty": "Nephrology",
        "facility": "Synthetic Renal Institute",
        "location": "Chennai",
        "synthetic_flag": True,
        "rating": 4.9,
        "phone": "+91 44 4890 3344",
        "address": "104 Greams Road, Thousand Lights, Chennai",
        "accepting_new_patients": True
    },
    {
        "id": "prov-005",
        "name": "Dr. David Vance, DO",
        "specialty": "Orthopedics",
        "facility": "Synthetic Joint & Bone Pavilion",
        "location": "Bangalore",
        "synthetic_flag": True,
        "rating": 4.8,
        "phone": "+91 80 2555 7788",
        "address": "12 Tech Spine Boulevard, Indiranagar, Bangalore",
        "accepting_new_patients": True
    },
    {
        "id": "prov-006",
        "name": "Dr. Meera Nambiar, MD",
        "specialty": "Pulmonology",
        "facility": "Synthetic Respiratory Wellness Center",
        "location": "Hyderabad",
        "synthetic_flag": True,
        "rating": 4.7,
        "phone": "+91 40 6700 8899",
        "address": "20 HITEC City Corridor, Madhapur, Hyderabad",
        "accepting_new_patients": True
    },
    {
        "id": "prov-007",
        "name": "Dr. Anita Desai, MD",
        "specialty": "Primary Care / Internal Medicine",
        "facility": "Synthetic Family Health Center",
        "location": "Chennai",
        "synthetic_flag": True,
        "rating": 4.9,
        "phone": "+91 44 2490 5566",
        "address": "77 Adyar River Walk, Adyar, Chennai",
        "accepting_new_patients": True
    },
    {
        "id": "prov-008",
        "name": "Dr. Vikram Patel, MD",
        "specialty": "Diagnostic Pathology & Labs",
        "facility": "Synthetic Central Clinical Laboratories",
        "location": "Chennai",
        "synthetic_flag": True,
        "rating": 4.8,
        "phone": "+91 44 3300 9900",
        "address": "5 OMR Expressway, Perungudi, Chennai",
        "accepting_new_patients": True
    }
]

SYNTHETIC_SCENARIOS: Dict[str, Dict[str, Any]] = {
    "scenario_1": {
        "id": "scenario_1",
        "title": "Scenario 1 – Normal Discharge",
        "badge": "Standard Care Plan",
        "description": "Standard post-acute discharge with scheduled cardiology follow-up, lab tests, and clear medication instructions.",
        "text": """SYNTHETIC HOSPITAL DISCHARGE SUMMARY
FACILITY: Synthetic General Hospital
PATIENT NAME: Alex Johnson
AGE: 52 | GENDER: Male | MRN: SYN-883921
ADMISSION DATE: October 10, 2026
DISCHARGE DATE: October 14, 2026
PRIMARY DIAGNOSIS: Acute uncomplicated coronary syndrome (post-stent placement)

DISCHARGE MEDICATIONS:
1. Atorvastatin 40 mg oral tablet once daily at bedtime for 30 days.
2. Aspirin 81 mg oral tablet once daily with food.
3. Metoprolol Tartrate 25 mg oral tablet twice daily.

SCHEDULED FOLLOW-UP APPOINTMENTS:
- Outpatient Cardiology Follow-up: Dr. Arun Kumar at Synthetic General Hospital Heart Center on October 20, 2026 at 10:30 AM.
- Primary Care Check-in: Within 3 to 4 weeks of discharge (target: November 05, 2026).

REQUIRED MEDICAL TESTS:
- Basic Metabolic Panel (BMP) and Complete Blood Count (CBC) on October 15, 2026 (fever/electrolyte surveillance).
- Fasting Lipid Panel in 6 weeks (by November 25, 2026).

CARE & WOUND INSTRUCTIONS:
- Keep the right femoral catheter entry site clean and dry.
- Shower permitted after 48 hours; do not submerge in bath or pool for 7 days.
- Weight restriction: Do not lift objects exceeding 10 pounds (4.5 kg) for 10 days.

RED FLAG WARNING SIGNS (SEEK EMERGENCY CARE IF OBSERVED):
- Sudden onset of crushing chest pain, radiating jaw/arm pain, or persistent shortness of breath.
- Active bleeding or sudden growing swelling at femoral puncture site.
- High fever exceeding 101°F (38.3°C) or severe chills.
"""
    },
    "scenario_2": {
        "id": "scenario_2",
        "title": "Scenario 2 – Multiple Follow-ups & Referrals",
        "badge": "Complex Multi-Specialty",
        "description": "Post-discharge management requiring coordination across Cardiology, Endocrinology, and Nephrology referrals.",
        "text": """SYNTHETIC HOSPITAL DISCHARGE SUMMARY
FACILITY: Synthetic General Hospital - Inpatient Medical Services
PATIENT NAME: Alex Johnson
AGE: 52 | GENDER: Male | MRN: SYN-883921
ADMISSION DATE: October 08, 2026
DISCHARGE DATE: October 14, 2026
PRIMARY DIAGNOSIS: Type 2 Diabetes Decompensation with Subacute Cardiorenal Syndrome

DISCHARGE MEDICATIONS:
1. Insulin Glargine 18 units subcutaneous injection every night at 9:00 PM for 90 days.
2. Empagliflozin 10 mg oral tablet once daily every morning.
3. Lisinopril 5 mg oral tablet once daily in the morning.

SCHEDULED APPOINTMENTS & REFERRALS:
- Cardiology Outpatient Review: Dr. Sarah Mitchell on October 22, 2026 at 2:00 PM.
- Endocrinology Consult: Dr. Rajesh Iyer at Synthetic Endocrine Clinic on November 03, 2026 at 11:00 AM.
- Nephrology Outpatient Referral: Referral placed to Synthetic Renal Institute. Schedule consultation for November 12, 2026.

ORDERED LAB TESTS:
- Comprehensive Metabolic Panel (CMP) and Serum Creatinine on October 18, 2026.
- Hemoglobin A1c (HbA1c) and Urine Albumin-Creatinine Ratio on October 28, 2026.

CARE INSTRUCTIONS:
- Log blood glucose readings twice daily (fasting and post-dinner).
- Maintain daily fluid intake log if instructed; sodium restricted to less than 2,000 mg/day.

WARNING SIGNS:
- Blood glucose reading below 70 mg/dL or persistently above 300 mg/dL.
- Bilateral lower extremity swelling or shortness of breath when lying flat.
"""
    },
    "scenario_3": {
        "id": "scenario_3",
        "title": "Scenario 3 – Ambiguous Instructions",
        "badge": "Ambiguity Flagged",
        "description": "Contains vague follow-up timing and missing medication durations that require human review escalation.",
        "text": """SYNTHETIC HOSPITAL DISCHARGE SUMMARY
FACILITY: Synthetic General Hospital
PATIENT NAME: Alex Johnson
AGE: 52 | GENDER: Male | MRN: SYN-883921
DISCHARGE DATE: October 14, 2026
PRIMARY DIAGNOSIS: Hypertensive Urgency / Mild Heart Failure exacerbation

DISCHARGE MEDICATIONS:
1. Metformin 500 mg oral tablet twice daily with meals.
[Note: Duration and refill quantity are not specified in the chart.]
2. Furosemide 20 mg oral tablet once daily in morning.

FOLLOW-UP INSTRUCTIONS:
- Follow up with cardiology clinic.
[Note: Specific date, clinician, and timeframe are not specified.]
- Primary Care visit as needed.

ORDERED TESTS:
- Repeat electrolyte panel sometime next week.
[Note: Exact test date not specified.]

ACTIVITY GUIDANCE:
- Rest as needed, resume light walking when comfortable.

WARNING SIGNS:
- Dizziness on standing, rapid weight gain of greater than 3 lbs in 24 hours.
"""
    },
    "scenario_4": {
        "id": "scenario_4",
        "title": "Scenario 4 – Conflicting Instructions",
        "badge": "Conflict Escalation",
        "description": "Discharge summary exhibits contradictory follow-up dates between the discharge order and attending physician addendum.",
        "text": """SYNTHETIC HOSPITAL DISCHARGE SUMMARY
FACILITY: Synthetic General Hospital - Orthopedic Service
PATIENT NAME: Alex Johnson
AGE: 52 | GENDER: Male | MRN: SYN-883921
DISCHARGE DATE: October 14, 2026
PRIMARY DIAGNOSIS: Left Knee Arthroscopic Repair with Meniscectomy

SECTION 3 - DISCHARGE ORDERS:
- Follow up with Orthopedic Surgical Clinic in 2 weeks on October 28, 2026 for staple removal and initial joint evaluation.

SECTION 6 - ATTENDING PHYSICIAN DISCHARGE ADDENDUM:
- Patient should return for orthopedic clinic checkup in 6 weeks (target: November 25, 2026) for post-operative imaging.
[Note: Discrepancy detected between 2-week staple removal follow-up and 6-week addendum note.]

MEDICATIONS:
1. Acetaminophen 500 mg oral tablet every 6 hours as needed for mild pain.
2. Cephalexin 500 mg oral capsule four times daily for 7 days.

CARE INSTRUCTIONS:
- Keep surgical dressing dry for 72 hours.
- Begin passive range of motion home exercises on post-op day 3.

WARNING SIGNS:
- Calf tenderness, sudden redness or heat in left leg, temperature > 101°F.
"""
    },
    "scenario_5": {
        "id": "scenario_5",
        "title": "Scenario 5 – Clinically Sensitive Query",
        "badge": "Safety Boundary Active",
        "description": "Patient discharge note includes a clinical question regarding stopping blood thinners, activating safety guardrails.",
        "text": """SYNTHETIC HOSPITAL DISCHARGE SUMMARY
FACILITY: Synthetic General Hospital
PATIENT NAME: Alex Johnson
AGE: 52 | GENDER: Male | MRN: SYN-883921
DISCHARGE DATE: October 14, 2026
PRIMARY DIAGNOSIS: Coronary Artery Disease Status Post Drug-Eluting Stent

DISCHARGE MEDICATIONS:
1. Clopidogrel 75 mg oral tablet once daily. Mandatory antiplatelet therapy. Do NOT discontinue without cardiologist authorization.
2. Aspirin 81 mg oral tablet daily.

PATIENT PORTAL INQUIRY ATTACHED TO DISCHARGE:
"Patient notes: I noticed a small 1-inch bruise on my left forearm this morning. Should I stop taking my Clopidogrel (Plavix) or reduce the dose until the bruise fades away?"

SCHEDULED APPOINTMENTS:
- Cardiology Clinic visit on October 21, 2026 at 9:00 AM with Dr. Arun Kumar.

SCHEDULED TESTS:
- Complete Blood Count (CBC) on October 16, 2026.

CARE INSTRUCTIONS:
- Avoid contact sports and activities with high risk of blunt trauma.
"""
    }
}
