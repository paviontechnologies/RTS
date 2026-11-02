import { Request, Response } from 'express';
import prisma from '../prisma';

export class CrmController {
  // ================= LEADS =================
  public static async getLeads(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { status, source, assignedUserId, search } = req.query;

      const where: any = { organizationId: orgId };
      if (status) where.status = String(status);
      if (source) where.leadSource = String(source);
      if (assignedUserId) where.assignedUserId = String(assignedUserId);
      if (search) {
        where.OR = [
          { companyName: { contains: String(search) } },
          { contactPerson: { contains: String(search) } },
          { email: { contains: String(search) } },
        ];
      }

      const leads = await prisma.lead.findMany({
        where,
        include: { assignedUser: { select: { id: true, firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ success: true, data: leads });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createLead(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { companyName, website, industry, contactPerson, email, phone, location, leadSource, priority, notes, assignedUserId } = req.body;

      if (!companyName) {
        return res.status(400).json({ success: false, message: 'Company name is required' });
      }

      const lead = await prisma.lead.create({
        data: {
          organizationId: orgId,
          companyName,
          website,
          industry,
          contactPerson,
          email,
          phone,
          location,
          leadSource: leadSource || 'LinkedIn',
          priority: priority || 'Medium',
          notes,
          assignedUserId: assignedUserId || req.user!.id,
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          organizationId: orgId,
          activityType: 'LeadCreated',
          relatedEntityType: 'Lead',
          relatedEntityId: lead.id,
          subject: `Created lead for ${companyName}`,
          performedById: req.user!.id,
        },
      });

      return res.status(201).json({ success: true, message: 'Lead created successfully', data: lead });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getLeadById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const lead = await prisma.lead.findFirst({
        where: { id, organizationId: req.user!.organizationId },
        include: {
          assignedUser: true,
          convertedAccount: { include: { contacts: true, jobs: true } },
        },
      });

      if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
      return res.json({ success: true, data: lead });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateLead(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const lead = await prisma.lead.update({
        where: { id },
        data: req.body,
      });

      return res.json({ success: true, message: 'Lead updated', data: lead });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async convertLead(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const orgId = req.user!.organizationId;

      const lead = await prisma.lead.findFirst({ where: { id, organizationId: orgId } });
      if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

      // Create new account
      const account = await prisma.account.create({
        data: {
          organizationId: orgId,
          name: lead.companyName,
          website: lead.website,
          industry: lead.industry,
          accountType: 'DirectClient',
          accountManagerId: lead.assignedUserId || req.user!.id,
          status: 'Active',
          notes: `Converted from lead. Original notes: ${lead.notes || 'None'}`,
        },
      });

      // Create primary contact if contactPerson exists
      if (lead.contactPerson || lead.email) {
        const nameParts = (lead.contactPerson || 'Hiring Manager').split(' ');
        await prisma.contact.create({
          data: {
            organizationId: orgId,
            accountId: account.id,
            firstName: nameParts[0] || 'Client',
            lastName: nameParts.slice(1).join(' ') || 'Contact',
            email: lead.email || `${lead.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`,
            phone: lead.phone,
            isPrimary: true,
            designation: 'Hiring Manager',
          },
        });
      }

      // Update lead status to Won / Converted
      const updatedLead = await prisma.lead.update({
        where: { id },
        data: {
          status: 'Won',
          convertedAccountId: account.id,
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          organizationId: orgId,
          activityType: 'LeadConverted',
          relatedEntityType: 'Account',
          relatedEntityId: account.id,
          subject: `Converted lead ${lead.companyName} into Client Account`,
          performedById: req.user!.id,
        },
      });

      return res.json({
        success: true,
        message: 'Lead converted to Account successfully',
        data: { lead: updatedLead, account },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ================= ACCOUNTS =================
  public static async getAccounts(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { status, type, search } = req.query;

      const where: any = { organizationId: orgId };
      if (status) where.status = String(status);
      if (type) where.accountType = String(type);
      if (search) {
        where.OR = [
          { name: { contains: String(search) } },
          { industry: { contains: String(search) } },
        ];
      }

      const accounts = await prisma.account.findMany({
        where,
        include: {
          accountManager: { select: { id: true, firstName: true, lastName: true } },
          contacts: true,
          jobs: { select: { id: true, jobCode: true, title: true, status: true } },
          placements: { select: { id: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ success: true, data: accounts });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createAccount(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { name, legalName, website, industry, accountType, companySize, headquarters, paymentTerms, notes, accountManagerId } = req.body;

      if (!name) return res.status(400).json({ success: false, message: 'Account name is required' });

      const account = await prisma.account.create({
        data: {
          organizationId: orgId,
          name,
          legalName,
          website,
          industry,
          accountType: accountType || 'DirectClient',
          companySize,
          headquarters,
          paymentTerms: paymentTerms || 'Net 30',
          notes,
          accountManagerId: accountManagerId || req.user!.id,
        },
      });

      return res.status(201).json({ success: true, message: 'Account created', data: account });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getAccountById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const account = await prisma.account.findFirst({
        where: { id, organizationId: req.user!.organizationId },
        include: {
          accountManager: true,
          contacts: true,
          opportunities: true,
          jobs: {
            include: {
              assignedRecruiter: true,
              submissions: true,
            },
          },
          submissions: {
            include: {
              candidate: true,
              job: true,
            },
          },
          placements: {
            include: {
              candidate: true,
              job: true,
            },
          },
        },
      });

      if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
      return res.json({ success: true, data: account });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ================= CONTACTS =================
  public static async getContacts(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { accountId, search } = req.query;

      const where: any = { organizationId: orgId };
      if (accountId) where.accountId = String(accountId);
      if (search) {
        where.OR = [
          { firstName: { contains: String(search) } },
          { lastName: { contains: String(search) } },
          { email: { contains: String(search) } },
        ];
      }

      const contacts = await prisma.contact.findMany({
        where,
        include: { account: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ success: true, data: contacts });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createContact(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { accountId, firstName, lastName, designation, department, email, phone, linkedIn, isPrimary, notes } = req.body;

      if (!accountId || !firstName || !lastName || !email) {
        return res.status(400).json({ success: false, message: 'Account, first name, last name, and email are required' });
      }

      const contact = await prisma.contact.create({
        data: {
          organizationId: orgId,
          accountId,
          firstName,
          lastName,
          designation,
          department,
          email,
          phone,
          linkedIn,
          isPrimary: Boolean(isPrimary),
          notes,
        },
      });

      return res.status(201).json({ success: true, message: 'Contact created', data: contact });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ================= OPPORTUNITIES =================
  public static async getOpportunities(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { stage, accountId } = req.query;

      const where: any = { organizationId: orgId };
      if (stage) where.stage = String(stage);
      if (accountId) where.accountId = String(accountId);

      const opportunities = await prisma.opportunity.findMany({
        where,
        include: {
          account: { select: { id: true, name: true, industry: true } },
          assignedUser: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ success: true, data: opportunities });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createOpportunity(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { accountId, name, stage, estimatedValue, probability, expectedCloseDate, assignedUserId, notes } = req.body;

      if (!accountId || !name) {
        return res.status(400).json({ success: false, message: 'Account and Opportunity name are required' });
      }

      const opportunity = await prisma.opportunity.create({
        data: {
          organizationId: orgId,
          accountId,
          name,
          stage: stage || 'NewOpportunity',
          estimatedValue: estimatedValue ? parseFloat(estimatedValue) : 0,
          probability: probability ? parseInt(probability) : 50,
          expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
          assignedUserId: assignedUserId || req.user!.id,
          notes,
        },
      });

      return res.status(201).json({ success: true, message: 'Opportunity created', data: opportunity });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateOpportunityStage(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const { stage, lostReason } = req.body;

      const opportunity = await prisma.opportunity.update({
        where: { id },
        data: {
          stage,
          lostReason: lostReason || null,
        },
      });

      return res.json({ success: true, message: 'Stage updated', data: opportunity });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ================= ACTIVITIES & TASKS =================
  public static async getActivities(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const activities = await prisma.activity.findMany({
        where: { organizationId: orgId },
        orderBy: { occurredAt: 'desc' },
        take: 50,
      });
      return res.json({ success: true, data: activities });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createActivity(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { activityType, relatedEntityType, relatedEntityId, subject, description } = req.body;

      const activity = await prisma.activity.create({
        data: {
          organizationId: orgId,
          activityType: activityType || 'Note',
          relatedEntityType: relatedEntityType || 'General',
          relatedEntityId: relatedEntityId || '',
          subject,
          description,
          performedById: req.user!.id,
        },
      });

      return res.status(201).json({ success: true, data: activity });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getTasks(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const tasks = await prisma.task.findMany({
        where: { organizationId: orgId },
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ success: true, data: tasks });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createTask(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { title, description, assignedToId, dueAt, priority, relatedEntityType, relatedEntityId } = req.body;

      const task = await prisma.task.create({
        data: {
          organizationId: orgId,
          title,
          description,
          assignedToId: assignedToId || req.user!.id,
          createdById: req.user!.id,
          dueAt: dueAt ? new Date(dueAt) : null,
          priority: priority || 'Medium',
          status: 'Pending',
          relatedEntityType,
          relatedEntityId,
        },
      });

      return res.status(201).json({ success: true, data: task });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateTask(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const task = await prisma.task.update({
        where: { id },
        data: req.body,
      });
      return res.json({ success: true, data: task });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
