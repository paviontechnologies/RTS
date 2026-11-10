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
} from '@mui/material';
import {
  Building2,
  Plus,
  Users,
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Briefcase,
  Star,
  Award,
  Send,
  Building,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export const Vendors: React.FC = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [tierFilter, setTierFilter] = useState('ALL');
  const [openRegisterVendor, setOpenRegisterVendor] = useState(false);
  const [openSubmitCandidate, setOpenSubmitCandidate] = useState(false);
  const [statusModalSub, setStatusModalSub] = useState<any | null>(null);
  const [newSubStatus, setNewSubStatus] = useState('ClientReview');
  const [successMessage, setSuccessMessage] = useState('');

  // Register Vendor Form
  const [vendorForm, setVendorForm] = useState({
    name: '',
    vendorType: 'C2C_Subcontractor',
    tier: 'Tier1',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    taxIdEin: '',
    msaStatus: 'Active',
    paymentTerms: 'Net 45',
    notes: 'Approved primary staffing partner with active insurance and standard MSA.',
  });

  // Vendor Submission Form
  const [subForm, setSubForm] = useState({
    vendorId: '',
    jobId: '',
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    submittedRate: 75,
    resumeUrl: '',
    notes: 'Strong candidate with verified C2C employer authorization.',
  });

  const fetchData = async () => {
    try {
      const [vendorsRes, subsRes, jobsRes] = await Promise.all([
        apiClient.vendors.getVendors(),
        apiClient.vendors.getVendorSubmissions(),
        apiClient.jobs.getJobs(),
      ]);
      if (vendorsRes.data.success) setVendors(vendorsRes.data.data);
      if (subsRes.data.success) setSubmissions(subsRes.data.data);
      if (jobsRes.data.success) setJobs(jobsRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegisterVendor = async () => {
    try {
      if (!vendorForm.name || !vendorForm.email) {
        alert('Vendor Name and Primary Email are required.');
        return;
      }
      const res = await apiClient.vendors.createVendor(vendorForm);
      if (res.data.success) {
        setSuccessMessage('Staffing vendor onboarded and added to directory!');
        setOpenRegisterVendor(false);
        fetchData();
        setVendorForm({
          name: '',
          vendorType: 'C2C_Subcontractor',
          tier: 'Tier1',
          contactPerson: '',
          email: '',
          phone: '',
          website: '',
          taxIdEin: '',
          msaStatus: 'Active',
          paymentTerms: 'Net 45',
          notes: '',
        });
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to register vendor');
    }
  };

  const handleSubmitCandidate = async () => {
    try {
      if (!subForm.vendorId || !subForm.jobId || !subForm.candidateName) {
        alert('Vendor, Job Requisition, and Candidate Name are required.');
        return;
      }
      const res = await apiClient.vendors.createVendorSubmission(subForm);
      if (res.data.success) {
        setSuccessMessage('Vendor candidate submitted for client review!');
        setOpenSubmitCandidate(false);
        fetchData();
        setSubForm({
          vendorId: '',
          jobId: '',
          candidateName: '',
          candidateEmail: '',
          candidatePhone: '',
          submittedRate: 75,
          resumeUrl: '',
          notes: '',
        });
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit candidate');
    }
  };

  const handleUpdateSubStatus = async () => {
    if (!statusModalSub) return;
    try {
      const res = await apiClient.vendors.updateVendorSubmissionStatus(statusModalSub.id, {
        status: newSubStatus,
      });
      if (res.data.success) {
        setSuccessMessage(`Vendor submission status updated to ${newSubStatus}`);
        setStatusModalSub(null);
        fetchData();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update submission');
    }
  };

  // Metrics
  const totalVendors = vendors.length;
  const tier1Count = vendors.filter((v) => v.tier === 'Tier1').length;
  const c2cCount = vendors.filter((v) => v.vendorType === 'C2C_Subcontractor').length;
  const activeMsaCount = vendors.filter((v) => v.msaStatus === 'Active').length;
  const totalSubmissions = submissions.length;

  const filteredVendors = vendors.filter((v) => {
    if (tierFilter === 'ALL') return true;
    return v.tier === tierFilter;
  });

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Tier1':
        return (
          <Chip
            icon={<Star size={14} fill="#eab308" color="#ca8a04" />}
            label="Tier 1 Preferred"
            size="small"
            sx={{ bgcolor: '#fef9c3', color: '#854d0e', fontWeight: 700 }}
          />
        );
      case 'Tier2':
        return (
          <Chip
            icon={<Award size={14} />}
            label="Tier 2 Standard"
            size="small"
            sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600 }}
          />
        );
      default:
        return <Chip label="Tier 3 Contingent" size="small" variant="outlined" />;
    }
  };

  const getSubStatusChip = (status: string) => {
    switch (status) {
      case 'Placed':
        return <Chip label="Placed" color="success" size="small" icon={<CheckCircle2 size={13} />} />;
      case 'InterviewScheduled':
        return <Chip label="Interview Scheduled" color="primary" size="small" icon={<Clock size={13} />} />;
      case 'ClientReview':
        return <Chip label="Under Client Review" color="info" size="small" />;
      case 'Rejected':
        return <Chip label="Rejected" color="error" size="small" icon={<XCircle size={13} />} />;
      default:
        return <Chip label="Submitted" color="warning" size="small" />;
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
            Vendor & MSP / VMS Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Manage C2C subcontractors, Tier 1/2 staffing partners, MSA contracts, and track candidate submissions.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<Send size={18} />}
            onClick={() => setOpenSubmitCandidate(true)}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            Submit Vendor Candidate
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setOpenRegisterVendor(true)}
            sx={{
              bgcolor: '#1976d2',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 2.5,
              '&:hover': { bgcolor: '#1565c0' },
            }}
          >
            Register Vendor
          </Button>
        </Box>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {successMessage}
        </Alert>
      )}

      {/* Metrics Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Active Vendors
                </Typography>
                <Avatar sx={{ bgcolor: '#eff6ff', color: '#1976d2', width: 36, height: 36 }}>
                  <Building2 size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
                {totalVendors}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Staffing agencies in directory
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Tier 1 Preferred
                </Typography>
                <Avatar sx={{ bgcolor: '#fef9c3', color: '#ca8a04', width: 36, height: 36 }}>
                  <Star size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#ca8a04' }}>
                {tier1Count}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Highest quality SLA partners
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  C2C Subcontractors
                </Typography>
                <Avatar sx={{ bgcolor: '#ecfdf5', color: '#059669', width: 36, height: 36 }}>
                  <Users size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#059669' }}>
                {c2cCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Pass-through C2C suppliers
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Active MSAs
                </Typography>
                <Avatar sx={{ bgcolor: '#f0fdf4', color: '#16a34a', width: 36, height: 36 }}>
                  <ShieldCheck size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#16a34a' }}>
                {activeMsaCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Signed master agreements
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Candidate Submissions
                </Typography>
                <Avatar sx={{ bgcolor: '#f5f3ff', color: '#7c3aed', width: 36, height: 36 }}>
                  <FileText size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#7c3aed' }}>
                {totalSubmissions}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Received from vendors
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 2.5, borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`Vendor Directory (${vendors.length})`} />
          <Tab label={`Vendor Candidate Submissions (${submissions.length})`} />
        </Tabs>
      </Paper>

      {/* TAB 0: VENDOR DIRECTORY */}
      {activeTab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {['ALL', 'Tier1', 'Tier2', 'Tier3'].map((tier) => (
              <Chip
                key={tier}
                label={tier === 'ALL' ? 'All Tiers' : tier === 'Tier1' ? 'Tier 1 Preferred' : tier}
                clickable
                color={tierFilter === tier ? 'primary' : 'default'}
                variant={tierFilter === tier ? 'filled' : 'outlined'}
                onClick={() => setTierFilter(tier)}
              />
            ))}
          </Box>

          <TableContainer component={Paper} sx={{ borderRadius: 2.5, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Vendor Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Type & Tier</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Primary Contact</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Tax ID / EIN</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>MSA Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Payment Terms</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Submissions</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'right' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVendors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6, color: '#94a3b8' }}>
                      No vendors found for this tier filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVendors.map((v) => (
                    <TableRow key={v.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 34, height: 34, bgcolor: '#f1f5f9', color: '#1e293b', fontSize: 13 }}>
                            {v.name[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                              {v.name}
                            </Typography>
                            {v.website && (
                              <Typography
                                component="a"
                                href={v.website.startsWith('http') ? v.website : `https://${v.website}`}
                                target="_blank"
                                rel="noreferrer"
                                variant="caption"
                                sx={{ color: '#2563eb', textDecoration: 'none' }}
                              >
                                {v.website}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
                          {getTierBadge(v.tier)}
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {v.vendorType}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {v.contactPerson || 'Vendor Lead'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {v.email} | {v.phone || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{v.taxIdEin || 'Verified'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={v.msaStatus}
                          size="small"
                          color={v.msaStatus === 'Active' ? 'success' : 'warning'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {v.paymentTerms || 'Net 45'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${v._count?.submissions || 0} Submitted`}
                          size="small"
                          sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Send size={13} />}
                          onClick={() => {
                            setSubForm({ ...subForm, vendorId: v.id });
                            setOpenSubmitCandidate(true);
                          }}
                          sx={{ textTransform: 'none', borderRadius: 1.5 }}
                        >
                          Submit Candidate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* TAB 1: VENDOR SUBMISSIONS PIPELINE */}
      {activeTab === 1 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2.5, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Vendor</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Candidate</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Target Job Requisition</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Submitted Rate</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Notes</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: '#94a3b8' }}>
                    No vendor candidate submissions recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((sub) => (
                  <TableRow key={sub.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {sub.vendor?.name}
                      </Typography>
                      {getTierBadge(sub.vendor?.tier || 'Tier1')}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                        {sub.candidateName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {sub.candidateEmail} | {sub.candidatePhone || 'Direct'}
                      </Typography>
                      {sub.resumeUrl && (
                        <Box sx={{ mt: 0.5 }}>
                          <Typography
                            component="a"
                            href={sub.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            variant="caption"
                            sx={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
                          >
                            View Resume PDF
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {sub.job?.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {sub.job?.account?.name} ({sub.job?.jobCode})
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        ${sub.submittedRate?.toFixed(2)}/hr
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        C2C Buy Rate
                      </Typography>
                    </TableCell>
                    <TableCell>{getSubStatusChip(sub.status)}</TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      <Typography variant="caption" sx={{ color: '#475569' }}>
                        {sub.notes || 'No remarks provided.'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setStatusModalSub(sub);
                          setNewSubStatus(sub.status || 'ClientReview');
                        }}
                        sx={{ textTransform: 'none', borderRadius: 1.5 }}
                      >
                        Update Status
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* REGISTER VENDOR MODAL */}
      <Dialog open={openRegisterVendor} onClose={() => setOpenRegisterVendor(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#1e293b' }}>
          Onboard New Staffing Vendor / C2C Partner
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Vendor Legal Name"
                placeholder="e.g. Apex Talent Solutions LLC"
                value={vendorForm.name}
                onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Tier Classification"
                value={vendorForm.tier}
                onChange={(e) => setVendorForm({ ...vendorForm, tier: e.target.value })}
              >
                <MenuItem value="Tier1">Tier 1 Preferred</MenuItem>
                <MenuItem value="Tier2">Tier 2 Standard</MenuItem>
                <MenuItem value="Tier3">Tier 3 Contingent</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Vendor Type"
                value={vendorForm.vendorType}
                onChange={(e) => setVendorForm({ ...vendorForm, vendorType: e.target.value })}
              >
                <MenuItem value="C2C_Subcontractor">C2C Subcontractor</MenuItem>
                <MenuItem value="StaffAugmentation">Staff Augmentation Agency</MenuItem>
                <MenuItem value="MSP">MSP / VMS Partner</MenuItem>
                <MenuItem value="OffshorePartner">Offshore RPO / Partner</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tax ID / EIN Number"
                placeholder="XX-XXXXXXX"
                value={vendorForm.taxIdEin}
                onChange={(e) => setVendorForm({ ...vendorForm, taxIdEin: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Person Name"
                placeholder="e.g. Rajesh Singhania"
                value={vendorForm.contactPerson}
                onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Primary Email"
                placeholder="vendor-ops@apextalent.com"
                value={vendorForm.email}
                onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                placeholder="+1 (555) 019-2831"
                value={vendorForm.phone}
                onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Payment Terms"
                value={vendorForm.paymentTerms}
                onChange={(e) => setVendorForm({ ...vendorForm, paymentTerms: e.target.value })}
              >
                <MenuItem value="Net 30">Net 30 Days</MenuItem>
                <MenuItem value="Net 45">Net 45 Days</MenuItem>
                <MenuItem value="Net 60">Net 60 Days</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Vendor Notes & Special Terms"
                multiline
                rows={2}
                value={vendorForm.notes}
                onChange={(e) => setVendorForm({ ...vendorForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenRegisterVendor(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleRegisterVendor}
            sx={{ textTransform: 'none', px: 3, bgcolor: '#1976d2' }}
          >
            Register Vendor
          </Button>
        </DialogActions>
      </Dialog>

      {/* SUBMIT VENDOR CANDIDATE MODAL */}
      <Dialog open={openSubmitCandidate} onClose={() => setOpenSubmitCandidate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#1e293b' }}>
          Submit Vendor Candidate for Job Requisition
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Select Vendor"
                value={subForm.vendorId}
                onChange={(e) => setSubForm({ ...subForm, vendorId: e.target.value })}
                required
              >
                {vendors.map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.name} ({v.tier})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Target Job Requisition"
                value={subForm.jobId}
                onChange={(e) => setSubForm({ ...subForm, jobId: e.target.value })}
                required
              >
                {jobs.map((j) => (
                  <MenuItem key={j.id} value={j.id}>
                    {j.title} - {j.account?.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Candidate Full Name"
                placeholder="e.g. Srikant Iyer"
                value={subForm.candidateName}
                onChange={(e) => setSubForm({ ...subForm, candidateName: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Candidate Email"
                placeholder="srikant.iyer@apex.com"
                value={subForm.candidateEmail}
                onChange={(e) => setSubForm({ ...subForm, candidateEmail: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Candidate Phone"
                placeholder="+1 (555) 234-9988"
                value={subForm.candidatePhone}
                onChange={(e) => setSubForm({ ...subForm, candidatePhone: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Submitted C2C Buy Rate ($/hr)"
                value={subForm.submittedRate}
                onChange={(e) => setSubForm({ ...subForm, submittedRate: Number(e.target.value) })}
                InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, color: '#64748b' }}>$</Typography> }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Resume URL (PDF / Doc)"
                placeholder="https://storage.pavion.com/resumes/c2c-cand.pdf"
                value={subForm.resumeUrl}
                onChange={(e) => setSubForm({ ...subForm, resumeUrl: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Submission Notes & Authorization"
                multiline
                rows={2}
                value={subForm.notes}
                onChange={(e) => setSubForm({ ...subForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenSubmitCandidate(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitCandidate}
            sx={{ textTransform: 'none', px: 3, bgcolor: '#1976d2' }}
          >
            Submit to Client Pipeline
          </Button>
        </DialogActions>
      </Dialog>

      {/* UPDATE STATUS MODAL */}
      <Dialog open={Boolean(statusModalSub)} onClose={() => setStatusModalSub(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Update Vendor Submission Status</DialogTitle>
        <DialogContent dividers>
          <TextField
            select
            fullWidth
            label="Pipeline Status"
            value={newSubStatus}
            onChange={(e) => setNewSubStatus(e.target.value)}
            sx={{ mt: 1 }}
          >
            <MenuItem value="Submitted">Submitted</MenuItem>
            <MenuItem value="ClientReview">Under Client Review</MenuItem>
            <MenuItem value="InterviewScheduled">Interview Scheduled</MenuItem>
            <MenuItem value="Placed">Placed / Hired</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStatusModalSub(null)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleUpdateSubStatus} sx={{ textTransform: 'none' }}>
            Save Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Vendors;
