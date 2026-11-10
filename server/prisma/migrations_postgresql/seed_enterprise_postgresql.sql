-- =============================================================================
-- PAVION TECHNOLOGIES - ENTERPRISE POSTGRESQL SEED SCRIPT
-- Realistic US Staffing Datasets across all 8 Schemas
-- =============================================================================

DO $$
DECLARE
    org_id UUID;
    dept_it UUID;
    dept_sales UUID;
    dept_recruitment UUID;
    role_admin UUID;
    role_recruiter UUID;
    role_am UUID;
    role_bde UUID;
    user_admin UUID;
    user_recruiter UUID;
    user_am UUID;
    user_bde UUID;
    acct_anthem UUID;
    acct_jpmc UUID;
    acct_deloitte UUID;
    contact_anthem UUID;
    job_java UUID;
    job_aws UUID;
    cand_srikant UUID;
    cand_priya UUID;
    cand_john UUID;
    cand_job_srikant UUID;
    cand_job_priya UUID;
    stage_sourced UUID;
    stage_screened UUID;
    stage_rtr UUID;
    stage_submitted UUID;
    stage_interview UUID;
    stage_offer UUID;
    stage_placed UUID;
    rtr_srikant UUID;
    sub_srikant UUID;
    offer_srikant UUID;
    plc_srikant UUID;
BEGIN
    -- 1. CORE ORGANIZATION
    INSERT INTO core.organizations (name, legal_name, slug, website, business_email, phone, timezone, currency, date_format)
    VALUES (
        'Pavion Technologies Inc.',
        'Pavion Technologies US Staffing Solutions LLC',
        'pavion-technologies',
        'https://paviontechnologies.com',
        'contact@paviontechnologies.com',
        '+1 (732) 555-0199',
        'America/New_York',
        'USD',
        'MM/DD/YYYY'
    )
    RETURNING id INTO org_id;

    -- 2. DEPARTMENTS
    INSERT INTO core.departments (organization_id, name, code)
    VALUES (org_id, 'US IT Staffing Delivery', 'IT_STAFFING') RETURNING id INTO dept_it;

    INSERT INTO core.departments (organization_id, name, code)
    VALUES (org_id, 'Sales & Account Management', 'SALES_AM') RETURNING id INTO dept_sales;

    INSERT INTO core.departments (organization_id, name, code)
    VALUES (org_id, 'Talent Acquisition & Sourcing', 'RECRUITMENT') RETURNING id INTO dept_recruitment;

    -- 3. ROLES
    INSERT INTO auth.roles (organization_id, name, code, description, is_system_default)
    VALUES (org_id, 'Super Admin', 'SUPER_ADMIN', 'Complete platform governance, all organizations, and system controls', TRUE)
    RETURNING id INTO role_admin;

    INSERT INTO auth.roles (organization_id, name, code, description, is_system_default)
    VALUES (org_id, 'Senior Recruiter', 'SENIOR_RECRUITER', 'ATS requisitions, sourcing, pipeline, interview kits, and candidate engagement', TRUE)
    RETURNING id INTO role_recruiter;

    INSERT INTO auth.roles (organization_id, name, code, description, is_system_default)
    VALUES (org_id, 'Account Manager', 'ACCOUNT_MANAGER', 'Client management, recruiter coordination, submissions, and feedback decisions', TRUE)
    RETURNING id INTO role_am;

    INSERT INTO auth.roles (organization_id, name, code, description, is_system_default)
    VALUES (org_id, 'Business Development Executive', 'SALES_BDE', 'CRM leads, prospect accounts, deals, and sales activities', TRUE)
    RETURNING id INTO role_bde;

    -- 4. USERS (bcrypt default hash for Password123!)
    INSERT INTO auth.users (organization_id, department_id, first_name, last_name, email, password_hash, phone, status)
    VALUES (org_id, dept_it, 'Vikram', 'Sharma', 'admin@pavion.com', '$2b$10$wE9m0F6x3Fp0Kq4n5eH2f.d5vR.4hF0k1m9eN2q8l5v1m4e9m0F6x', '+1 (732) 555-0101', 'ACTIVE')
    RETURNING id INTO user_admin;

    INSERT INTO auth.users (organization_id, department_id, first_name, last_name, email, password_hash, phone, status)
    VALUES (org_id, dept_recruitment, 'Marcus', 'Vance', 'marcus.vance@pavion.com', '$2b$10$wE9m0F6x3Fp0Kq4n5eH2f.d5vR.4hF0k1m9eN2q8l5v1m4e9m0F6x', '+1 (732) 555-0102', 'ACTIVE')
    RETURNING id INTO user_recruiter;

    INSERT INTO auth.users (organization_id, department_id, first_name, last_name, email, password_hash, phone, status)
    VALUES (org_id, dept_sales, 'Priya', 'Patel', 'priya.patel@pavion.com', '$2b$10$wE9m0F6x3Fp0Kq4n5eH2f.d5vR.4hF0k1m9eN2q8l5v1m4e9m0F6x', '+1 (732) 555-0103', 'ACTIVE')
    RETURNING id INTO user_am;

    INSERT INTO auth.users (organization_id, department_id, first_name, last_name, email, password_hash, phone, status)
    VALUES (org_id, dept_sales, 'Rahul', 'Mehta', 'rahul.mehta@pavion.com', '$2b$10$wE9m0F6x3Fp0Kq4n5eH2f.d5vR.4hF0k1m9eN2q8l5v1m4e9m0F6x', '+1 (732) 555-0104', 'ACTIVE')
    RETURNING id INTO user_bde;

    -- User Roles Mapping
    INSERT INTO auth.user_roles (user_id, role_id) VALUES
    (user_admin, role_admin),
    (user_recruiter, role_recruiter),
    (user_am, role_am),
    (user_bde, role_bde);

    -- 5. RECRUITMENT STAGES (Configurable Pipeline Funnel)
    INSERT INTO recruitment.recruitment_stages (organization_id, name, stage_code, sequence, stage_type)
    VALUES (org_id, 'Sourced', 'SOURCED', 1, 'ACTIVE') RETURNING id INTO stage_sourced;

    INSERT INTO recruitment.recruitment_stages (organization_id, name, stage_code, sequence, stage_type)
    VALUES (org_id, 'Recruiter Screened', 'SCREENED', 2, 'ACTIVE') RETURNING id INTO stage_screened;

    INSERT INTO recruitment.recruitment_stages (organization_id, name, stage_code, sequence, stage_type)
    VALUES (org_id, 'RTR Approved', 'RTR_APPROVED', 3, 'ACTIVE') RETURNING id INTO stage_rtr;

    INSERT INTO recruitment.recruitment_stages (organization_id, name, stage_code, sequence, stage_type)
    VALUES (org_id, 'Client Submitted', 'SUBMITTED', 4, 'ACTIVE') RETURNING id INTO stage_submitted;

    INSERT INTO recruitment.recruitment_stages (organization_id, name, stage_code, sequence, stage_type)
    VALUES (org_id, 'Interview Scheduled', 'INTERVIEW', 5, 'ACTIVE') RETURNING id INTO stage_interview;

    INSERT INTO recruitment.recruitment_stages (organization_id, name, stage_code, sequence, stage_type)
    VALUES (org_id, 'Offer Extended', 'OFFER', 6, 'ACTIVE') RETURNING id INTO stage_offer;

    INSERT INTO recruitment.recruitment_stages (organization_id, name, stage_code, sequence, stage_type, is_terminal)
    VALUES (org_id, 'Placed / Start Confirmed', 'PLACED', 7, 'CLOSED_WON', TRUE) RETURNING id INTO stage_placed;

    -- 6. CRM ACCOUNTS & CONTACTS
    INSERT INTO crm.accounts (organization_id, account_code, name, industry, company_size, account_type, account_manager_id, payment_terms, status)
    VALUES (org_id, 'CLI-ANTHEM', 'Anthem Health Solutions', 'Healthcare & Life Sciences', '10,000+ employees', 'Direct Client', user_am, 'Net 45', 'ACTIVE')
    RETURNING id INTO acct_anthem;

    INSERT INTO crm.accounts (organization_id, account_code, name, industry, company_size, account_type, account_manager_id, payment_terms, status)
    VALUES (org_id, 'CLI-JPMC', 'JPMorgan Chase & Co.', 'Banking & Financial Services', '10,000+ employees', 'Direct Client', user_am, 'Net 30', 'ACTIVE')
    RETURNING id INTO acct_jpmc;

    INSERT INTO crm.accounts (organization_id, account_code, name, industry, company_size, account_type, account_manager_id, payment_terms, status)
    VALUES (org_id, 'CLI-DELOITTE', 'Deloitte Consulting US', 'Management Consulting & IT', '5,000+ employees', 'MSP Partner', user_am, 'Net 60', 'ACTIVE')
    RETURNING id INTO acct_deloitte;

    -- Contacts
    INSERT INTO crm.contacts (organization_id, account_id, first_name, last_name, title, department, email, phone, is_hiring_manager)
    VALUES (org_id, acct_anthem, 'David', 'Kramer', 'VP of Enterprise Engineering', 'Cloud Core', 'david.kramer@anthem.com', '+1 (317) 555-0120', TRUE)
    RETURNING id INTO contact_anthem;

    -- 7. ATS JOB REQUISITIONS
    INSERT INTO ats.job_requisitions (
        organization_id, job_code, account_id, contact_id, title, description, requirements,
        employment_type, work_mode, openings, filled_positions, experience_min, experience_max,
        pay_rate_min, pay_rate_max, bill_rate_min, bill_rate_max, priority, status, created_by
    )
    VALUES (
        org_id, 'REQ-1001', acct_anthem, contact_anthem, 'Senior Java Cloud Architect',
        'Lead high-scale microservices migration on AWS and Spring Boot framework.',
        'Java 17, Spring Boot, AWS, Kafka, Microservices, Docker, Kubernetes',
        'Contract - W2', 'Hybrid', 2, 1, 8.0, 14.0, 65.00, 75.00, 95.00, 105.00, 'Urgent', 'Open', user_recruiter
    )
    RETURNING id INTO job_java;

    INSERT INTO ats.job_requisitions (
        organization_id, job_code, account_id, title, description, requirements,
        employment_type, work_mode, openings, filled_positions, experience_min, experience_max,
        pay_rate_min, pay_rate_max, bill_rate_min, bill_rate_max, priority, status, created_by
    )
    VALUES (
        org_id, 'REQ-1002', acct_jpmc, 'AWS Solutions Architect',
        'Architect enterprise cloud data platforms with strict financial security and compliance.',
        'AWS, Terraform, IAM, CloudWatch, PostgreSQL, DynamoDB, Python',
        'Contract - W2', 'Remote', 1, 0, 10.0, 16.0, 80.00, 90.00, 115.00, 125.00, 'High', 'Open', user_recruiter
    )
    RETURNING id INTO job_aws;

    -- Recruiter Assignments
    INSERT INTO ats.job_assignments (organization_id, job_id, recruiter_id, target_submissions)
    VALUES (org_id, job_java, user_recruiter, 5), (org_id, job_aws, user_recruiter, 4);

    -- 8. CANDIDATES (Normalized Contacts & Skills)
    INSERT INTO ats.candidates (
        organization_id, candidate_code, first_name, last_name, professional_summary,
        current_title, current_company, total_experience, work_authorization, expected_pay_rate,
        source, assigned_recruiter_id, status
    )
    VALUES (
        org_id, 'CAN-1001', 'Srikant', 'Iyer', 'Senior Java Architect with 9+ years delivering healthcare cloud systems.',
        'Senior Java Cloud Developer', 'Cognizant US', 9.5, 'US Citizen', 70.00,
        'LinkedIn Recruiter', user_recruiter, 'Placed'
    )
    RETURNING id INTO cand_srikant;

    INSERT INTO ats.candidates (
        organization_id, candidate_code, first_name, last_name, professional_summary,
        current_title, current_company, total_experience, work_authorization, expected_pay_rate,
        source, assigned_recruiter_id, status
    )
    VALUES (
        org_id, 'CAN-1002', 'Priya', 'Nair', 'AWS Certified Solutions Architect with deep FinTech Terraform automation experience.',
        'Principal Cloud Architect', 'Wipro Digital', 11.0, 'Green Card', 85.00,
        'Dice', user_recruiter, 'Active'
    )
    RETURNING id INTO cand_priya;

    -- Candidate Emails & Phones
    INSERT INTO ats.candidate_emails (organization_id, candidate_id, email, is_primary, is_verified) VALUES
    (org_id, cand_srikant, 'srikant.iyer@gmail.com', TRUE, TRUE),
    (org_id, cand_priya, 'priya.nair@cloudconsult.com', TRUE, TRUE);

    INSERT INTO ats.candidate_phones (organization_id, candidate_id, phone_number, phone_type, is_primary) VALUES
    (org_id, cand_srikant, '+1 (408) 555-0144', 'Mobile', TRUE),
    (org_id, cand_priya, '+1 (201) 555-0188', 'Mobile', TRUE);

    -- Candidate Skills
    INSERT INTO ats.candidate_skills (organization_id, candidate_id, skill_name, experience_years, proficiency) VALUES
    (org_id, cand_srikant, 'Java', 9.5, 'Expert'),
    (org_id, cand_srikant, 'Spring Boot', 8.0, 'Expert'),
    (org_id, cand_srikant, 'AWS Microservices', 6.0, 'Expert'),
    (org_id, cand_priya, 'AWS Architecture', 10.0, 'Expert'),
    (org_id, cand_priya, 'Terraform', 7.0, 'Expert');

    -- 9. CANDIDATE JOBS (Central Recruitment Junction Hub)
    INSERT INTO recruitment.candidate_jobs (
        organization_id, candidate_id, job_id, recruiter_id, current_stage_id, application_status, match_score
    )
    VALUES (org_id, cand_srikant, job_java, user_recruiter, stage_placed, 'Hired', 96.50)
    RETURNING id INTO cand_job_srikant;

    INSERT INTO recruitment.candidate_jobs (
        organization_id, candidate_id, job_id, recruiter_id, current_stage_id, application_status, match_score
    )
    VALUES (org_id, cand_priya, job_aws, user_recruiter, stage_interview, 'InProcess', 93.00)
    RETURNING id INTO cand_job_priya;

    -- Stage History
    INSERT INTO recruitment.candidate_stage_history (organization_id, candidate_job_id, from_stage_id, to_stage_id, changed_by, reason)
    VALUES
    (org_id, cand_job_srikant, stage_sourced, stage_screened, user_recruiter, 'Candidate passed initial technical phone screening'),
    (org_id, cand_job_srikant, stage_screened, stage_rtr, user_recruiter, 'Candidate signed electronic RTR consent'),
    (org_id, cand_job_srikant, stage_rtr, stage_submitted, user_recruiter, 'Submitted to Anthem hiring manager'),
    (org_id, cand_job_srikant, stage_submitted, stage_interview, user_am, 'Client requested final technical video interview'),
    (org_id, cand_job_srikant, stage_interview, stage_offer, user_am, 'Cleared interview with Strong Hire score'),
    (org_id, cand_job_srikant, stage_offer, stage_placed, user_admin, 'Offer accepted, onboarded, and placed');

    -- 10. RTR RECORD
    INSERT INTO recruitment.rtr_records (
        organization_id, candidate_id, job_id, client_account_id, candidate_job_id, consent_method, consent_status
    )
    VALUES (org_id, cand_srikant, job_java, acct_anthem, cand_job_srikant, 'E-Signature Document', 'Approved')
    RETURNING id INTO rtr_srikant;

    -- 11. SUBMISSIONS
    INSERT INTO recruitment.submissions (
        organization_id, candidate_job_id, client_account_id, recruiter_id, rtr_id, pay_rate, bill_rate, status
    )
    VALUES (org_id, cand_job_srikant, acct_anthem, user_recruiter, rtr_srikant, 65.00, 95.00, 'Placed')
    RETURNING id INTO sub_srikant;

    -- 12. OFFERS & SPREAD
    INSERT INTO recruitment.offers (
        organization_id, submission_id, candidate_id, job_id, offer_code, pay_rate, bill_rate,
        overtime_rate, spread_hourly, margin_percentage, employment_type, start_date, status, offer_letter_content
    )
    VALUES (
        org_id, sub_srikant, cand_srikant, job_java, 'OFF-2026-001', 65.00, 95.00,
        97.50, 30.00, 31.58, 'Contract - W2', CURRENT_DATE + INTERVAL '14 days', 'Accepted',
        'OFFICIAL OFFER OF ENGAGEMENT: Position of Senior Java Cloud Architect at Anthem Health Solutions.'
    )
    RETURNING id INTO offer_srikant;

    -- 13. PLACEMENTS
    INSERT INTO recruitment.placements (
        organization_id, submission_id, candidate_id, job_id, client_account_id, offer_id,
        start_date, end_date, employment_type, pay_rate, bill_rate, gross_margin, status, account_manager_id
    )
    VALUES (
        org_id, sub_srikant, cand_srikant, job_java, acct_anthem, offer_srikant,
        CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '194 days', 'Contract - W2',
        65.00, 95.00, 30.00, 'Active', user_am
    )
    RETURNING id INTO plc_srikant;

    -- 14. ONBOARDING TASKS
    INSERT INTO recruitment.onboarding_tasks (organization_id, placement_id, candidate_id, category, title, description, status, due_date)
    VALUES
    (org_id, plc_srikant, cand_srikant, 'Document', 'W-4 Federal Tax Form', 'Signed federal withholding certificate', 'Verified', CURRENT_DATE + INTERVAL '5 days'),
    (org_id, plc_srikant, cand_srikant, 'I9_EVerify', 'Form I-9 & Passport Verification', 'Section 1 & 2 verification with US passport', 'Verified', CURRENT_DATE + INTERVAL '3 days'),
    (org_id, plc_srikant, cand_srikant, 'BGV', '7-Year Criminal Background Screening', 'Sterling Check criminal and 10-year residency clearance', 'Verified', CURRENT_DATE + INTERVAL '7 days'),
    (org_id, plc_srikant, cand_srikant, 'DrugTest', '10-Panel Laboratory Drug Screen', 'Quest Diagnostics 10-panel negative panel', 'Verified', CURRENT_DATE + INTERVAL '6 days'),
    (org_id, plc_srikant, cand_srikant, 'Equipment', 'Client Hardware & VPN Setup', 'Lenovo ThinkPad P16 and Anthem VPN badge credentialing', 'Pending', CURRENT_DATE + INTERVAL '10 days');

    -- 15. COMPLIANCE & VISAS
    INSERT INTO compliance.candidate_credentials (
        organization_id, candidate_id, credential_type, name, issuing_authority, credential_id_number,
        state, issue_date, expiry_date, verification_status
    )
    VALUES (
        org_id, cand_srikant, 'WorkAuthorization', 'US Passport & Citizen Verification', 'US Department of State',
        'USA-P-9928172', 'National', '2020-05-15', '2030-05-14', 'Verified'
    ),
    (
        org_id, cand_priya, 'WorkAuthorization', 'Permanent Resident Alien Card (Green Card)', 'USCIS',
        'USCIS-PR-881920', 'National', '2021-02-10', '2031-02-09', 'Verified'
    ),
    (
        org_id, cand_priya, 'Certification', 'AWS Certified Solutions Architect - Professional', 'Amazon Web Services',
        'AWS-SAP-981729', 'National', '2024-01-10', '2027-01-09', 'Verified'
    );

    -- 16. SHARED COMMUNICATIONS
    INSERT INTO operations.communication_logs (
        organization_id, candidate_id, channel, direction, subject, body, sent_by, status
    )
    VALUES (
        org_id, cand_srikant, 'Email', 'Outbound', 'Interview Confirmation - Anthem Technical Round',
        'Hi Srikant, Congratulations! You have cleared your technical round and received an offer.',
        'Marcus Vance', 'Delivered'
    );

    -- 17. AUDIT LOGS
    INSERT INTO analytics.audit_logs (
        organization_id, user_id, action, entity_type, entity_id, new_state
    )
    VALUES (
        org_id, user_admin, 'PLATFORM_INITIALIZATION', 'ORGANIZATION', org_id::text,
        '{"status": "INITIALIZED", "schema_version": "2.0.0", "entities_count": 60}'::jsonb
    );

END $$;
