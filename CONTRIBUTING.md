# Contributing to Pavion RTS

Thank you for your interest in contributing to Pavion Technologies RTS!

## Development Workflow
1. Fork and clone the repository.
2. Run `./scripts/setup_dev.sh` to install all dependencies across TypeScript, Python, and Go.
3. Create a feature branch: `git checkout -b feat/your-feature-name`.
4. Ensure all automated tests pass:
   - Python AI tests: `python3 -m unittest services/ai-engine/test_ai_engine.py`
   - Backend TypeScript build: `cd server && npm run build`
   - Frontend React build: `cd client && npm run build`
5. Open a Pull Request against `main`.
