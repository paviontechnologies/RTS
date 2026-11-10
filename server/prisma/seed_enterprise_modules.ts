import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding 9 Enterprise ATS & Recruitment Operations Modules...');

  const org = await prisma.organization.findFirst({ where: { slug: 'pavion-tech' } }) ||
              await prisma.organization.findFirst();

  if (!org) {
    console.error('❌ No organization found. Please run base seed first.');
    return;
  }

  const orgId = org.id;
  const candidates = await prisma.candidate.findMany({ where: { organizationId: orgId }, take: 25 });
  const jobs = await prisma.jobRequisition.findMany({ where: { organizationId: orgId }, include: { account: true }, take: 10 });
  const adminUser = await prisma.user.findFirst({ where: { organizationId: orgId } });
  const userId = adminUser?.id || '';

  if (candidates.length === 0 || jobs.length === 0) {
    console.error('❌ Insufficient candidates or jobs found.');
    return;
  }

  // 1. TALENT POOLS
  console.log('📦 Seeding Talent Pools & Communities...');
  const poolData = [
    {
      name: 'Java & Cloud Microservices Talent Community',
      description: 'Pre-vetted senior Java 17+, Spring Boot, Kafka, and AWS cloud backend specialists for financial and retail enterprise accounts.',
      category: 'Java / Backend',
      tags: JSON.stringify(['Java 17', 'Spring Boot', 'AWS', 'Microservices', 'Kafka', 'PostgreSQL']),
      targetSkills: 'Java, Spring Boot, AWS, Kafka, Microservices, Docker',
    },
    {
      name: 'React 18 & Full-Stack TypeScript Talent Pool',
      description: 'Front-of-the-glass modern UI engineers proficient in React, Next.js, Material-UI, GraphQL, and Node microservices.',
      category: 'Frontend / Full-Stack',
      tags: JSON.stringify(['React', 'TypeScript', 'Node.js', 'Next.js', 'Tailwind', 'GraphQL']),
      targetSkills: 'React, TypeScript, Next.js, Redux, Node.js, REST API',
    },
    {
      name: 'DevOps, SRE & Cloud Infrastructure Guild',
      description: 'Certified Kubernetes administrators, Terraform automation leads, and CI/CD security specialists with active clearance/US citizenship.',
      category: 'DevOps / Cloud',
      tags: JSON.stringify(['Kubernetes', 'Terraform', 'AWS', 'Azure', 'Docker', 'Jenkins', 'ArgoCD']),
      targetSkills: 'Kubernetes, Terraform, AWS, Azure, CI/CD, Python, Linux',
    },
    {
      name: 'Salesforce & CRM Enterprise Practice',
      description: 'Salesforce CPQ, Sales Cloud, Service Cloud developers and solution architects available for rapid client onboarding.',
      category: 'Enterprise Applications',
      tags: JSON.stringify(['Salesforce', 'Apex', 'Lightning Web Components', 'CPQ', 'MuleSoft']),
      targetSkills: 'Salesforce, Apex, LWC, CPQ, SOQL, MuleSoft',
    },
    {
      name: 'Healthcare & Clinical Informatics Specialists',
      description: 'EPIC certified analysts, HIPAA compliance specialists, and healthcare data integration architects for hospital systems.',
      category: 'Healthcare Staffing',
      tags: JSON.stringify(['Epic Systems', 'Cerner', 'HIPAA', 'HL7', 'FHIR', 'Registered Nurse']),
      targetSkills: 'Epic, HL7, FHIR, HIPAA, EHR, Healthcare Informatics',
    },
  ];

  for (let i = 0; i < poolData.length; i++) {
    const p = poolData[i];
    const pool = await prisma.talentPool.create({
      data: {
        organizationId: orgId,
        ...p,
        status: 'Active',
      },
    });

    // Add 3-4 candidates to each pool
    const poolCandidates = candidates.slice(i * 4, i * 4 + 4);
    for (const c of poolCandidates) {
      await prisma.talentPoolMember.create({
        data: {
          talentPoolId: pool.id,
          candidateId: c.id,
          addedById: userId,
          status: 'Active',
          notes: 'Pre-screened and vetted during Q4 bench sourcing campaign.',
        },
      });
    }
  }

  // 2. CANDIDATE SCREENINGS & KILLER QUESTIONS
  console.log('📋 Seeding Candidate Screenings & Killer Question Assessments...');
  const killerQuestions = [
    { question: 'Are you authorized to work in the United States without employer sponsorship?', answer: 'Yes - US Citizen / Green Card', passed: true },
    { question: 'What is your confirmed minimum hourly pay rate on W-2 or C2C?', answer: '$75.00 / hr confirmed', passed: true },
    { question: 'What is your earliest availability to begin on-site/remote?', answer: 'Immediate (within 1 week)', passed: true },
    { question: 'Do you have hands-on production experience deploying Microservices on AWS/Kubernetes?', answer: '5+ years production experience with EKS & Helm', passed: true },
    { question: 'Are you open to client background check and 10-panel drug test clearance?', answer: 'Yes, no concerns', passed: true },
  ];

  for (let i = 0; i < 5; i++) {
    const candidate = candidates[i];
    const job = jobs[i % jobs.length];

    await prisma.screeningAssessment.create({
      data: {
        organizationId: orgId,
        candidateId: candidate.id,
        jobId: job.id,
        recruiterId: userId,
        title: `Initial Technical & Rate Screening - ${job.title}`,
        status: 'Completed',
        overallScore: 88 + (i * 2),
        recommendation: i === 4 ? 'OnHold' : 'Proceed',
        workAuthVerified: true,
        availabilityConfirmed: 'Immediate',
        rateConfirmed: 75.0,
        notes: `Candidate demonstrated exceptional grasp of ${job.requiredSkills}. Communication is articulate and professional. Strong recommendation for client submission.`,
        questionsJson: JSON.stringify(killerQuestions),
      },
    });
  }

  // 3. INTERVIEW KITS & SCORECARDS
  console.log('🎯 Seeding Interview Kits & Standardized Scorecards...');
  const kit1 = await prisma.interviewKit.create({
    data: {
      organizationId: orgId,
      title: 'Full-Stack Java / Cloud Engineering - Technical Round 1',
      jobRole: 'Senior Java Cloud Developer',
      roundType: 'Technical',
      competencies: JSON.stringify([
        'Core Java & Concurrency',
        'Spring Boot & Microservices Architecture',
        'Cloud & AWS Infrastructure',
        'Database Optimization & SQL',
        'Problem Solving & Coding Standards',
      ]),
      questionsJson: JSON.stringify([
        { area: 'Core Java', question: 'Explain how Java 21 Virtual Threads differ from traditional platform threads.' },
        { area: 'Microservices', question: 'How do you handle distributed transaction rollback across multiple services using the SAGA pattern?' },
        { area: 'AWS Cloud', question: 'Explain your strategy for securing AWS API Gateway with OAuth2 JWT tokens.' },
        { area: 'Data', question: 'How do you diagnose and eliminate N+1 query performance bottlenecks in Hibernate/JPA?' },
      ]),
      status: 'Active',
    },
  });

  const kit2 = await prisma.interviewKit.create({
    data: {
      organizationId: orgId,
      title: 'React & Frontend Architecture - System Design & Coding',
      jobRole: 'Lead Frontend Engineer',
      roundType: 'SystemDesign',
      competencies: JSON.stringify([
        'React 18 Concurrent Rendering',
        'State Management & Cache Strategy',
        'Web Performance & Core Web Vitals',
        'Design Systems & Accessible UI (WCAG)',
      ]),
      questionsJson: JSON.stringify([
        { area: 'React', question: 'When would you use useDeferredValue or useTransition to prevent UI locking on large data sets?' },
        { area: 'Performance', question: 'How do you optimize Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS) on dynamic dashboards?' },
      ]),
      status: 'Active',
    },
  });

  // Seed Scorecards for candidate 0 and 1
  await prisma.interviewScorecard.create({
    data: {
      organizationId: orgId,
      interviewKitId: kit1.id,
      candidateId: candidates[0].id,
      interviewerName: 'Marcus Vance (Principal Architect)',
      interviewerEmail: 'marcus.vance@anthem.com',
      overallRating: 5,
      recommendation: 'StrongHire',
      strengths: 'Deep knowledge of distributed caching, Kafka consumer groups, and Spring Boot memory profiling.',
      weaknesses: 'None observed. Clean design thinking and excellent clarity.',
      ratingsJson: JSON.stringify({
        'Core Java & Concurrency': 5,
        'Spring Boot & Microservices Architecture': 5,
        'Cloud & AWS Infrastructure': 4,
        'Database Optimization & SQL': 5,
        'Problem Solving & Coding Standards': 5,
      }),
      notes: 'Unanimous recommendation to proceed to client offer immediately.',
    },
  });

  await prisma.interviewScorecard.create({
    data: {
      organizationId: orgId,
      interviewKitId: kit2.id,
      candidateId: candidates[1].id,
      interviewerName: 'Elena Rostova (VP of Engineering)',
      interviewerEmail: 'elena.rostova@lowes.com',
      overallRating: 4,
      recommendation: 'Hire',
      strengths: 'Strong component architecture, clean CSS-in-JS patterns, and pragmatic problem-solving speed.',
      weaknesses: 'Minor latency in explaining SSR edge caching.',
      ratingsJson: JSON.stringify({
        'React 18 Concurrent Rendering': 4,
        'State Management & Cache Strategy': 5,
        'Web Performance & Core Web Vitals': 4,
        'Design Systems & Accessible UI (WCAG)': 5,
      }),
      notes: 'Solid senior frontend contributor who will add immediate velocity to the team.',
    },
  });

  // 4. OFFER MANAGEMENT & SPREAD CALCULATOR
  console.log('💵 Seeding Offer Management & Gross Spread Workflows...');
  const offersData = [
    {
      candidate: candidates[0],
      job: jobs[0],
      payRate: 85.0,
      billRate: 125.0,
      overtimeRate: 127.5,
      employmentType: 'Contract - W2',
      status: 'Approved',
      offerCode: 'OFF-2026-081',
      benefitsDetails: 'Comprehensive medical, dental, vision insurance + 401(k) eligibility after 90 days.',
    },
    {
      candidate: candidates[1],
      job: jobs[1] || jobs[0],
      payRate: 78.0,
      billRate: 115.0,
      overtimeRate: 117.0,
      employmentType: 'Contract - C2C',
      status: 'Sent',
      offerCode: 'OFF-2026-082',
      benefitsDetails: 'C2C Net 30 direct wire payment schedule.',
    },
    {
      candidate: candidates[2],
      job: jobs[2] || jobs[0],
      payRate: 92.0,
      billRate: 140.0,
      overtimeRate: 138.0,
      employmentType: 'Contract - W2',
      status: 'Accepted',
      offerCode: 'OFF-2026-083',
      benefitsDetails: 'Full healthcare coverage + remote equipment stipend.',
    },
    {
      candidate: candidates[3],
      job: jobs[3] || jobs[0],
      payRate: 70.0,
      billRate: 100.0,
      overtimeRate: 105.0,
      employmentType: 'Contract - W2',
      status: 'PendingApproval',
      offerCode: 'OFF-2026-084',
      benefitsDetails: 'Standard W-2 hourly benefits package.',
    },
  ];

  for (const o of offersData) {
    const spreadHourly = o.billRate - o.payRate;
    const marginPercentage = (spreadHourly / o.billRate) * 100;

    await prisma.offer.create({
      data: {
        organizationId: orgId,
        candidateId: o.candidate.id,
        jobId: o.job.id,
        offerCode: o.offerCode,
        payRate: o.payRate,
        billRate: o.billRate,
        overtimeRate: o.overtimeRate,
        spreadHourly: Number(spreadHourly.toFixed(2)),
        marginPercentage: Number(marginPercentage.toFixed(2)),
        employmentType: o.employmentType,
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        benefitsDetails: o.benefitsDetails,
        status: o.status,
        approvalLevel: 'Approved',
        approvedById: userId,
        sentAt: o.status === 'Sent' || o.status === 'Accepted' ? new Date() : null,
        acceptedAt: o.status === 'Accepted' ? new Date() : null,
        notes: `Created for client ${o.job.account?.name}. Target start date confirmed with hiring manager.`,
      },
    });
  }

  // 5. CANDIDATE ONBOARDING & DOCUMENT VERIFICATION
  console.log('📑 Seeding Candidate Onboarding Tasks & Document Checks...');
  const onboardingItems = [
    { category: 'Document', title: 'W-4 Federal Tax Withholding', description: 'Signed and dated federal W-4 tax document', status: 'Verified' },
    { category: 'I9_EVerify', title: 'Form I-9 & Passport Verification', description: 'Section 1 completed, verified with US Passport', status: 'Verified' },
    { category: 'Document', title: 'Direct Deposit Authorization & Voided Check', description: 'Bank details confirmed for bi-weekly payroll', status: 'Verified' },
    { category: 'BGV', title: '7-Year Criminal Background Verification', description: 'Comprehensive county and federal criminal check', status: 'Verified' },
    { category: 'DrugTest', title: '10-Panel Laboratory Drug Screen', description: 'LabCorp clearance certificate received', status: 'Verified' },
    { category: 'Equipment', title: 'Client Laptop & VPN Security Token', description: 'MacBook Pro shipped with Fedex tracking', status: 'Pending' },
  ];

  for (const item of onboardingItems) {
    await prisma.onboardingTask.create({
      data: {
        organizationId: orgId,
        candidateId: candidates[2].id,
        category: item.category,
        title: item.title,
        description: item.description,
        status: item.status,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        verifiedAt: item.status === 'Verified' ? new Date() : null,
        verificationNotes: item.status === 'Verified' ? 'Approved by Pavion Compliance Officer.' : null,
      },
    });
  }

  // 6. CREDENTIAL & COMPLIANCE MANAGEMENT
  console.log('🛡️ Seeding Credential & Expiration Alerts...');
  const credentialsData = [
    {
      candidate: candidates[0],
      type: 'Certification',
      name: 'AWS Certified Solutions Architect - Professional',
      authority: 'Amazon Web Services',
      idNumber: 'AWS-PSA-908123',
      expiryDays: 24, // Expiring in <30 days!
      status: 'Verified',
    },
    {
      candidate: candidates[1],
      type: 'Certification',
      name: 'Certified Kubernetes Administrator (CKA)',
      authority: 'Cloud Native Computing Foundation (CNCF)',
      idNumber: 'CKA-887123',
      expiryDays: 52, // Expiring in <60 days!
      status: 'Verified',
    },
    {
      candidate: candidates[2],
      type: 'License',
      name: 'Registered Nurse (RN) Multi-State Compact License',
      authority: 'Texas Board of Nursing',
      idNumber: 'RN-TX-440192',
      state: 'TX',
      expiryDays: 320, // Valid
      status: 'Verified',
    },
    {
      candidate: candidates[3],
      type: 'Certification',
      name: 'Project Management Professional (PMP)',
      authority: 'Project Management Institute (PMI)',
      idNumber: 'PMP-2091823',
      expiryDays: -10, // Expired!
      status: 'Expired',
    },
    {
      candidate: candidates[4],
      type: 'Certification',
      name: 'Certified Information Systems Security Professional (CISSP)',
      authority: '(ISC)²',
      idNumber: 'CISSP-559012',
      expiryDays: 180,
      status: 'Verified',
    },
  ];

  for (const cred of credentialsData) {
    const issueDate = new Date(Date.now() - 700 * 24 * 60 * 60 * 1000);
    const expiryDate = new Date(Date.now() + cred.expiryDays * 24 * 60 * 60 * 1000);

    await prisma.candidateCredential.create({
      data: {
        organizationId: orgId,
        candidateId: cred.candidate.id,
        credentialType: cred.type,
        name: cred.name,
        issuingAuthority: cred.authority,
        credentialIdNumber: cred.idNumber,
        state: (cred as any).state || '',
        issueDate,
        expiryDate,
        verificationStatus: cred.status,
        notes: cred.expiryDays < 30 ? 'Renewal reminder triggered to candidate.' : 'Verified in official registry.',
      },
    });
  }

  // 7. CANDIDATE COMMUNICATION & ENGAGEMENT
  console.log('💬 Seeding Message Templates & Communication Logs...');
  const templates = [
    {
      name: 'Client Technical Interview Invitation',
      category: 'Interview',
      channel: 'Email',
      subject: 'Interview Scheduled: {{jobTitle}} with {{clientName}}',
      body: 'Hi {{candidateName}},\n\nCongratulations! The hiring team at {{clientName}} was very impressed with your profile and has requested a technical interview round for the position of {{jobTitle}}.\n\nTime: {{interviewTime}}\nMeeting Link: {{meetingLink}}\n\nPlease reply to confirm your attendance.\n\nBest regards,\nPavion Talent Team',
    },
    {
      name: 'Official Offer Letter Notification',
      category: 'Offer',
      channel: 'Email',
      subject: 'Formal Offer of Employment: {{jobTitle}} at {{clientName}}',
      body: 'Dear {{candidateName}},\n\nWe are delighted to extend a formal offer of engagement for the {{jobTitle}} opening at {{clientName}} with a confirmed pay rate of ${{payRate}}/hr.\n\nPlease review the attached offer document and sign to begin onboarding.\n\nCongratulations!',
    },
    {
      name: 'Quick Recruiter SMS Check-In',
      category: 'Screening',
      channel: 'SMS',
      subject: 'Pavion Sourcing Check-in',
      body: 'Hi {{candidateName}}, this is {{recruiterName}} from Pavion Tech. We have an exciting opening for {{jobTitle}} paying ${{payRate}}/hr. Are you available for a brief 5-min chat today?',
    },
  ];

  for (const t of templates) {
    await prisma.messageTemplate.create({
      data: {
        organizationId: orgId,
        name: t.name,
        category: t.category,
        channel: t.channel,
        subject: t.subject,
        body: t.body,
        variablesJson: JSON.stringify(['candidateName', 'jobTitle', 'clientName', 'payRate', 'interviewTime']),
      },
    });
  }

  // Seed sample logs
  for (let i = 0; i < 4; i++) {
    await prisma.communicationLog.create({
      data: {
        organizationId: orgId,
        candidateId: candidates[i].id,
        channel: i % 2 === 0 ? 'Email' : 'SMS',
        direction: 'Outbound',
        subject: `Interview Update & Next Steps - ${jobs[i % jobs.length].title}`,
        body: `Hello ${candidates[i].firstName}, we have submitted your resume to ${jobs[i % jobs.length].account?.name} and are coordinating interview slots with the hiring manager.`,
        status: 'Delivered',
        sentBy: 'Priya Sharma (Senior Recruiter)',
      },
    });
  }

  // 8. CONSULTANT REDEPLOYMENT & ROLL-OFF PLACEMENTS
  console.log('🔄 Updating Placements with Roll-Off Dates for Redeployment Tracking...');
  const placements = await prisma.placement.findMany({ where: { organizationId: orgId } });
  if (placements.length > 0) {
    // Set 1 placement rolling off in 12 days
    await prisma.placement.update({
      where: { id: placements[0].id },
      data: { endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000) },
    });
    // Set 1 placement rolling off in 25 days
    if (placements.length > 1) {
      await prisma.placement.update({
        where: { id: placements[1].id },
        data: { endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000) },
      });
    }
  }

  // 9. VENDOR / MSP / VMS MANAGEMENT
  console.log('🤝 Seeding Vendors, C2C Partners & Vendor Submissions...');
  const vendorsData = [
    {
      name: 'Apex Global Tech Solutions Inc.',
      vendorType: 'C2C_Subcontractor',
      tier: 'Tier1',
      contactPerson: 'Arunav Sengupta',
      email: 'arunav@apexglobaltech.com',
      phone: '+1 (732) 555-8910',
      website: 'https://apexglobaltech.com',
      taxIdEin: '22-9018231',
      msaStatus: 'Active',
      paymentTerms: 'Net 45',
    },
    {
      name: 'InfoMatrix US Staffing Partners',
      vendorType: 'Staffing_Agency',
      tier: 'Preferred',
      contactPerson: 'Rachel Adams',
      email: 'rachel.adams@infomatrixpartners.com',
      phone: '+1 (212) 555-3421',
      website: 'https://infomatrixpartners.com',
      taxIdEin: '13-8891204',
      msaStatus: 'Active',
      paymentTerms: 'Net 30',
    },
    {
      name: 'Healthcare Clinicians Direct MSP',
      vendorType: 'MSP_Partner',
      tier: 'Tier1',
      contactPerson: 'David Miller',
      email: 'dmiller@hcdirectmsp.org',
      phone: '+1 (404) 555-7729',
      website: 'https://hcdirectmsp.org',
      taxIdEin: '58-1029384',
      msaStatus: 'Active',
      paymentTerms: 'Net 60',
    },
    {
      name: 'Silicon Valley Cloud Consultants LLC',
      vendorType: 'C2C_Subcontractor',
      tier: 'Tier2',
      contactPerson: 'Karan Patel',
      email: 'karan@svcloudconsultants.com',
      phone: '+1 (408) 555-9012',
      website: 'https://svcloudconsultants.com',
      taxIdEin: '94-7718290',
      msaStatus: 'Pending',
      paymentTerms: 'Net 45',
    },
  ];

  for (const v of vendorsData) {
    const vendor = await prisma.vendor.create({
      data: {
        organizationId: orgId,
        ...v,
        status: 'Active',
      },
    });

    // Create primary contact
    await prisma.vendorContact.create({
      data: {
        vendorId: vendor.id,
        firstName: v.contactPerson.split(' ')[0],
        lastName: v.contactPerson.split(' ')[1] || 'Partner',
        designation: 'Director of Staffing Alliances',
        email: v.email,
        phone: v.phone,
        isPrimary: true,
      },
    });

    // Create vendor submission for jobs
    await prisma.vendorSubmission.create({
      data: {
        organizationId: orgId,
        vendorId: vendor.id,
        jobId: jobs[0].id,
        candidateName: `Rajesh V. (${v.name.split(' ')[0]})`,
        candidateEmail: `candidate.${Date.now().toString().slice(-4)}@${v.email.split('@')[1]}`,
        submittedRate: 88.0,
        status: 'UnderReview',
        notes: `Submitted by ${v.name} for ${jobs[0].title}. Rate $88/hr C2C all-inclusive.`,
      },
    });
  }

  console.log('✅ Successfully seeded all 9 Enterprise ATS Modules!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding enterprise modules:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
