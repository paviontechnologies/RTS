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
  Mail,
  MessageSquare,
  Phone,
  Send,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  Users,
  Sparkles,
  Inbox,
  Calendar,
  Share2,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export const Communications: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [openSend, setOpenSend] = useState(false);
  const [openCreateTemplate, setOpenCreateTemplate] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Send Message Form
  const [sendForm, setSendForm] = useState({
    candidateId: '',
    channel: 'Email',
    subject: '',
    body: '',
    templateName: '',
  });

  // New Template Form
  const [templateForm, setTemplateForm] = useState({
    name: '',
    category: 'Interview',
    channel: 'Email',
    subject: '',
    body: '',
    variablesJson: ['candidate_name', 'job_title', 'client_name', 'date_time'],
  });

  const fetchData = async () => {
    try {
      const [logsRes, templatesRes, candRes] = await Promise.all([
        apiClient.communications.getLogs(),
        apiClient.communications.getTemplates(),
        apiClient.candidates.getCandidates(),
      ]);
      if (logsRes.data.success) setLogs(logsRes.data.data);
      if (templatesRes.data.success) setTemplates(templatesRes.data.data);
      if (candRes.data.success) setCandidates(candRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTemplateSelect = (tmpl: any) => {
    const selectedCand = candidates.find((c) => c.id === sendForm.candidateId);
    let resolvedBody = tmpl.body;
    let resolvedSubject = tmpl.subject;

    if (selectedCand) {
      resolvedBody = resolvedBody.replace(/{{candidate_name}}/g, `${selectedCand.firstName} ${selectedCand.lastName}`);
      resolvedSubject = resolvedSubject.replace(/{{candidate_name}}/g, `${selectedCand.firstName} ${selectedCand.lastName}`);
    }

    setSendForm({
      ...sendForm,
      channel: tmpl.channel || 'Email',
      subject: resolvedSubject,
      body: resolvedBody,
      templateName: tmpl.name,
    });
  };

  const handleSend = async () => {
    try {
      if (!sendForm.candidateId || !sendForm.body) {
        alert('Please select a candidate and provide message content.');
        return;
      }
      const res = await apiClient.communications.sendMessage(sendForm);
      if (res.data.success) {
        setSuccessMessage('Message sent and logged to candidate interaction history!');
        setOpenSend(false);
        fetchData();
        setSendForm({
          candidateId: '',
          channel: 'Email',
          subject: '',
          body: '',
          templateName: '',
        });
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send message');
    }
  };

  const handleCreateTemplate = async () => {
    try {
      if (!templateForm.name || !templateForm.body) {
        alert('Template Name and Message Body are required.');
        return;
      }
      const res = await apiClient.communications.createTemplate(templateForm);
      if (res.data.success) {
        setSuccessMessage('Message template saved successfully!');
        setOpenCreateTemplate(false);
        fetchData();
        setTemplateForm({
          name: '',
          category: 'Interview',
          channel: 'Email',
          subject: '',
          body: '',
          variablesJson: ['candidate_name', 'job_title', 'client_name'],
        });
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create template');
    }
  };

  // Metrics
  const totalLogs = logs.length;
  const emailCount = logs.filter((l) => l.channel === 'Email').length;
  const smsCount = logs.filter((l) => l.channel === 'SMS').length;
  const phoneCount = logs.filter((l) => l.channel === 'Phone').length;

  const filteredLogs = logs.filter((l) => {
    if (channelFilter === 'ALL') return true;
    return l.channel === channelFilter;
  });

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'SMS':
        return <MessageSquare size={16} color="#059669" />;
      case 'Phone':
        return <Phone size={16} color="#d97706" />;
      default:
        return <Mail size={16} color="#2563eb" />;
    }
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
            Candidate Communication & Engagement
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Omni-channel outreach logs (Email, SMS, Phone), reusable merge-tag templates, and full engagement auditing.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<FileText size={18} />}
            onClick={() => setOpenCreateTemplate(true)}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            New Template
          </Button>
          <Button
            variant="contained"
            startIcon={<Send size={18} />}
            onClick={() => setOpenSend(true)}
            sx={{
              bgcolor: '#1976d2',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 2.5,
              '&:hover': { bgcolor: '#1565c0' },
            }}
          >
            Send Message
          </Button>
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
                  Total Touchpoints
                </Typography>
                <Avatar sx={{ bgcolor: '#eff6ff', color: '#1976d2', width: 36, height: 36 }}>
                  <Inbox size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
                {totalLogs}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                All candidate activities
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Emails Sent
                </Typography>
                <Avatar sx={{ bgcolor: '#e0f2fe', color: '#0284c7', width: 36, height: 36 }}>
                  <Mail size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0284c7' }}>
                {emailCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Interview & offer emails
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  SMS / Texts
                </Typography>
                <Avatar sx={{ bgcolor: '#ecfdf5', color: '#059669', width: 36, height: 36 }}>
                  <MessageSquare size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#059669' }}>
                {smsCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Quick alerts & reminders
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Phone Screening Calls
                </Typography>
                <Avatar sx={{ bgcolor: '#fffbeb', color: '#d97706', width: 36, height: 36 }}>
                  <Phone size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#d97706' }}>
                {phoneCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Recruiter conversation logs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Active Templates
                </Typography>
                <Avatar sx={{ bgcolor: '#f5f3ff', color: '#7c3aed', width: 36, height: 36 }}>
                  <FileText size={20} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#7c3aed' }}>
                {templates.length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Pre-approved templates
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
          <Tab label={`Engagement Feed & History (${logs.length})`} />
          <Tab label={`Message Templates Library (${templates.length})`} />
        </Tabs>
      </Paper>

      {/* TAB 0: TIMELINE & ENGAGEMENT LOG */}
      {activeTab === 0 && (
        <Box>
          {/* Channel Filters */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {['ALL', 'Email', 'SMS', 'Phone'].map((ch) => (
              <Chip
                key={ch}
                label={ch === 'ALL' ? 'All Channels' : ch}
                clickable
                color={channelFilter === ch ? 'primary' : 'default'}
                variant={channelFilter === ch ? 'filled' : 'outlined'}
                onClick={() => setChannelFilter(ch)}
              />
            ))}
          </Box>

          <TableContainer component={Paper} sx={{ borderRadius: 2.5, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Channel</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Candidate</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Subject & Message Body</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Template Used</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Sent By</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'right' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: '#94a3b8' }}>
                      No candidate communications logged yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getChannelIcon(log.channel)}
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {log.channel}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                          {log.candidate?.firstName} {log.candidate?.lastName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {log.candidate?.email || log.candidate?.phone}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 360 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {log.subject || 'Direct Message'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#475569', display: 'block', whiteSpace: 'pre-wrap' }}>
                          {log.body.length > 120 ? `${log.body.slice(0, 120)}...` : log.body}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {log.templateName ? (
                          <Chip label={log.templateName} size="small" variant="outlined" />
                        ) : (
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>Custom</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#334155' }}>
                          {log.sentBy || 'Recruiter'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          {log.occurredAt ? new Date(log.occurredAt).toLocaleString() : 'Recent'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Chip
                          label={log.status || 'Delivered'}
                          color="success"
                          size="small"
                          icon={<CheckCircle2 size={13} />}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* TAB 1: TEMPLATE LIBRARY */}
      {activeTab === 1 && (
        <Grid container spacing={2.5}>
          {templates.map((tmpl) => {
            const vars = typeof tmpl.variablesJson === 'string'
              ? JSON.parse(tmpl.variablesJson || '[]')
              : tmpl.variablesJson || [];
            return (
              <Grid item xs={12} sm={6} md={4} key={tmpl.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Chip label={tmpl.category} size="small" color="primary" variant="outlined" />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getChannelIcon(tmpl.channel)}
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>
                          {tmpl.channel}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                      {tmpl.name}
                    </Typography>

                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569', display: 'block', mb: 1 }}>
                      Subject: {tmpl.subject}
                    </Typography>

                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        bgcolor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 1.5,
                        fontSize: '0.8rem',
                        color: '#334155',
                        mb: 2,
                        maxHeight: 110,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {tmpl.body}
                    </Paper>

                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 0.5 }}>
                      Available Merge Tags:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {vars.map((v: string) => (
                        <Chip key={v} label={`{{${v}}}`} size="small" sx={{ fontSize: 10, height: 20, bgcolor: '#f1f5f9' }} />
                      ))}
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      startIcon={<Send size={15} />}
                      onClick={() => {
                        handleTemplateSelect(tmpl);
                        setOpenSend(true);
                      }}
                      sx={{ textTransform: 'none', borderRadius: 1.5 }}
                    >
                      Use Template to Send
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* SEND MESSAGE MODAL */}
      <Dialog open={openSend} onClose={() => setOpenSend(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#1e293b' }}>
          Compose Candidate Message
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Select Recipient Candidate"
                value={sendForm.candidateId}
                onChange={(e) => setSendForm({ ...sendForm, candidateId: e.target.value })}
                required
              >
                {candidates.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.email || c.phone})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Load Pre-Built Template"
                value={sendForm.templateName}
                onChange={(e) => {
                  const tmpl = templates.find((t) => t.name === e.target.value);
                  if (tmpl) handleTemplateSelect(tmpl);
                }}
              >
                <MenuItem value="">-- Select Template --</MenuItem>
                {templates.map((t) => (
                  <MenuItem key={t.id} value={t.name}>
                    {t.name} ({t.channel})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Communication Channel"
                value={sendForm.channel}
                onChange={(e) => setSendForm({ ...sendForm, channel: e.target.value })}
              >
                <MenuItem value="Email">Email</MenuItem>
                <MenuItem value="SMS">SMS / Text Message</MenuItem>
                <MenuItem value="Phone">Phone Call Log</MenuItem>
              </TextField>
            </Grid>

            {sendForm.channel !== 'Phone' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject Line"
                  value={sendForm.subject}
                  onChange={(e) => setSendForm({ ...sendForm, subject: e.target.value })}
                  placeholder="e.g. Next Steps - Technical Interview with Anthem"
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message Content"
                multiline
                rows={5}
                value={sendForm.body}
                onChange={(e) => setSendForm({ ...sendForm, body: e.target.value })}
                placeholder="Type your message or edit the loaded template..."
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenSend(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSend}
            startIcon={<Send size={16} />}
            sx={{ textTransform: 'none', px: 3, bgcolor: '#1976d2' }}
          >
            Dispatch & Log
          </Button>
        </DialogActions>
      </Dialog>

      {/* CREATE TEMPLATE MODAL */}
      <Dialog open={openCreateTemplate} onClose={() => setOpenCreateTemplate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#1e293b' }}>
          Create New Message Template
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Template Name"
                placeholder="e.g. Client Technical Interview Invite"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Category"
                value={templateForm.category}
                onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
              >
                <MenuItem value="Sourcing">Sourcing Outreach</MenuItem>
                <MenuItem value="Screening">Screening & Killer Questions</MenuItem>
                <MenuItem value="Interview">Interview Scheduling</MenuItem>
                <MenuItem value="Offer">Offer & Spread Proposal</MenuItem>
                <MenuItem value="Onboarding">Onboarding & BGV Reminder</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Channel"
                value={templateForm.channel}
                onChange={(e) => setTemplateForm({ ...templateForm, channel: e.target.value })}
              >
                <MenuItem value="Email">Email</MenuItem>
                <MenuItem value="SMS">SMS</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject Line"
                placeholder="e.g. Interview Confirmation for {{job_title}} at {{client_name}}"
                value={templateForm.subject}
                onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Template Body (Supports {{candidate_name}}, {{job_title}}, {{client_name}})"
                multiline
                rows={5}
                value={templateForm.body}
                onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                placeholder="Hi {{candidate_name}}, we are excited to confirm your technical interview..."
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenCreateTemplate(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateTemplate}
            sx={{ textTransform: 'none', px: 3, bgcolor: '#1976d2' }}
          >
            Save Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Communications;
