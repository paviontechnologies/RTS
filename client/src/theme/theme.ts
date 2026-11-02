import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1E3A8A', // Deep Navy
      light: '#3B82F6',
      dark: '#172554',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#475569', // Slate
      light: '#64748B',
      dark: '#334155',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#059669', // Emerald
      light: '#10B981',
      dark: '#047857',
    },
    warning: {
      main: '#D97706', // Amber
      light: '#F59E0B',
      dark: '#B45309',
    },
    error: {
      main: '#DC2626', // Red
      light: '#EF4444',
      dark: '#B91C1C',
    },
    info: {
      main: '#0284C7', // Sky Blue
      light: '#0EA5E9',
      dark: '#0369A1',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: { fontWeight: 700, fontSize: '2rem' },
    h2: { fontWeight: 700, fontSize: '1.75rem' },
    h3: { fontWeight: 600, fontSize: '1.5rem' },
    h4: { fontWeight: 600, fontSize: '1.25rem' },
    h5: { fontWeight: 600, fontSize: '1.1rem' },
    h6: { fontWeight: 600, fontSize: '0.95rem' },
    subtitle1: { fontSize: '0.95rem', fontWeight: 500, color: '#475569' },
    subtitle2: { fontSize: '0.85rem', fontWeight: 500, color: '#64748B' },
    body1: { fontSize: '0.9rem', color: '#0F172A' },
    body2: { fontSize: '0.825rem', color: '#475569' },
    button: { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          padding: '6px 16px',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
          border: '1px solid #E2E8F0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
          border: '1px solid #E2E8F0',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#F8FAFC',
          fontWeight: 600,
          color: '#334155',
          borderBottom: '1px solid #E2E8F0',
          padding: '12px 16px',
        },
        body: {
          padding: '12px 16px',
          fontSize: '0.875rem',
          borderBottom: '1px solid #F1F5F9',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
          borderRadius: 6,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});
