import httpx
import os
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_careflow_suite():
    passed = 0
    failed = 0
    
    def assert_eq(actual, expected, msg=""):
        nonlocal passed, failed
        if actual == expected:
            passed += 1
            print(f"  [PASS] {msg} -> {actual}")
        else:
            failed += 1
            print(f"  [FAIL] {msg} -> Expected {expected}, got {actual}")

    def assert_true(cond, msg=""):
        nonlocal passed, failed
        if cond:
            passed += 1
            print(f"  [PASS] {msg}")
        else:
            failed += 1
            print(f"  [FAIL] {msg}")

    print("==========================================================")
    print("      CAREWFLOW AI COMPREHENSIVE END-TO-END TEST SUITE     ")
    print("==========================================================")
    
    with httpx.Client(base_url=BASE_URL, timeout=30.0) as client:
        # 1. Health & Root Check
        print("\n1. Root & Health Check")
        res = client.get("/")
        assert_eq(res.status_code, 200, "Root status code")
        data = res.json()
        assert_eq(data.get("app"), "CareFlow AI", "App name")
        assert_eq(data.get("status"), "Online", "Status online")

        # 2. Reset Environment
        print("\n2. Reset Environment")
        res = client.post("/api/reset")
        assert_eq(res.status_code, 200, "Reset status code")
        stats = res.json().get("summary_stats", {})
        assert_true(stats.get("total_tasks", 0) > 0, f"Default total tasks ({stats.get('total_tasks')})")

        # 3. Patient Info & Updates
        print("\n3. Patient API")
        res = client.get("/api/patient")
        assert_eq(res.status_code, 200, "Get patient status")
        pat = res.json()
        assert_eq(pat.get("name"), "Alex Johnson", "Initial patient name")

        res = client.put("/api/patient", json={"name": "Jane Doe", "age": 45, "hospital": "City Memorial"})
        assert_eq(res.status_code, 200, "Update patient status")
        updated_pat = res.json()
        assert_eq(updated_pat.get("name"), "Jane Doe", "Updated patient name")
        assert_eq(updated_pat.get("age"), 45, "Updated patient age")

        # Reset back to Alex Johnson
        client.put("/api/patient", json={"name": "Alex Johnson", "age": 52, "hospital": "Synthetic General Hospital"})

        # 4. Authentication (Mock Patient & Coordinator)
        print("\n4. Auth API (Login & Register)")
        login_res = client.post("/api/auth/login", json={"email": "nurse.sarah@hospital.org", "password": "pass", "role": "coordinator"})
        assert_eq(login_res.status_code, 200, "Coordinator login")
        assert_eq(login_res.json()["user"]["role"], "coordinator", "Role check")

        reg_res = client.post("/api/auth/register", json={"name": "Robert Smith", "email": "robert@example.com", "password": "pass", "age": 60})
        assert_eq(reg_res.status_code, 200, "Patient register")
        assert_eq(reg_res.json()["user"]["name"], "Robert Smith", "Registered user name")

        # Reset
        client.post("/api/reset")

        # 5. Synthetic Scenarios
        print("\n5. Built-in Scenarios")
        res = client.get("/api/scenarios")
        assert_eq(res.status_code, 200, "Get scenarios status")
        scenarios = res.json()
        assert_eq(len(scenarios), 5, "Total scenarios count is 5")

        for sc in scenarios:
            sc_id = sc["id"]
            print(f"  Testing analysis for {sc_id} ({sc['title']})...")
            an_res = client.post("/api/discharge/analyze", json={"scenario_id": sc_id, "raw_text": ""})
            assert_eq(an_res.status_code, 200, f"Analyze {sc_id} status")
            an_data = an_res.json()
            assert_true(len(an_data.get("tasks", [])) > 0, f"{sc_id} generated tasks ({len(an_data.get('tasks', []))})")
            assert_true(len(an_data.get("timeline", [])) > 0, f"{sc_id} generated timeline items ({len(an_data.get('timeline', []))})")

        # 6. PDF Upload Test
        print("\n6. PDF Document Upload")
        pdf_path = os.path.join("backend", "data", "sample_discharge_alex_johnson.pdf")
        assert_true(os.path.exists(pdf_path), "Sample PDF file exists on disk")
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()
        res = client.post(
            "/api/discharge/upload",
            files={"file": ("sample_discharge_alex_johnson.pdf", pdf_bytes, "application/pdf")},
            data={"patient_name": "Alex Johnson", "patient_age": 52}
        )
        assert_eq(res.status_code, 200, "PDF Upload & Extraction status code")
        pdf_analysis = res.json()
        assert_true(len(pdf_analysis.get("tasks", [])) > 0, f"Extracted tasks from PDF: {len(pdf_analysis.get('tasks', []))}")
        assert_true(len(pdf_analysis.get("timeline", [])) > 0, f"Extracted timeline from PDF: {len(pdf_analysis.get('timeline', []))}")

        # 7. Dashboard API
        print("\n7. Dashboard API")
        res = client.get("/api/dashboard")
        assert_eq(res.status_code, 200, "Get dashboard status")
        dash = res.json()
        assert_true("patient" in dash, "Dashboard contains patient")
        assert_true("summary_stats" in dash, "Dashboard contains summary_stats")
        assert_true("next_actions" in dash, "Dashboard contains next_actions")
        assert_true("timeline_preview" in dash, "Dashboard contains timeline_preview")

        # 8. Tasks API & Status Updates
        print("\n8. Tasks API & Filtering")
        res = client.get("/api/tasks")
        assert_eq(res.status_code, 200, "Get all tasks")
        all_tasks = res.json()
        assert_true(len(all_tasks) > 0, f"Tasks count: {len(all_tasks)}")
        first_task_id = all_tasks[0]["id"]

        # Filter by category
        res = client.get("/api/tasks?category=Medication")
        assert_eq(res.status_code, 200, "Filter tasks by Medication")
        
        # Update status
        res = client.put(f"/api/tasks/{first_task_id}/status", json={"status": "Completed"})
        assert_eq(res.status_code, 200, "Update task status to Completed")
        assert_eq(res.json().get("status"), "Completed", "Task status verified")

        res = client.put(f"/api/tasks/{first_task_id}/status", json={"status": "Pending"})
        assert_eq(res.status_code, 200, "Update task status back to Pending")

        # 9. Care Timeline API
        print("\n9. Timeline API")
        res = client.get("/api/timeline")
        assert_eq(res.status_code, 200, "Get timeline status")
        timeline = res.json()
        assert_true(len(timeline) > 0, f"Timeline entries count: {len(timeline)}")

        # 10. Provider Finder API (Agent 6)
        print("\n10. Provider Finder API (Agent 6)")
        res = client.get("/api/providers")
        assert_eq(res.status_code, 200, "Get all providers")
        providers = res.json()
        assert_true(len(providers) > 0, f"Provider count: {len(providers)}")

        res = client.get("/api/providers?specialty=Cardiology")
        assert_eq(res.status_code, 200, "Filter providers by Cardiology")
        cardio = res.json()
        assert_true(all("cardio" in p["specialty"].lower() for p in cardio), "All filtered providers match Cardiology")
        # 11. Human Review Center API
        print("\n11. Human Review Center API")
        # Reset to ensure canonical reviews are present
        client.post("/api/reset")
        res = client.get("/api/reviews")
        assert_eq(res.status_code, 200, "Get reviews status")
        reviews = res.json()
        assert_true(len(reviews) > 0, f"Review items count: {len(reviews)}")
        first_rev_id = reviews[0]["id"]

        res = client.get(f"/api/reviews/{first_rev_id}")
        assert_eq(res.status_code, 200, f"Get single review {first_rev_id}")

        res = client.put(f"/api/reviews/{first_rev_id}", json={"status": "Approved", "reviewer_notes": "Verified with Attending MD"})
        assert_eq(res.status_code, 200, f"Update review {first_rev_id} status")
        assert_eq(res.json().get("status"), "Approved", "Review marked Approved")

        # 12. Safety Guardrail API (Agent 5)
        print("\n12. Safety Guardrail API (Agent 5)")
        # Test sensitive query
        res = client.post("/api/safety/check-query", json={"query": "Can I stop taking Clopidogrel because of bruising?"})
        assert_eq(res.status_code, 200, "Check sensitive query")
        s_data = res.json()
        assert_eq(s_data.get("is_sensitive"), True, "Flagged as sensitive")
        assert_eq(s_data.get("requires_escalation"), True, "Requires clinical escalation")
        assert_true("CareFlow AI cannot" in s_data.get("recommended_action", ""), "Boundary statement present")

        # Test non-sensitive query
        res = client.post("/api/safety/check-query", json={"query": "When is my laboratory appointment scheduled?"})
        assert_eq(res.status_code, 200, "Check normal query")
        s_data_normal = res.json()
        assert_eq(s_data_normal.get("is_sensitive"), False, "Normal query not flagged sensitive")

        # 13. AI Activity / Audit Trail API
        print("\n13. AI Activity / Audit Trail API")
        res = client.get("/api/audit-logs")
        assert_eq(res.status_code, 200, "Get audit logs")
        logs = res.json()
        assert_true(len(logs) > 0, f"Audit logs present: {len(logs)} logs")

    print("\n==========================================================")
    print(f"RESULTS: {passed} PASSED, {failed} FAILED")
    print("==========================================================")
    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    test_careflow_suite()
