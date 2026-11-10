import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthController } from '../controllers/auth.controller';
import { CrmController } from '../controllers/crm.controller';
import { JobController } from '../controllers/job.controller';
import { CandidateController } from '../controllers/candidate.controller';
import { PipelineController } from '../controllers/pipeline.controller';
import { SubmissionController } from '../controllers/submission.controller';
import { InterviewController } from '../controllers/interview.controller';
import { PlacementController } from '../controllers/placement.controller';
import { DashboardController } from '../controllers/dashboard.controller';
import { SettingsController } from '../controllers/settings.controller';
import { IntegrationController } from '../controllers/integration.controller';
import { NotificationController } from '../controllers/notification.controller';
import { EnterpriseAtsController } from '../controllers/enterpriseAts.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Configure Multer for resume uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${Date.now()}_${basename}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ================= PUBLIC AUTH & WEBHOOK ROUTES =================
router.post('/auth/login', AuthController.login);
router.post('/integrations/linkedin/webhook', IntegrationController.linkedinWebhook);
router.post('/integrations/monster/webhook', IntegrationController.monsterWebhook);

// ================= PROTECTED ROUTES (authMiddleware) =================
router.use(authMiddleware);

// Auth Me
router.get('/auth/me', AuthController.me);

// Dashboard
router.get('/dashboard/overview', DashboardController.getOverview);

// CRM - Leads
router.get('/leads', CrmController.getLeads);
router.post('/leads', CrmController.createLead);
router.get('/leads/:id', CrmController.getLeadById);
router.patch('/leads/:id', CrmController.updateLead);
router.post('/leads/:id/convert', CrmController.convertLead);

// CRM - Accounts
router.get('/accounts', CrmController.getAccounts);
router.post('/accounts', CrmController.createAccount);
router.get('/accounts/:id', CrmController.getAccountById);

// CRM - Contacts
router.get('/contacts', CrmController.getContacts);
router.post('/contacts', CrmController.createContact);

// CRM - Opportunities
router.get('/opportunities', CrmController.getOpportunities);
router.post('/opportunities', CrmController.createOpportunity);
router.patch('/opportunities/:id/stage', CrmController.updateOpportunityStage);

// CRM - Activities & Tasks
router.get('/activities', CrmController.getActivities);
router.post('/activities', CrmController.createActivity);
router.get('/tasks', CrmController.getTasks);
router.post('/tasks', CrmController.createTask);
router.patch('/tasks/:id', CrmController.updateTask);

// ATS - Job Requisitions
router.get('/jobs', JobController.getJobs);
router.post('/jobs', JobController.createJob);
router.get('/jobs/:id', JobController.getJobById);
router.patch('/jobs/:id', JobController.updateJob);
router.post('/jobs/:id/approve', JobController.approveJob);
router.get('/jobs/:id/candidate-matches', JobController.getCandidateMatches);

// ATS - Candidates
router.get('/candidates', CandidateController.getCandidates);
router.post('/candidates', CandidateController.createCandidate);
router.get('/candidates/check-duplicate', CandidateController.checkDuplicate);
router.post('/candidates/upload-resume', upload.single('resume'), CandidateController.uploadResume);
router.get('/candidates/:id', CandidateController.getCandidateById);
router.patch('/candidates/:id', CandidateController.updateCandidate);

// ATS - Pipeline
router.post('/jobs/:jobId/candidates', PipelineController.associateCandidateToJob);
router.get('/candidate-jobs', PipelineController.getCandidateJobs);
router.patch('/candidate-jobs/:id/stage', PipelineController.updateStage);
router.post('/candidate-jobs/:id/rtr', PipelineController.recordRTR);

// ATS - Client Submissions
router.get('/submissions', SubmissionController.getSubmissions);
router.post('/submissions', SubmissionController.createSubmission);
router.get('/submissions/:id', SubmissionController.getSubmissionById);
router.patch('/submissions/:id/status', SubmissionController.updateSubmissionStatus);

// ATS - Interviews
router.get('/interviews', InterviewController.getInterviews);
router.post('/interviews', InterviewController.scheduleInterview);
router.post('/interviews/:id/feedback', InterviewController.recordFeedback);

// ATS - Placements
router.get('/placements', PlacementController.getPlacements);
router.post('/placements', PlacementController.createPlacement);
router.patch('/placements/:id', PlacementController.updatePlacement);

// Administration & Settings
router.get('/organizations/current', SettingsController.getOrganization);
router.patch('/organizations/current', SettingsController.updateOrganization);
router.get('/users', SettingsController.getUsers);
router.post('/users', SettingsController.createUser);
router.patch('/users/:id', SettingsController.updateUser);
router.get('/audit-logs', SettingsController.getAuditLogs);

// Integrations Hub (LinkedIn, Monster, Dice, Chrome Extension)
router.get('/integrations', IntegrationController.getIntegrations);
router.post('/integrations/connect', IntegrationController.connect);
router.post('/integrations/disconnect', IntegrationController.disconnect);
router.post('/integrations/test', IntegrationController.testConnection);
router.post('/integrations/simulate-candidate', IntegrationController.simulateCandidate);

// Notifications
router.get('/notifications', NotificationController.getNotifications);
router.patch('/notifications/:id/read', NotificationController.markAsRead);
router.post('/notifications/mark-all-read', NotificationController.markAllAsRead);

// =========================================================================
// ENTERPRISE ATS EXTENSION MODULE ROUTES (9 MODULES)
// =========================================================================

// 1. Talent Pools & Sourcing
router.get('/talent-pools', EnterpriseAtsController.getTalentPools);
router.post('/talent-pools', EnterpriseAtsController.createTalentPool);
router.get('/talent-pools/:id', EnterpriseAtsController.getTalentPoolById);
router.post('/talent-pools/:id/members', EnterpriseAtsController.addMemberToPool);
router.delete('/talent-pools/:id/members/:candidateId', EnterpriseAtsController.removeMemberFromPool);
router.get('/talent-pools/:id/match-jobs', EnterpriseAtsController.matchJobsForPool);

// 2. Candidate Screening & Killer Questions
router.get('/screening/assessments', EnterpriseAtsController.getScreenings);
router.post('/screening/assessments', EnterpriseAtsController.createScreening);
router.patch('/screening/assessments/:id', EnterpriseAtsController.updateScreening);

// 3. Interview Kits & Scorecards
router.get('/interview-kits', EnterpriseAtsController.getInterviewKits);
router.post('/interview-kits', EnterpriseAtsController.createInterviewKit);
router.get('/interview-kits/scorecards', EnterpriseAtsController.getScorecards);
router.post('/interview-kits/scorecards', EnterpriseAtsController.submitScorecard);

// 4. Offer Management & Spread Calculator
router.get('/offers', EnterpriseAtsController.getOffers);
router.post('/offers', EnterpriseAtsController.createOffer);
router.patch('/offers/:id/status', EnterpriseAtsController.updateOfferStatus);

// 5. Candidate Onboarding & Verification
router.get('/onboarding/tasks', EnterpriseAtsController.getOnboardingTasks);
router.post('/onboarding/tasks', EnterpriseAtsController.createOnboardingTask);
router.patch('/onboarding/tasks/:id/verify', EnterpriseAtsController.verifyOnboardingTask);

// 6. Credential & Compliance Management
router.get('/compliance/credentials', EnterpriseAtsController.getCredentials);
router.post('/compliance/credentials', EnterpriseAtsController.createCredential);
router.patch('/compliance/credentials/:id/verify', EnterpriseAtsController.verifyCredential);
router.get('/compliance/alerts', EnterpriseAtsController.getComplianceAlerts);

// 7. Candidate Communication & Engagement
router.get('/communications/logs', EnterpriseAtsController.getCommunicationLogs);
router.post('/communications/send', EnterpriseAtsController.sendCommunication);
router.get('/communications/templates', EnterpriseAtsController.getMessageTemplates);
router.post('/communications/templates', EnterpriseAtsController.createMessageTemplate);

// 8. Consultant Redeployment & Bench Management
router.get('/redeployment/forecast', EnterpriseAtsController.getRedeploymentForecast);
router.post('/redeployment/extend-contract', EnterpriseAtsController.extendContract);

// 9. Vendor / MSP / VMS Management
router.get('/vendors', EnterpriseAtsController.getVendors);
router.post('/vendors', EnterpriseAtsController.createVendor);
router.get('/vendors/submissions', EnterpriseAtsController.getVendorSubmissions);
router.post('/vendors/submissions', EnterpriseAtsController.createVendorSubmission);
router.patch('/vendors/submissions/:id/status', EnterpriseAtsController.updateVendorSubmissionStatus);

export default router;
