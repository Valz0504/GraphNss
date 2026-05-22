# GraphNss

Web application built with **Next.js 15** (frontend) and **FastAPI** (backend).

## Project Structure

```
GraphNss/
├── frontend/          # Next.js 15 App Router + Tailwind CSS
├── backend/           # Python FastAPI + uv
├── docker-compose.yml
├── Dockerfile
└── .gitignore
```

## Getting Started

### Backend

```bash
cd backend
cp .env.example .env      # copy env template
uv run uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/api/docs

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm run dev
```

App available at: http://localhost:3000

### Run with Docker

```bash
docker compose up --build
```

## Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | Next.js 15, Tailwind CSS, TypeScript |
| Backend   | Python 3.11+, FastAPI, uv |
| Dev Tools | Ruff, Pytest, ESLint     |
| Container | Docker, Docker Compose   |