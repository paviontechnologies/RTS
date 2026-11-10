# Pavion Technologies: PostgreSQL Production Architecture Guide

This guide details the operational configuration for running the **Pavion Technologies US Staffing ATS + CRM** platform on PostgreSQL in production.

---

## 1. Local & Production Database Credentials

### Local macOS Environment (PostgreSQL 18.4)
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `pavion_rts`
- **User**: `mac` (Homebrew default superuser)
- **Direct Connection String**:
  ```env
  DATABASE_URL="postgresql://mac@localhost:5432/pavion_rts"
  ```

### Docker Compose Environment
- **Host**: `postgres` (internal Docker network)
- **Port**: `5432`
- **Database**: `pavion_rts`
- **User**: `pavion`
- **Password**: `pavion_secure_pass_2026`
- **Connection String**:
  ```env
  DATABASE_URL="postgresql://pavion:pavion_secure_pass_2026@postgres:5432/pavion_rts"
  ```

---

## 2. Row-Level Security (RLS) Implementation

To guarantee multi-tenant data isolation at the database engine level, enable Row-Level Security on all tenant-owned tables:

```sql
-- 1. Enable RLS on Candidates Table
ALTER TABLE ats.candidates ENABLE ROW LEVEL SECURITY;

-- 2. Define Tenant Isolation Policy
CREATE POLICY tenant_isolation_policy ON ats.candidates
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

-- 3. In Backend Database Transaction
SET LOCAL app.current_organization_id = 'e7b12918-0284-48f1-a102-192847291039';
-- Queries executed in this session only see rows belonging to this organization.
```

---

## 3. Redis & BullMQ Asynchronous Processing

Redis 7 runs on port `6379` (`localhost:6379`) and manages:
1. **In-Memory Cache**:
   - User session tokens and permission sets (`auth:session:<token_hash>`).
   - Frequently queried dashboard KPIs and roll-off forecast metrics.
2. **BullMQ Background Workers**:
   - `resume-parsing-queue`: Optical character recognition (OCR) and LLM-based structured skill extraction from PDF resumes.
   - `email-queue`: Asynchronous delivery of candidate interview notifications and client submission emails.
   - `compliance-alert-queue`: Nightly scheduled job scanning credentials expiring in `< 30` or `< 60` days and dispatching alert notifications.

---

## 4. AWS S3 File Storage Architecture

For secure candidate document storage (Resumes, I-9 IDs, BGV reports):
1. **Private S3 Bucket**: Buckets have public access blocked (`BlockPublicAcls = true`).
2. **Pre-Signed URLs**:
   - Ingestion: Recruiter uploads via pre-signed `PUT` URL with a 15-minute expiration window.
   - Retrieval: Frontend renders documents via pre-signed `GET` URL expiring in 60 minutes.
3. **Structured S3 Object Key Pattern**:
   ```
   s3://pavion-rts-storage/{organization_id}/candidates/{candidate_id}/resumes/v{version}_{filename}
   s3://pavion-rts-storage/{organization_id}/onboarding/{placement_id}/{task_category}/{filename}
   ```

---

## 5. Automated Backups & Disaster Recovery

### Daily Logical Backups (`pg_dump`)
```bash
# Automated cron backup script
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
pg_dump -h localhost -U mac -d pavion_rts -F c -b -v -f "/backup/pavion_rts_${TIMESTAMP}.dump"

# Upload encrypted backup to cold AWS S3 Glacier storage
aws s3 cp "/backup/pavion_rts_${TIMESTAMP}.dump" s3://pavion-backups-archive/ --sse aws:kms
```

### Point-in-Time Recovery (PITR)
- In production, enable Write-Ahead Logging (WAL) archiving via AWS RDS PostgreSQL or standard PostgreSQL `archive_mode = on`.
- Guarantees recovery down to the exact second in the event of hardware or data corruption incidents.
