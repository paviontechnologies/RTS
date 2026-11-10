import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  CheckSquare,
  Plus,
  ShieldCheck,
  FileCheck,
  AlertCircle,
  Clock,
  ExternalLink,
  Laptop,
  FileText,
  UserCheck,
  Building,
  CheckCircle2,
  XCircle,
  Calendar,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export const Onboarding: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [verifyModalTask, setVerifyModalTask] = useState<any | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('Verified');
  const [successMessage, setSuccessMessage] = useState('');

  // Create Task Form
  const [form, setForm] = useState({
    candidateId: '',
    category: 'Document',
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    documentUrl: '',
  });

  const fetchData = async () => {
    try {
      const [tasksRes, candRes] = await Promise.all([
        apiClient.onboarding.getOnboardingTasks(),
        apiClient.candidates.getCandidates(),
      ]);
      if (tasksRes.data.success) setTasks(tasksRes.data.data);
      if (candRes.data.success) setCandidates(candRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTask = async () => {
    try {
      if (!form.candidateId || !form.title) {
        alert('Candidate and Task Title are required.');
        return;
      }
      const res = await apiClient.onboarding.createOnboardingTask(form);
      if (res.data.success) {
        setSuccessMessage('Onboarding task added successfully!');
        setOpenCreate(false);
        fetchData();
        setForm({
          candidateId: '',
          category: 'Document',
          title: '',
          description: '',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          documentUrl: '',
        });
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleVerifyTask = async () => {
    if (!verifyModalTask) return;
    try {
      const res = await apiClient.onboarding.verifyOnboardingTask(verifyModalTask.id, {
        status: verificationStatus,
        verificationNotes,
      });
      if (res.data.success) {
        setSuccessMessage(`Task updated to ${verificationStatus}`);
        setVerifyModalTask(null);
        fetchData();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to verify task');
    }
  };

  const categoryFilters = ['ALL', 'Document', 'I9_EVerify', 'BGV', 'DrugTest', 'Equipment'];
  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 0) return true;
    return t.category === categoryFilters[activeTab];
  });

  // Metrics
  const totalTasks = tasks.length;
  const verifiedCount = tasks.filter((t) => t.status === 'Verified').length;
  const inProgressCount = tasks.filter((t) => t.status === 'InProgress').length;
  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
  const overdueCount = tasks.filter(
    (t) => t.status !== 'Verified' && t.dueDate && new Date(t.dueDate) < new Date()
  ).length;
  const completionPercentage = totalTasks > 0 ? Math.round((verifiedCount / totalTasks) * 100) : 0;

  const getCategoryChip = (category: string) => {
    switch (category) {
      case 'I9_EVerify':
        return <Chip label="I-9 / E-Verify" size="small" sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 600 }} />;
      case 'BGV':
        return <Chip label="7-Yr BGV" size="small" sx={{ bgcolor: '#fdf2f8', color: '#be185d', fontWeight: 600 }} />;
      case 'DrugTest':
        return <Chip label="Drug Screen" size="small" sx={{ bgcolor: '#faf5ff', color: '#7e22ce', fontWeight: 600 }} />;
      case 'Equipment':
        return <Chip label="Equipment" size="small" sx={{ bgcolor: '#fff7ed', color: '#c2410c', fontWeight: 600 }} />;
      default:
        return <Chip label="Tax & Payroll" size="small" sx={{ bgcolor: '#f0fdf4', color: '#15803d', fontWeight: 600 }} />;
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'Verified':
        return <Chip label="Verified / Cleared" color="success" size="small" icon={<CheckCircle2 size={14} />} />;
      case 'InProgress':
        return <Chip label="In Progress" color="info" size="small" icon={<Clock size={14} />} />;
      case 'Rejected':
        return <Chip label="Rejected" color="error" size="small" icon={<XCircle size={14} />} />;
      default:
        return <Chip label="Pending Submission" color="warning" size="small" icon={<Clock size={14} />} />;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Candidate Onboarding & Clearance
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Automate pre-employment verification: Form I-9, E-Verify, 7-year criminal BGV, 10-panel drug test, and laptop provisioning.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setOpenCreate(true)}
          sx={{
            bgcolor: '#1976d2',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 2.5,
            py: 1,
            '&:hover': { bgcolor: '#1565c0' },
          }}
        >
          Add Onboarding Task
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {successMessage}
        </Alert>
      )}

      {/* Progress Bar & KPI Cards */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Overall Pre-Hire Clearance Completion Rate
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#16a34a' }}>
            {completionPercentage}% ({verifiedCount} of {totalTasks} cleared)
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={completionPercentage}
          sx={{ height: 10, borderRadius: 5, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: '#16a34a' } }}
        />
      </Paper>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Pending Collection
                </Typography>
                <Avatar sx={{ bgcolor: '#fffbeb', color: '#d97706', width: 36, height: 36 }}>
                  <Clock size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#d97706' }}>
                {pendingCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Awaiting consultant docs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  In Agency Review
                </Typography>
                <Avatar sx={{ bgcolor: '#eff6ff', color: '#2563eb', width: 36, height: 36 }}>
                  <FileText size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#2563eb' }}>
                {inProgressCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Under compliance audit
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Cleared / Ready for Start
                </Typography>
                <Avatar sx={{ bgcolor: '#f0fdf4', color: '#16a34a', width: 36, height: 36 }}>
                  <ShieldCheck size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#16a34a' }}>
                {verifiedCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                100% compliant items
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Overdue Actions
                </Typography>
                <Avatar sx={{ bgcolor: '#fef2f2', color: '#dc2626', width: 36, height: 36 }}>
                  <AlertCircle size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#dc2626' }}>
                {overdueCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Past target clearance deadline
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Tabs */}
      <Paper sx={{ mb: 2.5, borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`All Tasks (${tasks.length})`} />
          <Tab label="Tax & Payroll (W-4 / Direct Deposit)" />
          <Tab label="I-9 / E-Verify" />
          <Tab label="BGV Verification" />
          <Tab label="10-Panel Drug Screen" />
          <Tab label="Equipment Provisioning" />
        </Tabs>
      </Paper>

      {/* Tasks Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2.5, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Candidate</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Placement / Client</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Task & Description</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Target Due Date</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Verification Notes</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'right' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6, color: '#94a3b8' }}>
                  No onboarding tasks found for this category.
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((t) => {
                const isOverdue = t.status !== 'Verified' && t.dueDate && new Date(t.dueDate) < new Date();
                return (
                  <TableRow key={t.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#e0f2fe', color: '#0369a1', fontSize: 13 }}>
                          {t.candidate?.firstName?.[0] || 'C'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                            {t.candidate?.firstName} {t.candidate?.lastName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {t.candidate?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {t.placement?.clientAccount?.name || 'Assigned Client'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        Start: {t.placement?.startDate ? new Date(t.placement.startDate).toLocaleDateString() : 'Upcoming'}
                      </Typography>
                    </TableCell>
                    <TableCell>{getCategoryChip(t.category)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {t.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', maxWidth: 260 }}>
                        {t.description}
                      </Typography>
                      {t.documentUrl && (
                        <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <FileCheck size={14} color="#16a34a" />
                          <Typography
                            component="a"
                            href={t.documentUrl}
                            target="_blank"
                            rel="noreferrer"
                            variant="caption"
                            sx={{ color: '#1976d2', textDecoration: 'none', fontWeight: 600 }}
                          >
                            View Uploaded Document
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: isOverdue ? '#dc2626' : '#1e293b', fontWeight: isOverdue ? 700 : 400 }}>
                          {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}
                        </Typography>
                        {isOverdue && <Chip label="OVERDUE" size="small" color="error" sx={{ height: 20, fontSize: 10 }} />}
                      </Box>
                    </TableCell>
                    <TableCell>{getStatusChip(t.status)}</TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#475569', fontStyle: t.verificationNotes ? 'normal' : 'italic' }}>
                        {t.verificationNotes || 'No verification notes added yet.'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <Button
                        size="small"
                        variant={t.status === 'Verified' ? 'outlined' : 'contained'}
                        color={t.status === 'Verified' ? 'inherit' : 'primary'}
                        onClick={() => {
                          setVerifyModalTask(t);
                          setVerificationStatus(t.status === 'Verified' ? 'Verified' : 'Verified');
                          setVerificationNotes(t.verificationNotes || 'Verified and approved by HR Compliance team.');
                        }}
                        sx={{ textTransform: 'none', borderRadius: 1.5 }}
                      >
                        {t.status === 'Verified' ? 'Audit' : 'Verify'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CREATE ONBOARDING TASK DIALOG */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#1e293b' }}>
          Assign Pre-Hire Onboarding Requirement
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Select Candidate"
                value={form.candidateId}
                onChange={(e) => setForm({ ...form, candidateId: e.target.value })}
                required
              >
                {candidates.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.email})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Compliance Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <MenuItem value="Document">Tax & Direct Deposit (W-4 / Void Check)</MenuItem>
                <MenuItem value="I9_EVerify">I-9 & E-Verify Photo ID</MenuItem>
                <MenuItem value="BGV">7-Year Criminal & SSN Background Check</MenuItem>
                <MenuItem value="DrugTest">10-Panel Laboratory Drug Screen</MenuItem>
                <MenuItem value="Equipment">Laptop Provisioning & VPN Setup</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Clearance Due Date"
                InputLabelProps={{ shrink: true }}
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                placeholder="e.g. Form I-9 Section 2 In-Person Verification"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Instructions & Requirement Details"
                multiline
                rows={3}
                placeholder="Candidate must provide unexpired List A or List B + List C identity documentation..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Document Template / Upload URL (Optional)"
                placeholder="https://storage.pavion.com/onboarding/i9-form.pdf"
                value={form.documentUrl}
                onChange={(e) => setForm({ ...form, documentUrl: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenCreate(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateTask}
            sx={{ textTransform: 'none', px: 3, bgcolor: '#1976d2' }}
          >
            Assign Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* VERIFY / AUDIT TASK DIALOG */}
      <Dialog
        open={Boolean(verifyModalTask)}
        onClose={() => setVerifyModalTask(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#1e293b' }}>
          Compliance Verification Sign-Off
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2.5, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {verifyModalTask?.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              Candidate: {verifyModalTask?.candidate?.firstName} {verifyModalTask?.candidate?.lastName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Requirement: {verifyModalTask?.description}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Verification Decision"
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value)}
              >
                <MenuItem value="Verified">Verified & Approved (Clear for Start)</MenuItem>
                <MenuItem value="InProgress">In Progress / Under Further Review</MenuItem>
                <MenuItem value="Rejected">Rejected / Resubmission Required</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Compliance Auditor Notes"
                multiline
                rows={3}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Include reference number, check date, or comments..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setVerifyModalTask(null)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleVerifyTask}
            sx={{ textTransform: 'none', px: 3 }}
          >
            Save Verification Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Onboarding;
