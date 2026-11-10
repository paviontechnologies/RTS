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
  RotateCcw,
  Users,
  AlertTriangle,
  Clock,
  Calendar,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  Building,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useNavigate } from 'react-router-dom';

export const Redeployment: React.FC = () => {
  const navigate = useNavigate();
  const [forecast, setForecast] = useState<any>({
    totalActivePlacements: 0,
    rollOff15: [],
    rollOff30: [],
    rollOff60: [],
    benchCandidates: [],
  });
  const [activeTab, setActiveTab] = useState(0);
  const [openExtendModal, setOpenExtendModal] = useState(false);
  const [selectedPlacement, setSelectedPlacement] = useState<any | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Extension Form
  const [extendForm, setExtendForm] = useState({
    placementId: '',
    newEndDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    newBillRate: '',
    newPayRate: '',
    extensionNotes: 'Client renewed contract for 6 months due to exceptional project delivery.',
  });

  const fetchData = async () => {
    try {
      const res = await apiClient.redeployment.getForecast();
      if (res.data.success) {
        setForecast(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenExtend = (placement: any) => {
    setSelectedPlacement(placement);
    setExtendForm({
      placementId: placement.id,
      newEndDate: new Date(new Date(placement.endDate || Date.now()).getTime() + 180 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      newBillRate: String(placement.billRate || ''),
      newPayRate: String(placement.payRate || ''),
      extensionNotes: `Contract extended 6 months for ${placement.candidate?.firstName} with ${placement.clientAccount?.name}.`,
    });
    setOpenExtendModal(true);
  };

  const handleExtendContract = async () => {
    try {
      if (!extendForm.placementId || !extendForm.newEndDate) {
        alert('Placement and New End Date are required.');
        return;
      }
      const res = await apiClient.redeployment.extendContract(extendForm);
      if (res.data.success) {
        setSuccessMessage('Contract extension approved and placement updated!');
        setOpenExtendModal(false);
        fetchData();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to extend contract');
    }
  };

  const renderPlacementRow = (p: any, urgencyDays: number) => {
    const spread = (p.billRate || 0) - (p.payRate || 0);
    return (
      <TableRow key={p.id} hover>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: '#f1f5f9', color: '#1e293b', fontSize: 13 }}>
              {p.candidate?.firstName?.[0] || 'C'}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                {p.candidate?.firstName} {p.candidate?.lastName}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                {p.candidate?.currentTitle || 'Consultant'}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
            {p.clientAccount?.name || 'Direct Client'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Role: {p.job?.title || 'Engineer'}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            ${p.payRate?.toFixed(2)} / ${p.billRate?.toFixed(2)}
          </Typography>
          <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 600 }}>
            +${spread?.toFixed(2)}/hr spread
          </Typography>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: urgencyDays <= 15 ? '#dc2626' : '#d97706' }}>
              {p.endDate ? new Date(p.endDate).toLocaleDateString() : 'N/A'}
            </Typography>
            <Chip
              label={urgencyDays <= 15 ? 'Critical Roll-Off' : `< ${urgencyDays} Days`}
              size="small"
              color={urgencyDays <= 15 ? 'error' : 'warning'}
              sx={{ fontWeight: 700, height: 20, fontSize: 10 }}
            />
          </Box>
        </TableCell>
        <TableCell sx={{ textAlign: 'right' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => handleOpenExtend(p)}
              sx={{ textTransform: 'none', borderRadius: 1.5 }}
            >
              Extend Contract
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<Zap size={14} />}
              onClick={() => navigate('/ats/jobs')}
              sx={{ textTransform: 'none', borderRadius: 1.5, bgcolor: '#1976d2' }}
            >
              Redeploy
            </Button>
          </Box>
        </TableCell>
      </TableRow>
    );
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
            Consultant Redeployment & Bench Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Proactively monitor project end dates, execute 6-month contract extensions, and redeploy bench talent with zero billing gaps.
          </Typography>
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
                  Active Billable Consultants
                </Typography>
                <Avatar sx={{ bgcolor: '#eff6ff', color: '#1976d2', width: 36, height: 36 }}>
                  <Users size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
                {forecast.totalActivePlacements}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Currently on billing
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Roll-Off in &lt; 15 Days
                </Typography>
                <Avatar sx={{ bgcolor: '#fef2f2', color: '#dc2626', width: 36, height: 36 }}>
                  <AlertTriangle size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#dc2626' }}>
                {forecast.rollOff15?.length || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Urgent redeployment needed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Roll-Off in 30 Days
                </Typography>
                <Avatar sx={{ bgcolor: '#fffbeb', color: '#d97706', width: 36, height: 36 }}>
                  <Clock size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#d97706' }}>
                {forecast.rollOff30?.length || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Initiate client discussion
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Roll-Off in 60 Days
                </Typography>
                <Avatar sx={{ bgcolor: '#f5f3ff', color: '#7c3aed', width: 36, height: 36 }}>
                  <Calendar size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#7c3aed' }}>
                {forecast.rollOff60?.length || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Pipeline planning
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Available Bench
                </Typography>
                <Avatar sx={{ bgcolor: '#ecfdf5', color: '#059669', width: 36, height: 36 }}>
                  <RotateCcw size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#059669' }}>
                {forecast.benchCandidates?.length || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Ready for immediate billing
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
          <Tab label="Roll-Off Pipeline Forecast" />
          <Tab label={`Available Bench Talent Inventory (${forecast.benchCandidates?.length || 0})`} />
        </Tabs>
      </Paper>

      {/* TAB 0: ROLL-OFF FORECAST BY URGENCY */}
      {activeTab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* 15 Days Urgent Section */}
          <Paper sx={{ p: 2.5, borderRadius: 2.5, borderLeft: '5px solid #dc2626' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <AlertTriangle size={22} color="#dc2626" />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#dc2626' }}>
                Critical Roll-Offs (&lt; 15 Days) - {forecast.rollOff15?.length || 0} Consultants
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#fef2f2' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Consultant</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Client Account & Role</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Rate & Margin</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>End Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(!forecast.rollOff15 || forecast.rollOff15.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3, color: '#94a3b8' }}>
                        No consultants rolling off in the next 15 days. Excellent retention!
                      </TableCell>
                    </TableRow>
                  ) : (
                    forecast.rollOff15.map((p: any) => renderPlacementRow(p, 15))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* 30 Days Section */}
          <Paper sx={{ p: 2.5, borderRadius: 2.5, borderLeft: '5px solid #d97706' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Clock size={22} color="#d97706" />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#d97706' }}>
                Upcoming Roll-Offs (16 - 30 Days) - {forecast.rollOff30?.length || 0} Consultants
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#fffbeb' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Consultant</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Client Account & Role</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Rate & Margin</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>End Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(!forecast.rollOff30 || forecast.rollOff30.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3, color: '#94a3b8' }}>
                        No consultants rolling off in the 16-30 day window.
                      </TableCell>
                    </TableRow>
                  ) : (
                    forecast.rollOff30.map((p: any) => renderPlacementRow(p, 30))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* 60 Days Section */}
          <Paper sx={{ p: 2.5, borderRadius: 2.5, borderLeft: '5px solid #7c3aed' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Calendar size={22} color="#7c3aed" />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#7c3aed' }}>
                Quarterly Roll-Off Pipeline (31 - 60 Days) - {forecast.rollOff60?.length || 0} Consultants
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#faf5ff' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Consultant</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Client Account & Role</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Rate & Margin</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>End Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(!forecast.rollOff60 || forecast.rollOff60.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3, color: '#94a3b8' }}>
                        No consultants scheduled for 31-60 day roll-off.
                      </TableCell>
                    </TableRow>
                  ) : (
                    forecast.rollOff60.map((p: any) => renderPlacementRow(p, 60))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* TAB 1: BENCH TALENT INVENTORY */}
      {activeTab === 1 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2.5, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Bench Consultant</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Core Competencies & Skills</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Work Authorization</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Target Pay Rate</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'right' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {forecast.benchCandidates?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: '#94a3b8' }}>
                    Zero bench inventory. All active candidates are currently billable!
                  </TableCell>
                </TableRow>
              ) : (
                forecast.benchCandidates.map((cand: any) => {
                  const skills = (cand.skills || 'Java, Spring Boot, Microservices, AWS').split(',').map((s: string) => s.trim());
                  return (
                    <TableRow key={cand.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 34, height: 34, bgcolor: '#ecfdf5', color: '#047857', fontSize: 13 }}>
                            {cand.firstName?.[0] || 'C'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                              {cand.firstName} {cand.lastName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              {cand.currentTitle || 'Software Engineer'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 320 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {skills.slice(0, 4).map((s: string) => (
                            <Chip key={s} label={s} size="small" sx={{ fontSize: 11, height: 22, bgcolor: '#f1f5f9' }} />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={cand.workAuthorization || 'US Citizen'} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ${cand.expectedPayRate ? `${cand.expectedPayRate}/hr` : '$65.00/hr'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label="Immediate Available" size="small" color="success" />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<Zap size={14} />}
                          onClick={() => navigate('/ats/jobs')}
                          sx={{ textTransform: 'none', borderRadius: 1.5, bgcolor: '#1976d2' }}
                        >
                          Match Jobs
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* EXTEND CONTRACT MODAL */}
      <Dialog open={openExtendModal} onClose={() => setOpenExtendModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#1e293b' }}>
          Extend Client Contract & Placement
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2.5, p: 2, bgcolor: '#eff6ff', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e40af' }}>
              {selectedPlacement?.candidate?.firstName} {selectedPlacement?.candidate?.lastName}
            </Typography>
            <Typography variant="body2" sx={{ color: '#3b82f6', mt: 0.5 }}>
              Client: {selectedPlacement?.clientAccount?.name} | Role: {selectedPlacement?.job?.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#3b82f6' }}>
              Current Expiration: {selectedPlacement?.endDate ? new Date(selectedPlacement.endDate).toLocaleDateString() : 'N/A'}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="New Contract End Date"
                InputLabelProps={{ shrink: true }}
                value={extendForm.newEndDate}
                onChange={(e) => setExtendForm({ ...extendForm, newEndDate: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="New Bill Rate ($/hr)"
                value={extendForm.newBillRate}
                onChange={(e) => setExtendForm({ ...extendForm, newBillRate: e.target.value })}
                InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, color: '#64748b' }}>$</Typography> }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="New Pay Rate ($/hr)"
                value={extendForm.newPayRate}
                onChange={(e) => setExtendForm({ ...extendForm, newPayRate: e.target.value })}
                InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, color: '#64748b' }}>$</Typography> }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contract Extension Justification & Notes"
                multiline
                rows={3}
                value={extendForm.extensionNotes}
                onChange={(e) => setExtendForm({ ...extendForm, extensionNotes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenExtendModal(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleExtendContract}
            sx={{ textTransform: 'none', px: 3 }}
          >
            Confirm & Extend Placement
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Redeployment;
