"""
Utility script to generate a sample synthetic discharge summary PDF.
"""

import pymupdf
import os
from backend.data.synthetic_data import SYNTHETIC_SCENARIOS

def generate_sample_pdf():
    pdf_path = os.path.join(os.path.dirname(__file__), "sample_discharge_alex_johnson.pdf")
    doc = pymupdf.open()
    
    # Page 1
    page1 = doc.new_page(width=595, height=842) # A4
    text1 = """SYNTHETIC HOSPITAL DISCHARGE SUMMARY - PAGE 1
======================================================
FACILITY: Synthetic General Hospital - Inpatient Acute Care
PATIENT NAME: Alex Johnson
AGE: 52 | GENDER: Male | MRN: SYN-883921
ADMISSION DATE: October 10, 2026
DISCHARGE DATE: October 14, 2026
PRIMARY DIAGNOSIS: Acute uncomplicated coronary syndrome (post-stent placement)

DISCHARGE MEDICATIONS:
1. Atorvastatin 40 mg oral tablet once daily at bedtime for 30 days.
2. Aspirin 81 mg oral tablet once daily with food.
3. Metoprolol Tartrate 25 mg oral tablet twice daily.

CARE & RECOVERY INSTRUCTIONS:
- Keep the right femoral catheter entry site clean and dry.
- Shower permitted after 48 hours; do not submerge in bath or pool for 7 days.
- Weight restriction: Do not lift objects exceeding 10 pounds (4.5 kg) for 10 days.

RED FLAG WARNING SIGNS:
- Sudden onset of crushing chest pain, radiating jaw/arm pain, or persistent shortness of breath.
- Active bleeding or sudden growing swelling at femoral puncture site.
- High fever exceeding 101°F (38.3°C) or severe chills.
"""
    rect1 = pymupdf.Rect(50, 50, 545, 792)
    page1.insert_textbox(rect1, text1, fontsize=11, fontname="helv")

    # Page 2
    page2 = doc.new_page(width=595, height=842)
    text2 = """SYNTHETIC HOSPITAL DISCHARGE SUMMARY - PAGE 2
======================================================
PATIENT NAME: Alex Johnson | MRN: SYN-883921
DISCHARGE DATE: October 14, 2026

SCHEDULED FOLLOW-UP APPOINTMENTS:
- Outpatient Cardiology Follow-up: Dr. Arun Kumar at Synthetic General Hospital Heart Center on October 20, 2026 at 10:30 AM.
- Primary Care Check-in: Within 3 to 4 weeks of discharge (target: November 05, 2026).

REQUIRED MEDICAL TESTS:
- Basic Metabolic Panel (BMP) and Complete Blood Count (CBC) on October 15, 2026.
- Fasting Lipid Panel in 6 weeks (by November 25, 2026).

REFERRALS & COORDINATION:
- Referral placed to Cardiac Rehabilitation Wellness Center (3 sessions/week).

NOTICE:
THIS IS A SYNTHETIC EDUCATIONAL DISCHARGE SUMMARY.
CONTAINS NO PROTECTED HEALTH INFORMATION (PHI).
"""
    rect2 = pymupdf.Rect(50, 50, 545, 792)
    page2.insert_textbox(rect2, text2, fontsize=11, fontname="helv")

    doc.save(pdf_path)
    doc.close()
    print(f"Generated sample synthetic PDF at: {pdf_path}")

if __name__ == "__main__":
    generate_sample_pdf()
