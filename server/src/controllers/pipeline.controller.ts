import { Request, Response } from 'express';
import prisma from '../prisma';

export class PipelineController {
  public static async associateCandidateToJob(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const jobId = String(req.params.jobId);
      const { candidateId, notes, stage } = req.body;

      if (!candidateId) {
        return res.status(400).json({ success: false, message: 'Candidate ID is required' });
      }

      // Check if already applied/associated
      const existing = await prisma.candidateJob.findFirst({
        where: {
          organizationId: orgId,
          jobId,
          candidateId,
        },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Candidate is already associated with this job requisition',
          data: existing,
        });
      }

      const candidateJob = await prisma.candidateJob.create({
        data: {
          organizationId: orgId,
          jobId,
          candidateId,
          recruiterId: req.user!.id,
          currentStage: stage || 'New',
          notes,
        },
        include: {
          candidate: true,
          job: { include: { account: true } },
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          organizationId: orgId,
          activityType: 'CandidateJobMapped',
          relatedEntityType: 'Job',
          relatedEntityId: jobId,
          subject: `Mapped candidate ${candidateJob.candidate.firstName} ${candidateJob.candidate.lastName} to Job ${candidateJob.job.jobCode}`,
          performedById: req.user!.id,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Candidate associated to job successfully',
        data: candidateJob,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getCandidateJobs(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { jobId, candidateId, stage } = req.query;

      const where: any = { organizationId: orgId };
      if (jobId) where.jobId = String(jobId);
      if (candidateId) where.candidateId = String(candidateId);
      if (stage) where.currentStage = String(stage);

      const candidateJobs = await prisma.candidateJob.findMany({
        where,
        include: {
          candidate: true,
          job: {
            include: {
              account: { select: { id: true, name: true } },
            },
          },
          submissions: true,
        },
        orderBy: { updatedAt: 'desc' },
      });

      return res.json({ success: true, data: candidateJobs });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateStage(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const { stage, notes } = req.body;
      const orgId = req.user!.organizationId;

      if (!stage) {
        return res.status(400).json({ success: false, message: 'Stage is required' });
      }

      const existing = await prisma.candidateJob.findFirst({
        where: { id, organizationId: orgId },
        include: { candidate: true, job: true },
      });

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Candidate Job relationship not found' });
      }

      const updated = await prisma.candidateJob.update({
        where: { id },
        data: {
          currentStage: stage,
          notes: notes !== undefined ? notes : existing.notes,
        },
        include: { candidate: true, job: true },
      });

      // Record activity
      await prisma.activity.create({
        data: {
          organizationId: orgId,
          activityType: 'StageChange',
          relatedEntityType: 'CandidateJob',
          relatedEntityId: id,
          subject: `Advanced candidate ${existing.candidate.firstName} ${existing.candidate.lastName} on Job ${existing.job.jobCode} from ${existing.currentStage} to ${stage}`,
          description: notes || undefined,
          performedById: req.user!.id,
        },
      });

      return res.json({
        success: true,
        message: `Pipeline stage updated to ${stage}`,
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async recordRTR(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const id = String(req.params.id); // candidateJobId
      const { consentMethod, terms, expiresAt, documentUrl, notes } = req.body;

      const candidateJob = await prisma.candidateJob.findFirst({
        where: { id, organizationId: orgId },
        include: { job: true },
      });

      if (!candidateJob) {
        return res.status(404).json({ success: false, message: 'Candidate Job record not found' });
      }

      const rtr = await prisma.rTRRecord.create({
        data: {
          organizationId: orgId,
          candidateId: candidateJob.candidateId,
          jobId: candidateJob.jobId,
          clientAccountId: candidateJob.job.accountId,
          consentStatus: 'Granted',
          consentMethod: consentMethod || 'Email',
          submissionTerms: terms || 'Exclusive Right to Represent for this requisition',
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          documentUrl,
          notes,
        },
      });

      // Advance pipeline stage to RTRReceived
      await prisma.candidateJob.update({
        where: { id },
        data: { currentStage: 'RTRReceived' },
      });

      // Activity log
      await prisma.activity.create({
        data: {
          organizationId: orgId,
          activityType: 'RTRRecorded',
          relatedEntityType: 'RTR',
          relatedEntityId: rtr.id,
          subject: `Recorded candidate Right to Represent (RTR) consent via ${rtr.consentMethod}`,
          performedById: req.user!.id,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Right to Represent (RTR) recorded and stage advanced to RTRReceived',
        data: rtr,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
