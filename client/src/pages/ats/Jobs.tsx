import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  Drawer,
  Divider,
  Tabs,
  Tab,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Briefcase,
  Plus,
  Search,
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  UserCheck,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useSearchParams, useNavigate } from 'react-router-dom';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Open: { bg: '#ECFDF5', text: '#059669' },
  Draft: { bg: '#F1F5F9', text: '#475569' },
  'Pending Approval': { bg: '#FEF3C7', text: '#D97706' },
  Filled: { bg: '#EFF6FF', text: '#1E3A8A' },
  'On Hold': { bg: '#FFF7ED', text: '#C2410C' },
  Closed: { bg: '#FEE2E2', text: '#991B1B' },
};

export const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('');

  // Dialogs & Drawer
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [candidateMatches, setCandidateMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [detailTab, setDetailTab] = useState(0);

  // Form State (8-Section comprehensive spec)
  const [formData, setFormData] = useState({
    accountId: '',
    title: '',
    description: '',
    requiredSkills: '',
    experienceMin: '5',
    experienceMax: '8',
    city: 'Dallas',
    state: 'TX',
    workMode: 'Remote',
    employmentType: 'Contract',
    openings: '1',
    payRateMin: '75',
    payRateMax: '85',
    billRateMin: '110',
    billRateMax: '125',
    priority: 'High',
    duration: '12 Months',
    assignedRecruiterId: '',
  });

  const fetchJobs = async () => {
    try {
      const res = await apiClient.jobs.getJobs({
        search: search || undefined,
        status: statusFilter || undefined,
        workMode: workModeFilter || undefined,
      });
      if (res.data.success) {
        setJobs(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [accRes, userRes] = await Promise.all([
        apiClient.crm.getAccounts(),
        apiClient.settings.getUsers(),
      ]);
      if (accRes.data.success) setAccounts(accRes.data.data);
      if (userRes.data.success) setUsers(userRes.data.data);

      if (accRes.data.data.length > 0 && !formData.accountId) {
        setFormData((prev) => ({ ...prev, accountId: accRes.data.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchDependencies();
    if (searchParams.get('action') === 'new') {
      setOpenCreate(true);
    }
  }, [statusFilter, workModeFilter]);

  const handleOpenJobDetails = async (job: any) => {
    setSelectedJob(job);
    setDetailTab(0);
    try {
      setLoadingMatches(true);
      const res = await apiClient.jobs.getCandidateMatches(job.id);
      if (res.data.success) {
        setCandidateMatches(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleCreateJob = async () => {
    if (!formData.accountId || !formData.title || !formData.description || !formData.requiredSkills) {
      alert('Please fill Client Account, Job Title, Description, and Required Skills');
      return;
    }
    try {
      const res = await apiClient.jobs.createJob(formData);
      if (res.data.success) {
        setOpenCreate(false);
        fetchJobs();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create job');
    }
  };

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Job Requisitions
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Manage client staffing requirements, candidate submittals, bill rates, and recruiter assignments.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setOpenCreate(true)}
          sx={{ bgcolor: '#1E3A8A' }}
        >
          Create Job Requisition
        </Button>
      </Box>

      {/* Filter Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by job title, req code, or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
              InputProps={{
                startAdornment: <Search size={16} color="#64748B" style={{ marginRight: 8 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Job Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="Filled">Filled</MenuItem>
              <MenuItem value="Pending Approval">Pending Approval</MenuItem>
              <MenuItem value="On Hold">On Hold</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Work Mode"
              value={workModeFilter}
              onChange={(e) => setWorkModeFilter(e.target.value)}
            >
              <MenuItem value="">All Modes</MenuItem>
              <MenuItem value="Remote">Remote</MenuItem>
              <MenuItem value="Hybrid">Hybrid</MenuItem>
              <MenuItem value="Onsite">Onsite</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={1}>
            <Button variant="outlined" fullWidth onClick={fetchJobs} sx={{ height: 40 }}>
              Go
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Jobs Table */}
      <Paper sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job Code & Title</TableCell>
                <TableCell>Client Account</TableCell>
                <TableCell>Location / Mode</TableCell>
                <TableCell>Rates (Pay / Bill)</TableCell>
                <TableCell align="center">Openings</TableCell>
                <TableCell>Assigned Recruiter</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => {
                const statusStyle = STATUS_COLORS[job.status] || { bg: '#F1F5F9', text: '#475569' };
                return (
                  <TableRow key={job.id} hover>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#2563EB', letterSpacing: '0.04em' }}>
                        {job.jobCode}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                        {job.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {job.requiredSkills}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Building2 size={14} color="#64748B" />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {job.account?.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MapPin size={13} color="#64748B" />
                        <Typography variant="body2">
                          {job.city}, {job.state}
                        </Typography>
                      </Box>
                      <Chip
                        label={job.workMode}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor: job.workMode === 'Remote' ? '#EFF6FF' : '#F1F5F9',
                          color: job.workMode === 'Remote' ? '#2563EB' : '#475569',
                          mt: 0.5,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#059669' }}>
                        Pay: ${job.payRateMax || job.payRateMin || 0}/hr
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Bill: ${job.billRateMax || job.billRateMin || 0}/hr
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {job.filledPositions} / {job.openings}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        filled
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {job.assignedRecruiter
                          ? `${job.assignedRecruiter.firstName} ${job.assignedRecruiter.lastName}`
                          : 'Unassigned'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={job.status}
                        size="small"
                        sx={{ bgcolor: statusStyle.bg, color: statusStyle.text, fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenJobDetails(job)}
                        sx={{ mr: 1, py: 0.4 }}
                      >
                        Matches
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => navigate(`/ats/pipeline?jobId=${job.id}`)}
                        sx={{ bgcolor: '#1E3A8A', py: 0.4 }}
                      >
                        Pipeline
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Job Details & Candidate Matching Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 540 }, p: 3 } }}
      >
        {selectedJob && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 800 }}>
                  {selectedJob.jobCode}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                  {selectedJob.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Client: {selectedJob.account?.name} • Duration: {selectedJob.duration || '6 Months'}
                </Typography>
              </Box>
              <Chip label={selectedJob.status} color="success" size="small" sx={{ fontWeight: 700 }} />
            </Box>

            <Tabs value={detailTab} onChange={(e, val) => setDetailTab(val)} sx={{ mt: 2, mb: 2, borderBottom: '1px solid #E2E8F0' }}>
              <Tab label="Candidate Matches" />
              <Tab label="Requisition Specs" />
            </Tabs>

            {detailTab === 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Sparkles size={16} color="#2563EB" /> AI & Skill Matches
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Ranked by technical skill overlap
                  </Typography>
                </Box>

                {loadingMatches ? (
                  <LinearProgress sx={{ my: 3 }} />
                ) : candidateMatches.length === 0 ? (
                  <Typography variant="body2" sx={{ color: '#64748B', py: 3, textAlign: 'center' }}>
                    No matching candidates found in database.
                  </Typography>
                ) : (
                  candidateMatches.map((c) => (
                    <Box
                      key={c.id}
                      sx={{
                        p: 2,
                        mb: 1.5,
                        borderRadius: 2,
                        border: '1px solid #E2E8F0',
                        bgcolor: '#FFFFFF',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                            {c.firstName} {c.lastName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                            {c.currentTitle} • {c.totalExperience} yrs exp • {c.city}, {c.state}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${c.matchScore}% Match`}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            bgcolor: c.matchScore >= 80 ? '#ECFDF5' : '#EFF6FF',
                            color: c.matchScore >= 80 ? '#059669' : '#1E3A8A',
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600, display: 'block', mt: 1 }}>
                        Skills: {c.skills}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5, gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={async () => {
                            try {
                              await apiClient.pipeline.associateCandidateToJob(selectedJob.id, {
                                candidateId: c.id,
                              });
                              alert(`Associated ${c.firstName} to ${selectedJob.jobCode}`);
                              navigate(`/ats/pipeline?jobId=${selectedJob.id}`);
                            } catch (err: any) {
                              alert(err.response?.data?.message || 'Failed to map candidate');
                            }
                          }}
                          sx={{ bgcolor: '#1E3A8A', fontSize: '0.75rem', py: 0.3 }}
                        >
                          Map to Pipeline
                        </Button>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            )}

            {detailTab === 1 && (
              <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Required Skills:
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: '#334155' }}>
                  {selectedJob.requiredSkills}
                </Typography>

                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Full Job Description:
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#475569', mb: 2 }}>
                  {selectedJob.description}
                </Typography>

                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Compensation & Terms:
                </Typography>
                <Typography variant="body2">
                  <strong>Pay Rate:</strong> ${selectedJob.payRateMin} - ${selectedJob.payRateMax} /hr (W2/C2C)
                </Typography>
                <Typography variant="body2">
                  <strong>Bill Rate:</strong> ${selectedJob.billRateMin} - ${selectedJob.billRateMax} /hr
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Drawer>

      {/* 8-Section Create Job Requisition Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #E2E8F0' }}>
          Create Job Requisition (US Staffing Spec)
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Section 1 & 2: Client & Basic Info */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Client Account *"
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              >
                {accounts.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name} ({a.accountType})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Position Title *"
                placeholder="Senior Full Stack Java Engineer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>

            {/* Section 4: Skills & Experience */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Required Skills (Comma separated) *"
                placeholder="Java, Spring Boot, React, AWS, PostgreSQL, Microservices"
                value={formData.requiredSkills}
                onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Min Exp (Years)"
                value={formData.experienceMin}
                onChange={(e) => setFormData({ ...formData, experienceMin: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Max Exp (Years)"
                value={formData.experienceMax}
                onChange={(e) => setFormData({ ...formData, experienceMax: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                label="Work Mode"
                value={formData.workMode}
                onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
              >
                <MenuItem value="Remote">Remote</MenuItem>
                <MenuItem value="Hybrid">Hybrid</MenuItem>
                <MenuItem value="Onsite">Onsite</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                label="Employment Type"
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
              >
                <MenuItem value="Contract">Contract (W2 / C2C)</MenuItem>
                <MenuItem value="Full-time">Full-time Direct Hire</MenuItem>
                <MenuItem value="Contract-to-hire">Contract-to-hire</MenuItem>
              </TextField>
            </Grid>

            {/* Section 6: Compensation Rates */}
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Pay Rate Min ($/hr)"
                value={formData.payRateMin}
                onChange={(e) => setFormData({ ...formData, payRateMin: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Pay Rate Max ($/hr)"
                value={formData.payRateMax}
                onChange={(e) => setFormData({ ...formData, payRateMax: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Bill Rate Min ($/hr)"
                value={formData.billRateMin}
                onChange={(e) => setFormData({ ...formData, billRateMin: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Bill Rate Max ($/hr)"
                value={formData.billRateMax}
                onChange={(e) => setFormData({ ...formData, billRateMax: e.target.value })}
              />
            </Grid>

            {/* Section 7: Recruiter & Location */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Location City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Openings"
                value={formData.openings}
                onChange={(e) => setFormData({ ...formData, openings: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                label="Assigned Recruiter"
                value={formData.assignedRecruiterId}
                onChange={(e) => setFormData({ ...formData, assignedRecruiterId: e.target.value })}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} ({u.role})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Section 3: Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Detailed Job Description & Requirements *"
                placeholder="Paste client job description here..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E2E8F0' }}>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateJob} sx={{ bgcolor: '#1E3A8A' }}>
            Publish & Open Requisition
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
