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
  MenuItem,
  TextField,
  Card,
  CardContent,
  Alert,
  Avatar,
} from '@mui/material';
import {
  Users2,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  Send,
  Building,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export const RecruiterCoordination: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedRecruiterId, setSelectedRecruiterId] = useState('');
  const [priority, setPriority] = useState('High');

  const fetchData = async () => {
    try {
      const [jobsRes, usersRes] = await Promise.all([
        apiClient.jobs.getJobs(),
        apiClient.settings.getUsers(),
      ]);
      if (jobsRes.data.success) setJobs(jobsRes.data.data);
      if (usersRes.data.success) {
        setRecruiters(usersRes.data.data.filter((u: any) => u.role.includes('Recruiter') || u.role === 'SuperAdmin'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignRecruiter = async () => {
    if (!selectedJob || !selectedRecruiterId) return;
    try {
      await apiClient.jobs.updateJob(selectedJob.id, {
        assignedRecruiterId: selectedRecruiterId,
        priority,
      });
      setOpenAssignModal(false);
      fetchData();
      alert(`Requisition ${selectedJob.jobCode} successfully assigned!`);
    } catch (err: any) {
      alert(err.message || 'Failed to assign recruiter');
    }
  };

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          Recruiter Coordination & Sourcing Coverage <Users2 size={24} color="#2563EB" />
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
          Account Manager portal to assign client requisitions, set recruitment priorities, track recruiter submission targets, and monitor coverage.
        </Typography>
      </Box>

      {/* Recruiter Team Coverage Summary Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {recruiters.map((rec) => {
          const assignedCount = jobs.filter((j) => j.assignedRecruiterId === rec.id).length;
          return (
            <Grid item xs={12} sm={6} md={3} key={rec.id}>
              <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Avatar sx={{ bgcolor: '#1E3A8A', width: 36, height: 36, fontWeight: 700, fontSize: '0.9rem' }}>
                      {rec.firstName[0]}{rec.lastName[0]}
                    </Avatar>
                    <Box sx={{ overflow: 'hidden' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {rec.firstName} {rec.lastName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        {rec.role}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                      Active Requisitions
                    </Typography>
                    <Chip
                      label={`${assignedCount} Jobs`}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: assignedCount > 2 ? '#FEF3C7' : '#EFF6FF',
                        color: assignedCount > 2 ? '#D97706' : '#1E3A8A',
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Requisition Assignment Table */}
      <Paper sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Client Job Requirements Assignment Matrix
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job Code</TableCell>
                <TableCell>Client Account</TableCell>
                <TableCell>Position Title</TableCell>
                <TableCell>Assigned Recruiter</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Bill Rate / Pay Rate</TableCell>
                <TableCell>Submissions</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                    {job.jobCode}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {job.account?.name || 'Direct Client'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{job.title}</TableCell>
                  <TableCell>
                    {job.assignedRecruiter ? (
                      <Chip
                        icon={<UserCheck size={14} />}
                        label={`${job.assignedRecruiter.firstName} ${job.assignedRecruiter.lastName}`}
                        size="small"
                        sx={{ bgcolor: '#EFF6FF', color: '#1E3A8A', fontWeight: 700 }}
                      />
                    ) : (
                      <Chip
                        icon={<AlertCircle size={14} />}
                        label="Unassigned"
                        size="small"
                        sx={{ bgcolor: '#FEE2E2', color: '#DC2626', fontWeight: 700 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={job.priority || 'Medium'}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor:
                          job.priority === 'Urgent'
                            ? '#FEE2E2'
                            : job.priority === 'High'
                            ? '#FEF3C7'
                            : '#F1F5F9',
                        color:
                          job.priority === 'Urgent'
                            ? '#DC2626'
                            : job.priority === 'High'
                            ? '#D97706'
                            : '#475569',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    ${job.billRateMax || 95}/hr | ${job.payRateMax || 75}/hr
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${job._count?.submissions || 0} Submissions`}
                      size="small"
                      sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setSelectedJob(job);
                        setSelectedRecruiterId(job.assignedRecruiterId || '');
                        setPriority(job.priority || 'High');
                        setOpenAssignModal(true);
                      }}
                      sx={{ fontWeight: 600 }}
                    >
                      {job.assignedRecruiterId ? 'Reassign' : 'Assign'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Assign Modal */}
      <Dialog open={openAssignModal} onClose={() => setOpenAssignModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Assign Sourcing Recruiter</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          {selectedJob && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2, color: '#64748B' }}>
                Assign <strong>{selectedJob.title}</strong> ({selectedJob.jobCode}) to a recruiter to begin candidate sourcing.
              </Typography>

              <TextField
                select
                fullWidth
                label="Select Recruiter *"
                value={selectedRecruiterId}
                onChange={(e) => setSelectedRecruiterId(e.target.value)}
                sx={{ mb: 2 }}
              >
                {recruiters.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.firstName} {r.lastName} ({r.role})
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Recruitment Priority *"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <MenuItem value="Urgent">🔥 Urgent (Submissions within 24h)</MenuItem>
                <MenuItem value="High">⚡ High (Submissions within 48h)</MenuItem>
                <MenuItem value="Medium">Medium Priority</MenuItem>
                <MenuItem value="Normal">Normal</MenuItem>
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAssignModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignRecruiter} sx={{ bgcolor: '#1E3A8A' }}>
            Confirm Assignment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
