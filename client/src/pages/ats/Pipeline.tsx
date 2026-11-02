import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Chip,
  MenuItem,
  TextField,
  IconButton,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  Divider,
} from '@mui/material';
import {
  GitBranch,
  MoreVertical,
  CheckCircle2,
  FileCheck,
  Send,
  CalendarCheck2,
  Award,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PIPELINE_STAGES = [
  { id: 'New', label: '1. New Applied' },
  { id: 'ResumeReview', label: '2. Resume Review' },
  { id: 'Contacted', label: '3. Recruiter Contacted' },
  { id: 'Screening', label: '4. Technical Screening' },
  { id: 'Qualified', label: '5. Qualified' },
  { id: 'RTRPending', label: '6. RTR Pending' },
  { id: 'RTRReceived', label: '7. RTR Received ✍️' },
  { id: 'SubmittedToClient', label: '8. Submitted to Client 🚀' },
  { id: 'ClientReview', label: '9. Client Review' },
  { id: 'InterviewScheduled', label: '10. Interview Scheduled 📅' },
  { id: 'InterviewCompleted', label: '11. Interview Completed' },
  { id: 'Selected', label: '12. Selected 🌟' },
  { id: 'OfferReleased', label: '13. Offer Released' },
  { id: 'OfferAccepted', label: '14. Offer Accepted' },
  { id: 'BackgroundVerification', label: '15. Background Check (BGV)' },
  { id: 'HiredPlaced', label: '16. Hired / Placed 🏆' },
];

export const Pipeline: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [candidateJobs, setCandidateJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals & Menu
  const [activeCard, setActiveCard] = useState<any | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | { el: HTMLElement; cj: any }>(null);
  const [openRTRModal, setOpenRTRModal] = useState<any | null>(null);
  const [openSubmitModal, setOpenSubmitModal] = useState<any | null>(null);

  // RTR Form
  const [rtrForm, setRtrForm] = useState({
    consentMethod: 'Email',
    terms: 'Exclusive Right to Represent for client requisition',
    notes: 'Candidate confirmed via email consent',
  });

  // Submit Form
  const [submitForm, setSubmitForm] = useState({
    payRate: '75',
    billRate: '110',
    resumeVersion: 'v1.0 (Formatted)',
    clientFeedback: '',
  });

  const fetchJobs = async () => {
    try {
      const res = await apiClient.jobs.getJobs();
      if (res.data.success) {
        setJobs(res.data.data);
        const urlJobId = searchParams.get('jobId');
        if (urlJobId) {
          setSelectedJobId(urlJobId);
        } else if (res.data.data.length > 0) {
          setSelectedJobId(res.data.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCandidateJobs = async (jobId: string) => {
    if (!jobId) return;
    try {
      setLoading(true);
      const res = await apiClient.pipeline.getCandidateJobs({ jobId });
      if (res.data.success) {
        setCandidateJobs(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      fetchCandidateJobs(selectedJobId);
    }
  }, [selectedJobId]);

  const handleAdvanceStage = async (cjId: string, newStage: string) => {
    try {
      await apiClient.pipeline.updateStage(cjId, { stage: newStage });
      setMenuAnchor(null);
      fetchCandidateJobs(selectedJobId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update stage');
    }
  };

  const handleRecordRTR = async () => {
    if (!openRTRModal) return;
    try {
      await apiClient.pipeline.recordRTR(openRTRModal.id, rtrForm);
      setOpenRTRModal(null);
      fetchCandidateJobs(selectedJobId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record RTR');
    }
  };

  const handleSubmitToClient = async () => {
    if (!openSubmitModal) return;
    try {
      const res = await apiClient.submissions.createSubmission({
        candidateJobId: openSubmitModal.id,
        payRate: parseFloat(submitForm.payRate),
        billRate: parseFloat(submitForm.billRate),
        resumeVersion: submitForm.resumeVersion,
        clientFeedback: submitForm.clientFeedback,
      });

      if (res.data.success) {
        setOpenSubmitModal(null);
        fetchCandidateJobs(selectedJobId);
        alert(`Candidate submitted to client successfully!`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit candidate');
    }
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
      {/* Top Header & Job Selector */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
            Recruitment Pipeline Kanban <GitBranch size={24} color="#2563EB" />
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Complete 16-stage recruitment lifecycle with Right to Represent (RTR) enforcement and client submittals.
          </Typography>
        </Box>

        {/* Job Requisition Switcher */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            select
            size="small"
            label="Active Requisition"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            sx={{ minWidth: 340, bgcolor: '#FFFFFF' }}
          >
            {jobs.map((j) => (
              <MenuItem key={j.id} value={j.id}>
                {j.jobCode}: {j.title} ({j.account?.name})
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {/* Selected Job Overview Ribbon */}
      {selectedJob && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2.5,
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
              {selectedJob.jobCode} • {selectedJob.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Client: <strong>{selectedJob.account?.name}</strong> • Work Mode: <strong>{selectedJob.workMode}</strong> • Openings: <strong>{selectedJob.filledPositions}/{selectedJob.openings}</strong>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#059669' }}>
              Pay: ${selectedJob.payRateMin}-${selectedJob.payRateMax}/hr
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E3A8A' }}>
              Bill: ${selectedJob.billRateMin}-${selectedJob.billRateMax}/hr
            </Typography>
          </Box>
        </Paper>
      )}

      {/* 16-Stage Kanban Board */}
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 3, height: 'calc(100vh - 240px)' }}>
        {PIPELINE_STAGES.map((stage) => {
          const cardsInStage = candidateJobs.filter((cj) => cj.currentStage === stage.id);
          const isRTR = stage.id === 'RTRReceived';
          const isSubmitted = stage.id === 'SubmittedToClient';
          const isHired = stage.id === 'HiredPlaced';

          return (
            <Box
              key={stage.id}
              sx={{
                minWidth: 290,
                maxWidth: 290,
                bgcolor: isHired ? '#F0FDF4' : isSubmitted ? '#EFF6FF' : '#F8FAFC',
                borderRadius: 3,
                p: 1.5,
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Column Title */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, px: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.8rem', color: isHired ? '#059669' : '#0F172A' }}>
                  {stage.label}
                </Typography>
                <Chip
                  label={cardsInStage.length}
                  size="small"
                  sx={{
                    height: 20,
                    fontWeight: 700,
                    bgcolor: isHired ? '#DCFCE7' : '#E2E8F0',
                    color: isHired ? '#059669' : '#475569',
                  }}
                />
              </Box>

              {/* Candidates in Stage */}
              <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {cardsInStage.map((cj) => (
                  <Card
                    key={cj.id}
                    sx={{
                      bgcolor: '#FFFFFF',
                      borderRadius: 2,
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s',
                      '&:hover': { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                          {cj.candidate?.firstName} {cj.candidate?.lastName}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => setMenuAnchor({ el: e.currentTarget, cj })}
                        >
                          <MoreVertical size={14} />
                        </IconButton>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 0.5 }}>
                        {cj.candidate?.currentTitle || 'Software Engineer'} • {cj.candidate?.totalExperience} yrs
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600, display: 'block', mb: 1 }}>
                        {cj.candidate?.workAuthorization} • {cj.candidate?.city}, {cj.candidate?.state}
                      </Typography>

                      <Divider sx={{ my: 1 }} />

                      {/* Card Workflow Action Buttons */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {cj.currentStage === 'Qualified' && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ShieldCheck size={13} />}
                            onClick={() => setOpenRTRModal(cj)}
                            sx={{ fontSize: '0.7rem', py: 0.2 }}
                          >
                            Record RTR
                          </Button>
                        )}
                        {cj.currentStage === 'RTRReceived' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<Send size={13} />}
                            onClick={() => {
                              setSubmitForm({
                                payRate: String(cj.candidate?.expectedPayRate || 75),
                                billRate: String(selectedJob?.billRateMax || 110),
                                resumeVersion: 'v1.0 Formatted',
                                clientFeedback: '',
                              });
                              setOpenSubmitModal(cj);
                            }}
                            sx={{ fontSize: '0.7rem', py: 0.2, bgcolor: '#1E3A8A' }}
                          >
                            Submit to Client
                          </Button>
                        )}
                        {cj.currentStage === 'Selected' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<Award size={13} />}
                            onClick={() => navigate('/ats/placements?action=new')}
                            sx={{ fontSize: '0.7rem', py: 0.2 }}
                          >
                            Place Candidate
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="text"
                          endIcon={<ArrowRight size={12} />}
                          onClick={(e) => setMenuAnchor({ el: e.currentTarget, cj })}
                          sx={{ fontSize: '0.7rem', ml: 'auto' }}
                        >
                          Move Stage
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Stage Advance Menu */}
      <Menu
        anchorEl={menuAnchor?.el}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { maxHeight: 360, width: 240 } }}
      >
        <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', fontWeight: 700, color: '#94A3B8' }}>
          CHANGE PIPELINE STAGE
        </Typography>
        {PIPELINE_STAGES.map((s) => (
          <MenuItem
            key={s.id}
            onClick={() => handleAdvanceStage(menuAnchor!.cj.id, s.id)}
            sx={{ fontSize: '0.8rem', py: 0.8 }}
          >
            {s.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Record RTR Modal */}
      <Dialog open={Boolean(openRTRModal)} onClose={() => setOpenRTRModal(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Record Right to Represent (RTR)</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Recording candidate consent ensures compliant client submittals for{' '}
            <strong>{openRTRModal?.candidate?.firstName} {openRTRModal?.candidate?.lastName}</strong>.
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Consent Method"
                value={rtrForm.consentMethod}
                onChange={(e) => setRtrForm({ ...rtrForm, consentMethod: e.target.value })}
              >
                <MenuItem value="Email">Email Confirmation</MenuItem>
                <MenuItem value="ESignature">E-Signature Document</MenuItem>
                <MenuItem value="PhoneRecording">Voice / Phone Consent</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Terms of Representation"
                value={rtrForm.terms}
                onChange={(e) => setRtrForm({ ...rtrForm, terms: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Recruiter Notes"
                value={rtrForm.notes}
                onChange={(e) => setRtrForm({ ...rtrForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenRTRModal(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleRecordRTR} sx={{ bgcolor: '#1E3A8A' }}>
            Confirm RTR & Advance
          </Button>
        </DialogActions>
      </Dialog>

      {/* Submit Candidate to Client Modal */}
      <Dialog open={Boolean(openSubmitModal)} onClose={() => setOpenSubmitModal(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Submit Candidate to Client Account</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Box sx={{ p: 2, mb: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Candidate: {openSubmitModal?.candidate?.firstName} {openSubmitModal?.candidate?.lastName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
              Submitting for Requisition: <strong>{selectedJob?.title}</strong> ({selectedJob?.account?.name})
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Pay Rate to Candidate ($/hr) *"
                value={submitForm.payRate}
                onChange={(e) => setSubmitForm({ ...submitForm, payRate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Bill Rate to Client ($/hr) *"
                value={submitForm.billRate}
                onChange={(e) => setSubmitForm({ ...submitForm, billRate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, display: 'block', mb: 1 }}>
                Estimated Gross Profit Margin: ${(parseFloat(submitForm.billRate || '0') - parseFloat(submitForm.payRate || '0')).toFixed(2)}/hr
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Resume Version Tag"
                value={submitForm.resumeVersion}
                onChange={(e) => setSubmitForm({ ...submitForm, resumeVersion: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenSubmitModal(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitToClient} sx={{ bgcolor: '#1E3A8A' }}>
            Confirm Client Submittal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
