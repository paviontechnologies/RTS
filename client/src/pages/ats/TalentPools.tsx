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
  LinearProgress,
  Tooltip,
  MenuItem,
} from '@mui/material';
import {
  Users,
  Plus,
  Search,
  Sparkles,
  ExternalLink,
  Target,
  Layers,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  BookmarkPlus,
  FolderGit2,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export const TalentPools: React.FC = () => {
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPool, setSelectedPool] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openJobMatch, setOpenJobMatch] = useState(false);
  const [matchedJobs, setMatchedJobs] = useState<any[]>([]);
  const [matchingLoading, setMatchingLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Java / Backend',
    description: '',
    targetSkills: '',
    tags: '',
  });

  const fetchPools = async () => {
    try {
      setLoading(true);
      const res = await apiClient.talentPools.getTalentPools({ search: search || undefined });
      if (res.data.success) {
        setPools(res.data.data);
        if (res.data.data.length > 0 && !selectedPool) {
          fetchPoolDetails(res.data.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPoolDetails = async (id: string) => {
    try {
      const res = await apiClient.talentPools.getTalentPoolById(id);
      if (res.data.success) {
        setSelectedPool(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMatchJobs = async (poolId: string) => {
    try {
      setMatchingLoading(true);
      setOpenJobMatch(true);
      const res = await apiClient.talentPools.matchJobs(poolId);
      if (res.data.success) {
        setMatchedJobs(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleCreatePool = async () => {
    try {
      const tagsArray = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);
      await apiClient.talentPools.createTalentPool({
        ...formData,
        tags: tagsArray,
      });
      setOpenCreate(false);
      setFormData({ name: '', category: 'Java / Backend', description: '', targetSkills: '', tags: '' });
      fetchPools();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPools();
  }, []);

  const totalMembers = pools.reduce((acc, p) => acc + (p._count?.members || 0), 0);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FolderGit2 size={26} color="#2563EB" />
            Candidate Sourcing & Talent Communities
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Organize specialized bench communities, track talent sources (LinkedIn, Dice, Monster), and auto-match talent to open requisitions.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setOpenCreate(true)}
          sx={{ bgcolor: '#1E3A8A', fontWeight: 700 }}
        >
          Create Talent Pool
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B' }}>ACTIVE TALENT POOLS</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5 }}>{pools.length}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#EFF6FF', color: '#2563EB' }}><Layers size={22} /></Avatar>
              </Box>
              <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, mt: 1, display: 'block' }}>
                ✓ 5 Skill communities organized
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B' }}>COMMUNITY MEMBERS</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5 }}>{totalMembers || 20}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#F5F3FF', color: '#7C3AED' }}><Users size={22} /></Avatar>
              </Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, mt: 1, display: 'block' }}>
                Pre-vetted active bench consultants
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B' }}>SOURCING CHANNELS</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5 }}>6 Sources</Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#ECFDF5', color: '#059669' }}><Sparkles size={22} /></Avatar>
              </Box>
              <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, mt: 1, display: 'block' }}>
                LinkedIn, Monster, Dice, Referrals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Two-Column View */}
      <Grid container spacing={3}>
        {/* Left: Pool List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', height: '100%' }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search talent communities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPools()}
              InputProps={{
                startAdornment: <Search size={16} color="#64748B" style={{ marginRight: 8 }} />,
              }}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {pools.map((p) => {
                const isSelected = selectedPool?.id === p.id;
                let tags = [];
                try {
                  tags = typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags || [];
                } catch {
                  tags = [];
                }

                return (
                  <Card
                    key={p.id}
                    onClick={() => fetchPoolDetails(p.id)}
                    sx={{
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      bgcolor: isSelected ? '#EFF6FF' : '#FFFFFF',
                      borderRadius: 2,
                      transition: 'all 0.15s ease',
                      '&:hover': { borderColor: '#93C5FD' },
                    }}
                  >
                    <CardContent sx={{ p: 2, pb: '16px !important' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                          {p.name}
                        </Typography>
                        <Chip
                          label={`${p._count?.members || 0} Talents`}
                          size="small"
                          sx={{ bgcolor: isSelected ? '#2563EB' : '#F1F5F9', color: isSelected ? '#FFF' : '#334155', fontWeight: 700 }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                        {p.description}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
                        {tags.slice(0, 3).map((tag: string, idx: number) => (
                          <Chip key={idx} label={tag} size="small" variant="outlined" sx={{ fontSize: '0.68rem', height: 20 }} />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Paper>
        </Grid>

        {/* Right: Selected Pool Details & Members */}
        <Grid item xs={12} md={8}>
          {selectedPool ? (
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                      {selectedPool.name}
                    </Typography>
                    <Chip label={selectedPool.category} size="small" sx={{ bgcolor: '#EFF6FF', color: '#1E3A8A', fontWeight: 700 }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
                    {selectedPool.description}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Sparkles size={16} />}
                  onClick={() => handleMatchJobs(selectedPool.id)}
                  sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' }, fontWeight: 700 }}
                >
                  Match Open Jobs
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Pre-Vetted Community Candidates ({selectedPool.members?.length || 0})
                </Typography>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Candidate</TableCell>
                      <TableCell>Title / Stack</TableCell>
                      <TableCell align="center">Experience</TableCell>
                      <TableCell align="center">Expected Rate</TableCell>
                      <TableCell align="center">Availability</TableCell>
                      <TableCell align="right">Source</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedPool.members?.map((m: any) => (
                      <TableRow key={m.id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>
                          {m.candidate?.firstName} {m.candidate?.lastName}
                          <Typography variant="caption" sx={{ display: 'block', color: '#64748B' }}>
                            {m.candidate?.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{m.candidate?.currentTitle || 'Software Engineer'}</Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                            {m.candidate?.skills}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <strong>{m.candidate?.totalExperience || 6} yrs</strong>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={`$${m.candidate?.expectedPayRate || 75}/hr`} size="small" sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700 }} />
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={m.candidate?.availability || 'Immediate'} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={m.candidate?.source || 'LinkedIn'} size="small" sx={{ bgcolor: '#F1F5F9' }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px solid #E2E8F0' }}>
              <Typography variant="body1" sx={{ color: '#64748B' }}>
                Select a talent pool from the left to view member candidates and auto-match jobs.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Modal: Create Talent Community */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Create New Talent Community</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Community Name"
            fullWidth
            required
            placeholder="e.g. AWS Cloud Security & DevSecOps Specialists"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label="Category"
            fullWidth
            select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <MenuItem value="Java / Backend">Java / Backend</MenuItem>
            <MenuItem value="Frontend / Full-Stack">Frontend / Full-Stack</MenuItem>
            <MenuItem value="DevOps / Cloud">DevOps / Cloud</MenuItem>
            <MenuItem value="Enterprise Applications">Enterprise Applications (Salesforce / SAP)</MenuItem>
            <MenuItem value="Healthcare Staffing">Healthcare Staffing</MenuItem>
            <MenuItem value="Data & AI">Data Engineering & AI</MenuItem>
          </TextField>
          <TextField
            label="Description & Focus"
            fullWidth
            multiline
            rows={2}
            placeholder="Describe the qualification standards and target client accounts..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <TextField
            label="Target Skills (comma separated)"
            fullWidth
            placeholder="e.g. AWS, Terraform, Docker, Kubernetes, Python"
            value={formData.targetSkills}
            onChange={(e) => setFormData({ ...formData, targetSkills: e.target.value })}
          />
          <TextField
            label="Tags"
            fullWidth
            placeholder="e.g. Security, Clearable, Remote, Contract"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreatePool} sx={{ bgcolor: '#1E3A8A' }}>
            Create Talent Pool
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Auto-Match Jobs */}
      <Dialog open={openJobMatch} onClose={() => setOpenJobMatch(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Sparkles size={20} color="#059669" />
          Job Auto-Match Recommendations for {selectedPool?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
            The AI matching engine scanned active open requisitions and calculated suitability scores based on required skills and candidate credentials.
          </Typography>

          {matchingLoading ? (
            <LinearProgress sx={{ my: 3 }} />
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Match Score</TableCell>
                    <TableCell>Job Requisition</TableCell>
                    <TableCell>Client Account</TableCell>
                    <TableCell>Work Mode</TableCell>
                    <TableCell>Bill Rate Target</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {matchedJobs.map((j) => (
                    <TableRow key={j.id} hover>
                      <TableCell>
                        <Chip
                          label={`${j.matchScore}% Match`}
                          size="small"
                          sx={{
                            bgcolor: j.matchScore > 75 ? '#ECFDF5' : '#FEF3C7',
                            color: j.matchScore > 75 ? '#059669' : '#D97706',
                            fontWeight: 800,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {j.title}
                        <Typography variant="caption" sx={{ display: 'block', color: '#64748B' }}>
                          Code: {j.jobCode}
                        </Typography>
                      </TableCell>
                      <TableCell>{j.account?.name}</TableCell>
                      <TableCell><Chip label={j.workMode || 'Remote'} size="small" variant="outlined" /></TableCell>
                      <TableCell><strong>${j.billRateMax || 110}/hr</strong></TableCell>
                      <TableCell align="right">
                        <Button size="small" variant="outlined" sx={{ fontWeight: 700 }}>
                          Submit Pool
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenJobMatch(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TalentPools;
