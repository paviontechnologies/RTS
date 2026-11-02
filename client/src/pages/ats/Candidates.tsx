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
  Alert,
  IconButton,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  UserCheck,
  Plus,
  Search,
  Upload,
  FileText,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Share2,
  Zap,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useSearchParams } from 'react-router-dom';

export const Candidates: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);
  const [importingProvider, setImportingProvider] = useState<string | null>(null);
  const [importToast, setImportToast] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [profileTab, setProfileTab] = useState(0);

  // Resume Upload & Parser state
  const [parsing, setParsing] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const handleSimulateImport = async (provider: string) => {
    try {
      setImportingProvider(provider);
      const res = await apiClient.integrations.simulateCandidate({ provider });
      if (res.data.success) {
        setImportToast(res.data.message);
        setOpenImportModal(false);
        fetchCandidates();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to import candidate');
    } finally {
      setImportingProvider(null);
    }
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: 'Dallas',
    state: 'TX',
    currentTitle: '',
    currentEmployer: '',
    totalExperience: '5',
    relevantExperience: '5',
    skills: '',
    professionalSummary: '',
    education: '',
    certifications: '',
    availability: 'Immediate',
    expectedPayRate: '75',
    preferredType: 'Contract',
    workAuthorization: 'US Citizen',
  });

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await apiClient.candidates.getCandidates({
        search: search || undefined,
        skill: skillFilter || undefined,
      });
      if (res.data.success) {
        setCandidates(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
    if (searchParams.get('action') === 'new') {
      setOpenCreate(true);
    }
  }, [skillFilter]);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setParsing(true);
      const data = new FormData();
      data.append('resume', file);

      const res = await apiClient.candidates.uploadResume(data);
      if (res.data.success) {
        const p = res.data.data;
        setFormData((prev) => ({
          ...prev,
          firstName: p.firstName || prev.firstName,
          lastName: p.lastName || prev.lastName,
          email: p.email || prev.email,
          phone: p.phone || prev.phone,
          city: p.city || prev.city,
          state: p.state || prev.state,
          currentTitle: p.currentTitle || prev.currentTitle,
          currentEmployer: p.currentEmployer || prev.currentEmployer,
          totalExperience: String(p.totalExperience || prev.totalExperience),
          skills: Array.isArray(p.skills) ? p.skills.join(', ') : p.skills,
          education: p.education || prev.education,
          professionalSummary: p.professionalSummary || prev.professionalSummary,
          workAuthorization: p.workAuthorization || prev.workAuthorization,
        }));

        // Trigger duplicate check on parsed email
        if (p.email) {
          checkDuplicateEmail(p.email);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to parse resume');
    } finally {
      setParsing(false);
    }
  };

  const checkDuplicateEmail = async (email: string) => {
    if (!email) return;
    try {
      const res = await apiClient.candidates.checkDuplicate({ email });
      if (res.data.hasDuplicate) {
        const match = res.data.matches[0]?.candidate;
        setDuplicateWarning(
          `Candidate already exists with this email: ${match.firstName} ${match.lastName} (${match.candidateCode}).`
        );
      } else {
        setDuplicateWarning(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert('First Name, Last Name, and Email are required');
      return;
    }
    try {
      const res = await apiClient.candidates.createCandidate(formData);
      if (res.data.success) {
        setOpenCreate(false);
        setDuplicateWarning(null);
        fetchCandidates();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save candidate');
    }
  };

  const handleViewProfile = async (id: string) => {
    try {
      const res = await apiClient.candidates.getCandidateById(id);
      if (res.data.success) {
        setSelectedCandidate(res.data.data);
        setProfileTab(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Candidate Talent Pool
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Centralized candidate database with automatic resume parser, duplicate protection, and US work authorizations.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<Share2 size={16} />}
            onClick={() => setOpenImportModal(true)}
            sx={{ borderColor: '#CBD5E1', color: '#1E293B', fontWeight: 700 }}
          >
            Import from LinkedIn / Monster
          </Button>

          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => {
              setDuplicateWarning(null);
              setOpenCreate(true);
            }}
            sx={{ bgcolor: '#1E3A8A' }}
          >
            Add Candidate
          </Button>
        </Box>
      </Box>

      {importToast && (
        <Alert severity="success" onClose={() => setImportToast(null)} sx={{ mb: 2.5, borderRadius: 2 }}>
          🎉 {importToast}
        </Alert>
      )}

      {/* Filter Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by candidate name, current title, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchCandidates()}
              InputProps={{
                startAdornment: <Search size={16} color="#64748B" style={{ marginRight: 8 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Filter by skill (e.g. Java, React, AWS, Python)..."
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchCandidates()}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button variant="outlined" fullWidth onClick={fetchCandidates} sx={{ height: 40 }}>
              Filter
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Candidates Table */}
      <Paper sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Candidate Code & Name</TableCell>
                <TableCell>Current Role & Employer</TableCell>
                <TableCell>Core Skills</TableCell>
                <TableCell align="center">Experience</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Work Authorization</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#2563EB', letterSpacing: '0.04em' }}>
                      {c.candidateCode}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      {c.firstName} {c.lastName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Mail size={12} /> {c.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {c.currentTitle || 'Software Professional'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      {c.currentEmployer || 'Available'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 280 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(c.skills || '')
                        .split(/[,;|]/)
                        .slice(0, 3)
                        .map((s: string, idx: number) => (
                          <Chip key={idx} label={s.trim()} size="small" sx={{ height: 20, fontSize: '0.675rem', bgcolor: '#F1F5F9' }} />
                        ))}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {c.totalExperience} yrs
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MapPin size={13} color="#64748B" /> {c.city}, {c.state}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={c.workAuthorization}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        bgcolor: c.workAuthorization === 'US Citizen' ? '#ECFDF5' : '#EFF6FF',
                        color: c.workAuthorization === 'US Citizen' ? '#059669' : '#1E3A8A',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={c.status}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: c.status === 'Placed' ? '#DBEAFE' : '#ECFDF5',
                        color: c.status === 'Placed' ? '#1E3A8A' : '#059669',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleViewProfile(c.id)}
                      sx={{ py: 0.4, textTransform: 'none', fontWeight: 600 }}
                    >
                      Full Profile
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Candidate Profile Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedCandidate)}
        onClose={() => setSelectedCandidate(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 540 }, p: 3 } }}
      >
        {selectedCandidate && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 800 }}>
                  {selectedCandidate.candidateCode}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                  {selectedCandidate.firstName} {selectedCandidate.lastName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  {selectedCandidate.currentTitle} • {selectedCandidate.totalExperience} Years Exp
                </Typography>
              </Box>
              <Chip label={selectedCandidate.workAuthorization} color="primary" size="small" sx={{ fontWeight: 700 }} />
            </Box>

            <Tabs value={profileTab} onChange={(e, val) => setProfileTab(val)} sx={{ mt: 2, mb: 2, borderBottom: '1px solid #E2E8F0' }}>
              <Tab label="Overview" />
              <Tab label="Applications" />
              <Tab label="Submissions" />
            </Tabs>

            {profileTab === 0 && (
              <Box>
                <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 2, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Contact & Location:
                  </Typography>
                  <Typography variant="body2"><strong>Email:</strong> {selectedCandidate.email}</Typography>
                  <Typography variant="body2"><strong>Phone:</strong> {selectedCandidate.phone || 'N/A'}</Typography>
                  <Typography variant="body2"><strong>Location:</strong> {selectedCandidate.city}, {selectedCandidate.state}</Typography>
                  <Typography variant="body2"><strong>Expected Pay:</strong> ${selectedCandidate.expectedPayRate}/hr</Typography>
                </Box>

                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Technical Skills:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 2 }}>
                  {(selectedCandidate.skills || '').split(/[,;|]/).map((s: string, idx: number) => (
                    <Chip key={idx} label={s.trim()} size="small" sx={{ bgcolor: '#EFF6FF', color: '#1E3A8A', fontWeight: 600 }} />
                  ))}
                </Box>

                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Professional Summary:
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', bgcolor: '#F8FAFC', p: 2, borderRadius: 2 }}>
                  {selectedCandidate.professionalSummary || 'No summary entered.'}
                </Typography>
              </Box>
            )}

            {profileTab === 1 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                  Associated Job Requisitions ({selectedCandidate.candidateJobs?.length || 0})
                </Typography>
                {selectedCandidate.candidateJobs?.map((cj: any) => (
                  <Box key={cj.id} sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: 2, mb: 1.5, bgcolor: '#FFFFFF' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E3A8A' }}>
                      {cj.job?.jobCode}: {cj.job?.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1 }}>
                      Client: {cj.job?.account?.name}
                    </Typography>
                    <Chip label={`Stage: ${cj.currentStage}`} size="small" sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700 }} />
                  </Box>
                ))}
              </Box>
            )}

            {profileTab === 2 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                  Client Submissions History ({selectedCandidate.submissions?.length || 0})
                </Typography>
                {selectedCandidate.submissions?.map((sub: any) => (
                  <Box key={sub.id} sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: 2, mb: 1.5, bgcolor: '#FFFFFF' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Submitted to {sub.clientAccount?.name} for {sub.job?.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#059669', fontWeight: 700, my: 0.5 }}>
                      Pay: ${sub.payRate}/hr • Bill: ${sub.billRate}/hr (Margin: ${(sub.billRate - sub.payRate).toFixed(2)}/hr)
                    </Typography>
                    <Chip label={sub.status} size="small" color="primary" sx={{ fontWeight: 700 }} />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Drawer>

      {/* Add Candidate Dialog with Resume Parser & Duplicate Detector */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #E2E8F0' }}>
          Add Candidate Profile & Resume
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {/* Resume Upload & Instant Parser Card */}
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 3,
              bgcolor: '#F8FAFC',
              border: '2px dashed #CBD5E1',
              textAlign: 'center',
            }}
          >
            <Upload size={28} color="#2563EB" style={{ margin: '0 auto 8px' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
              Upload Resume (PDF, DOCX, TXT)
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1.5 }}>
              Automatic AI extraction: candidate name, email, phone, skills, experience, and title will auto-fill below.
            </Typography>
            <Button
              variant="outlined"
              component="label"
              size="small"
              startIcon={<FileText size={16} />}
              sx={{ bgcolor: '#FFFFFF' }}
            >
              Choose Resume File
              <input type="file" hidden accept=".pdf,.docx,.doc,.txt" onChange={handleResumeUpload} />
            </Button>
            {parsing && <LinearProgress sx={{ mt: 2, borderRadius: 1 }} />}
          </Paper>

          {/* Duplicate Candidate Warning */}
          {duplicateWarning && (
            <Alert severity="warning" icon={<AlertTriangle size={20} />} sx={{ mb: 2 }}>
              <strong>Duplicate Record Warning:</strong> {duplicateWarning}
            </Alert>
          )}

          {/* Candidate Form */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name *"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name *"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address *"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  checkDuplicateEmail(e.target.value);
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                placeholder="(555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Job Title"
                placeholder="Senior Java Cloud Engineer"
                value={formData.currentTitle}
                onChange={(e) => setFormData({ ...formData, currentTitle: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Employer / Client"
                value={formData.currentEmployer}
                onChange={(e) => setFormData({ ...formData, currentEmployer: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Technical Skills (Comma separated) *"
                placeholder="Java, Spring Boot, React, AWS, Docker, Kubernetes"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Total Exp (Yrs)"
                value={formData.totalExperience}
                onChange={(e) => setFormData({ ...formData, totalExperience: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Expected Pay ($/hr)"
                value={formData.expectedPayRate}
                onChange={(e) => setFormData({ ...formData, expectedPayRate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                label="Work Authorization"
                value={formData.workAuthorization}
                onChange={(e) => setFormData({ ...formData, workAuthorization: e.target.value })}
              >
                <MenuItem value="US Citizen">US Citizen</MenuItem>
                <MenuItem value="Green Card">Green Card</MenuItem>
                <MenuItem value="H-1B Visa">H-1B Visa</MenuItem>
                <MenuItem value="OPT / CPT">OPT / CPT</MenuItem>
                <MenuItem value="TN Visa">TN Visa</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                label="Availability"
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              >
                <MenuItem value="Immediate">Immediate</MenuItem>
                <MenuItem value="1 Week">1 Week</MenuItem>
                <MenuItem value="2 Weeks">2 Weeks Notice</MenuItem>
                <MenuItem value="1 Month">1 Month</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Professional Summary"
                value={formData.professionalSummary}
                onChange={(e) => setFormData({ ...formData, professionalSummary: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E2E8F0' }}>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} sx={{ bgcolor: '#1E3A8A' }}>
            Save Candidate Profile
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quick Import from LinkedIn / Monster Dialog */}
      <Dialog open={openImportModal} onClose={() => setOpenImportModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Share2 size={22} color="#1E3A8A" />
          Import Candidate from Job Boards
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
            Connect with external US staffing platforms to ingest candidates directly into your ATS pipeline without manual data entry.
          </Typography>

          <Grid container spacing={2}>
            {/* LinkedIn 1-Click Import Card */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  border: '1px solid #CBD5E1',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  bgcolor: '#F8FAFC',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: '#0A66C2',
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                    }}
                  >
                    in
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      LinkedIn Recruiter (Easy Apply)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Sample: Priya Patel (Cloud Solutions Architect - AWS/K8s)
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Zap size={14} />}
                  onClick={() => handleSimulateImport('linkedin')}
                  disabled={importingProvider === 'linkedin'}
                  sx={{ bgcolor: '#0A66C2', '&:hover': { bgcolor: '#004182' }, fontWeight: 700 }}
                >
                  {importingProvider === 'linkedin' ? 'Importing...' : '1-Click Ingest'}
                </Button>
              </Paper>
            </Grid>

            {/* Monster 1-Click Import Card */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  border: '1px solid #CBD5E1',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  bgcolor: '#F8FAFC',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: '#6C2BD9',
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                    }}
                  >
                    M
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      Monster Candidate Search
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Sample: Brandon Miller (Sr Fullstack Java Spring AWS)
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Zap size={14} />}
                  onClick={() => handleSimulateImport('monster')}
                  disabled={importingProvider === 'monster'}
                  sx={{ bgcolor: '#6C2BD9', '&:hover': { bgcolor: '#551A8B' }, fontWeight: 700 }}
                >
                  {importingProvider === 'monster' ? 'Importing...' : '1-Click Ingest'}
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenImportModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
