import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme/theme';
import { AppLayout } from './components/layout/AppLayout';

// Screen Imports
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/crm/Leads';
import { Accounts } from './pages/crm/Accounts';
import { Contacts } from './pages/crm/Contacts';
import { Opportunities } from './pages/crm/Opportunities';
import { Jobs } from './pages/ats/Jobs';
import { Candidates } from './pages/ats/Candidates';
import { Pipeline } from './pages/ats/Pipeline';
import { Submissions } from './pages/ats/Submissions';
import { Interviews } from './pages/ats/Interviews';
import { Placements } from './pages/ats/Placements';
import { Tasks } from './pages/Tasks';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

// Role-Specialized Workflow Imports
import { ResumeManagement } from './pages/ats/ResumeManagement';
import { RecruiterCoordination } from './pages/ats/RecruiterCoordination';
import { ClientFeedback } from './pages/ats/ClientFeedback';
import { Activities } from './pages/crm/Activities';

// 9 Enterprise Recruitment Operations & ATS Modules
import { TalentPools } from './pages/ats/TalentPools';
import { Screening } from './pages/ats/Screening';
import { InterviewKits } from './pages/ats/InterviewKits';
import { Offers } from './pages/ats/Offers';
import { Onboarding } from './pages/ats/Onboarding';
import { Compliance } from './pages/ats/Compliance';
import { Communications } from './pages/ats/Communications';
import { Redeployment } from './pages/ats/Redeployment';
import { Vendors } from './pages/ats/Vendors';

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('pavion_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Application Routes inside AppLayout */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                  <Route path="/" element={<Dashboard />} />
                  
                  {/* CRM Module Routes */}
                  <Route path="/crm/leads" element={<Leads />} />
                  <Route path="/crm/accounts" element={<Accounts />} />
                  <Route path="/crm/contacts" element={<Contacts />} />
                  <Route path="/crm/opportunities" element={<Opportunities />} />
                  <Route path="/crm/activities" element={<Activities />} />

                  {/* ATS Module Routes */}
                  <Route path="/ats/jobs" element={<Jobs />} />
                  <Route path="/ats/candidates" element={<Candidates />} />
                  <Route path="/ats/resumes" element={<ResumeManagement />} />
                  <Route path="/ats/pipeline" element={<Pipeline />} />
                  <Route path="/ats/submissions" element={<Submissions />} />
                  <Route path="/ats/interviews" element={<Interviews />} />
                  <Route path="/ats/client-feedback" element={<ClientFeedback />} />
                  <Route path="/ats/coordination" element={<RecruiterCoordination />} />
                  <Route path="/ats/placements" element={<Placements />} />

                  {/* Enterprise ATS & Operations Modules */}
                  <Route path="/ats/talent-pools" element={<TalentPools />} />
                  <Route path="/ats/screening" element={<Screening />} />
                  <Route path="/ats/interview-kits" element={<InterviewKits />} />
                  <Route path="/ats/offers" element={<Offers />} />
                  <Route path="/ats/onboarding" element={<Onboarding />} />
                  <Route path="/ats/compliance" element={<Compliance />} />
                  <Route path="/ats/communications" element={<Communications />} />
                  <Route path="/ats/redeployment" element={<Redeployment />} />
                  <Route path="/ats/vendors" element={<Vendors />} />

                  {/* Productivity & Admin Routes */}
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
