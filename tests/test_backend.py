import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.store import db_store

client = TestClient(app)

def test_initial_state():
    # Reset to scenario-1
    db_store.load_scenario("scenario-1")
    
    # 1. Root online
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["mode"] == "Synthetic Data Mode"

    # 2. Summary counts: exactly 8 tasks, 5 pending, 2 completed, 1 needs review
    summary_res = client.get("/api/analytics/summary")
    assert summary_res.status_code == 200
    data = summary_res.json()
    assert data["total_tasks"] == 8
    assert data["pending_tasks"] == 5
    assert data["completed_tasks"] == 2
    assert data["needs_review_tasks"] == 1
    assert data["completion_rate"] == 25.0
    # Equation verification
    assert data["total_tasks"] == data["pending_tasks"] + data["completed_tasks"] + data["needs_review_tasks"]

def test_donut_chart_consistency():
    db_store.load_scenario("scenario-1")
    res = client.get("/api/analytics/task-status")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 8
    segments = {s["status"]: s["count"] for s in data["segments"]}
    assert segments["Pending"] == 5
    assert segments["Completed"] == 2
    assert segments["Needs Review"] == 1

def test_task_completion_workflow():
    db_store.load_scenario("scenario-1")
    
    # Mark task-103 (Pending) as Completed
    update_res = client.put("/api/tasks/task-103/status", json={"status": "Completed"})
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["task"]["status"] == "Completed"
    assert updated["task"]["completed_at"] is not None

    # Verify updated summary
    summary_res = client.get("/api/analytics/summary")
    data = summary_res.json()
    assert data["total_tasks"] == 8
    assert data["pending_tasks"] == 4
    assert data["completed_tasks"] == 3
    assert data["needs_review_tasks"] == 1
    assert data["completion_rate"] == 37.5
    assert data["total_tasks"] == data["pending_tasks"] + data["completed_tasks"] + data["needs_review_tasks"]

    # Verify completion history was recorded
    trend_res = client.get("/api/analytics/completion-trend?date_range=30d")
    assert trend_res.status_code == 200

def test_review_resolution():
    db_store.load_scenario("scenario-1")
    
    # Check open reviews
    rev_res = client.get("/api/reviews")
    assert rev_res.status_code == 200
    reviews = rev_res.json()
    assert len(reviews) >= 1
    open_rev = [r for r in reviews if r["status"] == "Open"][0]
    
    # Resolve review
    res = client.put(f"/api/reviews/{open_rev['id']}", json={"status": "Resolved", "resolution_notes": "Order verified with Dr. Lin."})
    assert res.status_code == 200
    assert res.json()["review"]["status"] == "Resolved"
    assert res.json()["summary"]["open_review_items"] == 0

def test_scenario_switching():
    # Switch to Scenario 2
    res = client.post("/api/scenarios/scenario-2/switch")
    assert res.status_code == 200
    assert res.json()["scenario_id"] == "scenario-2"
    
    summary = client.get("/api/analytics/summary").json()
    assert summary["scenario_id"] == "scenario-2"
    assert summary["total_tasks"] == 6

    # Switch back to Scenario 1
    res1 = client.post("/api/scenarios/scenario-1/switch")
    assert res1.status_code == 200
    summary1 = client.get("/api/analytics/summary").json()
    assert summary1["total_tasks"] == 8
    assert summary1["pending_tasks"] == 5
    assert summary1["completed_tasks"] == 2
    assert summary1["needs_review_tasks"] == 1

def test_csv_export():
    db_store.load_scenario("scenario-1")
    res = client.get("/api/analytics/export")
    assert res.status_code == 200
    assert res.headers["content-type"].startswith("text/csv")
    content = res.text
    assert "Task ID" in content
    assert "Pick up Lisinopril" in content

def test_timeline_unscheduled():
    db_store.load_scenario("scenario-1")
    res = client.get("/api/timeline")
    assert res.status_code == 200
    data = res.json()
    assert len(data["scheduled"]) == 7
    assert len(data["unscheduled"]) == 1
    assert data["unscheduled"][0]["due_date"] is None

def test_patient_update():
    db_store.load_scenario("scenario-1")
    # Update name and age
    res = client.put("/api/patient", json={"name": "Alex J. Taylor", "age": 55})
    assert res.status_code == 200
    patient = res.json()["patient"]
    assert patient["name"] == "Alex J. Taylor"
    assert patient["age"] == 55

    # Check that GET returns updated info
    get_res = client.get("/api/patient")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Alex J. Taylor"
    assert get_res.json()["age"] == 55

    # Reset
    client.put("/api/patient", json={"name": "Alex Johnson", "age": 52})

def test_upload_valid_synthetic_pdf():
    import pymupdf
    # Create valid synthetic PDF with selectable text
    doc = pymupdf.open()
    page1 = doc.new_page()
    page1.insert_text((50, 50), "DISCHARGE SUMMARY - SYNTHETIC GENERAL HOSPITAL\nPatient: John Smith\nMedications: Metoprolol 25mg PO daily")
    page2 = doc.new_page()
    page2.insert_text((50, 50), "FOLLOW-UP APPOINTMENTS:\nCardiology clinic in 2 weeks with Dr. Adams.")
    pdf_bytes = doc.tobytes()
    doc.close()

    res = client.post(
        "/api/discharge/upload",
        files={"file": ("discharge_summary.pdf", pdf_bytes, "application/pdf")}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["filename"] == "discharge_summary.pdf"
    assert data["page_count"] == 2
    assert "DISCHARGE SUMMARY" in data["full_text"]
    assert "Metoprolol" in data["full_text"]
    assert "Cardiology clinic" in data["full_text"]
    assert data["character_count"] > 50
    assert len(data["pages"]) == 2
    assert data["pages"][0]["has_text"] is True

def test_upload_valid_txt():
    txt_content = "DISCHARGE SUMMARY\nPatient: Jane Doe\nMedications: Lisinopril 10mg once daily\nFollow-up: Primary Care in 10 days."
    res = client.post(
        "/api/discharge/upload",
        files={"file": ("discharge_note.txt", txt_content.encode("utf-8"), "text/plain")}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["filename"] == "discharge_note.txt"
    assert "Jane Doe" in data["full_text"]
    assert data["character_count"] == len(txt_content)

def test_upload_empty_file():
    # Empty PDF / file rejection
    res = client.post(
        "/api/discharge/upload",
        files={"file": ("empty.pdf", b"", "application/pdf")}
    )
    assert res.status_code == 400
    assert "empty" in res.json()["detail"].lower()

def test_upload_unsupported_file():
    # Unsupported file extension / type
    res = client.post(
        "/api/discharge/upload",
        files={"file": ("report.exe", b"binarycontent", "application/octet-stream")}
    )
    assert res.status_code == 415
    assert "unsupported" in res.json()["detail"].lower()

def test_upload_invalid_corrupted_pdf():
    # Invalid corrupted PDF bytes
    res = client.post(
        "/api/discharge/upload",
        files={"file": ("corrupted.pdf", b"not-a-valid-pdf-stream", "application/pdf")}
    )
    assert res.status_code == 400
    assert "invalid" in res.json()["detail"].lower() or "corrupted" in res.json()["detail"].lower()

def test_upload_pdf_no_extractable_text():
    import pymupdf
    # Create blank PDF without text (simulating image-only scanned document)
    doc = pymupdf.open()
    doc.new_page() # blank page
    pdf_bytes = doc.tobytes()
    doc.close()

    res = client.post(
        "/api/discharge/upload",
        files={"file": ("scanned_blank.pdf", pdf_bytes, "application/pdf")}
    )
    assert res.status_code == 400
    assert "no extractable text" in res.json()["detail"].lower()
    assert "ocr" in res.json()["detail"].lower()

def test_complete_flow_upload_and_analyze():
    db_store.load_scenario("scenario-1")
    initial_task_count = len(db_store.tasks)

    import pymupdf
    doc = pymupdf.open()
    page = doc.new_page()
    summary_text = (
        "DISCHARGE SUMMARY\n"
        "Patient: Robert Evans\n"
        "Medications:\n"
        "- Amlodipine 5mg PO daily\n"
        "Follow-up Appointments:\n"
        "- Nephrology clinic in 14 days\n"
        "Diagnostic Tests:\n"
        "- Comprehensive Metabolic Panel in 7 days\n"
        "Warning Signs:\n"
        "- Seek immediate medical attention if severe headache occurs\n"
    )
    page.insert_text((50, 50), summary_text)
    pdf_bytes = doc.tobytes()
    doc.close()

    # Step 1: Upload and extract text via PyMuPDF
    upload_res = client.post(
        "/api/discharge/upload",
        files={"file": ("robert_discharge.pdf", pdf_bytes, "application/pdf")}
    )
    assert upload_res.status_code == 200
    extracted_text = upload_res.json()["full_text"]
    assert "Amlodipine" in extracted_text

    # Step 2: Separate AI Analysis triggered by user
    analyze_res = client.post(
        "/api/discharge/analyze",
        json={"raw_text": extracted_text, "patient_id": "test-patient-001"}
    )
    assert analyze_res.status_code == 200
    analyze_data = analyze_res.json()
    assert len(analyze_data["extracted"]["medications"]) >= 1
    assert len(analyze_data["tasks"]) >= 1
    # Tasks added to store
    assert len(db_store.tasks) > initial_task_count


