# Instructions for Claude / AI Assistants

Pavion RTS is an Enterprise US Staffing ATS + CRM platform.
- **Frontend**: React 18, Vite, TypeScript, Material UI (`client/`). Runs on Port 3003.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM (`server/`). Runs on Port 5055.
- **AI Microservice**: Python 3.12, FastAPI, Scikit-learn (`services/ai-engine/`). Runs on Port 8000.
- **Search Indexer**: Go 1.22 (`tools/indexer/`).
- **Database**: PostgreSQL 18 with 8 schemas and 79 tables (`pavion_rts`).
