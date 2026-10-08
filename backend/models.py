from datetime import datetime, date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- Core Patient Model ---
class Patient(BaseModel):
    id: str = "patient-001"
    name: str = "Alex Johnson"
    age: int = 52
    language: str = "English"  # Always English as per requirements
    hospital: str = "Synthetic General Hospital"
    discharge_date: str = "October 14, 2026"
    is_synthetic: bool = True

# --- Discharge Document Model ---
class DischargeDocument(BaseModel):
    id: str
    patient_id: str
    file_name: str
    upload_date: str
    raw_text: str

# --- Extracted Entities ---
class Appointment(BaseModel):
    id: str
    patient_id: str
    type: str  # e.g., "Cardiology Follow-up"
    specialty: str = "General"
    date: Optional[str] = None
    timeframe: Optional[str] = None
    status: str = "Pending"  # Pending, Completed, Needs Review
    source_reference: str  # e.g., "Discharge Summary – Page 2 – Follow-up section"
    patient_friendly_explanation: Optional[str] = None
    notes: Optional[str] = None

class Medication(BaseModel):
    id: str
    patient_id: str
    name: str
    instruction: str  # Preserved EXACTLY as written in document
    duration: Optional[str] = None
    status: str = "Active"
    source_reference: str
    patient_friendly_explanation: Optional[str] = None
    needs_review: bool = False
    review_reason: Optional[str] = None

class Test(BaseModel):
    id: str
    patient_id: str
    test_name: str
    date: Optional[str] = None
    status: str = "Pending"  # Pending, Completed, Needs Review
    source_reference: str
    patient_friendly_explanation: Optional[str] = None
    instructions: Optional[str] = None

class Referral(BaseModel):
    id: str
    patient_id: str
    specialty: str
    reason: Optional[str] = None
    status: str = "Pending"  # Pending, Completed, Needs Review
    source_reference: str
    patient_friendly_explanation: Optional[str] = None

class CareInstruction(BaseModel):
    id: str
    patient_id: str
    category: str  # "Wound Care", "Diet", "Activity", "General"
    instruction: str
    source_reference: str
    patient_friendly_explanation: Optional[str] = None

class WarningSign(BaseModel):
    id: str
    patient_id: str
    symptom: str
    action: str  # e.g., "Seek immediate medical attention / Call emergency"
    source_reference: str

# --- Task Model ---
class TaskItem(BaseModel):
    id: str
    patient_id: str
    task_name: str
    description: str
    category: str  # Medication, Appointment, Test, Referral, Care, Follow-up
    due_date: Optional[str] = None
    priority: str = "Medium"  # High, Medium, Low
    status: str = "Pending"  # Pending, Completed, Needs Review
    source_reference: str
    patient_friendly_explanation: Optional[str] = None
    related_entity_id: Optional[str] = None

# --- Provider Model ---
class Provider(BaseModel):
    id: str
    name: str
    specialty: str
    facility: str
    location: str
    synthetic_flag: bool = True
    rating: float = 4.8
    phone: str = "+1 (555) 019-2834"
    address: str = "Suite 400, Synthetic Medical Center"
    accepting_new_patients: bool = True

# --- Human Review Item Model ---
class ReviewItem(BaseModel):
    id: str
    patient_id: str = "pat-001"
    patient_name: str = "Alex Johnson"
    issue: str
    priority: str = "Medium"  # High, Medium, Low
    reason: str
    status: str = "Needs Review"  # Needs Review, Approved, Needs Clarification, Resolved
    source_reference: str
    original_text: str
    ai_interpretation: str
    source_document: Optional[str] = "Synthetic Discharge Summary"
    source_page: Optional[str] = "2"
    source_section: Optional[str] = "Medication Instructions"
    source_text: Optional[str] = None
    reviewer_notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M"))

# --- Audit Log Model ---
class AuditLog(BaseModel):
    id: str
    timestamp: str
    agent_name: str
    action: str
    detail: str
    status: str = "Success"

# --- Safety Request / Response ---
class SafetyCheckRequest(BaseModel):
    query: str
    context: Optional[str] = None

class SafetyCheckResponse(BaseModel):
    is_sensitive: bool
    requires_escalation: bool
    category: str
    explanation: str
    recommended_action: str
    disclaimer: str

# --- Extraction Payload ---
class AnalyzeResponse(BaseModel):
    document_id: str
    patient: Patient
    appointments: List[Appointment]
    medications: List[Medication]
    tests: List[Test]
    referrals: List[Referral]
    care_instructions: List[CareInstruction]
    warning_signs: List[WarningSign]
    tasks: List[TaskItem]
    reviews: List[ReviewItem]
    timeline: List[Dict[str, Any]]
    matched_providers: List[Provider]
    audit_logs: List[AuditLog]
    summary_stats: Dict[str, int]
