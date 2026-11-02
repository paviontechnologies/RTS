import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Rating,
  Grid,
  Alert,
} from '@mui/material';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Send,
  Building,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export const ClientFeedback: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [openFeedbackModal, setOpenFeedbackModal] = useState(false);
  const [feedbackDecision, setFeedbackDecision] = useState('Shortlisted');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [rating, setRating] = useState<number | null>(4);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await apiClient.submissions.getSubmissions();
      if (res.data.success) {
        setSubmissions(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleSaveFeedback = async () => {
    if (!selectedSub) return;
    try {
      await apiClient.submissions.updateSubmissionStatus(selectedSub.id, {
        status: feedbackDecision,
        clientFeedback: feedbackNotes,
        clientRating: rating,
      });
      setOpenFeedbackModal(false);
      fetchSubmissions();
      alert(`Client feedback recorded for candidate ${selectedSub.candidate?.firstName}!`);
    } catch (err: any) {
      alert(err.message || 'Failed to update feedback');
    }
  };

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          Client Feedback & Submission Decisions <MessageSquare size={24} color="#2563EB" />
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
          Account Manager portal to track candidate submissions, log hiring manager feedback, and coordinate client interview requests.
        </Typography>
      </Box>

      {/* Submissions Feedback Table */}
      <Paper sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Submissions Awaiting Client Action
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Submitted Date</TableCell>
                <TableCell>Candidate Name</TableCell>
                <TableCell>Client Account</TableCell>
                <TableCell>Position Requisition</TableCell>
                <TableCell>Bill Rate / Pay Rate</TableCell>
                <TableCell>Gross Margin</TableCell>
                <TableCell>Client Decision Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4, color: '#64748B' }}>
                    No client submissions recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((sub) => (
                  <TableRow key={sub.id} hover>
                    <TableCell>{new Date(sub.submittedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {sub.candidate?.firstName} {sub.candidate?.lastName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        {sub.candidate?.currentTitle || 'Engineer'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {sub.clientAccount?.name || 'Enterprise Client'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{sub.job?.title || 'Open Requisition'}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontFamily: 'monospace' }}>
                        {sub.job?.jobCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      ${sub.billRate}/hr | ${sub.payRate}/hr
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#059669' }}>
                      +${(sub.billRate - sub.payRate).toFixed(2)}/hr
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={sub.status}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor:
                            sub.status === 'Shortlisted'
                              ? '#ECFDF5'
                              : sub.status === 'Interview Requested'
                              ? '#EFF6FF'
                              : sub.status === 'Rejected'
                              ? '#FEE2E2'
                              : '#FEF3C7',
                          color:
                            sub.status === 'Shortlisted'
                              ? '#059669'
                              : sub.status === 'Interview Requested'
                              ? '#1E3A8A'
                              : sub.status === 'Rejected'
                              ? '#DC2626'
                              : '#D97706',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          setSelectedSub(sub);
                          setFeedbackDecision(sub.status || 'Shortlisted');
                          setFeedbackNotes(sub.clientFeedback || '');
                          setOpenFeedbackModal(true);
                        }}
                        sx={{ bgcolor: '#1E3A8A', fontWeight: 600 }}
                      >
                        Log Feedback
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Log Feedback Dialog */}
      <Dialog open={openFeedbackModal} onClose={() => setOpenFeedbackModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Log Client Feedback & Next Steps</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          {selectedSub && (
            <Box>
              <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
                Logging decision for <strong>{selectedSub.candidate?.firstName} {selectedSub.candidate?.lastName}</strong> submitted to <strong>{selectedSub.clientAccount?.name}</strong>.
              </Alert>

              <TextField
                select
                fullWidth
                label="Client Decision Status *"
                value={feedbackDecision}
                onChange={(e) => setFeedbackDecision(e.target.value)}
                sx={{ mb: 2 }}
              >
                <MenuItem value="Shortlisted">✅ Shortlisted (Proceed to Interview)</MenuItem>
                <MenuItem value="Interview Requested">📅 Client Interview Requested</MenuItem>
                <MenuItem value="Offer Extended">🎉 Offer Extended by Client</MenuItem>
                <MenuItem value="On Hold">⏸️ On Hold (Client reviewing other resumes)</MenuItem>
                <MenuItem value="Rejected">❌ Rejected (Skills mismatch / rate issue)</MenuItem>
              </TextField>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 0.5 }}>
                  Hiring Manager Rating
                </Typography>
                <Rating value={rating} onChange={(e, val) => setRating(val)} />
              </Box>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Client Feedback Notes & Technical Comments"
                placeholder="Client liked AWS experience, requested 45-min Zoom technical round on Thursday..."
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenFeedbackModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveFeedback} sx={{ bgcolor: '#1E3A8A' }}>
            Save Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
