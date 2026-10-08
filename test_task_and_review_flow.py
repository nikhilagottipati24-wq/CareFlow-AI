import httpx
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_flow():
    client = httpx.Client(base_url=BASE_URL, timeout=15.0)

    print("=================================================================")
    print("  VERIFYING COMPLETED TASKS, PENDINGS, AND REVIEWS WORKFLOW")
    print("=================================================================")

    # Step 1: Reset to default state
    print("\n--- 1. Resetting State to Default Scenario 1 ---")
    res = client.post("/api/reset")
    assert res.status_code == 200, f"Reset failed: {res.text}"
    stats = res.json()["summary_stats"]
    print("Initial summary stats:", stats)
    assert stats["total_tasks"] == 10
    assert stats["pending"] == 5
    assert stats["completed"] == 2
    assert stats["needs_review"] == 3
    print("  [OK] Default stats match: 5 Pending + 2 Completed + 3 Needs Review = 10 Total")

    # Step 2: Verify tasks endpoint and status filtering
    print("\n--- 2. Testing Task Status Filters ---")
    all_tasks = client.get("/api/tasks").json()
    assert len(all_tasks) == 10, f"Expected 10 tasks, got {len(all_tasks)}"
    
    pending_tasks = client.get("/api/tasks?status=Pending").json()
    assert len(pending_tasks) == 5, f"Expected 5 pending, got {len(pending_tasks)}"
    assert all(t["status"] == "Pending" for t in pending_tasks), "All filtered tasks must be Pending"
    print(f"  [OK] /api/tasks?status=Pending returned exactly {len(pending_tasks)} pending tasks")

    completed_tasks = client.get("/api/tasks?status=Completed").json()
    assert len(completed_tasks) == 2, f"Expected 2 completed, got {len(completed_tasks)}"
    assert all(t["status"] == "Completed" for t in completed_tasks), "All filtered tasks must be Completed"
    print(f"  [OK] /api/tasks?status=Completed returned exactly {len(completed_tasks)} completed tasks")

    review_tasks = client.get("/api/tasks?status=Needs Review").json()
    assert len(review_tasks) == 3, f"Expected 3 in review, got {len(review_tasks)}"
    assert all(t["status"] == "Needs Review" for t in review_tasks), "All filtered tasks must be Needs Review"
    print(f"  [OK] /api/tasks?status=Needs Review returned exactly {len(review_tasks)} review tasks")

    # Step 3: Toggling a Pending task to Completed
    print("\n--- 3. Toggling a Pending task to Completed ---")
    t1 = pending_tasks[0]
    print(f"  Toggling task '{t1['task_name']}' ({t1['id']}) to Completed...")
    res = client.put(f"/api/tasks/{t1['id']}/status", json={"status": "Completed"})
    assert res.status_code == 200
    assert res.json()["status"] == "Completed"

    # Verify counts on dashboard
    d1 = client.get("/api/dashboard").json()
    stats1 = d1["summary_stats"]
    print("  Updated dashboard stats:", stats1)
    assert stats1["pending"] == 4, f"Expected 4 pending, got {stats1['pending']}"
    assert stats1["completed"] == 3, f"Expected 3 completed, got {stats1['completed']}"
    assert stats1["needs_review"] == 3, f"Expected 3 review, got {stats1['needs_review']}"
    print("  [OK] Pending decreased to 4, Completed increased to 3")

    # Step 4: Toggling Completed task back to Pending
    print("\n--- 4. Toggling Completed task back to Pending ---")
    res = client.put(f"/api/tasks/{t1['id']}/status", json={"status": "Pending"})
    assert res.status_code == 200
    assert res.json()["status"] == "Pending"
    d2 = client.get("/api/dashboard").json()
    stats2 = d2["summary_stats"]
    assert stats2["pending"] == 5
    assert stats2["completed"] == 2
    print("  [OK] Successfully toggled back to Pending")

    # Step 5: Testing Human Review Workflow
    print("\n--- 5. Testing Human Review Workflow (Approving, Resolving, Reopening) ---")
    reviews = client.get("/api/reviews").json()
    assert len(reviews) == 3
    print(f"  Found {len(reviews)} review items: {[r['id'] for r in reviews]}")

    # Approve REV-001 (Medication duration unspecified -> task-3)
    print("  Approving REV-001 ('Medication duration unspecified')...")
    res = client.put("/api/reviews/REV-001", json={"status": "Approved", "reviewer_notes": "Prescription verified with cardiology attending for 30-day supply."})
    assert res.status_code == 200
    assert res.json()["status"] == "Approved"

    d3 = client.get("/api/dashboard").json()
    stats3 = d3["summary_stats"]
    print("  Stats after REV-001 Approved:", stats3)
    assert stats3["needs_review"] == 2, f"Expected 2 review items, got {stats3['needs_review']}"
    assert stats3["completed"] == 3, f"Expected 3 completed tasks, got {stats3['completed']}"
    assert d3["attention_required"]["count"] == 2
    print("  [OK] REV-001 resolved; task-3 marked Completed; active reviews down to 2")

    # Mark Resolved on REV-002 (Follow-up date missing -> task-5)
    print("  Resolving REV-002 ('Follow-up date missing')...")
    res = client.put("/api/reviews/REV-002", json={"status": "Resolved", "reviewer_notes": "Scheduled cardiology visit for Oct 21, 2026."})
    assert res.status_code == 200
    assert res.json()["status"] == "Resolved"

    d4 = client.get("/api/dashboard").json()
    stats4 = d4["summary_stats"]
    print("  Stats after REV-002 Resolved:", stats4)
    assert stats4["needs_review"] == 1
    assert stats4["completed"] == 4
    print("  [OK] REV-002 resolved; active reviews down to 1")

    # Request Clarification on REV-003 (Conflicting follow-up dates -> task-6)
    print("  Requesting clarification on REV-003 ('Conflicting follow-up dates')...")
    res = client.put("/api/reviews/REV-003", json={"status": "Needs Clarification", "reviewer_notes": "Awaiting attending note confirmation between 2-week staple removal vs 6-week xray."})
    assert res.status_code == 200
    assert res.json()["status"] == "Needs Clarification"

    d5 = client.get("/api/dashboard").json()
    stats5 = d5["summary_stats"]
    print("  Stats after REV-003 Clarification Requested:", stats5)
    assert stats5["needs_review"] == 0, f"Expected 0 active Needs Review items, got {stats5['needs_review']}"
    assert stats5["pending"] == 6, f"Expected 6 pending, got {stats5['pending']}"
    assert stats5["completed"] == 4, f"Expected 4 completed, got {stats5['completed']}"
    assert d5["attention_required"]["has_items"] == False, "Attention banner should be clear when 0 items need review"
    print("  [OK] Attention banner cleared! 0 items in active review queue")

    # Step 6: Test Reopening a review item
    print("\n--- 6. Testing Reopening a Review Item ---")
    res = client.put("/api/reviews/REV-003", json={"status": "Needs Review", "reviewer_notes": "Reopened after second read."})
    assert res.status_code == 200
    assert res.json()["status"] == "Needs Review"
    d6 = client.get("/api/dashboard").json()
    assert d6["summary_stats"]["needs_review"] == 1
    assert d6["attention_required"]["has_items"] == True
    print("  [OK] Reopened REV-003 back to Needs Review cleanly")

    # Step 7: Timeline synchronization
    print("\n--- 7. Testing Timeline Synchronization ---")
    timeline = client.get("/api/timeline").json()
    assert len(timeline) > 0
    print(f"  Timeline contains {len(timeline)} chronological events")
    for evt in timeline:
        print(f"    - [{evt['status']}] {evt['date']}: {evt['title']}")

    print("\n=================================================================")
    print("  ALL COMPLETED TASK, PENDING, AND REVIEW TESTS PASSED (100%)!")
    print("=================================================================")

if __name__ == "__main__":
    test_flow()
