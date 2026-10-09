from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class TaskStatusUpdate(BaseModel):
    status: str  # "Pending", "Completed", "Needs Review"
    notes: Optional[str] = None

class TaskCreate(BaseModel):
    title: str
    description: str
    category: str  # "Medication", "Appointment", "Test", "Referral", "Care", "Follow-up"
    task_type: Optional[str] = None
    due_date: Optional[str] = None
    priority: str = "Medium"  # "High", "Medium", "Low"
    status: str = "Pending"  # "Pending", "Completed", "Needs Review"
    source_reference: Optional[str] = None

class TaskModel(BaseModel):
    id: str
    patient_id: str
    task_type: str
    title: str
    description: str
    due_date: Optional[str] = None
    priority: str
    status: str  # "Pending", "Completed", "Needs Review"
    category: str
    source_reference: str
    created_at: str
    updated_at: str
    completed_at: Optional[str] = None

class TaskStatusHistoryModel(BaseModel):
    id: str
    task_id: str
    previous_status: str
    new_status: str
    changed_at: str

class ReviewUpdate(BaseModel):
    status: str  # "Open", "Resolved", "Approved", "Rejected"
    resolution_notes: Optional[str] = None

class ReviewModel(BaseModel):
    id: str
    patient_id: str
    issue: str
    issue_type: str  # "Missing follow-up date", "Unclear medication instruction", "Conflicting instructions", "Missing appointment details", "Other ambiguity"
    priority: str  # "High", "Medium", "Low"
    reason: str
    status: str  # "Open", "Resolved", "Approved", "Rejected"
    original_instruction: str
    ai_interpretation: str
    source_reference: str
    created_at: str
    resolved_at: Optional[str] = None
    resolution_notes: Optional[str] = None

class ProviderModel(BaseModel):
    id: str
    name: str
    specialty: str
    facility: str
    location: str
    phone: str
    email: str
    is_synthetic: bool = True

class AIActivityLogModel(BaseModel):
    id: str
    event_type: str
    description: str
    reference: Optional[str] = None
    agent: str
    timestamp: str

class PatientModel(BaseModel):
    id: str
    name: str
    age: int
    hospital: str
    discharge_date: str
    attending_physician: str
    diagnosis_summary: str

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None


class DischargeSummaryInput(BaseModel):
    patient_id: Optional[str] = "demo-patient-001"
    raw_text: str
    filename: Optional[str] = "discharge_summary.txt"

class DischargeAnalysisResult(BaseModel):
    document_id: str
    patient: PatientModel
    appointments: List[Dict[str, Any]]
    tests: List[Dict[str, Any]]
    medications: List[Dict[str, Any]]
    care_instructions: List[Dict[str, Any]]
    warning_signs: List[Dict[str, Any]]
    unclear_items: List[Dict[str, Any]]
    tasks: List[TaskModel]
    reviews: List[ReviewModel]
    processing_stages: List[Dict[str, Any]]
