# Pavion Technologies: Enterprise PostgreSQL Database Architecture

## 1. Overview & Architectural Principles

The Pavion Technologies US Staffing ATS + CRM database architecture is organized into **8 logical domain schemas** comprising **60+ relational tables** in PostgreSQL. This architecture enforces strict multi-tenancy, immutable audit trails, and referential integrity across the recruitment lifecycle.

```
+-----------------------------------------------------------------------------------------+
|                                8 LOGICAL DOMAIN SCHEMAS                                 |
+-------------------+-------------------+-----------------------+-------------------------+
| 1. core           | 2. auth           | 3. crm                | 4. ats                  |
| Organizations     | Users, Roles      | Leads, Accounts       | Jobs, Candidates        |
| Departments       | Permissions       | Contacts              | Skills, Resumes         |
| Settings          | Sessions, Login   | Opportunities         | Talent Pools, Sourcing  |
+-------------------+-------------------+-----------------------+-------------------------+
| 5. recruitment    | 6. compliance     | 7. operations         | 8. analytics            |
| Candidate Jobs    | Credentials       | Tasks, Activities     | Audit Logs              |
| Submissions, RTR  | Visas & Licenses  | Communications        | Custom Fields           |
| Interviews, Offers| Background Checks | Email Logs            | Workflow Configurations |
| Placements, Tasks | Signatures        | Attachments, Comments | Reports & Snapshots     |
+-------------------+-------------------+-----------------------+-------------------------+
```

---

## 2. Key Architectural Corrections Implemented

1. **Normalized Candidate Contact Points**:
   - `ats.candidate_emails`: Supports primary and secondary verified emails.
   - `ats.candidate_phones`: Handles mobile, home, and work numbers.
2. **Dedicated Job Assignment Entity**:
   - `ats.job_assignments`: Multi-recruiter allocation per job with target submission quotas.
3. **Central Recruitment Junction Engine (`recruitment.candidate_jobs`)**:
   - Maintains an independent pipeline per candidate-job pair.
   - Preserves historical records when candidates apply to multiple requisitions simultaneously.
4. **Configurable Stage Funnel & Immutable Audit**:
   - `recruitment.recruitment_stages`: Configurable pipeline stages with order sequencing.
   - `recruitment.candidate_stage_history`: Immutable transition log with reasons and actor IDs.
5. **Multi-Interviewer Structured Scorecards**:
   - `recruitment.interview_scorecards` & `recruitment.interview_feedback`: Separate evaluation per interviewer.
6. **RTR Verification & Revocation Ledger**:
   - `recruitment.rtr_records` + `recruitment.candidate_consents`: Candidate + Job + Client verification with explicit expiration and revocation timestamps.
7. **Immutable Client Submissions Snapshot**:
   - `recruitment.submissions` & `recruitment.submission_documents`: Preserves submitted resume version and pay/bill rates without overwriting.
8. **Offer Revisions & Contract Extensions**:
   - `recruitment.offers` + `recruitment.offer_history`: Versioned compensation packages.
   - `recruitment.placements`: Full contract extension, billing rates, and gross margin spreads.
9. **Deduplication & Merge History**:
   - `recruitment.duplicate_candidates` review queue and `recruitment.candidate_merge_history`.
10. **Multi-Tenant Isolation**:
    - `organization_id` on every tenant entity.
    - Composite unique constraints (`organization_id`, `id`) and foreign keys ensuring zero cross-tenant leakage.

---

## 3. Detailed Data Dictionary across the 8 Schemas

### Group 1: `core` Schema
- `core.organizations`: Central tenant account (Legal name, slug, timezone, currency USD, logo, date format).
- `core.departments`: Organizational units (US IT Staffing, Healthcare Staffing, Executive Search, Sales).
- `core.settings`: Encrypted and plaintext tenant configurations.

### Group 2: `auth` Schema
- `auth.roles`: Configurable roles (Super Admin, Senior Recruiter, Account Manager, Sales BDE).
- `auth.permissions`: Granular action codes (e.g. `rate:view`, `offer:approve`, `candidate:export`).
- `auth.role_permissions`: Role-to-permission mapping table.
- `auth.users`: User accounts with bcrypt password hashes, department, and manager links.
- `auth.user_roles`: Many-to-many user-to-role assignment.
- `auth.user_permission_overrides`: Individual permission exceptions per user.
- `auth.user_sessions`: Active JWT sessions and expiration metadata.
- `auth.login_history`: Security log recording IP address, user agent, and login outcome.

### Group 3: `crm` Schema
- `crm.leads`: Prospective staffing clients and business inquiries with scoring.
- `crm.accounts`: Confirmed enterprise clients (Anthem, JPMorgan Chase, Deloitte) with tier, payment terms, and assigned account manager.
- `crm.contacts`: Client employees, hiring managers, and billing contacts.
- `crm.opportunities`: Sales deals with deal stage, contract value, probability, and close dates.
- `crm.account_documents`: Executed MSAs, rate cards, and client vendor guidelines.

### Group 4: `ats` Schema
- `ats.job_requisitions`: Client requirements (Job code, title, pay/bill rates, openings, hybrid/remote mode).
- `ats.job_assignments`: Recruiter assignments with target candidate submittals.
- `ats.job_skills`: Required technical skills with minimum years of experience and mandatory flags.
- `ats.job_approvals`: Multi-tier approval workflow for job requisitions.
- `ats.candidates`: Central candidate database with work authorization, current title, and expected rate.
- `ats.candidate_emails`: Normalized email addresses.
- `ats.candidate_phones`: Normalized phone numbers.
- `ats.candidate_skills`: Candidate technical proficiencies with years of experience.
- `ats.candidate_employments`: Past employment history.
- `ats.candidate_educations`: Academic degrees and institutions.
- `ats.candidate_certifications`: Professional licenses and certifications.
- `ats.candidate_documents`: Versioned resumes and parsed text for full-text search.
- `ats.candidate_sources`: Acquisition channel definitions (LinkedIn, Dice, CareerBuilder, Inbound).
- `ats.talent_pools`: Curated talent pools (Java Experts, Cloud Architects, Healthcare Staffing).
- `ats.talent_pool_members`: Candidates associated with talent pools with recruiter notes.

### Group 5: `recruitment` Schema (Recruitment Engine)
- `recruitment.recruitment_stages`: Configurable pipeline stages (Sourced, Screened, RTR, Submitted, Interview, Offer, Placed).
- `recruitment.candidate_jobs`: **Central recruitment engine table** linking Candidate + Job with current stage and match score.
- `recruitment.candidate_stage_history`: Complete chronological stage movement audit.
- `recruitment.screening_records`: Recruiter phone screening, killer questions evaluation, and rate confirmation.
- `recruitment.screening_answers`: Individual answers to knockout screening questions.
- `recruitment.duplicate_candidates`: Machine-learning / similarity duplicate detection review queue.
- `recruitment.candidate_merge_history`: Audit record of merged candidate profiles.
- `recruitment.rtr_records`: Formal Right to Represent records linking candidate, job, and client.
- `recruitment.candidate_consents`: Consent capture (Email, E-Signature, SMS).
- `recruitment.submissions`: Candidate submissions to clients with approved bill/pay rates.
- `recruitment.submission_documents`: Versioned snapshot of submitted resume.
- `recruitment.interviews`: Scheduled rounds (Technical, System Design, Behavioral).
- `recruitment.interview_participants`: Interviewers and hiring manager details.
- `recruitment.interview_kits`: Standardized interview templates with scoring rubrics.
- `recruitment.interview_questions`: Structured question banks by competency.
- `recruitment.interview_feedback`: Qualitative feedback per interviewer.
- `recruitment.interview_scorecards`: Evaluator ratings and hiring recommendations.
- `recruitment.offers`: Compensation package, spread ($/hr), margin %, and offer letter text.
- `recruitment.offer_history`: Revisions and status transitions.
- `recruitment.placements`: Confirmed candidate starts, bill rate, pay rate, gross margin, and end date.
- `recruitment.onboarding_templates`: Standard pre-hire checklist definitions.
- `recruitment.onboarding_tasks`: Pre-hire tasks (Form W-4, I-9, BGV, 10-panel drug test, laptop provisioning).

### Group 6: `compliance` Schema
- `compliance.credential_types`: Types of mandatory credentials (Visas, Nursing Licenses, Cloud Certs).
- `compliance.job_credential_requirements`: Job-specific compliance requirements.
- `compliance.candidate_credentials`: Verified candidate credentials with expiration radar.
- `compliance.background_checks`: Background screening integration workflow (Sterling, Checkr).
- `compliance.verification_records`: Primary-source verification audit.
- `compliance.document_signatures`: E-Signature transaction metadata (DocuSign, Adobe Sign).
- `compliance.retention_policies`: Document retention schedules (e.g. 7-year statutory retention).

### Group 7: `operations` Schema
- `operations.tasks`: Follow-ups and action items.
- `operations.task_links`: Referential links connecting tasks to any entity.
- `operations.activities`: CRM & ATS touchpoint records.
- `operations.activity_links`: Referential links connecting activities to accounts or candidates.
- `operations.notifications`: System alerts and task assignment notifications.
- `operations.communication_logs`: Omni-channel candidate communications (Email, SMS, Phone).
- `operations.email_logs`: Inbound and outbound email delivery status.
- `operations.attachments`: Centralized file attachment metadata.
- `operations.comments`: Internal team collaboration notes.
- `operations.notes`: Rich text notes attached to records.

### Group 8: `analytics` Schema
- `analytics.audit_logs`: Append-only security and operational audit trail with before/after state.
- `analytics.custom_fields`: Tenant-configurable dynamic fields.
- `analytics.custom_field_values`: Entity-specific custom field values.
- `analytics.workflow_configs`: Automated recruitment workflows and trigger actions.
- `analytics.integration_connections`: VMS, job boards, and background screening API connections.
- `analytics.integration_sync_logs`: Data sync history and error logging.
- `analytics.saved_filters`: User-saved custom search queries.
- `analytics.report_definitions`: Configurable KPI report definitions.
- `analytics.report_snapshots`: Historical point-in-time KPI metrics.
