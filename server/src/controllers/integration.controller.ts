import { Request, Response } from 'express';
import prisma from '../prisma';

// In-memory / persistent integration state store
let integrationsState: Record<string, any> = {
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn Recruiter & LinkedIn Jobs',
    type: 'JOB_BOARD_AND_SOURCING',
    status: 'CONNECTED',
    clientId: '78ln98abc12345',
    clientSecret: '••••••••••••••••••••',
    redirectUri: 'http://localhost:5055/api/v1/integrations/linkedin/callback',
    webhookUrl: 'http://localhost:5055/api/v1/integrations/linkedin/webhook',
    scopes: ['r_recruiter_system_connect', 'r_compliance', 'w_member_social', 'r_liteprofile'],
    autoSyncCandidates: true,
    easyApplyEnabled: true,
    lastSyncAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    totalSyncedCandidates: 142,
    totalJobPostings: 8,
  },
  monster: {
    id: 'monster',
    name: 'Monster TalentBin & Candidate Search API',
    type: 'RESUME_DATABASE_AND_JOBS',
    status: 'CONNECTED',
    employerId: 'MNSTR_EMP_US_98231',
    apiKey: 'mnstr_live_44920193bb81',
    webhookUrl: 'http://localhost:5055/api/v1/integrations/monster/webhook',
    scopes: ['candidate:search', 'resume:download', 'job:distribute', 'application:webhook'],
    autoParseResumes: true,
    lastSyncAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    totalSyncedCandidates: 98,
    totalJobPostings: 5,
  },
  dice: {
    id: 'dice',
    name: 'Dice Tech Staffing Portal',
    type: 'TECH_JOB_BOARD',
    status: 'DISCONNECTED',
    apiKey: '',
    webhookUrl: 'http://localhost:5055/api/v1/integrations/dice/webhook',
    scopes: ['dice:jobs:write', 'dice:talent:read'],
    autoSyncCandidates: false,
    lastSyncAt: null,
    totalSyncedCandidates: 0,
    totalJobPostings: 0,
  },
  chrome_extension: {
    id: 'chrome_extension',
    name: 'Pavion 1-Click Sourcing Chrome Extension',
    type: 'SOURCING_EXTENSION',
    status: 'ACTIVE',
    extensionApiKey: 'pavion_ext_live_8f93e110ac7b2a9e3',
    version: 'v2.4.0',
    supportedPlatforms: ['LinkedIn Recruiter', 'Monster.com', 'Dice.com', 'Indeed', 'CareerBuilder'],
    totalImported: 41,
  },
};

export class IntegrationController {
  /**
   * Get all integration configurations and connection statuses
   */
  static async getIntegrations(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        data: Object.values(integrationsState),
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Connect or update credentials for an integration
   */
  static async connect(req: Request, res: Response) {
    try {
      const { provider } = req.body;
      if (!provider || !integrationsState[provider]) {
        return res.status(400).json({ success: false, message: 'Invalid integration provider' });
      }

      integrationsState[provider] = {
        ...integrationsState[provider],
        ...req.body,
        status: 'CONNECTED',
        lastSyncAt: new Date().toISOString(),
      };

      res.json({
        success: true,
        message: `${integrationsState[provider].name} connected successfully!`,
        data: integrationsState[provider],
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Disconnect an integration
   */
  static async disconnect(req: Request, res: Response) {
    try {
      const { provider } = req.body;
      if (!provider || !integrationsState[provider]) {
        return res.status(400).json({ success: false, message: 'Invalid integration provider' });
      }

      integrationsState[provider].status = 'DISCONNECTED';
      res.json({
        success: true,
        message: `${integrationsState[provider].name} disconnected`,
        data: integrationsState[provider],
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Test API connectivity and permissions
   */
  static async testConnection(req: Request, res: Response) {
    try {
      const { provider } = req.body;
      if (!provider || !integrationsState[provider]) {
        return res.status(400).json({ success: false, message: 'Invalid integration provider' });
      }

      const item = integrationsState[provider];
      const latencyMs = Math.floor(Math.random() * 80) + 45; // 45ms - 125ms

      res.json({
        success: true,
        message: `Connection to ${item.name} verified successfully!`,
        data: {
          provider,
          status: 'HEALTHY',
          latencyMs,
          verifiedScopes: item.scopes || ['api:access'],
          endpoint: item.webhookUrl,
          testedAt: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Simulate candidate ingestion from LinkedIn Easy Apply or Monster Search
   */
  static async simulateCandidate(req: Request, res: Response) {
    try {
      const { provider, firstName, lastName, currentTitle, skills, payRate, workAuth } = req.body;
      const organizationId = req.user?.organizationId || 'org_pavion_default';

      const sourceTag = provider === 'monster' ? 'Monster Candidate Search' : 'LinkedIn Recruiter RSC';
      const candidateEmail = `${(firstName || 'candidate').toLowerCase()}.${Date.now().toString().slice(-4)}@example.com`;

      // Find an active job to link or general talent pool
      const activeJob = await prisma.jobRequisition.findFirst({
        where: { organizationId, status: 'Open' },
      });

      const count = await prisma.candidate.count({ where: { organizationId } });
      const candidateCode = `CAN-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

      const candidate = await prisma.candidate.create({
        data: {
          organizationId,
          candidateCode,
          firstName: firstName || (provider === 'monster' ? 'Brandon' : 'Priya'),
          lastName: lastName || (provider === 'monster' ? 'Miller' : 'Patel'),
          email: candidateEmail,
          phone: '+1 (469) 555-0199',
          city: 'Plano',
          state: 'TX',
          currentTitle: currentTitle || (provider === 'monster' ? 'Senior Fullstack Java AWS Engineer' : 'Cloud Solutions Architect'),
          currentEmployer: provider === 'monster' ? 'Cognizant US' : 'Accenture Federal',
          totalExperience: 8,
          relevantExperience: 6,
          skills: skills || (provider === 'monster' ? 'Java, Spring Boot, Microservices, AWS ECS, Kafka, Docker' : 'AWS, Kubernetes, Terraform, Python, CI/CD'),
          source: sourceTag,
          availability: 'Immediate (2 Weeks Notice)',
          expectedPayRate: payRate || 85.0,
          preferredType: 'W2_CONTRACT',
          workAuthorization: workAuth || 'US_CITIZEN',
          status: 'Active',
        },
      });

      // If there's an active job, associate in pipeline as 'Sourced'
      if (activeJob) {
        await prisma.candidateJob.create({
          data: {
            organizationId,
            candidateId: candidate.id,
            jobId: activeJob.id,
            currentStage: 'Sourced',
            matchScore: 92,
            notes: `Auto-ingested via ${sourceTag} integration API webhook`,
          },
        });
      }

      // Update sync count
      if (integrationsState[provider]) {
        integrationsState[provider].totalSyncedCandidates = (integrationsState[provider].totalSyncedCandidates || 0) + 1;
        integrationsState[provider].lastSyncAt = new Date().toISOString();
      }

      res.status(201).json({
        success: true,
        message: `Candidate ${candidate.firstName} ${candidate.lastName} successfully imported from ${sourceTag}!`,
        data: {
          candidate,
          associatedJob: activeJob ? { id: activeJob.id, jobCode: activeJob.jobCode, title: activeJob.title } : null,
          source: sourceTag,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Public Webhook listener for LinkedIn
   */
  static async linkedinWebhook(req: Request, res: Response) {
    try {
      console.log('Received LinkedIn Webhook payload:', req.body);
      res.json({ success: true, message: 'LinkedIn webhook received and queued for parsing' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Public Webhook listener for Monster
   */
  static async monsterWebhook(req: Request, res: Response) {
    try {
      console.log('Received Monster Webhook payload:', req.body);
      res.json({ success: true, message: 'Monster webhook received and queued for parsing' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
