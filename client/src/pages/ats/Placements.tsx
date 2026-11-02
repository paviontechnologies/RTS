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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
  Card,
  CardContent,
} from '@mui/material';
import { Award, Plus, DollarSign, Calendar, Building2, User, TrendingUp } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useSearchParams } from 'react-router-dom';

export const Placements: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [placements, setPlacements] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  const [formData, setFormData] = useState({
    submissionId: '',
    startDate: '',
    endDate: '',
    employmentType: 'Contract',
    payRate: '80',
    billRate: '115',
    notes: 'Signed contract received. Onboarding and I-9 verification completed.',
  });

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      const res = await apiClient.placements.getPlacements();
      if (res.data.success) {
        setPlacements(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await apiClient.submissions.getSubmissions();
      if (res.data.success) {
        setSubmissions(res.data.data);
        if (res.data.data.length > 0 && !formData.submissionId) {
          setFormData((prev) => ({
            ...prev,
            submissionId: res.data.data[0].id,
            payRate: String(res.data.data[0].payRate),
            billRate: String(res.data.data[0].billRate),
          }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlacements();
    fetchSubmissions();
    if (searchParams.get('action') === 'new') {
      setOpenCreate(true);
    }
  }, []);

  const handleCreate = async () => {
    if (!formData.submissionId || !formData.startDate) {
      alert('Please fill Submission and Start Date');
      return;
    }
    try {
      const res = await apiClient.placements.createPlacement(formData);
      if (res.data.success) {
        setOpenCreate(false);
        fetchPlacements();
        alert('Placement confirmed and recorded successfully!');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create placement');
    }
  };

  const totalMarginHourly = placements.reduce((sum, p) => sum + (p.grossMargin || (p.billRate - p.payRate)), 0);
  const avgMargin = placements.length > 0 ? (totalMarginHourly / placements.length).toFixed(2) : '0.00';

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Staffing Placements & Billing Margins
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Active consultant placements, billing margins, contract start/end dates, and revenue realization.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setOpenCreate(true)}
          sx={{ bgcolor: '#1E3A8A' }}
        >
          Record Placement
        </Button>
      </Box>

      {/* Summary KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
                ACTIVE CONSULTANTS ON BILLING
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5 }}>
                {placements.length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>
                100% Onboarding Compliance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
                AVERAGE GROSS PROFIT SPREAD
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#059669', mt: 0.5 }}>
                ${avgMargin}/hr
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Bill Rate minus Pay Rate spread
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
                ESTIMATED MONTHLY REVENUE SPREAD
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#1E3A8A', mt: 0.5 }}>
                ${(totalMarginHourly * 160).toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Based on 160 standard billable hours/mo
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Placements Table */}
      <Paper sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Consultant Candidate</TableCell>
                <TableCell>Job Requisition</TableCell>
                <TableCell>Client Account</TableCell>
                <TableCell>Start & End Date</TableCell>
                <TableCell>Pay Rate</TableCell>
                <TableCell>Bill Rate</TableCell>
                <TableCell>Gross Margin ($/hr)</TableCell>
                <TableCell>Recruiter</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {placements.map((p) => {
                const margin = p.grossMargin || p.billRate - p.payRate;
                return (
                  <TableRow key={p.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Award size={18} color="#D97706" />
                        {p.candidate?.firstName} {p.candidate?.lastName}
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        {p.candidate?.candidateCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E3A8A' }}>
                        {p.job?.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        {p.job?.jobCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Building2 size={14} color="#64748B" />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {p.clientAccount?.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {new Date(p.startDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        {p.endDate ? `to ${new Date(p.endDate).toLocaleDateString()}` : 'Long term'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ${p.payRate.toFixed(2)}/hr
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E3A8A' }}>
                        ${p.billRate.toFixed(2)}/hr
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`+$${margin.toFixed(2)}/hr`}
                        size="small"
                        sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 800 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {p.recruiter ? `${p.recruiter.firstName} ${p.recruiter.lastName}` : 'Direct'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={p.status}
                        size="small"
                        sx={{ bgcolor: '#EFF6FF', color: '#1E3A8A', fontWeight: 700 }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Record Placement Modal */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Record Candidate Placement & Offer</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Selected Candidate Submittal *"
                value={formData.submissionId}
                onChange={(e) => {
                  const sub = submissions.find((s) => s.id === e.target.value);
                  setFormData({
                    ...formData,
                    submissionId: e.target.value,
                    payRate: sub ? String(sub.payRate) : formData.payRate,
                    billRate: sub ? String(sub.billRate) : formData.billRate,
                  });
                }}
              >
                {submissions.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.candidate?.firstName} {s.candidate?.lastName} — {s.job?.title} ({s.clientAccount?.name})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Placement Start Date *"
                InputLabelProps={{ shrink: true }}
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Contract End Date (Optional)"
                InputLabelProps={{ shrink: true }}
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Candidate Pay Rate ($/hr) *"
                value={formData.payRate}
                onChange={(e) => setFormData({ ...formData, payRate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Client Bill Rate ($/hr) *"
                value={formData.billRate}
                onChange={(e) => setFormData({ ...formData, billRate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: '#059669', fontWeight: 800, display: 'block', mb: 1 }}>
                Gross Profit Spread: ${(parseFloat(formData.billRate || '0') - parseFloat(formData.payRate || '0')).toFixed(2)}/hr
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Onboarding & Placement Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} sx={{ bgcolor: '#1E3A8A' }}>
            Confirm Placement
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
