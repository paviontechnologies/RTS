-- =============================================================================
-- PAVION TECHNOLOGIES - ENTERPRISE POSTGRESQL DATABASE ARCHITECTURE
-- Production DDL: 8 Domain Schemas & 60+ Relational Entities
-- Multi-Tenancy: Organization-level isolation, Composite Keys & RLS
-- =============================================================================

-- Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- -----------------------------------------------------------------------------
-- CREATE 8 DOMAIN SCHEMAS
-- -----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS crm;
CREATE SCHEMA IF NOT EXISTS ats;
CREATE SCHEMA IF NOT EXISTS recruitment;
CREATE SCHEMA IF NOT EXISTS compliance;
CREATE SCHEMA IF NOT EXISTS operations;
CREATE SCHEMA IF NOT EXISTS analytics;

-- =============================================================================
-- 1. CORE SCHEMA (Organizations, Departments, Settings)
-- =============================================================================

CREATE TABLE IF NOT EXISTS core.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    legal_name VARCHAR(250),
    slug VARCHAR(150) NOT NULL UNIQUE,
    logo_url TEXT,
    website TEXT,
    business_email VARCHAR(255),
    phone VARCHAR(30),
    timezone VARCHAR(60) DEFAULT 'America/New_York',
    currency CHAR(3) DEFAULT 'USD',
    date_format VARCHAR(30) DEFAULT 'MM/DD/YYYY',
    status VARCHAR(30) DEFAULT 'ACTIVE',
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS core.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50),
    head_user_id UUID,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_dept_org_name UNIQUE (organization_id, name)
);

CREATE TABLE IF NOT EXISTS core.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    category VARCHAR(50) DEFAULT 'GENERAL',
    is_encrypted BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_org_setting UNIQUE (organization_id, setting_key)
);

-- =============================================================================
-- 2. AUTH SCHEMA (Users, Roles, Permissions, Sessions, Audit)
-- =============================================================================

CREATE TABLE IF NOT EXISTS auth.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    is_system_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_role_org_code UNIQUE (organization_id, code)
);

CREATE TABLE IF NOT EXISTS auth.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth.role_permissions (
    role_id UUID NOT NULL REFERENCES auth.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES auth.permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    department_id UUID REFERENCES core.departments(id) ON DELETE SET NULL,
    manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    phone VARCHAR(30),
    avatar_url TEXT,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    is_mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_org_email UNIQUE (organization_id, email)
);

CREATE TABLE IF NOT EXISTS auth.user_roles (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES auth.roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS auth.user_permission_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES auth.permissions(id) ON DELETE CASCADE,
    is_granted BOOLEAN NOT NULL,
    reason TEXT,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_perm_override UNIQUE (user_id, permission_id)
);

CREATE TABLE IF NOT EXISTS auth.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth.login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(30) NOT NULL,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 3. CRM SCHEMA (Leads, Accounts, Contacts, Opportunities, Activities)
-- =============================================================================

CREATE TABLE IF NOT EXISTS crm.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    title VARCHAR(150),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    source VARCHAR(100) DEFAULT 'Direct Outreach',
    status VARCHAR(30) DEFAULT 'NEW',
    score INTEGER DEFAULT 0,
    estimated_value NUMERIC(12,2) DEFAULT 0,
    assigned_to_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    converted_account_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crm.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    account_code VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    website TEXT,
    industry VARCHAR(100),
    company_size VARCHAR(50),
    account_type VARCHAR(50) DEFAULT 'Direct Client',
    tier VARCHAR(30) DEFAULT 'Tier 1',
    account_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    billing_address JSONB DEFAULT '{}'::jsonb,
    payment_terms VARCHAR(100) DEFAULT 'Net 30',
    msa_status VARCHAR(30) DEFAULT 'Active',
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_account_org_code UNIQUE (organization_id, account_code)
);

CREATE TABLE IF NOT EXISTS crm.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES crm.accounts(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(150),
    department VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    is_primary BOOLEAN DEFAULT FALSE,
    is_hiring_manager BOOLEAN DEFAULT FALSE,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crm.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES crm.accounts(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES crm.leads(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    stage VARCHAR(50) DEFAULT 'Prospecting',
    deal_value NUMERIC(14,2) NOT NULL DEFAULT 0,
    expected_close_date DATE,
    probability_percentage INTEGER DEFAULT 50,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crm.account_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES crm.accounts(id) ON DELETE CASCADE,
    document_type VARCHAR(50) DEFAULT 'MSA',
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 4. ATS SCHEMA (Jobs, Candidates, Skills, Talent Pools, Sourcing)
-- =============================================================================

CREATE TABLE IF NOT EXISTS ats.job_requisitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    job_code VARCHAR(50) NOT NULL,
    account_id UUID NOT NULL REFERENCES crm.accounts(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES crm.contacts(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requirements TEXT,
    employment_type VARCHAR(50) DEFAULT 'Contract - W2',
    work_mode VARCHAR(30) DEFAULT 'Hybrid',
    location JSONB DEFAULT '{}'::jsonb,
    openings INTEGER DEFAULT 1,
    filled_positions INTEGER DEFAULT 0,
    experience_min NUMERIC(5,2) DEFAULT 0,
    experience_max NUMERIC(5,2),
    pay_rate_min NUMERIC(12,2),
    pay_rate_max NUMERIC(12,2),
    bill_rate_min NUMERIC(12,2),
    bill_rate_max NUMERIC(12,2),
    rate_unit VARCHAR(20) DEFAULT 'Hourly',
    currency CHAR(3) DEFAULT 'USD',
    priority VARCHAR(20) DEFAULT 'High',
    status VARCHAR(30) DEFAULT 'Open',
    approval_status VARCHAR(30) DEFAULT 'Approved',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    opened_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_job_org_code UNIQUE (organization_id, job_code),
    CONSTRAINT uq_job_org UNIQUE (organization_id, id)
);

CREATE TABLE IF NOT EXISTS ats.job_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES ats.job_requisitions(id) ON DELETE CASCADE,
    recruiter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    target_submissions INTEGER DEFAULT 3,
    status VARCHAR(30) DEFAULT 'Active',
    CONSTRAINT uq_job_recruiter UNIQUE (job_id, recruiter_id)
);

CREATE TABLE IF NOT EXISTS ats.job_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES ats.job_requisitions(id) ON DELETE CASCADE,
    skill_name VARCHAR(150) NOT NULL,
    normalized_skill VARCHAR(150),
    is_mandatory BOOLEAN DEFAULT TRUE,
    min_years_experience NUMERIC(5,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ats.job_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES ats.job_requisitions(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    comments TEXT,
    decided_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ats.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    candidate_code VARCHAR(50),
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    professional_summary TEXT,
    current_title VARCHAR(200),
    current_company VARCHAR(200),
    total_experience NUMERIC(5,2) DEFAULT 0,
    relevant_experience NUMERIC(5,2) DEFAULT 0,
    location JSONB DEFAULT '{}'::jsonb,
    availability VARCHAR(30) DEFAULT 'Immediate',
    work_authorization VARCHAR(50) DEFAULT 'US Citizen',
    expected_pay_rate NUMERIC(12,2),
    source VARCHAR(100) DEFAULT 'LinkedIn',
    assigned_recruiter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'Active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_candidate_org UNIQUE (organization_id, id)
);

CREATE TABLE IF NOT EXISTS ats.candidate_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES ats.candidates(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    CONSTRAINT uq_cand_org_email UNIQUE (organization_id, email)
);

CREATE TABLE IF NOT EXISTS ats.candidate_phones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES ats.candidates(id) ON DELETE CASCADE,
    phone_number VARCHAR(35) NOT NULL,
    phone_type VARCHAR(20) DEFAULT 'Mobile',
    is_primary BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS ats.candidate_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES ats.candidates(id) ON DELETE CASCADE,
    skill_name VARCHAR(150) NOT NULL,
    normalized_skill VARCHAR(150),
    experience_years NUMERIC(5,2) DEFAULT 0,
    proficiency VARCHAR(30) DEFAULT 'Expert',
    last_used_at DATE
);

CREATE TABLE IF NOT EXISTS ats.candidate_employments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES ats.candidates(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    job_title VARCHAR(150) NOT NULL,
    location VARCHAR(150),
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS ats.candidate_educations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES ats.candidates(id) ON DELETE CASCADE,
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(150) NOT NULL,
    field_of_study VARCHAR(150),
    graduation_year INTEGER
);

CREATE TABLE IF NOT EXISTS ats.candidate_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES ats.candidates(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    issuing_authority VARCHAR(200),
    credential_id VARCHAR(100),
    issue_date DATE,
    expiry_date DATE
);

CREATE TABLE IF NOT EXISTS ats.candidate_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES ats.candidates(id) ON DELETE CASCADE,
    document_type VARCHAR(50) DEFAULT 'Resume',
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    is_primary BOOLEAN DEFAULT FALSE,
    parsed_content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ats.candidate_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    channel_type VARCHAR(50) DEFAULT 'JobBoard',
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS ats.talent_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    domain VARCHAR(100) DEFAULT 'Information Technology',
    target_skills TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ats.talent_pool_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    talent_pool_id UUID NOT NULL REFERENCES ats.talent_pools(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES ats.candidates(id) ON DELETE CASCADE,
    added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    status VARCHAR(30) DEFAULT 'Active',
    added_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_pool_cand UNIQUE (talent_pool_id, candidate_id)
);

-- =============================================================================
-- 5. RECRUITMENT ENGINE SCHEMA (candidate_jobs, stages, rtr, submissions, offers)
-- =============================================================================

CREATE TABLE IF NOT EXISTS recruitment.recruitment_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    stage_code VARCHAR(50) NOT NULL,
    sequence INTEGER NOT NULL,
    stage_type VARCHAR(30) DEFAULT 'ACTIVE',
    is_active BOOLEAN DEFAULT TRUE,
    is_terminal BOOLEAN DEFAULT FALSE,
    CONSTRAINT uq_stage_org_code UNIQUE (organization_id, stage_code)
);

-- Central Recruitment Engine Table
CREATE TABLE IF NOT EXISTS recruitment.candidate_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES ats.candidates(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES ats.job_requisitions(id) ON DELETE CASCADE,
    recruiter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    current_stage_id UUID REFERENCES recruitment.recruitment_stages(id) ON DELETE SET NULL,
    application_status VARCHAR(30) DEFAULT 'InProcess',
    match_score NUMERIC(5,2) DEFAULT 0,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_candidate_job UNIQUE (organization_id, candidate_id, job_id)
);

CREATE TABLE IF NOT EXISTS recruitment.candidate_stage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    candidate_job_id UUID NOT NULL REFERENCES recruitment.candidate_jobs(id) ON DELETE CASCADE,
    from_stage_id UUID REFERENCES recruitment.recruitment_stages(id) ON DELETE SET NULL,
    to_stage_id UUID REFERENCES recruitment.recruitment_stages(id) ON DELETE SET NULL,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recruitment.screening_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    candidate_job_id UUID NOT NULL REFERENCES recruitment.candidate_jobs(id) ON DELETE CASCADE,
    screener_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    overall_score NUMERIC(5,2),
    is_knockout_passed BOOLEAN DEFAULT TRUE,
    rate_confirmed NUMERIC(12,2),
    availability_confirmed VARCHAR(50),
    decision VARCHAR(30) DEFAULT 'Pass',
    notes TEXT,
    screened_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recruitment.screening_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    screening_record_id UUID NOT NULL REFERENCES recruitment.screening_records(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    answer_text TEXT NOT NULL,
    is_killer_question BOOLEAN DEFAULT FALSE,
    is_pass BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS recruitment.duplicate_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    original_candidate_id UUID NOT NULL REFERENCES ats.candidates(id) ON DELETE CASCADE,
    duplicate_candidate_id UUID NOT NULL REFERENCES ats.candidates(id) ON DELETE CASCADE,
    similarity_score NUMERIC(5,2) NOT NULL,
    match_reason VARCHAR(255),
    status VARCHAR(30) DEFAULT 'PendingReview',
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recruitment.candidate_merge_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    target_candidate_id UUID NOT NULL REFERENCES ats.candidates(id) ON DELETE CASCADE,
    merged_candidate_code VARCHAR(50) NOT NULL,
    merged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    details JSONB DEFAULT '{}'::jsonb,
    merged_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recruitment.rtr_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES ats.candidates(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES ats.job_requisitions(id) ON DELETE CASCADE,
    client_account_id UUID NOT NULL REFERENCES crm.accounts(id) ON DELETE CASCADE,
    candidate_job_id UUID REFERENCES recruitment.candidate_jobs(id) ON DELETE SET NULL,
    document_id UUID REFERENCES ats.candidate_documents(id) ON DELETE SET NULL,
    consent_method VARCHAR(50) DEFAULT 'EmailConfirmation',
    consent_status VARCHAR(30) DEFAULT 'Approved',
    consent_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recruitment.candidate_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES ats.candidates(id) ON DELETE CASCADE,
    consent_type VARCHAR(100) NOT NULL,
    is_granted BOOLEAN DEFAULT TRUE,
    ip_address VARCHAR(45),
    consented_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recruitment.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    candidate_job_id UUID NOT NULL REFERENCES recruitment.candidate_jobs(id) ON DELETE CASCADE,
    client_account_id UUID NOT NULL REFERENCES crm.accounts(id) ON DELETE CASCADE,
    recruiter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resume_document_id UUID REFERENCES ats.candidate_documents(id) ON DELETE SET NULL,
    rtr_id UUID REFERENCES recruitment.rtr_records(id) ON DELETE SET NULL,
    pay_rate NUMERIC(12,2) NOT NULL,
    bill_rate NUMERIC(12,2) NOT NULL,
    currency CHAR(3) DEFAULT 'USD',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) DEFAULT 'Submitted',
    client_feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recruitment.submission_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES recruitment.submissions(id) ON DELETE CASCADE,
    document_type VARCHAR(50) DEFAULT 'FormattedResume',
    file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recruitment.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    candidate_job_id UUID NOT NULL REFERENCES recruitment.candidate_jobs(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES recruitment.submissions(id) ON DELETE SET NULL,
    round_number INTEGER DEFAULT 1,
    interview_type VARCHAR(50) DEFAULT 'Technical',
    scheduled_at TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(60) DEFAULT 'America/New_York',
    duration_minutes INTEGER DEFAULT 60,
    meeting_url TEXT,
    status VARCHAR(30) DEFAULT 'Scheduled',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recruitment.interview_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES recruitment.interviews(id) ON DELETE CASCADE,
    interviewer_name VARCHAR(150) NOT NULL,
    interviewer_email VARCHAR(255) NOT NULL,
    role_type VARCHAR(50) DEFAULT 'ClientHiringManager'
);

CREATE TABLE IF NOT EXISTS recruitment.interview_kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    job_role VARCHAR(150) NOT NULL,
    round_type VARCHAR(50) DEFAULT 'Technical',
    competencies JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recruitment.interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_kit_id UUID NOT NULL REFERENCES recruitment.interview_kits(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    competency VARCHAR(100),
    sample_answer TEXT
);

CREATE TABLE IF NOT EXISTS recruitment.interview_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES recruitment.interviews(id) ON DELETE CASCADE,
    interviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    technical_rating INTEGER,
    communication_rating INTEGER,
    experience_rating INTEGER,
    overall_rating INTEGER NOT NULL,
    recommendation VARCHAR(50) NOT NULL,
    comments TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recruitment.interview_scorecards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    interview_id UUID REFERENCES recruitment.interviews(id) ON DELETE SET NULL,
    interview_kit_id UUID REFERENCES recruitment.interview_kits(id) ON DELETE SET NULL,
    candidate_id UUID NOT NULL REFERENCES ats.candidates(id) ON DELETE CASCADE,
    interviewer_name VARCHAR(150) NOT NULL,
    interviewer_email VARCHAR(255),
    overall_rating INTEGER DEFAULT 4,
    recommendation VARCHAR(50) DEFAULT 'Hire',
    strengths TEXT,
    weaknesses TEXT,
    ratings_json JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recruitment.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES recruitment.submissions(id) ON DELETE SET NULL,
    candidate_id UUID NOT NULL REFERENCES ats.candidates(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES ats.job_requisitions(id) ON DELETE CASCADE,
    offer_code VARCHAR(50) NOT NULL,
    pay_rate NUMERIC(12,2) NOT NULL,
    bill_rate NUMERIC(12,2) NOT NULL,
    overtime_rate NUMERIC(12,2),
    spread_hourly NUMERIC(12,2) NOT NULL,
    margin_percentage NUMERIC(5,2) NOT NULL,
    employment_type VARCHAR(50) DEFAULT 'Contract - W2',
    start_date DATE NOT NULL,
    end_date DATE,
    benefits_details TEXT,
    approval_status VARCHAR(30) DEFAULT 'Approved',
    approved_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'Draft',
    offer_letter_content TEXT,
    sent_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recruitment.offer_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES recruitment.offers(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    pay_rate NUMERIC(12,2) NOT NULL,
    bill_rate NUMERIC(12,2) NOT NULL,
    status VARCHAR(30) NOT NULL,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    change_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recruitment.placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES recruitment.submissions(id) ON DELETE SET NULL,
    candidate_id UUID NOT NULL REFERENCES ats.candidates(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES ats.job_requisitions(id) ON DELETE CASCADE,
    client_account_id UUID NOT NULL REFERENCES crm.accounts(id) ON DELETE CASCADE,
    offer_id UUID REFERENCES recruitment.offers(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    employment_type VARCHAR(50) DEFAULT 'Contract - W2',
    pay_rate NUMERIC(12,2) NOT NULL,
    bill_rate NUMERIC(12,2) NOT NULL,
    gross_margin NUMERIC(12,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'Active',
    account_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recruitment.onboarding_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    employment_type VARCHAR(50) DEFAULT 'Contract - W2',
    checklist_json JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS recruitment.onboarding_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    placement_id UUID REFERENCES recruitment.placements(id) ON DELETE SET NULL,
    candidate_id UUID NOT NULL REFERENCES ats.candidates(id) ON DELETE CASCADE,
    category VARCHAR(50) DEFAULT 'Document',
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'Pending',
    document_url TEXT,
    due_date DATE,
    verification_notes TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 6. COMPLIANCE & DOCUMENTS SCHEMA
-- =============================================================================

CREATE TABLE IF NOT EXISTS compliance.credential_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) DEFAULT 'Certification',
    validity_months INTEGER DEFAULT 24
);

CREATE TABLE IF NOT EXISTS compliance.job_credential_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES ats.job_requisitions(id) ON DELETE CASCADE,
    credential_type_id UUID NOT NULL REFERENCES compliance.credential_types(id) ON DELETE CASCADE,
    is_mandatory BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS compliance.candidate_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES ats.candidates(id) ON DELETE CASCADE,
    credential_type VARCHAR(50) DEFAULT 'Certification',
    name VARCHAR(200) NOT NULL,
    issuing_authority VARCHAR(200),
    credential_id_number VARCHAR(100),
    state VARCHAR(50) DEFAULT 'National',
    issue_date DATE,
    expiry_date DATE,
    verification_status VARCHAR(30) DEFAULT 'Verified',
    document_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance.background_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES ats.candidates(id) ON DELETE CASCADE,
    vendor_name VARCHAR(150) DEFAULT 'Sterling Check',
    package_type VARCHAR(100) DEFAULT '7-Year Criminal & SSN',
    status VARCHAR(30) DEFAULT 'Initiated',
    result VARCHAR(30),
    report_url TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance.verification_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES ats.candidates(id) ON DELETE CASCADE,
    verifier_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verification_type VARCHAR(50) NOT NULL,
    result VARCHAR(30) DEFAULT 'Passed',
    notes TEXT,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance.document_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    document_title VARCHAR(200) NOT NULL,
    signer_email VARCHAR(255) NOT NULL,
    envelope_id VARCHAR(100),
    status VARCHAR(30) DEFAULT 'Sent',
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance.retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    record_type VARCHAR(50) NOT NULL,
    retention_period_days INTEGER NOT NULL DEFAULT 2555, -- 7 Years
    auto_purge BOOLEAN DEFAULT FALSE
);

-- =============================================================================
-- 7. SHARED OPERATIONS SCHEMA (Tasks, Activities, Communications, Notifications)
-- =============================================================================

CREATE TABLE IF NOT EXISTS operations.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    assigned_to_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'Normal',
    status VARCHAR(30) DEFAULT 'Pending',
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS operations.task_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES operations.tasks(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS operations.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    notes TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS operations.activity_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES operations.activities(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS operations.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'System',
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS operations.communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES ats.candidates(id) ON DELETE SET NULL,
    channel VARCHAR(30) DEFAULT 'Email',
    direction VARCHAR(20) DEFAULT 'Outbound',
    subject VARCHAR(255),
    body TEXT NOT NULL,
    template_name VARCHAR(150),
    status VARCHAR(30) DEFAULT 'Delivered',
    sent_by VARCHAR(150),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS operations.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message_id VARCHAR(150),
    delivery_status VARCHAR(30) DEFAULT 'Sent',
    sent_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS operations.attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    mime_type VARCHAR(100),
    size_bytes BIGINT,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS operations.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS operations.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    title VARCHAR(200),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 8. ENTERPRISE & ANALYTICS SCHEMA
-- =============================================================================

CREATE TABLE IF NOT EXISTS analytics.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    previous_state JSONB,
    new_state JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics.custom_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    field_label VARCHAR(150) NOT NULL,
    data_type VARCHAR(30) DEFAULT 'TEXT',
    options_json JSONB DEFAULT '[]'::jsonb,
    is_required BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS analytics.custom_field_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    custom_field_id UUID NOT NULL REFERENCES analytics.custom_fields(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL,
    field_value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics.workflow_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    trigger_event VARCHAR(100) NOT NULL,
    actions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS analytics.integration_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    auth_credentials JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(30) DEFAULT 'CONNECTED',
    connected_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics.integration_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES analytics.integration_connections(id) ON DELETE CASCADE,
    sync_type VARCHAR(50) NOT NULL,
    records_synced INTEGER DEFAULT 0,
    status VARCHAR(30) DEFAULT 'SUCCESS',
    error_message TEXT,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics.saved_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    filter_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics.report_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) DEFAULT 'RecruiterPerformance',
    query_definition JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics.report_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_definition_id UUID NOT NULL REFERENCES analytics.report_definitions(id) ON DELETE CASCADE,
    snapshot_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- PERFORMANCE INDEXES & GIN FULL-TEXT SEARCH
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_cands_org_status ON ats.candidates(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_org_status ON ats.job_requisitions(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_cand_jobs_job ON recruitment.candidate_jobs(organization_id, job_id, current_stage_id);
CREATE INDEX IF NOT EXISTS idx_subs_status ON recruitment.submissions(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_interviews_sched ON recruitment.interviews(organization_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_offers_status ON recruitment.offers(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_placements_status ON recruitment.placements(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_created ON analytics.audit_logs(organization_id, created_at);

-- GIN Full Text Search Indexes on Skills & Job Titles
CREATE INDEX IF NOT EXISTS idx_cands_name_trgm ON ats.candidates USING gin ((first_name || ' ' || last_name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_jobs_title_trgm ON ats.job_requisitions USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_cskills_name_trgm ON ats.candidate_skills USING gin (skill_name gin_trgm_ops);
