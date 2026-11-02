import { Request, Response } from 'express';
import prisma from '../prisma';

export class PlacementController {
  public static async getPlacements(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { status, clientAccountId, recruiterId } = req.query;

      const where: any = { organizationId: orgId };
      if (status) where.status = String(status);
      if (clientAccountId) where.clientAccountId = String(clientAccountId);
      if (recruiterId) where.recruiterId = String(recruiterId);

      const placements = await prisma.placement.findMany({
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
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ success: true, data: placements });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createPlacement(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { submissionId, startDate, endDate, employmentType, payRate, billRate, notes } = req.body;

      if (!submissionId || !startDate || payRate === undefined || billRate === undefined) {
        return res.status(400).json({
          success: false,
          message: 'submissionId, startDate, payRate, and billRate are required',
        });
      }

      const submission = await prisma.submission.findFirst({
        where: { id: submissionId, organizationId: orgId },
        include: { candidate: true, job: true, clientAccount: true },
      });

      if (!submission) {
        return res.status(404).json({ success: false, message: 'Submission not found' });
      }

      const pRate = parseFloat(payRate);
      const bRate = parseFloat(billRate);
      const grossMargin = bRate - pRate;

      const placement = await prisma.placement.create({
        data: {
          organizationId: orgId,
          submissionId,
          candidateId: submission.candidateId,
          jobId: submission.jobId,
          clientAccountId: submission.clientAccountId,
          recruiterId: submission.recruiterId || req.user!.id,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          employmentType: employmentType || 'Contract',
          payRate: pRate,
          billRate: bRate,
          grossMargin,
          status: 'Active',
          notes,
        },
        include: {
          candidate: true,
          job: true,
          clientAccount: true,
        },
      });

      // Update candidateJob stage to HiredPlaced
      await prisma.candidateJob.update({
        where: { id: submission.candidateJobId },
        data: { currentStage: 'HiredPlaced' },
      });

      // Increment filledPositions on Job
      await prisma.jobRequisition.update({
        where: { id: submission.jobId },
        data: {
          filledPositions: { increment: 1 },
        },
      });

      // Update candidate status to Placed
      await prisma.candidate.update({
        where: { id: submission.candidateId },
        data: { status: 'Placed' },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          organizationId: orgId,
          activityType: 'PlacementCreated',
          relatedEntityType: 'Placement',
          relatedEntityId: placement.id,
          subject: `Created Placement for ${submission.candidate.firstName} ${submission.candidate.lastName} at ${submission.clientAccount.name} (Gross Margin: $${grossMargin.toFixed(2)}/hr)`,
          performedById: req.user!.id,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Placement created successfully',
        data: placement,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updatePlacement(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const placement = await prisma.placement.update({
        where: { id },
        data: req.body,
      });

      return res.json({ success: true, message: 'Placement updated', data: placement });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
