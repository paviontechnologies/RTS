import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';

export class SettingsController {
  public static async getOrganization(req: Request, res: Response) {
    try {
      const org = await prisma.organization.findUnique({
        where: { id: req.user!.organizationId },
      });
      return res.json({ success: true, data: org });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateOrganization(req: Request, res: Response) {
    try {
      const org = await prisma.organization.update({
        where: { id: req.user!.organizationId },
        data: req.body,
      });
      return res.json({ success: true, message: 'Organization updated', data: org });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getUsers(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        where: { organizationId: req.user!.organizationId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          department: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ success: true, data: users });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createUser(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { firstName, lastName, email, password, role, department } = req.body;

      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
      }

      const existing = await prisma.user.findFirst({
        where: { organizationId: orgId, email: email.toLowerCase().trim() },
      });
      if (existing) {
        return res.status(409).json({ success: false, message: 'User with this email already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          organizationId: orgId,
          firstName,
          lastName,
          email: email.toLowerCase().trim(),
          passwordHash,
          role: role || 'SeniorRecruiter',
          department: department || 'Recruitment',
          status: 'ACTIVE',
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          department: true,
          createdAt: true,
        },
      });

      return res.status(201).json({ success: true, message: 'User created successfully', data: user });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateUser(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const { firstName, lastName, role, department, status, password } = req.body;

      const data: any = {};
      if (firstName) data.firstName = firstName;
      if (lastName) data.lastName = lastName;
      if (role) data.role = role;
      if (department) data.department = department;
      if (status) data.status = status;
      if (password) data.passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          department: true,
        },
      });

      return res.json({ success: true, message: 'User updated', data: user });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getAuditLogs(req: Request, res: Response) {
    try {
      const logs = await prisma.auditLog.findMany({
        where: { organizationId: req.user!.organizationId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      return res.json({ success: true, data: logs });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
