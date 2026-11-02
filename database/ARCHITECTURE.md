# Pavion Technologies – Database Architecture & Enterprise DDL Specification

This document outlines the complete relational data architecture, indexing strategy, and deduplication engine powering the **Pavion Technologies US Staffing ATS + CRM Enterprise Platform**.

---

## 🏛️ Entity Relationship Architecture Overview

```text
                      +-------------------+
                      |   ORGANIZATIONS   |
                      +---------+---------+
                                |
         +----------------------+----------------------+
         |                      |                      |
         v                      v                      v
     +-------+              +--------+           +------------+
     | USERS |<-------------|  ROLES |           | DEPARTMENTS|
     +---+---+              +----+---+           +------------+
         |                       |
         | (Owner/Recruiter)     | (Permissions)
         v                       v
+-----------------+     +-----------------+
|  CRM: ACCOUNTS  |     |   CANDIDATES    |
+--------+--------+     +--------+--------+
         |                       |
         +---------\   /---------+
                    \ /
                     v
             +---------------+
             | CANDIDATE_JOBS| <---+ (Pipeline Engine)
             +-------+-------+
                     |
                     v
             +---------------+
             |  SUBMISSIONS  |
             +-------+-------+
                     |
         +-----------+-----------+
         |                       |
         v                       v
  +--------------+        +--------------+
  |  INTERVIEWS  |        |  PLACEMENTS  |
  +--------------+        +--------------+
```

---

## 📑 Core Database Schemas (18 Relational Entities)

### 1. Tenant & Identity Access Management (RBAC)
- **`organizations`**: Multi-tenant master entity isolating client records, global timezone (`America/New_York`), currency, and tenant configuration JSONB.
- **`roles`**: Fine-grained access control with JSONB permissions (`["candidate:read", "rate:view", "submission:approve"]`).
- **`users`**: Staff members (Super Admin, Account Manager, Senior Recruiter, BDE) with normalized generated email for strict uniqueness per tenant.

### 2. CRM Engine (Leads, Accounts, Contacts & Deals)
- **`accounts`**: Client companies, MSP vendors, and implementation partners with `account_code`, tier (`TIER_1`, `TIER_2`, `TIER_3`), JSONB billing address, and VMS portal links.
- **`contacts`**: Hiring managers and client stakeholders with direct designations and communication channels.
- **`leads`**: Prospective staffing inquiries with source attribution (`LINKEDIN`, `JOB_BOARD`, etc.) and conversion mapping.
- **`opportunities`**: B2B deal pipeline tracking positions, probability %, estimated contract value, and expected close date.

### 3. ATS Engine (Jobs, Candidates, RTR & Sourcing)
- **`jobs`**: Requisitions with PostgreSQL `TEXT[]` skills array, JSONB work location, C2C/W2 pay & bill rates, and experience brackets.
- **`candidates`**: Talent repository with de-duplication keys (`normalized_email`, `normalized_phone`), visa authorization (`US Citizen`, `Green Card`, `H1-B`, `OPT`), expected hourly rate, and primary skills array.
- **`candidate_documents`**: Resume storage with original metadata, AI parser JSONB output, extracted text, and generated `tsvector` search vector.

### 4. Recruitment Workflow (Pipeline, RTR, Submissions, Interviews & Placements)
- **`candidate_jobs`**: 12-stage recruitment funnel (`SOURCED` → `SCREENING` → `SHORTLISTED` → `RTR_REQUESTED` → `RTR_RECEIVED` → `CLIENT_SUBMITTED` → `INTERVIEW_STAGE` → `OFFER_EXTENDED` → `OFFER_ACCEPTED` → `PLACED`).
- **`candidate_stage_history`**: Immutable stage transition log tracking recruiter actions and time-in-stage metrics.
- **`rtr_records`**: Formal Right-to-Represent legal consent tracking agreed rate, consent method, and expiration.
- **`submissions`**: Client submittals with automated margin calculation:
  $$\text{Margin } \% = \left(\frac{\text{Bill Rate} - \text{Pay Rate}}{\text{Bill Rate}}\right) \times 100$$
- **`interviews`**: Scheduled client rounds, video links, panelist JSONB, ratings (1-5), and outcome states.
- **`placements`**: Closed won placements, recruiter/AM commissions, start/end dates, and onboarding checklist JSONB (I-9, background check, direct deposit).

### 5. Cross-Cutting Support
- **`activities`**: Unified timeline logging calls, emails, meetings, notes, and SMS across all entities.
- **`audit_logs`**: Immutable security trail recording before/after JSON states, IP addresses, and user actions.

---

## ⚡ Indexing Strategy & Performance SLA (<500ms)

```sql
-- 1. Tenant Isolation & High-Frequency Foreign Keys
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_accounts_org ON accounts(organization_id, status);
CREATE INDEX idx_contacts_account ON contacts(account_id);
CREATE INDEX idx_jobs_org_status ON jobs(organization_id, status, primary_recruiter_id);
CREATE INDEX idx_candidate_jobs_pipeline ON candidate_jobs(organization_id, job_id, current_stage);
CREATE INDEX idx_submissions_job_candidate ON submissions(organization_id, account_id, status);
CREATE INDEX idx_interviews_schedule ON interviews(organization_id, scheduled_start, status);

-- 2. Candidate Deduplication & Lookup Acceleration
CREATE INDEX idx_candidate_norm_email ON candidates(organization_id, normalized_email);
CREATE INDEX idx_candidate_norm_phone ON candidates(organization_id, normalized_phone);

-- 3. Skills Array GIN Indexing (PostgreSQL)
CREATE INDEX idx_candidates_skills_gin ON candidates USING GIN(primary_skills);
CREATE INDEX idx_jobs_skills_gin ON jobs USING GIN(skills_required);

-- 4. Full-Text Search on Resume Corpus (English Language tsvector)
CREATE INDEX idx_candidate_documents_fts ON candidate_documents USING GIN(search_vector);
```

---

## 🔍 Candidate De-duplication Logic on Insertion

When a recruiter uploads a resume or manually creates a candidate profile:

```sql
-- Check for existing candidate profile in tenant
SELECT id, candidate_code, first_name, last_name, email, phone, status
FROM candidates
WHERE organization_id = :org_id
  AND (
      normalized_email = LOWER(TRIM(:email))
      OR normalized_phone = REGEXP_REPLACE(:phone, '[^0-9]', '', 'g')
  );
```

If a duplicate match is identified:
1. Do not hard fail or throw database constraint errors.
2. The UI displays the **Duplicate Candidate Comparison Modal**.
3. Allows recruiter to merge latest resume, update skills, or link candidate to a new open job requisition.

---

## 🌐 UTC Everywhere & Timezone Formatting

- **Database Standard**: All datetime columns use `TIMESTAMPTZ` and store in **UTC (`CURRENT_TIMESTAMP`)**.
- **Display Formatting**: US Client interfaces dynamically convert UTC timestamps to target timezones based on account or user configuration:
  - Eastern: `America/New_York` (EST/EDT)
  - Central: `America/Chicago` (CST/CDT)
  - Mountain: `America/Denver` (MST/MDT)
  - Pacific: `America/Los_Angeles` (PST/PDT)

---

## 🚀 PostgreSQL Deployment Instructions

To instantiate this architecture on an enterprise PostgreSQL instance:

```bash
# 1. Create target database
createdb -U postgres pavion_rts

# 2. Execute DDL Schema script
psql -U postgres -d pavion_rts -f database/schema.sql

# 3. Populate Seed Data
psql -U postgres -d pavion_rts -f database/seed.sql

# 4. Verify record counts
psql -U postgres -d pavion_rts -c "
SELECT 'Organizations' as Entity, count(*) FROM organizations UNION ALL
SELECT 'Roles', count(*) FROM roles UNION ALL
SELECT 'Users', count(*) FROM users UNION ALL
SELECT 'Accounts', count(*) FROM accounts UNION ALL
SELECT 'Jobs', count(*) FROM jobs UNION ALL
SELECT 'Candidates', count(*) FROM candidates UNION ALL
SELECT 'Documents', count(*) FROM candidate_documents UNION ALL
SELECT 'Submissions', count(*) FROM submissions UNION ALL
SELECT 'Placements', count(*) FROM placements;
"
```
