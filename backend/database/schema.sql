-- CareFlow AI: PostgreSQL / Supabase Database Schema
-- All tables are strictly synthetic healthcare data fixtures

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(50),
    language VARCHAR(50) DEFAULT 'English',
    hospital VARCHAR(255) DEFAULT 'Synthetic General Hospital',
    discharge_date VARCHAR(50) DEFAULT 'October 14, 2026',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Discharge Documents Table
CREATE TABLE IF NOT EXISTS discharge_documents (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    raw_text TEXT NOT NULL,
    summary_type VARCHAR(50) DEFAULT 'Synthetic'
);

-- 3. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE CASCADE,
    type VARCHAR(255) NOT NULL,
    specialty VARCHAR(100) DEFAULT 'Cardiology',
    date VARCHAR(100),
    due_date_formatted VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Pending',
    source_reference JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Medications Table
CREATE TABLE IF NOT EXISTS medications (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    instruction TEXT NOT NULL,
    duration VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Pending',
    source_reference JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tests Table
CREATE TABLE IF NOT EXISTS tests (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    date VARCHAR(100),
    due_date_formatted VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Pending',
    source_reference JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Referrals Table
CREATE TABLE IF NOT EXISTS referrals (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE CASCADE,
    specialty VARCHAR(100) NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    source_reference JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE CASCADE,
    task_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    patient_friendly_explanation TEXT,
    due_date VARCHAR(50),
    due_date_formatted VARCHAR(100),
    priority VARCHAR(50) DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'Pending',
    source_reference JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Providers Table
CREATE TABLE IF NOT EXISTS providers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    facility VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    synthetic_flag BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE CASCADE,
    issue VARCHAR(255) NOT NULL,
    priority VARCHAR(50) DEFAULT 'High',
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    original_text TEXT NOT NULL,
    ai_interpretation TEXT NOT NULL,
    source_reference JSONB NOT NULL,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. AI Activity Audit Trail Table
CREATE TABLE IF NOT EXISTS ai_activity_logs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp VARCHAR(50) NOT NULL,
    agent_name VARCHAR(100) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
