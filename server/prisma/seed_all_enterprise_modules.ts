import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAllModules() {
  console.log('🌟 Expanding All Enterprise ATS & Recruitment Modules with Rich Dummy Data...');

  const org = await prisma.organization.findFirst({ where: { slug: 'pavion-tech' } }) ||
              await prisma.organization.findFirst();

  if (!org) {
    console.error('❌ Organization not found.');
    return;
  }

  const users = await prisma.user.findMany({ where: { organizationId: org.id } });
  const recruiter = users.find(u => u.role === 'SeniorRecruiter') || users[0];
  const accountManager = users.find(u => u.role === 'AccountManager') || users[0];
  const adminUser = users.find(u => u.role === 'SuperAdmin') || users[0];

  const accounts = await prisma.account.findMany({ where: { organizationId: org.id } });
  const candidates = await prisma.candidate.findMany({ where: { organizationId: org.id } });

  if (accounts.length === 0 || candidates.length === 0) {
    console.error('❌ Please ensure accounts and candidates exist.');
    return;
  }

  // 1. Add 10 High-Value Job Requisitions
  const newJobsData = [
    {
      jobCode: 'REQ-2026-021',
      title: 'Principal AWS Cloud Solutions Architect',
      accountName: 'Citigroup North America',
      requiredSkills: 'AWS, Kubernetes, Terraform, Python, Microservices',
      experienceMin: 8.0,
      city: 'Dallas',
      state: 'TX',
      workMode: 'Hybrid',
      employmentType: 'Contract C2C / W2',
      openings: 3,
      payRateMin: 90.0,
      payRateMax: 110.0,
      billRateMin: 120.0,
      billRateMax: 145.0,
      priority: 'Urgent',
      status: 'Open',
      description: 'Lead enterprise cloud architecture modernization across Citi Wealth Management distributed clusters.',
    },
    {
      jobCode: 'REQ-2026-022',
      title: 'Senior Java Spring Boot & Kafka Lead',
      accountName: 'JPMorgan Chase & Co.',
      requiredSkills: 'Java 21, Spring Boot, Apache Kafka, PostgreSQL, Docker',
      experienceMin: 7.0,
      city: 'Plano',
      state: 'TX',
      workMode: 'Hybrid',
      employmentType: 'Contract C2H',
      openings: 4,
      payRateMin: 80.0,
      payRateMax: 95.0,
      billRateMin: 105.0,
      billRateMax: 125.0,
      priority: 'High',
      status: 'Open',
      description: 'Core payment processing transaction pipelines with sub-second SLA requirements.',
    },
    {
      jobCode: 'REQ-2026-023',
      title: 'Snowflake Data Engineering Architect',
      accountName: 'Wells Fargo Technologies',
      requiredSkills: 'Snowflake, Python, DBT, Airflow, AWS',
      experienceMin: 6.5,
      city: 'Charlotte',
      state: 'NC',
      workMode: 'Remote',
      employmentType: 'Contract',
      openings: 2,
      payRateMin: 85.0,
      payRateMax: 105.0,
      billRateMin: 115.0,
      billRateMax: 135.0,
      priority: 'High',
      status: 'Interviewing',
      description: 'Design and deploy Snowflake data warehouse data mesh for consumer banking analytics.',
    },
    {
      jobCode: 'REQ-2026-024',
      title: 'Lead React & TypeScript Frontend Architect',
      accountName: 'Amazon Web Services (AWS ProServe)',
      requiredSkills: 'React 18, TypeScript, Next.js, MUI, GraphQL',
      experienceMin: 7.0,
      city: 'Seattle',
      state: 'WA',
      workMode: 'Remote',
      employmentType: 'Contract',
      openings: 3,
      payRateMin: 85.0,
      payRateMax: 105.0,
      billRateMin: 115.0,
      billRateMax: 140.0,
      priority: 'Medium',
      status: 'Open',
      description: 'Architect customer-facing cloud management console with microfrontend architecture.',
    },
    {
      jobCode: 'REQ-2026-025',
      title: 'Senior Site Reliability Engineer (Kubernetes & SRE)',
      accountName: 'Microsoft Enterprise Services',
      requiredSkills: 'Kubernetes, Azure AKS, Terraform, Prometheus, Go',
      experienceMin: 6.0,
      city: 'Redmond',
      state: 'WA',
      workMode: 'Hybrid',
      employmentType: 'Contract C2C',
      openings: 2,
      payRateMin: 90.0,
      payRateMax: 110.0,
      billRateMin: 120.0,
      billRateMax: 145.0,
      priority: 'Urgent',
      status: 'Open',
      description: 'Maintain 99.99% availability for enterprise mission-critical cloud platform clusters.',
    },
    {
      jobCode: 'REQ-2026-026',
      title: 'Senior Salesforce Apex & LWC Specialist',
      accountName: 'Walmart Global Tech',
      requiredSkills: 'Salesforce, Apex, LWC, SOQL, REST API',
      experienceMin: 5.5,
      city: 'Bentonville',
      state: 'AR',
      workMode: 'Remote',
      employmentType: 'Contract',
      openings: 2,
      payRateMin: 75.0,
      payRateMax: 92.0,
      billRateMin: 100.0,
      billRateMax: 120.0,
      priority: 'Medium',
      status: 'Open',
      description: 'Build enterprise supply chain customer relationship automation workflows.',
    },
    {
      jobCode: 'REQ-2026-027',
      title: 'Cybersecurity IAM & Okta Security Engineer',
      accountName: 'Deloitte Consulting US',
      requiredSkills: 'IAM, Okta, SAML, OAuth 2.0, Azure AD',
      experienceMin: 6.0,
      city: 'New York',
      state: 'NY',
      workMode: 'Hybrid',
      employmentType: 'Contract',
      openings: 2,
      payRateMin: 95.0,
      payRateMax: 115.0,
      billRateMin: 125.0,
      billRateMax: 155.0,
      priority: 'High',
      status: 'Interviewing',
      description: 'Enterprise zero-trust architecture and workforce identity integration.',
    },
    {
      jobCode: 'REQ-2026-028',
      title: 'Full Stack Python & AI Engineer (FastAPI)',
      accountName: 'Capgemini Americas',
      requiredSkills: 'Python, FastAPI, LangChain, PostgreSQL, Docker',
      experienceMin: 5.0,
      city: 'Chicago',
      state: 'IL',
      workMode: 'Remote',
      employmentType: 'Contract C2H',
      openings: 2,
      payRateMin: 80.0,
      payRateMax: 95.0,
      billRateMin: 105.0,
      billRateMax: 125.0,
      priority: 'Medium',
      status: 'Open',
      description: 'Build intelligent automated document extraction and LLM retrieval pipelines.',
    },
  ];

  let addedJobsCount = 0;
  for (const j of newJobsData) {
    const acc = accounts.find(a => a.name === j.accountName) || accounts[0];
    const existing = await prisma.jobRequisition.findFirst({
      where: { organizationId: org.id, jobCode: j.jobCode },
    });
    if (!existing) {
      await prisma.jobRequisition.create({
        data: {
          organizationId: org.id,
          jobCode: j.jobCode,
          accountId: acc.id,
          title: j.title,
          requiredSkills: j.requiredSkills,
          experienceMin: j.experienceMin,
          city: j.city,
          state: j.state,
          workMode: j.workMode,
          employmentType: j.employmentType,
          openings: j.openings,
          payRateMin: j.payRateMin,
          payRateMax: j.payRateMax,
          billRateMin: j.billRateMin,
          billRateMax: j.billRateMax,
          priority: j.priority,
          status: j.status,
          description: j.description,
          assignedRecruiterId: recruiter.id,
          accountManagerId: accountManager.id,
        },
      });
      addedJobsCount++;
    }
  }
  console.log(`✅ Added ${addedJobsCount} new job requisitions.`);

  const allJobs = await prisma.jobRequisition.findMany({ where: { organizationId: org.id } });

  // 2. Add CandidateJobs & Submissions
  let addedSubmissions = 0;
  for (let i = 0; i < 15; i++) {
    const c = candidates[i % candidates.length];
    const j = allJobs[i % allJobs.length];

    // Ensure CandidateJob junction exists
    let cj = await prisma.candidateJob.findFirst({
      where: { organizationId: org.id, candidateId: c.id, jobId: j.id },
    });

    if (!cj) {
      cj = await prisma.candidateJob.create({
        data: {
          organizationId: org.id,
          candidateId: c.id,
          jobId: j.id,
          recruiterId: recruiter.id,
          currentStage: 'SubmittedToClient',
          matchScore: 92.5,
          notes: 'Pre-screened with high compatibility.',
        },
      });
    }

    const existingSub = await prisma.submission.findFirst({
      where: { organizationId: org.id, candidateId: c.id, jobId: j.id },
    });

    if (!existingSub) {
      const payRate = (j.payRateMin || 75) + 5;
      const billRate = (j.billRateMin || 105) + 5;
      const statuses = ['Submitted', 'Shortlisted', 'InterviewScheduled', 'Offered', 'Placed'];

      await prisma.submission.create({
        data: {
          organizationId: org.id,
          candidateJobId: cj.id,
          candidateId: c.id,
          jobId: j.id,
          clientAccountId: j.accountId,
          recruiterId: recruiter.id,
          status: statuses[i % statuses.length],
          payRate,
          billRate,
          marginPercentage: Math.round(((billRate - payRate) / billRate) * 100),
          clientFeedback: 'Profile pre-screened with 92% match score. Cleared initial review.',
        },
      });
      addedSubmissions++;
    }
  }
  console.log(`✅ Added ${addedSubmissions} candidate submissions.`);

  // 3. Add Structured Interviews
  const submissionsList = await prisma.submission.findMany({
    where: { organizationId: org.id },
  });

  let addedInterviews = 0;
  for (let i = 0; i < Math.min(12, submissionsList.length); i++) {
    const sub = submissionsList[i];
    const rounds = ['Phone Screen', 'Technical Round 1', 'Client Hiring Manager', 'Final Leadership Round'];
    const roundName = rounds[i % rounds.length];
    const scheduledDate = new Date(Date.now() + (i * 2 - 4) * 24 * 60 * 60 * 1000);
    const isCompleted = scheduledDate < new Date();

    const existingInt = await prisma.interview.findFirst({
      where: { organizationId: org.id, submissionId: sub.id, roundName },
    });

    if (!existingInt) {
      await prisma.interview.create({
        data: {
          organizationId: org.id,
          submissionId: sub.id,
          jobId: sub.jobId,
          candidateId: sub.candidateId,
          interviewerName: 'Sarah Jenkins (Client VP)',
          roundName,
          roundNumber: (i % 4) + 1,
          interviewRound: 'Technical',
          interviewType: 'Video',
          status: isCompleted ? 'Completed' : 'Scheduled',
          scheduledAt: scheduledDate,
          meetingLink: `https://teams.microsoft.com/l/meetup-join/pavion-${sub.candidateId.substring(0, 8)}`,
          feedbackNotes: isCompleted ? 'Candidate demonstrated strong architectural depth and deep Kafka knowledge. Recommended to hire.' : null,
          rating: isCompleted ? 5 : null,
        },
      });
      addedInterviews++;
    }
  }
  console.log(`✅ Added ${addedInterviews} interview records.`);

  // 4. Add Placements
  let addedPlacements = 0;
  for (let i = 0; i < Math.min(6, submissionsList.length); i++) {
    const sub = submissionsList[i];
    const existingPlacement = await prisma.placement.findFirst({
      where: { organizationId: org.id, candidateId: sub.candidateId },
    });

    if (!existingPlacement) {
      const billRate = 125.0 - (i * 3);
      const payRate = 85.0 - (i * 2);
      const spread = billRate - payRate;

      await prisma.placement.create({
        data: {
          organizationId: org.id,
          submissionId: sub.id,
          candidateId: sub.candidateId,
          jobId: sub.jobId,
          clientAccountId: sub.clientAccountId,
          recruiterId: recruiter.id,
          startDate: new Date(Date.now() - (30 + i * 15) * 24 * 60 * 60 * 1000),
          billRate,
          payRate,
          grossMargin: Math.round(((spread / billRate) * 100) * 10) / 10,
          employmentType: 'Contract C2C',
          status: 'Active',
        },
      });
      addedPlacements++;
    }
  }
  console.log(`✅ Added ${addedPlacements} active placements.`);

  // 5. Add Offers
  let addedOffers = 0;
  for (let i = 0; i < Math.min(6, candidates.length); i++) {
    const c = candidates[(i + 12) % candidates.length];
    const j = allJobs[(i + 1) % allJobs.length];

    const existingOffer = await prisma.offer.findFirst({
      where: { organizationId: org.id, candidateId: c.id },
    });

    if (!existingOffer) {
      const statuses = ['Approved', 'Sent', 'Accepted', 'Draft'];
      await prisma.offer.create({
        data: {
          organizationId: org.id,
          candidateId: c.id,
          jobId: j.id,
          offerCode: `OFR-2026-0${20 + i}`,
          billRate: 120.0,
          payRate: 85.0,
          marginPercentage: 29.2,
          status: statuses[i % statuses.length],
          startDate: new Date(Date.now() + (10 + i * 5) * 24 * 60 * 60 * 1000),
          employmentType: 'Contract - C2C',
        },
      });
      addedOffers++;
    }
  }
  console.log(`✅ Added ${addedOffers} offer approval records.`);

  // 6. Add Onboarding Tasks
  const onboardingTaskTemplates = [
    { title: 'Form I-9 Work Eligibility Verification', category: 'I9_EVerify', status: 'Verified' },
    { title: 'W-4 Federal Tax Withholding Submission', category: 'Payroll', status: 'Verified' },
    { title: '10-Panel Drug Screen & Lab Results', category: 'DrugTest', status: 'Submitted' },
    { title: '7-Year County Criminal History Check', category: 'BGV', status: 'Verified' },
    { title: 'Client Secured Laptop & VPN Token Dispatch', category: 'Equipment', status: 'Pending' },
    { title: 'Signed Non-Disclosure & Intellectual Property Agreement', category: 'Document', status: 'Verified' },
    { title: 'Direct Deposit Electronic Funds Authorization', category: 'Payroll', status: 'Verified' },
    { title: 'First Day Client Orientation & Team Introduction', category: 'Document', status: 'Pending' },
  ];

  let addedOnboarding = 0;
  for (let i = 0; i < onboardingTaskTemplates.length; i++) {
    const t = onboardingTaskTemplates[i];
    const c = candidates[i % candidates.length];

    const existingTask = await prisma.onboardingTask.findFirst({
      where: { organizationId: org.id, title: t.title, candidateId: c.id },
    });

    if (!existingTask) {
      await prisma.onboardingTask.create({
        data: {
          organizationId: org.id,
          candidateId: c.id,
          title: t.title,
          category: t.category,
          status: t.status,
          dueDate: new Date(Date.now() + (i * 3 + 2) * 24 * 60 * 60 * 1000),
        },
      });
      addedOnboarding++;
    }
  }
  console.log(`✅ Added ${addedOnboarding} onboarding tasks.`);

  // 7. Add Compliance & Credential Records
  const credentialsTemplates = [
    { type: 'Certification', name: 'Work Authorization (OPT EAD)', auth: 'USCIS', idNum: 'EAD-WAC2490182390', daysExp: 24, status: 'ExpiringSoon' },
    { type: 'Certification', name: 'H-1B Specialty Occupation I-797', auth: 'USCIS', idNum: 'I797-LIN2390128491', daysExp: 55, status: 'ExpiringSoon' },
    { type: 'Certification', name: 'AWS Certified Solutions Architect - Professional', auth: 'Amazon Web Services', idNum: 'AWS-CERT-908234', daysExp: 380, status: 'Verified' },
    { type: 'License', name: 'Permanent Resident Card (Green Card)', auth: 'USCIS', idNum: 'GC-A98234901', daysExp: 1820, status: 'Verified' },
    { type: 'Certification', name: 'Certified Information Systems Security Professional (CISSP)', auth: 'ISC2', idNum: 'CISSP-549102', daysExp: 420, status: 'Verified' },
    { type: 'Certification', name: 'Snowflake SnowPro Core Certified', auth: 'Snowflake', idNum: 'SNOW-892104', daysExp: 290, status: 'Verified' },
    { type: 'Certification', name: 'Project Management Professional (PMP)', auth: 'PMI', idNum: 'PMP-8492019', daysExp: 510, status: 'Verified' },
  ];

  let addedCredentials = 0;
  for (let i = 0; i < credentialsTemplates.length; i++) {
    const cr = credentialsTemplates[i];
    const c = candidates[(i + 8) % candidates.length];

    const existingCred = await prisma.candidateCredential.findFirst({
      where: { organizationId: org.id, credentialIdNumber: cr.idNum },
    });

    if (!existingCred) {
      await prisma.candidateCredential.create({
        data: {
          organizationId: org.id,
          candidateId: c.id,
          credentialType: cr.type,
          name: cr.name,
          issuingAuthority: cr.auth,
          credentialIdNumber: cr.idNum,
          expiryDate: new Date(Date.now() + cr.daysExp * 24 * 60 * 60 * 1000),
          verificationStatus: cr.status,
        },
      });
      addedCredentials++;
    }
  }
  console.log(`✅ Added ${addedCredentials} compliance credential records.`);

  // 8. Add Staffing Vendors
  const vendorPartners = [
    { name: 'Apex Systems LLC', paymentTerms: 'Net 45', contactPerson: 'Mark Sullivan', email: 'msullivan@apexsystems.com', phone: '(804) 555-1200' },
    { name: 'Insight Global Technologies', paymentTerms: 'Net 30', contactPerson: 'Emily Zhang', email: 'ezhang@insightglobal.com', phone: '(404) 555-9800' },
    { name: 'Kforce Professional Staffing', paymentTerms: 'Net 45', contactPerson: 'Todd Richardson', email: 'trichardson@kforce.com', phone: '(813) 555-3400' },
    { name: 'Collabera Digital Solutions', paymentTerms: 'Net 30', contactPerson: 'Nitin Patel', email: 'npatel@collabera.com', phone: '(973) 555-6700' },
    { name: 'Mindlance Staffing Americas', paymentTerms: 'Net 30', contactPerson: 'Sunil Rao', email: 'srao@mindlance.com', phone: '(732) 555-8900' },
  ];

  let addedVendors = 0;
  for (const v of vendorPartners) {
    const existingVendor = await prisma.vendor.findFirst({
      where: { organizationId: org.id, name: v.name },
    });

    if (!existingVendor) {
      await prisma.vendor.create({
        data: {
          organizationId: org.id,
          name: v.name,
          paymentTerms: v.paymentTerms,
          contactPerson: v.contactPerson,
          email: v.email,
          phone: v.phone,
          status: 'Active',
          msaStatus: 'Active',
          rating: 5,
        },
      });
      addedVendors++;
    }
  }
  console.log(`✅ Added ${addedVendors} staffing vendors.`);

  // 9. Add Omnichannel Communication Logs
  const commChannels = ['Email', 'Phone', 'WhatsApp', 'LinkedIn'];
  const commSubjects = [
    'Right-to-Represent (RTR) Confirmation for Citigroup Architect Role',
    'Technical Interview Round 1 Feedback & Client Debrief',
    'Formal Offer Letter Discussion - Bill Rate & Start Date Confirmation',
    'Follow-up on Snowflake Pipeline Submittal & Client Feedback',
    'Contract Extension Confirmation (6 Months Renewal)',
  ];

  let addedComms = 0;
  for (let i = 0; i < 12; i++) {
    const c = candidates[i % candidates.length];
    await prisma.communicationLog.create({
      data: {
        organizationId: org.id,
        candidateId: c.id,
        channel: commChannels[i % commChannels.length],
        direction: i % 2 === 0 ? 'Outbound' : 'Inbound',
        subject: commSubjects[i % commSubjects.length],
        body: `Discussed candidate availability, agreed compensation rate of $85/hr, and remote work policy.`,
        sentBy: recruiter.firstName + ' ' + recruiter.lastName,
        status: 'Sent',
      },
    });
    addedComms++;
  }
  console.log(`✅ Added ${addedComms} communication logs.`);

  console.log('🎉 ALL RECRUITMENT & ATS MODULES SEEDED WITH RICH ENTERPRISE DUMMY DATA!');
}

seedAllModules()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
