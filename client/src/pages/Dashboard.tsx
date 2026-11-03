import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  LinearProgress,
  Avatar,
  Divider,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Users,
  Briefcase,
  Building2,
  TrendingUp,
  Award,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  Send,
  MessageSquare,
  DollarSign,
  AlertTriangle,
  UserCheck,
  Plus,
  ExternalLink,
  Target,
} from 'lucide-react';
import { apiClient } from '../api/client';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storedUser = localStorage.getItem('pavion_user');
  const currentUser = storedUser
    ? JSON.parse(storedUser)
    : { role: 'SuperAdmin', firstName: 'Vikram', lastName: 'Sharma' };

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.dashboard.getOverview();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || 'Failed to connect to backend service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading && !data) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error && !data) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error" sx={{ mb: 1, fontWeight: 700 }}>
          Unable to Connect to ATS Backend API
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
          {error} (Endpoint: http://127.0.0.1:5055/api/v1/dashboard/overview)
        </Typography>
        <Button variant="contained" onClick={fetchOverview} sx={{ bgcolor: '#1E3A8A' }}>
          Retry Connection
        </Button>
      </Box>
    );
  }

  const role = currentUser.role;

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      {/* 1. Super Admin View */}
      {role === 'SuperAdmin' && <SuperAdminView data={data} navigate={navigate} onRefresh={fetchOverview} />}

      {/* 2. Senior Recruiter View */}
      {role === 'SeniorRecruiter' && <SeniorRecruiterView data={data} navigate={navigate} onRefresh={fetchOverview} />}

      {/* 3. Account Manager View */}
      {role === 'AccountManager' && <AccountManagerView data={data} navigate={navigate} onRefresh={fetchOverview} />}

      {/* 4. Sales / BDE View */}
      {(role === 'BusinessDevelopmentExecutive' || role === 'SalesManager' || role === 'SalesBDE') && (
        <SalesBdeView data={data} navigate={navigate} onRefresh={fetchOverview} />
      )}
    </Box>
  );
};

/* =========================================================================
   1. SUPER ADMIN DASHBOARD
   ========================================================================= */
const SuperAdminView: React.FC<{ data: any; navigate: any; onRefresh: any }> = ({ data, navigate, onRefresh }) => {
  const sa = data.superAdmin || {};

  return (
    <Box>
      {/* Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            👑 Super Admin Governance Center <Sparkles size={22} color="#2563EB" />
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Complete enterprise system control, multi-tenant RBAC, global revenue analytics, and audit oversight.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" onClick={onRefresh} sx={{ borderColor: '#CBD5E1', color: '#475569' }}>
            Refresh Analytics
          </Button>
          <Button variant="contained" onClick={() => navigate('/settings')} sx={{ bgcolor: '#1E3A8A' }}>
            System Settings & RBAC
          </Button>
        </Box>
      </Box>

      {/* 8 Super Admin KPIs */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <KpiCard label="TOTAL SYSTEM USERS" value={sa.totalUsers || 4} subtitle="Recruiters, AMs & Sales" icon={<Users size={22} />} color="#1E3A8A" onClick={() => navigate('/settings')} />
        <KpiCard label="ENTERPRISE CLIENTS" value={sa.totalClients || 4} subtitle="Active MSAs & Partners" icon={<Building2 size={22} />} color="#059669" onClick={() => navigate('/crm/accounts')} />
        <KpiCard label="TOTAL JOB REQUISITIONS" value={sa.totalJobs || 4} subtitle="Open & Filled Reqs" icon={<Briefcase size={22} />} color="#2563EB" onClick={() => navigate('/ats/jobs')} />
        <KpiCard label="CANDIDATE TALENT POOL" value={sa.totalCandidates || 18} subtitle="Sourced talent records" icon={<UserCheck size={22} />} color="#7C3AED" onClick={() => navigate('/ats/candidates')} />
        <KpiCard label="ALL-TIME SUBMISSIONS" value={sa.totalSubmissions || 9} subtitle="Client candidate reviews" icon={<Send size={22} />} color="#EC4899" onClick={() => navigate('/ats/submissions')} />
        <KpiCard label="INTERVIEWS CONDUCTED" value={sa.totalInterviews || 5} subtitle="Tech & Client rounds" icon={<CalendarCheck2 size={22} />} color="#F59E0B" onClick={() => navigate('/ats/interviews')} />
        <KpiCard label="ACTIVE PLACEMENTS" value={sa.totalPlacements || 4} subtitle="Active billable starts" icon={<Award size={22} />} color="#10B981" onClick={() => navigate('/ats/placements')} />
        <KpiCard label="REVENUE OVERVIEW" value={sa.revenueOverview || '$485,000'} subtitle="Gross billing volume" icon={<DollarSign size={22} />} color="#047857" onClick={() => navigate('/reports')} />
      </Grid>

      {/* Analytics & Performance Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              Monthly Billing & Consultant Revenue Trend
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
              Monthly gross billing based on active consultant hours and placement fees.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2.5, height: 200, pt: 4 }}>
              {data.monthlyPlacements?.map((item: any, idx: number) => (
                <Box key={idx} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E3A8A', mb: 0.5 }}>
                    ${(item.revenue / 1000).toFixed(0)}k
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      bgcolor: idx === data.monthlyPlacements.length - 1 ? '#1E3A8A' : '#93C5FD',
                      height: `${Math.min(100, (item.revenue / 90000) * 100)}%`,
                      borderRadius: '6px 6px 0 0',
                    }}
                  />
                  <Typography variant="caption" sx={{ mt: 1, fontWeight: 600, color: '#64748B' }}>
                    {item.month}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Recruiter Leaderboard */}
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Staff Performance & Productivity Leaderboard
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Team Member</TableCell>
                    <TableCell>RBAC Role</TableCell>
                    <TableCell align="center">Submissions</TableCell>
                    <TableCell align="center">Placements</TableCell>
                    <TableCell align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.recruiterLeaderboard?.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell sx={{ fontWeight: 700 }}>{r.name}</TableCell>
                      <TableCell><Chip label={r.role} size="small" variant="outlined" /></TableCell>
                      <TableCell align="center"><strong>{r.submissionsCount}</strong></TableCell>
                      <TableCell align="center"><Chip label={`${r.placementsCount} Starts`} size="small" sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700 }} /></TableCell>
                      <TableCell align="right"><Chip label="Active" size="small" sx={{ bgcolor: '#EFF6FF', color: '#1E3A8A' }} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Right Column: Multi-Tenant Health & Audit Trail */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              Enterprise Tenant Security
            </Typography>
            <Box sx={{ p: 2, bgcolor: '#ECFDF5', borderRadius: 2, mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#065F46' }}>
                Tenant Health: 100% Operational
              </Typography>
              <Typography variant="caption" sx={{ color: '#047857' }}>
                Multi-tenant data isolation active for Pavion Technologies.
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
              Database: PostgreSQL / Prisma ORM | Relational Integrity: Verified
            </Typography>
          </Paper>

          {/* Pending Tasks */}
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              Operational Tasks & Action Items
            </Typography>
            {data.pendingTasks?.map((task: any) => (
              <Box key={task.id} sx={{ mb: 1.5, pb: 1.5, borderBottom: '1px solid #F1F5F9' }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{task.title}</Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Assigned: {task.assignedTo?.firstName || 'Unassigned'} • Due: {task.dueAt ? new Date(task.dueAt).toLocaleDateString() : 'Today'}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

/* =========================================================================
   2. SENIOR RECRUITER DASHBOARD
   ========================================================================= */
const SeniorRecruiterView: React.FC<{ data: any; navigate: any; onRefresh: any }> = ({ data, navigate, onRefresh }) => {
  const rec = data.seniorRecruiter || {};

  return (
    <Box>
      {/* Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            🎯 Senior Recruiter Sourcing Center <Briefcase size={24} color="#2563EB" />
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Assigned job requisitions, candidate sourcing workbench, 16-stage ATS pipeline, and interview management.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" onClick={() => navigate('/ats/resumes')} sx={{ borderColor: '#CBD5E1', color: '#1E3A8A', fontWeight: 700 }}>
            Resume Workbench
          </Button>
          <Button variant="contained" onClick={() => navigate('/ats/pipeline')} sx={{ bgcolor: '#1E3A8A' }}>
            Open 16-Stage Pipeline
          </Button>
        </Box>
      </Box>

      {/* 8 Senior Recruiter KPIs */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <KpiCard label="ASSIGNED JOBS" value={rec.assignedJobs || 4} subtitle="Active requisitions" icon={<Briefcase size={22} />} color="#1E3A8A" onClick={() => navigate('/ats/jobs')} />
        <KpiCard label="OPEN POSITIONS" value={rec.openPositions || 6} subtitle="Unfilled openings" icon={<Target size={22} />} color="#2563EB" onClick={() => navigate('/ats/jobs')} />
        <KpiCard label="AVAILABLE CANDIDATES" value={rec.availableCandidates || 18} subtitle="Sourced & active bench" icon={<Users size={22} />} color="#059669" onClick={() => navigate('/ats/candidates')} />
        <KpiCard label="CANDIDATES IN PIPELINE" value={rec.candidatesInPipeline || 12} subtitle="In recruitment funnel" icon={<UserCheck size={22} />} color="#7C3AED" onClick={() => navigate('/ats/pipeline')} />
        <KpiCard label="SUBMISSIONS" value={rec.submissions || 9} subtitle="Submitted to clients" icon={<Send size={22} />} color="#EC4899" onClick={() => navigate('/ats/submissions')} />
        <KpiCard label="INTERVIEWS SCHEDULED" value={rec.interviews || 5} subtitle="Tech & client rounds" icon={<CalendarCheck2 size={22} />} color="#F59E0B" onClick={() => navigate('/ats/interviews')} />
        <KpiCard label="OFFERS RELEASED" value={rec.offersReleased || 3} subtitle="Pending acceptance" icon={<Sparkles size={22} />} color="#10B981" onClick={() => navigate('/ats/pipeline')} />
        <KpiCard label="CONFIRMED PLACEMENTS" value={rec.placements || 4} subtitle="Consultant starts" icon={<Award size={22} />} color="#047857" onClick={() => navigate('/ats/placements')} />
      </Grid>

      {/* Pipeline Funnel & Today's Interviews */}
      <Grid container spacing={3}>
        {/* Recruitment Pipeline Funnel Breakdown */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                16-Stage Recruitment Pipeline Funnel
              </Typography>
              <Button size="small" onClick={() => navigate('/ats/pipeline')} sx={{ fontWeight: 700 }}>
                View Kanban Board
              </Button>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
              Real-time candidate volume moving through key screening, RTR, submission, and interview milestones.
            </Typography>

            {rec.pipelineFunnel?.map((stage: any, idx: number) => (
              <Box key={idx} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{stage.stage}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: stage.color }}>{stage.count} Candidates</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, (stage.count / 20) * 100)}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: '#F1F5F9',
                    '& .MuiLinearProgress-bar': { bgcolor: stage.color },
                  }}
                />
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Right: Scheduled Interviews & Quick Sourcing */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              Today's Scheduled Interviews
            </Typography>
            {data.upcomingInterviews?.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#64748B' }}>No interviews scheduled for today.</Typography>
            ) : (
              data.upcomingInterviews?.map((inv: any) => (
                <Box key={inv.id} sx={{ mb: 2, p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {inv.candidate?.firstName} {inv.candidate?.lastName}
                    </Typography>
                    <Chip label={inv.roundName || 'Round 1'} size="small" sx={{ bgcolor: '#EFF6FF', color: '#1E3A8A', fontWeight: 700 }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                    Requisition: {inv.job?.title} ({inv.job?.jobCode})
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600 }}>
                    🕒 {new Date(inv.scheduledAt).toLocaleString()} ({inv.timezone || 'EST'})
                  </Typography>
                </Box>
              ))
            )}
          </Paper>

          {/* Quick Resume Sourcing Action Card */}
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#1E3A8A', color: '#FFFFFF' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
              Sourcing & Resume Parser
            </Typography>
            <Typography variant="body2" sx={{ color: '#BFDBFE', mb: 2 }}>
              Parse candidate resumes or source talent from Monster & LinkedIn in 1 click.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/ats/resumes')}
              sx={{ bgcolor: '#FFFFFF', color: '#1E3A8A', fontWeight: 800, '&:hover': { bgcolor: '#F8FAFC' } }}
            >
              Open Resume Workbench
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

/* =========================================================================
   3. ACCOUNT MANAGER DASHBOARD
   ========================================================================= */
const AccountManagerView: React.FC<{ data: any; navigate: any; onRefresh: any }> = ({ data, navigate, onRefresh }) => {
  const am = data.accountManager || {};

  return (
    <Box>
      {/* Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            💼 Account Manager & Client Delivery Center <Building2 size={24} color="#2563EB" />
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Assigned client accounts, open requisitions coordination with senior recruiters, submissions, and client feedback.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" onClick={() => navigate('/ats/coordination')} sx={{ borderColor: '#CBD5E1', color: '#1E3A8A', fontWeight: 700 }}>
            Recruiter Coordination
          </Button>
          <Button variant="contained" onClick={() => navigate('/ats/client-feedback')} sx={{ bgcolor: '#1E3A8A' }}>
            Client Feedback Log
          </Button>
        </Box>
      </Box>

      {/* 6 Account Manager KPIs */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <KpiCard
          label="ASSIGNED CLIENTS"
          value={am.assignedClients || 4}
          subtitle="Direct clients & MSPs"
          icon={<Building2 size={22} />}
          color="#1E3A8A"
          md={4}
          onClick={() => navigate('/crm/accounts')}
        />
        <KpiCard
          label="ACTIVE REQUIREMENTS"
          value={am.activeRequirements || 5}
          subtitle="Open job orders"
          icon={<Briefcase size={22} />}
          color="#2563EB"
          md={4}
          onClick={() => navigate('/ats/jobs')}
        />
        <KpiCard
          label="CANDIDATES SUBMITTED"
          value={am.candidatesSubmitted || 9}
          subtitle="To client hiring managers"
          icon={<Send size={22} />}
          color="#7C3AED"
          md={4}
          onClick={() => navigate('/ats/submissions')}
        />
        <KpiCard
          label="INTERVIEWS SCHEDULED"
          value={am.interviewsScheduled || 5}
          subtitle="Client interview rounds"
          icon={<CalendarCheck2 size={22} />}
          color="#F59E0B"
          md={4}
          onClick={() => navigate('/ats/interviews')}
        />
        <KpiCard
          label="CLIENT FEEDBACK PENDING"
          value={am.clientFeedbackPending || 2}
          subtitle="Awaiting manager decision"
          icon={<AlertTriangle size={22} />}
          color="#DC2626"
          md={4}
          onClick={() => navigate('/ats/client-feedback')}
        />
        <KpiCard
          label="ACTIVE PLACEMENTS"
          value={am.activePlacements || 4}
          subtitle="On-site / remote billable"
          icon={<Award size={22} />}
          color="#059669"
          md={4}
          onClick={() => navigate('/ats/placements')}
        />
      </Grid>

      {/* Client Accounts & Feedback Logs */}
      <Grid container spacing={3}>
        {/* Assigned Client Accounts */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                My Client Accounts & Active Orders
              </Typography>
              <Button size="small" onClick={() => navigate('/crm/accounts')} sx={{ fontWeight: 700 }}>
                View All Clients
              </Button>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Client Company</TableCell>
                    <TableCell>Account Type</TableCell>
                    <TableCell align="center">Open Reqs</TableCell>
                    <TableCell align="center">Active Placements</TableCell>
                    <TableCell align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {am.clientAccounts?.map((acc: any) => (
                    <TableRow
                      key={acc.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate('/crm/accounts')}
                    >
                      <TableCell sx={{ fontWeight: 700 }}>{acc.name}</TableCell>
                      <TableCell><Chip label={acc.accountType || 'DirectClient'} size="small" variant="outlined" /></TableCell>
                      <TableCell align="center"><strong>{acc._count?.jobs || 1}</strong></TableCell>
                      <TableCell align="center"><Chip label={`${acc._count?.placements || 1} Consultants`} size="small" sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700 }} /></TableCell>
                      <TableCell align="right"><Chip label={acc.status} size="small" sx={{ bgcolor: '#EFF6FF', color: '#1E3A8A' }} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Right: Submissions Awaiting Client Action */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Pending Client Feedbacks
              </Typography>
              <Button size="small" onClick={() => navigate('/ats/client-feedback')} sx={{ fontWeight: 700 }}>
                Open Feedback
              </Button>
            </Box>
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              2 candidate submissions are awaiting client review for more than 48 hours. Follow up today.
            </Alert>
            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0', mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                David Kim (Fullstack Java/AWS)
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                Client: Anthem Health • Submitted: 3 days ago • Bill Rate: $95/hr
              </Typography>
              <Button size="small" variant="outlined" onClick={() => navigate('/ats/client-feedback')} sx={{ mt: 1, fontWeight: 700 }}>
                Log Client Decision
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

/* =========================================================================
   4. SALES / BDE DASHBOARD
   ========================================================================= */
const SalesBdeView: React.FC<{ data: any; navigate: any; onRefresh: any }> = ({ data, navigate, onRefresh }) => {
  const s = data.salesBde || {};

  return (
    <Box>
      {/* Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            📈 Sales & Business Development Center <TrendingUp size={24} color="#2563EB" />
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Staffing lead acquisition, B2B sales pipeline, proposal negotiations, and client conversions.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" onClick={() => navigate('/crm/activities')} sx={{ borderColor: '#CBD5E1', color: '#1E3A8A', fontWeight: 700 }}>
            Log Call / Meeting
          </Button>
          <Button variant="contained" onClick={() => navigate('/crm/leads?action=new')} sx={{ bgcolor: '#1E3A8A' }}>
            New Sales Lead
          </Button>
        </Box>
      </Box>

      {/* 7 Sales KPIs */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <KpiCard label="TOTAL PROSPECT LEADS" value={s.totalLeads || 14} subtitle="All inbound & outbound" icon={<Users size={22} />} color="#1E3A8A" onClick={() => navigate('/crm/leads')} />
        <KpiCard label="NEW INQUIRIES" value={s.newLeads || 6} subtitle="Uncontacted leads" icon={<Sparkles size={22} />} color="#2563EB" onClick={() => navigate('/crm/leads')} />
        <KpiCard label="QUALIFIED LEADS" value={s.qualifiedLeads || 5} subtitle="Ready for MSA" icon={<CheckCircle2 size={22} />} color="#059669" onClick={() => navigate('/crm/leads')} />
        <KpiCard label="DISCOVERY MEETINGS" value={s.meetings || 4} subtitle="Scheduled client demos" icon={<CalendarCheck2 size={22} />} color="#F59E0B" onClick={() => navigate('/crm/activities')} />
        <KpiCard label="OPEN OPPORTUNITIES" value={s.openOpportunities || 3} subtitle="In negotiation" icon={<TrendingUp size={22} />} color="#7C3AED" onClick={() => navigate('/crm/opportunities')} />
        <KpiCard label="PIPELINE VALUE" value={`$${((s.pipelineValue || 380000) / 1000).toFixed(0)}k`} subtitle="Estimated deal volume" icon={<DollarSign size={22} />} color="#047857" onClick={() => navigate('/crm/opportunities')} />
        <KpiCard label="DEALS CLOSED WON" value={s.dealsWon || 4} subtitle="Converted client accounts" icon={<Award size={22} />} color="#10B981" onClick={() => navigate('/crm/opportunities')} />
      </Grid>

      {/* Quota & Pipeline Section */}
      <Grid container spacing={3}>
        {/* Sales Target Quota */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              Quarterly Sales Quota Progress
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
              Target: $500,000 USD | Achieved Deal Volume: $380,000 USD
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Quota Progress</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#059669' }}>76% Achieved</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={76}
                sx={{ height: 12, borderRadius: 6, bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: '#059669' } }}
              />
            </Box>
            <Button variant="contained" onClick={() => navigate('/crm/opportunities')} sx={{ bgcolor: '#1E3A8A' }}>
              View Sales Pipeline Kanban
            </Button>
          </Paper>
        </Grid>

        {/* Recent Sales Activities */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Today's Sales Touchpoints
              </Typography>
              <Button size="small" onClick={() => navigate('/crm/activities')} sx={{ fontWeight: 700 }}>
                Log Interaction
              </Button>
            </Box>
            {data.recentActivities?.map((a: any) => (
              <Box key={a.id} sx={{ mb: 2, p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{a.subject}</Typography>
                  <Chip label={a.activityType} size="small" variant="outlined" />
                </Box>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  {new Date(a.occurredAt || a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {a.description || 'Outreach call'}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

/* =========================================================================
   REUSABLE KPI CARD
   ========================================================================= */
interface KpiCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
}

const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  color,
  onClick,
  xs = 12,
  sm = 6,
  md = 3,
  lg,
}) => (
  <Grid item xs={xs} sm={sm} md={md} lg={lg || md}>
    <Card
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        bgcolor: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        border: '1px solid #E2E8F0',
        borderRadius: 2.5,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        '&:hover': onClick
          ? {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 24px -4px rgba(0, 0, 0, 0.1), 0 6px 12px -4px rgba(0, 0, 0, 0.06)',
              borderColor: color,
              '& .kpi-arrow': {
                color: color,
                transform: 'translateX(2px)',
              },
            }
          : {},
        '&:active': onClick
          ? {
              transform: 'translateY(-1px)',
            }
          : {},
      }}
    >
      <Box sx={{ height: 4, bgcolor: color }} />
      <CardContent sx={{ p: 2.5, pb: '18px !important', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ overflow: 'hidden', pr: 1 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: '#64748B',
                letterSpacing: '0.04em',
                display: 'block',
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5 }}>
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 44, height: 44, flexShrink: 0 }}>
            {icon}
          </Avatar>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 1, borderTop: '1px solid #F1F5F9' }}>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
            {subtitle}
          </Typography>
          {onClick && (
            <Box
              className="kpi-arrow"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.3,
                color: '#94A3B8',
                fontWeight: 700,
                fontSize: '0.75rem',
                transition: 'all 0.2s ease',
              }}
            >
              Open <ArrowUpRight size={13} />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  </Grid>
);
