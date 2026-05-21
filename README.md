# Application Cycle Tracker

A full-stack web application to manage your entire job application journey in one place. Track companies, job opportunities, contacts, interview questions, and reflections to stay organized through your career transitions.

## What Is This?

Application Cycle Tracker is a personal productivity tool designed for job seekers, career changers, and professionals managing multiple applications. Instead of scattered spreadsheets and browser bookmarks, everything lives in one clean, searchable interface:

- **Track companies** you're interested in with industry, size, and website info
- **Manage job applications** through their lifecycle (Wishlist → Applied → Closed)
- **Store contacts** (recruiters, employees) for networking and follow-ups
- **Organize interview prep** with categorized questions and your answers
- **Reflect on your journey** with a personal journal
- **See what's coming** with an at-a-glance dashboard of deadlines

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 16+
- Make (or run commands manually)

### 1. Install Dependencies

```bash
make install
```

This will:
- Install Python packages for the backend (`fastapi`, `uvicorn`, `sqlalchemy`)
- Install npm packages for the frontend (React, Vite, etc.)

### 2. Start the Backend

Open Terminal 1:

```bash
make backend
```

The API will run at `http://localhost:8080` with auto-reload enabled.

### 3. Start the Frontend

Open Terminal 2:

```bash
make frontend
```

The web app will run at `http://localhost:5173`.

### 4. Open in Browser

Navigate to `http://localhost:5173` and start tracking your applications!

## Available Make Commands

| Command | What It Does |
|---------|-------------|
| `make install` | Install all dependencies (backend + frontend) |
| `make backend` | Start the FastAPI server on port 8080 |
| `make frontend` | Start the Vite dev server on port 5173 |
| `make dev` | Show instructions for running both in separate terminals |

## Project Structure

```
application_cycle/
├── README.md                 ← You are here
├── Makefile                  ← Make command definitions
├── backend/
│   ├── README.md             ← Backend API documentation
│   ├── main.py               ← FastAPI app & all endpoints
│   ├── models.py             ← SQLAlchemy database models
│   ├── database.py           ← Database setup & sessions
│   ├── schemas.py            ← Pydantic request/response schemas
│   ├── requirements.txt       ← Python dependencies
│   └── db.sqlite             ← SQLite database (auto-created)
│
└── frontend/
    ├── README.md             ← Frontend documentation
    ├── vite.config.ts        ← Vite build config
    ├── src/
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── pages/
    │   ├── components/
    │   └── ...
    ├── package.json
    └── node_modules/
```

## How It Works

### Backend (FastAPI)

The backend provides a REST API with 6 resource types:
- **Companies** — employer profiles
- **Jobs** — job postings and applications
- **Contacts** — recruiters and employees
- **Questions** — interview prep questions
- **Journal** — reflection entries
- **Dashboard** — aggregated stats and deadlines

See `backend/README.md` for full API documentation.

### Frontend (React + Vite)

The frontend provides a clean interface to:
- Browse and manage companies
- Track job applications
- Store recruiter/employee contacts
- Prep for interviews
- Write journal entries
- View dashboard with upcoming deadlines

See `frontend/README.md` for UI setup and feature details.

## API Documentation

Once the backend is running, visit:

- **Swagger UI:** `http://localhost:8080/docs`
- **ReDoc:** `http://localhost:8080/redoc`

## Development Workflow

### 1. Make a change in frontend or backend

The dev servers auto-reload on file changes:
- **Backend:** changes to `backend/*.py` auto-reload via Uvicorn
- **Frontend:** changes to `frontend/src/**` auto-reload via Vite HMR

### 2. Test in the browser

`http://localhost:5173` will reflect your changes instantly.

### 3. Commit and push

```bash
git add .
git commit -m "description of changes"
git push origin main
```

## Database

The application uses **SQLite** for development (`db.sqlite`). The database is automatically created on first run.

To reset the database:
```bash
rm backend/db.sqlite
# Restart the backend — a fresh database will be created
```

## Configuration

### Frontend API URL

The frontend is configured to call the backend at `http://localhost:8080`. If you change the backend port, update the API base URL in `frontend/src/` accordingly.

### CORS

The backend currently allows requests from `http://localhost:5173` (the frontend dev server). For production, update CORS settings in `backend/main.py`.

### Environment Variables

Create a `.env` file in the root or backend directory if needed:

```bash
# backend/.env (optional)
DATABASE_URL=sqlite:///./db.sqlite
API_PORT=8080
```

## Common Tasks

### Add a new API endpoint

1. Define the model in `backend/models.py` (if needed)
2. Define the schema in `backend/schemas.py`
3. Add the route in `backend/main.py`
4. Test via `http://localhost:8080/docs`

### Add a new frontend page

1. Create a component in `frontend/src/pages/`
2. Add routing in `frontend/src/App.tsx`
3. Fetch from the backend API as needed

### Deploy

- **Backend:** Deploy to Heroku, Railway, Render, or your cloud provider
- **Frontend:** Deploy to Vercel, Netlify, or GitHub Pages

## Troubleshooting

**Port already in use?**
```bash
# Change the port in the Makefile or run directly:
cd backend && uvicorn main:app --reload --port 8081
cd frontend && npm run dev -- --port 3000
```

**Dependencies not installing?**
```bash
# Try installing each separately:
cd backend && pip install -r requirements.txt
cd frontend && npm install
```

**Database errors?**
```bash
rm backend/db.sqlite
# Restart the backend
```

**Frontend can't reach backend?**
- Ensure backend is running on port 8080
- Check CORS settings in `backend/main.py`
- Check API URL in frontend code

## Features

- ✅ Full CRUD for companies, jobs, contacts, questions, and journal
- ✅ Dashboard with upcoming deadlines
- ✅ Logo enrichment (auto-fetch company logos)
- ✅ Status tracking (Wishlist → Applied → Closed)
- ✅ Interview question categorization
- ✅ Real-time updates with auto-reload
- 🔄 (Future) User authentication
- 🔄 (Future) Export to PDF/CSV
- 🔄 (Future) Email deadline reminders
- 🔄 (Future) Mobile app

## Project Status

This is an active project under development. Core features are working; see issues and pull requests for planned enhancements.

## License

MIT

## Support

- **Backend docs:** `backend/README.md`
- **Frontend docs:** `frontend/README.md`
- **API Docs:** `http://localhost:8080/docs` (when running)

---

**Ready to get started?** Run `make install` and `make dev` to see the next steps!
