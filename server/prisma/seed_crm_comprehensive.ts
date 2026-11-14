import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedComprehensiveCrm() {
  console.log('🚀 Starting Comprehensive CRM & Opportunities Seeding...');

  // 1. Get Master Organization
  const org = await prisma.organization.findFirst({ where: { slug: 'pavion-tech' } }) ||
              await prisma.organization.findFirst();

  if (!org) {
    console.error('❌ Organization not found. Please run base seed first.');
    return;
  }

  // 2. Fetch Users
  const users = await prisma.user.findMany({ where: { organizationId: org.id } });
  const salesExec = users.find(u => u.role === 'BusinessDevelopmentExecutive') || users[0];
  const accountManager = users.find(u => u.role === 'AccountManager') || users[0];
  const recruiter = users.find(u => u.role === 'SeniorRecruiter') || users[0];

  // 3. Remove any gibberish test opportunities
  const deletedTest = await prisma.opportunity.deleteMany({
    where: {
      OR: [
        { name: { contains: 'bkaufvl' } },
        { name: { contains: 'test' } },
        { estimatedValue: 0 }
      ]
    }
  });
  console.log(`🧹 Cleaned up ${deletedTest.count} invalid/test opportunity records.`);

  // 4. Ensure Premier Client Accounts Exist
  const premierAccounts = [
    {
      name: 'Tata Consultancy Services (TCS America)',
      industry: 'IT Services & Consulting',
      accountType: 'ImplementationPartner',
      companySize: '10000+',
      headquarters: 'Edison, NJ',
      paymentTerms: 'Net 45',
    },
    {
      name: 'Infosys Americas Inc.',
      industry: 'Cloud Transformation & IT',
      accountType: 'ImplementationPartner',
      companySize: '10000+',
      headquarters: 'Richardson, TX',
      paymentTerms: 'Net 30',
    },
    {
      name: 'Wipro USA Technologies',
      industry: 'Enterprise Software & Cloud',
      accountType: 'StaffingVendor',
      companySize: '10000+',
      headquarters: 'East Brunswick, NJ',
      paymentTerms: 'Net 45',
    },
    {
      name: 'Cognizant US',
      industry: 'Digital Engineering',
      accountType: 'ImplementationPartner',
      companySize: '10000+',
      headquarters: 'Teaneck, NJ',
      paymentTerms: 'Net 30',
    },
    {
      name: 'HCL America Inc.',
      industry: 'Digital Engineering & Infrastructure',
      accountType: 'DirectClient',
      companySize: '10000+',
      headquarters: 'Sunnyvale, CA',
      paymentTerms: 'Net 30',
    },
    {
      name: 'Tech Mahindra Americas',
      industry: 'Telecommunications & AI',
      accountType: 'ImplementationPartner',
      companySize: '5000-10000',
      headquarters: 'Plano, TX',
      paymentTerms: 'Net 45',
    },
    {
      name: 'Capgemini Americas',
      industry: 'Financial Services & Cloud',
      accountType: 'ImplementationPartner',
      companySize: '10000+',
      headquarters: 'Chicago, IL',
      paymentTerms: 'Net 30',
    },
    {
      name: 'LTIMindtree US Corporation',
      industry: 'Banking & Financial Technology',
      accountType: 'DirectClient',
      companySize: '5000-10000',
      headquarters: 'Warren, NJ',
      paymentTerms: 'Net 30',
    },
    {
      name: 'Deloitte Consulting US',
      industry: 'Management & Technology Consulting',
      accountType: 'DirectClient',
      companySize: '10000+',
      headquarters: 'New York, NY',
      paymentTerms: 'Net 30',
    },
    {
      name: 'Accenture US Technologies',
      industry: 'Cloud & System Integration',
      accountType: 'ImplementationPartner',
      companySize: '10000+',
      headquarters: 'Chicago, IL',
      paymentTerms: 'Net 30',
    },
    {
      name: 'JPMorgan Chase & Co.',
      industry: 'Investment Banking & FinTech',
      accountType: 'DirectClient',
      companySize: '10000+',
      headquarters: 'New York, NY',
      paymentTerms: 'Net 30',
    },
    {
      name: 'Citigroup North America',
      industry: 'Global Banking & Markets',
      accountType: 'DirectClient',
      companySize: '10000+',
      headquarters: 'Tampa, FL',
      paymentTerms: 'Net 30',
    },
    {
      name: 'Wells Fargo Technologies',
      industry: 'Commercial Banking & Cloud',
      accountType: 'DirectClient',
      companySize: '10000+',
      headquarters: 'Charlotte, NC',
      paymentTerms: 'Net 30',
    },
    {
      name: 'Amazon Web Services (AWS ProServe)',
      industry: 'Cloud Computing & Infrastructure',
      accountType: 'DirectClient',
      companySize: '10000+',
      headquarters: 'Seattle, WA',
      paymentTerms: 'Net 30',
    },
    {
      name: 'Microsoft Enterprise Services',
      industry: 'Cloud Platforms & AI',
      accountType: 'DirectClient',
      companySize: '10000+',
      headquarters: 'Redmond, WA',
      paymentTerms: 'Net 30',
    },
    {
      name: 'Walmart Global Tech',
      industry: 'Retail Tech & Supply Chain',
      accountType: 'DirectClient',
      companySize: '10000+',
      headquarters: 'Bentonville, AR',
      paymentTerms: 'Net 30',
    },
  ];

  const accountMap: Record<string, string> = {};
  for (const acc of premierAccounts) {
    let existing = await prisma.account.findFirst({
      where: { organizationId: org.id, name: acc.name },
    });
    if (!existing) {
      existing = await prisma.account.create({
        data: {
          organizationId: org.id,
          name: acc.name,
          industry: acc.industry,
          accountType: acc.accountType,
          companySize: acc.companySize,
          headquarters: acc.headquarters,
          paymentTerms: acc.paymentTerms,
          status: 'Active',
          accountManagerId: accountManager.id,
        },
      });
    }
    accountMap[acc.name] = existing.id;
  }
  console.log(`✅ Verified ${Object.keys(accountMap).length} premier client accounts.`);

  // 5. Seed 30+ Realistic Opportunities Across All 8 Stages
  const opportunitiesData = [
    // --- 1. New Opportunity (4 Deals) ---
    {
      accountName: 'Amazon Web Services (AWS ProServe)',
      name: 'AWS Cloud Migration Squad (6 Roles)',
      stage: 'NewOpportunity',
      estimatedValue: 540000,
      probability: 35,
      expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      notes: 'Initial requisition intake for 4 AWS Architects and 2 Terraform leads.',
    },
    {
      accountName: 'Tata Consultancy Services (TCS America)',
      name: 'Citigroup Core Banking Modernization (5 Roles)',
      stage: 'NewOpportunity',
      estimatedValue: 420000,
      probability: 40,
      expectedCloseDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      notes: 'High-margin C2H staffing engagement for Citi Tampa office.',
    },
    {
      accountName: 'Infosys Americas Inc.',
      name: 'Telecom 5G Core Microservices Team',
      stage: 'NewOpportunity',
      estimatedValue: 360000,
      probability: 30,
      expectedCloseDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
      notes: 'Plano, TX hybrid requirements for Spring Boot and Kafka leads.',
    },
    {
      accountName: 'Wipro USA Technologies',
      name: 'Snowflake Enterprise Data Mesh (3 Roles)',
      stage: 'NewOpportunity',
      estimatedValue: 275000,
      probability: 45,
      expectedCloseDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      notes: 'Snowpipe and DBT transformation specialists needed for healthcare client.',
    },

    // --- 2. Qualification (4 Deals) ---
    {
      accountName: 'Cognizant US',
      name: 'Capital One React & Node Engineers (4 Roles)',
      stage: 'Qualification',
      estimatedValue: 380000,
      probability: 50,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes: 'Verifying rate caps ($95/hr bill rate, $75/hr pay rate target).',
    },
    {
      accountName: 'HCL America Inc.',
      name: 'Silicon Valley SRE & Kubernetes Team',
      stage: 'Qualification',
      estimatedValue: 315000,
      probability: 55,
      expectedCloseDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      notes: 'Hybrid Sunnyvale, CA site; USC and GC candidates prioritized.',
    },
    {
      accountName: 'Tech Mahindra Americas',
      name: 'Enterprise Salesforce LWC Architecture',
      stage: 'Qualification',
      estimatedValue: 285000,
      probability: 50,
      expectedCloseDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      notes: '3 Salesforce Platform Developer II specialists required.',
    },
    {
      accountName: 'Capgemini Americas',
      name: 'Financial Services Java Microservices Squad',
      stage: 'Qualification',
      estimatedValue: 360000,
      probability: 55,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes: '4 senior Java 21 engineers for Charlotte and Chicago hubs.',
    },

    // --- 3. Discovery Meeting (4 Deals) ---
    {
      accountName: 'LTIMindtree US Corporation',
      name: 'Cloud Security & Okta IAM Implementation',
      stage: 'Discovery',
      estimatedValue: 260000,
      probability: 60,
      expectedCloseDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      notes: 'Discovery meeting with Director of Cyber Security scheduled for Thursday.',
    },
    {
      accountName: 'Deloitte Consulting US',
      name: 'CyberSec Identity & Access Governance (3 Roles)',
      stage: 'Discovery',
      estimatedValue: 345000,
      probability: 65,
      expectedCloseDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
      notes: 'Meeting with lead Partner to align on technical screening rubric.',
    },
    {
      accountName: 'Accenture US Technologies',
      name: 'Global Supply Chain Data Pipeline Specialists',
      stage: 'Discovery',
      estimatedValue: 420000,
      probability: 60,
      expectedCloseDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000),
      notes: 'Reviewing scope of Databricks and PySpark integration.',
    },
    {
      accountName: 'Walmart Global Tech',
      name: 'E-Commerce Checkout Concurrency Squad (4 Roles)',
      stage: 'Discovery',
      estimatedValue: 390000,
      probability: 65,
      expectedCloseDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      notes: 'High-throughput event streaming architecture discussion.',
    },

    // --- 4. Requirements Discussion (4 Deals) ---
    {
      accountName: 'JPMorgan Chase & Co.',
      name: 'Core Banking API Modernization (5 Roles)',
      stage: 'RequirementsDiscussion',
      estimatedValue: 525000,
      probability: 70,
      expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      notes: 'Finalizing skill weights: 50% Spring Boot, 25% AWS, 25% Kafka.',
    },
    {
      accountName: 'Wells Fargo Technologies',
      name: 'Commercial Lending Java Full Stack Specialists',
      stage: 'RequirementsDiscussion',
      estimatedValue: 390000,
      probability: 75,
      expectedCloseDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
      notes: 'Client confirmed 12-month contract duration with hybrid flexibility.',
    },
    {
      accountName: 'Citigroup North America',
      name: 'Global Wealth Analytics Platform (3 Roles)',
      stage: 'RequirementsDiscussion',
      estimatedValue: 330000,
      probability: 70,
      expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      notes: 'Confirmed $105/hr bill rate and 2-round interview process.',
    },
    {
      accountName: 'Microsoft Enterprise Services',
      name: 'Azure Hybrid Cloud DevOps Architects (4 Roles)',
      stage: 'RequirementsDiscussion',
      estimatedValue: 480000,
      probability: 75,
      expectedCloseDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
      notes: 'Validating clearance and security prerequisites with procurement.',
    },

    // --- 5. Proposal Sent (4 Deals) ---
    {
      accountName: 'Citigroup North America',
      name: 'Enterprise AWS Infrastructure Proposal',
      stage: 'ProposalSent',
      estimatedValue: 480000,
      probability: 75,
      expectedCloseDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      notes: 'Detailed commercial submittal dossier submitted to VMS portal.',
    },
    {
      accountName: 'Tata Consultancy Services (TCS America)',
      name: 'Retail Transformation React & TypeScript Team',
      stage: 'ProposalSent',
      estimatedValue: 340000,
      probability: 80,
      expectedCloseDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      notes: 'Candidate resumes pre-vetted with 94%+ match scores submitted.',
    },
    {
      accountName: 'Infosys Americas Inc.',
      name: 'Capital One FinTech Cloud Expansion SOW',
      stage: 'ProposalSent',
      estimatedValue: 410000,
      probability: 80,
      expectedCloseDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      notes: 'Statement of Work under final legal and rate card review.',
    },
    {
      accountName: 'Wipro USA Technologies',
      name: 'Healthcare Analytics Data Engineering Proposal',
      stage: 'ProposalSent',
      estimatedValue: 350000,
      probability: 75,
      expectedCloseDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      notes: 'Rate schedule and Right-to-Represent confirmation attached.',
    },

    // --- 6. Negotiation (4 Deals) ---
    {
      accountName: 'JPMorgan Chase & Co.',
      name: 'Tier-1 Master Vendor Service Agreement Expansion',
      stage: 'Negotiation',
      estimatedValue: 620000,
      probability: 85,
      expectedCloseDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      notes: 'Negotiating volume discount tier (25% gross margin maintained).',
    },
    {
      accountName: 'Wells Fargo Technologies',
      name: '10 Java Leads & Architects Master SOW',
      stage: 'Negotiation',
      estimatedValue: 540000,
      probability: 90,
      expectedCloseDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      notes: 'All 10 candidate profiles cleared technical interview rounds.',
    },
    {
      accountName: 'Walmart Global Tech',
      name: 'Supply Chain Event Streaming Contract Renewal',
      stage: 'Negotiation',
      estimatedValue: 420000,
      probability: 85,
      expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: '12-month extension with $5/hr rate increment approved.',
    },
    {
      accountName: 'Cognizant US',
      name: 'Healthcare Claims Modernization Team (3 Roles)',
      stage: 'Negotiation',
      estimatedValue: 290000,
      probability: 90,
      expectedCloseDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      notes: 'Finalizing payment terms: Net 30 with early payment discount.',
    },

    // --- 7. Closed Won (4 Deals 🎉) ---
    {
      accountName: 'Microsoft Enterprise Services',
      name: 'Azure Cloud Modernization Project (6 Placements)',
      stage: 'ClosedWon',
      estimatedValue: 680000,
      probability: 100,
      expectedCloseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      notes: 'Closed Won! 6 contractors onboarded and generating billing.',
    },
    {
      accountName: 'Tata Consultancy Services (TCS America)',
      name: 'Citigroup Wealth Management Team (5 Placements)',
      stage: 'ClosedWon',
      estimatedValue: 520000,
      probability: 100,
      expectedCloseDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      notes: 'Contract executed. All candidates passed background verification.',
    },
    {
      accountName: 'Infosys Americas Inc.',
      name: 'FinTech Microservices Core Squad (4 Placements)',
      stage: 'ClosedWon',
      estimatedValue: 460000,
      probability: 100,
      expectedCloseDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      notes: 'Annual billing started with $24.8% average gross margin.',
    },
    {
      accountName: 'Amazon Web Services (AWS ProServe)',
      name: 'AWS Solutions Architecture Subcontract (3 Placements)',
      stage: 'ClosedWon',
      estimatedValue: 390000,
      probability: 100,
      expectedCloseDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      notes: 'Signed and active! Client requested 2 additional resources.',
    },

    // --- 8. Closed Lost (2 Deals) ---
    {
      accountName: 'HCL America Inc.',
      name: 'Legacy On-Premise Storage Maintenance',
      stage: 'ClosedLost',
      estimatedValue: 180000,
      probability: 0,
      expectedCloseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      notes: 'Client canceled project due to corporate budget freeze.',
    },
    {
      accountName: 'Tech Mahindra Americas',
      name: 'Legacy PHP Portal Support Services',
      stage: 'ClosedLost',
      estimatedValue: 140000,
      probability: 0,
      expectedCloseDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      notes: 'Competitor submitted below minimum rate card thresholds.',
    },
  ];

  let oppCreatedCount = 0;
  for (const o of opportunitiesData) {
    const accId = accountMap[o.accountName];
    if (accId) {
      const existing = await prisma.opportunity.findFirst({
        where: { organizationId: org.id, name: o.name },
      });
      if (!existing) {
        await prisma.opportunity.create({
          data: {
            organizationId: org.id,
            accountId: accId,
            name: o.name,
            stage: o.stage,
            estimatedValue: o.estimatedValue,
            probability: o.probability,
            expectedCloseDate: o.expectedCloseDate,
            assignedUserId: salesExec.id,
            notes: o.notes,
          },
        });
        oppCreatedCount++;
      }
    }
  }
  console.log(`🎉 Successfully seeded ${oppCreatedCount} new sales opportunities across all 8 pipeline stages!`);

  // 6. Seed 20+ Realistic Leads
  const comprehensiveLeads = [
    {
      companyName: 'Stripe Payments US',
      website: 'https://stripe.com',
      industry: 'FinTech / Payments',
      contactPerson: 'David Vance',
      email: 'dvance@stripe-recruiting.com',
      phone: '(415) 555-0142',
      location: 'San Francisco, CA',
      leadSource: 'LinkedIn',
      status: 'Qualified',
      priority: 'Urgent',
      notes: 'Needs 8 Golang and Distributed Systems microservices engineers.',
    },
    {
      companyName: 'Snowflake Computing',
      website: 'https://snowflake.com',
      industry: 'Data Cloud & Warehousing',
      contactPerson: 'Megan Brooks',
      email: 'mbrooks@snowflake-talent.com',
      phone: '(408) 555-0199',
      location: 'San Mateo, CA',
      leadSource: 'Referral',
      status: 'Meeting Scheduled',
      priority: 'High',
      notes: 'Referred by VP of Engineering. Interested in OPT/CPT to H-1B transfer talent.',
    },
    {
      companyName: 'Coinbase Global',
      website: 'https://coinbase.com',
      industry: 'Crypto / Web3 FinTech',
      contactPerson: 'Alexei Romanov',
      email: 'aromanov@coinbase.io',
      phone: '(312) 555-4812',
      location: 'Chicago, IL',
      leadSource: 'Dice',
      status: 'Proposal Sent',
      priority: 'High',
      notes: 'Seeking smart contract auditors and AWS infrastructure leads.',
    },
    {
      companyName: 'Capital One Financial',
      website: 'https://capitalone.com',
      industry: 'Banking / Credit Services',
      contactPerson: 'Rachel Adams',
      email: 'radams@capitalone-staffing.com',
      phone: '(703) 555-9831',
      location: 'McLean, VA',
      leadSource: 'LinkedIn',
      status: 'Negotiation',
      priority: 'Urgent',
      notes: 'Negotiating preferred vendor status for 2026 tech staffing.',
    },
    {
      companyName: 'Databricks AI Labs',
      website: 'https://databricks.com',
      industry: 'Artificial Intelligence & Big Data',
      contactPerson: 'Sanjay Chawla',
      email: 'schawla@databricks-eng.com',
      phone: '(415) 555-7723',
      location: 'San Francisco, CA',
      leadSource: 'Cold Outreach',
      status: 'Interested',
      priority: 'High',
      notes: 'Looking for PySpark and ML infrastructure specialists.',
    },
    {
      companyName: 'UnitedHealth Group',
      website: 'https://unitedhealthgroup.com',
      industry: 'Healthcare / HealthTech',
      contactPerson: 'Barbara Miller',
      email: 'bmiller@optum-hiring.com',
      phone: '(612) 555-3211',
      location: 'Minneapolis, MN',
      leadSource: 'Email Enquiries',
      status: 'Contacted',
      priority: 'Medium',
      notes: 'Inbound enquiry for 10 Java Spring Boot and HIPAA compliance analysts.',
    },
    {
      companyName: 'Tesla Energy & Automation',
      website: 'https://tesla.com',
      industry: 'Automotive & Clean Energy',
      contactPerson: 'Marcus Lindqvist',
      email: 'mlindqvist@tesla-talent.com',
      phone: '(512) 555-8844',
      location: 'Austin, TX',
      leadSource: 'LinkedIn',
      status: 'New',
      priority: 'High',
      notes: 'Automotive embedded systems and React dashboard contractors.',
    },
    {
      companyName: 'Oracle Cloud Infrastructure',
      website: 'https://oracle.com',
      industry: 'Cloud Infrastructure',
      contactPerson: 'Jonathan Lee',
      email: 'jlee@oracle-cloud.com',
      phone: '(650) 555-6612',
      location: 'Austin, TX',
      leadSource: 'Referral',
      status: 'Won',
      priority: 'Urgent',
      notes: 'Contract executed! Account transitioned to Account Manager.',
    },
    {
      companyName: 'Fidelity Investments',
      website: 'https://fidelity.com',
      industry: 'Wealth & Asset Management',
      contactPerson: 'Claire Higgins',
      email: 'chiggins@fidelity-talent.com',
      phone: '(617) 555-9082',
      location: 'Boston, MA',
      leadSource: 'LinkedIn',
      status: 'Qualified',
      priority: 'High',
      notes: 'Requirements for AWS Cloud Architects and Terraform leads.',
    },
    {
      companyName: 'Cisco Systems Networking',
      website: 'https://cisco.com',
      industry: 'Networking & Telecommunications',
      contactPerson: 'Arun Bhatia',
      email: 'abhatia@cisco-talent.com',
      phone: '(408) 555-3490',
      location: 'San Jose, CA',
      leadSource: 'Dice',
      status: 'Meeting Scheduled',
      priority: 'Medium',
      notes: '5G network automation and Python SRE staffing discussion.',
    },
    {
      companyName: 'General Motors Autonomous',
      website: 'https://gm.com',
      industry: 'Automotive / Robotics',
      contactPerson: 'Timothy Clark',
      email: 'tclark@gm-cruise.com',
      phone: '(313) 555-7123',
      location: 'Detroit, MI',
      leadSource: 'Cold Outreach',
      status: 'Interested',
      priority: 'Medium',
      notes: 'Computer Vision and ROS2 C++ developer requirements.',
    },
    {
      companyName: 'Netflix Streaming Infrastructure',
      website: 'https://netflix.com',
      industry: 'Media & Entertainment Tech',
      contactPerson: 'Sarah Lin',
      email: 'slin@netflix-ops.com',
      phone: '(408) 555-8812',
      location: 'Los Gatos, CA',
      leadSource: 'LinkedIn',
      status: 'Contacted',
      priority: 'High',
      notes: 'High-scale edge caching and CDN optimization contractors.',
    },
  ];

  let leadCount = 0;
  for (const l of comprehensiveLeads) {
    const existing = await prisma.lead.findFirst({
      where: { organizationId: org.id, companyName: l.companyName },
    });
    if (!existing) {
      await prisma.lead.create({
        data: {
          organizationId: org.id,
          ...l,
          assignedUserId: salesExec.id,
        },
      });
      leadCount++;
    }
  }
  console.log(`✅ Successfully seeded ${leadCount} new enterprise leads!`);

  console.log('=== All CRM Data Seeded Successfully! ===');
}

seedComprehensiveCrm()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
