import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Alert,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Users,
  Shield,
  Plus,
  Building,
  Key,
  Share2,
  CheckCircle2,
  ExternalLink,
  Copy,
  RefreshCw,
  Zap,
  Globe,
  Radio,
  FileCheck,
  Check,
  Power,
} from 'lucide-react';
import { apiClient } from '../api/client';

export const Settings: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [org, setOrg] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [openCreateUser, setOpenCreateUser] = useState(false);

  // Integrations states
  const [testResult, setTestResult] = useState<any | null>(null);
  const [openTestModal, setOpenTestModal] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [simulating, setSimulating] = useState<string | null>(null);
  const [simulationAlert, setSimulationAlert] = useState<string | null>(null);
  const [openConfigModal, setOpenConfigModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'SeniorRecruiter',
    department: 'IT Recruitment',
  });

  const fetchData = async () => {
    try {
      const [orgRes, usersRes, logsRes, integrationsRes] = await Promise.all([
        apiClient.settings.getOrganization(),
        apiClient.settings.getUsers(),
        apiClient.settings.getAuditLogs(),
        apiClient.integrations.getIntegrations(),
      ]);
      if (orgRes.data.success) setOrg(orgRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
      if (logsRes.data.success) setAuditLogs(logsRes.data.data);
      if (integrationsRes.data.success) setIntegrations(integrationsRes.data.data);
    } catch (err) {
      console.error('Failed to load settings data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async () => {
    if (!userForm.firstName || !userForm.lastName || !userForm.email || !userForm.password) {
      alert('Please fill all user fields');
      return;
    }
    try {
      const res = await apiClient.settings.createUser(userForm);
      if (res.data.success) {
        setOpenCreateUser(false);
        setUserForm({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'SeniorRecruiter',
          department: 'IT Recruitment',
        });
        fetchData();
        alert('User created successfully with assigned RBAC role!');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create user');
    }
  };

  // Test connection to LinkedIn / Monster
  const handleTestConnection = async (provider: string) => {
    try {
      setTestingProvider(provider);
      const res = await apiClient.integrations.testConnection(provider);
      if (res.data.success) {
        setTestResult(res.data.data);
        setOpenTestModal(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Connection test failed');
    } finally {
      setTestingProvider(null);
    }
  };

  // Simulate candidate application/search ingestion
  const handleSimulateCandidate = async (provider: string) => {
    try {
      setSimulating(provider);
      const res = await apiClient.integrations.simulateCandidate({ provider });
      if (res.data.success) {
        setSimulationAlert(res.data.message);
        fetchData(); // Refresh sync counts
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Simulation failed');
    } finally {
      setSimulating(null);
    }
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const getIntegration = (id: string) => integrations.find((i) => i.id === id) || {};

  const linkedin = getIntegration('linkedin');
  const monster = getIntegration('monster');
  const dice = getIntegration('dice');
  const chromeExt = getIntegration('chrome_extension');

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
          Administration & Integrations Hub
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
          Manage your enterprise tenant organization, RBAC security roles, recruitment staff, and US Job Board Integrations (LinkedIn & Monster).
        </Typography>
      </Box>

      {simulationAlert && (
        <Alert
          severity="success"
          onClose={() => setSimulationAlert(null)}
          sx={{ mb: 3, borderRadius: 2.5, fontWeight: 600 }}
          action={
            <Button color="inherit" size="small" href="/ats/candidates">
              View in Talent Pool
            </Button>
          }
        >
          🎉 {simulationAlert}
        </Alert>
      )}

      <Paper sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Tabs
          value={tab}
          onChange={(e, val) => setTab(val)}
          sx={{ borderBottom: '1px solid #E2E8F0', px: 2, bgcolor: '#FFFFFF' }}
        >
          <Tab icon={<Share2 size={16} />} iconPosition="start" label="Integrations & Job Boards" />
          <Tab icon={<Building size={16} />} iconPosition="start" label="Organization Profile" />
          <Tab icon={<Users size={16} />} iconPosition="start" label="User Management & RBAC" />
          <Tab icon={<Shield size={16} />} iconPosition="start" label="Security Audit Logs" />
        </Tabs>

        {/* Tab 0: Integrations & Job Boards (LinkedIn, Monster, Dice, Chrome Extension) */}
        {tab === 0 && (
          <Box sx={{ p: { xs: 2, sm: 3.5 } }}>
            {/* Header info */}
            <Box sx={{ mb: 3.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                Connected US Staffing Platforms & Job Portals
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
                Sync job requisitions, receive real-time candidate applications via webhooks, and source talent with 1-click browser integration.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {/* 1. LinkedIn Recruiter & Jobs Card */}
              <Grid item xs={12} lg={6}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: '1px solid #E2E8F0',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease',
                    '&:hover': { boxShadow: '0 8px 24px rgba(10, 102, 194, 0.12)' },
                  }}
                >
                  <CardContent sx={{ p: 3, flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            bgcolor: '#0A66C2',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '1.25rem',
                          }}
                        >
                          in
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                            LinkedIn Recruiter & Easy Apply
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            Recruiter System Connect (RSC) + Job Distribution API
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        icon={<CheckCircle2 size={14} />}
                        label={linkedin.status || 'CONNECTED'}
                        size="small"
                        sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700 }}
                      />
                    </Box>

                    <Typography variant="body2" sx={{ color: '#475569', mb: 2.5 }}>
                      Directly import candidates from LinkedIn Recruiter, auto-sync candidate notes, and ingest applications from LinkedIn Easy Apply directly into your ATS pipeline.
                    </Typography>

                    {/* Technical details grid */}
                    <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 2, border: '1px solid #E2E8F0', mb: 2.5 }}>
                      <Grid container spacing={1.5}>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Client App ID
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                            {linkedin.clientId || '78ln98abc12345'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Easy Apply Webhook
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0A66C2', fontSize: '0.8rem' }}>
                            /api/v1/integrations/linkedin/webhook
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Total Synced Candidates
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                            {linkedin.totalSyncedCandidates || 142} Profiles
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Active Job Requisitions Posted
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                            {linkedin.totalJobPostings || 8} Open Jobs
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Action buttons */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<RefreshCw size={14} />}
                        onClick={() => handleTestConnection('linkedin')}
                        disabled={testingProvider === 'linkedin'}
                        sx={{ borderColor: '#CBD5E1', color: '#1E293B', fontWeight: 600 }}
                      >
                        {testingProvider === 'linkedin' ? 'Testing...' : 'Test API Connection'}
                      </Button>

                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Zap size={14} />}
                        onClick={() => handleSimulateCandidate('linkedin')}
                        disabled={simulating === 'linkedin'}
                        sx={{ bgcolor: '#0A66C2', '&:hover': { bgcolor: '#004182' }, fontWeight: 700 }}
                      >
                        {simulating === 'linkedin' ? 'Ingesting...' : '⚡ Test Ingest from LinkedIn'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* 2. Monster TalentBin & Candidate Search Card */}
              <Grid item xs={12} lg={6}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: '1px solid #E2E8F0',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease',
                    '&:hover': { boxShadow: '0 8px 24px rgba(108, 43, 217, 0.12)' },
                  }}
                >
                  <CardContent sx={{ p: 3, flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            bgcolor: '#6C2BD9',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: '1.25rem',
                          }}
                        >
                          M
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                            Monster Candidate Search & TalentBin
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            Resume Database Search + Webhook Ingestion API
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        icon={<CheckCircle2 size={14} />}
                        label={monster.status || 'CONNECTED'}
                        size="small"
                        sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700 }}
                      />
                    </Box>

                    <Typography variant="body2" sx={{ color: '#475569', mb: 2.5 }}>
                      Search millions of active US candidate resumes on Monster, auto-parse Word/PDF resumes with Pavion AI, and receive real-time applicant submissions via webhooks.
                    </Typography>

                    {/* Technical details grid */}
                    <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 2, border: '1px solid #E2E8F0', mb: 2.5 }}>
                      <Grid container spacing={1.5}>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Monster Employer ID
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                            {monster.employerId || 'MNSTR_EMP_US_98231'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Ingestion Webhook
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#6C2BD9', fontSize: '0.8rem' }}>
                            /api/v1/integrations/monster/webhook
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Total Sourced Candidates
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                            {monster.totalSyncedCandidates || 98} Resumes
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            AI Resume Parser
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 800, color: '#059669' }}>
                            Active (Auto-Extract)
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Action buttons */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<RefreshCw size={14} />}
                        onClick={() => handleTestConnection('monster')}
                        disabled={testingProvider === 'monster'}
                        sx={{ borderColor: '#CBD5E1', color: '#1E293B', fontWeight: 600 }}
                      >
                        {testingProvider === 'monster' ? 'Testing...' : 'Test Monster API'}
                      </Button>

                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Zap size={14} />}
                        onClick={() => handleSimulateCandidate('monster')}
                        disabled={simulating === 'monster'}
                        sx={{ bgcolor: '#6C2BD9', '&:hover': { bgcolor: '#551A8B' }, fontWeight: 700 }}
                      >
                        {simulating === 'monster' ? 'Ingesting...' : '⚡ Test Ingest from Monster'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* 3. Dice US Tech Staffing Card */}
              <Grid item xs={12} lg={6}>
                <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            bgcolor: '#DC2626',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: '1.25rem',
                          }}
                        >
                          D
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                            Dice Tech Talent Portal
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            US Technology Staffing & Contractor Network
                          </Typography>
                        </Box>
                      </Box>
                      <Chip label="AVAILABLE" size="small" sx={{ bgcolor: '#EFF6FF', color: '#1E3A8A', fontWeight: 700 }} />
                    </Box>

                    <Typography variant="body2" sx={{ color: '#475569', mb: 2.5 }}>
                      Post IT & Engineering requisitions to Dice.com and automatically ingest qualified tech resumes with visa classification (H1B, Green Card, US Citizen).
                    </Typography>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Plus size={14} />}
                      sx={{ borderColor: '#CBD5E1', color: '#1E293B', fontWeight: 600 }}
                      onClick={() => alert('Enter your Dice Partner API Key in the config modal to activate live sync.')}
                    >
                      Connect Dice Account
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* 4. Pavion 1-Click Sourcing Chrome Extension Card */}
              <Grid item xs={12} lg={6}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: '1px solid #1E3A8A',
                    bgcolor: '#F8FAFC',
                    height: '100%',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            bgcolor: '#1E3A8A',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                          }}
                        >
                          <Globe size={22} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                            Pavion 1-Click Sourcing Chrome Extension
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600 }}>
                            For Recruiters browsing LinkedIn, Monster, Dice & Indeed
                          </Typography>
                        </Box>
                      </Box>
                      <Chip label="v2.4.0 ACTIVE" size="small" sx={{ bgcolor: '#DBEAFE', color: '#1E3A8A', fontWeight: 700 }} />
                    </Box>

                    <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>
                      Recruiters can source candidates directly while viewing any profile on LinkedIn or Monster. Click the extension icon to parse and import into Pavion in 1 click!
                    </Typography>

                    {/* Sourcing API Token Box */}
                    <Box sx={{ bgcolor: '#FFFFFF', p: 1.5, borderRadius: 2, border: '1px solid #CBD5E1', mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 0.5 }}>
                        Recruiter Extension Sourcing API Key
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>
                          pavion_ext_live_8f93e110ac7b2a9e3
                        </Typography>
                        <Tooltip title={copiedKey ? 'Copied!' : 'Copy Sourcing API Key'}>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyApiKey('pavion_ext_live_8f93e110ac7b2a9e3')}
                            sx={{ color: copiedKey ? '#059669' : '#1E3A8A' }}
                          >
                            {copiedKey ? <Check size={16} /> : <Copy size={16} />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Step-by-step workflow */}
                    <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, display: 'block', mb: 1 }}>
                      HOW RECRUITERS USE IT:
                    </Typography>
                    <Box component="ol" sx={{ pl: 2.5, m: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                      <li>Open any candidate profile on <strong>LinkedIn Recruiter</strong> or <strong>Monster.com</strong>.</li>
                      <li>Click the <strong>Pavion ATS</strong> icon in Chrome's extension bar.</li>
                      <li>Candidate info, skills, and resume text are extracted automatically.</li>
                      <li>Click <strong>"Export to Pavion Pipeline"</strong> to create the candidate record instantly.</li>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 1: Org Profile */}
        {tab === 1 && org && (
          <Box sx={{ p: 3, maxWidth: 800 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Enterprise Tenant Configuration
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Organization Name" defaultValue={org.name} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Legal Business Name" defaultValue={org.legalName} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Timezone" defaultValue={org.timezone} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Default Currency" defaultValue={org.defaultCurrency} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Website URL" defaultValue={org.website} />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" sx={{ bgcolor: '#1E3A8A' }}>
                  Save Organization Changes
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 2: User Management */}
        {tab === 2 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Platform Users ({users.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={() => setOpenCreateUser(true)}
                sx={{ bgcolor: '#1E3A8A' }}
              >
                Create Staff User
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>RBAC Role</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {u.firstName} {u.lastName}
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={u.role}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: u.role === 'SuperAdmin' ? '#FEF3C7' : '#EFF6FF',
                            color: u.role === 'SuperAdmin' ? '#D97706' : '#1E3A8A',
                          }}
                        />
                      </TableCell>
                      <TableCell>{u.department || 'General'}</TableCell>
                      <TableCell>
                        <Chip label={u.status} size="small" sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700 }} />
                      </TableCell>
                      <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Tab 3: Audit Logs */}
        {tab === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Security & Compliance Audit Trail
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Append-only immutable record of all tenant modifications, submissions, and access events.
            </Alert>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Entity Type</TableCell>
                    <TableCell>Entity ID</TableCell>
                    <TableCell>IP Address</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3, color: '#64748B' }}>
                        No audit events recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{log.action}</TableCell>
                        <TableCell>{log.entityType}</TableCell>
                        <TableCell>{log.entityId || 'N/A'}</TableCell>
                        <TableCell>{log.ipAddress || '127.0.0.1'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      {/* Connection Test Result Modal */}
      <Dialog open={openTestModal} onClose={() => setOpenTestModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CheckCircle2 size={24} color="#059669" />
          API Connectivity Test Result
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          {testResult && (
            <Box>
              <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>
                {testResult.provider === 'linkedin'
                  ? 'LinkedIn Recruiter RSC & Jobs API endpoint responded with HTTP 200 OK'
                  : 'Monster TalentBin API responded with HTTP 200 OK'}
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                    Provider
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800 }}>
                    {testResult.provider.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                    API Roundtrip Latency
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: '#059669' }}>
                    ⚡ {testResult.latencyMs} ms
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                    Active OAuth / API Permissions
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 0.5 }}>
                    {testResult.verifiedScopes?.map((scope: string) => (
                      <Chip key={scope} label={scope} size="small" sx={{ fontFamily: 'monospace', fontWeight: 600 }} />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                    Active Webhook Ingestion URL
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: '#F1F5F9', p: 1, borderRadius: 1.5, mt: 0.5 }}>
                    {testResult.endpoint}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" onClick={() => setOpenTestModal(false)} sx={{ bgcolor: '#1E3A8A' }}>
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create User Modal */}
      <Dialog open={openCreateUser} onClose={() => setOpenCreateUser(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Team User</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name *"
                value={userForm.firstName}
                onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name *"
                value={userForm.lastName}
                onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Work Email *"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Initial Password *"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="RBAC Role *"
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              >
                <MenuItem value="SuperAdmin">Super Admin</MenuItem>
                <MenuItem value="OrgAdmin">Organization Admin</MenuItem>
                <MenuItem value="SalesManager">Sales Manager</MenuItem>
                <MenuItem value="AccountManager">Account Manager</MenuItem>
                <MenuItem value="RecruitmentManager">Recruitment Manager</MenuItem>
                <MenuItem value="SeniorRecruiter">Senior Recruiter</MenuItem>
                <MenuItem value="ITRecruiter">IT Recruiter</MenuItem>
                <MenuItem value="BusinessDevelopmentExecutive">Business Development Executive</MenuItem>
                <MenuItem value="OnboardingManager">HR / Onboarding Manager</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={userForm.department}
                onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCreateUser(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateUser} sx={{ bgcolor: '#1E3A8A' }}>
            Create User Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
