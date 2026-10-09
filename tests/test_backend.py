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

