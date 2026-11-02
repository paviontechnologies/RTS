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
  Drawer,
  Divider,
} from '@mui/material';
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  Users,
  Briefcase,
  Award,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    website: '',
    industry: 'Enterprise Software',
    accountType: 'DirectClient',
    companySize: '500-1000',
    headquarters: '',
    paymentTerms: 'Net 30',
    notes: '',
  });

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.crm.getAccounts({ search: search || undefined });
      if (res.data.success) {
        setAccounts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreate = async () => {
    if (!formData.name) {
      alert('Account name is required');
      return;
    }
    try {
      const res = await apiClient.crm.createAccount(formData);
      if (res.data.success) {
        setOpenCreate(false);
        setFormData({
          name: '',
          legalName: '',
          website: '',
          industry: 'Enterprise Software',
          accountType: 'DirectClient',
          companySize: '500-1000',
          headquarters: '',
          paymentTerms: 'Net 30',
          notes: '',
        });
        fetchAccounts();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create account');
    }
  };

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Client Accounts Directory
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Master list of client enterprises, MSP programs, implementation partners, and vendors.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setOpenCreate(true)}
          sx={{ bgcolor: '#1E3A8A' }}
        >
          Add Client Account
        </Button>
      </Box>

      {/* Filter */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
        <TextField
          size="small"
          placeholder="Search client account by name or industry..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchAccounts()}
          sx={{ width: { xs: '100%', sm: 380 } }}
          InputProps={{
            startAdornment: <Search size={16} color="#64748B" style={{ marginRight: 8 }} />,
          }}
        />
      </Paper>

      {/* Accounts Table */}
      <Paper sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Client Account</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Headquarters</TableCell>
                <TableCell>Payment Terms</TableCell>
                <TableCell align="center">Contacts</TableCell>
                <TableCell align="center">Requisitions</TableCell>
                <TableCell>Account Manager</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((acc) => (
                <TableRow key={acc.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E3A8A' }}>
                        <Building2 size={18} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {acc.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          {acc.industry || 'Technology'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={acc.accountType}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        bgcolor: acc.accountType === 'DirectClient' ? '#EFF6FF' : '#F1F5F9',
                        color: acc.accountType === 'DirectClient' ? '#1E3A8A' : '#475569',
                      }}
                    />
                  </TableCell>
                  <TableCell>{acc.headquarters || 'USA'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {acc.paymentTerms}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={<Users size={12} />}
                      label={acc.contacts?.length || 0}
                      size="small"
                      sx={{ bgcolor: '#F8FAFC', fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={<Briefcase size={12} />}
                      label={acc.jobs?.length || 0}
                      size="small"
                      sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {acc.accountManager ? `${acc.accountManager.firstName} ${acc.accountManager.lastName}` : 'Unassigned'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={acc.status}
                      size="small"
                      sx={{
                        bgcolor: acc.status === 'Active' ? '#ECFDF5' : '#F1F5F9',
                        color: acc.status === 'Active' ? '#059669' : '#64748B',
                        fontWeight: 700,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => setSelectedAccount(acc)}
                      sx={{ fontWeight: 600 }}
                    >
                      View 360°
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Account Details 360° Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedAccount)}
        onClose={() => setSelectedAccount(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, p: 3 } }}
      >
        {selectedAccount && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E3A8A' }}>
                <Building2 size={24} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {selectedAccount.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600 }}>
                  {selectedAccount.accountType} • {selectedAccount.industry}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Account Metadata
            </Typography>
            <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 2, mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Headquarters:</strong> {selectedAccount.headquarters || 'USA'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Payment Terms:</strong> {selectedAccount.paymentTerms}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Account Manager:</strong>{' '}
                {selectedAccount.accountManager
                  ? `${selectedAccount.accountManager.firstName} ${selectedAccount.accountManager.lastName}`
                  : 'Unassigned'}
              </Typography>
              <Typography variant="body2">
                <strong>Notes:</strong> {selectedAccount.notes || 'None recorded'}
              </Typography>
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Client Contacts ({selectedAccount.contacts?.length || 0})
            </Typography>
            {selectedAccount.contacts?.map((c: any) => (
              <Box key={c.id} sx={{ p: 1.5, border: '1px solid #E2E8F0', borderRadius: 2, mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {c.firstName} {c.lastName} {c.isPrimary && <Chip label="Primary" size="small" color="primary" sx={{ height: 16, fontSize: '0.65rem' }} />}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                  {c.designation || 'Contact'} • {c.email}
                </Typography>
              </Box>
            ))}

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 3, mb: 1 }}>
              Open Requisitions ({selectedAccount.jobs?.length || 0})
            </Typography>
            {selectedAccount.jobs?.map((j: any) => (
              <Box key={j.id} sx={{ p: 1.5, border: '1px solid #E2E8F0', borderRadius: 2, mb: 1, bgcolor: '#F8FAFC' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E3A8A' }}>
                  {j.jobCode}: {j.title}
                </Typography>
                <Chip label={j.status} size="small" sx={{ mt: 0.5, height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
              </Box>
            ))}
          </Box>
        )}
      </Drawer>

      {/* Add Account Modal */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Client Account</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Client Account Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Account Category"
                value={formData.accountType}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
              >
                <MenuItem value="DirectClient">Direct Client</MenuItem>
                <MenuItem value="ImplementationPartner">Implementation Partner</MenuItem>
                <MenuItem value="StaffingVendor">Staffing Vendor</MenuItem>
                <MenuItem value="MSP">MSP / VMS Account</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Headquarters (City, State)"
                placeholder="Dallas, TX"
                value={formData.headquarters}
                onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Payment Terms"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Client Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} sx={{ bgcolor: '#1E3A8A' }}>
            Save Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
