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
  AlertTitle,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ShieldAlert,
  Plus,
  ShieldCheck,
  Award,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Calendar,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export const Compliance: React.FC = () => {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any>({ expired: [], expiring30: [], expiring60: [], totalAlerts: 0 });
  const [activeTab, setActiveTab] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [verifyModalCred, setVerifyModalCred] = useState<any | null>(null);
  const [verificationStatus, setVerificationStatus] = useState('Verified');
  const [auditNotes, setAuditNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // New Credential Form
  const [form, setForm] = useState({
    candidateId: '',
    credentialType: 'Certification',
    name: '',
    issuingAuthority: 'Amazon Web Services',
    credentialIdNumber: '',
    state: 'National',
    issueDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    verificationStatus: 'Verified',
    documentUrl: '',
    notes: 'Verified via primary source verification registry.',
  });

  const fetchData = async () => {
    try {
      const [credRes, alertsRes, candRes] = await Promise.all([
        apiClient.compliance.getCredentials(),
        apiClient.compliance.getComplianceAlerts(),
        apiClient.candidates.getCandidates(),
      ]);
      if (credRes.data.success) setCredentials(credRes.data.data);
      if (alertsRes.data.success) setAlerts(alertsRes.data.data);
      if (candRes.data.success) setCandidates(candRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCredential = async () => {
    try {
      if (!form.candidateId || !form.name) {
        alert('Candidate and Credential Name are required.');
        return;
      }
      const res = await apiClient.compliance.createCredential(form);
      if (res.data.success) {
        setSuccessMessage('Credential recorded and added to compliance ledger!');
        setOpenCreate(false);
        fetchData();
        setForm({
          candidateId: '',
          credentialType: 'Certification',
          name: '',
          issuingAuthority: '',
          credentialIdNumber: '',
          state: 'National',
          issueDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          verificationStatus: 'Verified',
          documentUrl: '',
          notes: '',
        });
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add credential');
    }
  };

  const handleVerifyCredential = async () => {
    if (!verifyModalCred) return;
    try {
      const res = await apiClient.compliance.verifyCredential(verifyModalCred.id, {
        verificationStatus,
        notes: auditNotes,
      });
      if (res.data.success) {
        setSuccessMessage(`Credential updated to ${verificationStatus}`);
        setVerifyModalCred(null);
        fetchData();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update credential');
    }
  };

  const typeFilters = ['ALL', 'WorkAuthorization', 'Certification', 'StateLicense', 'Expired'];
  const filteredCredentials = credentials.filter((c) => {
    if (activeTab === 0) return true;
    if (activeTab === 4) {
      return c.expiryDate && new Date(c.expiryDate) < new Date();
    }
    return c.credentialType === typeFilters[activeTab];
  });

  const getExpiryBadge = (expiryDateStr: string | null) => {
    if (!expiryDateStr) {
      return <Chip label="No Expiry" size="small" variant="outlined" />;
    }
    const expiry = new Date(expiryDateStr);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <Chip
          label={`EXPIRED (${Math.abs(diffDays)}d ago)`}
          size="small"
          color="error"
          sx={{ fontWeight: 700 }}
        />
      );
    }
    if (diffDays <= 30) {
      return (
        <Chip
          label={`Expires in ${diffDays}d`}
          size="small"
          color="warning"
          sx={{ fontWeight: 700 }}
        />
      );
    }
    if (diffDays <= 60) {
      return (
        <Chip
          label={`Expires in ${diffDays}d`}
          size="small"
          sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 600 }}
        />
      );
    }
    return (
      <Typography variant="body2" sx={{ color: '#0f172a' }}>
        {expiry.toLocaleDateString()}
      </Typography>
    );
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'Verified':
        return <Chip label="Verified" color="success" size="small" icon={<CheckCircle2 size={14} />} />;
      case 'Expired':
        return <Chip label="Expired" color="error" size="small" icon={<XCircle size={14} />} />;
      case 'Pending':
      default:
        return <Chip label="Pending Audit" color="warning" size="small" icon={<Clock size={14} />} />;
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
            Credential & Compliance Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Audit candidate credentials, visas (H-1B, Green Card), certifications, and trigger renewal notices before roll-offs.
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
          Add Credential
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {successMessage}
        </Alert>
      )}

      {/* Critical Expiration Alerts Banner */}
      {(alerts.expired?.length > 0 || alerts.expiring30?.length > 0) && (
        <Alert
          severity="warning"
          icon={<ShieldAlert size={24} />}
          sx={{ mb: 3, borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        >
          <AlertTitle sx={{ fontWeight: 700 }}>
            Compliance Expiration Warning: {alerts.totalAlerts} items require immediate audit action
          </AlertTitle>
          {alerts.expired?.length > 0 && (
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#b91c1c' }}>
              • {alerts.expired.length} credentials have already EXPIRED. Immediate client removal or renewal is required!
            </Typography>
          )}
          {alerts.expiring30?.length > 0 && (
            <Typography variant="body2" sx={{ color: '#c2410c' }}>
              • {alerts.expiring30.length} credentials will expire in less than 30 days. Candidate outreach initiated.
            </Typography>
          )}
        </Alert>
      )}

      {/* Metrics Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Active Credentials
                </Typography>
                <Avatar sx={{ bgcolor: '#eff6ff', color: '#1976d2', width: 36, height: 36 }}>
                  <BadgeCheck size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
                {credentials.length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Total in compliance registry
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Expired Items
                </Typography>
                <Avatar sx={{ bgcolor: '#fef2f2', color: '#dc2626', width: 36, height: 36 }}>
                  <XCircle size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#dc2626' }}>
                {alerts.expired?.length || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Non-compliant / lapsed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Expiring &lt; 30 Days
                </Typography>
                <Avatar sx={{ bgcolor: '#fffbeb', color: '#d97706', width: 36, height: 36 }}>
                  <AlertTriangle size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#d97706' }}>
                {alerts.expiring30?.length || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Renewal action needed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Expiring in 60 Days
                </Typography>
                <Avatar sx={{ bgcolor: '#f5f3ff', color: '#7c3aed', width: 36, height: 36 }}>
                  <Clock size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#7c3aed' }}>
                {alerts.expiring60?.length || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Advance monitoring pipeline
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
          <Tab label={`All Credentials (${credentials.length})`} />
          <Tab label="Work Authorization / Visas" />
          <Tab label="Cloud & Tech Certifications" />
          <Tab label="Professional State Licenses" />
          <Tab label={`Expired Credentials (${alerts.expired?.length || 0})`} />
        </Tabs>
      </Paper>

      {/* Credentials Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2.5, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Candidate</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Credential / License</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Issuing Authority & ID</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>State</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Issue Date</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Expiry Date / Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Compliance</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'right' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCredentials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} sx={{ textAlign: 'center', py: 6, color: '#94a3b8' }}>
                  No credentials found for this filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredCredentials.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#f1f5f9', color: '#334155', fontSize: 13 }}>
                        {c.candidate?.firstName?.[0] || 'C'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                          {c.candidate?.firstName} {c.candidate?.lastName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {c.candidate?.currentTitle || c.candidate?.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {c.name}
                    </Typography>
                    {c.documentUrl && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <FileText size={13} color="#2563eb" />
                        <Typography
                          component="a"
                          href={c.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          variant="caption"
                          sx={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
                        >
                          Certificate PDF
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={c.credentialType} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {c.issuingAuthority || 'N/A'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      ID: {c.credentialIdNumber || 'Verified'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{c.state || 'National'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {c.issueDate ? new Date(c.issueDate).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>{getExpiryBadge(c.expiryDate)}</TableCell>
                  <TableCell>{getStatusChip(c.verificationStatus)}</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setVerifyModalCred(c);
                        setVerificationStatus(c.verificationStatus || 'Verified');
                        setAuditNotes(c.notes || 'Verified on primary regulatory portal.');
                      }}
                      sx={{ textTransform: 'none', borderRadius: 1.5 }}
                    >
                      Audit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CREATE CREDENTIAL DIALOG */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#1e293b' }}>
          Record Consultant Credential / Visa
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
                {candidates.map((cand) => (
                  <MenuItem key={cand.id} value={cand.id}>
                    {cand.firstName} {cand.lastName} ({cand.currentTitle || 'Candidate'})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Credential Type"
                value={form.credentialType}
                onChange={(e) => setForm({ ...form, credentialType: e.target.value })}
              >
                <MenuItem value="WorkAuthorization">Work Authorization / Visa (H-1B, Green Card)</MenuItem>
                <MenuItem value="Certification">Technical Certification (AWS, GCP, PMP)</MenuItem>
                <MenuItem value="StateLicense">Professional / State License (RN, CPA, PE)</MenuItem>
                <MenuItem value="BackgroundCheck">Background Check Clearance Certificate</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Credential Name"
                placeholder="e.g. AWS Solutions Architect Professional"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Issuing Authority"
                placeholder="e.g. Amazon Web Services / USCIS"
                value={form.issuingAuthority}
                onChange={(e) => setForm({ ...form, issuingAuthority: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Credential / License ID Number"
                placeholder="e.g. AWS-SAP-892182"
                value={form.credentialIdNumber}
                onChange={(e) => setForm({ ...form, credentialIdNumber: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State / Jurisdiction"
                placeholder="National, CA, TX, NY"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="date"
                label="Issue Date"
                InputLabelProps={{ shrink: true }}
                value={form.issueDate}
                onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="date"
                label="Expiration Date"
                InputLabelProps={{ shrink: true }}
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Document / Verification Registry URL"
                placeholder="https://storage.pavion.com/credentials/cert.pdf"
                value={form.documentUrl}
                onChange={(e) => setForm({ ...form, documentUrl: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Audit Verification Notes"
                multiline
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
            onClick={handleCreateCredential}
            sx={{ textTransform: 'none', px: 3, bgcolor: '#1976d2' }}
          >
            Save Credential
          </Button>
        </DialogActions>
      </Dialog>

      {/* AUDIT / VERIFY MODAL */}
      <Dialog
        open={Boolean(verifyModalCred)}
        onClose={() => setVerifyModalCred(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#1e293b' }}>
          Audit Credential Verification
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2.5, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {verifyModalCred?.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              Candidate: {verifyModalCred?.candidate?.firstName} {verifyModalCred?.candidate?.lastName} | ID: {verifyModalCred?.credentialIdNumber || 'N/A'}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Audit Verification Status"
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value)}
              >
                <MenuItem value="Verified">Verified & Valid</MenuItem>
                <MenuItem value="Pending">Pending Audit</MenuItem>
                <MenuItem value="Expired">Flagged as Expired / Lapsed</MenuItem>
                <MenuItem value="Revoked">Revoked / Disqualified</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Verification & Registry Audit Notes"
                multiline
                rows={3}
                value={auditNotes}
                onChange={(e) => setAuditNotes(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setVerifyModalCred(null)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleVerifyCredential}
            sx={{ textTransform: 'none', px: 3 }}
          >
            Update Audit Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Compliance;
