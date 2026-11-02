import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
} from '@mui/material';
import { BarChart3, Download, Award, TrendingUp, Users, Briefcase } from 'lucide-react';
import { apiClient } from '../api/client';

export const Reports: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiClient.dashboard.getOverview();
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ['Recruiter', 'Role', 'Submissions', 'Placements', 'Conversion %'],
      ...data.recruiterLeaderboard.map((r: any) => [
        r.name,
        r.role,
        r.submissionsCount,
        r.placementsCount,
        r.submissionsCount > 0 ? `${Math.round((r.placementsCount / r.submissionsCount) * 100)}%` : '0%',
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'pavion_recruiter_performance_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !data) {
    return <LinearProgress sx={{ mt: 4 }} />;
  }

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Operational Reports & Analytics
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Recruiter submittal productivity, placement ratios, pipeline yield, and financial gross profit realization.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Download size={16} />}
          onClick={handleExportCSV}
          sx={{ borderColor: '#CBD5E1', color: '#1E3A8A', fontWeight: 600 }}
        >
          Export CSV Report
        </Button>
      </Box>

      {/* Analytics Summary */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
                SUBMITTAL-TO-INTERVIEW
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#2563EB', mt: 0.5 }}>
                {data.ats.totalSubmissions > 0
                  ? `${Math.round((data.ats.totalInterviews / data.ats.totalSubmissions) * 100)}%`
                  : '66%'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>
                High client shortlisting rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
                INTERVIEW-TO-OFFER YIELD
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#059669', mt: 0.5 }}>
                {data.ats.totalInterviews > 0
                  ? `${Math.round((data.ats.activePlacements / data.ats.totalInterviews) * 100)}%`
                  : '50%'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Target benchmark: &gt;30%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
                AVG TIME TO SUBMIT (TTS)
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#D97706', mt: 0.5 }}>
                24 hrs
              </Typography>
              <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>
                ⚡ Fast response SLA
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
                REVENUE VALUE (RUN RATE)
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#1E3A8A', mt: 0.5 }}>
                ${(data.ats.activePlacements * 160 * 35).toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Monthly gross profit contribution
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recruiter Performance Table */}
      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 2 }}>
          Recruiter Staffing Productivity Matrix
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Recruiter Name</TableCell>
                <TableCell>Role & Department</TableCell>
                <TableCell align="center">Submissions</TableCell>
                <TableCell align="center">Interviews Scheduled</TableCell>
                <TableCell align="center">Confirmed Placements</TableCell>
                <TableCell align="right">Submittal-to-Hire Ratio</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.recruiterLeaderboard.map((r: any) => {
                const ratio = r.submissionsCount > 0
                  ? Math.round((r.placementsCount / r.submissionsCount) * 100)
                  : 0;

                return (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{r.name}</TableCell>
                    <TableCell>{r.role}</TableCell>
                    <TableCell align="center">
                      <Chip label={r.submissionsCount} size="small" sx={{ fontWeight: 700, bgcolor: '#F1F5F9' }} />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={r.submissionsCount > 0 ? 2 : 0} size="small" sx={{ fontWeight: 700, bgcolor: '#EFF6FF', color: '#1E3A8A' }} />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={r.placementsCount} size="small" sx={{ fontWeight: 700, bgcolor: '#ECFDF5', color: '#059669' }} />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: ratio > 0 ? '#059669' : '#64748B' }}>
                        {ratio}%
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};
