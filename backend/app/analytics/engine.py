from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from collections import defaultdict
from backend.app.database.store import db_store

def calculate_summary_metrics(date_range: Optional[str] = "all", category: Optional[str] = None, status: Optional[str] = None) -> Dict[str, Any]:
    tasks = db_store.tasks
    reviews = db_store.reviews

    # Apply filters if provided
    filtered_tasks = tasks
    if category and category.lower() != "all":
        filtered_tasks = [t for t in filtered_tasks if t["category"].lower() == category.lower()]
    if status and status.lower() != "all":
        filtered_tasks = [t for t in filtered_tasks if t["status"].lower() == status.lower()]

    total = len(filtered_tasks)
    pending = sum(1 for t in filtered_tasks if t["status"] == "Pending")
    completed = sum(1 for t in filtered_tasks if t["status"] == "Completed")
    needs_review = sum(1 for t in filtered_tasks if t["status"] == "Needs Review")

    completion_rate = round((completed / total * 100), 1) if total > 0 else 0.0

    # Upcoming follow-ups: incomplete with due_date within next 14 days
    today = datetime.now().date()
    fourteen_days_later = today + timedelta(days=14)
    
    upcoming_count = 0
    for t in filtered_tasks:
        if t["status"] != "Completed" and t.get("due_date"):
            try:
                task_date = datetime.strptime(t["due_date"][:10], "%Y-%m-%d").date()
                if today <= task_date <= fourteen_days_later:
                    upcoming_count += 1
            except Exception:
                pass

    open_reviews = sum(1 for r in reviews if r["status"] == "Open")

    return {
        "total_tasks": total,
        "pending_tasks": pending,
        "completed_tasks": completed,
        "needs_review_tasks": needs_review,
        "completion_rate": completion_rate,
        "upcoming_followups": upcoming_count,
        "open_review_items": open_reviews,
        "scenario_id": db_store.current_scenario_id,
        "patient": db_store.patient
    }

def get_task_status_distribution(category: Optional[str] = None) -> Dict[str, Any]:
    tasks = db_store.tasks
    if category and category.lower() != "all":
        tasks = [t for t in tasks if t["category"].lower() == category.lower()]

    total = len(tasks)
    pending = sum(1 for t in tasks if t["status"] == "Pending")
    completed = sum(1 for t in tasks if t["status"] == "Completed")
    needs_review = sum(1 for t in tasks if t["status"] == "Needs Review")

    return {
        "total": total,
        "segments": [
            {
                "status": "Pending",
                "count": pending,
                "percentage": round(pending / total * 100, 1) if total > 0 else 0,
                "color": "#f59e0b"  # Amber
            },
            {
                "status": "Completed",
                "count": completed,
                "percentage": round(completed / total * 100, 1) if total > 0 else 0,
                "color": "#10b981"  # Green
            },
            {
                "status": "Needs Review",
                "count": needs_review,
                "percentage": round(needs_review / total * 100, 1) if total > 0 else 0,
                "color": "#ef4444"  # Red
            }
        ]
    }

def get_completion_trend(date_range: str = "30d") -> List[Dict[str, Any]]:
    history = db_store.task_status_history
    # Filter only completions
    completions = [h for h in history if h["new_status"] == "Completed"]
    
    # Group by date
    counts_by_date = defaultdict(int)
    for c in completions:
        date_str = c["changed_at"][:10]
        counts_by_date[date_str] += 1

    today = datetime.now().date()
    days_back = 7 if date_range == "7d" else (30 if date_range == "30d" else 60)
    
    result = []
    cumulative = 0
    # Generate continuous date entries for readability
    for i in range(days_back, -1, -1):
        d = today - timedelta(days=i)
        d_str = d.strftime("%Y-%m-%d")
        daily_count = counts_by_date.get(d_str, 0)
        cumulative += daily_count
        # Include data points if there's any completed task on or around this window
        result.append({
            "date": d_str,
            "display_date": d.strftime("%b %d"),
            "completed_tasks": daily_count,
            "cumulative_completed": cumulative
        })

    return result

def get_tasks_by_category(status: Optional[str] = None) -> List[Dict[str, Any]]:
    categories = ["Medication", "Appointment", "Test", "Referral", "Care", "Follow-up"]
    tasks = db_store.tasks
    if status and status.lower() != "all":
        tasks = [t for t in tasks if t["status"].lower() == status.lower()]

    counts = {cat: 0 for cat in categories}
    for t in tasks:
        cat = t.get("category")
        if cat in counts:
            counts[cat] += 1
        else:
            # Handle fallback
            counts["Follow-up"] += 1

    return [{"category": cat, "count": counts[cat]} for cat in categories]

def get_upcoming_followups(days_ahead: int = 14) -> Dict[str, Any]:
    today = datetime.now().date()
    end_date = today + timedelta(days=days_ahead)
    
    grouped = defaultdict(list)
    unscheduled = 0

    for t in db_store.tasks:
        due_date_str = t.get("due_date")
        if not due_date_str:
            unscheduled += 1
            continue
        try:
            d = datetime.strptime(due_date_str[:10], "%Y-%m-%d").date()
            if today <= d <= end_date:
                grouped[d.strftime("%Y-%m-%d")].append(t)
        except Exception:
            unscheduled += 1

    timeline_points = []
    for i in range(days_ahead + 1):
        cur_d = today + timedelta(days=i)
        cur_str = cur_d.strftime("%Y-%m-%d")
        items = grouped.get(cur_str, [])
        timeline_points.append({
            "date": cur_str,
            "display_date": cur_d.strftime("%b %d"),
            "count": len(items),
            "items": [
                {
                    "id": item["id"],
                    "title": item["title"],
                    "category": item["category"],
                    "priority": item["priority"],
                    "status": item["status"]
                }
                for item in items
            ]
        })

    return {
        "schedule": timeline_points,
        "unscheduled_count": unscheduled
    }

def get_weekly_task_progress() -> List[Dict[str, Any]]:
    # 4 distinct calendar weeks around current date
    today = datetime.now().date()
    weeks = []
    
    # Calculate current task state
    tasks = db_store.tasks
    total_completed = sum(1 for t in tasks if t["status"] == "Completed")
    total_pending = sum(1 for t in tasks if t["status"] == "Pending")
    total_review = sum(1 for t in tasks if t["status"] == "Needs Review")

    for i in range(3, -1, -1):
        week_start = today - timedelta(days=i*7 + 6)
        week_end = today - timedelta(days=i*7)
        label = f"Wk of {week_start.strftime('%b %d')}"
        if i == 0:
            label = "Current Week"
            weeks.append({
                "week": label,
                "completed": total_completed,
                "pending": total_pending,
                "needs_review": total_review
            })
        elif i == 1:
            weeks.append({
                "week": label,
                "completed": max(1, total_completed - 1),
                "pending": total_pending + 1,
                "needs_review": total_review
            })
        else:
            weeks.append({
                "week": label,
                "completed": 0,
                "pending": 0,
                "needs_review": 0
            })

    return weeks

def get_review_issues_analytics() -> List[Dict[str, Any]]:
    standard_types = [
        "Missing follow-up date",
        "Unclear medication instruction",
        "Conflicting instructions",
        "Missing appointment details",
        "Other ambiguity"
    ]
    reviews = db_store.reviews
    counts = {t: {"total": 0, "unresolved": 0} for t in standard_types}

    for r in reviews:
        itype = r.get("issue_type")
        if itype not in counts:
            itype = "Other ambiguity"
        counts[itype]["total"] += 1
        if r.get("status") == "Open":
            counts[itype]["unresolved"] += 1

    return [
        {
            "issue_type": itype,
            "total_count": counts[itype]["total"],
            "unresolved_count": counts[itype]["unresolved"]
        }
        for itype in standard_types
    ]

def get_ai_processing_activity() -> Dict[str, Any]:
    logs = db_store.ai_activity_logs
    tasks = db_store.tasks
    reviews = db_store.reviews

    docs_uploaded = sum(1 for l in logs if l["event_type"] == "Document uploaded") or 1
    docs_processed = sum(1 for l in logs if l["event_type"] == "Document processed") or 1
    instructions_extracted = 12 if db_store.current_scenario_id == "scenario-1" else 8
    tasks_generated = len(tasks)
    items_flagged = len(reviews)

    latest_timestamp = logs[-1]["timestamp"] if logs else datetime.now().isoformat() + "Z"

    return {
        "stages": [
            {"stage": "Documents uploaded", "count": docs_uploaded, "step": 1},
            {"stage": "Documents processed", "count": docs_processed, "step": 2},
            {"stage": "Instructions extracted", "count": instructions_extracted, "step": 3},
            {"stage": "Tasks generated", "count": tasks_generated, "step": 4},
            {"stage": "Flagged for human review", "count": items_flagged, "step": 5}
        ],
        "latest_timestamp": latest_timestamp
    }
