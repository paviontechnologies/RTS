-- =============================================================================
-- PAVION TECHNOLOGIES – US STAFFING ATS + CRM ENTERPRISE PLATFORM
-- Production Database Architecture & DDL Specification (PostgreSQL)
-- Multi-Tenant, RBAC, High-Performance GIN & Full-Text Search (tsvector)
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. Tenant & Identity Access Management (RBAC)
-- =============================================================================

-- 1. Organizations (Multi-Tenant Master)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    legal_name VARCHAR(200),
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(100),
    logo_url TEXT,
    timezone VARCHAR(50) DEFAULT 'America/New_York', -- US Staffing standard
    default_currency VARCHAR(3) DEFAULT 'USD',
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'TRIAL', 'CLOSED')),
    config JSONB DEFAULT '{}'::jsonb, -- dynamic custom fields/settings
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Roles & Permissions (Fine-grained access control)
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- e.g., 'IT Recruiter', 'Account Manager', 'SuperAdmin', 'BDE'
    description TEXT,
    is_system_default BOOLEAN DEFAULT FALSE,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb, 
    -- Format: ["candidate:read", "candidate:write", "rate:view", "submission:approve"]
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Users (Recruiters, AMs, Sales Execs, Admins)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL,
    normalized_email VARCHAR(150) GENERATED ALWAYS AS (LOWER(TRIM(email))) STORED,
    password_hash TEXT NOT NULL,
    phone VARCHAR(25),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    manager_id UUID REFERENCES users(id),
    department VARCHAR(50),
    is_mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INVITED', 'DEACTIVATED')),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_org_user_email UNIQUE (organization_id, normalized_email)
);

-- =============================================================================
-- 2. CRM Engine (Leads, Accounts, Contacts & Deals)
-- =============================================================================

-- 4. Accounts (Clients / MSPs / Vendors)
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    account_code VARCHAR(30), -- e.g., ACC-10024
    name VARCHAR(200) NOT NULL,
    legal_name VARCHAR(250),
    website VARCHAR(255),
    industry VARCHAR(100),
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('DIRECT_CLIENT', 'IMPLEMENTATION_PARTNER', 'STAFFING_VENDOR', 'MSP', 'VMS_CLIENT')),
    tier VARCHAR(20) DEFAULT 'TIER_2' CHECK (tier IN ('TIER_1', 'TIER_2', 'TIER_3')),
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('PROSPECT', 'ACTIVE', 'ON_HOLD', 'INACTIVE')),
    account_manager_id UUID REFERENCES users(id),
    billing_address JSONB, -- { street, city, state, zip, country }
    payment_terms VARCHAR(50) DEFAULT 'NET_30', -- NET_15, NET_30, NET_45, NET_60
    vms_portal_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Contacts (Client Stakeholders / Hiring Managers)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    designation VARCHAR(100), -- e.g., "Director of IT Staffing", "Hiring Lead"
    email VARCHAR(150),
    phone VARCHAR(25),
    mobile VARCHAR(25),
    linkedin_url TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Leads (Prospects before conversion)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    company_name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(100),
    email VARCHAR(150),
    phone VARCHAR(25),
    source VARCHAR(50) CHECK (source IN ('LINKEDIN', 'WEBSITE', 'JOB_BOARD', 'REFERRAL', 'COLD_CALL', 'OTHER')),
    status VARCHAR(30) DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'INTERESTED', 'QUALIFIED', 'PROPOSAL_SENT', 'CONVERTED', 'LOST')),
    assigned_sales_id UUID REFERENCES users(id),
    converted_account_id UUID REFERENCES accounts(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Opportunities (Deal Pipeline)
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id),
    title VARCHAR(200) NOT NULL,
    expected_positions INT DEFAULT 1,
    pipeline_stage VARCHAR(50) DEFAULT 'DISCOVERY' CHECK (pipeline_stage IN ('DISCOVERY', 'REQUIREMENT_REVIEW', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST')),
    estimated_revenue NUMERIC(12, 2),
    probability INT CHECK (probability BETWEEN 0 AND 100),
    expected_close_date DATE,
    assigned_user_id UUID REFERENCES users(id),
    lost_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 3. ATS Engine (Jobs, Candidates, RTR & Sourcing)
-- =============================================================================

-- 8. Job Requisitions
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    job_code VARCHAR(50) NOT NULL, -- e.g., REQ-2026-089
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    contact_id UUID REFERENCES contacts(id),
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    skills_required TEXT[], -- PostgreSQL array: ['Java', 'Spring Boot', 'AWS']
    openings INT DEFAULT 1,
    filled_positions INT DEFAULT 0,
    experience_min NUMERIC(4, 1),
    experience_max NUMERIC(4, 1),
    
    -- US Market Specifics
    work_mode VARCHAR(20) CHECK (work_mode IN ('REMOTE', 'HYBRID', 'ONSITE')),
    employment_type VARCHAR(30) CHECK (employment_type IN ('C2C', 'W2', '1099', 'FULL_TIME', 'CONTRACT_TO_HIRE')),
    location JSONB, -- { city, state, zip }
    
    -- Financials & Margin
    pay_rate_min NUMERIC(10, 2),
    pay_rate_max NUMERIC(10, 2),
    bill_rate_target NUMERIC(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    
    priority VARCHAR(15) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    status VARCHAR(30) DEFAULT 'OPEN' CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'OPEN', 'ON_HOLD', 'FILLED', 'CLOSED', 'CANCELLED')),
    primary_recruiter_id UUID REFERENCES users(id),
    account_manager_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_org_job_code UNIQUE (organization_id, job_code)
);

-- 9. Candidates Master Database
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    candidate_code VARCHAR(50) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL,
    normalized_email VARCHAR(150) GENERATED ALWAYS AS (LOWER(TRIM(email))) STORED,
    phone VARCHAR(25) NOT NULL,
    normalized_phone VARCHAR(25), -- Cleaned format for de-duplication: digits only
    current_location JSONB, -- { city, state, zip }
    linkedin_url TEXT,
    
    -- US Employment & Compliance Fields
    work_authorization VARCHAR(50), -- e.g., 'US Citizen', 'Green Card', 'H1-B', 'OPT', 'CPT'
    security_clearance VARCHAR(50),
    preferred_employment_type VARCHAR(30) CHECK (preferred_employment_type IN ('C2C', 'W2', '1099', 'ANY')),
    expected_rate NUMERIC(10, 2),
    rate_type VARCHAR(10) DEFAULT 'HOURLY' CHECK (rate_type IN ('HOURLY', 'ANNUAL')),
    
    total_experience NUMERIC(4, 1),
    primary_skills TEXT[],
    current_title VARCHAR(100),
    current_company VARCHAR(100),
    availability_notice VARCHAR(50), -- e.g., "Immediate", "2 Weeks"
    source VARCHAR(50), -- "DICE", "CAREERBUILDER", "LINKEDIN", "MONSTER"
    assigned_recruiter_id UUID REFERENCES users(id),
    status VARCHAR(30) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'PLACED', 'ENGAGED', 'DO_NOT_CONTACT', 'INACTIVE')),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_org_candidate_email UNIQUE (organization_id, normalized_email)
);

-- 10. Candidate Resumes & Documents
CREATE TABLE IF NOT EXISTS candidate_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    document_type VARCHAR(30) CHECK (document_type IN ('FORMATTED_RESUME', 'ORIGINAL_RESUME', 'DRIVING_LICENSE', 'PASSPORT', 'CERTIFICATION', 'OTHER')),
    storage_path TEXT NOT NULL, -- S3 Bucket URL or Storage Key
    original_filename VARCHAR(255) NOT NULL,
    file_mime VARCHAR(100),
    file_size_bytes BIGINT,
    parsed_json JSONB, -- Extracted AI parser data (skills, projects, education)
    extracted_text TEXT, -- Stored for full-text search (tsvector)
    is_primary BOOLEAN DEFAULT FALSE,
    uploaded_by UUID REFERENCES users(id),
    search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(extracted_text, ''))) STORED,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 4. Recruitment Workflow (Pipeline, RTR, Submissions, Interviews & Placements)
-- =============================================================================

-- 11. Candidate-to-Job Pipeline Junction
CREATE TABLE IF NOT EXISTS candidate_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE RESTRICT,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT,
    recruiter_id UUID NOT NULL REFERENCES users(id),
    
    current_stage VARCHAR(50) DEFAULT 'SOURCED' CHECK (current_stage IN (
        'SOURCED', 'SCREENING', 'SHORTLISTED', 'RTR_REQUESTED', 
        'RTR_RECEIVED', 'CLIENT_SUBMITTED', 'INTERVIEW_STAGE', 
        'OFFER_EXTENDED', 'OFFER_ACCEPTED', 'PLACED', 'REJECTED', 'WITHDRAWN'
    )),
    match_score NUMERIC(5, 2), -- Computed match score (0.00 to 100.00)
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_candidate_job UNIQUE (organization_id, candidate_id, job_id)
);

-- 12. Candidate Stage History (Audit trail for Time-in-Stage analytics)
CREATE TABLE IF NOT EXISTS candidate_stage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_job_id UUID NOT NULL REFERENCES candidate_jobs(id) ON DELETE CASCADE,
    from_stage VARCHAR(50),
    to_stage VARCHAR(50) NOT NULL,
    changed_by UUID NOT NULL REFERENCES users(id),
    transition_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 13. Right to Represent (RTR) - Critical for US Staffing
CREATE TABLE IF NOT EXISTS rtr_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE RESTRICT,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT,
    consent_method VARCHAR(30) CHECK (consent_method IN ('EMAIL_CONFIRMATION', 'E_SIGNATURE', 'PORTAL_ACCEPTANCE')),
    rate_agreed NUMERIC(10, 2) NOT NULL,
    rate_type VARCHAR(10) DEFAULT 'HOURLY',
    signed_document_url TEXT,
    consent_status VARCHAR(20) DEFAULT 'PENDING' CHECK (consent_status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REJECTED', 'REVOKED')),
    valid_until TIMESTAMPTZ,
    audit_ip INET,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 14. Submissions (Profiles sent to Account Manager / Client)
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    candidate_job_id UUID NOT NULL REFERENCES candidate_jobs(id) ON DELETE RESTRICT,
    account_id UUID NOT NULL REFERENCES accounts(id),
    recruiter_id UUID NOT NULL REFERENCES users(id),
    resume_document_id UUID REFERENCES candidate_documents(id),
    rtr_id UUID REFERENCES rtr_records(id),
    
    pay_rate NUMERIC(10, 2) NOT NULL, -- e.g., $65.00/hr
    bill_rate NUMERIC(10, 2) NOT NULL, -- e.g., $85.00/hr
    margin_percentage NUMERIC(5, 2) GENERATED ALWAYS AS (
        ROUND(((bill_rate - pay_rate) / NULLIF(bill_rate, 0)) * 100, 2)
    ) STORED,
    
    status VARCHAR(30) DEFAULT 'SUBMITTED' CHECK (status IN (
        'INTERNAL_REVIEW', 'SUBMITTED', 'CLIENT_SHORTLISTED', 
        'INTERVIEW_REQUESTED', 'CLIENT_REJECTED', 'OFFER_MADE', 'WITHDRAWN'
    )),
    client_feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 15. Interviews
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    round_number INT DEFAULT 1,
    round_name VARCHAR(50), -- e.g., "Screening", "Technical Round 1", "Client Manager"
    interview_type VARCHAR(20) CHECK (interview_type IN ('PHONE', 'TEAMS', 'ZOOM', 'GOOGLE_MEET', 'IN_PERSON')),
    meeting_link TEXT,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    client_timezone VARCHAR(50) DEFAULT 'America/New_York',
    
    status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'RESCHEDULED', 'CANDIDATE_NO_SHOW', 'CANCELLED')),
    interviewer_info JSONB, -- [{ name, email, role }]
    feedback_notes TEXT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    outcome VARCHAR(30) CHECK (outcome IN ('PASSED', 'FAILED', 'ON_HOLD', 'PENDING')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 16. Placements (Hires / Closures)
CREATE TABLE IF NOT EXISTS placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    submission_id UUID NOT NULL UNIQUE REFERENCES submissions(id),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    job_id UUID NOT NULL REFERENCES jobs(id),
    account_id UUID NOT NULL REFERENCES accounts(id),
    
    start_date DATE NOT NULL,
    end_date DATE,
    employment_type VARCHAR(30) CHECK (employment_type IN ('C2C', 'W2', '1099', 'FULL_TIME')),
    pay_rate NUMERIC(10, 2) NOT NULL,
    bill_rate NUMERIC(10, 2) NOT NULL,
    vendor_id UUID REFERENCES accounts(id), -- If C2C / Subcontractor involved
    
    recruiter_commission NUMERIC(10, 2),
    account_manager_commission NUMERIC(10, 2),
    
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('OFFER_ACCEPTED', 'ONBOARDING', 'ACTIVE', 'EXTENDED', 'COMPLETED', 'TERMINATED')),
    onboarding_checklist JSONB DEFAULT '{}'::jsonb, -- Background check, I-9, Direct Deposit status
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 5. Cross-Cutting Support (Activities, Tasks, Audit & Search)
-- =============================================================================

-- 17. Activities (Unified timeline for calls, emails, notes)
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    performed_by UUID NOT NULL REFERENCES users(id),
    activity_type VARCHAR(30) CHECK (activity_type IN ('CALL', 'EMAIL', 'MEETING', 'NOTE', 'SMS', 'STATUS_CHANGE')),
    entity_type VARCHAR(30) NOT NULL CHECK (entity_type IN ('LEAD', 'ACCOUNT', 'CONTACT', 'JOB', 'CANDIDATE', 'SUBMISSION')),
    entity_id UUID NOT NULL,
    subject VARCHAR(200),
    description TEXT,
    metadata JSONB, -- Call duration, email headers, recording links
    occurred_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 18. Audit Logs (Immutable compliance logs)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- e.g., "RATE_CHANGED", "CANDIDATE_MERGED", "RESUME_DOWNLOADED"
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    before_state JSONB,
    after_state JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 6. Indexing Strategy & Query Optimization (<500ms SLA)
-- =============================================================================

-- Tenant Isolation & Foreign Key Acceleration
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_accounts_org ON accounts(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_contacts_account ON contacts(account_id);
CREATE INDEX IF NOT EXISTS idx_jobs_org_status ON jobs(organization_id, status, primary_recruiter_id);
CREATE INDEX IF NOT EXISTS idx_candidate_jobs_pipeline ON candidate_jobs(organization_id, job_id, current_stage);
CREATE INDEX IF NOT EXISTS idx_submissions_job_candidate ON submissions(organization_id, account_id, status);
CREATE INDEX IF NOT EXISTS idx_interviews_schedule ON interviews(organization_id, scheduled_start, status);

-- Candidate Deduplication & Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_candidate_norm_email ON candidates(organization_id, normalized_email);
CREATE INDEX IF NOT EXISTS idx_candidate_norm_phone ON candidates(organization_id, normalized_phone);

-- High-Performance Resume & Skills Search (PostgreSQL GIN)
CREATE INDEX IF NOT EXISTS idx_candidates_skills_gin ON candidates USING GIN(primary_skills);
CREATE INDEX IF NOT EXISTS idx_jobs_skills_gin ON jobs USING GIN(skills_required);

-- Full-Text Search on Parsed Documents (tsvector GIN)
CREATE INDEX IF NOT EXISTS idx_candidate_documents_fts ON candidate_documents USING GIN(search_vector);
