import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Pavion Technologies - US Staffing ATS + CRM Platform API',
    version: '1.0.0',
    description: 'Enterprise REST API documentation for Pavion Technologies US Staffing recruitment platform.',
    contact: {
      name: 'Pavion Technologies Pvt. Ltd.',
      email: 'support@paviontechnologies.com',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Production/Local v1 Gateway',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'admin@pavion.com' },
                  password: { type: 'string', example: 'admin123' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Authenticated successfully' } },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user profile',
        responses: { 200: { description: 'User profile returned' } },
      },
    },
    '/dashboard/overview': {
      get: {
        tags: ['Dashboard & Analytics'],
        summary: 'Get CRM & ATS executive KPIs and leaderboard',
        responses: { 200: { description: 'Dashboard metrics returned' } },
      },
    },
    '/leads': {
      get: {
        tags: ['CRM - Leads'],
        summary: 'List leads with filters',
        responses: { 200: { description: 'Leads returned' } },
      },
      post: {
        tags: ['CRM - Leads'],
        summary: 'Create new lead',
        responses: { 201: { description: 'Lead created' } },
      },
    },
    '/leads/{id}/convert': {
      post: {
        tags: ['CRM - Leads'],
        summary: 'Convert lead to Client Account',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Converted successfully' } },
      },
    },
    '/accounts': {
      get: {
        tags: ['CRM - Accounts'],
        summary: 'List client accounts',
        responses: { 200: { description: 'Accounts returned' } },
      },
      post: {
        tags: ['CRM - Accounts'],
        summary: 'Create client account',
        responses: { 201: { description: 'Account created' } },
      },
    },
    '/opportunities': {
      get: {
        tags: ['CRM - Opportunities'],
        summary: 'List opportunities pipeline',
        responses: { 200: { description: 'Opportunities returned' } },
      },
      post: {
        tags: ['CRM - Opportunities'],
        summary: 'Create opportunity deal',
        responses: { 201: { description: 'Opportunity created' } },
      },
    },
    '/jobs': {
      get: {
        tags: ['ATS - Jobs'],
        summary: 'List job requisitions',
        responses: { 200: { description: 'Jobs returned' } },
      },
      post: {
        tags: ['ATS - Jobs'],
        summary: 'Create job requisition',
        responses: { 201: { description: 'Job created' } },
      },
    },
    '/candidates': {
      get: {
        tags: ['ATS - Candidates'],
        summary: 'List candidates database',
        responses: { 200: { description: 'Candidates returned' } },
      },
      post: {
        tags: ['ATS - Candidates'],
        summary: 'Add candidate',
        responses: { 201: { description: 'Candidate created' } },
      },
    },
    '/candidates/upload-resume': {
      post: {
        tags: ['ATS - Candidates'],
        summary: 'Upload and parse candidate resume',
        responses: { 200: { description: 'Extracted fields returned' } },
      },
    },
    '/candidates/check-duplicate': {
      get: {
        tags: ['ATS - Candidates'],
        summary: 'Check duplicate candidate by email, phone, or name',
        responses: { 200: { description: 'Duplicate matches returned' } },
      },
    },
    '/candidate-jobs': {
      get: {
        tags: ['ATS - Pipeline'],
        summary: 'Get recruitment pipeline stages',
        responses: { 200: { description: 'Pipeline items returned' } },
      },
    },
    '/candidate-jobs/{id}/stage': {
      patch: {
        tags: ['ATS - Pipeline'],
        summary: 'Update candidate stage across 16 stages',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Stage updated' } },
      },
    },
    '/submissions': {
      get: {
        tags: ['ATS - Submissions'],
        summary: 'List client submissions',
        responses: { 200: { description: 'Submissions returned' } },
      },
      post: {
        tags: ['ATS - Submissions'],
        summary: 'Submit candidate to client job',
        responses: { 201: { description: 'Submission created' } },
      },
    },
    '/interviews': {
      get: {
        tags: ['ATS - Interviews'],
        summary: 'List scheduled interviews',
        responses: { 200: { description: 'Interviews returned' } },
      },
      post: {
        tags: ['ATS - Interviews'],
        summary: 'Schedule interview with timezone',
        responses: { 201: { description: 'Interview scheduled' } },
      },
    },
    '/interviews/{id}/feedback': {
      post: {
        tags: ['ATS - Interviews'],
        summary: 'Record interview feedback and ratings',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Feedback saved' } },
      },
    },
    '/placements': {
      get: {
        tags: ['ATS - Placements'],
        summary: 'List active and historical placements',
        responses: { 200: { description: 'Placements returned' } },
      },
      post: {
        tags: ['ATS - Placements'],
        summary: 'Create placement record',
        responses: { 201: { description: 'Placement created' } },
      },
    },
  },
};

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
