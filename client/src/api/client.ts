import axios from 'axios';

const API_BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? `http://${window.location.hostname}:5055/api/v1`
    : '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pavion_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiClient = {
  // Authentication
  auth: {
    login: (credentials: any) => api.post('/auth/login', credentials),
    me: () => api.get('/auth/me'),
  },

  // Dashboard
  dashboard: {
    getOverview: () => api.get('/dashboard/overview'),
  },

  // CRM
  crm: {
    getLeads: (params?: any) => api.get('/leads', { params }),
    createLead: (data: any) => api.post('/leads', data),
    getLeadById: (id: string) => api.get(`/leads/${id}`),
    updateLead: (id: string, data: any) => api.patch(`/leads/${id}`, data),
    convertLead: (id: string) => api.post(`/leads/${id}/convert`),

    getAccounts: (params?: any) => api.get('/accounts', { params }),
    createAccount: (data: any) => api.post('/accounts', data),
    getAccountById: (id: string) => api.get(`/accounts/${id}`),

    getContacts: (params?: any) => api.get('/contacts', { params }),
    createContact: (data: any) => api.post('/contacts', data),

    getOpportunities: (params?: any) => api.get('/opportunities', { params }),
    createOpportunity: (data: any) => api.post('/opportunities', data),
    updateOpportunityStage: (id: string, data: any) => api.patch(`/opportunities/${id}/stage`, data),

    getActivities: () => api.get('/activities'),
    createActivity: (data: any) => api.post('/activities', data),

    getTasks: () => api.get('/tasks'),
    createTask: (data: any) => api.post('/tasks', data),
    updateTask: (id: string, data: any) => api.patch(`/tasks/${id}`, data),
  },

  // ATS - Jobs
  jobs: {
    getJobs: (params?: any) => api.get('/jobs', { params }),
    getJobById: (id: string) => api.get(`/jobs/${id}`),
    createJob: (data: any) => api.post('/jobs', data),
    updateJob: (id: string, data: any) => api.patch(`/jobs/${id}`, data),
    approveJob: (id: string) => api.post(`/jobs/${id}/approve`),
    getCandidateMatches: (id: string) => api.get(`/jobs/${id}/candidate-matches`),
  },

  // ATS - Candidates
  candidates: {
    getCandidates: (params?: any) => api.get('/candidates', { params }),
    getCandidateById: (id: string) => api.get(`/candidates/${id}`),
    createCandidate: (data: any) => api.post('/candidates', data),
    updateCandidate: (id: string, data: any) => api.patch(`/candidates/${id}`, data),
    checkDuplicate: (params: { email?: string; phone?: string; firstName?: string; lastName?: string }) =>
      api.get('/candidates/check-duplicate', { params }),
    uploadResume: (formData: FormData) =>
      api.post('/candidates/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
  },

  // ATS - Recruitment Pipeline
  pipeline: {
    associateCandidateToJob: (jobId: string, data: any) => api.post(`/jobs/${jobId}/candidates`, data),
    getCandidateJobs: (params?: any) => api.get('/candidate-jobs', { params }),
    updateStage: (id: string, data: { stage: string; notes?: string }) => api.patch(`/candidate-jobs/${id}/stage`, data),
    recordRTR: (id: string, data: any) => api.post(`/candidate-jobs/${id}/rtr`, data),
  },

  // ATS - Submissions
  submissions: {
    getSubmissions: (params?: any) => api.get('/submissions', { params }),
    getSubmissionById: (id: string) => api.get(`/submissions/${id}`),
    createSubmission: (data: any) => api.post('/submissions', data),
    updateSubmissionStatus: (id: string, data: any) => api.patch(`/submissions/${id}/status`, data),
  },

  // ATS - Interviews
  interviews: {
    getInterviews: (params?: any) => api.get('/interviews', { params }),
    scheduleInterview: (data: any) => api.post('/interviews', data),
    recordFeedback: (id: string, data: any) => api.post(`/interviews/${id}/feedback`, data),
  },

  // ATS - Placements
  placements: {
    getPlacements: (params?: any) => api.get('/placements', { params }),
    createPlacement: (data: any) => api.post('/placements', data),
    updatePlacement: (id: string, data: any) => api.patch(`/placements/${id}`, data),
  },

  // Settings & Admin
  settings: {
    getOrganization: () => api.get('/organizations/current'),
    updateOrganization: (data: any) => api.patch('/organizations/current', data),
    getUsers: () => api.get('/users'),
    createUser: (data: any) => api.post('/users', data),
    updateUser: (id: string, data: any) => api.patch(`/users/${id}`, data),
    getAuditLogs: () => api.get('/audit-logs'),
  },

  // Integrations Hub (LinkedIn, Monster, Dice, Chrome Extension)
  integrations: {
    getIntegrations: () => api.get('/integrations'),
    connect: (data: any) => api.post('/integrations/connect', data),
    disconnect: (provider: string) => api.post('/integrations/disconnect', { provider }),
    testConnection: (provider: string) => api.post('/integrations/test', { provider }),
    simulateCandidate: (data: any) => api.post('/integrations/simulate-candidate', data),
  },

  // Notifications
  notifications: {
    getNotifications: () => api.get('/notifications'),
    markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
    markAllAsRead: () => api.post('/notifications/mark-all-read'),
  },
};

export default api;
