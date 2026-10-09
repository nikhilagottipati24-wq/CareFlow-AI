# CareFlow AI – Agentic Hospital Discharge & Follow-up Coordinator

A full-stack healthcare web application with an interactive analytics dashboard, multi-agent document analysis, task tracking, chronological follow-up timeline, synthetic provider directory, human review workflows, and auditable AI activity logging.

---

## 🌟 Architecture Overview

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS v4 & custom healthcare design tokens
- **Routing**: React Router v7 (`react-router-dom`)
- **Data Visualizations**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios with Vite API proxy

### Backend
- **Framework**: Python FastAPI
- **Schemas**: Pydantic v2
- **Document Processing**: PyMuPDF (`fitz`) for PDF extraction
- **Multi-Agent Orchestrator**:
  1. **Document Extraction Agent**
  2. **Validation Agent**
  3. **Task Generation Agent**
  4. **Patient-Friendly Explanation Agent**
  5. **Safety and Escalation Agent**
  6. **Provider Finder Agent**
- **Persistence & Scenarios**: Shared DataStore with 5 isolated synthetic clinical scenarios, status history audit logs, and CSV reporting.

---

## 🚀 Running the Application

### 1. Backend Server
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
- API Documentation (Swagger UI): `http://127.0.0.1:8000/docs`

### 2. Frontend Development Server
From the dedicated `frontend/` directory:
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
Or directly from the root workspace:
```bash
npm run dev -- --host 127.0.0.1 --port 5173
```
- Web Application UI: `http://127.0.0.1:5173/`

### 3. Automated Backend Test Suite
```bash
python -m pytest tests/test_backend.py -v
```

---

## 📊 Analytics Dashboard & Visualizations

1. **Task Status Distribution**: Interactive Donut chart displaying Pending (amber), Completed (green), and Needs Review (red) with total task count in the center. Clicking segments filters the Tasks page.
2. **Task Completion Trend**: Line chart with recorded timestamp data points for daily and cumulative completions.
3. **Tasks by Category**: Vertical bar chart across 6 clinical categories (Medication, Appointment, Test, Referral, Care, Follow-up). Clicking bars filters Tasks.
4. **Upcoming Follow-ups**: Bar chart of scheduled items for the next 14 days. Unscheduled items are displayed separately to prevent fabricated dates. Includes interactive date inspector.
5. **Weekly Task Progress**: Stacked bar chart showing Completed, Pending, and Needs Review cohorts across weekly intervals.
6. **Review Items by Issue Type**: Horizontal bar chart showing total and open clinical ambiguities. Clicking bars filters the Review Center.
7. **AI Processing Overview**: Funnel visualization displaying workflow stages from document ingestion to actionable task generation.

---

## 🛡️ Responsible AI Principles
- **Synthetic Data Exclusively**: 100% synthetic patient records and provider profiles.
- **Coordination Only**: Does not diagnose or recommend medication alterations.
- **Source Integrity**: Retains verbatim section citations for all generated tasks.
- **Human Escalation**: Unclear dates, durations, or conflicting instructions are queued in the Review Center.
