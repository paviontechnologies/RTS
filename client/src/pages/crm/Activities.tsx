import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
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
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  PhoneCall,
  Mail,
  Calendar,
  Plus,
  Clock,
  TrendingUp,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export const Activities: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [openLogModal, setOpenLogModal] = useState(false);
  const [activityForm, setActivityForm] = useState({
    activityType: 'Call',
    relatedEntityType: 'Lead',
    relatedEntityId: '',
    subject: '',
    description: '',
  });

  const fetchActivities = async () => {
    try {
      const res = await apiClient.crm.getActivities();
      if (res.data.success) {
        setActivities(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleCreateActivity = async () => {
    if (!activityForm.subject) {
      alert('Please enter a subject');
      return;
    }
    try {
      await apiClient.crm.createActivity(activityForm);
      setOpenLogModal(false);
      setActivityForm({
        activityType: 'Call',
        relatedEntityType: 'Lead',
        relatedEntityId: '',
        subject: '',
        description: '',
      });
      fetchActivities();
      alert('Activity logged successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to log activity');
    }
  };

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            Sales Activities & Client Touchpoints <PhoneCall size={24} color="#2563EB" />
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Sales / BDE activity tracker for outbound prospect calls, introduction emails, client discovery meetings, and deal follow-ups.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setOpenLogModal(true)}
          sx={{ bgcolor: '#1E3A8A' }}
        >
          Log Sales Activity
        </Button>
      </Box>

      {/* KPI Overview */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                Total Prospect Calls
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E3A8A', mt: 0.5 }}>
                24 Calls
              </Typography>
              <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>
                +8 this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                Client Discovery Meetings
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#D97706', mt: 0.5 }}>
                7 Meetings
              </Typography>
              <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>
                3 Scheduled today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                Rate Card Proposals Sent
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#059669', mt: 0.5 }}>
                5 Proposals
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Total $380,000 value
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                Pending Follow-ups
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#DC2626', mt: 0.5 }}>
                4 Urgent
              </Typography>
              <Typography variant="caption" sx={{ color: '#DC2626', fontWeight: 600 }}>
                Due in next 24h
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Activity Log Table */}
      <Paper sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Recent Sales Interactions & Client Logs
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date & Time</TableCell>
                <TableCell>Interaction Type</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Related Entity</TableCell>
                <TableCell>Notes / Discussion Summary</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: '#64748B' }}>
                    No activities recorded yet. Click "Log Sales Activity" to record a call or meeting.
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {new Date(a.occurredAt || a.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={
                          a.activityType === 'Call' ? (
                            <PhoneCall size={14} />
                          ) : a.activityType === 'Meeting' ? (
                            <Calendar size={14} />
                          ) : (
                            <Mail size={14} />
                          )
                        }
                        label={a.activityType}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor:
                            a.activityType === 'Call'
                              ? '#EFF6FF'
                              : a.activityType === 'Meeting'
                              ? '#FEF3C7'
                              : '#F1F5F9',
                          color:
                            a.activityType === 'Call'
                              ? '#1E3A8A'
                              : a.activityType === 'Meeting'
                              ? '#D97706'
                              : '#475569',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{a.subject}</TableCell>
                    <TableCell>
                      <Chip label={a.relatedEntityType} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ color: '#475569', maxWidth: 400 }}>
                      {a.description || 'No notes provided'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Log Activity Dialog */}
      <Dialog open={openLogModal} onClose={() => setOpenLogModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Record Sales Interaction</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Interaction Type *"
                value={activityForm.activityType}
                onChange={(e) => setActivityForm({ ...activityForm, activityType: e.target.value })}
              >
                <MenuItem value="Call">📞 Phone Call</MenuItem>
                <MenuItem value="Meeting">🤝 Client Meeting / Zoom</MenuItem>
                <MenuItem value="Email">✉️ Email Outreach</MenuItem>
                <MenuItem value="Proposal">📄 Proposal Sent</MenuItem>
                <MenuItem value="Note">📝 General Note</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Related Entity *"
                value={activityForm.relatedEntityType}
                onChange={(e) => setActivityForm({ ...activityForm, relatedEntityType: e.target.value })}
              >
                <MenuItem value="Lead">Lead Inquiry</MenuItem>
                <MenuItem value="Account">Client Company</MenuItem>
                <MenuItem value="Opportunity">Sales Opportunity</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject / Topic *"
                placeholder="Initial discovery call with VP of Engineering..."
                value={activityForm.subject}
                onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Discussion Notes & Next Action Items"
                placeholder="Discussed 5 contract cloud requisitions, client agreed to send MSA draft by Friday..."
                value={activityForm.description}
                onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenLogModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateActivity} sx={{ bgcolor: '#1E3A8A' }}>
            Save Activity Log
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
