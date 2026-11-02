import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

export interface AuthUser {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'pavion-us-staffing-ats-crm-super-secret-key-2026';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
        req.user = decoded;
        return next();
      } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token', code: 'UNAUTHORIZED' });
      }
    }

    // Development fallback or header-based user
    const devUserId = req.headers['x-user-id'] as string;
    if (devUserId) {
      const user = await prisma.user.findUnique({ where: { id: devUserId } });
      if (user) {
        req.user = {
          id: user.id,
          organizationId: user.organizationId,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        };
        return next();
      }
    }

    // Fallback to first available active user for easy API / Swagger exploration if no auth header
    const defaultUser = await prisma.user.findFirst({
      where: { status: 'ACTIVE' },
    });
    if (defaultUser) {
      req.user = {
        id: defaultUser.id,
        organizationId: defaultUser.organizationId,
        email: defaultUser.email,
        role: defaultUser.role,
        firstName: defaultUser.firstName,
        lastName: defaultUser.lastName,
      };
      return next();
    }

    return res.status(401).json({ success: false, message: 'Authentication required', code: 'UNAUTHORIZED' });
  } catch (error) {
    next(error);
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (req.user.role === 'SuperAdmin' || allowedRoles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: 'Access denied: insufficient permissions',
      code: 'FORBIDDEN',
    });
  };
};
