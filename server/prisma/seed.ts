import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Pavion Technologies US Staffing ATS + CRM Platform...');

  // 1. Create Organization
  let org = await prisma.organization.findFirst({ where: { slug: 'pavion-tech' } });
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'Pavion Technologies Pvt. Ltd.',
        legalName: 'Pavion Technologies Inc.',
        slug: 'pavion-tech',
        website: 'https://paviontechnologies.com',
        timezone: 'America/New_York',
        defaultCurrency: 'USD',
        status: 'ACTIVE',
      },
    });
  }

  // 2. Create Users
  const passwordHash = await bcrypt.hash('admin123', 10);

  const usersData = [
    {
      firstName: 'Vikram',
      lastName: 'Sharma',
      email: 'admin@pavion.com',
      role: 'SuperAdmin',
      department: 'Executive Management',
    },
    {
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'sarah.jenkins@pavion.com',
      role: 'AccountManager',
      department: 'Client Relations',
    },
    {
      firstName: 'Alex',
      lastName: 'Carter',
      email: 'alex.carter@pavion.com',
      role: 'SeniorRecruiter',
      department: 'IT Recruitment',
    },
    {
      firstName: 'Marcus',
      lastName: 'Vance',
      email: 'marcus.vance@pavion.com',
      role: 'BusinessDevelopmentExecutive',
      department: 'Sales & Business Development',
    },
  ];

  const createdUsers: any = {};
  for (const u of usersData) {
    let user = await prisma.user.findFirst({
      where: { organizationId: org.id, email: u.email },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          organizationId: org.id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          passwordHash,
          role: u.role,
          department: u.department,
          status: 'ACTIVE',
        },
      });
    }
    createdUsers[u.email] = user;
  }

  const adminUser = createdUsers['admin@pavion.com'];
  const accountManager = createdUsers['sarah.jenkins@pavion.com'];
  const recruiter = createdUsers['alex.carter@pavion.com'];
  const salesExec = createdUsers['marcus.vance@pavion.com'];

  // 3. Create Client Accounts
  const accountsData = [
    {
      name: 'ABC Technologies Inc.',
      legalName: 'ABC Technologies Corporation',
      website: 'https://abctechnologies.com',
      industry: 'Enterprise Software & Cloud',
      accountType: 'DirectClient',
      companySize: '500-1000',
      headquarters: 'Dallas, TX',
      paymentTerms: 'Net 30',
      status: 'Active',
      notes: 'Tier 1 strategic client with ongoing cloud migration projects.',
      accountManagerId: accountManager.id,
    },
    {
      name: 'Apex Systems',
      legalName: 'Apex Systems LLC',
      website: 'https://apexsystems.com',
      industry: 'IT Staffing & Consulting',
      accountType: 'StaffingVendor',
      companySize: '1000+',
      headquarters: 'Glen Allen, VA',
      paymentTerms: 'Net 45',
      status: 'Active',
      notes: 'High-volume partner supplying Fortune 500 contracts.',
      accountManagerId: accountManager.id,
    },
    {
      name: 'Cognizant US',
      legalName: 'Cognizant Technology Solutions US Corporation',
      website: 'https://cognizant.com',
      industry: 'Global IT Services',
      accountType: 'ImplementationPartner',
      companySize: '10000+',
      headquarters: 'Teaneck, NJ',
      paymentTerms: 'Net 60',
      status: 'Active',
      notes: 'Subcontracts enterprise banking and insurance accounts.',
      accountManagerId: accountManager.id,
    },
    {
      name: 'Kaiser Permanente Health',
      legalName: 'Kaiser Foundation Hospitals Inc.',
      website: 'https://kaiserpermanente.org',
      industry: 'Healthcare & HealthTech',
      accountType: 'MSP',
      companySize: '10000+',
      headquarters: 'Oakland, CA',
      paymentTerms: 'Net 30',
      status: 'Active',
      notes: 'Healthcare VMS/MSP vendor account requiring HIPAA compliance.',
      accountManagerId: accountManager.id,
    },
  ];

  const createdAccounts: any = {};
  for (const a of accountsData) {
    let acc = await prisma.account.findFirst({
      where: { organizationId: org.id, name: a.name },
    });
    if (!acc) {
      acc = await prisma.account.create({
        data: {
          organizationId: org.id,
          ...a,
        },
      });
    }
    createdAccounts[a.name] = acc;
  }

  // 4. Create Client Contacts
  const contactsData = [
    {
      accountName: 'ABC Technologies Inc.',
      firstName: 'David',
      lastName: 'Miller',
      designation: 'VP of Engineering',
      department: 'Engineering',
      email: 'david.miller@abctechnologies.com',
      phone: '(214) 555-0192',
      isPrimary: true,
    },
    {
      accountName: 'ABC Technologies Inc.',
      firstName: 'Rachel',
      lastName: 'Green',
      designation: 'Technical Talent Acquisition Manager',
      department: 'HR & Talent',
      email: 'rachel.g@abctechnologies.com',
      phone: '(214) 555-0198',
      isPrimary: false,
    },
    {
      accountName: 'Apex Systems',
      firstName: 'Michael',
      lastName: 'Chang',
      designation: 'Vendor Manager',
      department: 'Procurement',
      email: 'mchang@apexsystems.com',
      phone: '(804) 555-4321',
      isPrimary: true,
    },
    {
      accountName: 'Cognizant US',
      firstName: 'Siddharth',
      lastName: 'Rao',
      designation: 'Delivery Director',
      department: 'Financial Services Practice',
      email: 'siddharth.rao@cognizant.com',
      phone: '(201) 555-7890',
      isPrimary: true,
    },
  ];

  const createdContacts: any = {};
  for (const c of contactsData) {
    const acc = createdAccounts[c.accountName];
    if (acc) {
      let contact = await prisma.contact.findFirst({
        where: { organizationId: org.id, email: c.email },
      });
      if (!contact) {
        contact = await prisma.contact.create({
          data: {
            organizationId: org.id,
            accountId: acc.id,
            firstName: c.firstName,
            lastName: c.lastName,
            designation: c.designation,
            department: c.department,
            email: c.email,
            phone: c.phone,
            isPrimary: c.isPrimary,
          },
        });
      }
      createdContacts[c.email] = contact;
    }
  }

  // 5. Create Leads
  const leadsData = [
    {
      companyName: 'CloudScale Data Corp',
      website: 'https://cloudscaledata.io',
      industry: 'Data & Analytics',
      contactPerson: 'Jessica Taylor',
      email: 'jessica@cloudscaledata.io',
      phone: '(415) 555-8765',
      location: 'San Francisco, CA',
      leadSource: 'LinkedIn',
      status: 'Qualified',
      priority: 'High',
      notes: 'Needs 5 Snowflake & Data Engineering specialists for Q1 kickoff.',
      assignedUserId: salesExec.id,
    },
    {
      companyName: 'NextGen Financial Systems',
      website: 'https://nextgenfintech.com',
      industry: 'FinTech / Banking',
      contactPerson: 'Robert Sterling',
      email: 'rsterling@nextgenfintech.com',
      phone: '(212) 555-9012',
      location: 'New York, NY',
      leadSource: 'Referral',
      status: 'Meeting Scheduled',
      priority: 'Urgent',
      notes: 'Replacing current staffing agency due to slow submittal times.',
      assignedUserId: salesExec.id,
    },
    {
      companyName: 'BioHealth Solutions',
      website: 'https://biohealthsolutions.org',
      industry: 'Healthcare / Pharma',
      contactPerson: 'Elena Rostova',
      email: 'elena@biohealthsolutions.org',
      phone: '(617) 555-3456',
      location: 'Boston, MA',
      leadSource: 'Email Enquiries',
      status: 'Proposal Sent',
      priority: 'High',
      notes: 'Master Services Agreement (MSA) currently under legal review.',
      assignedUserId: salesExec.id,
    },
  ];

  for (const l of leadsData) {
    const existing = await prisma.lead.findFirst({
      where: { organizationId: org.id, companyName: l.companyName },
    });
    if (!existing) {
      await prisma.lead.create({
        data: {
          organizationId: org.id,
          ...l,
        },
      });
    }
  }

  // 6. Create Opportunities
  const oppsData = [
    {
      accountName: 'ABC Technologies Inc.',
      name: 'ABC Cloud Migration Engineering Team (5 Roles)',
      stage: 'Negotiation',
      estimatedValue: 240000,
      probability: 80,
      expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      assignedUserId: salesExec.id,
      notes: 'Finalizing bill rate caps for 5 cloud engineers.',
    },
    {
      accountName: 'Cognizant US',
      name: 'Banking Modernization React/Node Developers',
      stage: 'Requirements Discussion',
      estimatedValue: 180000,
      probability: 60,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      assignedUserId: salesExec.id,
      notes: 'Reviewing job specs for 3 Full Stack roles in Charlotte, NC.',
    },
  ];

  for (const o of oppsData) {
    const acc = createdAccounts[o.accountName];
    if (acc) {
      const existing = await prisma.opportunity.findFirst({
        where: { organizationId: org.id, name: o.name },
      });
      if (!existing) {
        await prisma.opportunity.create({
          data: {
            organizationId: org.id,
            accountId: acc.id,
            name: o.name,
            stage: o.stage,
            estimatedValue: o.estimatedValue,
            probability: o.probability,
            expectedCloseDate: o.expectedCloseDate,
            assignedUserId: o.assignedUserId,
            notes: o.notes,
          },
        });
      }
    }
  }

  // 7. Create Job Requisitions
  const jobsData = [
    {
      jobCode: 'REQ-2026-0001',
      accountName: 'ABC Technologies Inc.',
      title: 'Senior Full Stack Java Developer',
      description: 'Looking for a Senior Full Stack Java Developer with 7+ years of experience building scalable enterprise microservices using Spring Boot, React, and AWS Cloud.',
      requiredSkills: 'Java, Spring Boot, React, TypeScript, Microservices, AWS, PostgreSQL, Docker',
      experienceMin: 7,
      experienceMax: 10,
      city: 'Dallas',
      state: 'TX',
      workMode: 'Hybrid',
      employmentType: 'Contract',
      openings: 2,
      filledPositions: 1,
      payRateMin: 75,
      payRateMax: 85,
      billRateMin: 110,
      billRateMax: 125,
      priority: 'High',
      status: 'Open',
      duration: '12 Months',
      assignedRecruiterId: recruiter.id,
    },
    {
      jobCode: 'REQ-2026-0002',
      accountName: 'ABC Technologies Inc.',
      title: 'AWS Cloud Solutions Architect',
      description: 'Architect and execute migration of legacy on-prem infrastructure to AWS. Must hold AWS Certified Solutions Architect Professional and deep Terraform & Kubernetes experience.',
      requiredSkills: 'AWS, Terraform, Kubernetes, Docker, CI/CD, Linux, Python, Architecture',
      experienceMin: 9,
      experienceMax: 14,
      city: 'Austin',
      state: 'TX',
      workMode: 'Remote',
      employmentType: 'Contract',
      openings: 1,
      filledPositions: 0,
      payRateMin: 100,
      payRateMax: 115,
      billRateMin: 145,
      billRateMax: 160,
      priority: 'Urgent',
      status: 'Open',
      duration: '6 Months',
      assignedRecruiterId: recruiter.id,
    },
    {
      jobCode: 'REQ-2026-0003',
      accountName: 'Cognizant US',
      title: 'Frontend React / TypeScript Lead',
      description: 'Lead frontend architecture for our global banking customer portal. Strong UI component design, Material UI, WebSockets, and state management.',
      requiredSkills: 'React, TypeScript, Redux, Material UI, HTML5, CSS3, REST API, Jest',
      experienceMin: 6,
      experienceMax: 9,
      city: 'Charlotte',
      state: 'NC',
      workMode: 'Remote',
      employmentType: 'Contract',
      openings: 3,
      filledPositions: 0,
      payRateMin: 70,
      payRateMax: 80,
      billRateMin: 105,
      billRateMax: 115,
      priority: 'High',
      status: 'Open',
      duration: '12 Months',
      assignedRecruiterId: recruiter.id,
    },
    {
      jobCode: 'REQ-2026-0004',
      accountName: 'Kaiser Permanente Health',
      title: 'Healthcare Epic Data Analyst',
      description: 'Analyze electronic health record (EHR) data, generate clinical metric dashboards, and support HIPAA compliance reporting using SQL, Snowflake, and Tableau.',
      requiredSkills: 'SQL, Snowflake, Tableau, Power BI, Python, Healthcare, Epic, Data Analysis',
      experienceMin: 5,
      experienceMax: 8,
      city: 'Oakland',
      state: 'CA',
      workMode: 'Remote',
      employmentType: 'Full-time',
      openings: 1,
      filledPositions: 0,
      payRateMin: 65,
      payRateMax: 75,
      billRateMin: 95,
      billRateMax: 105,
      priority: 'Medium',
      status: 'Open',
      duration: 'Permanent',
      assignedRecruiterId: recruiter.id,
    },
  ];

  const createdJobs: any = {};
  for (const j of jobsData) {
    const acc = createdAccounts[j.accountName];
    if (acc) {
      let job = await prisma.jobRequisition.findFirst({
        where: { organizationId: org.id, jobCode: j.jobCode },
      });
      if (!job) {
        job = await prisma.jobRequisition.create({
          data: {
            organizationId: org.id,
            jobCode: j.jobCode,
            accountId: acc.id,
            title: j.title,
            description: j.description,
            requiredSkills: j.requiredSkills,
            experienceMin: j.experienceMin,
            experienceMax: j.experienceMax,
            city: j.city,
            state: j.state,
            workMode: j.workMode,
            employmentType: j.employmentType,
            openings: j.openings,
            filledPositions: j.filledPositions,
            payRateMin: j.payRateMin,
            payRateMax: j.payRateMax,
            billRateMin: j.billRateMin,
            billRateMax: j.billRateMax,
            priority: j.priority,
            status: j.status,
            duration: j.duration,
            createdById: adminUser.id,
            assignedRecruiterId: j.assignedRecruiterId,
          },
        });
      }
      createdJobs[j.jobCode] = job;
    }
  }

  // 8. Create Candidates
  const candidatesData = [
    {
      candidateCode: 'CAN-2026-00001',
      firstName: 'Amit',
      lastName: 'Patel',
      email: 'amit.patel@example.com',
      phone: '(469) 555-8291',
      city: 'Frisco',
      state: 'TX',
      currentTitle: 'Lead Java Microservices Engineer',
      currentEmployer: 'Capital Tech Partners',
      totalExperience: 8.5,
      relevantExperience: 7,
      skills: 'Java, Spring Boot, Microservices, React, AWS, PostgreSQL, Kafka, Docker',
      professionalSummary: 'Senior Full Stack Java Engineer with 8+ years developing high-throughput financial microservices and React dashboards.',
      education: 'B.S. in Computer Science',
      certifications: 'AWS Certified Developer Associate',
      availability: '2 Weeks Notice',
      expectedPayRate: 80,
      preferredType: 'Contract (W2 / C2C)',
      workAuthorization: 'US Citizen',
      assignedRecruiterId: recruiter.id,
    },
    {
      candidateCode: 'CAN-2026-00002',
      firstName: 'Brandon',
      lastName: 'Hayes',
      email: 'brandon.hayes@example.com',
      phone: '(512) 555-4309',
      city: 'Austin',
      state: 'TX',
      currentTitle: 'Principal Cloud & DevOps Architect',
      currentEmployer: 'CloudScale Consulting',
      totalExperience: 11,
      relevantExperience: 10,
      skills: 'AWS, Terraform, Kubernetes, Docker, CI/CD, Linux, Python, Microservices',
      professionalSummary: 'Solutions Architect with 11 years leading multi-region AWS infrastructure migrations and GitOps Kubernetes pipelines.',
      education: 'M.S. in Information Systems',
      certifications: 'AWS Solutions Architect Professional, CKA (Certified Kubernetes Administrator)',
      availability: 'Immediate',
      expectedPayRate: 110,
      preferredType: 'Contract',
      workAuthorization: 'US Citizen',
      assignedRecruiterId: recruiter.id,
    },
    {
      candidateCode: 'CAN-2026-00003',
      firstName: 'Priya',
      lastName: 'Nair',
      email: 'priya.nair@example.com',
      phone: '(704) 555-9821',
      city: 'Charlotte',
      state: 'NC',
      currentTitle: 'Senior React / Frontend Developer',
      currentEmployer: 'Bank of America (Contractor)',
      totalExperience: 7,
      relevantExperience: 6,
      skills: 'React, TypeScript, Redux, Material UI, JavaScript, HTML5, CSS3, GraphQL, Jest',
      professionalSummary: 'Frontend specialist experienced in building responsive enterprise portals, component design systems, and financial analytics UIs.',
      education: 'B.Tech in Computer Engineering',
      certifications: 'Meta Certified Frontend Developer',
      availability: 'Immediate',
      expectedPayRate: 75,
      preferredType: 'Contract (W2)',
      workAuthorization: 'Green Card',
      assignedRecruiterId: recruiter.id,
    },
    {
      candidateCode: 'CAN-2026-00004',
      firstName: 'Carlos',
      lastName: 'Mendoza',
      email: 'carlos.mendoza@example.com',
      phone: '(415) 555-1290',
      city: 'San Francisco',
      state: 'CA',
      currentTitle: 'Senior Healthcare Data Analyst',
      currentEmployer: 'Sutter Health',
      totalExperience: 6,
      relevantExperience: 5.5,
      skills: 'SQL, Snowflake, Tableau, Power BI, Python, Healthcare, Epic, Data Analysis',
      professionalSummary: 'Healthcare Data Analyst with deep clinical data modeling, Epic EHR extraction, and executive Tableau reporting experience.',
      education: 'B.S. in Health Informatics',
      certifications: 'Tableau Certified Data Analyst',
      availability: '1 Week',
      expectedPayRate: 70,
      preferredType: 'Contract-to-hire',
      workAuthorization: 'US Citizen',
      assignedRecruiterId: recruiter.id,
    },
  ];

  const createdCandidates: any = {};
  for (const c of candidatesData) {
    let candidate = await prisma.candidate.findFirst({
      where: { organizationId: org.id, email: c.email },
    });
    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: {
          organizationId: org.id,
          ...c,
        },
      });
    }
    createdCandidates[c.email] = candidate;
  }

  // 9. Create CandidateJob Associations & Pipelines
  const javaJob = createdJobs['REQ-2026-0001'];
  const cloudJob = createdJobs['REQ-2026-0002'];
  const reactJob = createdJobs['REQ-2026-0003'];

  const candidate1 = createdCandidates['amit.patel@example.com'];
  const candidate2 = createdCandidates['brandon.hayes@example.com'];
  const candidate3 = createdCandidates['priya.nair@example.com'];

  // Candidate 1 -> Placed on Java Job
  if (javaJob && candidate1) {
    let cj1 = await prisma.candidateJob.findFirst({
      where: { organizationId: org.id, jobId: javaJob.id, candidateId: candidate1.id },
    });
    if (!cj1) {
      cj1 = await prisma.candidateJob.create({
        data: {
          organizationId: org.id,
          jobId: javaJob.id,
          candidateId: candidate1.id,
          recruiterId: recruiter.id,
          currentStage: 'HiredPlaced',
          matchScore: 95,
          notes: 'Client was extremely satisfied with technical interview and coding round.',
        },
      });

      // RTR
      await prisma.rTRRecord.create({
        data: {
          organizationId: org.id,
          candidateId: candidate1.id,
          jobId: javaJob.id,
          clientAccountId: javaJob.accountId,
          consentStatus: 'Granted',
          consentMethod: 'Email',
          submissionTerms: 'Exclusive RTR for ABC Technologies Java Requisition',
          notes: 'Candidate confirmed via email on Oct 10, 2026.',
        },
      });

      // Submission
      const sub1 = await prisma.submission.create({
        data: {
          organizationId: org.id,
          candidateJobId: cj1.id,
          candidateId: candidate1.id,
          jobId: javaJob.id,
          clientAccountId: javaJob.accountId,
          recruiterId: recruiter.id,
          payRate: 80,
          billRate: 115,
          status: 'Selected',
          clientFeedback: 'Outstanding score in Spring Boot and AWS microservices.',
        },
      });

      // Interview
      await prisma.interview.create({
        data: {
          organizationId: org.id,
          submissionId: sub1.id,
          candidateId: candidate1.id,
          jobId: javaJob.id,
          interviewRound: 'Technical Final Round',
          interviewType: 'Video',
          interviewerName: 'David Miller (VP Engineering)',
          scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          timezone: 'America/New_York',
          meetingUrl: 'https://teams.microsoft.com/meet/abc-tech-1',
          status: 'Completed',
          technicalRating: 5,
          communicationRating: 5,
          overallRating: 5,
          recommendation: 'StrongHire',
          feedbackNotes: 'Excellent technical depth and communication. Highly recommended.',
          outcome: 'Selected',
        },
      });

      // Placement
      await prisma.placement.create({
        data: {
          organizationId: org.id,
          submissionId: sub1.id,
          candidateId: candidate1.id,
          jobId: javaJob.id,
          clientAccountId: javaJob.accountId,
          recruiterId: recruiter.id,
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          employmentType: 'Contract',
          payRate: 80,
          billRate: 115,
          grossMargin: 35, // $35/hr profit
          status: 'Active',
          notes: 'Signed offer letter received. Background verification cleared.',
        },
      });
    }
  }

  // Candidate 2 -> Interview Scheduled on Cloud Job
  if (cloudJob && candidate2) {
    let cj2 = await prisma.candidateJob.findFirst({
      where: { organizationId: org.id, jobId: cloudJob.id, candidateId: candidate2.id },
    });
    if (!cj2) {
      cj2 = await prisma.candidateJob.create({
        data: {
          organizationId: org.id,
          jobId: cloudJob.id,
          candidateId: candidate2.id,
          recruiterId: recruiter.id,
          currentStage: 'InterviewScheduled',
          matchScore: 98,
          notes: 'Client reviewed resume and requested technical architecture round.',
        },
      });

      const sub2 = await prisma.submission.create({
        data: {
          organizationId: org.id,
          candidateJobId: cj2.id,
          candidateId: candidate2.id,
          jobId: cloudJob.id,
          clientAccountId: cloudJob.accountId,
          recruiterId: recruiter.id,
          payRate: 105,
          billRate: 150,
          status: 'InterviewRequested',
          clientFeedback: 'Strong profile matching our Terraform/Kubernetes needs.',
        },
      });

      await prisma.interview.create({
        data: {
          organizationId: org.id,
          submissionId: sub2.id,
          candidateId: candidate2.id,
          jobId: cloudJob.id,
          interviewRound: 'Cloud Architecture Round',
          interviewType: 'Video',
          interviewerName: 'Rachel Green & Lead Architect',
          scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          timezone: 'America/Chicago',
          meetingUrl: 'https://zoom.us/j/987654321',
          status: 'Scheduled',
        },
      });
    }
  }

  // Candidate 3 -> Submitted to Client on React Job
  if (reactJob && candidate3) {
    let cj3 = await prisma.candidateJob.findFirst({
      where: { organizationId: org.id, jobId: reactJob.id, candidateId: candidate3.id },
    });
    if (!cj3) {
      cj3 = await prisma.candidateJob.create({
        data: {
          organizationId: org.id,
          jobId: reactJob.id,
          candidateId: candidate3.id,
          recruiterId: recruiter.id,
          currentStage: 'SubmittedToClient',
          matchScore: 92,
          notes: 'RTR received, submitted to Siddharth Rao at Cognizant.',
        },
      });

      await prisma.submission.create({
        data: {
          organizationId: org.id,
          candidateJobId: cj3.id,
          candidateId: candidate3.id,
          jobId: reactJob.id,
          clientAccountId: reactJob.accountId,
          recruiterId: recruiter.id,
          payRate: 75,
          billRate: 110,
          status: 'Submitted',
          nextAction: 'Client Review Pending',
        },
      });
    }
  }

  // 10. Create Sample Tasks
  await prisma.task.createMany({
    data: [
      {
        organizationId: org.id,
        title: 'Follow up with Rachel Green on Cloud Architect interview prep',
        assignedToId: recruiter.id,
        createdById: adminUser.id,
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        priority: 'High',
        status: 'Pending',
        relatedEntityType: 'Interview',
      },
      {
        organizationId: org.id,
        title: 'Send MSA revision to BioHealth Solutions legal counsel',
        assignedToId: salesExec.id,
        createdById: adminUser.id,
        dueAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        priority: 'Urgent',
        status: 'Pending',
        relatedEntityType: 'Lead',
      },
      {
        organizationId: org.id,
        title: 'Onboarding check: verify I-9 and start paperwork for Amit Patel',
        assignedToId: accountManager.id,
        createdById: adminUser.id,
        dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        priority: 'Medium',
        status: 'Pending',
        relatedEntityType: 'Placement',
      },
    ],
  });

  console.log('✅ Seed completed successfully! All US staffing ATS & CRM sample records populated.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
