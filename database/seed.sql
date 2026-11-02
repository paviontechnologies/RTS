-- =============================================================================
-- PAVION TECHNOLOGIES – US STAFFING ATS + CRM PLATFORM
-- Production SQL Seed Script (PostgreSQL Compatible)
-- Populates all 18 Relational Entities with Consistent UUIDs
-- =============================================================================

-- 1. Master Organization
INSERT INTO organizations (
    id, name, legal_name, slug, domain, website, timezone, default_currency, date_format, status, config
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Pavion Technologies Pvt. Ltd.',
    'Pavion Technologies Inc.',
    'pavion-tech',
    'paviontechnologies.com',
    'https://paviontechnologies.com',
    'America/New_York',
    'USD',
    'MM/DD/YYYY',
    'ACTIVE',
    '{"features": {"ai_resume_parser": true, "vms_sync": true, "sms_outreach": true}, "compliance": {"rtr_mandatory": true, "i9_verification": true}}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 2. Roles & Permissions (Fine-grained RBAC)
INSERT INTO roles (id, organization_id, name, description, is_system_default, permissions)
VALUES
    (
        '22222222-2222-2222-2222-000000000001',
        '11111111-1111-1111-1111-111111111111',
        'SuperAdmin',
        'Complete system governance, security policies, billing, and organizational visibility',
        TRUE,
        '["*"]'::jsonb
    ),
    (
        '22222222-2222-2222-2222-000000000002',
        '11111111-1111-1111-1111-111111111111',
        'AccountManager',
        'Client account management, job requisitions, recruiter coordination, and client feedback',
        TRUE,
        '["account:read", "account:write", "job:create", "job:assign", "submission:review", "submission:approve", "placement:create", "rate:view"]'::jsonb
    ),
    (
        '22222222-2222-2222-2222-000000000003',
        '11111111-1111-1111-1111-111111111111',
        'SeniorRecruiter',
        'Candidate talent pool sourcing, AI resume matching, RTR consent acquisition, pipeline progression',
        TRUE,
        '["candidate:read", "candidate:write", "job:read", "pipeline:update", "rtr:request", "submission:create", "interview:schedule"]'::jsonb
    ),
    (
        '22222222-2222-2222-2222-000000000004',
        '11111111-1111-1111-1111-111111111111',
        'BusinessDevelopmentExecutive',
        'Client prospect acquisition, lead nurturing, deal pipeline, and contract proposals',
        TRUE,
        '["lead:read", "lead:write", "opportunity:read", "opportunity:write", "account:create", "activity:log"]'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- 3. Users (Enterprise Staff)
-- Password for all seed users is 'admin123' (bcrypt hash)
INSERT INTO users (
    id, organization_id, first_name, last_name, email, password_hash, phone, role_id, department, status
) VALUES
    (
        '33333333-3333-3333-3333-000000000001',
        '11111111-1111-1111-1111-111111111111',
        'Vikram', 'Sharma', 'admin@pavion.com',
        '$2a$10$wE9K6oQo5sX7bJjIe627Eea9.n7wGz1f4qJ7E6x8xYvWf.q2yYkOu',
        '+1 (555) 019-2831',
        '22222222-2222-2222-2222-000000000001',
        'Executive Management', 'ACTIVE'
    ),
    (
        '33333333-3333-3333-3333-000000000002',
        '11111111-1111-1111-1111-111111111111',
        'Sarah', 'Jenkins', 'sarah.jenkins@pavion.com',
        '$2a$10$wE9K6oQo5sX7bJjIe627Eea9.n7wGz1f4qJ7E6x8xYvWf.q2yYkOu',
        '+1 (555) 019-2832',
        '22222222-2222-2222-2222-000000000002',
        'Client Relations', 'ACTIVE'
    ),
    (
        '33333333-3333-3333-3333-000000000003',
        '11111111-1111-1111-1111-111111111111',
        'Alex', 'Carter', 'alex.carter@pavion.com',
        '$2a$10$wE9K6oQo5sX7bJjIe627Eea9.n7wGz1f4qJ7E6x8xYvWf.q2yYkOu',
        '+1 (555) 019-2833',
        '22222222-2222-2222-2222-000000000003',
        'IT Recruitment', 'ACTIVE'
    ),
    (
        '33333333-3333-3333-3333-000000000004',
        '11111111-1111-1111-1111-111111111111',
        'Marcus', 'Vance', 'marcus.vance@pavion.com',
        '$2a$10$wE9K6oQo5sX7bJjIe627Eea9.n7wGz1f4qJ7E6x8xYvWf.q2yYkOu',
        '+1 (555) 019-2834',
        '22222222-2222-2222-2222-000000000004',
        'Sales & Acquisition', 'ACTIVE'
    )
ON CONFLICT (id) DO NOTHING;

-- 4. Accounts (Clients / MSPs / Vendors)
INSERT INTO accounts (
    id, organization_id, account_code, name, legal_name, website, industry,
    account_type, tier, status, account_manager_id, billing_address, payment_terms, vms_portal_url
) VALUES
    (
        '44444444-4444-4444-4444-000000000001',
        '11111111-1111-1111-1111-111111111111',
        'ACC-10021', 'ABC Technologies Inc.', 'ABC Technologies Corporation',
        'https://abctechnologies.com', 'Enterprise Cloud & DevOps',
        'DIRECT_CLIENT', 'TIER_1', 'ACTIVE',
        '33333333-3333-3333-3333-000000000002',
        '{"street": "2100 Ross Avenue, Suite 1400", "city": "Dallas", "state": "TX", "zip": "75201", "country": "USA"}'::jsonb,
        'NET_30', 'https://beeline.abctechnologies.com'
    ),
    (
        '44444444-4444-4444-4444-000000000002',
        '11111111-1111-1111-1111-111111111111',
        'ACC-10022', 'Apex Systems LLC', 'Apex Systems LLC',
        'https://apexsystems.com', 'IT Staffing & MSP',
        'MSP', 'TIER_1', 'ACTIVE',
        '33333333-3333-3333-3333-000000000002',
        '{"street": "4400 Cox Road, Suite 200", "city": "Glen Allen", "state": "VA", "zip": "23060", "country": "USA"}'::jsonb,
        'NET_45', 'https://fieldglass.apexsystems.com'
    ),
    (
        '44444444-4444-4444-4444-000000000003',
        '11111111-1111-1111-1111-111111111111',
        'ACC-10023', 'Cognizant US', 'Cognizant Technology Solutions US Corp',
        'https://cognizant.com', 'Global IT Consulting',
        'IMPLEMENTATION_PARTNER', 'TIER_2', 'ACTIVE',
        '33333333-3333-3333-3333-000000000002',
        '{"street": "500 Frank W Burr Blvd", "city": "Teaneck", "state": "NJ", "zip": "07666", "country": "USA"}'::jsonb,
        'NET_60', 'https://supplier.cognizant.com'
    ),
    (
        '44444444-4444-4444-4444-000000000004',
        '11111111-1111-1111-1111-111111111111',
        'ACC-10024', 'Deloitte Digital', 'Deloitte Consulting LLP',
        'https://deloitte.com', 'Management & IT Consulting',
        'DIRECT_CLIENT', 'TIER_1', 'ACTIVE',
        '33333333-3333-3333-3333-000000000002',
        '{"street": "30 Rockefeller Plaza", "city": "New York", "state": "NY", "zip": "10112", "country": "USA"}'::jsonb,
        'NET_30', 'https://procure.deloitte.com'
    )
ON CONFLICT (id) DO NOTHING;

-- 5. Contacts (Client Stakeholders)
INSERT INTO contacts (
    id, organization_id, account_id, first_name, last_name, designation, email, phone, mobile, linkedin_url, is_primary, timezone, notes
) VALUES
    (
        '44444444-1111-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111111',
        '44444444-4444-4444-4444-000000000001',
        'Michael', 'Chang', 'Director of Cloud Engineering', 'mchang@abctechnologies.com',
        '+1 (214) 555-0144', '+1 (214) 555-0149', 'https://linkedin.com/in/michaelchang-cloud',
        TRUE, 'America/Chicago', 'Direct hiring manager for Cloud and DevOps requisitions'
    ),
    (
        '44444444-1111-0000-0000-000000000002',
        '11111111-1111-1111-1111-111111111111',
        '44444444-4444-4444-4444-000000000002',
        'David', 'Miller', 'Vendor Management Specialist', 'dmiller@apexsystems.com',
        '+1 (804) 555-0199', '+1 (804) 555-0195', 'https://linkedin.com/in/davidmiller-vms',
        TRUE, 'America/New_York', 'MSP manager for submittal approvals'
    )
ON CONFLICT (id) DO NOTHING;

-- 6. Leads (Prospects)
INSERT INTO leads (
    id, organization_id, company_name, contact_name, email, phone, source, status, assigned_sales_id, notes
) VALUES
    (
        '44444444-2222-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111111',
        'FinTech Dynamics', 'Kevin O''Connor', 'koconnor@fintechdynamics.io',
        '+1 (415) 555-0192', 'LINKEDIN', 'QUALIFIED',
        '33333333-3333-3333-3333-000000000004',
        'Scaling payments platform; needs 15 contract engineers'
    ),
    (
        '44444444-2222-0000-0000-000000000002',
        '11111111-1111-1111-1111-111111111111',
        'Healthcare Horizon AI', 'Dr. Evelyn Reed', 'ereed@horizonai.health',
        '+1 (617) 555-0167', 'COLD_CALL', 'CONTACTED',
        '33333333-3333-3333-3333-000000000004',
        'Seeking HIPAA compliant ML architects'
    )
ON CONFLICT (id) DO NOTHING;

-- 7. Opportunities (CRM Deals)
INSERT INTO opportunities (
    id, organization_id, account_id, title, expected_positions, pipeline_stage,
    estimated_revenue, probability, expected_close_date, assigned_user_id
) VALUES
    (
        '44444444-3333-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111111',
        '44444444-4444-4444-4444-000000000001',
        'Q4 Cloud Modernization Team Expansion', 5, 'PROPOSAL',
        185000.00, 75, '2026-11-30', '33333333-3333-3333-3333-000000000004'
    )
ON CONFLICT (id) DO NOTHING;

-- 8. Jobs (Job Requisitions)
INSERT INTO jobs (
    id, organization_id, job_code, account_id, contact_id, title, description,
    skills_required, openings, filled_positions, experience_min, experience_max,
    work_mode, employment_type, location, pay_rate_min, pay_rate_max, bill_rate_target,
    currency, priority, status, primary_recruiter_id, account_manager_id
) VALUES
    (
        '55555555-5555-5555-5555-000000000001',
        '11111111-1111-1111-1111-111111111111',
        'REQ-2026-081',
        '44444444-4444-4444-4444-000000000001',
        '44444444-1111-0000-0000-000000000001',
        'Senior AWS DevOps & Platform Engineer',
        'Looking for a Senior AWS DevOps Engineer to architect containerized infrastructure using Terraform, Kubernetes, and AWS EKS.',
        ARRAY['AWS', 'Terraform', 'Kubernetes', 'Docker', 'CI/CD', 'Helm', 'Python'],
        2, 1, 7.0, 10.0,
        'REMOTE', 'C2C', '{"city": "Dallas", "state": "TX", "zip": "75201"}'::jsonb,
        75.00, 85.00, 105.00,
        'USD', 'HIGH', 'OPEN',
        '33333333-3333-3333-3333-000000000003',
        '33333333-3333-3333-3333-000000000002'
    ),
    (
        '55555555-5555-5555-5555-000000000002',
        '11111111-1111-1111-1111-111111111111',
        'REQ-2026-094',
        '44444444-4444-4444-4444-000000000003',
        NULL,
        'Staff Java Full Stack Engineer (Spring Boot + React)',
        'Core banking distributed systems re-architecture requiring microservices, Kafka streaming, and React frontend.',
        ARRAY['Java 17', 'Spring Boot', 'React', 'TypeScript', 'Kafka', 'PostgreSQL'],
        3, 0, 9.0, 14.0,
        'HYBRID', 'W2', '{"city": "Jersey City", "state": "NJ", "zip": "07302"}'::jsonb,
        70.00, 80.00, 98.00,
        'USD', 'URGENT', 'OPEN',
        '33333333-3333-3333-3333-000000000003',
        '33333333-3333-3333-3333-000000000002'
    )
ON CONFLICT (id) DO NOTHING;

-- 9. Candidates Master Database
INSERT INTO candidates (
    id, organization_id, candidate_code, first_name, last_name, email, phone, normalized_phone,
    current_location, linkedin_url, work_authorization, security_clearance, preferred_employment_type,
    expected_rate, rate_type, total_experience, primary_skills, current_title, current_company,
    availability_notice, source, assigned_recruiter_id, status
) VALUES
    (
        '66666666-6666-6666-6666-000000000001',
        '11111111-1111-1111-1111-111111111111',
        'CAN-10041', 'Rajesh', 'Kulkarni', 'rajesh.kulkarni@gmail.com',
        '+1 (469) 555-0172', '14695550172',
        '{"city": "Plano", "state": "TX", "zip": "75024"}'::jsonb,
        'https://linkedin.com/in/rajesh-kulkarni-devops',
        'H1-B', 'None', 'C2C',
        85.00, 'HOURLY', 9.5,
        ARRAY['AWS', 'Terraform', 'Kubernetes', 'EKS', 'Jenkins', 'Python', 'Docker'],
        'Senior DevOps Specialist', 'Infosys Americas',
        '2 Weeks', 'LINKEDIN',
        '33333333-3333-3333-3333-000000000003',
        'AVAILABLE'
    ),
    (
        '66666666-6666-6666-6666-000000000002',
        '11111111-1111-1111-1111-111111111111',
        'CAN-10042', 'Jennifer', 'Walsh', 'jennifer.walsh@outlook.com',
        '+1 (201) 555-0139', '12015550139',
        '{"city": "Hoboken", "state": "NJ", "zip": "07030"}'::jsonb,
        'https://linkedin.com/in/jennifer-walsh-tech',
        'US Citizen', 'Public Trust', 'W2',
        80.00, 'HOURLY', 11.0,
        ARRAY['Java', 'Spring Boot', 'Kafka', 'React', 'PostgreSQL', 'Microservices'],
        'Staff Fullstack Engineer', 'Fintech Capital',
        'Immediate', 'DICE',
        '33333333-3333-3333-3333-000000000003',
        'AVAILABLE'
    )
ON CONFLICT (id) DO NOTHING;

-- 10. Candidate Documents (Resumes & Extracted Text)
INSERT INTO candidate_documents (
    id, organization_id, candidate_id, document_type, storage_path, original_filename,
    file_mime, file_size_bytes, parsed_json, extracted_text, is_primary, uploaded_by
) VALUES
    (
        '77777777-7777-7777-7777-000000000001',
        '11111111-1111-1111-1111-111111111111',
        '66666666-6666-6666-6666-000000000001',
        'FORMATTED_RESUME', 's3://pavion-resumes/2026/rajesh_kulkarni_aws_devops.pdf',
        'Rajesh_Kulkarni_DevOps_Lead.pdf', 'application/pdf', 245120,
        '{"name": "Rajesh Kulkarni", "skills": ["AWS", "Terraform", "Kubernetes", "Helm", "Python", "EKS"], "experience_years": 9.5, "education": "M.S. Computer Science"}'::jsonb,
        'Rajesh Kulkarni Senior AWS DevOps Engineer. 9+ years architecting CI/CD pipelines, Kubernetes EKS clusters, and Terraform IaC infrastructure on AWS Cloud.',
        TRUE, '33333333-3333-3333-3333-000000000003'
    )
ON CONFLICT (id) DO NOTHING;

-- 11. Candidate-to-Job Pipeline Junction
INSERT INTO candidate_jobs (
    id, organization_id, candidate_id, job_id, recruiter_id, current_stage, match_score
) VALUES
    (
        '88888888-8888-8888-8888-000000000001',
        '11111111-1111-1111-1111-111111111111',
        '66666666-6666-6666-6666-000000000001',
        '55555555-5555-5555-5555-000000000001',
        '33333333-3333-3333-3333-000000000003',
        'CLIENT_SUBMITTED', 94.50
    )
ON CONFLICT (id) DO NOTHING;

-- 12. Candidate Stage History (Audit Trail)
INSERT INTO candidate_stage_history (
    id, candidate_job_id, from_stage, to_stage, changed_by, transition_notes
) VALUES
    (
        '88888888-1111-0000-0000-000000000001',
        '88888888-8888-8888-8888-000000000001',
        'SOURCED', 'SCREENING',
        '33333333-3333-3333-3333-000000000003',
        'Passed technical screening call on AWS and Kubernetes fundamentals.'
    ),
    (
        '88888888-1111-0000-0000-000000000002',
        '88888888-8888-8888-8888-000000000001',
        'SCREENING', 'RTR_RECEIVED',
        '33333333-3333-3333-3333-000000000003',
        'Candidate signed exclusive Right to Represent consent at $85/hr C2C.'
    ),
    (
        '88888888-1111-0000-0000-000000000003',
        '88888888-8888-8888-8888-000000000001',
        'RTR_RECEIVED', 'CLIENT_SUBMITTED',
        '33333333-3333-3333-3333-000000000002',
        'Approved by Account Manager Sarah Jenkins and submitted to Director Michael Chang.'
    )
ON CONFLICT (id) DO NOTHING;

-- 13. Right to Represent (RTR)
INSERT INTO rtr_records (
    id, organization_id, candidate_id, job_id, consent_method, rate_agreed, rate_type,
    signed_document_url, consent_status, valid_until
) VALUES
    (
        '99999999-9999-9999-9999-000000000001',
        '11111111-1111-1111-1111-111111111111',
        '66666666-6666-6666-6666-000000000001',
        '55555555-5555-5555-5555-000000000001',
        'E_SIGNATURE', 85.00, 'HOURLY',
        'https://esign.pavion.com/verify/rtr_rajesh_kulkarni_req081.pdf',
        'ACCEPTED', CURRENT_TIMESTAMP + INTERVAL '30 days'
    )
ON CONFLICT (id) DO NOTHING;

-- 14. Submissions (Profile Sent to Client)
INSERT INTO submissions (
    id, organization_id, candidate_job_id, account_id, recruiter_id, resume_document_id, rtr_id,
    pay_rate, bill_rate, status, client_feedback
) VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
        '11111111-1111-1111-1111-111111111111',
        '88888888-8888-8888-8888-000000000001',
        '44444444-4444-4444-4444-000000000001',
        '33333333-3333-3333-3333-000000000003',
        '77777777-7777-7777-7777-000000000001',
        '99999999-9999-9999-9999-000000000001',
        85.00, 105.00, 'INTERVIEW_REQUESTED',
        'Strong match for AWS and Kubernetes. Director Michael Chang requested Round 2 technical panel.'
    )
ON CONFLICT (id) DO NOTHING;

-- 15. Interviews
INSERT INTO interviews (
    id, organization_id, submission_id, round_number, round_name, interview_type,
    meeting_link, scheduled_start, scheduled_end, client_timezone, status,
    interviewer_info, feedback_notes, rating, outcome
) VALUES
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-000000000001',
        '11111111-1111-1111-1111-111111111111',
        'aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
        2, 'Technical Architecture & Live Coding', 'TEAMS',
        'https://teams.microsoft.com/l/meetup-join/abc-tech-round2',
        CURRENT_TIMESTAMP + INTERVAL '2 days',
        CURRENT_TIMESTAMP + INTERVAL '2 days 1 hour',
        'America/Chicago', 'SCHEDULED',
        '[{"name": "Michael Chang", "role": "Director"}, {"name": "David Ross", "role": "Principal Architect"}]'::jsonb,
        'Focus on AWS multi-region failover and Terraform modular design.',
        5, 'PASSED'
    )
ON CONFLICT (id) DO NOTHING;

-- 16. Placements (Closed Won Hires)
INSERT INTO placements (
    id, organization_id, submission_id, candidate_id, job_id, account_id,
    start_date, end_date, employment_type, pay_rate, bill_rate,
    recruiter_commission, account_manager_commission, status, onboarding_checklist
) VALUES
    (
        'cccccccc-cccc-cccc-cccc-000000000001',
        '11111111-1111-1111-1111-111111111111',
        'aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
        '66666666-6666-6666-6666-000000000001',
        '55555555-5555-5555-5555-000000000001',
        '44444444-4444-4444-4444-000000000001',
        '2026-11-15', '2027-11-14', 'C2C',
        80.00, 105.00,
        1500.00, 2000.00,
        'ACTIVE',
        '{"background_check": "CLEARED", "drug_test": "PASSED", "i9_verification": "COMPLETED", "direct_deposit": "SET"}'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- 17. Activities (Unified Timeline)
INSERT INTO activities (
    id, organization_id, performed_by, activity_type, entity_type, entity_id, subject, description, metadata
) VALUES
    (
        'dddddddd-dddd-dddd-dddd-000000000001',
        '11111111-1111-1111-1111-111111111111',
        '33333333-3333-3333-3333-000000000003',
        'CALL', 'CANDIDATE', '66666666-6666-6666-6666-000000000001',
        'Initial Screening Call with Rajesh Kulkarni',
        'Discussed availability, C2C hourly rate ($85/hr), and Dallas onsite requirements.',
        '{"call_duration_seconds": 1140, "outcome": "QUALIFIED"}'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- 18. Audit Logs (Compliance & Security)
INSERT INTO audit_logs (
    id, organization_id, user_id, action, entity_type, entity_id, before_state, after_state
) VALUES
    (
        'eeeeeeee-eeee-eeee-eeee-000000000001',
        '11111111-1111-1111-1111-111111111111',
        '33333333-3333-3333-3333-000000000002',
        'SUBMISSION_APPROVED', 'SUBMISSION', 'aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
        '{"status": "INTERNAL_REVIEW"}'::jsonb,
        '{"status": "CLIENT_SUBMITTED", "bill_rate": 105.00, "pay_rate": 85.00}'::jsonb
    )
ON CONFLICT (id) DO NOTHING;
