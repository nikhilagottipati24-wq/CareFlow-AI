import io
import csv
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

import pymupdf as fitz

from backend.app.database.store import db_store
from backend.app.schemas.models import (
    TaskStatusUpdate,
    TaskModel,
    ReviewUpdate,
    ReviewModel,
    DischargeSummaryInput,
    ProviderModel,
    PatientUpdate
)
from backend.app.analytics.engine import (
    calculate_summary_metrics,
    get_task_status_distribution,
    get_completion_trend,
    get_tasks_by_category,
    get_upcoming_followups,
    get_weekly_task_progress,
    get_review_issues_analytics,
    get_ai_processing_activity
)
from backend.app.agents.orchestrator import orchestrator

app = FastAPI(
    title="CareFlow AI - Agentic Hospital Discharge & Follow-up Coordinator",
    description="Full-stack healthcare coordination and analytics API",
    version="1.0.0"
)

# Enable CORS for Vite dev server and local clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "app": "CareFlow AI",
        "status": "online",
        "mode": "Synthetic Data Mode",
        "scenario": db_store.current_scenario_id,
        "responsible_ai_disclaimer": "Synthetic demo prototype. No clinical diagnosis or medical treatment provided."
    }

# --- PATIENT PROFILE ---

@app.get("/api/patient")
def get_patient():
    return db_store.patient

@app.put("/api/patient")
def update_patient(payload: PatientUpdate):
    updated = db_store.update_patient(payload.name, payload.age)
    return {
        "message": "Patient profile updated successfully",
        "patient": updated
    }


# --- DISCHARGE UPLOAD & ANALYSIS ---

@app.post("/api/discharge/upload")
async def upload_discharge_summary(file: UploadFile = File(...)):
    filename = file.filename or "unknown.txt"
    content = await file.read()
    extracted_text = ""

    try:
        if filename.lower().endswith(".pdf"):
            # Use PyMuPDF (fitz)
            doc = fitz.open(stream=content, filetype="pdf")
            text_parts = []
            for page in doc:
                text_parts.append(page.get_text())
            extracted_text = "\n".join(text_parts)
            doc.close()
        else:
            extracted_text = content.decode("utf-8", errors="replace")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting text from document: {str(e)}")

    doc_id = f"doc-{uuid.uuid4().hex[:8]}"
    db_store.discharge_documents.append({
        "id": doc_id,
        "filename": filename,
        "text": extracted_text,
        "created_at": datetime.now().isoformat() + "Z"
    })

    # Log AI Activity
    db_store.ai_activity_logs.append({
        "id": f"log-{uuid.uuid4().hex[:8]}",
        "event_type": "Document uploaded",
        "description": f"File '{filename}' ({len(extracted_text)} characters) uploaded and parsed with PyMuPDF.",
        "reference": doc_id,
        "agent": "Document Extraction Agent",
        "timestamp": datetime.now().isoformat() + "Z"
    })

    return {
        "document_id": doc_id,
        "filename": filename,
        "character_count": len(extracted_text),
        "text_preview": extracted_text[:500],
        "full_text": extracted_text
    }

@app.post("/api/discharge/analyze")
async def analyze_discharge_summary(payload: DischargeSummaryInput):
    text = payload.raw_text
    if not text.strip():
        raise HTTPException(status_code=400, detail="Discharge summary text cannot be empty.")

    # Run multi-agent pipeline
    result = orchestrator.process_summary(text, payload.patient_id or "demo-patient-001")

    # If new tasks or reviews were generated, append to shared store
    if result["tasks"]:
        db_store.tasks.extend(result["tasks"])
    if result["reviews"]:
        db_store.reviews.extend(result["reviews"])

    # Log to AI Activity
    now_iso = datetime.now().isoformat() + "Z"
    db_store.ai_activity_logs.append({
        "id": f"log-{uuid.uuid4().hex[:8]}",
        "event_type": "Document processed",
        "description": f"Successfully analyzed discharge summary. Created {len(result['tasks'])} tasks and flagged {len(result['reviews'])} review items.",
        "reference": f"ANALYSIS-{uuid.uuid4().hex[:6]}",
        "agent": "Agent Orchestrator",
        "timestamp": now_iso
    })

    return {
        "patient": db_store.patient,
        "extracted": result["extracted"],
        "anomalies": result["anomalies"],
        "tasks": result["tasks"],
        "reviews": result["reviews"],
        "stages": result["stages"]
    }

@app.get("/api/discharge/{id}")
def get_discharge_document(id: str):
    for doc in db_store.discharge_documents:
        if doc["id"] == id:
            return doc
    raise HTTPException(status_code=404, detail="Discharge document not found.")

# --- TASKS ---

@app.get("/api/tasks")
def get_tasks(status: Optional[str] = None, category: Optional[str] = None):
    return db_store.get_tasks(status=status, category=category)

@app.get("/api/tasks/{id}")
def get_task(id: str):
    task = db_store.get_task(id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    return task

@app.put("/api/tasks/{id}/status")
def update_task_status(id: str, update: TaskStatusUpdate):
    if update.status not in ["Pending", "Completed", "Needs Review"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be Pending, Completed, or Needs Review.")
    
    updated_task = db_store.update_task_status(id, update.status)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found.")
    
    # Return updated task and current overall metrics for immediate frontend synchronization
    summary = calculate_summary_metrics()
    return {
        "task": updated_task,
        "summary": summary
    }

# --- TIMELINE ---

@app.get("/api/timeline")
def get_timeline():
    # Sort scheduled items by due_date ascending
    tasks = db_store.tasks
    scheduled = []
    unscheduled = []

    for t in tasks:
        if t.get("due_date"):
            scheduled.append(t)
        else:
            unscheduled.append(t)

    scheduled.sort(key=lambda x: x["due_date"])

    return {
        "patient": db_store.patient,
        "scheduled": scheduled,
        "unscheduled": unscheduled
    }

# --- PROVIDERS ---

@app.get("/api/providers")
def get_providers(
    search: Optional[str] = None,
    specialty: Optional[str] = None,
    location: Optional[str] = None,
    facility: Optional[str] = None
):
    providers = db_store.providers
    if search:
        s = search.lower()
        providers = [
            p for p in providers 
            if s in p["name"].lower() or s in p["specialty"].lower() or s in p["facility"].lower()
        ]
    if specialty and specialty.lower() != "all":
        providers = [p for p in providers if p["specialty"].lower() == specialty.lower()]
    if location and location.lower() != "all":
        providers = [p for p in providers if location.lower() in p["location"].lower()]
    if facility and facility.lower() != "all":
        providers = [p for p in providers if facility.lower() in p["facility"].lower()]

    return {
        "providers": providers,
        "disclaimer": "Provider matches are based on synthetic data and do not guarantee availability, suitability, or clinical appropriateness."
    }

# --- REVIEW CENTER ---

@app.get("/api/reviews")
def get_reviews(issue_type: Optional[str] = None, status: Optional[str] = None):
    return db_store.get_reviews(issue_type=issue_type, status=status)

@app.get("/api/reviews/{id}")
def get_review(id: str):
    rev = db_store.get_review(id)
    if not rev:
        raise HTTPException(status_code=404, detail="Review item not found.")
    return rev

@app.put("/api/reviews/{id}")
def update_review(id: str, update: ReviewUpdate):
    if update.status not in ["Open", "Resolved", "Approved", "Rejected"]:
        raise HTTPException(status_code=400, detail="Invalid review status.")
    
    rev = db_store.update_review(id, update.status, update.resolution_notes)
    if not rev:
        raise HTTPException(status_code=404, detail="Review item not found.")
    
    return {
        "review": rev,
        "summary": calculate_summary_metrics()
    }

# --- ANALYTICS ---

@app.get("/api/analytics/summary")
def analytics_summary(
    date_range: Optional[str] = Query("all"),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    return calculate_summary_metrics(date_range=date_range, category=category, status=status)

@app.get("/api/analytics/task-status")
def analytics_task_status(category: Optional[str] = Query(None)):
    return get_task_status_distribution(category=category)

@app.get("/api/analytics/completion-trend")
def analytics_completion_trend(date_range: Optional[str] = Query("30d")):
    return get_completion_trend(date_range=date_range or "30d")

@app.get("/api/analytics/task-categories")
def analytics_task_categories(status: Optional[str] = Query(None)):
    return get_tasks_by_category(status=status)

@app.get("/api/analytics/upcoming-followups")
def analytics_upcoming_followups(days: Optional[int] = Query(14)):
    return get_upcoming_followups(days_ahead=days or 14)

@app.get("/api/analytics/weekly-progress")
def analytics_weekly_progress():
    return get_weekly_task_progress()

@app.get("/api/analytics/review-issues")
def analytics_review_issues():
    return get_review_issues_analytics()

@app.get("/api/analytics/ai-activity")
def analytics_ai_activity():
    return get_ai_processing_activity()

@app.get("/api/analytics/export")
def export_analytics_csv(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    tasks = db_store.get_tasks(status=status, category=category)
    is_filtered = bool(category or status)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header metadata
    writer.writerow(["# CareFlow AI Synthetic Analytics Export"])
    writer.writerow([f"# Export Timestamp: {datetime.now().isoformat()}Z"])
    writer.writerow([f"# Filter Applied: {'Yes (Category: ' + str(category) + ', Status: ' + str(status) + ')' if is_filtered else 'No (Full Dataset)'}"])
    writer.writerow([f"# Patient: {db_store.patient.get('name')} (ID: {db_store.patient.get('id')})"])
    writer.writerow([])
    
    # Column headers
    writer.writerow([
        "Task ID",
        "Title",
        "Category",
        "Task Type",
        "Priority",
        "Status",
        "Due Date",
        "Completed At",
        "Source Reference",
        "Description"
    ])
    
    for t in tasks:
        writer.writerow([
            t.get("id"),
            t.get("title"),
            t.get("category"),
            t.get("task_type"),
            t.get("priority"),
            t.get("status"),
            t.get("due_date") or "Unscheduled",
            t.get("completed_at") or "",
            t.get("source_reference"),
            t.get("description")
        ])

    output.seek(0)
    filename = f"careflow_tasks_{'filtered' if is_filtered else 'all'}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# --- SCENARIOS ---

@app.post("/api/scenarios/{id}/switch")
def switch_scenario(id: str):
    if id not in ["scenario-1", "scenario-2", "scenario-3", "scenario-4", "scenario-5"]:
        raise HTTPException(status_code=400, detail="Invalid scenario ID. Must be scenario-1 through scenario-5.")
    
    db_store.load_scenario(id)
    return {
        "message": f"Successfully activated {id}",
        "scenario_id": id,
        "patient": db_store.patient,
        "summary": calculate_summary_metrics()
    }

# --- AI ACTIVITY LOGS ---

@app.get("/api/activity")
def get_activity_logs():
    return {
        "logs": sorted(db_store.ai_activity_logs, key=lambda x: x["timestamp"], reverse=True),
        "total_events": len(db_store.ai_activity_logs)
    }
