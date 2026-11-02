import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  FileText,
  Upload,
  Search,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Eye,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export const ResumeManagement: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<any | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Duplicate checker state
  const [checkEmail, setCheckEmail] = useState('');
  const [duplicateMatch, setDuplicateMatch] = useState<any | null>(null);
  const [checkingDup, setCheckingDup] = useState(false);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await apiClient.candidates.getCandidates({
        search: searchTerm,
        skill: skillFilter,
      });
      if (res.data.success) {
        setCandidates(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [skillFilter]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setParsing(true);
      setParsedResult(null);
      const formData = new FormData();
      formData.append('resume', file);

      const res = await apiClient.candidates.uploadResume(formData);
      if (res.data.success) {
        setParsedResult(res.data.data);
        setUploadSuccess(`Parsed "${file.name}" successfully with AI skill extraction!`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to parse resume');
    } finally {
      setParsing(false);
    }
  };

  const handleDuplicateCheck = async () => {
    if (!checkEmail) return;
    try {
      setCheckingDup(true);
      setDuplicateMatch(null);
      const res = await apiClient.candidates.checkDuplicate({ email: checkEmail });
      if (res.data.success && res.data.hasDuplicate) {
        setDuplicateMatch(res.data.matches[0]);
      } else {
        setDuplicateMatch('NONE');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingDup(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          ATS Resume Management & AI Parser Workbench <Sparkles size={24} color="#2563EB" />
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
          Dedicated Recruiter Workbench for resume ingestion, automated AI skill parsing, Boolean candidate search, and duplicate protection.
        </Typography>
      </Box>

      {uploadSuccess && (
        <Alert severity="success" onClose={() => setUploadSuccess(null)} sx={{ mb: 3, borderRadius: 2 }}>
          {uploadSuccess}
        </Alert>
      )}

      {/* Top Action Row: Drag/Drop Upload & Duplicate Checker */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Upload & AI Parser Card */}
        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ p: 1, bgcolor: '#EFF6FF', borderRadius: 2, color: '#1E3A8A' }}>
                  <Upload size={20} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    AI Resume Parser & Skill Extractor
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Upload PDF or DOCX to auto-extract candidate skills, experience & visa status
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  border: '2px dashed #CBD5E1',
                  borderRadius: 2.5,
                  p: 3,
                  textAlign: 'center',
                  bgcolor: '#F8FAFC',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#F1F5F9', borderColor: '#2563EB' },
                }}
                component="label"
              >
                <input type="file" accept=".pdf,.doc,.docx,.txt" hidden onChange={handleFileUpload} />
                <FileText size={36} color="#64748B" style={{ margin: '0 auto 8px' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  Click to Browse or Drag & Drop Resume File
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Supports PDF, DOCX, DOC up to 10MB
                </Typography>
              </Box>

              {parsing && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress />
                  <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600, mt: 0.5, display: 'block' }}>
                    Extracting technical competencies, work history & contact details...
                  </Typography>
                </Box>
              )}

              {parsedResult && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#ECFDF5', borderRadius: 2, border: '1px solid #A7F3D0' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#065F46', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle2 size={16} /> Extracted Profile: {parsedResult.firstName} {parsedResult.lastName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#047857', mt: 0.5, fontSize: '0.85rem' }}>
                    <strong>Title:</strong> {parsedResult.currentTitle || 'Fullstack Engineer'} | <strong>Exp:</strong> {parsedResult.totalExperience} Years | <strong>Auth:</strong> {parsedResult.workAuthorization || 'US Citizen'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {(Array.isArray(parsedResult.skills) ? parsedResult.skills : parsedResult.skills?.split(',') || []).map((s: string, idx: number) => (
                      <Chip key={idx} label={s.trim()} size="small" sx={{ bgcolor: '#D1FAE5', color: '#065F46', fontWeight: 600 }} />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Duplicate Protection Scanner Card */}
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ p: 1, bgcolor: '#FEF3C7', borderRadius: 2, color: '#D97706' }}>
                  <AlertTriangle size={20} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Duplicate Protection Scanner
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Prevent duplicate submissions before contacting candidate
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter email to check duplicates..."
                  value={checkEmail}
                  onChange={(e) => setCheckEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDuplicateCheck()}
                />
                <Button
                  variant="contained"
                  onClick={handleDuplicateCheck}
                  disabled={checkingDup || !checkEmail}
                  sx={{ bgcolor: '#1E3A8A', whiteSpace: 'nowrap' }}
                >
                  {checkingDup ? 'Checking...' : 'Verify'}
                </Button>
              </Box>

              {duplicateMatch && duplicateMatch !== 'NONE' && (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  <strong>Duplicate Candidate Detected!</strong> Candidate <strong>{duplicateMatch.candidate?.firstName} {duplicateMatch.candidate?.lastName}</strong> already exists in database ({duplicateMatch.candidate?.email}).
                </Alert>
              )}

              {duplicateMatch === 'NONE' && (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  <strong>Clean Record!</strong> No existing candidate matches this email address. Safe to source and submit.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sourced Talent & Resume Pool Table */}
      <Paper sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search candidate resumes by name or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchResumes()}
                InputProps={{
                  startAdornment: <Search size={16} color="#64748B" style={{ marginRight: 8 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Filter by skill (e.g. AWS, Java, React)..."
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchResumes()}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button variant="outlined" fullWidth onClick={fetchResumes} sx={{ height: 40, fontWeight: 700 }}>
                Filter
              </Button>
            </Grid>
          </Grid>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Candidate Code</TableCell>
                <TableCell>Candidate Name</TableCell>
                <TableCell>Current Role & Employer</TableCell>
                <TableCell>Total Experience</TableCell>
                <TableCell>Technical Skills</TableCell>
                <TableCell>Work Authorization</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4, color: '#64748B' }}>
                    No candidates found matching filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                candidates.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                      {c.candidateCode}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {c.firstName} {c.lastName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        {c.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{c.currentTitle || 'Software Engineer'}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        {c.currentEmployer || 'Consultant'}
                      </Typography>
                    </TableCell>
                    <TableCell>{c.totalExperience || 5} Years</TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(c.skills ? c.skills.split(',').slice(0, 3) : ['Java', 'Cloud']).map((s: string, idx: number) => (
                          <Chip key={idx} label={s.trim()} size="small" sx={{ fontSize: '0.72rem' }} />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={c.workAuthorization || 'US Citizen'}
                        size="small"
                        sx={{ bgcolor: '#EFF6FF', color: '#1E3A8A', fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={c.status} size="small" sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700 }} />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<Eye size={14} />}
                        onClick={() => setSelectedCandidate(c)}
                        sx={{ fontWeight: 600 }}
                      >
                        Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Profile Detail Dialog */}
      <Dialog open={Boolean(selectedCandidate)} onClose={() => setSelectedCandidate(null)} maxWidth="md" fullWidth>
        {selectedCandidate && (
          <>
            <DialogTitle sx={{ fontWeight: 800 }}>
              {selectedCandidate.firstName} {selectedCandidate.lastName} ({selectedCandidate.candidateCode})
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>Current Role</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedCandidate.currentTitle}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>Work Authorization</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedCandidate.workAuthorization}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>Email</Typography>
                  <Typography variant="body1">{selectedCandidate.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>Phone</Typography>
                  <Typography variant="body1">{selectedCandidate.phone || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>Technical Competencies</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 0.5 }}>
                    {(selectedCandidate.skills ? selectedCandidate.skills.split(',') : []).map((s: string, i: number) => (
                      <Chip key={i} label={s.trim()} sx={{ fontWeight: 600 }} />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setSelectedCandidate(null)}>Close</Button>
              <Button variant="contained" href="/ats/pipeline" sx={{ bgcolor: '#1E3A8A' }}>
                View in Pipeline
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
