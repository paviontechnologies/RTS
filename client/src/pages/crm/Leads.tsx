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
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Plus,
  ArrowRightLeft,
  Search,
  ExternalLink,
  Phone,
  Mail,
  Building,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useSearchParams } from 'react-router-dom';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  New: { bg: '#EFF6FF', text: '#1E3A8A' },
  Contacted: { bg: '#F1F5F9', text: '#475569' },
  Interested: { bg: '#FEF3C7', text: '#D97706' },
  Qualified: { bg: '#ECFDF5', text: '#059669' },
  'Meeting Scheduled': { bg: '#F5F3FF', text: '#7C3AED' },
  'Proposal Sent': { bg: '#FFF7ED', text: '#C2410C' },
  Negotiation: { bg: '#FEF9C3', text: '#854D0E' },
  Won: { bg: '#D1FAE5', text: '#065F46' },
  Lost: { bg: '#FEE2E2', text: '#991B1B' },
};

export const Leads: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Dialogs
  const [openCreate, setOpenCreate] = useState(false);
  const [openConvert, setOpenConvert] = useState<any | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    industry: 'Enterprise Software',
    contactPerson: '',
    email: '',
    phone: '',
    location: '',
    leadSource: 'LinkedIn',
    priority: 'Medium',
    notes: '',
  });

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await apiClient.crm.getLeads({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      if (res.data.success) {
        setLeads(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    if (searchParams.get('action') === 'new') {
      setOpenCreate(true);
    }
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleCreateLead = async () => {
    if (!formData.companyName) {
      alert('Company Name is required');
      return;
    }
    try {
      const res = await apiClient.crm.createLead(formData);
      if (res.data.success) {
        setOpenCreate(false);
        setToast(`Lead "${formData.companyName}" created successfully!`);
        setFormData({
          companyName: '',
          website: '',
          industry: 'Enterprise Software',
          contactPerson: '',
          email: '',
          phone: '',
          location: '',
          leadSource: 'LinkedIn',
          priority: 'Medium',
          notes: '',
        });
        fetchLeads();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create lead');
    }
  };

  const handleConvertLead = async (leadId: string) => {
    try {
      const res = await apiClient.crm.convertLead(leadId);
      if (res.data.success) {
        setOpenConvert(null);
        setToast(`Lead converted into Client Account "${res.data.data.account.name}"!`);
        fetchLeads();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to convert lead');
    }
  };

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
            CRM Lead Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Track prospective client companies, hiring managers, and conversion to active accounts.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setOpenCreate(true)}
          sx={{ bgcolor: '#1E3A8A' }}
        >
          Add New Lead
        </Button>
      </Box>

      {/* Filter Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
        <form onSubmit={handleSearchSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by company, contact, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <Search size={16} color="#64748B" style={{ marginRight: 8 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Lead Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="New">New</MenuItem>
                <MenuItem value="Contacted">Contacted</MenuItem>
                <MenuItem value="Interested">Interested</MenuItem>
                <MenuItem value="Qualified">Qualified</MenuItem>
                <MenuItem value="Meeting Scheduled">Meeting Scheduled</MenuItem>
                <MenuItem value="Proposal Sent">Proposal Sent</MenuItem>
                <MenuItem value="Negotiation">Negotiation</MenuItem>
                <MenuItem value="Won">Won (Converted)</MenuItem>
                <MenuItem value="Lost">Lost</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button type="submit" variant="outlined" fullWidth sx={{ height: 40 }}>
                Filter
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Leads Table */}
      <Paper sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Company</TableCell>
                <TableCell>Contact Person</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: '#64748B' }}>
                    No leads found matching current criteria.
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => {
                  const statusStyle = STATUS_COLORS[lead.status] || { bg: '#F1F5F9', text: '#475569' };
                  return (
                    <TableRow key={lead.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E3A8A' }}>
                            <Building size={18} />
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                              {lead.companyName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              {lead.industry || 'Technology'} • {lead.location || 'USA'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {lead.contactPerson || 'Not Specified'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Mail size={12} /> {lead.email || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={lead.leadSource} size="small" sx={{ bgcolor: '#F1F5F9', fontWeight: 600 }} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={lead.priority}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: lead.priority === 'Urgent' ? '#FEF2F2' : lead.priority === 'High' ? '#FFFBEB' : '#F1F5F9',
                            color: lead.priority === 'Urgent' ? '#DC2626' : lead.priority === 'High' ? '#D97706' : '#475569',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {lead.assignedUser ? `${lead.assignedUser.firstName} ${lead.assignedUser.lastName}` : 'Unassigned'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={lead.status}
                          size="small"
                          sx={{ bgcolor: statusStyle.bg, color: statusStyle.text, fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {lead.status !== 'Won' ? (
                          <Tooltip title="Convert to Client Account">
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              startIcon={<ArrowRightLeft size={14} />}
                              onClick={() => setOpenConvert(lead)}
                              sx={{ textTransform: 'none', fontWeight: 600, py: 0.4 }}
                            >
                              Convert
                            </Button>
                          </Tooltip>
                        ) : (
                          <Chip label="Converted" size="small" sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700 }} />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create Lead Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #E2E8F0' }}>
          Add New Business Lead
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name *"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Website URL"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Person Name"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                placeholder="(555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location (City, State)"
                placeholder="Dallas, TX"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Lead Source"
                value={formData.leadSource}
                onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
              >
                <MenuItem value="LinkedIn">LinkedIn</MenuItem>
                <MenuItem value="Company Websites">Company Websites</MenuItem>
                <MenuItem value="Email Enquiries">Email Enquiries</MenuItem>
                <MenuItem value="Referrals">Referrals</MenuItem>
                <MenuItem value="Job Boards">Job Boards</MenuItem>
                <MenuItem value="Networking">Networking</MenuItem>
                <MenuItem value="Manual Entry">Manual Entry</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Lead Notes & Recruitment Requirements"
                placeholder="Key staffing needs, target tech stack, rate budget..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E2E8F0' }}>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateLead} sx={{ bgcolor: '#1E3A8A' }}>
            Save Lead
          </Button>
        </DialogActions>
      </Dialog>

      {/* Convert Lead Confirmation Modal */}
      <Dialog open={Boolean(openConvert)} onClose={() => setOpenConvert(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Convert Lead to Client Account</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>
            Converting <strong>{openConvert?.companyName}</strong> will automatically:
          </Typography>
          <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 2, border: '1px solid #E2E8F0' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              ✅ Create a new enterprise <strong>Client Account</strong> ({openConvert?.companyName}).
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              ✅ Create a primary <strong>Client Contact</strong> ({openConvert?.contactPerson || 'Hiring Manager'}).
            </Typography>
            <Typography variant="body2">
              ✅ Update Lead status to <strong>Won (Converted)</strong> and enable Job Requisition creation.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenConvert(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleConvertLead(openConvert.id)}
          >
            Confirm & Convert to Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Toast */}
      <Snackbar open={Boolean(toast)} autoHideDuration={4000} onClose={() => setToast(null)}>
        <Alert severity="success" onClose={() => setToast(null)}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
};
