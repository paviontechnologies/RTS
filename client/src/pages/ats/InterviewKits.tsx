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
  Rating,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Award,
  Plus,
  BookOpen,
  CheckCircle2,
  Star,
  Users,
  Briefcase,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export const InterviewKits: React.FC = () => {
  const [kits, setKits] = useState<any[]>([]);
  const [scorecards, setScorecards] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [openNewKit, setOpenNewKit] = useState(false);
  const [openNewScorecard, setOpenNewScorecard] = useState(false);

  // New Kit Form
  const [kitForm, setKitForm] = useState({
    title: '',
    jobRole: 'Senior Java Cloud Developer',
    roundType: 'Technical',
    competencies: 'Coding, System Architecture, AWS Infrastructure, Problem Solving',
    q1: 'Explain concurrency and memory management in microservices.',
    q2: 'How do you handle API security, caching, and rate-limiting?',
  });

  // New Scorecard Form
  const [scorecardForm, setScorecardForm] = useState({
    interviewKitId: '',
    candidateId: '',
    interviewerName: 'Marcus Vance (Principal Architect)',
    interviewerEmail: 'marcus.vance@anthem.com',
    overallRating: 5,
    recommendation: 'StrongHire',
    strengths: 'Deep domain expertise, articulate communication, clean architectural reasoning.',
    weaknesses: 'None observed.',
    notes: 'Highly recommended for immediate engagement start.',
  });

  const fetchData = async () => {
    try {
      const [kitsRes, scorecardsRes, candRes] = await Promise.all([
        apiClient.interviewKits.getInterviewKits(),
        apiClient.interviewKits.getScorecards(),
        apiClient.candidates.getCandidates(),
      ]);
      if (kitsRes.data.success) setKits(kitsRes.data.data);
      if (scorecardsRes.data.success) setScorecards(scorecardsRes.data.data);
      if (candRes.data.success) setCandidates(candRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateKit = async () => {
    try {
      const compArray = kitForm.competencies.split(',').map((c) => c.trim()).filter(Boolean);
      const questionsArray = [
        { question: kitForm.q1 },
        { question: kitForm.q2 },
      ];
      await apiClient.interviewKits.createInterviewKit({
        title: kitForm.title,
        jobRole: kitForm.jobRole,
        roundType: kitForm.roundType,
        competencies: compArray,
        questionsJson: questionsArray,
      });
      setOpenNewKit(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateScorecard = async () => {
    try {
      await apiClient.interviewKits.submitScorecard(scorecardForm);
      setOpenNewScorecard(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <BookOpen size={26} color="#2563EB" />
            Interview Kits & Standardized Scorecards
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Structured evaluation rubrics, standardized question banks, and multi-interviewer scorecards inspired by Greenhouse and Bullhorn.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<Plus size={18} />}
            onClick={() => setOpenNewKit(true)}
            sx={{ borderColor: '#CBD5E1', color: '#1E3A8A', fontWeight: 700 }}
          >
            New Interview Kit
          </Button>
          <Button
            variant="contained"
            startIcon={<FileCheck size={18} />}
            onClick={() => setOpenNewScorecard(true)}
            sx={{ bgcolor: '#1E3A8A', fontWeight: 700 }}
          >
            Submit Scorecard
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ mb: 3 }}>
        <Tab label={`Interview Scorecards (${scorecards.length})`} sx={{ fontWeight: 700 }} />
        <Tab label={`Interview Kits Library (${kits.length})`} sx={{ fontWeight: 700 }} />
      </Tabs>

      {/* Tab 0: Scorecards */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Candidate Evaluator Scorecards
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Evaluator / Interviewer</TableCell>
                  <TableCell>Interview Kit / Role</TableCell>
                  <TableCell align="center">Overall Rating</TableCell>
                  <TableCell align="center">Recommendation</TableCell>
                  <TableCell>Key Strengths</TableCell>
                  <TableCell align="right">Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scorecards.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {s.interviewerName}
                      <Typography variant="caption" sx={{ display: 'block', color: '#64748B' }}>
                        {s.interviewerEmail}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {s.interviewKit?.title || 'Technical Round 1'}
                      </Typography>
                      <Chip label={s.interviewKit?.roundType || 'Technical'} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <Rating value={s.overallRating || 4} readOnly size="small" />
                        <Typography variant="caption" sx={{ fontWeight: 800 }}>({s.overallRating}/5)</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={s.recommendation}
                        size="small"
                        sx={{
                          bgcolor:
                            s.recommendation === 'StrongHire'
                              ? '#ECFDF5'
                              : s.recommendation === 'Hire'
                              ? '#EFF6FF'
                              : '#FEF3C7',
                          color:
                            s.recommendation === 'StrongHire'
                              ? '#059669'
                              : s.recommendation === 'Hire'
                              ? '#1E3A8A'
                              : '#D97706',
                          fontWeight: 800,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 320 }}>
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        {s.strengths || 'Competent execution.'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {new Date(s.submittedAt || s.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Tab 1: Kits Library */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {kits.map((k) => {
            let comps: string[] = [];
            let qs: any[] = [];
            try {
              comps = typeof k.competencies === 'string' ? JSON.parse(k.competencies) : k.competencies || [];
              qs = typeof k.questionsJson === 'string' ? JSON.parse(k.questionsJson) : k.questionsJson || [];
            } catch {
              comps = [];
              qs = [];
            }

            return (
              <Grid item xs={12} md={6} key={k.id}>
                <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                          {k.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Role: {k.jobRole} • Round: {k.roundType}
                        </Typography>
                      </Box>
                      <Chip label={`${k._count?.scorecards || 0} Scorecards`} size="small" sx={{ bgcolor: '#EFF6FF', color: '#1E3A8A', fontWeight: 700 }} />
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 1 }}>
                      EVALUATED COMPETENCIES:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {comps.map((c: string, idx: number) => (
                        <Chip key={idx} label={c} size="small" sx={{ bgcolor: '#F1F5F9', fontWeight: 600 }} />
                      ))}
                    </Box>

                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 1 }}>
                      SAMPLE INTERVIEW QUESTIONS:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {qs.map((q: any, idx: number) => (
                        <Box key={idx} sx={{ p: 1, bgcolor: '#F8FAFC', borderRadius: 1.5, border: '1px solid #F1F5F9' }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E3A8A', display: 'block' }}>
                            {q.area ? `[${q.area}]` : `Question ${idx + 1}`}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            {q.question}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Modal: New Interview Kit */}
      <Dialog open={openNewKit} onClose={() => setOpenNewKit(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Create Standardized Interview Kit</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Interview Kit Title"
            fullWidth
            required
            placeholder="e.g. Senior DevOps & Cloud Infrastructure - Round 1"
            value={kitForm.title}
            onChange={(e) => setKitForm({ ...kitForm, title: e.target.value })}
          />
          <TextField
            label="Target Job Role"
            fullWidth
            required
            value={kitForm.jobRole}
            onChange={(e) => setKitForm({ ...kitForm, jobRole: e.target.value })}
          />
          <TextField
            label="Round Type"
            fullWidth
            select
            value={kitForm.roundType}
            onChange={(e) => setKitForm({ ...kitForm, roundType: e.target.value })}
          >
            <MenuItem value="Technical">Technical</MenuItem>
            <MenuItem value="SystemDesign">System Design</MenuItem>
            <MenuItem value="Behavioral">Behavioral</MenuItem>
            <MenuItem value="Executive">Executive / Director Round</MenuItem>
          </TextField>
          <TextField
            label="Competencies (comma separated)"
            fullWidth
            placeholder="e.g. Kubernetes, Terraform, Security, Linux Kernel"
            value={kitForm.competencies}
            onChange={(e) => setKitForm({ ...kitForm, competencies: e.target.value })}
          />
          <TextField
            label="Standard Question 1"
            fullWidth
            value={kitForm.q1}
            onChange={(e) => setKitForm({ ...kitForm, q1: e.target.value })}
          />
          <TextField
            label="Standard Question 2"
            fullWidth
            value={kitForm.q2}
            onChange={(e) => setKitForm({ ...kitForm, q2: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenNewKit(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateKit} sx={{ bgcolor: '#1E3A8A' }}>
            Save Interview Kit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Submit Scorecard */}
      <Dialog open={openNewScorecard} onClose={() => setOpenNewScorecard(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Submit Evaluator Scorecard</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Select Candidate"
            fullWidth
            required
            select
            value={scorecardForm.candidateId}
            onChange={(e) => setScorecardForm({ ...scorecardForm, candidateId: e.target.value })}
          >
            {candidates.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.firstName} {c.lastName} ({c.currentTitle || 'Candidate'})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Select Interview Kit Template"
            fullWidth
            select
            value={scorecardForm.interviewKitId}
            onChange={(e) => setScorecardForm({ ...scorecardForm, interviewKitId: e.target.value })}
          >
            {kits.map((k) => (
              <MenuItem key={k.id} value={k.id}>
                {k.title}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Interviewer Full Name"
            fullWidth
            required
            value={scorecardForm.interviewerName}
            onChange={(e) => setScorecardForm({ ...scorecardForm, interviewerName: e.target.value })}
          />
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 0.5 }}>
              Overall Technical Rating (1 to 5)
            </Typography>
            <Rating
              value={scorecardForm.overallRating}
              onChange={(e, val) => setScorecardForm({ ...scorecardForm, overallRating: val || 4 })}
            />
          </Box>
          <TextField
            label="Final Recommendation"
            fullWidth
            select
            value={scorecardForm.recommendation}
            onChange={(e) => setScorecardForm({ ...scorecardForm, recommendation: e.target.value })}
          >
            <MenuItem value="StrongHire">Strong Hire (Top Tier)</MenuItem>
            <MenuItem value="Hire">Hire</MenuItem>
            <MenuItem value="Neutral">Neutral</MenuItem>
            <MenuItem value="NoHire">No Hire</MenuItem>
          </TextField>
          <TextField
            label="Candidate Strengths"
            fullWidth
            multiline
            rows={2}
            value={scorecardForm.strengths}
            onChange={(e) => setScorecardForm({ ...scorecardForm, strengths: e.target.value })}
          />
          <TextField
            label="Candidate Weaknesses / Areas of Growth"
            fullWidth
            multiline
            rows={2}
            value={scorecardForm.weaknesses}
            onChange={(e) => setScorecardForm({ ...scorecardForm, weaknesses: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenNewScorecard(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateScorecard} sx={{ bgcolor: '#1E3A8A' }}>
            Submit Scorecard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InterviewKits;
