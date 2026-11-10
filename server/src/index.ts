import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRoutes from './routes/api.routes';
import { setupSwagger } from './swagger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Swagger Documentation
setupSwagger(app);

// Health check
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    product: 'Pavion Technologies - US Staffing ATS + CRM Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Root & API v1 Welcome Handlers
const handleWelcome = (req: Request, res: Response) => {
  if (req.accepts('html')) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pavion Technologies - US Staffing Platform</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F8FAFC; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
            .card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 36px; max-width: 600px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); text-align: center; }
            .badge { display: inline-block; background: #DBEAFE; color: #1E3A8A; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 20px; margin-bottom: 16px; }
            h1 { color: #0F172A; font-size: 24px; margin-bottom: 8px; }
            p { color: #64748B; font-size: 15px; line-height: 1.5; margin-bottom: 24px; }
            .btn-group { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 24px; }
            .btn { display: inline-flex; align-items: center; justify-content: center; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 14px; transition: all 0.2s; }
            .btn-primary { background: #1E3A8A; color: #FFFFFF; }
            .btn-primary:hover { background: #172554; }
            .btn-secondary { background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE; }
            .btn-secondary:hover { background: #DBEAFE; }
            .endpoints { text-align: left; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; font-size: 13px; color: #334155; }
            .endpoints code { background: #E2E8F0; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">API GATEWAY RUNNING</span>
            <h1>Pavion Technologies Platform</h1>
            <p>You have accessed the backend REST API server. To view and use the full recruitment and CRM platform, open the Web UI:</p>
            <div class="btn-group">
              <a href="http://localhost:3003" class="btn btn-primary">🚀 Open Web Application (Port 3003)</a>
              <a href="/api-docs" class="btn btn-secondary">📑 Open Swagger Documentation</a>
            </div>
            <div class="endpoints">
              <strong>Quick API Endpoints:</strong><br>
              • <code>GET /api/v1/health</code> - Service Health<br>
              • <code>GET /api/v1/dashboard/overview</code> - CRM & ATS KPIs<br>
              • <code>GET /api/v1/jobs</code> - Job Requisitions<br>
              • <code>GET /api/v1/candidates</code> - Candidates Database<br>
              • <code>GET /api/v1/leads</code> - CRM Leads
            </div>
          </div>
        </body>
      </html>
    `);
  }
  return res.json({
    status: 'online',
    product: 'Pavion Technologies - US Staffing ATS + CRM Platform',
    version: '1.0.0',
    webAppUrl: 'http://localhost:3003',
    swaggerDocsUrl: '/api-docs',
    endpoints: {
      health: '/api/v1/health',
      dashboard: '/api/v1/dashboard/overview',
      leads: '/api/v1/leads',
      accounts: '/api/v1/accounts',
      jobs: '/api/v1/jobs',
      candidates: '/api/v1/candidates',
      pipeline: '/api/v1/candidate-jobs',
      submissions: '/api/v1/submissions',
      interviews: '/api/v1/interviews',
      placements: '/api/v1/placements',
    },
  });
};

app.get('/', handleWelcome);
app.get('/api/v1', handleWelcome);

// API Routes
app.use('/api/v1', apiRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.url}`,
    code: 'NOT_FOUND',
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    code: err.code || 'SERVER_ERROR',
  });
});

app.listen(PORT, () => {
  console.log(`\n===============================================================`);
  console.log(`🚀 Pavion Technologies ATS + CRM Platform API is running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📑 Swagger Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`===============================================================\n`);
});

export default app;
