"""
CareFlow AI – FastAPI Backend
Agentic Hospital Discharge & Follow-up Coordinator
English only. Synthetic healthcare data only.
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uuid
import os

from backend.models import (
    Patient,
    DischargeDocument,
    AnalyzeResponse,
    TaskItem,
    ReviewItem,
    Provider,
    AuditLog,
    SafetyCheckRequest,
    SafetyCheckResponse
)
from backend.agents.orchestrator import AgentOrchestrator
from backend.data.synthetic_data import SYNTHETIC_PROVIDERS, SYNTHETIC_SCENARIOS

app = FastAPI(
    title="CareFlow AI API",
    description="Agentic Hospital Discharge & Follow-up Coordinator",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = AgentOrchestrator()

# --- In-Memory State Store (Initialized with Scenario 1) ---
current_patient = None
current_document = None
current_analysis = None

# Recalculate summary stats
def refresh_stats():
    global current_analysis
    if not current_analysis:
        return
    tasks = current_analysis.tasks
    reviews = current_analysis.reviews

    task_map = {t.id: t for t in tasks}
    rev_map = {}
    for r in reviews:
        s = r.status
        if s in ["Approved", "Approve Extraction", "approve", "approved"]:
            s = "Approved"
        elif s in ["Needs Clarification", "Request Clarification", "Clarification Requested", "clarification requested", "clarify"]:
            s = "Needs Clarification"
        elif s in ["Resolved", "Mark Resolved", "resolve", "resolved"]:
            s = "Resolved"
        elif s in ["Needs Review", "needs review"]:
            s = "Needs Review"
        r.status = s
        rev_map[r.id.upper()] = s

    # Synchronize all tasks with their respective review items dynamically
    for t in tasks:
        for r_id, r_status in rev_map.items():
            matching_review = next((r for r in reviews if r.id.upper() == r_id), None)
            if not matching_review:
                continue
            is_match = False
            if t.id == "task-verify-doc" and "DOC" in r_id:
                is_match = True
            elif t.id == "task-3" and r_id == "REV-001":
                is_match = True
            elif t.id == "task-5" and r_id == "REV-002":
                is_match = True
            elif t.id == "task-6" and r_id == "REV-003":
                is_match = True
            elif matching_review.source_reference and t.source_reference == matching_review.source_reference:
                is_match = True

            if is_match:
                if r_status in ["Approved", "Resolved"]:
                    if t.status == "Needs Review":
                        t.status = "Completed"
                elif r_status == "Needs Clarification":
                    if t.status == "Needs Review":
                        t.status = "Pending"
                elif r_status == "Needs Review":
                    t.status = "Needs Review"

    # Synchronize timeline milestones with tasks and reviews
    if hasattr(current_analysis, "timeline") and current_analysis.timeline:
        for evt in current_analysis.timeline:
            evt_src = evt.get("source")
            has_unresolved_review = False
            for r in reviews:
                if r.status == "Needs Review" and (
                    (r.source_reference and evt_src and r.source_reference == evt_src) or
                    ("DOC" in r.id and evt.get("id") == "tl-doc-review")
                ):
                    has_unresolved_review = True
                    break

            if has_unresolved_review:
                evt["status"] = "Needs Review"
            else:
                matching_task = next((t for t in tasks if t.source_reference and evt_src and t.source_reference == evt_src), None)
                if matching_task:
                    evt["status"] = matching_task.status
                elif evt.get("id") == "tl-doc-review":
                    evt["status"] = "Completed"

    active_reviews = [r for r in reviews if r.status == "Needs Review"]
    active_count = len(active_reviews)
    pending_count = sum(1 for t in tasks if t.status == "Pending")
    completed_count = sum(1 for t in tasks if t.status == "Completed")
    needs_review_count = active_count

    current_analysis.summary_stats = {
        "total_tasks": len(tasks),
        "pending": pending_count,
        "completed": completed_count,
        "needs_review": needs_review_count
    }

def reset_to_default_state():
    global current_patient, current_document, current_analysis
    current_patient = Patient(
        id="pat-001",
        name="Alex Johnson",
        age=52,
        language="English",
        hospital="Synthetic General Hospital",
        discharge_date="October 14, 2026",
        is_synthetic=True
    )

    current_document = DischargeDocument(
        id="doc-default",
        patient_id=current_patient.id,
        file_name="synthetic_discharge_summary_alex_johnson.txt",
        upload_date="2026-10-14 11:30 AM",
        raw_text=SYNTHETIC_SCENARIOS["scenario_1"]["text"]
    )

    current_analysis = orchestrator.run_pipeline(
        raw_text=current_document.raw_text,
        patient=current_patient,
        document_id=current_document.id,
        file_name=current_document.file_name
    )

    current_analysis.reviews = [
        ReviewItem(
            id="REV-001",
            patient_id=current_patient.id,
            patient_name=current_patient.name,
            issue="Medication duration unspecified",
            priority="HIGH",
            reason="The discharge summary does not provide enough information to determine duration.",
            status="Needs Review",
            source_reference="Discharge Summary – Page 2 – Medication section",
            source_document="Synthetic Discharge Summary",
            source_page="2",
            source_section="Medication Instructions",
            source_text="DISCHARGE MEDICATIONS:\n1. Continue maintenance medication as prescribed.\n[Note: Duration and refill quantity are not explicitly specified in the chart.]",
            original_text="Continue maintenance medication as prescribed.",
            ai_interpretation="Medication duration or refill limit is not explicitly specified."
        ),
        ReviewItem(
            id="REV-002",
            patient_id=current_patient.id,
            patient_name=current_patient.name,
            issue="Follow-up date missing",
            priority="MEDIUM",
            reason="AI must not invent a follow-up date.",
            status="Needs Review",
            source_reference="Discharge Summary – Page 1 – Follow-up section",
            source_document="Synthetic Discharge Summary",
            source_page="1",
            source_section="Scheduled Follow-up Appointments",
            source_text="SCHEDULED FOLLOW-UP APPOINTMENTS:\n- Follow up with Cardiology.\n[Note: Specific appointment date, clinic location, and timeframe are not specified.]",
            original_text="Follow up with Cardiology.",
            ai_interpretation="Cardiology follow-up is required, but no specific date is provided."
        ),
        ReviewItem(
            id="REV-003",
            patient_id=current_patient.id,
            patient_name=current_patient.name,
            issue="Conflicting follow-up dates",
            priority="MEDIUM",
            reason="The system cannot determine which date is correct.",
            status="Needs Review",
            source_reference="Discharge Summary – Section 3 vs Section 6 Addendum",
            source_document="Synthetic Discharge Summary",
            source_page="1 & 2",
            source_section="Section 3 (Discharge Orders) vs Section 6 (Attending Addendum)",
            source_text="SECTION 3 - DISCHARGE ORDERS:\n- Follow up with Orthopedic Surgical Clinic in 2 weeks on October 28, 2026 for staple removal and initial joint evaluation.\n\nSECTION 6 - ATTENDING PHYSICIAN DISCHARGE ADDENDUM:\n- Patient should return for orthopedic clinic checkup in 6 weeks (target: November 25, 2026) for post-operative imaging.",
            original_text="Section 3: Follow up with Orthopedic Surgical Clinic in 2 weeks on October 28, 2026 for staple removal. Section 6: Attending Addendum specifies checkup in 6 weeks on November 25, 2026.",
            ai_interpretation="Two different follow-up dates were identified."
        )
    ]

    current_analysis.tasks = [
        TaskItem(
            id="task-1",
            patient_id=current_patient.id,
            task_name="Complete Basic Metabolic Panel (BMP) and CBC",
            description="Fasting blood draw scheduled at Outpatient Laboratory.",
            category="Test",
            due_date="October 16, 2026",
            priority="Medium",
            status="Pending",
            source_reference="Discharge Summary – Page 1 – Diagnostic Orders",
            patient_friendly_explanation="Routine blood test to monitor electrolytes and kidney health."
        ),
        TaskItem(
            id="task-2",
            patient_id=current_patient.id,
            task_name="Fasting Lipid Panel at 6 weeks",
            description="Completed routine baseline lipid testing before discharge.",
            category="Test",
            due_date="November 25, 2026",
            priority="Low",
            status="Completed",
            source_reference="Discharge Summary – Page 2 – Laboratory section",
            patient_friendly_explanation="Cholesterol panel verified."
        ),
        TaskItem(
            id="task-3",
            patient_id=current_patient.id,
            task_name="Continue maintenance medication as prescribed",
            description="Medication duration unspecified in discharge summary. Awaiting clinical verification.",
            category="Medication",
            due_date="Daily",
            priority="High",
            status="Needs Review",
            source_reference="Discharge Summary – Page 2 – Medication section",
            patient_friendly_explanation="Maintenance medication schedule awaiting confirmation."
        ),
        TaskItem(
            id="task-4",
            patient_id=current_patient.id,
            task_name="Take Aspirin 81 mg daily as prescribed",
            description="Antiplatelet therapy initiated in hospital.",
            category="Medication",
            due_date="Ongoing",
            priority="Medium",
            status="Completed",
            source_reference="Discharge Summary – Page 2 – Medications",
            patient_friendly_explanation="Daily baby aspirin for cardiac protection."
        ),
        TaskItem(
            id="task-5",
            patient_id=current_patient.id,
            task_name="Follow up with Cardiology",
            description="Cardiology follow-up is required, but no specific date is provided in summary.",
            category="Appointment",
            due_date="Date Unspecified",
            priority="Medium",
            status="Needs Review",
            source_reference="Discharge Summary – Page 1 – Follow-up section",
            patient_friendly_explanation="Cardiology clinic visit to be scheduled."
        ),
        TaskItem(
            id="task-6",
            patient_id=current_patient.id,
            task_name="Orthopedic Clinic Evaluation (Oct 28 vs Nov 25)",
            description="Conflicting follow-up timeframes identified between Section 3 and Section 6.",
            category="Appointment",
            due_date="Conflict Flagged",
            priority="Medium",
            status="Needs Review",
            source_reference="Discharge Summary – Section 3 vs Section 6 Addendum",
            patient_friendly_explanation="Orthopedic checkup appointment resolution needed."
        ),
        TaskItem(
            id="task-7",
            patient_id=current_patient.id,
            task_name="Follow Surgical Dressing Care Instructions",
            description="Keep incision site dry and clean for 72 hours post-procedure.",
            category="Care",
            due_date="October 17, 2026",
            priority="Medium",
            status="Pending",
            source_reference="Discharge Summary – Page 2 – Care Instructions",
            patient_friendly_explanation="Keep bandages clean and dry."
        ),
        TaskItem(
            id="task-8",
            patient_id=current_patient.id,
            task_name="Resume Light Walking Activity Plan",
            description="Begin gentle 10-minute walks daily as tolerated; avoid lifting over 10 lbs.",
            category="Care",
            due_date="Daily",
            priority="Low",
            status="Pending",
            source_reference="Discharge Summary – Page 3 – Activity Orders",
            patient_friendly_explanation="Light exercise to aid circulation."
        ),
        TaskItem(
            id="task-9",
            patient_id=current_patient.id,
            task_name="Adhere to Low-Sodium Cardiac Diet Plan",
            description="Limit dietary sodium intake to under 2,000 mg per day.",
            category="Care",
            due_date="Ongoing",
            priority="Low",
            status="Pending",
            source_reference="Discharge Summary – Page 3 – Dietary Instructions",
            patient_friendly_explanation="Eat low-salt meals to protect your heart."
        ),
        TaskItem(
            id="task-10",
            patient_id=current_patient.id,
            task_name="Monitor Post-Discharge Warning Signs",
            description="Watch for fever > 101°F, shortness of breath, or calf redness/swelling.",
            category="Care",
            due_date="Ongoing",
            priority="High",
            status="Pending",
            source_reference="Discharge Summary – Page 3 – Warning Signs",
            patient_friendly_explanation="Red flag symptoms requiring clinical attention."
        )
    ]
    refresh_stats()

reset_to_default_state()

# --- Request Models ---
class AnalyzeTextRequest(BaseModel):
    raw_text: str
    file_name: Optional[str] = "discharge_summary.txt"
    patient_name: Optional[str] = "Alex Johnson"
    patient_age: Optional[int] = 52
    scenario_id: Optional[str] = None

class PatientUpdateRequest(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    hospital: Optional[str] = None
    discharge_date: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = "patient"
    patient_name: Optional[str] = None

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    age: Optional[int] = 52
    gender: Optional[str] = "Male"
    hospital: Optional[str] = "Synthetic General Hospital"

class TaskStatusUpdate(BaseModel):
    status: str  # Pending, Completed, Needs Review

class ReviewUpdate(BaseModel):
    status: str  # Approved, Clarification Requested, Resolved, Rejected
    reviewer_notes: Optional[str] = None

# --- API Endpoints ---

@app.get("/")
def root():
    return {
        "app": "CareFlow AI",
        "tagline": "Turn complex discharge instructions into a clear, trackable care plan.",
        "status": "Online",
        "mode": "Synthetic Data Mode",
        "language": "English only"
    }

@app.post("/api/reset")
def reset_environment():
    """Resets the demo state back to canonical default."""
    reset_to_default_state()
    return {
        "status": "reset",
        "message": "CareFlow state reset to default Scenario 1.",
        "summary_stats": current_analysis.summary_stats
    }

@app.get("/api/patient")
def get_patient():
    """Returns the current active patient."""
    return current_patient

@app.put("/api/patient")
def update_patient(payload: PatientUpdateRequest):
    """Updates the active patient information dynamically."""
    global current_patient, current_analysis, current_document
    old_name = current_patient.name
    if payload.name:
        new_name = payload.name.strip()
        current_patient.name = new_name
        # Also update raw text in current_document if present
        if current_document and current_document.raw_text:
            current_document.raw_text = current_document.raw_text.replace(old_name, new_name)
            if "Alex Johnson" in current_document.raw_text:
                current_document.raw_text = current_document.raw_text.replace("Alex Johnson", new_name)
        if current_document and current_document.file_name:
            current_document.file_name = current_document.file_name.replace(
                old_name.lower().replace(" ", "_"), new_name.lower().replace(" ", "_")
            )
            current_document.file_name = current_document.file_name.replace(
                "alex_johnson", new_name.lower().replace(" ", "_")
            )
    if payload.age is not None:
        current_patient.age = payload.age
    if payload.hospital:
        current_patient.hospital = payload.hospital.strip()
    if payload.discharge_date:
        current_patient.discharge_date = payload.discharge_date.strip()
    
    current_analysis.patient = current_patient
    
    current_analysis.audit_logs.append(AuditLog(
        id=f"log-{len(current_analysis.audit_logs) + 1}",
        timestamp="Just now",
        agent_name="Patient Coordination Service",
        action=f"Patient details updated to {current_patient.name}",
        detail=f"Patient demographic name/age updated in active care plan.",
        status="Success"
    ))
    return current_patient

@app.post("/api/auth/login")
def auth_login(payload: LoginRequest):
    """Mock authentication supporting patient and clinical coordinator roles."""
    global current_patient
    email = payload.email.lower().strip()
    
    if payload.patient_name:
        current_patient.name = payload.patient_name.strip()
        current_analysis.patient = current_patient
    
    is_coordinator = payload.role == "coordinator" or "nurse" in email or "coordinator" in email
    
    if is_coordinator:
        user_info = {
            "id": "usr-coord-1",
            "name": payload.patient_name or "Nurse Sarah Jenkins, RN",
            "email": email,
            "role": "coordinator",
            "token": f"mock-token-{uuid.uuid4().hex[:8]}"
        }
    else:
        user_info = {
            "id": "usr-patient-1",
            "name": current_patient.name,
            "email": email,
            "role": "patient",
            "token": f"mock-token-{uuid.uuid4().hex[:8]}"
        }
        
    return {
        "user": user_info,
        "patient": current_patient,
        "status": "authenticated"
    }

@app.post("/api/auth/register")
def auth_register(payload: RegisterRequest):
    """Registers a new synthetic patient and initializes their care profile."""
    global current_patient, current_analysis
    current_patient = Patient(
        id=f"pat-{uuid.uuid4().hex[:6]}",
        name=payload.name.strip(),
        age=payload.age or 52,
        language="English",
        hospital=payload.hospital.strip() if payload.hospital else "Synthetic General Hospital",
        discharge_date="October 14, 2026",
        is_synthetic=True
    )
    current_analysis.patient = current_patient
    
    user_info = {
        "id": f"usr-{uuid.uuid4().hex[:6]}",
        "name": current_patient.name,
        "email": payload.email.lower().strip(),
        "role": "patient",
        "token": f"mock-token-{uuid.uuid4().hex[:8]}"
    }
    
    current_analysis.audit_logs.append(AuditLog(
        id=f"log-{len(current_analysis.audit_logs) + 1}",
        timestamp="Just now",
        agent_name="Patient Registration Service",
        action=f"New synthetic patient registered: {current_patient.name}",
        detail=f"Registered account for {payload.email} and configured dynamic care plan.",
        status="Success"
    ))
    
    return {
        "user": user_info,
        "patient": current_patient,
        "status": "registered"
    }

@app.get("/api/scenarios")
def get_scenarios():
    """Returns the 5 built-in synthetic scenarios."""
    return list(SYNTHETIC_SCENARIOS.values())

@app.post("/api/discharge/upload")
async def upload_document(
    file: UploadFile = File(...),
    patient_name: Optional[str] = Form("Alex Johnson"),
    patient_age: Optional[int] = Form(52)
):
    """
    Accepts synthetic PDF or TXT discharge summary upload and processes it.
    """
    global current_document, current_patient, current_analysis

    file_bytes = await file.read()
    file_name = file.filename

    if file_name.lower().endswith(".pdf"):
        extracted_text = orchestrator.extract_text_from_pdf_bytes(file_bytes)
    else:
        try:
            extracted_text = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            extracted_text = file_bytes.decode("latin-1", errors="replace")

    if not extracted_text or len(extracted_text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Could not extract readable text from document.")

    target_name = patient_name or current_patient.name or "Alex Johnson"
    doc_id = f"doc-{uuid.uuid4().hex[:8]}"
    current_patient = Patient(
        id=f"pat-{uuid.uuid4().hex[:6]}",
        name=target_name,
        age=patient_age or current_patient.age or 52,
        language="English",
        hospital="Synthetic General Hospital",
        discharge_date="October 14, 2026",
        is_synthetic=True
    )

    current_document = DischargeDocument(
        id=doc_id,
        patient_id=current_patient.id,
        file_name=file_name,
        upload_date="2026-10-14 12:00 PM",
        raw_text=extracted_text
    )

    current_analysis = orchestrator.run_pipeline(
        raw_text=extracted_text,
        patient=current_patient,
        document_id=doc_id,
        file_name=file_name
    )
    refresh_stats()

    return current_analysis

@app.post("/api/discharge/analyze")
def analyze_text(payload: AnalyzeTextRequest):
    """
    Analyzes raw text or a synthetic scenario.
    """
    global current_document, current_patient, current_analysis

    raw_text = payload.raw_text
    if payload.scenario_id and payload.scenario_id in SYNTHETIC_SCENARIOS:
        raw_text = SYNTHETIC_SCENARIOS[payload.scenario_id]["text"]

    target_name = payload.patient_name or current_patient.name or "Alex Johnson"
    if target_name and target_name != "Alex Johnson":
        raw_text = raw_text.replace("Alex Johnson", target_name)

    doc_id = f"doc-{uuid.uuid4().hex[:8]}"
    current_patient = Patient(
        id=f"pat-{uuid.uuid4().hex[:6]}",
        name=target_name,
        age=payload.patient_age or current_patient.age or 52,
        language="English",
        hospital="Synthetic General Hospital",
        discharge_date="October 14, 2026",
        is_synthetic=True
    )

    current_document = DischargeDocument(
        id=doc_id,
        patient_id=current_patient.id,
        file_name=payload.file_name or "synthetic_discharge.txt",
        upload_date="2026-10-14 12:00 PM",
        raw_text=raw_text
    )

    current_analysis = orchestrator.run_pipeline(
        raw_text=raw_text,
        patient=current_patient,
        document_id=doc_id,
        file_name=payload.file_name or "synthetic_discharge.txt"
    )
    refresh_stats()

    return current_analysis

@app.get("/api/discharge/{id}")
def get_discharge_document(id: str):
    """
    Returns the current active discharge document along with extracted details.
    """
    return {
        "document": current_document,
        "analysis": current_analysis
    }

@app.get("/api/dashboard")
def get_dashboard_data():
    """
    Returns dashboard overview with summary cards, next actions, timeline, and attention alert.
    """
    refresh_stats()
    attention_reviews = [r for r in current_analysis.reviews if r.status == "Needs Review"]
    
    # Priority next actions: include urgent tasks needing attention
    next_actions = [t for t in current_analysis.tasks if t.status in ["Pending", "Needs Review"]][:4]

    return {
        "patient": current_patient,
        "summary_stats": current_analysis.summary_stats,
        "next_actions": next_actions,
        "timeline_preview": current_analysis.timeline[:4],
        "attention_required": {
            "has_items": len(attention_reviews) > 0,
            "count": len(attention_reviews),
            "primary_item": attention_reviews[0] if attention_reviews else None
        }
    }

@app.get("/api/tasks")
def get_tasks(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None)
):
    """
    Returns task list with optional filtering by status and category.
    """
    refresh_stats()
    tasks = current_analysis.tasks
    if status and status != "All":
        tasks = [t for t in tasks if t.status.lower() == status.lower()]
    if category and category != "All":
        tasks = [t for t in tasks if t.category.lower() == category.lower()]
    return tasks

@app.put("/api/tasks/{task_id}/status")
def update_task_status(task_id: str, payload: TaskStatusUpdate):
    """
    Updates the status of a specific task (Pending, Completed, Needs Review).
    """
    for task in current_analysis.tasks:
        if task.id == task_id:
            task.status = payload.status
            # Keep corresponding review items synchronized
            for r in current_analysis.reviews:
                is_match = False
                if task_id == "task-verify-doc" and "DOC" in r.id.upper():
                    is_match = True
                elif task_id == "task-3" and r.id.upper() == "REV-001":
                    is_match = True
                elif task_id == "task-5" and r.id.upper() == "REV-002":
                    is_match = True
                elif task_id == "task-6" and r.id.upper() == "REV-003":
                    is_match = True
                elif r.source_reference and task.source_reference and r.source_reference == task.source_reference:
                    is_match = True

                if is_match:
                    if payload.status == "Completed":
                        r.status = "Approved"
                    elif payload.status == "Needs Review":
                        r.status = "Needs Review"
                    elif payload.status == "Pending":
                        if r.status == "Needs Review":
                            r.status = "Needs Clarification"

            refresh_stats()
            # Add audit log
            current_analysis.audit_logs.append(AuditLog(
                id=f"log-{len(current_analysis.audit_logs) + 1}",
                timestamp="Just now",
                agent_name="Task Coordinator",
                action=f"Task '{task.task_name}' status updated to {payload.status}",
                detail=f"User interaction updated task state.",
                status="Success"
            ))
            return task
    raise HTTPException(status_code=404, detail="Task not found")

@app.get("/api/timeline")
def get_timeline():
    """
    Returns chronological care timeline.
    """
    refresh_stats()
    return current_analysis.timeline

@app.get("/api/providers")
def get_providers(
    specialty: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    facility: Optional[str] = Query(None)
):
    """
    Returns synthetic provider matches with filter support.
    """
    providers = current_analysis.matched_providers or [Provider(**p) for p in SYNTHETIC_PROVIDERS]
    if specialty and specialty != "All":
        providers = [p for p in providers if specialty.lower() in p.specialty.lower()]
    if location and location != "All":
        providers = [p for p in providers if location.lower() in p.location.lower()]
    if facility:
        providers = [p for p in providers if facility.lower() in p.facility.lower()]
    return providers

@app.get("/api/reviews")
def get_reviews():
    """
    Returns items requiring human clinical review.
    """
    return current_analysis.reviews

@app.get("/api/reviews/{review_id}")
def get_review_detail(review_id: str):
    """
    Returns details of a specific review item.
    """
    for r in current_analysis.reviews:
        if r.id.upper() == review_id.upper():
            return r
    raise HTTPException(status_code=404, detail="Review item not found")

@app.put("/api/reviews/{review_id}")
def update_review_item(review_id: str, payload: ReviewUpdate):
    """
    Updates review item status (Approved, Needs Clarification, Resolved).
    """
    raw_status = (payload.status or "").strip()
    if raw_status in ["Approved", "Approve Extraction", "approve", "approved"]:
        new_status = "Approved"
    elif raw_status in ["Needs Clarification", "Request Clarification", "Clarification Requested", "clarification requested", "clarify"]:
        new_status = "Needs Clarification"
    elif raw_status in ["Resolved", "Mark Resolved", "resolve", "resolved"]:
        new_status = "Resolved"
    elif raw_status in ["Needs Review", "needs review"]:
        new_status = "Needs Review"
    else:
        new_status = raw_status
    clean_target = review_id.upper().replace("-", "").replace("_", "")
    for r in current_analysis.reviews:
        r_clean = r.id.upper().replace("-", "").replace("_", "")
        if r.id.upper() == review_id.upper() or r_clean == clean_target:
            r.status = new_status
            if payload.reviewer_notes:
                r.reviewer_notes = payload.reviewer_notes
            refresh_stats()
            # Add audit log
            current_analysis.audit_logs.append(AuditLog(
                id=f"log-{len(current_analysis.audit_logs) + 1}",
                timestamp="Just now",
                agent_name="Human Review Coordinator",
                action=f"Review '{r.issue}' marked {new_status}",
                detail=f"Clinical reviewer resolved ambiguity to '{new_status}'.",
                status="Success"
            ))
            return r

    # Fallback if only 1 review exists in the active analysis
    if len(current_analysis.reviews) == 1:
        r = current_analysis.reviews[0]
        r.status = new_status
        if payload.reviewer_notes:
            r.reviewer_notes = payload.reviewer_notes
        refresh_stats()
        current_analysis.audit_logs.append(AuditLog(
            id=f"log-{len(current_analysis.audit_logs) + 1}",
            timestamp="Just now",
            agent_name="Human Review Coordinator",
            action=f"Review '{r.issue}' marked {new_status}",
            detail=f"Clinical reviewer resolved ambiguity to '{new_status}'.",
            status="Success"
        ))
        return r

    raise HTTPException(status_code=404, detail="Review item not found")

@app.get("/api/audit-logs")
def get_audit_logs():
    """
    Returns agentic activity log trail.
    """
    return current_analysis.audit_logs

@app.post("/api/safety/check-query")
def check_safety_query(payload: SafetyCheckRequest) -> SafetyCheckResponse:
    """
    Checks patient questions against strict healthcare safety boundaries.
    """
    return orchestrator.safety_guard.evaluate_query(payload.query, payload.context)

class SafetyEscalateRequest(BaseModel):
    query: str
    explanation: Optional[str] = "Patient asked clinically sensitive question requiring clinical oversight."

@app.post("/api/safety/escalate")
def escalate_safety_query(payload: SafetyEscalateRequest):
    """
    Escalates a clinically sensitive patient inquiry into the Human Review Center queue.
    """
    new_id = f"REV-SAF-{len(current_analysis.reviews) + 1:03d}"
    item = ReviewItem(
        id=new_id,
        patient_id=current_patient.id,
        patient_name=current_patient.name,
        issue=f"Clinically Sensitive Inquiry: {payload.query[:60]}...",
        priority="HIGH",
        reason=payload.explanation or "Direct patient inquiry regarding medication adjustment or symptoms requires clinical oversight.",
        status="Needs Review",
        source_reference="Patient Portal Safety Escalation",
        source_document="Patient Portal Inquiry",
        source_page="1",
        source_section="Clinical Communication",
        source_text=f"Patient Query: \"{payload.query}\"",
        original_text=payload.query,
        ai_interpretation="Patient inquired about modifying treatment/medications or clinical symptoms. Escalated to clinical reviewer."
    )
    current_analysis.reviews.append(item)
    refresh_stats()
    current_analysis.audit_logs.append(AuditLog(
        id=f"log-{len(current_analysis.audit_logs) + 1}",
        timestamp="Just now",
        agent_name="Safety Guardrail Agent",
        action=f"Escalated sensitive inquiry '{payload.query[:40]}' to Human Review",
        detail="Safety escalation created new review item in clinical queue.",
        status="Warning"
    ))
    return item
