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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
  Rating,
  Alert,
} from '@mui/material';
import { CalendarCheck2, Plus, Video, Clock, Star, ExternalLink, CheckCircle } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useSearchParams } from 'react-router-dom';

const US_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (EST/EDT)' },
  { value: 'America/Chicago', label: 'Central Time (CST/CDT)' },
  { value: 'America/Denver', label: 'Mountain Time (MST/MDT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PST/PDT)' },
];

export const Interviews: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [openSchedule, setOpenSchedule] = useState(false);
  const [openFeedback, setOpenFeedback] = useState<any | null>(null);

  // Schedule Form
  const [scheduleForm, setScheduleForm] = useState({
    submissionId: '',
    interviewRound: 'Technical Interview',
    interviewType: 'Video',
    interviewerName: '',
    interviewerEmail: '',
    scheduledAt: '',
    timezone: 'America/New_York',
    meetingUrl: '',
  });

  // Feedback Form
  const [feedbackForm, setFeedbackForm] = useState({
    technicalRating: 5,
    communicationRating: 5,
    overallRating: 5,
    recommendation: 'StrongHire',
    outcome: 'Selected',
    feedbackNotes: '',
  });

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await apiClient.interviews.getInterviews();
      if (res.data.success) {
        setInterviews(res.data.data);
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
        const urlSubId = searchParams.get('submissionId');
        if (urlSubId) {
          setScheduleForm((prev) => ({ ...prev, submissionId: urlSubId }));
        } else if (res.data.data.length > 0) {
          setScheduleForm((prev) => ({ ...prev, submissionId: res.data.data[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInterviews();
    fetchSubmissions();
    if (searchParams.get('action') === 'new') {
      setOpenSchedule(true);
    }
  }, []);

  const handleSchedule = async () => {
    if (!scheduleForm.submissionId || !scheduleForm.interviewerName || !scheduleForm.scheduledAt) {
      alert('Please fill Submission, Interviewer Name, and Date/Time');
      return;
    }
    try {
      const res = await apiClient.interviews.scheduleInterview(scheduleForm);
      if (res.data.success) {
        setOpenSchedule(false);
        fetchInterviews();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule interview');
    }
  };

  const handleSaveFeedback = async () => {
    if (!openFeedback) return;
    try {
      const res = await apiClient.interviews.recordFeedback(openFeedback.id, feedbackForm);
      if (res.data.success) {
        setOpenFeedback(null);
        fetchInterviews();
        alert('Feedback submitted and candidate stage updated!');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save feedback');
    }
  };

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Interview Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Schedule multi-round interviews with full US timezone support (EST, CST, MST, PST) and capture structured feedback.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setOpenSchedule(true)}
          sx={{ bgcolor: '#1E3A8A' }}
        >
          Schedule Interview
        </Button>
      </Box>

      {/* Interviews Table */}
      <Paper sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Candidate</TableCell>
                <TableCell>Requisition & Client</TableCell>
                <TableCell>Round & Type</TableCell>
                <TableCell>Date & US Timezone</TableCell>
                <TableCell>Interviewer</TableCell>
                <TableCell>Meeting Link</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {interviews.map((iv) => (
                <TableRow key={iv.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>
                    {iv.candidate?.firstName} {iv.candidate?.lastName}
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E3A8A' }}>
                      {iv.job?.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      {iv.job?.account?.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={iv.interviewRound} size="small" sx={{ fontWeight: 600, bgcolor: '#EFF6FF', color: '#1E3A8A' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Clock size={13} color="#2563EB" />
                      {new Date(iv.scheduledAt).toLocaleDateString()} at{' '}
                      {new Date(iv.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      {iv.timezone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{iv.interviewerName}</Typography>
                  </TableCell>
                  <TableCell>
                    {iv.meetingUrl ? (
                      <Button
                        size="small"
                        href={iv.meetingUrl}
                        target="_blank"
                        startIcon={<Video size={13} />}
                        sx={{ fontSize: '0.75rem', py: 0.2 }}
                      >
                        Join Call
                      </Button>
                    ) : (
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>No link</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={iv.status}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: iv.status === 'Completed' ? '#ECFDF5' : '#EFF6FF',
                        color: iv.status === 'Completed' ? '#059669' : '#1E3A8A',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {iv.status === 'Completed' ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Rating value={iv.overallRating || 5} readOnly size="small" />
                        <Chip label={iv.outcome || 'Passed'} size="small" sx={{ bgcolor: '#D1FAE5', color: '#065F46', fontWeight: 700 }} />
                      </Box>
                    ) : (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<Star size={13} />}
                        onClick={() => setOpenFeedback(iv)}
                        sx={{ fontSize: '0.75rem', py: 0.3 }}
                      >
                        Record Feedback
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Schedule Interview Modal */}
      <Dialog open={openSchedule} onClose={() => setOpenSchedule(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Schedule Client Interview</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Candidate Submittal *"
                value={scheduleForm.submissionId}
                onChange={(e) => setScheduleForm({ ...scheduleForm, submissionId: e.target.value })}
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
                select
                fullWidth
                label="Interview Round"
                value={scheduleForm.interviewRound}
                onChange={(e) => setScheduleForm({ ...scheduleForm, interviewRound: e.target.value })}
              >
                <MenuItem value="Technical Interview">Technical Interview</MenuItem>
                <MenuItem value="Client Hiring Manager">Client Hiring Manager</MenuItem>
                <MenuItem value="Coding & Architecture">Coding & Architecture</MenuItem>
                <MenuItem value="Final Culture & HR">Final Culture & HR</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Interview Type"
                value={scheduleForm.interviewType}
                onChange={(e) => setScheduleForm({ ...scheduleForm, interviewType: e.target.value })}
              >
                <MenuItem value="Video">Video Call (Zoom/Teams/Meet)</MenuItem>
                <MenuItem value="Phone">Phone Screen</MenuItem>
                <MenuItem value="InPerson">In-Person Onsite</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Interviewer Name / Panel *"
                placeholder="David Miller (VP Engineering)"
                value={scheduleForm.interviewerName}
                onChange={(e) => setScheduleForm({ ...scheduleForm, interviewerName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Date & Time *"
                InputLabelProps={{ shrink: true }}
                value={scheduleForm.scheduledAt}
                onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="US Timezone *"
                value={scheduleForm.timezone}
                onChange={(e) => setScheduleForm({ ...scheduleForm, timezone: e.target.value })}
              >
                {US_TIMEZONES.map((tz) => (
                  <MenuItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meeting URL (Zoom / Microsoft Teams / Google Meet)"
                placeholder="https://teams.microsoft.com/..."
                value={scheduleForm.meetingUrl}
                onChange={(e) => setScheduleForm({ ...scheduleForm, meetingUrl: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenSchedule(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSchedule} sx={{ bgcolor: '#1E3A8A' }}>
            Confirm & Send Invites
          </Button>
        </DialogActions>
      </Dialog>

      {/* Record Interview Feedback Modal */}
      <Dialog open={Boolean(openFeedback)} onClose={() => setOpenFeedback(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Record Interview Feedback & Evaluation</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Box sx={{ p: 2, mb: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Candidate: {openFeedback?.candidate?.firstName} {openFeedback?.candidate?.lastName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
              Role: <strong>{openFeedback?.job?.title}</strong> • Round: {openFeedback?.interviewRound}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Technical Depth Rating (1-5)
            </Typography>
            <Rating
              value={feedbackForm.technicalRating}
              onChange={(e, val) => setFeedbackForm({ ...feedbackForm, technicalRating: val || 5 })}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Communication & Client Fit (1-5)
            </Typography>
            <Rating
              value={feedbackForm.communicationRating}
              onChange={(e, val) => setFeedbackForm({ ...feedbackForm, communicationRating: val || 5 })}
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Hiring Recommendation"
                value={feedbackForm.recommendation}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, recommendation: e.target.value })}
              >
                <MenuItem value="StrongHire">Strong Hire (Top 5%)</MenuItem>
                <MenuItem value="Hire">Hire</MenuItem>
                <MenuItem value="Hold">Hold / Backup</MenuItem>
                <MenuItem value="Reject">Reject</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Interview Outcome"
                value={feedbackForm.outcome}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, outcome: e.target.value })}
              >
                <MenuItem value="Selected">Selected for Offer 🎉</MenuItem>
                <MenuItem value="NextRound">Passed to Next Round</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Client Interviewer Notes & Observations"
                placeholder="Candidate demonstrated exceptional Spring Boot microservices skills, clear communication..."
                value={feedbackForm.feedbackNotes}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, feedbackNotes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenFeedback(null)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleSaveFeedback}>
            Save Feedback & Advance Stage
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
