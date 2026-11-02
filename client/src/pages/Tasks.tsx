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
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
} from '@mui/material';
import { CheckSquare, Plus, Clock, User } from 'lucide-react';
import { apiClient } from '../api/client';
import { useSearchParams } from 'react-router-dom';

export const Tasks: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState<any[]>([]);
  const [openCreate, setOpenCreate] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'High',
    dueAt: '',
    relatedEntityType: 'General',
  });

  const fetchTasks = async () => {
    try {
      const res = await apiClient.crm.getTasks();
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (searchParams.get('action') === 'new') {
      setOpenCreate(true);
    }
  }, []);

  const handleToggleStatus = async (task: any) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await apiClient.crm.updateTask(task.id, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    if (!formData.title) {
      alert('Task title is required');
      return;
    }
    try {
      const res = await apiClient.crm.createTask(formData);
      if (res.data.success) {
        setOpenCreate(false);
        setFormData({
          title: '',
          description: '',
          priority: 'High',
          dueAt: '',
          relatedEntityType: 'General',
        });
        fetchTasks();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create task');
    }
  };

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Task & Action Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Recruiter follow-ups, client submission reviews, and onboarding reminders.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setOpenCreate(true)}
          sx={{ bgcolor: '#1E3A8A' }}
        >
          Create Task
        </Button>
      </Box>

      {/* Tasks Table */}
      <Paper sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={50}>Done</TableCell>
                <TableCell>Task Title</TableCell>
                <TableCell>Related Module</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Assigned Owner</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((t) => {
                const isDone = t.status === 'Completed';
                return (
                  <TableRow key={t.id} hover sx={{ bgcolor: isDone ? '#F8FAFC' : '#FFFFFF' }}>
                    <TableCell>
                      <Checkbox
                        checked={isDone}
                        onChange={() => handleToggleStatus(t)}
                        color="success"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: isDone ? '#94A3B8' : '#0F172A',
                          textDecoration: isDone ? 'line-through' : 'none',
                        }}
                      >
                        {t.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={t.relatedEntityType || 'General'} size="small" sx={{ bgcolor: '#F1F5F9', fontWeight: 600 }} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t.priority}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: t.priority === 'Urgent' ? '#FEF2F2' : t.priority === 'High' ? '#FFFBEB' : '#F1F5F9',
                          color: t.priority === 'Urgent' ? '#DC2626' : t.priority === 'High' ? '#D97706' : '#475569',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <User size={13} color="#64748B" />
                        {t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : 'Unassigned'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {t.dueAt ? (
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Clock size={13} color="#2563EB" />
                          {new Date(t.dueAt).toLocaleDateString()}
                        </Typography>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>No deadline</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t.status}
                        size="small"
                        sx={{
                          bgcolor: isDone ? '#ECFDF5' : '#EFF6FF',
                          color: isDone ? '#059669' : '#1E3A8A',
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create Task Modal */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create New Task</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title *"
                placeholder="e.g. Schedule technical prep call with candidate"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Urgent">Urgent</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Related Module"
                value={formData.relatedEntityType}
                onChange={(e) => setFormData({ ...formData, relatedEntityType: e.target.value })}
              >
                <MenuItem value="General">General</MenuItem>
                <MenuItem value="Lead">Lead Follow-up</MenuItem>
                <MenuItem value="Job">Job Sourcing</MenuItem>
                <MenuItem value="Candidate">Candidate Check-in</MenuItem>
                <MenuItem value="Interview">Interview Prep</MenuItem>
                <MenuItem value="Placement">Onboarding & Compliance</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Due Date"
                InputLabelProps={{ shrink: true }}
                value={formData.dueAt}
                onChange={(e) => setFormData({ ...formData, dueAt: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Task Details"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} sx={{ bgcolor: '#1E3A8A' }}>
            Save Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
