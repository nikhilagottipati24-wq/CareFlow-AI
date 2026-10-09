import os
import json
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

class DataStore:
    def __init__(self):
        self.current_scenario_id = "scenario-1"
        self.patient: Dict[str, Any] = {}
        self.tasks: List[Dict[str, Any]] = []
        self.task_status_history: List[Dict[str, Any]] = []
        self.reviews: List[Dict[str, Any]] = []
        self.providers: List[Dict[str, Any]] = []
        self.ai_activity_logs: List[Dict[str, Any]] = []
        self.discharge_documents: List[Dict[str, Any]] = []
        self.load_providers()
        self.load_scenario("scenario-1")

    def load_providers(self):
        self.providers = [
            {
                "id": "prov-1",
                "name": "Dr. Sarah Lin, MD",
                "specialty": "Cardiology",
                "facility": "Synthetic Heart & Vascular Institute",
                "location": "North Medical Pavilion, Suite 400",
                "phone": "(555) 234-8901",
                "email": "sarah.lin@syntheticgenhealth.org",
                "is_synthetic": True
            },
            {
                "id": "prov-2",
                "name": "Dr. Marcus Vance, DO",
                "specialty": "Pulmonology",
                "facility": "Synthetic General Hospital - Pulmonary Clinic",
                "location": "East Wing, 3rd Floor",
                "phone": "(555) 234-8902",
                "email": "marcus.vance@syntheticgenhealth.org",
                "is_synthetic": True
            },
            {
                "id": "prov-3",
                "name": "Dr. Elena Rostova, MD",
                "specialty": "Internal Medicine",
                "facility": "Metro Health Primary Care",
                "location": "Downtown Health Center, Suite 102",
                "phone": "(555) 234-8903",
                "email": "elena.rostova@syntheticgenhealth.org",
                "is_synthetic": True
            },
            {
                "id": "prov-4",
                "name": "Dr. James Thornton, MD",
                "specialty": "Orthopedics & Sports Medicine",
                "facility": "Synthetic Specialty Surgery Center",
                "location": "West Pavilion, Suite 210",
                "phone": "(555) 234-8904",
                "email": "james.thornton@syntheticgenhealth.org",
                "is_synthetic": True
            },
            {
                "id": "prov-5",
                "name": "Apex Diagnostic Labs",
                "specialty": "Pathology & Clinical Laboratory",
                "facility": "Apex Imaging & Diagnostics Center",
                "location": "700 Medical Boulevard, Ground Floor",
                "phone": "(555) 234-8905",
                "email": "labservices@syntheticgenhealth.org",
                "is_synthetic": True
            },
            {
                "id": "prov-6",
                "name": "Dr. Anita Patel, PharmD",
                "specialty": "Pharmacotherapy & Transition Care",
                "facility": "CareFlow Clinical Pharmacy Services",
                "location": "Ambulatory Care Wing, Suite 105",
                "phone": "(555) 234-8906",
                "email": "anita.patel@syntheticgenhealth.org",
                "is_synthetic": True
            }
        ]

    def load_scenario(self, scenario_id: str):
        self.current_scenario_id = scenario_id
        now = datetime.now()
        today_str = now.strftime("%Y-%m-%d")
        
        # Consistent dates around today (Oct 9, 2026)
        discharge_date = (now - timedelta(days=2)).strftime("%Y-%m-%d")
        comp_day_1 = (now - timedelta(days=2)).strftime("%Y-%m-%d")
        comp_day_2 = (now - timedelta(days=1)).strftime("%Y-%m-%d")
        due_day_1 = (now + timedelta(days=1)).strftime("%Y-%m-%d")
        due_day_2 = (now + timedelta(days=3)).strftime("%Y-%m-%d")
        due_day_3 = (now + timedelta(days=5)).strftime("%Y-%m-%d")
        due_day_4 = (now + timedelta(days=7)).strftime("%Y-%m-%d")
        due_day_5 = (now + timedelta(days=10)).strftime("%Y-%m-%d")

        if scenario_id == "scenario-1":
            # Scenario 1: Normal discharge.
            # EXACTLY 8 tasks: 5 Pending, 2 Completed, 1 Needs Review
            self.patient = {
                "id": "demo-patient-001",
                "name": "Alex Johnson",
                "age": 52,
                "hospital": "Synthetic General Hospital",
                "discharge_date": "October 14, 2026",
                "attending_physician": "Dr. Robert Sterling, MD",
                "diagnosis_summary": "Acute uncomplicated congestive heart failure flare, stabilized on oral diuretic therapy and ACE inhibitor titration."
            }

            self.tasks = [
                {
                    "id": "task-101",
                    "patient_id": "demo-patient-001",
                    "task_type": "Medication",
                    "title": "Pick up Lisinopril 10mg from Pharmacy",
                    "description": "Obtain 30-day supply from designated outpatient pharmacy. Take once daily each morning with water.",
                    "due_date": comp_day_1,
                    "priority": "High",
                    "status": "Completed",
                    "category": "Medication",
                    "source_reference": "Section 4: Discharge Medications - Item 1",
                    "created_at": f"{comp_day_1}T09:00:00Z",
                    "updated_at": f"{comp_day_1}T14:30:00Z",
                    "completed_at": f"{comp_day_1}T14:30:00Z"
                },
                {
                    "id": "task-102",
                    "patient_id": "demo-patient-001",
                    "task_type": "Care",
                    "title": "Log Daily Morning Weight & Blood Pressure",
                    "description": "Weigh each morning after voiding and before breakfast. Alert care coordinator if weight increases >3 lbs in 24 hours.",
                    "due_date": comp_day_2,
                    "priority": "High",
                    "status": "Completed",
                    "category": "Care",
                    "source_reference": "Section 5: Daily Self-Monitoring Instructions",
                    "created_at": f"{comp_day_2}T08:00:00Z",
                    "updated_at": f"{comp_day_2}T10:15:00Z",
                    "completed_at": f"{comp_day_2}T10:15:00Z"
                },
                {
                    "id": "task-103",
                    "patient_id": "demo-patient-001",
                    "task_type": "Appointment",
                    "title": "Cardiology Post-Discharge Follow-up",
                    "description": "Clinic visit with Dr. Sarah Lin to evaluate therapy tolerance and review echocardiogram findings.",
                    "due_date": due_day_1,
                    "priority": "High",
                    "status": "Pending",
                    "category": "Appointment",
                    "source_reference": "Section 3: Follow-up Appointments - Cardiology",
                    "created_at": f"{discharge_date}T10:00:00Z",
                    "updated_at": f"{discharge_date}T10:00:00Z",
                    "completed_at": None
                },
                {
                    "id": "task-104",
                    "patient_id": "demo-patient-001",
                    "task_type": "Test",
                    "title": "Serum Electrolytes & Renal Function Panel",
                    "description": "Fasting blood draw for Basic Metabolic Panel (BUN, Creatinine, K+) 7 days post diuretic adjustment.",
                    "due_date": due_day_2,
                    "priority": "High",
                    "status": "Pending",
                    "category": "Test",
                    "source_reference": "Section 6: Required Diagnostic Tests - Lab Work",
                    "created_at": f"{discharge_date}T10:00:00Z",
                    "updated_at": f"{discharge_date}T10:00:00Z",
                    "completed_at": None
                },
                {
                    "id": "task-105",
                    "patient_id": "demo-patient-001",
                    "task_type": "Care",
                    "title": "Maintain 2,000 mg Low Sodium Diet Plan",
                    "description": "Adhere strictly to daily dietary sodium limit under 2 grams. Avoid processed meats and canned soups.",
                    "due_date": due_day_3,
                    "priority": "Medium",
                    "status": "Pending",
                    "category": "Care",
                    "source_reference": "Section 5: Dietary Guidance",
                    "created_at": f"{discharge_date}T10:00:00Z",
                    "updated_at": f"{discharge_date}T10:00:00Z",
                    "completed_at": None
                },
                {
                    "id": "task-106",
                    "patient_id": "demo-patient-001",
                    "task_type": "Follow-up",
                    "title": "Care Coordinator Phone Check-in",
                    "description": "Virtual 15-minute phone wellness assessment to confirm symptom stability and address questions.",
                    "due_date": due_day_4,
                    "priority": "Medium",
                    "status": "Pending",
                    "category": "Follow-up",
                    "source_reference": "Section 3: Care Team Check-ins",
                    "created_at": f"{discharge_date}T10:00:00Z",
                    "updated_at": f"{discharge_date}T10:00:00Z",
                    "completed_at": None
                },
                {
                    "id": "task-107",
                    "patient_id": "demo-patient-001",
                    "task_type": "Referral",
                    "title": "Cardiac Rehabilitation Intake Consultation",
                    "description": "Initial intake appointment for supervised Phase II outpatient cardiovascular exercise therapy.",
                    "due_date": due_day_5,
                    "priority": "Low",
                    "status": "Pending",
                    "category": "Referral",
                    "source_reference": "Section 7: Outpatient Referrals",
                    "created_at": f"{discharge_date}T10:00:00Z",
                    "updated_at": f"{discharge_date}T10:00:00Z",
                    "completed_at": None
                },
                {
                    "id": "task-108",
                    "patient_id": "demo-patient-001",
                    "task_type": "Medication",
                    "title": "Titration of Furosemide Dosage Duration",
                    "description": "Discharge summary states 'Continue Furosemide 40mg daily until edema resolves', which lacks an explicit review cutoff date.",
                    "due_date": None,  # Unscheduled task example
                    "priority": "High",
                    "status": "Needs Review",
                    "category": "Medication",
                    "source_reference": "Section 4: Discharge Medications - Furosemide Note",
                    "created_at": f"{discharge_date}T10:00:00Z",
                    "updated_at": f"{discharge_date}T10:00:00Z",
                    "completed_at": None
                }
            ]

            # Recorded task completion history
            self.task_status_history = [
                {
                    "id": "hist-1",
                    "task_id": "task-101",
                    "previous_status": "Pending",
                    "new_status": "Completed",
                    "changed_at": f"{comp_day_1}T14:30:00Z"
                },
                {
                    "id": "hist-2",
                    "task_id": "task-102",
                    "previous_status": "Pending",
                    "new_status": "Completed",
                    "changed_at": f"{comp_day_2}T10:15:00Z"
                }
            ]

            # 1 Review item for Needs Review count consistency
            self.reviews = [
                {
                    "id": "rev-101",
                    "patient_id": "demo-patient-001",
                    "issue": "Unclear medication duration for loop diuretic",
                    "issue_type": "Unclear medication instruction",
                    "priority": "High",
                    "reason": "Duration noted as 'until swelling subsides' without standard 14-day clinical reassessment parameter.",
                    "status": "Open",
                    "original_instruction": "Furosemide 40mg PO once daily in morning until edema fully resolves.",
                    "ai_interpretation": "Requires clinical pharmacist confirmation for a definitive 10 or 14 day check date.",
                    "source_reference": "Discharge Summary pg. 2, paragraph 4",
                    "created_at": f"{discharge_date}T10:00:00Z",
                    "resolved_at": None,
                    "resolution_notes": None
                }
            ]

            self.ai_activity_logs = [
                {
                    "id": "log-1",
                    "event_type": "Document uploaded",
                    "description": "Synthetic discharge summary (PDF, 4 pages) ingested successfully.",
                    "reference": "DOC-DISCH-2026-001",
                    "agent": "Document Extraction Agent",
                    "timestamp": f"{discharge_date}T09:58:12Z"
                },
                {
                    "id": "log-2",
                    "event_type": "Document processed",
                    "description": "PyMuPDF text extraction complete; OCR token stream parsed.",
                    "reference": "DOC-DISCH-2026-001",
                    "agent": "Document Extraction Agent",
                    "timestamp": f"{discharge_date}T09:58:30Z"
                },
                {
                    "id": "log-3",
                    "event_type": "Instructions extracted",
                    "description": "Extracted 12 clinical instructions across medications, appointments, diet, and lab work.",
                    "reference": "DOC-DISCH-2026-001",
                    "agent": "Document Extraction Agent",
                    "timestamp": f"{discharge_date}T09:59:05Z"
                },
                {
                    "id": "log-4",
                    "event_type": "Validation completed",
                    "description": "Identified 1 ambiguous instruction regarding diuretic duration; 11 validated instructions.",
                    "reference": "VAL-RUN-8841",
                    "agent": "Validation Agent",
                    "timestamp": f"{discharge_date}T09:59:22Z"
                },
                {
                    "id": "log-5",
                    "event_type": "Tasks generated",
                    "description": "Generated 8 actionable patient care tasks categorized by specialty and urgency.",
                    "reference": "TSK-SET-001",
                    "agent": "Task Generation Agent",
                    "timestamp": f"{discharge_date}T10:00:00Z"
                },
                {
                    "id": "log-6",
                    "event_type": "Item flagged for human review",
                    "description": "Flagged diuretic instruction for clinical review prior to auto-scheduling.",
                    "reference": "REV-101",
                    "agent": "Safety and Escalation Agent",
                    "timestamp": f"{discharge_date}T10:00:15Z"
                }
            ]

        elif scenario_id == "scenario-2":
            # Scenario 2: Multiple follow-ups
            self.patient = {
                "id": "demo-patient-002",
                "name": "Alex Johnson (Multi-Specialty Care)",
                "age": 52,
                "hospital": "Synthetic General Hospital",
                "discharge_date": "October 14, 2026",
                "attending_physician": "Dr. Marcus Vance, DO",
                "diagnosis_summary": "Post-operative bilateral knee arthroplasty with secondary mild COPD exacerbation."
            }
            self.tasks = [
                {
                    "id": "task-201",
                    "patient_id": "demo-patient-002",
                    "task_type": "Medication",
                    "title": "Fill Rivaroxaban Anticoagulant Therapy",
                    "description": "Dispense 10mg daily for DVT thromboprophylaxis following orthopedic discharge.",
                    "due_date": comp_day_1,
                    "priority": "High",
                    "status": "Completed",
                    "category": "Medication",
                    "source_reference": "Section 4: Anticoagulation Protocol",
                    "created_at": f"{comp_day_1}T08:00:00Z",
                    "updated_at": f"{comp_day_1}T11:00:00Z",
                    "completed_at": f"{comp_day_1}T11:00:00Z"
                },
                {
                    "id": "task-202",
                    "patient_id": "demo-patient-002",
                    "task_type": "Appointment",
                    "title": "Orthopedic Post-Op Wound Inspection",
                    "description": "In-clinic staple removal and surgical site assessment with Dr. James Thornton.",
                    "due_date": due_day_1,
                    "priority": "High",
                    "status": "Pending",
                    "category": "Appointment",
                    "source_reference": "Section 3: Surgical Follow-up",
                    "created_at": f"{discharge_date}T10:00:00Z",
                    "updated_at": f"{discharge_date}T10:00:00Z",
                    "completed_at": None
                },
                {
                    "id": "task-203",
                    "patient_id": "demo-patient-002",
                    "task_type": "Appointment",
                    "title": "Pulmonology Spirometry Evaluation",
                    "description": "Clinic spirometry and inhaler technique review with Dr. Marcus Vance.",
                    "due_date": due_day_2,
                    "priority": "Medium",
                    "status": "Pending",
                    "category": "Appointment",
                    "source_reference": "Section 3: Pulmonary Follow-up",
                    "created_at": f"{discharge_date}T10:00:00Z",
                    "updated_at": f"{discharge_date}T10:00:00Z",
                    "completed_at": None
                },
                {
                    "id": "task-204",
                    "patient_id": "demo-patient-002",
                    "task_type": "Referral",
                    "title": "Physical Therapy In-Home Session 1",
                    "description": "Home health PT assessment for progressive weight-bearing and mobility safety.",
                    "due_date": due_day_3,
                    "priority": "High",
                    "status": "Pending",
                    "category": "Referral",
                    "source_reference": "Section 7: In-Home Rehabilitation Orders",
                    "created_at": f"{discharge_date}T10:00:00Z",
                    "updated_at": f"{discharge_date}T10:00:00Z",
                    "completed_at": None
                },
                {
                    "id": "task-205",
                    "patient_id": "demo-patient-002",
                    "task_type": "Test",
                    "title": "Complete Blood Count & Inflammatory Markers",
                    "description": "Venipuncture for CBC with differential and CRP to rule out post-surgical infection.",
                    "due_date": due_day_4,
                    "priority": "Medium",
                    "status": "Pending",
                    "category": "Test",
                    "source_reference": "Section 6: Post-op Laboratory Surveillance",
                    "created_at": f"{discharge_date}T10:00:00Z",
                    "updated_at": f"{discharge_date}T10:00:00Z",
                    "completed_at": None
                },
                {
                    "id": "task-206",
                    "patient_id": "demo-patient-002",
                    "task_type": "Care",
                    "title": "Cryotherapy & Elevation Protocol (3x Daily)",
                    "description": "Ice application for 20 minutes with leg elevated above heart level thrice daily.",
                    "due_date": due_day_5,
                    "priority": "Low",
                    "status": "Pending",
                    "category": "Care",
                    "source_reference": "Section 5: Swelling Management",
                    "created_at": f"{discharge_date}T10:00:00Z",
                    "updated_at": f"{discharge_date}T10:00:00Z",
                    "completed_at": None
                }
            ]
            self.task_status_history = [
                {
                    "id": "hist-201",
                    "task_id": "task-201",
                    "previous_status": "Pending",
                    "new_status": "Completed",
                    "changed_at": f"{comp_day_1}T11:00:00Z"
                }
            ]
            self.reviews = []
            self.ai_activity_logs = [
                {
                    "id": "log-201",
                    "event_type": "Document uploaded",
                    "description": "Multi-specialty surgical discharge plan processed.",
                    "reference": "DOC-DISCH-MULTI-02",
                    "agent": "Document Extraction Agent",
                    "timestamp": f"{discharge_date}T11:10:00Z"
                },
                {
                    "id": "log-202",
                    "event_type": "Tasks generated",
                    "description": "Generated 6 multi-department care follow-ups across orthopedics and pulmonary.",
                    "reference": "TSK-SET-002",
                    "agent": "Task Generation Agent",
                    "timestamp": f"{discharge_date}T11:15:00Z"
                }
            ]

        elif scenario_id == "scenario-3":
            # Scenario 3: Ambiguous instructions (missing follow-up date, incomplete medication duration)
            self.patient = {
                "id": "demo-patient-003",
                "name": "Alex Johnson (Ambiguity Scenario)",
                "age": 52,
                "hospital": "Synthetic General Hospital",
                "discharge_date": "October 14, 2026",
                "attending_physician": "Dr. Elena Rostova, MD",
                "diagnosis_summary": "Community-acquired pneumonia resolving on oral antibiotics; mild persistent cough."
            }
            self.tasks = [
                {
                    "id": "task-301",
                    "patient_id": "demo-patient-003",
                    "task_type": "Medication",
                    "title": "Complete Amoxicillin-Clavulanate Course",
                    "description": "Discharge note specifies: 'Take 875mg twice daily until you feel better' without a definite day count.",
                    "due_date": None,
                    "priority": "High",
                    "status": "Needs Review",
                    "category": "Medication",
                    "source_reference": "Section 4: Antibiotic Discharge Regimen",
                    "created_at": f"{discharge_date}T10:00:00Z",
                    "updated_at": f"{discharge_date}T10:00:00Z",
                    "completed_at": None
                },
                {
                    "id": "task-302",
                    "patient_id": "demo-patient-003",
                    "task_type": "Appointment",
                    "title": "Schedule Primary Care Follow-up",
                    "description": "Discharge note specifies: 'See primary doctor soon' with no specified week or calendar window.",
                    "due_date": None,
                    "priority": "Medium",
                    "status": "Needs Review",
                    "category": "Appointment",
                    "source_reference": "Section 3: Clinic Follow-up Note",
                    "created_at": f"{discharge_date}T10:00:00Z",
                    "updated_at": f"{discharge_date}T10:00:00Z",
                    "completed_at": None
                },
                {
                    "id": "task-303",
                    "patient_id": "demo-patient-003",
                    "task_type": "Care",
                    "title": "Incentive Spirometer Deep Breathing (10x / hr)",
                    "description": "Perform 10 sustained maximal inspirations each waking hour to prevent atelectasis.",
                    "due_date": due_day_1,
                    "priority": "Medium",
                    "status": "Pending",
                    "category": "Care",
                    "source_reference": "Section 5: Respiratory Recovery Guidance",
                    "created_at": f"{discharge_date}T10:00:00Z",
                    "updated_at": f"{discharge_date}T10:00:00Z",
                    "completed_at": None
                }
            ]
            self.task_status_history = []
            self.reviews = [
                {
                    "id": "rev-301",
                    "patient_id": "demo-patient-003",
                    "issue": "Missing antibiotic treatment duration",
                    "issue_type": "Unclear medication instruction",
                    "priority": "High",
                    "reason": "Vague instruction 'until you feel better' creates risk of early antibiotic discontinuation.",
                    "status": "Open",
                    "original_instruction": "Take Amoxicillin-Clavulanate 875mg twice daily until symptoms resolve.",
                    "ai_interpretation": "Recommended action: Request clarifying physician order for standard 7 or 10-day antibiotic course.",
                    "source_reference": "Discharge Summary Page 1, Section 4",
                    "created_at": f"{discharge_date}T10:02:00Z",
                    "resolved_at": None,
                    "resolution_notes": None
                },
                {
                    "id": "rev-302",
                    "patient_id": "demo-patient-003",
                    "issue": "Missing follow-up appointment date",
                    "issue_type": "Missing follow-up date",
                    "priority": "Medium",
                    "reason": "Order states 'Follow up soon' without day or week boundary.",
                    "status": "Open",
                    "original_instruction": "Patient instructed to follow up soon with PCP.",
                    "ai_interpretation": "Recommended action: Clinical coordinator to schedule within 7-10 days per outpatient protocol.",
                    "source_reference": "Discharge Summary Page 2, Section 3",
                    "created_at": f"{discharge_date}T10:03:00Z",
                    "resolved_at": None,
                    "resolution_notes": None
                }
            ]
            self.ai_activity_logs = [
                {
                    "id": "log-301",
                    "event_type": "Ambiguous instruction detected",
                    "description": "Flagged incomplete antibiotic duration and missing appointment date.",
                    "reference": "REV-301, REV-302",
                    "agent": "Validation Agent",
                    "timestamp": f"{discharge_date}T10:05:00Z"
                }
            ]

        elif scenario_id == "scenario-4":
            # Scenario 4: Conflicting follow-up dates
            self.patient = {
                "id": "demo-patient-004",
                "name": "Alex Johnson (Conflicting Orders)",
                "age": 52,
                "hospital": "Synthetic General Hospital",
                "discharge_date": "October 14, 2026",
                "attending_physician": "Dr. Sarah Lin, MD",
                "diagnosis_summary": "Atrial fibrillation with rapid ventricular response, converted to sinus rhythm."
            }
            self.tasks = [
                {
                    "id": "task-401",
                    "patient_id": "demo-patient-004",
                    "task_type": "Appointment",
                    "title": "Resolve Cardiology Follow-up Timing Conflict",
                    "description": "Summary page 1 states 'Return to Cardiology in 3 days', while discharge orders on page 4 state 'Follow up in 2-3 weeks'.",
                    "due_date": due_day_1,
                    "priority": "High",
                    "status": "Needs Review",
                    "category": "Appointment",
                    "source_reference": "Discharge Page 1 vs. Discharge Orders Page 4",
                    "created_at": f"{discharge_date}T10:00:00Z",
                    "updated_at": f"{discharge_date}T10:00:00Z",
                    "completed_at": None
                },
                {
                    "id": "task-402",
                    "patient_id": "demo-patient-004",
                    "task_type": "Medication",
                    "title": "Take Apixaban 5mg Twice Daily",
                    "description": "Oral direct factor Xa inhibitor for stroke prevention in nonvalvular atrial fibrillation.",
                    "due_date": comp_day_1,
                    "priority": "High",
                    "status": "Completed",
                    "category": "Medication",
                    "source_reference": "Discharge Medication Reconciliation",
                    "created_at": f"{comp_day_1}T08:00:00Z",
                    "updated_at": f"{comp_day_1}T09:30:00Z",
                    "completed_at": f"{comp_day_1}T09:30:00Z"
                },
                {
                    "id": "task-403",
                    "patient_id": "demo-patient-004",
                    "task_type": "Test",
                    "title": "12-Lead Electrocardiogram (ECG)",
                    "description": "Routine rhythm surveillance ECG scheduled at outpatient telemetry suite.",
                    "due_date": due_day_2,
                    "priority": "Medium",
                    "status": "Pending",
                    "category": "Test",
                    "source_reference": "Section 6: Cardiology Orders",
                    "created_at": f"{discharge_date}T10:00:00Z",
                    "updated_at": f"{discharge_date}T10:00:00Z",
                    "completed_at": None
                }
            ]
            self.task_status_history = [
                {
                    "id": "hist-401",
                    "task_id": "task-402",
                    "previous_status": "Pending",
                    "new_status": "Completed",
                    "changed_at": f"{comp_day_1}T09:30:00Z"
                }
            ]
            self.reviews = [
                {
                    "id": "rev-401",
                    "patient_id": "demo-patient-004",
                    "issue": "Direct conflict in cardiology follow-up interval",
                    "issue_type": "Conflicting instructions",
                    "priority": "High",
                    "reason": "Text says 3-day post-discharge visit on pg. 1, but formal discharge order table notes 2-3 weeks.",
                    "status": "Open",
                    "original_instruction": "pg 1: 'Schedule visit within 3 days.' vs pg 4: 'Cardiology follow-up 2-3 weeks post-discharge.'",
                    "ai_interpretation": "Requires immediate coordinator verification with Dr. Lin's clinic to prevent missed early check.",
                    "source_reference": "Discharge Summary Pages 1 and 4",
                    "created_at": f"{discharge_date}T10:00:00Z",
                    "resolved_at": None,
                    "resolution_notes": None
                }
            ]
            self.ai_activity_logs = [
                {
                    "id": "log-401",
                    "event_type": "Conflicting instruction detected",
                    "description": "Cardiology clinic interval discrepancy (3 days vs 2-3 weeks) escalated.",
                    "reference": "REV-401",
                    "agent": "Safety and Escalation Agent",
                    "timestamp": f"{discharge_date}T10:02:00Z"
                }
            ]

        elif scenario_id == "scenario-5":
            # Scenario 5: Clinically sensitive medication or symptom question requiring escalation
            self.patient = {
                "id": "demo-patient-005",
                "name": "Alex Johnson (Clinical Escalation)",
                "age": 52,
                "hospital": "Synthetic General Hospital",
                "discharge_date": "October 14, 2026",
                "attending_physician": "Dr. Sarah Lin, MD",
                "diagnosis_summary": "Post-percutaneous coronary intervention (PCI) with drug-eluting stent to LAD."
            }
            self.tasks = [
                {
                    "id": "task-501",
                    "patient_id": "demo-patient-005",
                    "task_type": "Medication",
                    "title": "Dual Antiplatelet Therapy Safety Verification",
                    "description": "Patient reported mild nosebleed and inquired about pausing Brilinta. Never pause without cardiology consultation.",
                    "due_date": today_str,
                    "priority": "High",
                    "status": "Needs Review",
                    "category": "Medication",
                    "source_reference": "Section 4: Antiplatelet Protocol & Patient Portal Inquiry",
                    "created_at": f"{today_str}T08:00:00Z",
                    "updated_at": f"{today_str}T08:00:00Z",
                    "completed_at": None
                },
                {
                    "id": "task-502",
                    "patient_id": "demo-patient-005",
                    "task_type": "Appointment",
                    "title": "Urgent Care Coordination Assessment",
                    "description": "Nurse phone triage regarding reported minor epistaxis while on dual antiplatelet therapy.",
                    "due_date": today_str,
                    "priority": "High",
                    "status": "Pending",
                    "category": "Follow-up",
                    "source_reference": "Section 8: Care Team Escalation Protocol",
                    "created_at": f"{today_str}T08:15:00Z",
                    "updated_at": f"{today_str}T08:15:00Z",
                    "completed_at": None
                },
                {
                    "id": "task-503",
                    "patient_id": "demo-patient-005",
                    "task_type": "Care",
                    "title": "Stent Puncture Site Hemostasis Monitoring",
                    "description": "Inspect right radial access band site for any hematoma, tenderness, or swelling.",
                    "due_date": comp_day_1,
                    "priority": "Medium",
                    "status": "Completed",
                    "category": "Care",
                    "source_reference": "Section 5: Post-Catheterization Site Care",
                    "created_at": f"{comp_day_1}T09:00:00Z",
                    "updated_at": f"{comp_day_1}T12:00:00Z",
                    "completed_at": f"{comp_day_1}T12:00:00Z"
                }
            ]
            self.task_status_history = [
                {
                    "id": "hist-501",
                    "task_id": "task-503",
                    "previous_status": "Pending",
                    "new_status": "Completed",
                    "changed_at": f"{comp_day_1}T12:00:00Z"
                }
            ]
            self.reviews = [
                {
                    "id": "rev-501",
                    "patient_id": "demo-patient-005",
                    "issue": "Patient inquiry regarding stopping antiplatelet medication due to epistaxis",
                    "issue_type": "Other ambiguity",
                    "priority": "High",
                    "reason": "Stopping dual antiplatelet therapy within 30 days of stent placement carries severe stent thrombosis risk. Immediate clinical nurse/physician evaluation required.",
                    "status": "Open",
                    "original_instruction": "Continue Ticagrelor 90mg twice daily and Aspirin 81mg daily without interruption.",
                    "ai_interpretation": "ESCALATION: Under Responsible AI rules, CareFlow AI does not provide medication advice. Flagged for immediate clinical review.",
                    "source_reference": "Section 4 & Inbound Portal Message #4409",
                    "created_at": f"{today_str}T08:20:00Z",
                    "resolved_at": None,
                    "resolution_notes": None
                }
            ]
            self.ai_activity_logs = [
                {
                    "id": "log-501",
                    "event_type": "Item sent for human review",
                    "description": "Antiplatelet therapy inquiry escalated to clinical review queue. Responsible AI safeguard activated.",
                    "reference": "REV-501",
                    "agent": "Safety and Escalation Agent",
                    "timestamp": f"{today_str}T08:22:00Z"
                }
            ]

    # Task Operations
    def get_tasks(self, status: Optional[str] = None, category: Optional[str] = None) -> List[Dict[str, Any]]:
        result = self.tasks
        if status and status.lower() != "all":
            result = [t for t in result if t["status"].lower() == status.lower()]
        if category and category.lower() != "all":
            result = [t for t in result if t["category"].lower() == category.lower()]
        return result

    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        for t in self.tasks:
            if t["id"] == task_id:
                return t
        return None

    def update_task_status(self, task_id: str, new_status: str) -> Optional[Dict[str, Any]]:
        task = self.get_task(task_id)
        if not task:
            return None
        
        old_status = task["status"]
        if old_status == new_status:
            return task
        
        now_iso = datetime.now().isoformat() + "Z"
        task["status"] = new_status
        task["updated_at"] = now_iso
        
        if new_status == "Completed":
            task["completed_at"] = now_iso
        else:
            task["completed_at"] = None

        # Record status history
        history_entry = {
            "id": f"hist-{uuid.uuid4().hex[:8]}",
            "task_id": task_id,
            "previous_status": old_status,
            "new_status": new_status,
            "changed_at": now_iso
        }
        self.task_status_history.append(history_entry)

        # Log AI Activity
        self.ai_activity_logs.append({
            "id": f"log-{uuid.uuid4().hex[:8]}",
            "event_type": "Task status updated",
            "description": f"Task '{task['title']}' changed from {old_status} to {new_status}.",
            "reference": task_id,
            "agent": "Task Generation Agent",
            "timestamp": now_iso
        })

        return task

    # Review Operations
    def get_reviews(self, issue_type: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        res = self.reviews
        if issue_type and issue_type.lower() != "all":
            res = [r for r in res if r["issue_type"].lower() == issue_type.lower()]
        if status and status.lower() != "all":
            res = [r for r in res if r["status"].lower() == status.lower()]
        return res

    def get_review(self, review_id: str) -> Optional[Dict[str, Any]]:
        for r in self.reviews:
            if r["id"] == review_id:
                return r
        return None

    def update_review(self, review_id: str, new_status: str, notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
        rev = self.get_review(review_id)
        if not rev:
            return None
        
        now_iso = datetime.now().isoformat() + "Z"
        rev["status"] = new_status
        rev["resolved_at"] = now_iso if new_status in ["Resolved", "Approved", "Rejected"] else None
        if notes:
            rev["resolution_notes"] = notes

        # If review is approved/resolved, check if there's a corresponding task that was Needs Review
        # and update or log it
        self.ai_activity_logs.append({
            "id": f"log-{uuid.uuid4().hex[:8]}",
            "event_type": "Review action completed",
            "description": f"Review item '{rev['issue']}' marked as {new_status}. {notes or ''}",
            "reference": review_id,
            "agent": "Safety and Escalation Agent",
            "timestamp": now_iso
        })

        return rev

    # Patient Operations
    def update_patient(self, name: Optional[str] = None, age: Optional[int] = None) -> Dict[str, Any]:
        if name is not None and name.strip():
            self.patient["name"] = name.strip()
        if age is not None:
            self.patient["age"] = age
        return self.patient

# Shared singleton data store
db_store = DataStore()

