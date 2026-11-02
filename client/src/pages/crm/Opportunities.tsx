import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  Menu,
} from '@mui/material';
import { TrendingUp, Plus, DollarSign, Calendar, MoreVertical, Building2 } from 'lucide-react';
import { apiClient } from '../../api/client';

const STAGES = [
  'NewOpportunity',
  'Qualification',
  'Discovery',
  'RequirementsDiscussion',
  'ProposalSent',
  'Negotiation',
  'ClosedWon',
  'ClosedLost',
];

const STAGE_LABELS: Record<string, string> = {
  NewOpportunity: 'New Opportunity',
  Qualification: 'Qualification',
  Discovery: 'Discovery Meeting',
  RequirementsDiscussion: 'Requirements Discussion',
  ProposalSent: 'Proposal Sent',
  Negotiation: 'Negotiation',
  ClosedWon: 'Closed Won 🎉',
  ClosedLost: 'Closed Lost',
};

export const Opportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [stageMenuAnchor, setStageMenuAnchor] = useState<null | { el: HTMLElement; oppId: string }>(null);

  const [formData, setFormData] = useState({
    accountId: '',
    name: '',
    stage: 'NewOpportunity',
    estimatedValue: '',
    probability: 50,
    expectedCloseDate: '',
    notes: '',
  });

  const fetchOpps = async () => {
    try {
      const res = await apiClient.crm.getOpportunities();
      if (res.data.success) {
        setOpportunities(res.data.data);
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
    fetchOpps();
    fetchAccounts();
  }, []);

  const handleCreate = async () => {
    if (!formData.accountId || !formData.name) {
      alert('Account and Opportunity Name are required');
      return;
    }
    try {
      const res = await apiClient.crm.createOpportunity(formData);
      if (res.data.success) {
        setOpenCreate(false);
        setFormData({
          accountId: accounts[0]?.id || '',
          name: '',
          stage: 'NewOpportunity',
          estimatedValue: '',
          probability: 50,
          expectedCloseDate: '',
          notes: '',
        });
        fetchOpps();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create opportunity');
    }
  };

  const handleMoveStage = async (newStage: string) => {
    if (!stageMenuAnchor) return;
    try {
      await apiClient.crm.updateOpportunityStage(stageMenuAnchor.oppId, { stage: newStage });
      setStageMenuAnchor(null);
      fetchOpps();
    } catch (err) {
      console.error(err);
    }
  };

  const totalValue = opportunities
    .filter((o) => o.stage !== 'ClosedLost')
    .reduce((sum, o) => sum + (o.estimatedValue || 0), 0);

  return (
    <Box sx={{ maxWidth: 1800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Opportunities Pipeline
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Total Pipeline Value: <strong>${(totalValue / 1000).toFixed(0)}k</strong> across {opportunities.length} active opportunities.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setOpenCreate(true)}
          sx={{ bgcolor: '#1E3A8A' }}
        >
          New Opportunity
        </Button>
      </Box>

      {/* Kanban Board Container */}
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 3 }}>
        {STAGES.map((stage) => {
          const stageOpps = opportunities.filter((o) => o.stage === stage);
          const stageValue = stageOpps.reduce((sum, o) => sum + (o.estimatedValue || 0), 0);
          const isWon = stage === 'ClosedWon';

          return (
            <Box
              key={stage}
              sx={{
                minWidth: 280,
                maxWidth: 280,
                bgcolor: isWon ? '#F0FDF4' : '#F1F5F9',
                borderRadius: 3,
                p: 1.5,
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100vh - 220px)',
              }}
            >
              {/* Column Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, px: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isWon ? '#059669' : '#1E293B' }}>
                  {STAGE_LABELS[stage]}
                </Typography>
                <Chip
                  label={stageOpps.length}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    height: 20,
                    bgcolor: isWon ? '#DCFCE7' : '#E2E8F0',
                    color: isWon ? '#059669' : '#475569',
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ px: 1, mb: 1.5, display: 'block', color: '#64748B', fontWeight: 600 }}>
                ${(stageValue / 1000).toFixed(0)}k total
              </Typography>

              {/* Cards List */}
              <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {stageOpps.map((opp) => (
                  <Card
                    key={opp.id}
                    sx={{
                      bgcolor: '#FFFFFF',
                      borderRadius: 2,
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s',
                      '&:hover': { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                          {opp.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => setStageMenuAnchor({ el: e.currentTarget, oppId: opp.id })}
                        >
                          <MoreVertical size={14} />
                        </IconButton>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <Building2 size={13} /> {opp.account?.name}
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#059669' }}>
                          ${opp.estimatedValue?.toLocaleString()}
                        </Typography>
                        <Chip
                          label={`${opp.probability}% win`}
                          size="small"
                          sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#F8FAFC' }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Move Stage Menu */}
      <Menu
        anchorEl={stageMenuAnchor?.el}
        open={Boolean(stageMenuAnchor)}
        onClose={() => setStageMenuAnchor(null)}
      >
        <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', fontWeight: 700, color: '#94A3B8' }}>
          MOVE TO STAGE
        </Typography>
        {STAGES.map((s) => (
          <MenuItem key={s} onClick={() => handleMoveStage(s)} sx={{ fontSize: '0.85rem' }}>
            {STAGE_LABELS[s]}
          </MenuItem>
        ))}
      </Menu>

      {/* Create Opportunity Modal */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create New Sales Opportunity</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Client Account *"
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              >
                {accounts.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Opportunity Name / Requirement *"
                placeholder="e.g. 5 Cloud Architects Q1 Expansion"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Estimated Deal Value ($)"
                placeholder="150000"
                value={formData.estimatedValue}
                onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Win Probability (%)"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 50 })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Pipeline Stage"
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              >
                {STAGES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {STAGE_LABELS[s]}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} sx={{ bgcolor: '#1E3A8A' }}>
            Create Opportunity
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
