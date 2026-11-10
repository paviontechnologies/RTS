# Pavion Technologies – US Staffing ATS + CRM Enterprise Platform

[![Platform](https://img.shields.io/badge/Platform-US%20Staffing%20ATS%20%2B%20CRM-blue.svg)](https://paviontechnologies.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript%20%2B%20MUI-61dafb.svg)](https://react.dev)
[![Node](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express%20%2B%20Prisma-339933.svg)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20SQLite-336791.svg)](https://postgresql.org)

An enterprise-grade, multi-tenant Applicant Tracking System (ATS) and Customer Relationship Management (CRM) platform purpose-built for US Staffing & Recruitment Agencies.

Developed by **Pavion Technologies Pvt. Ltd.**

---

## 🏛️ System Architecture

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

## 🚀 Key Features

### 1. Four Role-Based Interfaces
- 👑 **Super Admin**: System governance, organizational settings, audit trails, and multi-tenant billing analytics.
- 🎯 **Senior Recruiter**: AI resume parser workbench, candidate sourcing (55+ Indian tech talent profiles), and 16-stage recruitment funnel.
- 💼 **Account Manager**: Enterprise client coordination (TCS, Infosys, Wipro, HCL), job requisitions, and client feedback reviews.
- 📈 **Sales / BDE**: CRM lead acquisition pipeline, deal forecasting, quota tracking gauges, and touchpoint activity logs.

### 2. High-Performance ATS & Candidate Pool
- Pre-seeded with **55+ Indian candidates** (students on OPT/CPT visas, H1-B, Green Card, and US Citizens).
- Full skills matrix covering AWS, Java, Spring Boot, React, Python, Snowflake, QA Automation, and Salesforce.
- Deduplication lookup engine on normalized email and phone numbers.
- Right-to-Represent (RTR) compliance consent capture and rate card locks.

### 3. Financial Margin & Profitability Engine
- Automated gross margin calculations:
  $$\text{Margin } \% = \left(\frac{\text{Bill Rate} - \text{Pay Rate}}{\text{Bill Rate}}\right) \times 100$$
- Placement commission splits between recruiters and account managers.

### 4. 18-Entity Production Database
- Pure ANSI SQL DDL scripts (`database/schema.sql`) compatible with PostgreSQL and SQLite.
- GIN array indexing on candidate and job skills.
- PostgreSQL `tsvector` generated columns for English full-text resume searches.

---

## 📁 Repository Structure

```text
.
├── client/                     # React 18 + TypeScript + Vite + MUI Frontend
├── server/                     # Express + TypeScript + Prisma ORM REST API
├── database/                   # Production PostgreSQL DDL, Seeds & Architecture Docs
│   ├── schema.sql              # 18-Table Production Schema with GIN Indexes
│   ├── seed.sql                # Complete SQL Seed Dataset with UUIDs
│   ├── seed_indian_enterprise.sql # 50 Candidates + 10 Clients Seed Script
│   └── ARCHITECTURE.md         # Comprehensive Data Dictionary & Deduplication Guide
└── docs/                       # Standalone Training Portal & User Manual PDF
    ├── index.html              # Standalone Training & Video Portal
    ├── Pavion_US_Staffing_User_Manual.pdf # 5-Page Illustrated PDF Guide
    └── Pavion_Platform_Training_Video.gif # Animated HD Training Video
```

---

## 🛠️ Quick Start Guide

### Prerequisites
- Node.js v18+ or v20+
- npm or yarn

### 1. Clone & Setup Backend
```bash
cd server
npm install
cp .env.example .env
npx prisma db push
npx prisma db seed
npm run dev
```
Backend runs on: `http://localhost:5055` (Swagger Docs: `http://localhost:5055/api-docs`)

### 2. Setup Frontend
```bash
cd client
npm install
npm run dev
```
Frontend runs on: `http://localhost:3003`

### 3. Open Standalone Documentation & Training Portal
```bash
python3 -m http.server 8080 --directory docs
```
Training portal runs on: `http://localhost:8080`

---

## 📄 License & Proprietary Rights
Copyright © 2026 Pavion Technologies Pvt. Ltd. All Rights Reserved.
