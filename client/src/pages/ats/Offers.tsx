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
  DollarSign,
  Plus,
  FileCheck,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Percent,
  Briefcase,
  User,
  Building,
  Printer,
  Copy,
  Check,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export const Offers: React.FC = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [form, setForm] = useState({
    candidateId: '',
    jobId: '',
    payRate: 65,
    billRate: 95,
    overtimeRate: 97.5,
    employmentType: 'Contract - W2',
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 194 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    benefitsDetails: 'Full medical, dental, and 401(k) eligibility after 30 days of active billing.',
    notes: 'Cleared client technical interview. Immediate start approved by account manager.',
  });

  const fetchData = async () => {
    try {
      const [offersRes, candRes, jobsRes] = await Promise.all([
        apiClient.offers.getOffers(),
        apiClient.candidates.getCandidates(),
        apiClient.jobs.getJobs(),
      ]);
      if (offersRes.data.success) setOffers(offersRes.data.data);
      if (candRes.data.success) setCandidates(candRes.data.data);
      if (jobsRes.data.success) setJobs(jobsRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculatedSpread = Math.max(0, Number(form.billRate) - Number(form.payRate));
  const calculatedMargin =
    Number(form.billRate) > 0 ? ((calculatedSpread / Number(form.billRate)) * 100).toFixed(1) : '0.0';
  const annualizedSpread = (calculatedSpread * 2080).toLocaleString();

  const handleCreateOffer = async () => {
    try {
      if (!form.candidateId || !form.jobId) {
        alert('Please select both a candidate and a job requisition.');
        return;
      }
      const res = await apiClient.offers.createOffer(form);
      if (res.data.success) {
        setSuccessMessage('Offer proposal generated successfully!');
        setOpenCreate(false);
        fetchData();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create offer');
    }
  };

  const handleUpdateStatus = async (offerId: string, status: string) => {
    try {
      const res = await apiClient.offers.updateOfferStatus(offerId, { status });
      if (res.data.success) {
        setSuccessMessage(
          status === 'Accepted'
            ? 'Offer accepted! Placement and onboarding checklist generated automatically.'
            : `Offer status updated to ${status}`
        );
        if (selectedOffer && selectedOffer.id === offerId) {
          setSelectedOffer(res.data.data);
        }
        fetchData();
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update offer status');
    }
  };

  const statusFilters = ['ALL', 'Draft', 'PendingApproval', 'Sent', 'Accepted', 'Placed', 'Rejected'];
  const filteredOffers = offers.filter((o) => {
    if (activeTab === 0) return true;
    return o.status === statusFilters[activeTab];
  });

  // Summary Metrics
  const totalOffersCount = offers.length;
  const pendingCount = offers.filter((o) => o.status === 'PendingApproval' || o.status === 'Sent').length;
  const acceptedCount = offers.filter((o) => o.status === 'Accepted' || o.status === 'Placed').length;
  const avgMargin =
    offers.length > 0
      ? (offers.reduce((acc, o) => acc + (o.marginPercentage || 0), 0) / offers.length).toFixed(1)
      : '0.0';
  const totalHourlySpread = offers.reduce((acc, o) => acc + (o.spreadHourly || 0), 0).toFixed(2);

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'Accepted':
      case 'Placed':
        return <Chip label={status} color="success" size="small" icon={<CheckCircle2 size={14} />} />;
      case 'Sent':
        return <Chip label="Sent to Candidate" color="info" size="small" icon={<Send size={14} />} />;
      case 'PendingApproval':
        return <Chip label="Pending Approval" color="warning" size="small" icon={<Clock size={14} />} />;
      case 'Rejected':
        return <Chip label="Rejected" color="error" size="small" icon={<XCircle size={14} />} />;
      default:
        return <Chip label="Draft" color="default" size="small" />;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header Banner */}
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
            Offer Management & Approvals
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Automate compensation packages, gross margin spread calculations, approvals, and contract generation.
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
          Create New Offer
        </Button>
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
                  Total Offers
                </Typography>
                <Avatar sx={{ bgcolor: '#eff6ff', color: '#1976d2', width: 36, height: 36 }}>
                  <FileCheck size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
                {totalOffersCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Active in pipeline
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Pending Action
                </Typography>
                <Avatar sx={{ bgcolor: '#fffbeb', color: '#d97706', width: 36, height: 36 }}>
                  <Clock size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#d97706' }}>
                {pendingCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Sent or awaiting sign-off
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Accepted & Placed
                </Typography>
                <Avatar sx={{ bgcolor: '#f0fdf4', color: '#16a34a', width: 36, height: 36 }}>
                  <CheckCircle2 size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#16a34a' }}>
                {acceptedCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Converted to Placements
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Avg Gross Margin
                </Typography>
                <Avatar sx={{ bgcolor: '#f5f3ff', color: '#7c3aed', width: 36, height: 36 }}>
                  <Percent size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#7c3aed' }}>
                {avgMargin}%
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Target: &gt; 25% margin
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Cumulative Spread
                </Typography>
                <Avatar sx={{ bgcolor: '#ecfdf5', color: '#059669', width: 36, height: 36 }}>
                  <DollarSign size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#059669' }}>
                ${totalHourlySpread}/hr
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Total hourly gross profit
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Filter */}
      <Paper sx={{ mb: 2.5, borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`All Offers (${offers.length})`} />
          <Tab label="Drafts" />
          <Tab label="Pending Approval" />
          <Tab label="Sent to Candidate" />
          <Tab label="Accepted / Placed" />
          <Tab label="Rejected" />
        </Tabs>
      </Paper>

      {/* Offers Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2.5, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Offer Code</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Candidate</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Job & Client</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Rates (Pay / Bill)</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Spread & Margin</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Start Date</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'right' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOffers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} sx={{ textAlign: 'center', py: 6, color: '#94a3b8' }}>
                  No offer records match the selected filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredOffers.map((o) => {
                const spread = o.spreadHourly || o.billRate - o.payRate;
                const margin = o.marginPercentage || (o.billRate > 0 ? (spread / o.billRate) * 100 : 0);
                return (
                  <TableRow key={o.id} hover>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {o.offerCode || `OFF-${o.id.slice(-5)}`}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#e0e7ff', color: '#4338ca', fontSize: 13 }}>
                          {o.candidate?.firstName?.[0] || 'C'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                            {o.candidate?.firstName} {o.candidate?.lastName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {o.candidate?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                        {o.job?.title || 'Senior Consultant'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {o.job?.account?.name || 'Direct Client'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={o.employmentType} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ${o.payRate?.toFixed(2)} / ${o.billRate?.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        OT: ${o.overtimeRate?.toFixed(2) || (o.payRate * 1.5).toFixed(2)}/hr
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`+${spread?.toFixed(2)}/hr`}
                          size="small"
                          sx={{
                            bgcolor: margin >= 25 ? '#dcfce7' : '#e0f2fe',
                            color: margin >= 25 ? '#15803d' : '#0369a1',
                            fontWeight: 700,
                          }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                          ({margin?.toFixed(1)}%)
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {o.startDate ? new Date(o.startDate).toLocaleDateString() : 'Immediate'}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(o.status)}</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setSelectedOffer(o)}
                          sx={{ textTransform: 'none', borderRadius: 1.5 }}
                        >
                          View Letter
                        </Button>
                        {o.status === 'Draft' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => handleUpdateStatus(o.id, 'Sent')}
                            sx={{ textTransform: 'none', borderRadius: 1.5 }}
                          >
                            Send
                          </Button>
                        )}
                        {o.status === 'Sent' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleUpdateStatus(o.id, 'Accepted')}
                            sx={{ textTransform: 'none', borderRadius: 1.5 }}
                          >
                            Accept & Place
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CREATE OFFER DIALOG WITH SPREAD CALCULATOR */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#1e293b' }}>
          Generate New Offer & Margin Proposal
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
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
                    {c.firstName} {c.lastName} ({c.currentTitle || 'Candidate'})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Select Job Requisition"
                value={form.jobId}
                onChange={(e) => setForm({ ...form, jobId: e.target.value })}
                required
              >
                {jobs.map((j) => (
                  <MenuItem key={j.id} value={j.id}>
                    {j.title} - {j.account?.name || 'Account'} ({j.jobCode})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* SPREAD CALCULATOR CARD */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp size={18} color="#1976d2" /> Live Staffing Margin & Spread Calculator
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Candidate Pay Rate ($/hr)"
                        value={form.payRate}
                        onChange={(e) => {
                          const p = Number(e.target.value);
                          setForm({ ...form, payRate: p, overtimeRate: p * 1.5 });
                        }}
                        InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, color: '#64748b' }}>$</Typography> }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Client Bill Rate ($/hr)"
                        value={form.billRate}
                        onChange={(e) => setForm({ ...form, billRate: Number(e.target.value) })}
                        InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, color: '#64748b' }}>$</Typography> }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Overtime Rate ($/hr)"
                        value={form.overtimeRate}
                        onChange={(e) => setForm({ ...form, overtimeRate: Number(e.target.value) })}
                        InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, color: '#64748b' }}>$</Typography> }}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2.5, p: 2, bgcolor: '#ffffff', borderRadius: 2, border: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        HOURLY GROSS SPREAD
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#059669' }}>
                        ${calculatedSpread.toFixed(2)} / hr
                      </Typography>
                    </Box>

                    <Divider orientation="vertical" flexItem />

                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        PROFIT MARGIN
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: Number(calculatedMargin) >= 20 ? '#16a34a' : '#d97706' }}>
                        {calculatedMargin}%
                      </Typography>
                    </Box>

                    <Divider orientation="vertical" flexItem />

                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        ANNUAL GROSS PROFIT (2080 hrs)
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>
                        ${annualizedSpread} / yr
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Employment Type"
                value={form.employmentType}
                onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
              >
                <MenuItem value="Contract - W2">Contract - W2</MenuItem>
                <MenuItem value="C2C - Subcontractor">C2C - Subcontractor</MenuItem>
                <MenuItem value="1099 - Independent">1099 - Independent</MenuItem>
                <MenuItem value="FullTime - DirectHire">FullTime - Direct Hire</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="date"
                label="Target Start Date"
                InputLabelProps={{ shrink: true }}
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="date"
                label="Estimated End Date"
                InputLabelProps={{ shrink: true }}
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Benefits & Payroll Inclusions"
                multiline
                rows={2}
                value={form.benefitsDetails}
                onChange={(e) => setForm({ ...form, benefitsDetails: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Internal Approval Notes"
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
            onClick={handleCreateOffer}
            sx={{ textTransform: 'none', px: 3, bgcolor: '#1976d2' }}
          >
            Create Offer & Proposal
          </Button>
        </DialogActions>
      </Dialog>

      {/* OFFER LETTER PREVIEW MODAL */}
      <Dialog
        open={Boolean(selectedOffer)}
        onClose={() => setSelectedOffer(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Offer Letter #{selectedOffer?.offerCode}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Candidate: {selectedOffer?.candidate?.firstName} {selectedOffer?.candidate?.lastName} | Client: {selectedOffer?.job?.account?.name}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Copy letter text">
              <IconButton
                size="small"
                onClick={() => {
                  navigator.clipboard.writeText(selectedOffer?.offerLetterContent || '');
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check size={18} color="green" /> : <Copy size={18} />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Print offer letter">
              <IconButton size="small" onClick={() => window.print()}>
                <Printer size={18} />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.7,
              color: '#1e293b',
            }}
          >
            {selectedOffer?.offerLetterContent || 'No offer letter content available.'}
          </Paper>

          <Box sx={{ mt: 3, p: 2, bgcolor: '#eff6ff', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e40af' }}>
                Offer Workflow Status: {selectedOffer?.status}
              </Typography>
              <Typography variant="caption" sx={{ color: '#3b82f6' }}>
                Marking as "Accepted" automatically converts candidate to active placement and generates pre-hire onboarding clearance tasks.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {selectedOffer?.status !== 'Sent' && selectedOffer?.status !== 'Accepted' && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleUpdateStatus(selectedOffer.id, 'Sent')}
                  startIcon={<Send size={15} />}
                  sx={{ textTransform: 'none' }}
                >
                  Mark Sent
                </Button>
              )}
              {selectedOffer?.status !== 'Accepted' && (
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={() => handleUpdateStatus(selectedOffer.id, 'Accepted')}
                  startIcon={<CheckCircle2 size={15} />}
                  sx={{ textTransform: 'none' }}
                >
                  Mark Accepted & Place
                </Button>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedOffer(null)} sx={{ textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Offers;
