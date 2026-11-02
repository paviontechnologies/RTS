import { Request, Response } from 'express';
import prisma from '../prisma';

export class InterviewController {
  public static async getInterviews(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { status, jobId, candidateId, date } = req.query;

      const where: any = { organizationId: orgId };
      if (status) where.status = String(status);
      if (jobId) where.jobId = String(jobId);
      if (candidateId) where.candidateId = String(candidateId);

      const interviews = await prisma.interview.findMany({
        where,
        include: {
          candidate: true,
          job: {
            include: {
              account: { select: { id: true, name: true } },
            },
          },
          submission: {
            include: {
              clientAccount: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { scheduledAt: 'asc' },
      });

      return res.json({ success: true, data: interviews });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async scheduleInterview(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const {
        submissionId, interviewRound, interviewType, interviewerName, interviewerEmail,
        scheduledAt, timezone, meetingUrl
      } = req.body;

      if (!submissionId || !interviewerName || !scheduledAt) {
        return res.status(400).json({
          success: false,
          message: 'submissionId, interviewerName, and scheduledAt are required',
        });
      }

      const submission = await prisma.submission.findFirst({
        where: { id: submissionId, organizationId: orgId },
        include: { candidate: true, job: true },
      });

      if (!submission) {
        return res.status(404).json({ success: false, message: 'Submission not found' });
      }

      const interview = await prisma.interview.create({
        data: {
          organizationId: orgId,
          submissionId,
          candidateId: submission.candidateId,
          jobId: submission.jobId,
          interviewRound: interviewRound || 'Technical',
          interviewType: interviewType || 'Video',
          interviewerName,
          interviewerEmail,
          scheduledAt: new Date(scheduledAt),
          timezone: timezone || 'America/New_York',
          meetingUrl,
          status: 'Scheduled',
        },
        include: {
          candidate: true,
          job: true,
        },
      });

      // Update candidateJob stage
      await prisma.candidateJob.update({
        where: { id: submission.candidateJobId },
        data: { currentStage: 'InterviewScheduled' },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          organizationId: orgId,
          activityType: 'InterviewScheduled',
          relatedEntityType: 'Interview',
          relatedEntityId: interview.id,
          subject: `Scheduled ${interview.interviewRound} interview for ${submission.candidate.firstName} with ${interviewerName} on ${new Date(scheduledAt).toLocaleString()}`,
          performedById: req.user!.id,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Interview scheduled successfully',
        data: interview,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async recordFeedback(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const orgId = req.user!.organizationId;
      const { technicalRating, communicationRating, overallRating, recommendation, feedbackNotes, outcome } = req.body;

      const interview = await prisma.interview.findFirst({
        where: { id, organizationId: orgId },
        include: { submission: true },
      });

      if (!interview) {
        return res.status(404).json({ success: false, message: 'Interview not found' });
      }

      const updated = await prisma.interview.update({
        where: { id },
        data: {
          status: 'Completed',
          technicalRating: technicalRating ? parseInt(technicalRating) : undefined,
          communicationRating: communicationRating ? parseInt(communicationRating) : undefined,
          overallRating: overallRating ? parseInt(overallRating) : undefined,
          recommendation,
          feedbackNotes,
          outcome: outcome || 'Passed',
        },
        include: { candidate: true, job: true },
      });

      // Update stage if selected
      if (outcome === 'Selected' || recommendation === 'StrongHire') {
        await prisma.candidateJob.update({
          where: { id: interview.submission.candidateJobId },
          data: { currentStage: 'Selected' },
        });
      } else {
        await prisma.candidateJob.update({
          where: { id: interview.submission.candidateJobId },
          data: { currentStage: 'InterviewCompleted' },
        });
      }

      return res.json({
        success: true,
        message: 'Interview feedback recorded successfully',
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
