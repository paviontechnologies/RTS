import { Request, Response } from 'express';
import prisma from '../prisma';

export class NotificationController {
  public static async getNotifications(req: Request, res: Response) {
    try {
      const orgId = req.user?.organizationId || 'org_pavion_default';
      const role = req.user?.role || 'SuperAdmin';

      let roleNotifications: any[] = [];

      if (role === 'SeniorRecruiter') {
        roleNotifications = [
          {
            id: 'notif_1',
            type: 'INTERVIEW',
            title: 'Client Technical Interview Scheduled',
            message: 'Anthem Health scheduled Round 1 for candidate Priya Patel on Thursday at 2:00 PM EST.',
            link: '/ats/interviews',
            isRead: false,
            createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          },
          {
            id: 'notif_2',
            type: 'RTR',
            title: 'RTR Consent Form Signed',
            message: 'David Kim signed the Right to Represent consent for Cloud Architect requirement.',
            link: '/ats/pipeline',
            isRead: false,
            createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
          },
          {
            id: 'notif_3',
            type: 'SOURCING',
            title: 'New Candidate via LinkedIn Easy Apply',
            message: 'Candidate Brandon Miller applied for Senior Fullstack Java Engineer requisition.',
            link: '/ats/candidates',
            isRead: false,
            createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
          },
          {
            id: 'notif_4',
            type: 'SUBMISSION',
            title: 'Client Feedback Shortlisted',
            message: 'Hiring Manager at CVS Health shortlisted candidate Priya Patel for technical interview.',
            link: '/ats/submissions',
            isRead: true,
            createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          },
          {
            id: 'notif_5',
            type: 'PLACEMENT',
            title: 'Offer Letter Released 🎉',
            message: 'Cognizant extended offer to Alex Wong with $95/hr bill rate. Start date: Dec 1st.',
            link: '/ats/placements',
            isRead: true,
            createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
          },
        ];
      } else if (role === 'AccountManager') {
        roleNotifications = [
          {
            id: 'notif_am_1',
            type: 'FEEDBACK',
            title: 'Client Feedback Pending (>48h)',
            message: 'Anthem Health has not reviewed candidate David Kim submitted 3 days ago. Urgent follow-up needed.',
            link: '/ats/client-feedback',
            isRead: false,
            createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          },
          {
            id: 'notif_am_2',
            type: 'JOB',
            title: 'New Requisition Opened by Client',
            message: 'Optum opened REQ-2026-0004: Senior DevOps Engineer (Bill Rate: $105/hr).',
            link: '/ats/jobs',
            isRead: false,
            createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
          },
          {
            id: 'notif_am_3',
            type: 'SUBMISSION',
            title: 'Candidate Submitted by Recruiter',
            message: 'Alex Carter submitted candidate Priya Patel for your open requisition.',
            link: '/ats/submissions',
            isRead: false,
            createdAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
          },
          {
            id: 'notif_am_4',
            type: 'PLACEMENT',
            title: 'Consultant Extension Notice',
            message: 'Consultant Mark Taylor at CVS Health contract ends in 30 days. Reach out for extension.',
            link: '/ats/placements',
            isRead: true,
            createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          },
        ];
      } else if (role === 'BusinessDevelopmentExecutive' || role === 'SalesManager' || role === 'SalesBDE') {
        roleNotifications = [
          {
            id: 'notif_s_1',
            type: 'LEAD',
            title: 'New Inbound Staffing Lead',
            message: 'Tekmark Global Solutions submitted an inquiry for 8 contract Java developers.',
            link: '/crm/leads',
            isRead: false,
            createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          },
          {
            id: 'notif_s_2',
            type: 'TASK',
            title: 'Follow-up Call Due Today',
            message: 'Scheduled follow-up with Director of Procurement at Charter Communications regarding MSA terms.',
            link: '/crm/activities',
            isRead: false,
            createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'notif_s_3',
            type: 'OPPORTUNITY',
            title: 'Opportunity Deal Won 🎉',
            message: 'Optum Cloud Migration Staffing deal ($120,000) marked as Closed Won!',
            link: '/crm/opportunities',
            isRead: false,
            createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
          },
          {
            id: 'notif_s_4',
            type: 'MEETING',
            title: 'Discovery Meeting Confirmed',
            message: 'Zoom presentation confirmed with VP of IT at Anthem Health for tomorrow at 11:00 AM CST.',
            link: '/crm/activities',
            isRead: true,
            createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          },
        ];
      } else {
        // Super Admin (System & Compliance)
        roleNotifications = [
          {
            id: 'notif_sa_1',
            type: 'SECURITY',
            title: 'New Staff User Onboarded',
            message: 'Marcus Vance was assigned role BusinessDevelopmentExecutive by Admin.',
            link: '/settings',
            isRead: false,
            createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          },
          {
            id: 'notif_sa_2',
            type: 'REVENUE',
            title: 'Monthly Billing Milestone',
            message: 'Total active placement monthly billing reached $86,400 USD.',
            link: '/reports',
            isRead: false,
            createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
          },
          {
            id: 'notif_sa_3',
            type: 'INTEGRATION',
            title: 'Monster API Sync Completed',
            message: 'Monster TalentBin API synced 14 new candidate profiles automatically.',
            link: '/settings',
            isRead: false,
            createdAt: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
          },
          {
            id: 'notif_sa_4',
            type: 'COMPLIANCE',
            title: 'Audit Trail Backup Completed',
            message: 'Immutable security audit logs backed up with zero compliance anomalies.',
            link: '/settings',
            isRead: true,
            createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          },
        ];
      }

      return res.json({
        success: true,
        data: roleNotifications,
        unreadCount: roleNotifications.filter(n => !n.isRead).length,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async markAsRead(req: Request, res: Response) {
    return res.json({ success: true, message: 'Notification marked as read' });
  }

  public static async markAllAsRead(req: Request, res: Response) {
    return res.json({ success: true, message: 'All notifications marked as read' });
  }
}
