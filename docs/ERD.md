# Pavion Technologies: Complete Entity Relationship Architecture

This document contains the complete **Entity-Relationship Diagram (ERD)** for the Pavion Technologies US Staffing ATS + CRM platform, strictly reflecting the enterprise relational structure specified in the architecture blueprint.

---

## 1. Enterprise System ERD (Complete Relationship Architecture)

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ ACCOUNTS : owns
    ORGANIZATIONS ||--o{ USERS : employs
    ORGANIZATIONS ||--o{ CANDIDATES : owns
    ORGANIZATIONS ||--o{ JOB_REQUISITIONS : owns
    ORGANIZATIONS ||--o{ AUDIT_LOGS : records
    ORGANIZATIONS ||--o{ ROLES : defines

    LEADS ||--o| ACCOUNTS : converts_to

    ACCOUNTS ||--o{ CONTACTS : contains
    ACCOUNTS ||--o{ OPPORTUNITIES : has
    ACCOUNTS ||--o{ JOB_REQUISITIONS : creates
    ACCOUNTS ||--o{ PLACEMENTS : contracts

    USERS ||--o{ USER_ROLES : assigned
    ROLES ||--o{ USER_ROLES : has
    ROLES ||--o{ ROLE_PERMISSIONS : contains
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : grants

    JOB_REQUISITIONS ||--o{ JOB_SKILLS : requires
    JOB_REQUISITIONS ||--o{ JOB_CREDENTIAL_REQUIREMENTS : requires
    JOB_REQUISITIONS ||--o{ JOB_ASSIGNMENTS : assigned
    USERS ||--o{ JOB_ASSIGNMENTS : works

    CANDIDATES ||--o{ CANDIDATE_SKILLS : has
    CANDIDATES ||--o{ CANDIDATE_DOCUMENTS : owns
    CANDIDATES ||--o{ CANDIDATE_CREDENTIALS : holds
    CANDIDATES ||--o{ ONBOARDING_TASKS : completes

    CANDIDATES ||--o{ CANDIDATE_JOBS : applies
    JOB_REQUISITIONS ||--o{ CANDIDATE_JOBS : receives

    CANDIDATE_JOBS ||--o{ SCREENING_RECORDS : screened
    CANDIDATE_JOBS ||--o{ RTR_RECORDS : authorizes
    CANDIDATE_JOBS ||--o{ CANDIDATE_STAGE_HISTORY : tracks
    CANDIDATE_JOBS ||--o{ SUBMISSIONS : generates

    SUBMISSIONS ||--o{ INTERVIEWS : progresses
    INTERVIEWS ||--o{ INTERVIEW_FEEDBACK : receives
    SUBMISSIONS ||--o{ OFFERS : receives
    OFFERS ||--o{ PLACEMENTS : results
    PLACEMENTS ||--o{ ONBOARDING_TASKS : triggers
```

---

## 2. Central Recruitment Engine (`CANDIDATE_JOBS`) Data Flow

```mermaid
graph TD
    Cand[CANDIDATES] -->|Applies| CJ[recruitment.candidate_jobs]
    Job[ats.job_requisitions] -->|Receives Application| CJ

    subgraph Evaluation
        CJ -->|1. Recruiter Phone Screen| SCR[recruitment.screening_records]
        SCR --> ANS[screening_answers: Killer Questions]
        CJ -->|2. Right to Represent| RTR[recruitment.rtr_records]
        RTR --> CONS[candidate_consents: E-Signatures]
    end

    subgraph Client Review & Interviews
        CJ -->|3. Client Submittal| SUB[recruitment.submissions]
        SUB --> SUBDOC[submission_documents: Formatted Resume Snapshot]
        SUB -->|4. Interview Rounds| INT[recruitment.interviews]
        INT --> SCORE[interview_scorecards & interview_feedback]
    end

    subgraph Placement & Onboarding
        SUB -->|5. Compensation Offer| OFF[recruitment.offers]
        OFF --> OFFHIST[offer_history: Revisions & Approvals]
        OFF -->|6. Start Confirmed| PLC[recruitment.placements]
        PLC --> ONB[recruitment.onboarding_tasks: W4, I9, BGV, Drug Test]
    end

    CJ -->|Immutable Audit| HIST[recruitment.candidate_stage_history]
```

---

## 3. Entity Multi-Tenancy & Referential Integrity

All tables across the 8 domain schemas implement composite keys referencing the tenant organization:

```sql
-- Multi-Tenant Composite Foreign Key Enforcement
ALTER TABLE ats.candidates 
    ADD CONSTRAINT uq_candidate_org UNIQUE (organization_id, id);

ALTER TABLE ats.job_requisitions 
    ADD CONSTRAINT uq_job_org UNIQUE (organization_id, id);

ALTER TABLE recruitment.candidate_jobs 
    ADD CONSTRAINT fk_candidate_jobs_candidate 
    FOREIGN KEY (organization_id, candidate_id) 
    REFERENCES ats.candidates (organization_id, id) ON DELETE CASCADE;

ALTER TABLE recruitment.candidate_jobs 
    ADD CONSTRAINT fk_candidate_jobs_job 
    FOREIGN KEY (organization_id, job_id) 
    REFERENCES ats.job_requisitions (organization_id, id) ON DELETE CASCADE;
```
