import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🇮🇳 Seeding 50+ Indian Candidates & Client Enterprise data...');

  // 1. Get or create master organization
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

  // 2. Fetch users
  const recruiter = await prisma.user.findFirst({ where: { role: 'SeniorRecruiter' } }) ||
                    await prisma.user.findFirst();
  const accountManager = await prisma.user.findFirst({ where: { role: 'AccountManager' } }) || recruiter;
  const adminUser = await prisma.user.findFirst({ where: { role: 'SuperAdmin' } }) || recruiter;

  if (!recruiter || !accountManager || !adminUser) {
    console.error('❌ Required users not found. Run standard seed first.');
    return;
  }

  // 3. Indian Enterprise Client Accounts
  const indianClients = [
    {
      name: 'Tata Consultancy Services (TCS America)',
      legalName: 'Tata Consultancy Services North America Inc.',
      accountCode: 'ACC-TCS-101',
      industry: 'IT Services & Consulting',
      accountType: 'ImplementationPartner',
      tier: 'TIER_1',
      headquarters: 'Edison, NJ',
      companySize: '10000+',
      paymentTerms: 'Net 45',
      website: 'https://tcs.com',
      notes: 'Strategic account supplying senior consultants for Fortune 50 banking and retail accounts.',
    },
    {
      name: 'Infosys Americas Inc.',
      legalName: 'Infosys Limited US Branch',
      accountCode: 'ACC-INF-102',
      industry: 'Cloud Transformation & IT',
      accountType: 'ImplementationPartner',
      tier: 'TIER_1',
      headquarters: 'Richardson, TX',
      companySize: '10000+',
      paymentTerms: 'Net 30',
      website: 'https://infosys.com',
      notes: 'Massive demand for AWS DevOps, Microservices, and Snowflake Data Architects.',
    },
    {
      name: 'Wipro USA Technologies',
      legalName: 'Wipro LLC',
      accountCode: 'ACC-WIP-103',
      industry: 'Enterprise Software & Cloud',
      accountType: 'StaffingVendor',
      tier: 'TIER_1',
      headquarters: 'East Brunswick, NJ',
      companySize: '10000+',
      paymentTerms: 'Net 45',
      website: 'https://wipro.com',
      notes: 'Ongoing requirements for Healthcare, Life Sciences, and Telecom domain tech leads.',
    },
    {
      name: 'HCL America Inc.',
      legalName: 'HCL Technologies America Inc.',
      accountCode: 'ACC-HCL-104',
      industry: 'Digital Engineering & Infrastructure',
      accountType: 'DirectClient',
      tier: 'TIER_1',
      headquarters: 'Sunnyvale, CA',
      companySize: '10000+',
      paymentTerms: 'Net 30',
      website: 'https://hcltech.com',
      notes: 'Silicon Valley tech engineering contracts and hybrid cloud infrastructure.',
    },
    {
      name: 'Tech Mahindra Americas',
      legalName: 'Tech Mahindra (Americas) Inc.',
      accountCode: 'ACC-TM-105',
      industry: 'Telecommunications & AI',
      accountType: 'ImplementationPartner',
      tier: 'TIER_2',
      headquarters: 'Plano, TX',
      companySize: '5000-10000',
      paymentTerms: 'Net 45',
      website: 'https://techmahindra.com',
      notes: '5G network engineering and AI automation staffing.',
    },
    {
      name: 'LTIMindtree US Corporation',
      legalName: 'LTIMindtree Limited',
      accountCode: 'ACC-LTI-106',
      industry: 'Banking & Financial Technology',
      accountType: 'DirectClient',
      tier: 'TIER_1',
      headquarters: 'Warren, NJ',
      companySize: '5000-10000',
      paymentTerms: 'Net 30',
      website: 'https://ltimindtree.com',
      notes: 'Tier 1 implementation partner for major Wall Street investment banks.',
    },
    {
      name: 'Persistent Systems USA',
      legalName: 'Persistent Systems Inc.',
      accountCode: 'ACC-PER-107',
      industry: 'Product Engineering & HealthTech',
      accountType: 'DirectClient',
      tier: 'TIER_2',
      headquarters: 'Santa Clara, CA',
      companySize: '1000-5000',
      paymentTerms: 'Net 30',
      website: 'https://persistent.com',
      notes: 'Software product development and Salesforce integration teams.',
    },
    {
      name: 'Coforge North America',
      legalName: 'Coforge Technologies Inc.',
      accountCode: 'ACC-COF-108',
      industry: 'Insurance & Travel Tech',
      accountType: 'StaffingVendor',
      tier: 'TIER_2',
      headquarters: 'Princeton, NJ',
      companySize: '1000-5000',
      paymentTerms: 'Net 45',
      website: 'https://coforge.com',
      notes: 'Core insurance platform modernization and Guidewire consultants.',
    },
    {
      name: 'Hexaware Technologies Americas',
      legalName: 'Hexaware Technologies Inc.',
      accountCode: 'ACC-HEX-109',
      industry: 'Cloud & Automation',
      accountType: 'ImplementationPartner',
      tier: 'TIER_2',
      headquarters: 'Iselin, NJ',
      companySize: '5000-10000',
      paymentTerms: 'Net 30',
      website: 'https://hexaware.com',
      notes: 'Automation-first IT consulting hiring fullstack and automation QA engineers.',
    },
    {
      name: 'Birlasoft Inc.',
      legalName: 'Birlasoft Solutions Inc.',
      accountCode: 'ACC-BIR-110',
      industry: 'Manufacturing & ERP Systems',
      accountType: 'StaffingVendor',
      tier: 'TIER_3',
      headquarters: 'Novi, MI',
      companySize: '1000-5000',
      paymentTerms: 'Net 45',
      website: 'https://birlasoft.com',
      notes: 'SAP S/4HANA, Oracle Cloud, and supply chain ERP developers.',
    },
  ];

  const clientMap: Record<string, any> = {};
  for (const c of indianClients) {
    let acc = await prisma.account.findFirst({
      where: { organizationId: org.id, name: c.name },
    });
    if (!acc) {
      acc = await prisma.account.create({
        data: {
          organizationId: org.id,
          name: c.name,
          legalName: c.legalName,
          accountCode: c.accountCode,
          industry: c.industry,
          accountType: c.accountType,
          tier: c.tier,
          headquarters: c.headquarters,
          companySize: c.companySize,
          paymentTerms: c.paymentTerms,
          website: c.website,
          notes: c.notes,
          status: 'Active',
          accountManagerId: accountManager.id,
        },
      });
    }
    clientMap[c.name] = acc;
  }
  console.log(`✅ Created/Verified ${indianClients.length} Indian IT Enterprise Clients.`);

  // 4. Client Contacts (Indian Hiring Managers & Practice Directors)
  const indianContacts = [
    { client: 'Tata Consultancy Services (TCS America)', firstName: 'Rajesh', lastName: 'Kulkarni', title: 'VP & Delivery Head - Cloud Practice', email: 'rajesh.kulkarni@tcs.com', phone: '+1 (732) 555-0101' },
    { client: 'Tata Consultancy Services (TCS America)', firstName: 'Ananya', lastName: 'Sen', title: 'Director of Talent Acquisition', email: 'ananya.sen@tcs.com', phone: '+1 (732) 555-0102' },
    { client: 'Infosys Americas Inc.', firstName: 'Amit', lastName: 'Kapoor', title: 'Principal Architect & Hiring Lead', email: 'amit.kapoor@infosys.com', phone: '+1 (972) 555-0111' },
    { client: 'Infosys Americas Inc.', firstName: 'Sunita', lastName: 'Rao', title: 'Vendor Management Specialist', email: 'sunita.rao@infosys.com', phone: '+1 (972) 555-0112' },
    { client: 'Wipro USA Technologies', firstName: 'Suresh', lastName: 'Menon', title: 'General Manager - Healthcare Practice', email: 'suresh.menon@wipro.com', phone: '+1 (201) 555-0121' },
    { client: 'HCL America Inc.', firstName: 'Deepa', lastName: 'Krishnan', title: 'Director of Engineering Services', email: 'deepa.krishnan@hcltech.com', phone: '+1 (408) 555-0131' },
    { client: 'Tech Mahindra Americas', firstName: 'Manoj', lastName: 'Tiwari', title: 'Head of Telecom Staffing', email: 'manoj.tiwari@techmahindra.com', phone: '+1 (469) 555-0141' },
    { client: 'LTIMindtree US Corporation', firstName: 'Sandeep', lastName: 'Choudhary', title: 'Managing Director - Banking Practice', email: 'sandeep.c@ltimindtree.com', phone: '+1 (908) 555-0151' },
    { client: 'Persistent Systems USA', firstName: 'Pooja', lastName: 'Deshmukh', title: 'Director - Product Engineering', email: 'pooja.deshmukh@persistent.com', phone: '+1 (408) 555-0161' },
    { client: 'Coforge North America', firstName: 'Vikramaditya', lastName: 'Singhania', title: 'Procurement & Vendor Manager', email: 'vikram.singh@coforge.com', phone: '+1 (609) 555-0171' },
  ];

  const contactMap: Record<string, any> = {};
  for (const ct of indianContacts) {
    const acc = clientMap[ct.client];
    if (!acc) continue;
    let contact = await prisma.contact.findFirst({
      where: { organizationId: org.id, email: ct.email },
    });
    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          organizationId: org.id,
          accountId: acc.id,
          firstName: ct.firstName,
          lastName: ct.lastName,
          designation: ct.title,
          email: ct.email,
          phone: ct.phone,
          isPrimary: true,
          timezone: 'America/New_York',
        },
      });
    }
    contactMap[ct.email] = contact;
  }
  console.log(`✅ Created/Verified ${indianContacts.length} Client Stakeholders.`);

  // 5. Open Requisitions / Jobs
  const indianJobs = [
    {
      code: 'REQ-IND-2026-101',
      client: 'Tata Consultancy Services (TCS America)',
      title: 'Senior AWS Cloud & Terraform Architect',
      skills: 'AWS, Terraform, Kubernetes, Helm, Python, CloudFormation, Linux',
      expMin: 8, expMax: 12, workMode: 'Remote', empType: 'Contract',
      payMin: 80, payMax: 90, billMin: 110, billMax: 125, priority: 'High',
      city: 'Edison', state: 'NJ',
    },
    {
      code: 'REQ-IND-2026-102',
      client: 'Infosys Americas Inc.',
      title: 'Lead Full Stack Java & Microservices Engineer',
      skills: 'Java 17, Spring Boot, Microservices, React.js, Kafka, PostgreSQL, Docker',
      expMin: 7, expMax: 10, workMode: 'Hybrid', empType: 'Contract',
      payMin: 75, payMax: 85, billMin: 100, billMax: 115, priority: 'Critical',
      city: 'Richardson', state: 'TX',
    },
    {
      code: 'REQ-IND-2026-103',
      client: 'Wipro USA Technologies',
      title: 'Senior Snowflake & Data Lakehouse Engineer',
      skills: 'Snowflake, dbt, Python, SQL, AWS S3, Apache Airflow, PySpark',
      expMin: 6, expMax: 10, workMode: 'Remote', empType: 'Contract',
      payMin: 85, payMax: 95, billMin: 115, billMax: 130, priority: 'High',
      city: 'East Brunswick', state: 'NJ',
    },
    {
      code: 'REQ-IND-2026-104',
      client: 'HCL America Inc.',
      title: 'DevOps & Site Reliability Engineer (SRE)',
      skills: 'Kubernetes, Prometheus, Grafana, Datadog, Terraform, CI/CD, Python',
      expMin: 5, expMax: 9, workMode: 'Remote', empType: 'Contract',
      payMin: 70, payMax: 80, billMin: 95, billMax: 105, priority: 'Medium',
      city: 'Sunnyvale', state: 'CA',
    },
    {
      code: 'REQ-IND-2026-105',
      client: 'LTIMindtree US Corporation',
      title: 'Lead React Native / iOS Mobile Architect',
      skills: 'React Native, TypeScript, iOS Swift, Android Kotlin, Redux, GraphQL',
      expMin: 8, expMax: 12, workMode: 'Hybrid', empType: 'Contract',
      payMin: 80, payMax: 92, billMin: 110, billMax: 122, priority: 'High',
      city: 'Warren', state: 'NJ',
    },
    {
      code: 'REQ-IND-2026-106',
      client: 'Tech Mahindra Americas',
      title: 'Lead Salesforce CPQ & Lightning Developer',
      skills: 'Salesforce, Apex, Lightning Web Components, CPQ, SOQL, REST Integrations',
      expMin: 6, expMax: 10, workMode: 'Remote', empType: 'Contract',
      payMin: 75, payMax: 88, billMin: 105, billMax: 120, priority: 'Medium',
      city: 'Plano', state: 'TX',
    },
    {
      code: 'REQ-IND-2026-107',
      client: 'Persistent Systems USA',
      title: 'QA Automation Lead (Selenium + Cypress + API)',
      skills: 'Selenium, Cypress, Java, Playwright, TestNG, Postman, Jenkins CI/CD',
      expMin: 6, expMax: 9, workMode: 'Remote', empType: 'Contract',
      payMin: 65, payMax: 75, billMin: 90, billMax: 100, priority: 'Normal',
      city: 'Santa Clara', state: 'CA',
    },
    {
      code: 'REQ-IND-2026-108',
      client: 'Coforge North America',
      title: 'Senior Business Analyst / Scrum Master',
      skills: 'Agile, Scrum, JIRA, SQL, User Stories, Banking, BRD, API Testing',
      expMin: 7, expMax: 11, workMode: 'Hybrid', empType: 'Contract',
      payMin: 65, payMax: 75, billMin: 88, billMax: 98, priority: 'Normal',
      city: 'Princeton', state: 'NJ',
    },
  ];

  const jobMap: Record<string, any> = {};
  for (const j of indianJobs) {
    const acc = clientMap[j.client];
    if (!acc) continue;
    let job = await prisma.jobRequisition.findFirst({
      where: { organizationId: org.id, jobCode: j.code },
    });
    if (!job) {
      job = await prisma.jobRequisition.create({
        data: {
          organizationId: org.id,
          jobCode: j.code,
          accountId: acc.id,
          title: j.title,
          description: `Urgent requirement for ${j.title} at ${j.client}. Deep knowledge of ${j.skills} required.`,
          requiredSkills: j.skills,
          experienceMin: j.expMin,
          experienceMax: j.expMax,
          city: j.city,
          state: j.state,
          workMode: j.workMode,
          employmentType: j.empType,
          openings: 2,
          filledPositions: 0,
          payRateMin: j.payMin,
          payRateMax: j.payMax,
          billRateMin: j.billMin,
          billRateMax: j.billMax,
          priority: j.priority,
          status: 'Open',
          assignedRecruiterId: recruiter.id,
          createdById: adminUser.id,
        },
      });
    }
    jobMap[j.code] = job;
  }
  console.log(`✅ Created/Verified ${indianJobs.length} Job Requisitions.`);

  // 6. 50+ Indian Candidates (Students, Recent Grads, Experienced Techies)
  const indianCandidatesData = [
    // --- Students / Recent Grads (OPT / CPT) ---
    {
      code: 'CAN-IND-001', firstName: 'Aarav', lastName: 'Sharma',
      email: 'aarav.sharma.tech@gmail.com', phone: '(469) 555-1001',
      city: 'Dallas', state: 'TX', title: 'Junior Cloud & DevOps Engineer (Recent MS Grad)',
      exp: 1.5, skills: 'AWS, Terraform, Docker, Kubernetes, Linux, Python, Git',
      auth: 'OPT', rate: 55, employer: 'UT Dallas (Research Assistant)',
      summary: 'MS in Computer Science from UT Dallas. Hands-on experience deploying containerized apps on AWS EKS and writing CI/CD GitHub Actions.',
    },
    {
      code: 'CAN-IND-002', firstName: 'Ananya', lastName: 'Iyer',
      email: 'ananya.iyer.dev@gmail.com', phone: '(408) 555-1002',
      city: 'San Jose', state: 'CA', title: 'Fullstack React / Node.js Developer (OPT)',
      exp: 2.0, skills: 'React, TypeScript, Node.js, Express, MongoDB, Redux, REST API',
      auth: 'OPT', rate: 60, employer: 'San Jose State University',
      summary: 'Master of Science graduate from SJSU with strong frontend and backend JavaScript/TypeScript skills and scalable web projects.',
    },
    {
      code: 'CAN-IND-003', firstName: 'Rohan', lastName: 'Verma',
      email: 'rohan.verma.data@gmail.com', phone: '(312) 555-1003',
      city: 'Chicago', state: 'IL', title: 'Data Engineer / Python Developer (CPT)',
      exp: 1.0, skills: 'Python, SQL, PySpark, AWS S3, Tableau, Pandas, PostgreSQL',
      auth: 'CPT', rate: 50, employer: 'Illinois Tech Graduate',
      summary: 'Data engineer intern passionate about building ETL data pipelines in PySpark and visualization dashboards.',
    },
    {
      code: 'CAN-IND-004', firstName: 'Priya', lastName: 'Patel',
      email: 'priya.patel.qa@gmail.com', phone: '(732) 555-1004',
      city: 'Edison', state: 'NJ', title: 'QA Automation Engineer (OPT STEM)',
      exp: 2.5, skills: 'Selenium, Java, TestNG, Cypress, Postman, Jenkins, Agile',
      auth: 'OPT', rate: 55, employer: 'Rutgers University Grad',
      summary: 'Automation QA engineer specializing in Selenium WebDriver, REST API testing, and continuous integration testing.',
    },
    {
      code: 'CAN-IND-005', firstName: 'Arjun', lastName: 'Reddy',
      email: 'arjun.reddy.aws@gmail.com', phone: '(512) 555-1005',
      city: 'Austin', state: 'TX', title: 'Cloud Infrastructure Associate (OPT)',
      exp: 1.5, skills: 'AWS, Terraform, Linux, Bash, Python, Docker, CloudWatch',
      auth: 'OPT', rate: 52, employer: 'Texas A&M University',
      summary: 'AWS Certified Solutions Architect Associate with focus on cloud automation and infrastructure as code.',
    },
    {
      code: 'CAN-IND-006', firstName: 'Sneha', lastName: 'Joshi',
      email: 'sneha.joshi.ai@gmail.com', phone: '(617) 555-1006',
      city: 'Boston', state: 'MA', title: 'Machine Learning & NLP Engineer (OPT STEM)',
      exp: 2.0, skills: 'Python, PyTorch, HuggingFace, Scikit-learn, LangChain, SQL',
      auth: 'OPT', rate: 65, employer: 'Northeastern University',
      summary: 'MS Data Science graduate with expertise in fine-tuning Large Language Models, embeddings, and vector databases.',
    },
    {
      code: 'CAN-IND-007', firstName: 'Kunal', lastName: 'Kapoor',
      email: 'kunal.kapoor.salesforce@gmail.com', phone: '(404) 555-1007',
      city: 'Atlanta', state: 'GA', title: 'Salesforce Developer (OPT)',
      exp: 2.5, skills: 'Salesforce, Apex, LWC, SOQL, Visualforce, Flows, Git',
      auth: 'OPT', rate: 60, employer: 'Georgia State University',
      summary: 'Certified Salesforce Platform Developer I with experience customizing Lightning pages and building Apex batch classes.',
    },
    {
      code: 'CAN-IND-008', firstName: 'Divya', lastName: 'Pillai',
      email: 'divya.pillai.frontend@gmail.com', phone: '(704) 555-1008',
      city: 'Charlotte', state: 'NC', title: 'UI/UX & React Frontend Engineer (CPT)',
      exp: 1.8, skills: 'React, Next.js, Tailwind CSS, TypeScript, Figma, Jest',
      auth: 'CPT', rate: 54, employer: 'UNC Charlotte',
      summary: 'Creative frontend developer combining design aesthetics with modern React component frameworks and responsive layouts.',
    },
    {
      code: 'CAN-IND-009', firstName: 'Vikram', lastName: 'Malhotra',
      email: 'vikram.malhotra.sec@gmail.com', phone: '(703) 555-1009',
      city: 'Reston', state: 'VA', title: 'Cybersecurity & IAM Analyst (OPT)',
      exp: 2.0, skills: 'Cybersecurity, Okta, IAM, Splunk, SIEM, Linux, Python',
      auth: 'OPT', rate: 62, employer: 'George Mason University',
      summary: 'Security analyst with practical knowledge of Zero Trust principles, Okta identity federation, and SIEM event monitoring.',
    },
    {
      code: 'CAN-IND-010', firstName: 'Neha', lastName: 'Gupta',
      email: 'neha.gupta.ba@gmail.com', phone: '(214) 555-1010',
      city: 'Irving', state: 'TX', title: 'Business Systems Analyst (OPT)',
      exp: 2.5, skills: 'Business Analysis, SQL, JIRA, Confluence, Visio, Tableau, Agile',
      auth: 'OPT', rate: 58, employer: 'UT Arlington',
      summary: 'Bilingual IT Business Analyst adept at eliciting requirements, documenting user stories, and facilitating sprint ceremonies.',
    },

    // --- Experienced Mid & Senior Tech Consultants (H1B / Green Card / US Citizen) ---
    {
      code: 'CAN-IND-011', firstName: 'Rahul', lastName: 'Nair',
      email: 'rahul.nair.cloud@gmail.com', phone: '(469) 555-1011',
      city: 'Plano', state: 'TX', title: 'Senior AWS DevOps & Platform Engineer',
      exp: 9.0, skills: 'AWS, Terraform, Kubernetes, Helm, Python, Docker, Jenkins',
      auth: 'H1-B', rate: 85, employer: 'Capgemini Americas',
      summary: 'Seasoned DevOps engineer with 9 years managing Kubernetes clusters, CI/CD automated release pipelines, and Terraform IaC.',
    },
    {
      code: 'CAN-IND-012', firstName: 'Pooja', lastName: 'Deshmukh',
      email: 'pooja.deshmukh.java@gmail.com', phone: '(201) 555-1012',
      city: 'Jersey City', state: 'NJ', title: 'Staff Java Microservices Architect',
      exp: 10.5, skills: 'Java 17, Spring Boot, Microservices, Kafka, PostgreSQL, Docker, AWS',
      auth: 'H1-B', rate: 82, employer: 'Cognizant US',
      summary: 'Backend Java specialist with 10+ years designing fault-tolerant banking microservices, event streams with Kafka, and caching.',
    },
    {
      code: 'CAN-IND-013', firstName: 'Siddharth', lastName: 'Jain',
      email: 'siddharth.jain.data@gmail.com', phone: '(404) 555-1013',
      city: 'Alpharetta', state: 'GA', title: 'Lead Snowflake & Data Lakehouse Architect',
      exp: 11.0, skills: 'Snowflake, dbt, Python, Apache Airflow, AWS S3, PySpark, SQL',
      auth: 'Green Card', rate: 95, employer: 'Equifax (Contractor)',
      summary: 'Architected multiple enterprise data lakehouses migrating from legacy Oracle/Teradata to Snowflake with automated dbt pipelines.',
    },
    {
      code: 'CAN-IND-014', firstName: 'Meera', lastName: 'Nambiar',
      email: 'meera.nambiar.fullstack@gmail.com', phone: '(415) 555-1014',
      city: 'San Francisco', state: 'CA', title: 'Senior Full Stack React + Node Lead',
      exp: 8.5, skills: 'React, TypeScript, Node.js, GraphQL, PostgreSQL, Next.js, AWS',
      auth: 'H1-B', rate: 88, employer: 'Uber Technologies (Contract)',
      summary: 'High-energy fullstack engineer with expertise in micro-frontends, high-performance UI rendering, and scalable REST/GraphQL APIs.',
    },
    {
      code: 'CAN-IND-015', firstName: 'Aditya', lastName: 'Rao',
      email: 'aditya.rao.sre@gmail.com', phone: '(206) 555-1015',
      city: 'Seattle', state: 'WA', title: 'Principal Site Reliability Engineer (SRE)',
      exp: 12.0, skills: 'Kubernetes, Golang, Prometheus, Grafana, Terraform, AWS, Linux',
      auth: 'US Citizen', rate: 105, employer: 'Amazon Web Services',
      summary: 'Principal SRE with 12 years maintaining 99.99% availability across distributed distributed cloud platforms.',
    },
    {
      code: 'CAN-IND-016', firstName: 'Shweta', lastName: 'Singh',
      email: 'shweta.singh.sf@gmail.com', phone: '(972) 555-1016',
      city: 'Frisco', state: 'TX', title: 'Senior Salesforce Lightning & CPQ Consultant',
      exp: 8.0, skills: 'Salesforce, CPQ, Apex, Lightning Web Components, MuleSoft, SOQL',
      auth: 'H1-B', rate: 85, employer: 'Deloitte Consulting',
      summary: '8 years delivering complex Salesforce CPQ implementations and MuleSoft API integrations for telecom and tech enterprises.',
    },
    {
      code: 'CAN-IND-017', firstName: 'Rakesh', lastName: 'Mukherjee',
      email: 'rakesh.mukherjee.qa@gmail.com', phone: '(813) 555-1017',
      city: 'Tampa', state: 'FL', title: 'QA Automation Lead & SDET',
      exp: 9.0, skills: 'Selenium, Java, Playwright, TestNG, Appium, Cucumber, Jenkins',
      auth: 'Green Card', rate: 75, employer: 'Citigroup US',
      summary: 'SDET lead architecting hybrid test automation frameworks covering web, mobile, and API layers with CI/CD integration.',
    },
    {
      code: 'CAN-IND-018', firstName: 'Kavita', lastName: 'Menon',
      email: 'kavita.menon.scrum@gmail.com', phone: '(704) 555-1018',
      city: 'Charlotte', state: 'NC', title: 'Certified Agile Coach & Senior Scrum Master',
      exp: 10.0, skills: 'Agile, Scrum, SAFe, JIRA, Confluence, Kanban, Stakeholder Mgmt',
      auth: 'US Citizen', rate: 78, employer: 'Wells Fargo',
      summary: 'SAFe Agilist and CSM with 10 years guiding cross-functional offshore/onshore engineering squads in financial services.',
    },
    {
      code: 'CAN-IND-019', firstName: 'Varun', lastName: 'Bhatia',
      email: 'varun.bhatia.ios@gmail.com', phone: '(408) 555-1019',
      city: 'Cupertino', state: 'CA', title: 'Lead iOS & Swift Mobile Engineer',
      exp: 8.0, skills: 'Swift, SwiftUI, iOS SDK, Combine, CoreData, REST API, Xcode',
      auth: 'H1-B', rate: 90, employer: 'Apple Inc. (Vendor Partner)',
      summary: 'Native iOS architect with 8 years building consumer and enterprise applications published on the App Store with 1M+ downloads.',
    },
    {
      code: 'CAN-IND-020', firstName: 'Tanvi', lastName: 'Kulkarni',
      email: 'tanvi.kulkarni.py@gmail.com', phone: '(512) 555-1020',
      city: 'Austin', state: 'TX', title: 'Senior Python & FastAPI Backend Developer',
      exp: 7.5, skills: 'Python, FastAPI, Django, PostgreSQL, Redis, Docker, Celery',
      auth: 'H1-B', rate: 78, employer: 'Dell Technologies',
      summary: 'Specialized in asynchronous Python backend development, RESTful APIs, background task queues, and microservices.',
    },
    {
      code: 'CAN-IND-021', firstName: 'Nikhil', lastName: 'Sengupta',
      email: 'nikhil.sengupta.sap@gmail.com', phone: '(248) 555-1021',
      city: 'Detroit', state: 'MI', title: 'SAP S/4HANA Functional Consultant (FICO)',
      exp: 11.5, skills: 'SAP S/4HANA, FICO, General Ledger, AP/AR, Asset Accounting, ERP',
      auth: 'Green Card', rate: 95, employer: 'Ford Motor Company',
      summary: 'Extensive background leading global SAP S/4HANA financial migrations and integration with supply chain modules.',
    },
    {
      code: 'CAN-IND-022', firstName: 'Swati', lastName: 'Agarwal',
      email: 'swati.agarwal.bi@gmail.com', phone: '(312) 555-1022',
      city: 'Naperville', state: 'IL', title: 'Senior Power BI & Tableau Analytics Lead',
      exp: 8.0, skills: 'Power BI, Tableau, SQL, DAX, Data Modeling, Python, Excel',
      auth: 'H1-B', rate: 75, employer: 'Walgreens Boots Alliance',
      summary: 'Passionate BI architect creating executive decision dashboards, star schema data models, and complex DAX measures.',
    },
    {
      code: 'CAN-IND-023', firstName: 'Harish', lastName: 'Venkataraman',
      email: 'harish.v.dba@gmail.com', phone: '(972) 555-1023',
      city: 'Irving', state: 'TX', title: 'Senior PostgreSQL & Oracle Cloud DBA',
      exp: 13.0, skills: 'PostgreSQL, Oracle 19c, PL/SQL, Performance Tuning, AWS RDS, Backup',
      auth: 'US Citizen', rate: 98, employer: 'AT&T Communications',
      summary: 'Enterprise database administrator with 13 years managing petabyte-scale databases, high-availability failover, and query optimization.',
    },
    {
      code: 'CAN-IND-024', firstName: 'Deepa', lastName: 'Trivedi',
      email: 'deepa.trivedi.sec@gmail.com', phone: '(617) 555-1024',
      city: 'Waltham', state: 'MA', title: 'Senior Application Security / DevSecOps Engineer',
      exp: 8.5, skills: 'DevSecOps, SonarQube, Snyk, SAST/DAST, AWS Security, Docker, CI/CD',
      auth: 'H1-B', rate: 88, employer: 'State Street Global Advisors',
      summary: 'Integrating security into the continuous integration pipeline with automated vulnerability scanning, container security, and compliance.',
    },
    {
      code: 'CAN-IND-025', firstName: 'Manish', lastName: 'Saxena',
      email: 'manish.saxena.infra@gmail.com', phone: '(732) 555-1025',
      city: 'Piscataway', state: 'NJ', title: 'Azure Cloud Infrastructure Engineer',
      exp: 7.0, skills: 'Azure, ARM Templates, Bicep, Azure DevOps, PowerShell, AKS',
      auth: 'H1-B', rate: 76, employer: 'Johnson & Johnson',
      summary: 'Azure certified administrator designing multi-subscription virtual networks, Azure Kubernetes Service, and Azure DevOps CI/CD pipelines.',
    },
    {
      code: 'CAN-IND-026', firstName: 'Ritu', lastName: 'Pandey',
      email: 'ritu.pandey.angular@gmail.com', phone: '(404) 555-1026',
      city: 'Duluth', state: 'GA', title: 'Senior Angular & TypeScript Developer',
      exp: 7.0, skills: 'Angular 16, TypeScript, RxJS, NgRx, HTML5, SCSS, Karma, Jasmine',
      auth: 'H1-B', rate: 74, employer: 'Home Depot IT',
      summary: 'Frontend enterprise developer building responsive customer-facing shopping applications using Angular state management.',
    },
    {
      code: 'CAN-IND-027', firstName: 'Gaurav', lastName: 'Choudhury',
      email: 'gaurav.c.kafka@gmail.com', phone: '(214) 555-1027',
      city: 'Dallas', state: 'TX', title: 'Distributed Systems & Apache Kafka Specialist',
      exp: 9.5, skills: 'Kafka, Java, Scala, Event-Driven Architecture, ZooKeeper, AWS',
      auth: 'H1-B', rate: 92, employer: 'American Airlines',
      summary: 'High-throughput event-streaming architect managing Kafka clusters processing over 50M messages daily.',
    },
    {
      code: 'CAN-IND-028', firstName: 'Shalini', lastName: 'Mishra',
      email: 'shalini.mishra.ba@gmail.com', phone: '(614) 555-1028',
      city: 'Columbus', state: 'OH', title: 'Lead Healthcare Business Analyst',
      exp: 9.0, skills: 'Healthcare, EDI 837/835, HL7, HIPAA, Agile, SQL, Visio, JIRA',
      auth: 'Green Card', rate: 76, employer: 'Cardinal Health',
      summary: 'Specialized in healthcare claims processing, EDI transaction validation, and regulatory healthcare compliance workflows.',
    },
    {
      code: 'CAN-IND-029', firstName: 'Sanjay', lastName: 'Bhatt',
      email: 'sanjay.bhatt.net@gmail.com', phone: '(704) 555-1029',
      city: 'Concord', state: 'NC', title: 'Senior .NET Core & Microservices Engineer',
      exp: 10.0, skills: '.NET Core, C#, ASP.NET, SQL Server, Azure, Microservices, Docker',
      auth: 'US Citizen', rate: 82, employer: "Lowe's Companies",
      summary: '10 years developing robust backend services using C# .NET Core, entity framework, and Azure cloud hosting.',
    },
    {
      code: 'CAN-IND-030', firstName: 'Preeti', lastName: 'Das',
      email: 'preeti.das.ml@gmail.com', phone: '(408) 555-1030',
      city: 'Fremont', state: 'CA', title: 'Senior Data Scientist & AI Practitioner',
      exp: 7.5, skills: 'Python, R, Machine Learning, TensorFlow, Pandas, SQL, AWS SageMaker',
      auth: 'H1-B', rate: 88, employer: 'PayPal',
      summary: 'Developing predictive risk models, fraud detection algorithms, and customer churn analytics using advanced statistical techniques.',
    },
    {
      code: 'CAN-IND-031', firstName: 'Tarun', lastName: 'Ghosh',
      email: 'tarun.ghosh.network@gmail.com', phone: '(847) 555-1031',
      city: 'Schaumburg', state: 'IL', title: 'Cisco Certified Network & SD-WAN Engineer',
      exp: 11.0, skills: 'Cisco, CCNA, CCNP, SD-WAN, BGP, Firewalls, Palo Alto, VPN',
      auth: 'Green Card', rate: 85, employer: 'Motorola Solutions',
      summary: 'Enterprise network architect designing enterprise WAN networks, BGP routing protocols, and Palo Alto perimeter firewalls.',
    },
    {
      code: 'CAN-IND-032', firstName: 'Sonali', lastName: 'Shah',
      email: 'sonali.shah.salesforce@gmail.com', phone: '(732) 555-1032',
      city: 'Woodbridge', state: 'NJ', title: 'Salesforce Administrator & Business Consultant',
      exp: 6.5, skills: 'Salesforce Admin, Reports, Dashboards, Workflow Rules, Flows, Security',
      auth: 'H1-B', rate: 68, employer: 'Bristol Myers Squibb',
      summary: 'Salesforce Certified Administrator streamlining sales and service operations through automated flow builders and custom objects.',
    },
    {
      code: 'CAN-IND-033', firstName: 'Vivek', lastName: 'Raman',
      email: 'vivek.raman.android@gmail.com', phone: '(512) 555-1033',
      city: 'Round Rock', state: 'TX', title: 'Lead Android Kotlin Developer',
      exp: 8.5, skills: 'Kotlin, Android SDK, Jetpack Compose, Coroutines, MVVM, REST API',
      auth: 'H1-B', rate: 86, employer: 'Expedia Group',
      summary: 'Building cutting-edge Android applications leveraging Jetpack Compose UI architecture, modular code bases, and offline-first data sync.',
    },
    {
      code: 'CAN-IND-034', firstName: 'Anjali', lastName: 'Saxena',
      email: 'anjali.saxena.fullstack@gmail.com', phone: '(972) 555-1034',
      city: 'Plano', state: 'TX', title: 'Senior MERN Stack Web Engineer',
      exp: 6.5, skills: 'MongoDB, Express.js, React, Node.js, Redux, Docker, AWS',
      auth: 'H1-B', rate: 74, employer: 'JPMorgan Chase (Contractor)',
      summary: 'Fullstack MERN engineer delivering commercial web platforms, payment integrations, and reusable component libraries.',
    },
    {
      code: 'CAN-IND-035', firstName: 'Deepak', lastName: 'Hegde',
      email: 'deepak.hegde.linux@gmail.com', phone: '(206) 555-1035',
      city: 'Bellevue', state: 'WA', title: 'Senior Linux Systems & Cloud Administrator',
      exp: 10.0, skills: 'Linux, RedHat, Bash, Python, Ansible, VMware, AWS, Patching',
      auth: 'Green Card', rate: 80, employer: 'T-Mobile US',
      summary: 'Red Hat Certified Engineer managing thousands of virtual instances, configuration management via Ansible, and automated patching.',
    },
    {
      code: 'CAN-IND-036', firstName: 'Priyanka', lastName: 'Mathur',
      email: 'priyanka.mathur.etl@gmail.com', phone: '(704) 555-1036',
      city: 'Charlotte', state: 'NC', title: 'Senior Informatica & SQL Data Warehouse Engineer',
      exp: 9.0, skills: 'Informatica PowerCenter, Oracle SQL, Data Warehousing, UNIX Shell, ETL',
      auth: 'H1-B', rate: 78, employer: 'Bank of America',
      summary: 'Extensive experience in banking data integration, developing complex Informatica mappings, workflows, and performance tuning.',
    },
    {
      code: 'CAN-IND-037', firstName: 'Karthik', lastName: 'Subramanian',
      email: 'karthik.s.golang@gmail.com', phone: '(408) 555-1037',
      city: 'Mountain View', state: 'CA', title: 'Lead Golang & Cloud Microservices Engineer',
      exp: 8.0, skills: 'Golang, gRPC, Docker, Kubernetes, PostgreSQL, Redis, Microservices',
      auth: 'H1-B', rate: 94, employer: 'Google (Vendor Staffing)',
      summary: 'Specializing in ultra low-latency backend systems written in Go, gRPC inter-service communication, and distributed tracing.',
    },
    {
      code: 'CAN-IND-038', firstName: 'Rashmi', lastName: 'Bose',
      email: 'rashmi.bose.product@gmail.com', phone: '(212) 555-1038',
      city: 'New York', state: 'NY', title: 'Senior Technical Product Manager (FinTech)',
      exp: 9.5, skills: 'Product Management, Roadmaps, User Stories, FinTech, APIs, SQL, Agile',
      auth: 'US Citizen', rate: 88, employer: 'Bloomberg LP',
      summary: 'Data-driven Product Manager translating market opportunities into actionable engineering backlogs and driving API product launches.',
    },
    {
      code: 'CAN-IND-039', firstName: 'Alok', lastName: 'Sethi',
      email: 'alok.sethi.cloudops@gmail.com', phone: '(469) 555-1039',
      city: 'Carrollton', state: 'TX', title: 'GCP Cloud Infrastructure Engineer',
      exp: 7.0, skills: 'GCP, Google Cloud, Terraform, GKE, BigQuery, IAM, Python',
      auth: 'H1-B', rate: 82, employer: 'CBRE Global',
      summary: 'Google Cloud Professional Cloud Architect experienced in multi-region deployments, GKE container clusters, and BigQuery warehouses.',
    },
    {
      code: 'CAN-IND-040', firstName: 'Shruti', lastName: 'Kapse',
      email: 'shruti.kapse.test@gmail.com', phone: '(609) 555-1040',
      city: 'Princeton', state: 'NJ', title: 'Lead Performance & Load Test Engineer',
      exp: 8.5, skills: 'JMeter, LoadRunner, Performance Testing, APM, Dynatrace, SQL',
      auth: 'H1-B', rate: 76, employer: 'Siemens Healthineers',
      summary: 'Performance testing specialist analyzing latency bottlenecks, thread dumps, and conducting stress testing using Apache JMeter.',
    },
    {
      code: 'CAN-IND-041', firstName: 'Nitin', lastName: 'Deshpande',
      email: 'nitin.deshpande.bi@gmail.com', phone: '(312) 555-1041',
      city: 'Oak Brook', state: 'IL', title: 'Lead QlikSense & SQL Analytics Engineer',
      exp: 10.0, skills: 'QlikSense, SQL, Data Modeling, NPrinting, Python, Data Warehousing',
      auth: 'Green Card', rate: 84, employer: "McDonald's Global Tech",
      summary: 'Developing interactive Qlik dashboards for corporate leadership, complex Qlik scripting, and relational data modeling.',
    },
    {
      code: 'CAN-IND-042', firstName: 'Richa', lastName: 'Singhal',
      email: 'richa.singhal.dev@gmail.com', phone: '(512) 555-1042',
      city: 'Austin', state: 'TX', title: 'Full Stack Java + Angular Engineer',
      exp: 6.5, skills: 'Java, Spring Boot, Angular, TypeScript, PostgreSQL, Docker',
      auth: 'H1-B', rate: 72, employer: 'Charles Schwab',
      summary: 'Experienced full stack developer comfortable delivering end-to-end features from database schema to responsive frontend views.',
    },
    {
      code: 'CAN-IND-043', firstName: 'Abhinav', lastName: 'Prasad',
      email: 'abhinav.prasad.devops@gmail.com', phone: '(404) 555-1043',
      city: 'Norcross', state: 'GA', title: 'Senior Jenkins CI/CD & Cloud Engineer',
      exp: 8.0, skills: 'Jenkins, Groovy, Docker, AWS, SonarQube, Nexus, Git, Linux',
      auth: 'H1-B', rate: 80, employer: 'Delta Air Lines',
      summary: 'Master of declarative Jenkins pipeline as code (Groovy), automated build systems, and containerized artifact management.',
    },
    {
      code: 'CAN-IND-044', firstName: 'Pallavi', lastName: 'Nanda',
      email: 'pallavi.nanda.hr@gmail.com', phone: '(732) 555-1044',
      city: 'Somerset', state: 'NJ', title: 'Workday Functional Consultant (HCM)',
      exp: 7.5, skills: 'Workday HCM, Business Processes, EIB, Core HR, Compensation',
      auth: 'H1-B', rate: 85, employer: 'Prudential Financial',
      summary: 'Configuring Workday HCM tenant, enterprise business process definitions, calculated fields, and outbound EIB integrations.',
    },
    {
      code: 'CAN-IND-045', firstName: 'Pradeep', lastName: 'Reddy',
      email: 'pradeep.reddy.bigdata@gmail.com', phone: '(214) 555-1045',
      city: 'Irving', state: 'TX', title: 'Senior Big Data & Hadoop Spark Engineer',
      exp: 9.0, skills: 'Spark, Scala, Hadoop, Hive, AWS EMR, Python, Airflow',
      auth: 'H1-B', rate: 86, employer: 'McKesson Corporation',
      summary: 'Processing terabyte-scale healthcare transaction datasets using PySpark and Apache Spark clusters on AWS EMR.',
    },
    {
      code: 'CAN-IND-046', firstName: 'Jyoti', lastName: 'Mahajan',
      email: 'jyoti.mahajan.ui@gmail.com', phone: '(415) 555-1046',
      city: 'Oakland', state: 'CA', title: 'Senior Vue.js / Nuxt.js Frontend Specialist',
      exp: 7.0, skills: 'Vue.js, Nuxt.js, JavaScript, Tailwind, Pinia, REST API, HTML5',
      auth: 'H1-B', rate: 76, employer: 'Kaiser Permanente',
      summary: 'Modern frontend specialist delivering fast-loading Vue 3 single page applications with clean composables and state architecture.',
    },
    {
      code: 'CAN-IND-047', firstName: 'Chetan', lastName: 'Dave',
      email: 'chetan.dave.sap@gmail.com', phone: '(832) 555-1047',
      city: 'Houston', state: 'TX', title: 'SAP MM / Ariba Sourcing Consultant',
      exp: 11.0, skills: 'SAP MM, Materials Management, SAP Ariba, Procurement, Inventory',
      auth: 'US Citizen', rate: 92, employer: 'Halliburton',
      summary: 'Over a decade optimizing procurement lifecycles, purchase order automation, and Ariba supplier network integration.',
    },
    {
      code: 'CAN-IND-048', firstName: 'Shilpa', lastName: 'Pai',
      email: 'shilpa.pai.scrum@gmail.com', phone: '(617) 555-1048',
      city: 'Cambridge', state: 'MA', title: 'Technical Project Manager & Agile Leader',
      exp: 10.5, skills: 'Project Management, PMP, Agile, JIRA, Budgeting, Risk Analysis',
      auth: 'Green Card', rate: 85, employer: 'Biogen',
      summary: 'PMP certified leader with a proven record directing multi-million dollar software engineering initiatives on schedule.',
    },
    {
      code: 'CAN-IND-049', firstName: 'Manoj', lastName: 'Bansal',
      email: 'manoj.bansal.azure@gmail.com', phone: '(469) 555-1049',
      city: 'Allen', state: 'TX', title: 'Lead Azure DevOps & Cloud Architect',
      exp: 10.0, skills: 'Azure, Azure DevOps, Terraform, Kubernetes, Powershell, C#',
      auth: 'H1-B', rate: 90, employer: 'Fidelity Investments',
      summary: 'Designed cloud foundation blueprints for enterprise financial services on Microsoft Azure with automated deployment pipelines.',
    },
    {
      code: 'CAN-IND-050', firstName: 'Harini', lastName: 'Balasubramanian',
      email: 'harini.bala.datasci@gmail.com', phone: '(408) 555-1050',
      city: 'Santa Clara', state: 'CA', title: 'Senior AI & LLM Systems Researcher',
      exp: 8.0, skills: 'Generative AI, LangChain, RAG, Python, Vector DB, OpenAI API, AWS',
      auth: 'H1-B', rate: 96, employer: 'NVIDIA (Partner Lab)',
      summary: 'Specializing in Retrieval-Augmented Generation (RAG) architectures, LLM fine-tuning, and embedding search over enterprise documentation.',
    },
  ];

  let candidateCount = 0;
  const createdCandidatesList: any[] = [];
  for (const c of indianCandidatesData) {
    let cand = await prisma.candidate.findFirst({
      where: { organizationId: org.id, email: c.email },
    });
    if (!cand) {
      cand = await prisma.candidate.create({
        data: {
          organizationId: org.id,
          candidateCode: c.code,
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.email,
          phone: c.phone,
          city: c.city,
          state: c.state,
          country: 'USA',
          currentTitle: c.title,
          currentEmployer: c.employer,
          totalExperience: c.exp,
          relevantExperience: c.exp,
          skills: c.skills,
          professionalSummary: c.summary,
          education: c.auth === 'OPT' || c.auth === 'CPT' ? 'M.S. in Computer Science (US)' : 'B.Tech / M.S. Computer Engineering',
          certifications: 'AWS / Cloud / Tech Certified',
          availability: 'Immediate (2 Weeks)',
          expectedPayRate: c.rate,
          preferredType: 'Contract (W2 / C2C)',
          workAuthorization: c.auth,
          status: 'Active',
          source: c.auth === 'OPT' || c.auth === 'CPT' ? 'Campus / CareerFair' : 'LinkedIn / Dice',
          assignedRecruiterId: recruiter.id,
        },
      });
      candidateCount++;
    }
    createdCandidatesList.push(cand);
  }
  console.log(`✅ Created/Verified ${candidateCount} Indian Candidates (Total pool: ${createdCandidatesList.length}).`);

  // 7. Associate Candidates to Open Jobs in Recruitment Pipeline (CandidateJob)
  const jobList = Object.values(jobMap);
  const stages = [
    'SOURCED', 'SCREENING', 'SHORTLISTED', 'RTR_RECEIVED',
    'CLIENT_SUBMITTED', 'INTERVIEW_STAGE', 'OFFER_ACCEPTED', 'PLACED'
  ];

  let pipelineCount = 0;
  const submissionsToCreate: any[] = [];
  const interviewsToCreate: any[] = [];
  const placementsToCreate: any[] = [];

  for (let i = 0; i < Math.min(createdCandidatesList.length, 30); i++) {
    const cand = createdCandidatesList[i];
    const job = jobList[i % jobList.length];
    if (!job) continue;

    const assignedStage = stages[i % stages.length];
    const score = 80 + (i % 20);

    let cj = await prisma.candidateJob.findFirst({
      where: { organizationId: org.id, candidateId: cand.id, jobId: job.id },
    });

    if (!cj) {
      cj = await prisma.candidateJob.create({
        data: {
          organizationId: org.id,
          candidateId: cand.id,
          jobId: job.id,
          recruiterId: recruiter.id,
          currentStage: assignedStage,
          matchScore: score,
          notes: `Candidate evaluated with ${score}% skill match for ${job.title}.`,
        },
      });
      pipelineCount++;
    }

    // Submissions for stages from CLIENT_SUBMITTED onwards
    if (['CLIENT_SUBMITTED', 'INTERVIEW_STAGE', 'OFFER_ACCEPTED', 'PLACED'].includes(assignedStage)) {
      submissionsToCreate.push({
        candidateJobId: cj.id,
        candidateId: cand.id,
        jobId: job.id,
        clientAccountId: job.accountId,
        recruiterId: recruiter.id,
        payRate: cand.expectedPayRate || 75,
        billRate: job.billRateMax || 105,
        stage: assignedStage,
      });
    }
  }
  console.log(`✅ Created ${pipelineCount} Candidate Pipeline records.`);

  // 8. Create Submissions
  for (const s of submissionsToCreate) {
    let sub = await prisma.submission.findFirst({
      where: { organizationId: org.id, candidateId: s.candidateId, jobId: s.jobId },
    });
    if (!sub) {
      sub = await prisma.submission.create({
        data: {
          organizationId: org.id,
          candidateJobId: s.candidateJobId,
          candidateId: s.candidateId,
          jobId: s.jobId,
          clientAccountId: s.clientAccountId,
          recruiterId: s.recruiterId,
          payRate: s.payRate,
          billRate: s.billRate,
          marginPercentage: Number((((s.billRate - s.payRate) / s.billRate) * 100).toFixed(2)),
          status: s.stage === 'PLACED' ? 'Offer_Accepted' : s.stage === 'INTERVIEW_STAGE' ? 'Interview_Scheduled' : 'Submitted_to_Client',
          clientFeedback: 'Resume shortlisted by client hiring team. Candidate profile meets all mandatory technical specifications.',
        },
      });

      // Interviews
      if (['INTERVIEW_STAGE', 'OFFER_ACCEPTED', 'PLACED'].includes(s.stage)) {
        interviewsToCreate.push({
          submissionId: sub.id,
          candidateId: s.candidateId,
          jobId: s.jobId,
          stage: s.stage,
        });
      }

      // Placements
      if (['PLACED'].includes(s.stage)) {
        placementsToCreate.push({
          submissionId: sub.id,
          candidateId: s.candidateId,
          jobId: s.jobId,
          clientAccountId: s.clientAccountId,
          payRate: s.payRate,
          billRate: s.billRate,
        });
      }
    }
  }
  console.log(`✅ Created/Verified ${submissionsToCreate.length} Client Submissions.`);

  // 9. Create Interviews
  for (let idx = 0; idx < interviewsToCreate.length; idx++) {
    const inv = interviewsToCreate[idx];
    const existing = await prisma.interview.findFirst({
      where: { organizationId: org.id, submissionId: inv.submissionId },
    });
    if (!existing) {
      await prisma.interview.create({
        data: {
          organizationId: org.id,
          submissionId: inv.submissionId,
          candidateId: inv.candidateId,
          jobId: inv.jobId,
          roundNumber: 2,
          roundName: 'Round 2 - Technical Deep Dive & Coding',
          interviewType: 'Video',
          interviewerName: 'Amit Kapoor (Lead Architect)',
          interviewerEmail: 'amit.kapoor@client.com',
          scheduledAt: new Date(Date.now() + (idx + 1) * 24 * 60 * 60 * 1000),
          timezone: 'America/New_York',
          meetingUrl: `https://teams.microsoft.com/l/meetup-join/tech-interview-rnd2-${idx + 101}`,
          status: inv.stage === 'PLACED' ? 'Completed' : 'Scheduled',
          technicalRating: 5,
          overallRating: 5,
          recommendation: 'Strong Hire. Excellent hands-on problem solving and communication.',
          feedbackNotes: 'Candidate demonstrated deep architecture skills and solved live coding problem with optimal complexity.',
          outcome: 'Passed',
        },
      });
    }
  }
  console.log(`✅ Created/Verified ${interviewsToCreate.length} Interviews.`);

  // 10. Create Placements
  for (const plc of placementsToCreate) {
    const existing = await prisma.placement.findFirst({
      where: { organizationId: org.id, submissionId: plc.submissionId },
    });
    if (!existing) {
      await prisma.placement.create({
        data: {
          organizationId: org.id,
          submissionId: plc.submissionId,
          candidateId: plc.candidateId,
          jobId: plc.jobId,
          clientAccountId: plc.clientAccountId,
          recruiterId: recruiter.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          employmentType: 'Contract',
          payRate: plc.payRate,
          billRate: plc.billRate,
          currency: 'USD',
          grossMargin: plc.billRate - plc.payRate,
          recruiterCommission: 1500,
          accountManagerCommission: 2000,
          status: 'Active',
          notes: 'Consultant successfully on-boarded and working billable hours.',
        },
      });
    }
  }
  console.log(`✅ Created/Verified ${placementsToCreate.length} Active Placements.`);

  console.log('🎉 Seeding Indian Test Dataset Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
