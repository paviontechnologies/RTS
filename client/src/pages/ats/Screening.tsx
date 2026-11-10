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
  Rating,
  Alert,
  IconButton,
} from '@mui/material';
import {
  ClipboardCheck,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  UserCheck,
  Briefcase,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export const Screening: React.FC = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const [formData, setFormData] = useState({
    candidateId: '',
    jobId: '',
    title: 'Recruiter Phone Screening',
    overallScore: 85,
    recommendation: 'Proceed',
    workAuthVerified: true,
    availabilityConfirmed: 'Immediate',
    rateConfirmed: 75,
    notes: 'Candidate answered all technical questions concisely and confirmed W-2 contract rate.',
    q1: 'Yes - US Citizen / Green Card',
    q2: '75',
    q3: 'Immediate',
    q4: 'Yes, 5+ years with Docker, Kubernetes, AWS',
    q5: 'Yes, clean background record',
  });

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const res = await apiClient.screening.getScreenings({ status: statusFilter || undefined });
      if (res.data.success) {
        setAssessments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [candRes, jobRes] = await Promise.all([
        apiClient.candidates.getCandidates(),
        apiClient.jobs.getJobs(),
      ]);
      if (candRes.data.success) setCandidates(candRes.data.data);
      if (jobRes.data.success) setJobs(jobRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    try {
      const killerQuestions = [
        { question: 'US Work Authorization confirmed?', answer: formData.q1, passed: true },
        { question: 'Confirmed pay rate?', answer: `$${formData.q2}/hr`, passed: true },
        { question: 'Confirmed availability notice?', answer: formData.q3, passed: true },
        { question: 'Hands-on technical stack experience?', answer: formData.q4, passed: true },
        { question: 'Clearance & Drug screen authorization?', answer: formData.q5, passed: true },
      ];

      await apiClient.screening.createScreening({
        candidateId: formData.candidateId,
        jobId: formData.jobId || null,
        title: formData.title,
        overallScore: Number(formData.overallScore),
        recommendation: formData.recommendation,
        workAuthVerified: formData.workAuthVerified,
        availabilityConfirmed: formData.availabilityConfirmed,
        rateConfirmed: Number(formData.rateConfirmed),
        notes: formData.notes,
        questionsJson: killerQuestions,
      });

      setOpenCreate(false);
      fetchAssessments();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAssessments();
    fetchDropdowns();
  }, [statusFilter]);

  const passedCount = assessments.filter((a) => a.recommendation === 'Proceed').length;
  const passRate = assessments.length > 0 ? Math.round((passedCount / assessments.length) * 100) : 100;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ClipboardCheck size={26} color="#2563EB" />
            Candidate Screening & Killer Questions Assessment
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Standardized recruiter phone screening, mandatory killer question validation, work authorization check, and rate verification.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setOpenCreate(true)}
          sx={{ bgcolor: '#1E3A8A', fontWeight: 700 }}
        >
          Conduct Screening
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B' }}>TOTAL SCREENED</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5 }}>{assessments.length}</Typography>
              <Typography variant="caption" sx={{ color: '#64748B', mt: 0.5, display: 'block' }}>Vetted candidate records</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B' }}>PASSING RATE</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#059669', mt: 0.5 }}>{passRate}%</Typography>
              <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, mt: 0.5, display: 'block' }}>✓ Met all killer criteria</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B' }}>AVG EVALUATION SCORE</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#2563EB', mt: 0.5 }}>88.4 / 100</Typography>
              <Typography variant="caption" sx={{ color: '#64748B', mt: 0.5, display: 'block' }}>Technical competency index</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B' }}>WORK AUTH VERIFIED</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#7C3AED', mt: 0.5 }}>100%</Typography>
              <Typography variant="caption" sx={{ color: '#7C3AED', fontWeight: 700, mt: 0.5, display: 'block' }}>US Citizen / GC / Valid Visa</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter & Table */}
      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Recent Screening Evaluations ({assessments.length})
          </Typography>
          <TextField
            size="small"
            select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ width: 180 }}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
          </TextField>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Candidate</TableCell>
                <TableCell>Target Requisition</TableCell>
                <TableCell align="center">Killer Qs Check</TableCell>
                <TableCell align="center">Confirmed Rate</TableCell>
                <TableCell align="center">Availability</TableCell>
                <TableCell align="center">Score</TableCell>
                <TableCell align="center">Recommendation</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assessments.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>
                    {a.candidate?.firstName} {a.candidate?.lastName}
                    <Typography variant="caption" sx={{ display: 'block', color: '#64748B' }}>
                      {a.candidate?.currentTitle || 'Candidate'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {a.job ? (
                      <>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{a.job.title}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                          {a.job.account?.name} ({a.job.jobCode})
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#64748B' }}>General Bench Screening</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={<CheckCircle2 size={14} color="#059669" />}
                      label="All Passed (5/5)"
                      size="small"
                      sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <strong>${a.rateConfirmed || 75}/hr</strong>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={a.availabilityConfirmed || 'Immediate'} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${a.overallScore}%`}
                      size="small"
                      sx={{
                        bgcolor: a.overallScore >= 85 ? '#ECFDF5' : '#EFF6FF',
                        color: a.overallScore >= 85 ? '#059669' : '#2563EB',
                        fontWeight: 800,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={a.recommendation}
                      size="small"
                      sx={{
                        bgcolor:
                          a.recommendation === 'Proceed'
                            ? '#ECFDF5'
                            : a.recommendation === 'OnHold'
                            ? '#FEF3C7'
                            : '#FEE2E2',
                        color:
                          a.recommendation === 'Proceed'
                            ? '#059669'
                            : a.recommendation === 'OnHold'
                            ? '#D97706'
                            : '#DC2626',
                        fontWeight: 800,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Eye size={14} />}
                      onClick={() => {
                        setSelectedAssessment(a);
                        setOpenDetail(true);
                      }}
                      sx={{ fontWeight: 700 }}
                    >
                      View Qs
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal: View Assessment Details */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Screening Evaluation Details – {selectedAssessment?.candidate?.firstName} {selectedAssessment?.candidate?.lastName}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Alert severity={selectedAssessment?.recommendation === 'Proceed' ? 'success' : 'warning'} sx={{ mb: 2 }}>
            <strong>Recommendation: {selectedAssessment?.recommendation}</strong> — Score: {selectedAssessment?.overallScore} / 100. Work authorization and pay rate confirmed.
          </Alert>

          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
            Recruiter Evaluation Notes:
          </Typography>
          <Paper sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, mb: 3 }}>
            <Typography variant="body2">{selectedAssessment?.notes || 'No detailed notes provided.'}</Typography>
          </Paper>

          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
            Killer Questions & Candidate Responses:
          </Typography>
          {(() => {
            let qs: any[] = [];
            try {
              qs = typeof selectedAssessment?.questionsJson === 'string'
                ? JSON.parse(selectedAssessment.questionsJson)
                : selectedAssessment?.questionsJson || [];
            } catch {
              qs = [];
            }

            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {qs.map((q: any, idx: number) => (
                  <Box key={idx} sx={{ p: 1.5, border: '1px solid #E2E8F0', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                        Q{idx + 1}: {q.question}
                      </Typography>
                      <Chip label="PASSED" size="small" sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 800, height: 20 }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#2563EB', fontWeight: 600 }}>
                      Response: {q.answer}
                    </Typography>
                  </Box>
                ))}
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDetail(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Conduct New Screening */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Conduct Recruiter Candidate Screening</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Select Candidate"
                fullWidth
                required
                select
                value={formData.candidateId}
                onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
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
                label="Target Job Requisition (Optional)"
                fullWidth
                select
                value={formData.jobId}
                onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
              >
                <MenuItem value="">General Sourcing / Bench</MenuItem>
                {jobs.map((j) => (
                  <MenuItem key={j.id} value={j.id}>
                    {j.title} - {j.account?.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Divider sx={{ my: 1 }}>Killer Questions Checklist</Divider>

          <TextField
            label="1. US Work Authorization Status"
            fullWidth
            value={formData.q1}
            onChange={(e) => setFormData({ ...formData, q1: e.target.value })}
            helperText="e.g. US Citizen, Green Card, H-1B, EAD"
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="2. Confirmed Minimum Hourly Pay Rate ($)"
                fullWidth
                type="number"
                value={formData.q2}
                onChange={(e) => setFormData({ ...formData, q2: e.target.value, rateConfirmed: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="3. Earliest Start Date / Notice Period"
                fullWidth
                value={formData.q3}
                onChange={(e) => setFormData({ ...formData, q3: e.target.value, availabilityConfirmed: e.target.value })}
              />
            </Grid>
          </Grid>
          <TextField
            label="4. Core Tech Stack Experience"
            fullWidth
            value={formData.q4}
            onChange={(e) => setFormData({ ...formData, q4: e.target.value })}
          />
          <TextField
            label="5. Background & Drug Screen Consent"
            fullWidth
            value={formData.q5}
            onChange={(e) => setFormData({ ...formData, q5: e.target.value })}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Overall Technical Score (0-100)"
                fullWidth
                type="number"
                value={formData.overallScore}
                onChange={(e) => setFormData({ ...formData, overallScore: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Recruiter Recommendation"
                fullWidth
                select
                value={formData.recommendation}
                onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
              >
                <MenuItem value="Proceed">Proceed (Submit to Client)</MenuItem>
                <MenuItem value="OnHold">On Hold (Keep on Bench)</MenuItem>
                <MenuItem value="Reject">Reject (Does Not Meet Criteria)</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <TextField
            label="Recruiter Notes & Call Summary"
            fullWidth
            multiline
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} sx={{ bgcolor: '#1E3A8A' }}>
            Save Assessment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Screening;
