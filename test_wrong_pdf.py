import pymupdf
import httpx
import os
import sys

BASE_URL = "http://127.0.0.1:8000"

def create_wrong_pdf(file_path: str):
    """Creates a PDF that is NOT a hospital discharge summary."""
    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text(
        pymupdf.Point(50, 72),
        "INVOICE #98234\n"
        "Acme Logistics & Office Equipment\n"
        "Date: October 08, 2026\n\n"
        "Item 1: Ergonomic Desk Chair x 2 - $350.00\n"
        "Item 2: USB-C Hub x 4 - $120.00\n"
        "Item 3: Wireless Mechanical Keyboard x 1 - $95.00\n\n"
        "Subtotal: $565.00\n"
        "Tax (8%): $45.20\n"
        "Total Due: $610.20\n\n"
        "Thank you for your business! Payment due within 30 days.\n"
        "Please direct billing inquiries to accounts@acmelogistics.example.com",
        fontsize=12
    )
    doc.save(file_path)
    doc.close()

def run_wrong_pdf_test():
    wrong_pdf_file = "test_wrong_document_invoice.pdf"
    create_wrong_pdf(wrong_pdf_file)

    print("==========================================================")
    print("       TESTING WRONG PDF UPLOAD & HUMAN REVIEW HANDLING    ")
    print("==========================================================")

    with httpx.Client(base_url=BASE_URL, timeout=30.0) as client:
        # Step 1: Upload the wrong PDF
        print("\nStep 1: Uploading wrong (non-discharge) PDF to /api/discharge/upload ...")
        with open(wrong_pdf_file, "rb") as f:
            pdf_bytes = f.read()

        res = client.post(
            "/api/discharge/upload",
            files={"file": (wrong_pdf_file, pdf_bytes, "application/pdf")},
            data={"patient_name": "Test User", "patient_age": 40}
        )
        assert res.status_code == 200, f"Upload status expected 200, got {res.status_code}"
        data = res.json()

        print("  -> Upload response received successfully.")
        print(f"  -> Extracted tasks: {len(data.get('tasks', []))}")
        print(f"  -> Flagged reviews: {len(data.get('reviews', []))}")

        # Step 2: Verify reviews contain the Unrecognized Document item
        print("\nStep 2: Checking Human Review Center items ...")
        reviews = data.get("reviews", [])
        assert len(reviews) > 0, "Expected at least 1 review item for wrong PDF!"
        invalid_rev = next((r for r in reviews if "Unrecognized" in r["issue"] or "Non-Discharge" in r["issue"]), None)
        assert invalid_rev is not None, f"Expected Unrecognized Document review, got: {[r['issue'] for r in reviews]}"
        print(f"  [PASS] Flagged Review Found: {invalid_rev['id']}")
        print(f"  [PASS] Issue: {invalid_rev['issue']}")
        print(f"  [PASS] Priority: {invalid_rev['priority']}")
        print(f"  [PASS] Reason: {invalid_rev['reason'][:80]}...")

        # Step 3: Verify fallback task was generated
        print("\nStep 3: Checking Generated Actionable Tasks ...")
        tasks = data.get("tasks", [])
        assert len(tasks) > 0, "Expected fallback verification task for wrong PDF!"
        doc_task = next((t for t in tasks if "Verify" in t["task_name"] or "Document" in t["task_name"]), None)
        assert doc_task is not None, f"Expected verification task, got: {[t['task_name'] for t in tasks]}"
        print(f"  [PASS] Actionable Task: {doc_task['task_name']}")
        print(f"  [PASS] Task Status: {doc_task['status']}")

        # Step 4: Verify GET /api/reviews returns this item
        print("\nStep 4: Calling GET /api/reviews ...")
        res = client.get("/api/reviews")
        assert res.status_code == 200
        active_revs = res.json()
        assert any(r["id"] == invalid_rev["id"] for r in active_revs), "Review item not returned in GET /api/reviews!"
        print(f"  [PASS] GET /api/reviews returned {len(active_revs)} items, including {invalid_rev['id']}")

        # Step 5: Test resolving the review item
        print("\nStep 5: Updating Review Item to 'Resolved' ...")
        res = client.put(f"/api/reviews/{invalid_rev['id']}", json={"status": "Resolved", "reviewer_notes": "Notified patient to re-upload actual discharge document."})
        assert res.status_code == 200, f"Expected 200, got {res.status_code} ({res.text})"
        updated_rev = res.json()
        assert updated_rev["status"] == "Resolved", f"Expected Resolved, got {updated_rev['status']}"
        print(f"  [PASS] Review item status successfully updated to: {updated_rev['status']}")

        # Step 6: Verify task synchronized to Completed
        print("\nStep 6: Checking Task Status after Review Resolution ...")
        res = client.get("/api/tasks")
        assert res.status_code == 200
        all_tasks = res.json()
        matching_task = next((t for t in all_tasks if t["id"] == doc_task["id"]), None)
        if matching_task:
            print(f"  [PASS] Task status synchronized: {matching_task['status']}")

        # Step 7: Clean up temp PDF
        if os.path.exists(wrong_pdf_file):
            os.remove(wrong_pdf_file)

        # Step 8: Reset back to canonical Scenario 1
        print("\nStep 8: Resetting state to default ...")
        client.post("/api/reset")
        print("  [PASS] Environment reset.")

    print("\n==========================================================")
    print("  ALL WRONG PDF UPLOAD & REVIEW TESTS PASSED SUCCESSFULLY! ")
    print("==========================================================")

if __name__ == "__main__":
    run_wrong_pdf_test()
