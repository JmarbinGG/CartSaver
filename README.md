# CartSaver

Monorepo with a FastAPI backend and React PWA frontend.

## Quickstart

Backend:
- Create venv: `python -m venv .venv`
- Activate: `source .venv/bin/activate`
- Install: `pip install -r backend/requirements.txt`
- Run: `uvicorn app.main:app --reload --app-dir backend`

Frontend:
- Install: `npm install --prefix frontend`
- Run: `npm run dev --prefix frontend`
