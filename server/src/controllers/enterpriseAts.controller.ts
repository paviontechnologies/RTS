import { Request, Response } from 'express';
import prisma from '../prisma';

export class EnterpriseAtsController {
  // =========================================================================
  // 1. TALENT POOLS & SOURCING
  // =========================================================================
  public static async getTalentPools(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { category, search } = req.query;

      const where: any = { organizationId: orgId };
      if (category) where.category = String(category);
      if (search) {
        where.OR = [
          { name: { contains: String(search) } },
          { description: { contains: String(search) } },
          { targetSkills: { contains: String(search) } },
        ];
      }

      const pools = await prisma.talentPool.findMany({
        where,
        include: {
          _count: { select: { members: true } },
          members: {
            take: 5,
            include: {
              candidate: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  currentTitle: true,
                  skills: true,
                  availability: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ success: true, data: pools });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createTalentPool(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { name, description, category, tags, targetSkills } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, message: 'Pool name is required' });
      }

      const pool = await prisma.talentPool.create({
        data: {
          organizationId: orgId,
          name,
          description,
          category: category || 'General',
          tags: typeof tags === 'string' ? tags : JSON.stringify(tags || []),
          targetSkills: targetSkills || '',
          status: 'Active',
        },
      });

      return res.status(201).json({ success: true, data: pool });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getTalentPoolById(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const id = String(req.params.id);

      const pool = await prisma.talentPool.findFirst({
        where: { id, organizationId: orgId },
        include: {
          members: {
            include: {
              candidate: {
                select: {
                  id: true,
                  candidateCode: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  currentTitle: true,
                  skills: true,
                  totalExperience: true,
                  expectedPayRate: true,
                  availability: true,
                  source: true,
                  status: true,
                },
              },
            },
            orderBy: { addedAt: 'desc' },
          },
        },
      });

      if (!pool) {
        return res.status(404).json({ success: false, message: 'Talent pool not found' });
      }

      return res.json({ success: true, data: pool });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async addMemberToPool(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const { candidateId, notes } = req.body;

      if (!candidateId) {
        return res.status(400).json({ success: false, message: 'candidateId is required' });
      }

      const member = await prisma.talentPoolMember.upsert({
        where: {
          talentPoolId_candidateId: {
            talentPoolId: id,
            candidateId: String(candidateId),
          },
        },
        update: { notes, status: 'Active' },
        create: {
          talentPoolId: id,
          candidateId: String(candidateId),
          notes,
          addedById: req.user!.id,
          status: 'Active',
        },
      });

      return res.status(201).json({ success: true, data: member });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async removeMemberFromPool(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const candidateId = String(req.params.candidateId);

      await prisma.talentPoolMember.deleteMany({
        where: { talentPoolId: id, candidateId },
      });

      return res.json({ success: true, message: 'Candidate removed from talent pool' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async matchJobsForPool(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const id = String(req.params.id);

      const pool = await prisma.talentPool.findFirst({
        where: { id, organizationId: orgId },
      });

      if (!pool) {
        return res.status(404).json({ success: false, message: 'Talent pool not found' });
      }

      const targetSkills = (pool.targetSkills || pool.name)
        .toLowerCase()
        .split(/[,\s]+/)
        .filter((s: string) => s.length > 2);

      const openJobs = await prisma.jobRequisition.findMany({
        where: { organizationId: orgId, status: 'Open' },
        include: {
          account: { select: { id: true, name: true } },
        },
      });

      const matchedJobs = openJobs.map((j) => {
        const jobText = `${j.title} ${j.requiredSkills} ${j.description}`.toLowerCase();
        let matchCount = 0;
        targetSkills.forEach((skill) => {
          if (jobText.includes(skill)) matchCount++;
        });
        const score = targetSkills.length > 0 ? Math.round((matchCount / targetSkills.length) * 100) : 50;
        return {
          ...j,
          matchScore: Math.min(98, Math.max(40, score + 25)),
        };
      }).sort((a, b) => b.matchScore - a.matchScore);

      return res.json({ success: true, data: matchedJobs });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // =========================================================================
  // 2. CANDIDATE SCREENING & KILLER QUESTIONS
  // =========================================================================
  public static async getScreenings(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { candidateId, jobId, status } = req.query;

      const where: any = { organizationId: orgId };
      if (candidateId) where.candidateId = String(candidateId);
      if (jobId) where.jobId = String(jobId);
      if (status) where.status = String(status);

      const assessments = await prisma.screeningAssessment.findMany({
        where,
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              currentTitle: true,
              skills: true,
            },
          },
          job: {
            select: {
              id: true,
              jobCode: true,
              title: true,
              account: { select: { name: true } },
            },
          },
        },
        orderBy: { conductedAt: 'desc' },
      });

      return res.json({ success: true, data: assessments });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createScreening(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const {
        candidateId,
        jobId,
        title,
        status,
        overallScore,
        recommendation,
        workAuthVerified,
        availabilityConfirmed,
        rateConfirmed,
        notes,
        questionsJson,
      } = req.body;

      if (!candidateId) {
        return res.status(400).json({ success: false, message: 'candidateId is required' });
      }

      const assessment = await prisma.screeningAssessment.create({
        data: {
          organizationId: orgId,
          candidateId,
          jobId: jobId || null,
          recruiterId: req.user!.id,
          title: title || 'Recruiter Initial Screening',
          status: status || 'Completed',
          overallScore: overallScore ? Number(overallScore) : 85,
          recommendation: recommendation || 'Proceed',
          workAuthVerified: workAuthVerified !== undefined ? Boolean(workAuthVerified) : true,
          availabilityConfirmed: availabilityConfirmed || 'Immediate',
          rateConfirmed: rateConfirmed ? Number(rateConfirmed) : null,
          notes: notes || '',
          questionsJson: typeof questionsJson === 'string' ? questionsJson : JSON.stringify(questionsJson || []),
        },
        include: {
          candidate: true,
          job: true,
        },
      });

      return res.status(201).json({ success: true, data: assessment });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateScreening(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const id = String(req.params.id);
      const { status, recommendation, notes, overallScore } = req.body;

      await prisma.screeningAssessment.updateMany({
        where: { id, organizationId: orgId },
        data: {
          ...(status && { status }),
          ...(recommendation && { recommendation }),
          ...(notes !== undefined && { notes }),
          ...(overallScore && { overallScore: Number(overallScore) }),
        },
      });

      return res.json({ success: true, message: 'Assessment updated' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // =========================================================================
  // 3. INTERVIEW KITS & STRUCTURED SCORECARDS
  // =========================================================================
  public static async getInterviewKits(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const kits = await prisma.interviewKit.findMany({
        where: { organizationId: orgId },
        include: {
          _count: { select: { scorecards: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ success: true, data: kits });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createInterviewKit(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { title, jobRole, roundType, competencies, questionsJson } = req.body;

      if (!title || !jobRole) {
        return res.status(400).json({ success: false, message: 'Title and Job Role are required' });
      }

      const kit = await prisma.interviewKit.create({
        data: {
          organizationId: orgId,
          title,
          jobRole,
          roundType: roundType || 'Technical',
          competencies: typeof competencies === 'string' ? competencies : JSON.stringify(competencies || []),
          questionsJson: typeof questionsJson === 'string' ? questionsJson : JSON.stringify(questionsJson || []),
          status: 'Active',
        },
      });

      return res.status(201).json({ success: true, data: kit });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getScorecards(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { candidateId, interviewId, interviewKitId } = req.query;

      const where: any = { organizationId: orgId };
      if (candidateId) where.candidateId = String(candidateId);
      if (interviewId) where.interviewId = String(interviewId);
      if (interviewKitId) where.interviewKitId = String(interviewKitId);

      const scorecards = await prisma.interviewScorecard.findMany({
        where,
        include: {
          interviewKit: { select: { title: true, roundType: true, jobRole: true } },
        },
        orderBy: { submittedAt: 'desc' },
      });

      return res.json({ success: true, data: scorecards });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async submitScorecard(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const {
        interviewId,
        interviewKitId,
        candidateId,
        interviewerName,
        interviewerEmail,
        overallRating,
        recommendation,
        strengths,
        weaknesses,
        ratingsJson,
        notes,
      } = req.body;

      if (!candidateId || !interviewerName) {
        return res.status(400).json({ success: false, message: 'candidateId and interviewerName are required' });
      }

      const scorecard = await prisma.interviewScorecard.create({
        data: {
          organizationId: orgId,
          interviewId: interviewId || null,
          interviewKitId: interviewKitId || null,
          candidateId,
          interviewerName,
          interviewerEmail: interviewerEmail || '',
          overallRating: overallRating ? Number(overallRating) : 4,
          recommendation: recommendation || 'Hire',
          strengths: strengths || '',
          weaknesses: weaknesses || '',
          ratingsJson: typeof ratingsJson === 'string' ? ratingsJson : JSON.stringify(ratingsJson || {}),
          notes: notes || '',
        },
      });

      return res.status(201).json({ success: true, data: scorecard });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // =========================================================================
  // 4. OFFER MANAGEMENT & SPREAD CALCULATOR
  // =========================================================================
  public static async getOffers(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { status, candidateId, jobId } = req.query;

      const where: any = { organizationId: orgId };
      if (status) where.status = String(status);
      if (candidateId) where.candidateId = String(candidateId);
      if (jobId) where.jobId = String(jobId);

      const offers = await prisma.offer.findMany({
        where,
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              currentTitle: true,
            },
          },
          job: {
            select: {
              id: true,
              jobCode: true,
              title: true,
              account: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ success: true, data: offers });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createOffer(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const {
        candidateId,
        jobId,
        submissionId,
        payRate,
        billRate,
        overtimeRate,
        employmentType,
        startDate,
        endDate,
        benefitsDetails,
        notes,
      } = req.body;

      if (!candidateId || !jobId || !payRate || !billRate || !startDate) {
        return res.status(400).json({
          success: false,
          message: 'candidateId, jobId, payRate, billRate, and startDate are required',
        });
      }

      const pRate = Number(payRate);
      const bRate = Number(billRate);
      const spreadHourly = bRate - pRate;
      const marginPercentage = bRate > 0 ? (spreadHourly / bRate) * 100 : 0;
      const offerCode = `OFF-${Date.now().toString().slice(-5)}`;

      const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
      const job = await prisma.jobRequisition.findUnique({
        where: { id: jobId },
        include: { account: true },
      });

      const offerLetterContent = `
OFFICIAL OFFER OF ENGAGEMENT
Pavion Technologies US Staffing Delivery Center
Date: ${new Date().toLocaleDateString()}

Dear ${candidate?.firstName} ${candidate?.lastName},

We are pleased to offer you the position of ${job?.title} deployed with our esteemed client ${job?.account?.name}.

1. ENGAGEMENT DETAILS:
- Position Title: ${job?.title} (Code: ${job?.jobCode})
- Client Account: ${job?.account?.name}
- Employment Classification: ${employmentType || 'Contract - W2'}
- Start Date: ${new Date(startDate).toLocaleDateString()}
- Hourly Compensation: $${pRate.toFixed(2)} USD per hour
- Client Bill Rate Reference: $${bRate.toFixed(2)} USD / hr
- Gross Spread: $${spreadHourly.toFixed(2)} / hr (${marginPercentage.toFixed(1)}% margin)
- Standard Work Schedule: 40 hours per week (Overtime: $${(overtimeRate || pRate * 1.5).toFixed(2)} / hr)

2. COMPLIANCE & ACCEPTANCE:
Please sign and return this offer to initiate your background verification (BGV) and onboarding clearance checklist.

Warm Regards,
Pavion Technologies Delivery & Talent Operations Team
      `.trim();

      const offer = await prisma.offer.create({
        data: {
          organizationId: orgId,
          candidateId,
          jobId,
          submissionId: submissionId || null,
          offerCode,
          payRate: pRate,
          billRate: bRate,
          overtimeRate: overtimeRate ? Number(overtimeRate) : pRate * 1.5,
          marginPercentage: Number(marginPercentage.toFixed(2)),
          spreadHourly: Number(spreadHourly.toFixed(2)),
          employmentType: employmentType || 'Contract - W2',
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          benefitsDetails: benefitsDetails || 'Standard health benefits option and payroll processing.',
          status: 'Draft',
          approvalLevel: 'Approved',
          approvedById: req.user!.id,
          offerLetterContent,
          notes: notes || '',
        },
        include: { candidate: true, job: true },
      });

      return res.status(201).json({ success: true, data: offer });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateOfferStatus(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const id = String(req.params.id);
      const { status, notes } = req.body;

      const offer = await prisma.offer.findFirst({
        where: { id, organizationId: orgId },
      });

      if (!offer) {
        return res.status(404).json({ success: false, message: 'Offer not found' });
      }

      const updateData: any = { status };
      if (notes) updateData.notes = notes;
      if (status === 'Sent') updateData.sentAt = new Date();
      if (status === 'Accepted') updateData.acceptedAt = new Date();

      const updated = await prisma.offer.update({
        where: { id },
        data: updateData,
        include: { candidate: true, job: true },
      });

      // Auto-create placement and pre-fill onboarding tasks when offer is accepted
      if (status === 'Accepted' && offer.jobId && offer.candidateId) {
        const job = await prisma.jobRequisition.findUnique({ where: { id: offer.jobId } });
        if (job) {
          const placement = await prisma.placement.create({
            data: {
              organizationId: orgId,
              submissionId: offer.submissionId || 'direct-offer',
              candidateId: offer.candidateId,
              jobId: offer.jobId,
              clientAccountId: job.accountId,
              startDate: offer.startDate,
              endDate: offer.endDate,
              employmentType: offer.employmentType,
              payRate: offer.payRate,
              billRate: offer.billRate,
              grossMargin: offer.spreadHourly || (offer.billRate - offer.payRate),
              status: 'Active',
              notes: `Converted automatically from accepted offer ${offer.offerCode}.`,
            },
          });

          // Generate default onboarding checklist tasks for this placement
          const defaultTasks = [
            { category: 'Document', title: 'W-4 Federal Tax Form', description: 'Signed and dated federal withholding form' },
            { category: 'I9_EVerify', title: 'I-9 Employment Eligibility Verification', description: 'Form I-9 Section 1 & 2 with government photo ID' },
            { category: 'Document', title: 'Direct Deposit Authorization & Void Check', description: 'Bank routing and account confirmation for payroll' },
            { category: 'BGV', title: '7-Year Criminal Background Verification', description: 'Clearance from background verification agency' },
            { category: 'DrugTest', title: '10-Panel Drug Screen', description: 'Laboratory drug test result clearance' },
            { category: 'Equipment', title: 'Client Laptop & Security Badge Provisioning', description: 'Hardware deployment and VPN credentials' },
          ];

          for (const t of defaultTasks) {
            await prisma.onboardingTask.create({
              data: {
                organizationId: orgId,
                placementId: placement.id,
                candidateId: offer.candidateId,
                category: t.category,
                title: t.title,
                description: t.description,
                status: 'Pending',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              },
            });
          }
        }
      }

      return res.json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // =========================================================================
  // 5. CANDIDATE ONBOARDING & DOCUMENT VERIFICATION
  // =========================================================================
  public static async getOnboardingTasks(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { candidateId, placementId, category, status } = req.query;

      const where: any = { organizationId: orgId };
      if (candidateId) where.candidateId = String(candidateId);
      if (placementId) where.placementId = String(placementId);
      if (category) where.category = String(category);
      if (status) where.status = String(status);

      const tasks = await prisma.onboardingTask.findMany({
        where,
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              currentTitle: true,
            },
          },
          placement: {
            select: {
              id: true,
              startDate: true,
              billRate: true,
              clientAccount: { select: { name: true } },
              job: { select: { title: true, jobCode: true } },
            },
          },
        },
        orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
      });

      return res.json({ success: true, data: tasks });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createOnboardingTask(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { candidateId, placementId, category, title, description, dueDate, documentUrl } = req.body;

      if (!candidateId || !title) {
        return res.status(400).json({ success: false, message: 'candidateId and title are required' });
      }

      const task = await prisma.onboardingTask.create({
        data: {
          organizationId: orgId,
          candidateId,
          placementId: placementId || null,
          category: category || 'Document',
          title,
          description: description || '',
          status: 'Pending',
          documentUrl: documentUrl || null,
          dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        },
      });

      return res.status(201).json({ success: true, data: task });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async verifyOnboardingTask(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const id = String(req.params.id);
      const { status, verificationNotes, documentUrl } = req.body;

      const task = await prisma.onboardingTask.findFirst({
        where: { id, organizationId: orgId },
      });

      if (!task) {
        return res.status(404).json({ success: false, message: 'Onboarding task not found' });
      }

      const updated = await prisma.onboardingTask.update({
        where: { id },
        data: {
          status: status || 'Verified',
          verificationNotes: verificationNotes || 'Verified by compliance team.',
          documentUrl: documentUrl !== undefined ? documentUrl : task.documentUrl,
          verifiedAt: status === 'Verified' ? new Date() : null,
        },
      });

      return res.json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // =========================================================================
  // 6. CREDENTIAL & COMPLIANCE MANAGEMENT
  // =========================================================================
  public static async getCredentials(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { candidateId, credentialType, status } = req.query;

      const where: any = { organizationId: orgId };
      if (candidateId) where.candidateId = String(candidateId);
      if (credentialType) where.credentialType = String(credentialType);
      if (status) where.verificationStatus = String(status);

      const credentials = await prisma.candidateCredential.findMany({
        where,
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              currentTitle: true,
            },
          },
        },
        orderBy: { expiryDate: 'asc' },
      });

      return res.json({ success: true, data: credentials });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createCredential(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const {
        candidateId,
        credentialType,
        name,
        issuingAuthority,
        credentialIdNumber,
        state,
        issueDate,
        expiryDate,
        verificationStatus,
        documentUrl,
        notes,
      } = req.body;

      if (!candidateId || !name) {
        return res.status(400).json({ success: false, message: 'candidateId and name are required' });
      }

      const credential = await prisma.candidateCredential.create({
        data: {
          organizationId: orgId,
          candidateId,
          credentialType: credentialType || 'Certification',
          name,
          issuingAuthority: issuingAuthority || '',
          credentialIdNumber: credentialIdNumber || '',
          state: state || '',
          issueDate: issueDate ? new Date(issueDate) : null,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          verificationStatus: verificationStatus || 'Verified',
          documentUrl: documentUrl || null,
          notes: notes || '',
        },
        include: { candidate: true },
      });

      return res.status(201).json({ success: true, data: credential });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async verifyCredential(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const id = String(req.params.id);
      const { verificationStatus, notes } = req.body;

      await prisma.candidateCredential.updateMany({
        where: { id, organizationId: orgId },
        data: {
          verificationStatus: verificationStatus || 'Verified',
          ...(notes && { notes }),
        },
      });

      return res.json({ success: true, message: 'Credential verified' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getComplianceAlerts(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const now = new Date();
      const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const sixtyDays = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

      const all = await prisma.candidateCredential.findMany({
        where: {
          organizationId: orgId,
          expiryDate: { not: null },
        },
        include: {
          candidate: {
            select: { id: true, firstName: true, lastName: true, email: true, currentTitle: true },
          },
        },
        orderBy: { expiryDate: 'asc' },
      });

      const expired = all.filter((c) => c.expiryDate && new Date(c.expiryDate) < now);
      const expiring30 = all.filter(
        (c) => c.expiryDate && new Date(c.expiryDate) >= now && new Date(c.expiryDate) <= thirtyDays
      );
      const expiring60 = all.filter(
        (c) => c.expiryDate && new Date(c.expiryDate) > thirtyDays && new Date(c.expiryDate) <= sixtyDays
      );

      return res.json({
        success: true,
        data: {
          expired,
          expiring30,
          expiring60,
          totalAlerts: expired.length + expiring30.length,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // =========================================================================
  // 7. CANDIDATE COMMUNICATION & ENGAGEMENT
  // =========================================================================
  public static async getCommunicationLogs(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { candidateId, channel } = req.query;

      const where: any = { organizationId: orgId };
      if (candidateId) where.candidateId = String(candidateId);
      if (channel) where.channel = String(channel);

      const logs = await prisma.communicationLog.findMany({
        where,
        include: {
          candidate: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
        },
        orderBy: { occurredAt: 'desc' },
      });

      return res.json({ success: true, data: logs });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async sendCommunication(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { candidateId, channel, subject, body, templateName } = req.body;

      if (!candidateId || !body) {
        return res.status(400).json({ success: false, message: 'candidateId and body are required' });
      }

      const log = await prisma.communicationLog.create({
        data: {
          organizationId: orgId,
          candidateId,
          channel: channel || 'Email',
          direction: 'Outbound',
          subject: subject || `${channel || 'Email'} Message`,
          body,
          templateName: templateName || null,
          status: 'Delivered',
          sentBy: `${req.user!.firstName} ${req.user!.lastName}`,
          occurredAt: new Date(),
        },
      });

      return res.status(201).json({ success: true, data: log });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getMessageTemplates(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const templates = await prisma.messageTemplate.findMany({
        where: { organizationId: orgId },
        orderBy: { category: 'asc' },
      });

      return res.json({ success: true, data: templates });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createMessageTemplate(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { name, category, channel, subject, body, variablesJson } = req.body;

      if (!name || !body) {
        return res.status(400).json({ success: false, message: 'Name and Body are required' });
      }

      const template = await prisma.messageTemplate.create({
        data: {
          organizationId: orgId,
          name,
          category: category || 'Interview',
          channel: channel || 'Email',
          subject: subject || '',
          body,
          variablesJson: typeof variablesJson === 'string' ? variablesJson : JSON.stringify(variablesJson || []),
        },
      });

      return res.status(201).json({ success: true, data: template });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // =========================================================================
  // 8. CONSULTANT REDEPLOYMENT & BENCH MANAGEMENT
  // =========================================================================
  public static async getRedeploymentForecast(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const now = new Date();
      const in15Days = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

      const activePlacements = await prisma.placement.findMany({
        where: {
          organizationId: orgId,
          status: 'Active',
        },
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              currentTitle: true,
              skills: true,
              expectedPayRate: true,
              workAuthorization: true,
            },
          },
          clientAccount: { select: { id: true, name: true } },
          job: { select: { id: true, title: true, jobCode: true } },
        },
        orderBy: { endDate: 'asc' },
      });

      const rollOff15 = activePlacements.filter(
        (p) => p.endDate && new Date(p.endDate) >= now && new Date(p.endDate) <= in15Days
      );
      const rollOff30 = activePlacements.filter(
        (p) => p.endDate && new Date(p.endDate) > in15Days && new Date(p.endDate) <= in30Days
      );
      const rollOff60 = activePlacements.filter(
        (p) => p.endDate && new Date(p.endDate) > in30Days && new Date(p.endDate) <= in60Days
      );

      const placedCandidateIds = activePlacements.map((p) => p.candidateId);
      const benchCandidates = await prisma.candidate.findMany({
        where: {
          organizationId: orgId,
          status: 'Active',
          id: { notIn: placedCandidateIds },
        },
        take: 20,
        orderBy: { updatedAt: 'desc' },
      });

      return res.json({
        success: true,
        data: {
          totalActivePlacements: activePlacements.length,
          rollOff15,
          rollOff30,
          rollOff60,
          benchCandidates,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async extendContract(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { placementId, newEndDate, newBillRate, newPayRate, extensionNotes } = req.body;

      if (!placementId || !newEndDate) {
        return res.status(400).json({ success: false, message: 'placementId and newEndDate are required' });
      }

      const updateData: any = {
        endDate: new Date(newEndDate),
      };
      if (newBillRate) updateData.billRate = Number(newBillRate);
      if (newPayRate) updateData.payRate = Number(newPayRate);
      if (extensionNotes) {
        updateData.notes = `Contract extended to ${new Date(newEndDate).toLocaleDateString()}. ${extensionNotes}`;
      }

      await prisma.placement.updateMany({
        where: { id: placementId, organizationId: orgId },
        data: updateData,
      });

      return res.json({ success: true, message: 'Contract extension recorded successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // =========================================================================
  // 9. VENDOR & MSP / VMS MANAGEMENT
  // =========================================================================
  public static async getVendors(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { vendorType, tier, status } = req.query;

      const where: any = { organizationId: orgId };
      if (vendorType) where.vendorType = String(vendorType);
      if (tier) where.tier = String(tier);
      if (status) where.status = String(status);

      const vendors = await prisma.vendor.findMany({
        where,
        include: {
          contacts: true,
          _count: { select: { submissions: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ success: true, data: vendors });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createVendor(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const {
        name,
        vendorType,
        tier,
        contactPerson,
        email,
        phone,
        website,
        taxIdEin,
        msaStatus,
        paymentTerms,
        notes,
      } = req.body;

      if (!name || !email) {
        return res.status(400).json({ success: false, message: 'Vendor name and email are required' });
      }

      const vendor = await prisma.vendor.create({
        data: {
          organizationId: orgId,
          name,
          vendorType: vendorType || 'C2C_Subcontractor',
          tier: tier || 'Tier1',
          contactPerson: contactPerson || '',
          email,
          phone: phone || '',
          website: website || '',
          taxIdEin: taxIdEin || '',
          msaStatus: msaStatus || 'Active',
          paymentTerms: paymentTerms || 'Net 45',
          status: 'Active',
          notes: notes || '',
        },
      });

      return res.status(201).json({ success: true, data: vendor });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getVendorSubmissions(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { vendorId, jobId, status } = req.query;

      const where: any = { organizationId: orgId };
      if (vendorId) where.vendorId = String(vendorId);
      if (jobId) where.jobId = String(jobId);
      if (status) where.status = String(status);

      const submissions = await prisma.vendorSubmission.findMany({
        where,
        include: {
          vendor: { select: { id: true, name: true, tier: true, email: true } },
          job: {
            select: {
              id: true,
              title: true,
              jobCode: true,
              account: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ success: true, data: submissions });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createVendorSubmission(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const {
        vendorId,
        jobId,
        candidateName,
        candidateEmail,
        candidatePhone,
        submittedRate,
        resumeUrl,
        notes,
      } = req.body;

      if (!vendorId || !jobId || !candidateName || !submittedRate) {
        return res.status(400).json({
          success: false,
          message: 'vendorId, jobId, candidateName, and submittedRate are required',
        });
      }

      const sub = await prisma.vendorSubmission.create({
        data: {
          organizationId: orgId,
          vendorId,
          jobId,
          candidateName,
          candidateEmail: candidateEmail || '',
          candidatePhone: candidatePhone || '',
          submittedRate: Number(submittedRate),
          resumeUrl: resumeUrl || null,
          status: 'Submitted',
          notes: notes || '',
        },
        include: { vendor: true, job: true },
      });

      return res.status(201).json({ success: true, data: sub });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateVendorSubmissionStatus(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const id = String(req.params.id);
      const { status, notes } = req.body;

      await prisma.vendorSubmission.updateMany({
        where: { id, organizationId: orgId },
        data: {
          ...(status && { status }),
          ...(notes !== undefined && { notes }),
        },
      });

      return res.json({ success: true, message: 'Vendor submission updated' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
