#!/usr/bin/env bash
# ==============================================================================
# Pavion Technologies RTS - Development Environment Setup Script
# Configures TypeScript Frontend, Node.js Backend, Python AI Engine & PostgreSQL
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "=== Pavion RTS: Setting up Development Environment ==="
echo "Project Root: ${ROOT_DIR}"

# 1. Check Prerequisites
echo "--> Checking system prerequisites..."
command -v node >/dev/null 2>&1 || { echo "[ERROR] Node.js is required. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "[ERROR] npm is required. Aborting."; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "[ERROR] Python 3 is required. Aborting."; exit 1; }

NODE_VER=$(node -v)
PYTHON_VER=$(python3 --version)
echo "  [OK] Node.js: ${NODE_VER}"
echo "  [OK] Python: ${PYTHON_VER}"

# 2. Setup Node.js Server
echo "--> Installing Backend Dependencies (server/)..."
cd "${ROOT_DIR}/server"
npm install --silent
npm run prisma:generate

# 3. Setup React Frontend
echo "--> Installing Frontend Dependencies (client/)..."
cd "${ROOT_DIR}/client"
npm install --silent

# 4. Setup Python AI Engine
echo "--> Configuring Python AI Microservice (services/ai-engine/)..."
cd "${ROOT_DIR}/services/ai-engine"
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "  [OK] Created Python virtual environment (venv)"
fi
source venv/bin/activate
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
deactivate

# 5. Verify Unit Tests
echo "--> Running AI Engine Unit Tests..."
python3 -m unittest test_ai_engine.py

echo "=== Pavion RTS: Setup Completed Successfully! ==="
echo "To start services:"
echo "  - Frontend (Port 3003):  cd client && npm run dev"
echo "  - Backend (Port 5055):   cd server && npm run dev"
echo "  - AI Engine (Port 8000): cd services/ai-engine && uvicorn main:app --port 8000"
echo "  - Database Studio (5555): cd server && npm run db:studio"
