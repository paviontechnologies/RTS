import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  Chip,
  Grid,
} from '@mui/material';
import { Building2, LogIn, Lock, Mail, Sparkles } from 'lucide-react';
import { apiClient } from '../api/client';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (localStorage.getItem('pavion_token')) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async (loginEmail?: string, loginPassword?: string) => {
    const submitEmail = loginEmail || email;
    const submitPassword = loginPassword || password;

    if (!submitEmail || !submitPassword) {
      setError('Please enter both work email and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.auth.login({
        email: submitEmail,
        password: submitPassword,
      });

      if (res.data.success) {
        localStorage.setItem('pavion_token', res.data.data.token);
        localStorage.setItem('pavion_user', JSON.stringify(res.data.data.user));
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('admin123');
    handleLogin(demoEmail, 'admin123');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F1F5F9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 480,
          width: '100%',
          p: { xs: 3, sm: 4.5 },
          borderRadius: 3.5,
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
          bgcolor: '#FFFFFF',
        }}
      >
        {/* Brand Header */}
        <Box sx={{ textAlign: 'center', mb: 3.5 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              bgcolor: '#1E3A8A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1.5rem',
              mx: 'auto',
              mb: 1.5,
              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.35)',
            }}
          >
            P
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Pavion Technologies
          </Typography>
          <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700, letterSpacing: '0.06em' }}>
            US STAFFING ATS + CRM PLATFORM
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 1 }}>
            Sign in to access your recruitment pipeline & client CRM
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <TextField
            fullWidth
            label="Work Email Address"
            placeholder="admin@pavion.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <Mail size={16} color="#64748B" style={{ marginRight: 8 }} />,
            }}
          />
          <TextField
            fullWidth
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2.5 }}
            InputProps={{
              startAdornment: <Lock size={16} color="#64748B" style={{ marginRight: 8 }} />,
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={<LogIn size={18} />}
            sx={{
              py: 1.2,
              bgcolor: '#1E3A8A',
              fontWeight: 700,
              borderRadius: 2,
              '&:hover': { bgcolor: '#172554' },
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
            OR 1-CLICK DEMO LOGIN (TEST ROLES)
          </Typography>
        </Divider>

        {/* 1-Click Role Login Buttons */}
        <Grid container spacing={1.5}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => handleQuickDemoLogin('admin@pavion.com')}
              sx={{
                py: 1,
                fontSize: '0.75rem',
                borderColor: '#E2E8F0',
                color: '#1E293B',
                textAlign: 'left',
                justifyContent: 'flex-start',
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
              }}
            >
              👑 <strong>Super Admin</strong>
            </Button>
          </Grid>

          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => handleQuickDemoLogin('alex.carter@pavion.com')}
              sx={{
                py: 1,
                fontSize: '0.75rem',
                borderColor: '#E2E8F0',
                color: '#1E293B',
                textAlign: 'left',
                justifyContent: 'flex-start',
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
              }}
            >
              🎯 <strong>Senior Recruiter</strong>
            </Button>
          </Grid>

          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => handleQuickDemoLogin('sarah.jenkins@pavion.com')}
              sx={{
                py: 1,
                fontSize: '0.75rem',
                borderColor: '#E2E8F0',
                color: '#1E293B',
                textAlign: 'left',
                justifyContent: 'flex-start',
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
              }}
            >
              💼 <strong>Account Manager</strong>
            </Button>
          </Grid>

          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => handleQuickDemoLogin('marcus.vance@pavion.com')}
              sx={{
                py: 1,
                fontSize: '0.75rem',
                borderColor: '#E2E8F0',
                color: '#1E293B',
                textAlign: 'left',
                justifyContent: 'flex-start',
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
              }}
            >
              📈 <strong>Sales / BDE</strong>
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
