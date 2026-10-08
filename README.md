# CareFlow AI – Agentic Hospital Discharge & Follow-up Coordinator

> **"Turn complex discharge instructions into a clear, trackable care plan."**

**CareFlow AI** is a post-hospital-discharge coordination platform built for patients, family caregivers, and clinical care coordinators. It transforms dense, unstructured hospital discharge summaries into a structured, trackable care plan with timeline schedules, plain-English patient guidance, source-grounded explainability, and human-in-the-loop clinical review escalations.

---

## 🛡️ Important Healthcare Safety Boundaries & Responsible AI

**CareFlow AI is NOT a diagnostic or treatment system.**

The AI agentic system **NEVER**:
- Diagnoses a patient or predicts diseases.
- Recommends clinical treatments or remedies.
- Changes medication dosages or schedules.
- Tells patients to stop or start prescription medications.
- Invents missing appointment dates, dosages, or durations.
- Presents synthetic provider matches as guaranteed or clinical endorsements.
- Overrides original discharge orders.

The AI system is strictly constrained to:
- **Extract** information verbatim as written.
- **Organize** instructions into actionable categories (Medications, Appointments, Tests, Referrals, Care).
- **Explain** medical instructions in simpler plain English (English only).
- **Create** actionable tasks and chronological recovery timelines.
- **Track** completion and adherence milestones.
- **Identify ambiguity**, missing calendar dates, and incomplete medication durations.
- **Escalate** clinically sensitive questions and conflicts to the **Human Review Center**.

---

## 🤖 Multi-Agent Architecture

CareFlow AI employs 6 specialized logical agents coordinated by an orchestration pipeline:

```
                  ┌─────────────────────────────────────────┐
                  │        Synthetic Discharge Summary       │
                  │              (PDF or TXT)               │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │       Document Processing (PyMuPDF)     │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │  Agent 1: Document Extraction Agent     │
                  │  (Extracts entities & verbatim sources) │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │  Agent 2: Validation & Ambiguity Agent  │
                  │  (Detects missing dates & conflicts)    │
                  └────────────────────┬────────────────────┘
                                       │
                     ┌─────────────────┴─────────────────┐
                     ▼                                   ▼
        ┌─────────────────────────┐         ┌─────────────────────────┐
        │ Agent 5: Safety /       │         │ Agent 3: Task           │
        │ Escalation Agent        │         │ Generation Agent        │
        │ (Medication questions)  │         │ (Creates care tasks)    │
        └────────────┬────────────┘         └────────────┬────────────┘
                     │                                   │
                     ▼                                   ▼
        ┌─────────────────────────┐         ┌─────────────────────────┐
        │ Human Review Center     │         │ Agent 4: Explanation    │
        │ (Clinician in the loop) │         │ Agent (Plain English)   │
        └─────────────────────────┘         └────────────┬────────────┘
                                                         │
                                                         ▼
                                            ┌─────────────────────────┐
                                            │ Agent 6: Provider       │
                                            │ Finder Agent (Synthetic)│
                                            └─────────────────────────┘
```

1. **Agent 1 – Document Extraction Agent**: Extracts appointments, tests, medications, care instructions, and warning signs without hallucinating missing fields.
2. **Agent 2 – Validation Agent**: Detects missing dates, ambiguous timeframes, and conflicting orders. Flags items as **Needs Review** rather than guessing dates.
3. **Agent 3 – Task Generation Agent**: Converts instructions into trackable tasks across Medication, Appointment, Test, Referral, and Care categories.
4. **Agent 4 – Patient-Friendly Explanation Agent**: Rewrites medical terminology into clear plain English while strictly preserving meaning (English only).
5. **Agent 5 – Safety / Escalation Agent**: Detects clinical concerns, questions on stopping medications, or new symptoms and escalates immediately to human reviewers.
6. **Agent 6 – Provider Finder Agent**: Matches follow-up requirements with synthetic provider fixtures in Chennai and metro areas with mandatory non-guarantee disclaimers.

---

## ⚡ Tech Stack

- **Frontend**:
  - React.js 19
  - Vite 8
  - Tailwind CSS v3.4
  - React Router v7 (`react-router-dom`)
  - Axios
  - Lucide React Icons
  - Recharts
- **Backend**:
  - Python 3.11
  - FastAPI
  - Pydantic v2
  - PyMuPDF (`fitz` / `pymupdf`) for high-fidelity PDF text parsing
  - Uvicorn
- **Database & Storage**:
  - PostgreSQL / Supabase DDL schema (`backend/database/schema.sql`)
  - In-memory & JSON file fallback state for 100% out-of-the-box offline/demo reliability

---

## 📂 Project Structure

```
d:/Anentra Project/
├── backend/
│   ├── main.py                     # FastAPI application & REST endpoints
│   ├── requirements.txt            # Python dependencies
│   ├── models/
│   │   ├── schemas.py              # Pydantic schemas (Patient, Task, Review, Provider, etc.)
│   │   └── __init__.py
│   ├── agents/
│   │   ├── orchestrator.py         # Multi-agent coordination layer & audit logger
│   │   ├── extraction_agent.py     # Agent 1: Entity extraction with source citations
│   │   ├── validation_agent.py     # Agent 2: Missing date & ambiguity detection
│   │   ├── task_generation_agent.py# Agent 3: Actionable task synthesis
│   │   ├── explanation_agent.py    # Agent 4: Plain English translation
│   │   ├── safety_escalation_agent.py # Agent 5: Safety boundary enforcement
│   │   └── provider_agent.py       # Agent 6: Synthetic provider matching
│   ├── document_processor/
│   │   └── pdf_parser.py           # PyMuPDF PDF & TXT parser with page tracking
│   ├── database/
│   │   ├── db.py                   # Unified database & scenario manager
│   │   └── schema.sql              # Supabase / PostgreSQL DDL table definitions
│   └── data/
│       ├── synthetic_scenarios.py  # 5 Synthetic scenarios & provider directory
│       └── sample_pdfs/            # Real generated synthetic PDF fixtures
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx                 # Routing across all 8 modules
        ├── index.css               # Healthcare styling & design system
        ├── context/
        │   └── CareFlowContext.jsx # Global state, drawer toggles, and scenario manager
        ├── services/
        │   └── api.js              # Axios client communicating with FastAPI
        ├── components/
        │   ├── Sidebar.jsx         # Section 7 navigation & Synthetic Data Mode badge
        │   ├── TopNav.jsx          # Patient chip, scenario switcher, & alerts
        │   ├── Layout.jsx          # Responsive shell
        │   ├── SourceEvidenceDrawer.jsx # Explainability drawer with verbatim text
        │   ├── ReviewDetailModal.jsx    # Section 16 inspection: Original, AI, Issue
        │   ├── TaskDetailModal.jsx      # Task detail & completion toggle
        │   ├── AIProcessingWorkflow.jsx # Section 10 animated 7-step pipeline
        │   └── Toast.jsx
        └── pages/
            ├── DashboardPage.jsx   # Section 8: Summary cards, Next Actions, Timeline
            ├── UploadSummaryPage.jsx# Section 9: Drag-drop, paste, & 5 demo scenarios
            ├── DischargeSummaryPage.jsx # Section 11: Side-by-side original vs extracted
            ├── TasksPage.jsx       # Section 12: Filterable task dashboard
            ├── TimelinePage.jsx    # Section 13: Vertical chronological care path
            ├── ProvidersPage.jsx   # Section 14: Care provider finder with disclaimers
            ├── ReviewCenterPage.jsx# Section 15: Human review queue
            ├── AIActivityPage.jsx  # Section 17: AI audit trail with timestamps
            └── SettingsPage.jsx    # Section 23 & 24: Profile & Responsible AI checklist
```

---

## 🚀 Running the Application

### 1. Start the FastAPI Backend
```bash
cd "d:\Anentra Project\backend"
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at: `http://127.0.0.1:8000/docs`

### 2. Start the Vite Frontend
```bash
cd "d:\Anentra Project\frontend"
npm run dev
```
The application will be accessible at: `http://127.0.0.1:5173/`

---

## 🧪 5 Preloaded Test Scenarios

Accessible via the **Upload Page** or top-bar **Scenario Switcher**:
1. **Scenario 1 – Normal Discharge Plan**: Complete instructions with Cardiology follow-up (Oct 20), Fasting blood test (Oct 15), Atorvastatin, Aspirin, and Catheter site care.
2. **Scenario 2 – Multiple Follow-ups**: Complex post-discharge plan with Cardiology, Endocrinology referral, Echo test, and Cardiac Rehab referral.
3. **Scenario 3 – Ambiguous Instructions**: Cardiology clinic follow-up date unspecified ("as needed") and Clopidogrel duration missing. Demonstrates **Needs Review** escalation.
4. **Scenario 4 – Conflicting Instructions**: Contradictory return dates (1-week nursing wound note vs 2-week attending surgical order).
5. **Scenario 5 – Clinically Sensitive Inquiry**: Patient asking whether they should stop taking Clopidogrel or reduce dosage due to minor bleeding. Triggers immediate **Human Review Required** escalation.
