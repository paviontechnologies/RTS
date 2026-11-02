import { Request, Response } from 'express';
import prisma from '../prisma';
import { ResumeParserService } from '../services/resumeParser.service';

export class CandidateController {
  public static async getCandidates(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { status, skill, minExp, maxExp, recruiterId, search } = req.query;

      const where: any = { organizationId: orgId };
      if (status) where.status = String(status);
      if (recruiterId) where.assignedRecruiterId = String(recruiterId);
      if (skill) where.skills = { contains: String(skill) };
      if (minExp) where.totalExperience = { gte: parseFloat(String(minExp)) };
      if (maxExp) {
        where.totalExperience = {
          ...(where.totalExperience || {}),
          lte: parseFloat(String(maxExp)),
        };
      }
      if (search) {
        where.OR = [
          { firstName: { contains: String(search) } },
          { lastName: { contains: String(search) } },
          { email: { contains: String(search) } },
          { currentTitle: { contains: String(search) } },
          { skills: { contains: String(search) } },
        ];
      }

      const candidates = await prisma.candidate.findMany({
        where,
        include: {
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

      return res.json({ success: true, data: candidates });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async checkDuplicate(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { email, phone, firstName, lastName } = req.query;

      const duplicates: any[] = [];

      if (email) {
        const emailMatch = await prisma.candidate.findFirst({
          where: { organizationId: orgId, email: String(email).toLowerCase().trim() },
        });
        if (emailMatch) duplicates.push({ matchType: 'Email', candidate: emailMatch });
      }

      if (phone) {
        const cleanPhone = String(phone).replace(/\D/g, '');
        if (cleanPhone.length >= 7) {
          const phoneMatch = await prisma.candidate.findFirst({
            where: {
              organizationId: orgId,
              phone: { contains: cleanPhone },
            },
          });
          if (phoneMatch && !duplicates.some(d => d.candidate.id === phoneMatch.id)) {
            duplicates.push({ matchType: 'Phone', candidate: phoneMatch });
          }
        }
      }

      if (firstName && lastName) {
        const nameMatch = await prisma.candidate.findFirst({
          where: {
            organizationId: orgId,
            firstName: { equals: String(firstName) },
            lastName: { equals: String(lastName) },
          },
        });
        if (nameMatch && !duplicates.some(d => d.candidate.id === nameMatch.id)) {
          duplicates.push({ matchType: 'Full Name', candidate: nameMatch });
        }
      }

      return res.json({
        success: true,
        hasDuplicate: duplicates.length > 0,
        matches: duplicates,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async uploadResume(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ success: false, message: 'No resume file uploaded' });
      }

      const parsedData = await ResumeParserService.parseFile(file.path, file.originalname);

      return res.json({
        success: true,
        message: 'Resume parsed successfully for recruiter verification',
        data: {
          ...parsedData,
          uploadedFileName: file.originalname,
          filePath: `/uploads/${file.filename}`,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createCandidate(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const {
        firstName, lastName, email, phone, city, state, linkedInUrl,
        currentTitle, currentEmployer, totalExperience, relevantExperience,
        skills, professionalSummary, education, certifications, availability,
        expectedPayRate, preferredType, workAuthorization, resumeUrl,
        resumeOriginalName, source, assignedRecruiterId
      } = req.body;

      if (!firstName || !lastName || !email) {
        return res.status(400).json({ success: false, message: 'First name, last name, and email are required' });
      }

      // Check duplicate email
      const existing = await prisma.candidate.findFirst({
        where: { organizationId: orgId, email: email.toLowerCase().trim() },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Candidate already exists with email ${email} (${existing.firstName} ${existing.lastName})`,
          duplicateCandidateId: existing.id,
        });
      }

      // Generate candidate code
      const count = await prisma.candidate.count({ where: { organizationId: orgId } });
      const candidateCode = `CAN-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

      const candidate = await prisma.candidate.create({
        data: {
          organizationId: orgId,
          candidateCode,
          firstName,
          lastName,
          email: email.toLowerCase().trim(),
          phone,
          city: city || 'New York',
          state: state || 'NY',
          linkedInUrl,
          currentTitle: currentTitle || 'Software Engineer',
          currentEmployer,
          totalExperience: totalExperience ? parseFloat(totalExperience) : 0,
          relevantExperience: relevantExperience ? parseFloat(relevantExperience) : 0,
          skills: Array.isArray(skills) ? skills.join(', ') : (skills || 'General IT'),
          professionalSummary,
          education,
          certifications,
          availability: availability || 'Immediate',
          expectedPayRate: expectedPayRate ? parseFloat(expectedPayRate) : null,
          preferredType: preferredType || 'Contract',
          workAuthorization: workAuthorization || 'US Citizen',
          resumeUrl,
          resumeOriginalName,
          source: source || 'Direct',
          assignedRecruiterId: assignedRecruiterId || req.user!.id,
          status: 'Active',
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          organizationId: orgId,
          activityType: 'CandidateCreated',
          relatedEntityType: 'Candidate',
          relatedEntityId: candidate.id,
          subject: `Added Candidate ${candidate.candidateCode}: ${candidate.firstName} ${candidate.lastName}`,
          performedById: req.user!.id,
        },
      });

      return res.status(201).json({ success: true, message: 'Candidate added successfully', data: candidate });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getCandidateById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const candidate = await prisma.candidate.findFirst({
        where: { id, organizationId: req.user!.organizationId },
        include: {
          assignedRecruiter: true,
          candidateJobs: {
            include: {
              job: {
                include: {
                  account: true,
                },
              },
            },
          },
          submissions: {
            include: {
              job: true,
              clientAccount: true,
              recruiter: true,
            },
          },
          interviews: {
            include: {
              job: true,
            },
          },
          placements: {
            include: {
              job: true,
              clientAccount: true,
            },
          },
          rtrRecords: true,
        },
      });

      if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });
      return res.json({ success: true, data: candidate });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateCandidate(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const candidate = await prisma.candidate.update({
        where: { id },
        data: req.body,
      });

      return res.json({ success: true, message: 'Candidate updated', data: candidate });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
