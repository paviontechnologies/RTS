# Pavion Technologies – Database Architecture & SQL Directory

This directory contains the core SQL DDL scripts, seed datasets, schema definitions, and migration guidelines for the **Pavion Technologies US Staffing ATS + CRM Enterprise Platform**.

---

## 📁 Directory Structure

```text
RTS/
├── database/                                  <-- 🌟 Dedicated SQL & Database Scripts
│   ├── schema.sql                             <-- Pure SQL CREATE TABLE statements with User ID, Customer ID, etc.
│   ├── seed.sql                               <-- Pure SQL INSERT statements with seed data
│   └── README.md                              <-- Architecture & setup guide (this file)
│
└── server/
    └── prisma/
        ├── schema.prisma                      <-- Active Prisma ORM schema used by Node/Express backend
        ├── seed.ts                            <-- Automated TypeScript seeder (Bcrypt + Prisma Client)
        ├── dev.db                             <-- Live SQLite database file (180 KB)
        └── migrations/                        <-- Migration version history
```

---

## 🗄️ Relational Entities & ID Mappings

Every entity in `database/schema.sql` is structured with explicit primary keys and foreign keys:

| Table | Primary Key | Key Foreign Identifiers | Purpose |
| :--- | :--- | :--- | :--- |
| **`organizations`** | `id` (`VARCHAR(36)`) | Multi-tenant root | Master tenant entity (Pavion Technologies) |
| **`users`** | `id` (`VARCHAR(36)`) | `organization_id` | Recruiters, Account Managers, BDEs, Admins |
| **`accounts`** | `id` (`VARCHAR(36)`) | `organization_id`, `account_manager_id` | **Customer / Client master** (e.g., ABC Tech, Apex) |
| **`contacts`** | `id` (`VARCHAR(36)`) | `organization_id`, `account_id` | Hiring Managers, MSP Vendor Contacts |
| **`leads`** | `id` (`VARCHAR(36)`) | `organization_id`, `assigned_user_id`, `converted_account_id` | Sales prospect companies & staffing inquiries |
| **`opportunities`** | `id` (`VARCHAR(36)`) | `organization_id`, `account_id`, `assigned_user_id` | CRM deal pipeline ($ value, win probability) |
| **`job_requisitions`**| `id` (`VARCHAR(36)`) | `account_id`, `contact_id`, `account_manager_id`, `primary_recruiter_id` | Open staffing requisitions (C2C, W2, 1099) |
| **`candidates`** | `id` (`VARCHAR(36)`) | `organization_id`, `created_by_user_id` | ATS candidate profiles, visa status, skills, rate |
| **`candidate_jobs`** | `id` (`VARCHAR(36)`) | `candidate_id`, `job_id` | 16-stage ATS pipeline candidate tracker |
| **`rtr_records`** | `id` (`VARCHAR(36)`) | `candidate_id`, `job_id`, `recruiter_id` | Right to Represent (RTR) rate compliance |
| **`submissions`** | `id` (`VARCHAR(36)`) | `job_id`, `candidate_id`, `account_id`, `recruiter_id` | Client submission packet and feedback |
| **`interviews`** | `id` (`VARCHAR(36)`) | `submission_id`, `candidate_id`, `job_id`, `scheduled_by_id` | Interview rounds (R1, R2, Final) & notes |
| **`placements`** | `id` (`VARCHAR(36)`) | `job_id`, `candidate_id`, `account_id`, `recruiter_id`, `account_manager_id` | Closed deals, gross margins ($/hr), and start dates |
| **`activities`** | `id` (`VARCHAR(36)`) | `user_id`, `account_id`, `contact_id`, `candidate_id`, `job_id` | Unified CRM + ATS timeline event log |
| **`tasks`** | `id` (`VARCHAR(36)`) | `assigned_to_id`, `created_by_id` | Recruiter and AM action checklist items |
| **`notifications`** | `id` (`VARCHAR(36)`) | `user_id` | Real-time user alert inbox in Topbar |
| **`audit_logs`** | `id` (`VARCHAR(36)`) | `user_id` | Enterprise compliance audit trail |

---

## 🔍 How to View and Manage the Database

### 1. Visual Web UI (Prisma Studio)
Prisma Studio is running as a live visual database explorer:
👉 **URL**: `http://localhost:5555`

To start it manually at any time:
```bash
cd server
npm run db:studio
# or
npx prisma studio --port 5555
```

### 2. View in SQLite GUI Client (TablePlus, DBeaver, SQLiteViewer)
Open the active database file directly:
```
/Users/mac/Desktop/RTS/server/prisma/dev.db
```

### 3. Deploy to PostgreSQL / MySQL
The SQL statements in `database/schema.sql` and `database/seed.sql` use standard ANSI SQL syntax compatible with PostgreSQL, MySQL, and SQLite.
To import into PostgreSQL:
```bash
psql -U postgres -d pavion_rts -f database/schema.sql
psql -U postgres -d pavion_rts -f database/seed.sql
```
Then update `server/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/pavion_rts?schema=public"
```
And re-generate the client:
```bash
cd server
npx prisma db pull
npx prisma generate
```
