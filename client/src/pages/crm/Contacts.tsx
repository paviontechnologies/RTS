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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
} from '@mui/material';
import { Contact2, Plus, Search, Mail, Phone, Building2 } from 'lucide-react';
import { apiClient } from '../../api/client';

export const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [openCreate, setOpenCreate] = useState(false);

  const [formData, setFormData] = useState({
    accountId: '',
    firstName: '',
    lastName: '',
    designation: '',
    department: 'Talent Acquisition',
    email: '',
    phone: '',
    isPrimary: false,
    notes: '',
  });

  const fetchContacts = async () => {
    try {
      const res = await apiClient.crm.getContacts({ search: search || undefined });
      if (res.data.success) {
        setContacts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await apiClient.crm.getAccounts();
      if (res.data.success) {
        setAccounts(res.data.data);
        if (res.data.data.length > 0 && !formData.accountId) {
          setFormData((prev) => ({ ...prev, accountId: res.data.data[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContacts();
    fetchAccounts();
  }, []);

  const handleCreate = async () => {
    if (!formData.accountId || !formData.firstName || !formData.lastName || !formData.email) {
      alert('Please fill Account, First Name, Last Name, and Email');
      return;
    }
    try {
      const res = await apiClient.crm.createContact(formData);
      if (res.data.success) {
        setOpenCreate(false);
        setFormData({
          accountId: accounts[0]?.id || '',
          firstName: '',
          lastName: '',
          designation: '',
          department: 'Talent Acquisition',
          email: '',
          phone: '',
          isPrimary: false,
          notes: '',
        });
        fetchContacts();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create contact');
    }
  };

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Client Contacts
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Directory of hiring managers, talent acquisition directors, and client stakeholders.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setOpenCreate(true)}
          sx={{ bgcolor: '#1E3A8A' }}
        >
          Add Contact
        </Button>
      </Box>

      {/* Filter */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
        <TextField
          size="small"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchContacts()}
          sx={{ width: { xs: '100%', sm: 380 } }}
          InputProps={{
            startAdornment: <Search size={16} color="#64748B" style={{ marginRight: 8 }} />,
          }}
        />
      </Paper>

      {/* Table */}
      <Paper sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Contact Name</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell>Client Account</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Primary</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Contact2 size={18} />
                      </Box>
                      {c.firstName} {c.lastName}
                    </Box>
                  </TableCell>
                  <TableCell>{c.designation || 'Hiring Manager'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Building2 size={14} color="#64748B" />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E3A8A' }}>
                        {c.account?.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#2563EB' }}>
                      <Mail size={13} /> {c.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Phone size={13} color="#64748B" /> {c.phone || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>{c.department || 'General'}</TableCell>
                  <TableCell>
                    {c.isPrimary ? (
                      <Chip label="Primary Contact" size="small" sx={{ bgcolor: '#EFF6FF', color: '#1E3A8A', fontWeight: 700 }} />
                    ) : (
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>Secondary</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Contact Modal */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Client Contact</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Associated Client Account *"
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              >
                {accounts.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name} ({a.industry})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name *"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name *"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Designation / Title"
                placeholder="VP of Engineering"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address *"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} sx={{ bgcolor: '#1E3A8A' }}>
            Save Contact
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
