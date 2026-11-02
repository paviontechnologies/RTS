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
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import { Send, MoreVertical, CalendarCheck2, Building2, User, CheckCircle, ExternalLink } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useNavigate } from 'react-router-dom';

const SUBMISSION_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Submitted: { bg: '#EFF6FF', text: '#1E3A8A' },
  UnderReview: { bg: '#F1F5F9', text: '#475569' },
  Shortlisted: { bg: '#ECFDF5', text: '#059669' },
  InterviewRequested: { bg: '#FEF3C7', text: '#D97706' },
  Selected: { bg: '#D1FAE5', text: '#065F46' },
  Rejected: { bg: '#FEE2E2', text: '#991B1B' },
  Withdrawn: { bg: '#F3F4F6', text: '#6B7280' },
};

export const Submissions: React.FC = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | { el: HTMLElement; subId: string }>(null);

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

  const handleUpdateStatus = async (newStatus: string) => {
    if (!statusMenuAnchor) return;
    try {
      await apiClient.submissions.updateSubmissionStatus(statusMenuAnchor.subId, { status: newStatus });
      setStatusMenuAnchor(null);
      fetchSubmissions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Client Submissions Log
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Track client-facing candidate profiles, feedback response times, pay vs bill rate spreads, and interview requests.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Send size={16} />}
          onClick={() => navigate('/ats/pipeline')}
          sx={{ bgcolor: '#1E3A8A' }}
        >
          Submit via Pipeline Board
        </Button>
      </Box>

      {/* Submissions Table */}
      <Paper sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Candidate</TableCell>
                <TableCell>Job Requisition</TableCell>
                <TableCell>Client Account</TableCell>
                <TableCell>Submitted Date</TableCell>
                <TableCell>Compensation (Pay / Bill)</TableCell>
                <TableCell>Spread Margin</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Client Feedback</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((sub) => {
                const margin = sub.billRate - sub.payRate;
                const statusStyle = SUBMISSION_STATUS_COLORS[sub.status] || { bg: '#F1F5F9', text: '#475569' };

                return (
                  <TableRow key={sub.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <User size={16} color="#2563EB" />
                        {sub.candidate?.firstName} {sub.candidate?.lastName}
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                        {sub.candidate?.candidateCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E3A8A' }}>
                        {sub.job?.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        {sub.job?.jobCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Building2 size={14} color="#64748B" />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {sub.clientAccount?.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ${sub.payRate}/hr (Pay) • ${sub.billRate}/hr (Bill)
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
                      <Chip
                        label={sub.status}
                        size="small"
                        sx={{ bgcolor: statusStyle.bg, color: statusStyle.text, fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      <Typography variant="caption" sx={{ color: '#475569', fontStyle: 'italic', display: 'block' }}>
                        {sub.clientFeedback || 'Pending review by client talent team.'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          navigate(`/ats/interviews?action=new&submissionId=${sub.id}`)
                        }
                        startIcon={<CalendarCheck2 size={13} />}
                        sx={{ py: 0.3, fontSize: '0.75rem', mr: 1 }}
                      >
                        Interview
                      </Button>
                      <IconButton
                        size="small"
                        onClick={(e) => setStatusMenuAnchor({ el: e.currentTarget, subId: sub.id })}
                      >
                        <MoreVertical size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Change Status Menu */}
      <Menu
        anchorEl={statusMenuAnchor?.el}
        open={Boolean(statusMenuAnchor)}
        onClose={() => setStatusMenuAnchor(null)}
      >
        <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', fontWeight: 700, color: '#94A3B8' }}>
          UPDATE SUBMISSION STATUS
        </Typography>
        {['Submitted', 'UnderReview', 'Shortlisted', 'InterviewRequested', 'Selected', 'Rejected', 'Withdrawn'].map((st) => (
          <MenuItem key={st} onClick={() => handleUpdateStatus(st)}>
            {st}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
