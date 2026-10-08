from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# 1. Patient Schema (English only, strictly synthetic)
class Patient(BaseModel):
    id: str = "SYN-PT-80214"
    name: str = "Alex Johnson"
    age: int = 52
    gender: str = "Male"
    language: str = "English"  # Strictly English only
    hospital: str = "Synthetic General Hospital"
    discharge_date: str = "October 14, 2026"
    primary_diagnosis: str = "Acute Anterior STEMI (Post-PCI Status)"
    allergies: str = "No Known Drug Allergies (NKDA)"

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    language: Optional[str] = None
    hospital: Optional[str] = None
    discharge_date: Optional[str] = None
    primary_diagnosis: Optional[str] = None
    allergies: Optional[str] = None

# 2. Source Reference Schema for Explainability
class SourceReference(BaseModel):
    document: str = "Synthetic_Discharge_Summary.pdf"
    page: int = 1
    section: str = "Follow-up Instructions"
    original_text: str
    agent_name: str = "Document Extraction Agent"
    confidence: float = 0.95

# 3. Discharge Document Schema
class DischargeDocument(BaseModel):
    id: str
    patient_id: str = "SYN-PT-80214"
    file_name: str
    upload_date: str
    raw_text: str
    summary_type: str = "Synthetic"

# 4. Clinical Entity Schemas
class Appointment(BaseModel):
    id: str
    patient_id: str = "SYN-PT-80214"
    type: str  # e.g., "Cardiology Follow-up"
    specialty: str = "Cardiology"
    date: Optional[str] = None  # None if ambiguous/missing
    due_date_formatted: Optional[str] = None
    status: str = "Pending"  # Pending | Completed | Needs Review
    source_reference: SourceReference

class Medication(BaseModel):
    id: str
    patient_id: str = "SYN-PT-80214"
    name: str
    instruction: str  # Exactly as written in the discharge document
    duration: Optional[str] = None
    status: str = "Pending"
    source_reference: SourceReference

class TestItem(BaseModel):
    id: str
    patient_id: str = "SYN-PT-80214"
    test_name: str
    date: Optional[str] = None
    due_date_formatted: Optional[str] = None
    status: str = "Pending"
    source_reference: SourceReference

class Referral(BaseModel):
    id: str
    patient_id: str = "SYN-PT-80214"
    specialty: str
    reason: Optional[str] = None
    status: str = "Pending"
    source_reference: SourceReference

class CareInstruction(BaseModel):
    id: str
    patient_id: str = "SYN-PT-80214"
    title: str
    instruction: str
    category: str = "Care"
    source_reference: SourceReference

class WarningSign(BaseModel):
    id: str
    patient_id: str = "SYN-PT-80214"
    symptom: str
    action: str = "Call emergency medical services or proceed to the nearest emergency department immediately."
    source_reference: SourceReference

# 5. Task Schema
class Task(BaseModel):
    id: str
    patient_id: str = "SYN-PT-80214"
    task_type: str  # "Appointment" | "Test" | "Medication" | "Referral" | "Care" | "Follow-up"
    name: str
    description: str
    patient_friendly_explanation: str
    due_date: Optional[str] = None
    due_date_formatted: Optional[str] = None
    priority: str = "Medium"  # High | Medium | Low
    status: str = "Pending"  # Pending | Completed | Needs Review
    source_reference: SourceReference

# 6. Provider Schema
class Provider(BaseModel):
    id: str
    name: str
    specialty: str
    facility: str
    location: str
    synthetic_flag: bool = True
    disclaimer: str = "Provider matches are based on synthetic data and do not guarantee availability, suitability, or clinical appropriateness."

# 7. Human Review Item Schema
class ReviewItem(BaseModel):
    id: str
    patient_id: str = "SYN-PT-80214"
    issue: str
    priority: str = "High"  # High | Medium | Low
    reason: str
    status: str = "Pending"  # Pending | Approved | Resolved | Clarification Requested | Rejected
    original_text: str
    ai_interpretation: str
    source_reference: SourceReference
    resolution_notes: Optional[str] = None
    duration: Optional[str] = None

# 8. AI Activity Log
class AIActivityLog(BaseModel):
    id: str
    timestamp: str
    agent_name: str
    action: str
    details: str

# 9. Request / Response Payloads
class AnalysisRequest(BaseModel):
    raw_text: Optional[str] = None
    file_name: Optional[str] = "Discharge_Summary.txt"
    scenario_id: Optional[str] = None

class TaskStatusUpdate(BaseModel):
    status: str  # "Pending" | "Completed" | "Needs Review"

class ReviewStatusUpdate(BaseModel):
    status: str  # "Approved" | "Clarification Requested" | "Resolved" | "Rejected"
    resolution_notes: Optional[str] = None
    duration: Optional[str] = None

class SafetyCheckRequest(BaseModel):
    query: str

class SafetyCheckResponse(BaseModel):
    is_safe: bool
    escalation_required: bool
    message: str
    recommended_action: str
