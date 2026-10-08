import os
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models.schemas import (
    Patient, PatientUpdate, Task, ReviewItem, Provider, DischargeDocument, AIActivityLog,
    AnalysisRequest, TaskStatusUpdate, ReviewStatusUpdate, SafetyCheckRequest, SafetyCheckResponse
)
from database.db import db
from document_processor.pdf_parser import DocumentParser
from data.synthetic_scenarios import SCENARIOS

app = FastAPI(
    title="CareFlow AI API",
    description="Agentic Hospital Discharge & Follow-up Coordinator Backend",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server (e.g. localhost:5173, localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "service": "CareFlow AI",
        "tagline": "Turn complex discharge instructions into a clear, trackable care plan.",
        "status": "online",
        "mode": "Synthetic Data Mode",
        "patient": db.get_patient().name
    }

@app.get("/api/health")
def health():
    return {"status": "ok", "language": "English only"}

# 1. Patient Info
@app.get("/api/patient", response_model=Patient)
def get_patient():
    return db.get_patient()

@app.put("/api/patient", response_model=Patient)
def update_patient(payload: PatientUpdate):
    """
    Updates the synthetic patient profile (name, age, etc.)
    """
    updated = db.update_patient(payload.model_dump(exclude_unset=True))
    return updated

# 2. Discharge Summary Endpoints
@app.post("/api/discharge/upload")
async def upload_discharge_summary(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None)
):
    """
    Accepts synthetic discharge summary via PDF file upload or direct text.
    Uses PyMuPDF (fitz) for PDF extraction.
    """
    if file:
        file_bytes = await file.read()
        file_name = file.filename
        if file_name.lower().endswith(".pdf"):
            parsed = DocumentParser.parse_pdf(file_bytes, file_name=file_name)
        else:
            text = file_bytes.decode("utf-8", errors="ignore")
            parsed = DocumentParser.parse_text(text, file_name=file_name)
    elif raw_text:
        parsed = DocumentParser.parse_text(raw_text, file_name="Pasted_Discharge_Summary.txt")
    else:
        raise HTTPException(status_code=400, detail="Either a file or raw_text must be provided.")

    return {
        "message": "Document uploaded successfully",
        "file_name": parsed["file_name"],
        "total_pages": parsed["total_pages"],
        "text_preview": parsed["full_text"][:500],
        "full_text": parsed["full_text"],
        "detected_sections": parsed["detected_sections"]
    }

@app.post("/api/discharge/analyze")
def analyze_discharge_summary(request: AnalysisRequest):
    """
    Runs multi-agent coordination pipeline across the 6 specialized agents.
    """
    raw_text = request.raw_text
    file_name = request.file_name or "Discharge_Summary.txt"
    
    # If a scenario ID was selected, load that scenario
    if request.scenario_id and request.scenario_id in SCENARIOS:
        scenario = SCENARIOS[request.scenario_id]
        raw_text = scenario["raw_text"]
        file_name = scenario["file_name"]

    if not raw_text or not raw_text.strip():
        raise HTTPException(status_code=400, detail="Cannot analyze empty discharge summary.")

    result = db.orchestrator.process_discharge_summary(raw_text, file_name=file_name)
    
    # Update active database state
    db.current_document = result["document"]
    db.appointments = result["appointments"]
    db.tests = result["tests"]
    db.medications = result["medications"]
    db.care_instructions = result["care_instructions"]
    db.warning_signs = result["warning_signs"]
    db.tasks = result["tasks"]
    db.reviews = result["review_items"]
    db.activity_logs = result["activity_logs"]

    return {
        "status": "success",
        "document_id": result["document"].id,
        "actionable_items_count": result["total_actionable_items"],
        "appointments_count": len(result["appointments"]),
        "tests_count": len(result["tests"]),
        "medications_count": len(result["medications"]),
        "reviews_count": len(result["review_items"]),
        "tasks": result["tasks"],
        "appointments": result["appointments"],
        "tests": result["tests"],
        "medications": result["medications"],
        "care_instructions": result["care_instructions"],
        "warning_signs": result["warning_signs"],
        "reviews": result["review_items"],
        "activity_logs": result["activity_logs"]
    }

@app.get("/api/discharge/{id}")
def get_discharge_summary(id: str):
    doc = db.get_current_document()
    if not doc:
        raise HTTPException(status_code=404, detail="No active discharge document found.")
    return {
        "document": doc,
        "appointments": db.appointments,
        "tests": db.tests,
        "medications": db.medications,
        "care_instructions": db.care_instructions,
        "warning_signs": db.warning_signs
    }

# 3. Tasks Endpoints
@app.get("/api/tasks", response_model=List[Task])
def get_tasks(
    status: Optional[str] = Query(None, description="Pending | Completed | Needs Review"),
    category: Optional[str] = Query(None, description="Medication | Appointment | Test | Care | Referral")
):
    return db.get_tasks(status=status, category=category)

@app.put("/api/tasks/{task_id}/status", response_model=Task)
def update_task_status(task_id: str, update: TaskStatusUpdate):
    updated = db.update_task_status(task_id, update.status)
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated

# 4. Timeline
@app.get("/api/timeline")
def get_timeline():
    return db.get_timeline()

# 5. Providers
@app.get("/api/providers")
def get_providers(
    specialty: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    facility: Optional[str] = Query(None)
):
    matches = db.orchestrator.provider_agent.find_matches(
        specialty=specialty,
        location=location,
        facility=facility
    )
    return matches

# 6. Reviews Center Endpoints
@app.get("/api/reviews", response_model=List[ReviewItem])
def get_reviews(status: Optional[str] = Query(None)):
    return db.get_reviews(status=status)

@app.get("/api/reviews/{review_id}", response_model=ReviewItem)
def get_review(review_id: str):
    review = db.get_review_by_id(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review item not found")
    return review

@app.put("/api/reviews/{review_id}", response_model=ReviewItem)
def update_review(review_id: str, update: ReviewStatusUpdate):
    updated = db.update_review(
        review_id=review_id,
        new_status=update.status,
        notes=update.resolution_notes,
        duration=update.duration
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Review item not found")
    return updated

# 7. AI Activity Logs
@app.get("/api/activity", response_model=List[AIActivityLog])
def get_activities():
    return db.get_activities()

# 8. Synthetic Scenarios
@app.get("/api/scenarios")
def list_scenarios():
    return [
        {
            "id": s["id"],
            "title": s["title"],
            "subtitle": s["subtitle"],
            "file_name": s["file_name"],
            "raw_text": s["raw_text"]
        }
        for s in SCENARIOS.values()
    ]

@app.post("/api/scenarios/{scenario_id}/load")
def load_scenario(scenario_id: str):
    if scenario_id not in SCENARIOS:
        raise HTTPException(status_code=404, detail="Scenario not found")
    is_initial = (scenario_id == "scenario_1")
    db.load_scenario(scenario_id, initial_dashboard_state=is_initial)
    return {
        "message": f"Loaded {SCENARIOS[scenario_id]['title']}",
        "scenario_id": scenario_id,
        "tasks_count": len(db.tasks),
        "reviews_count": len(db.reviews)
    }

# 9. Responsible AI Safety Check Endpoint
@app.post("/api/safety/check", response_model=SafetyCheckResponse)
def check_safety(request: SafetyCheckRequest):
    is_triggered, res = db.orchestrator.safety_agent.evaluate_text_for_clinical_safety(request.query)
    if is_triggered:
        return SafetyCheckResponse(
            is_safe=False,
            escalation_required=True,
            message=res["message"],
            recommended_action=res["action_required"]
        )
    return SafetyCheckResponse(
        is_safe=True,
        escalation_required=False,
        message="Query adheres to safe coordination parameters.",
        recommended_action="Proceed"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
