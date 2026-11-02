import { Request, Response } from 'express';
import prisma from '../prisma';

export class JobController {
  public static async getJobs(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { status, clientAccountId, assignedRecruiterId, workMode, employmentType, search } = req.query;

      const where: any = { organizationId: orgId };
      if (status) where.status = String(status);
      if (clientAccountId) where.accountId = String(clientAccountId);
      if (assignedRecruiterId) where.assignedRecruiterId = String(assignedRecruiterId);
      if (workMode) where.workMode = String(workMode);
      if (employmentType) where.employmentType = String(employmentType);
      if (search) {
        where.OR = [
          { title: { contains: String(search) } },
          { jobCode: { contains: String(search) } },
          { requiredSkills: { contains: String(search) } },
        ];
      }

      const jobs = await prisma.jobRequisition.findMany({
        where,
        include: {
          account: { select: { id: true, name: true, industry: true } },
          contact: { select: { id: true, firstName: true, lastName: true, email: true } },
          assignedRecruiter: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: {
            select: {
              candidateJobs: true,
              submissions: true,
              interviews: true,
              placements: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ success: true, data: jobs });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createJob(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const {
        accountId, contactId, title, description, requiredSkills, experienceMin, experienceMax,
        city, state, workMode, employmentType, openings, payRateMin, payRateMax,
        billRateMin, billRateMax, priority, assignedRecruiterId, startDate, duration
      } = req.body;

      if (!accountId || !title || !description || !requiredSkills) {
        return res.status(400).json({
          success: false,
          message: 'Account, Job Title, Description, and Required Skills are required',
        });
      }

      // Generate unique jobCode
      const count = await prisma.jobRequisition.count({ where: { organizationId: orgId } });
      const jobCode = `REQ-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

      const job = await prisma.jobRequisition.create({
        data: {
          organizationId: orgId,
          jobCode,
          accountId,
          contactId: contactId || null,
          title,
          description,
          requiredSkills,
          experienceMin: experienceMin ? parseFloat(experienceMin) : 0,
          experienceMax: experienceMax ? parseFloat(experienceMax) : null,
          city: city || 'New York',
          state: state || 'NY',
          workMode: workMode || 'Remote',
          employmentType: employmentType || 'Contract',
          openings: openings ? parseInt(openings) : 1,
          payRateMin: payRateMin ? parseFloat(payRateMin) : null,
          payRateMax: payRateMax ? parseFloat(payRateMax) : null,
          billRateMin: billRateMin ? parseFloat(billRateMin) : null,
          billRateMax: billRateMax ? parseFloat(billRateMax) : null,
          priority: priority || 'Medium',
          status: 'Open',
          approvalStatus: 'Approved',
          startDate: startDate ? new Date(startDate) : null,
          duration: duration || '6 Months',
          createdById: req.user!.id,
          assignedRecruiterId: assignedRecruiterId || req.user!.id,
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          organizationId: orgId,
          activityType: 'JobCreated',
          relatedEntityType: 'Job',
          relatedEntityId: job.id,
          subject: `Created Job Requisition ${job.jobCode}: ${job.title}`,
          performedById: req.user!.id,
        },
      });

      return res.status(201).json({ success: true, message: 'Job created successfully', data: job });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getJobById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const job = await prisma.jobRequisition.findFirst({
        where: { id, organizationId: req.user!.organizationId },
        include: {
          account: true,
          contact: true,
          assignedRecruiter: true,
          candidateJobs: {
            include: {
              candidate: true,
              submissions: {
                include: {
                  interviews: true,
                  placements: true,
                },
              },
            },
            orderBy: { updatedAt: 'desc' },
          },
          submissions: {
            include: {
              candidate: true,
              recruiter: true,
            },
          },
          interviews: {
            include: {
              candidate: true,
            },
          },
          placements: {
            include: {
              candidate: true,
            },
          },
        },
      });

      if (!job) return res.status(404).json({ success: false, message: 'Job requisition not found' });
      return res.json({ success: true, data: job });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateJob(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const job = await prisma.jobRequisition.update({
        where: { id },
        data: req.body,
      });

      return res.json({ success: true, message: 'Job updated', data: job });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async approveJob(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const job = await prisma.jobRequisition.update({
        where: { id },
        data: {
          approvalStatus: 'Approved',
          status: 'Open',
        },
      });

      return res.json({ success: true, message: 'Job approved and opened for recruitment', data: job });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getCandidateMatches(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const orgId = req.user!.organizationId;

      const job = await prisma.jobRequisition.findFirst({
        where: { id, organizationId: orgId },
      });
      if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

      const requiredSkills = job.requiredSkills
        .split(/[,;|]/)
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);

      const allCandidates = await prisma.candidate.findMany({
        where: { organizationId: orgId, status: 'Active' },
      });

      const scored = allCandidates.map(c => {
        const candidateSkills = (c.skills || '')
          .split(/[,;|]/)
          .map(s => s.trim().toLowerCase())
          .filter(Boolean);

        let matchCount = 0;
        for (const reqSkill of requiredSkills) {
          if (candidateSkills.some(cs => cs.includes(reqSkill) || reqSkill.includes(cs))) {
            matchCount++;
          }
        }

        const matchScore = requiredSkills.length > 0 
          ? Math.round((matchCount / requiredSkills.length) * 100)
          : 60;

        return {
          ...c,
          matchScore,
          matchedSkillsCount: matchCount,
          totalRequiredSkills: requiredSkills.length,
        };
      });

      scored.sort((a, b) => b.matchScore - a.matchScore);

      return res.json({ success: true, data: scored.slice(0, 20) });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
