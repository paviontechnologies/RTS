import { Request, Response } from 'express';
import prisma from '../prisma';

export class SubmissionController {
  public static async getSubmissions(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { status, clientAccountId, jobId, recruiterId } = req.query;

      const where: any = { organizationId: orgId };
      if (status) where.status = String(status);
      if (clientAccountId) where.clientAccountId = String(clientAccountId);
      if (jobId) where.jobId = String(jobId);
      if (recruiterId) where.recruiterId = String(recruiterId);

      const submissions = await prisma.submission.findMany({
        where,
        include: {
          candidate: true,
          job: {
            include: {
              account: { select: { id: true, name: true } },
            },
          },
          clientAccount: { select: { id: true, name: true } },
          recruiter: { select: { id: true, firstName: true, lastName: true, email: true } },
          interviews: true,
          placements: true,
        },
        orderBy: { submittedAt: 'desc' },
      });

      return res.json({ success: true, data: submissions });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createSubmission(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { candidateJobId, payRate, billRate, resumeVersion, clientFeedback, nextAction } = req.body;

      if (!candidateJobId || payRate === undefined || billRate === undefined) {
        return res.status(400).json({
          success: false,
          message: 'candidateJobId, payRate, and billRate are required',
        });
      }

      const candidateJob = await prisma.candidateJob.findFirst({
        where: { id: candidateJobId, organizationId: orgId },
        include: {
          job: true,
          candidate: true,
        },
      });

      if (!candidateJob) {
        return res.status(404).json({ success: false, message: 'Candidate Job record not found' });
      }

      // Guard: Duplicate submission check for the same job
      const existingSubmission = await prisma.submission.findFirst({
        where: {
          organizationId: orgId,
          jobId: candidateJob.jobId,
          candidateId: candidateJob.candidateId,
          status: { notIn: ['Withdrawn', 'Rejected'] },
        },
      });

      if (existingSubmission) {
        return res.status(409).json({
          success: false,
          message: `Candidate ${candidateJob.candidate.firstName} ${candidateJob.candidate.lastName} is already submitted to ${candidateJob.job.title} (Submission ID: ${existingSubmission.id})`,
          duplicateSubmissionId: existingSubmission.id,
        });
      }

      const submission = await prisma.submission.create({
        data: {
          organizationId: orgId,
          candidateJobId: candidateJob.id,
          candidateId: candidateJob.candidateId,
          jobId: candidateJob.jobId,
          clientAccountId: candidateJob.job.accountId,
          recruiterId: req.user!.id,
          resumeVersion: resumeVersion || 'v1',
          payRate: parseFloat(payRate),
          billRate: parseFloat(billRate),
          status: 'Submitted',
          clientFeedback,
          nextAction: nextAction || 'Client Review Pending',
        },
        include: {
          candidate: true,
          job: true,
          clientAccount: true,
        },
      });

      // Advance stage to SubmittedToClient
      await prisma.candidateJob.update({
        where: { id: candidateJobId },
        data: { currentStage: 'SubmittedToClient' },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          organizationId: orgId,
          activityType: 'CandidateSubmitted',
          relatedEntityType: 'Submission',
          relatedEntityId: submission.id,
          subject: `Submitted ${candidateJob.candidate.firstName} ${candidateJob.candidate.lastName} to ${submission.clientAccount.name} for ${candidateJob.job.title} (Pay: $${payRate}/hr, Bill: $${billRate}/hr)`,
          performedById: req.user!.id,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Candidate submitted to client successfully',
        data: submission,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getSubmissionById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const submission = await prisma.submission.findFirst({
        where: { id, organizationId: req.user!.organizationId },
        include: {
          candidate: true,
          job: { include: { account: true } },
          clientAccount: true,
          recruiter: true,
          interviews: true,
          placements: true,
        },
      });

      if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });
      return res.json({ success: true, data: submission });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateSubmissionStatus(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const { status, clientFeedback, nextAction } = req.body;

      const submission = await prisma.submission.update({
        where: { id },
        data: {
          status,
          clientFeedback: clientFeedback !== undefined ? clientFeedback : undefined,
          nextAction: nextAction !== undefined ? nextAction : undefined,
        },
        include: { candidateJob: true },
      });

      // Map submission status to candidateJob stage
      if (status === 'Shortlisted') {
        await prisma.candidateJob.update({
          where: { id: submission.candidateJobId },
          data: { currentStage: 'ClientReview' },
        });
      } else if (status === 'InterviewRequested') {
        await prisma.candidateJob.update({
          where: { id: submission.candidateJobId },
          data: { currentStage: 'InterviewScheduled' },
        });
      } else if (status === 'Rejected') {
        await prisma.candidateJob.update({
          where: { id: submission.candidateJobId },
          data: { currentStage: 'Rejected' },
        });
      }

      return res.json({ success: true, message: 'Submission updated', data: submission });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
