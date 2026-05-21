# Application Cycle Tracker — Backend API

A FastAPI-based REST API for managing your job application journey. Track companies, job opportunities, contacts, interview questions, and reflections — all in one place.

## Overview

The backend provides a complete CRUD API for managing:

- **Companies** — employer profiles with industry, size, website, and logo
- **Jobs** — job postings linked to companies with status tracking (Wishlist → Applied → Closed)
- **Contacts** — recruiter/employee connections with LinkedIn URLs and follow-up dates
- **Questions** — interview questions categorized (Behavioral, Technical, Case Study, Other)
- **Journal** — reflection entries to track your journey and learnings
- **Dashboard** — real-time statistics and upcoming deadlines

## Tech Stack

- **Framework:** FastAPI
- **Database:** SQLite with SQLAlchemy ORM
- **Frontend:** Vite + React (configured at `http://localhost:5173`)
- **Authentication:** CORS-enabled (development setup)

## Project Structure

```
backend/
├── main.py          # FastAPI application & all endpoints
├── models.py        # SQLAlchemy ORM models
├── database.py      # Database configuration & session management
├── schemas.py       # Pydantic schemas for request/response validation
└── db.sqlite        # SQLite database (auto-created)
```

## Installation & Setup

### 1. Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install fastapi uvicorn sqlalchemy pydantic
```

### 3. Run the API

```bash
uvicorn main:app --reload --port 8080
```

The API will be available at `http://localhost:8080`.

### 4. Access API Documentation

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

## API Endpoints

### Companies

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/companies` | List all companies |
| `POST` | `/companies` | Create a new company |
| `GET` | `/companies/{id}` | Get company details |
| `PUT` | `/companies/{id}` | Update company info |
| `DELETE` | `/companies/{id}` | Delete a company |

**Example Request:**
```json
POST /companies
{
  "name": "Google",
  "industry": "Technology",
  "size": "Large",
  "website": "https://google.com",
  "domain": "google.com"
}
```

### Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/jobs` | List all jobs (optional filters: `status`, `company_id`) |
| `POST` | `/jobs` | Create a job posting |
| `GET` | `/jobs/{id}` | Get job details |
| `PUT` | `/jobs/{id}` | Update job status |
| `DELETE` | `/jobs/{id}` | Delete a job posting |

**Example Request:**
```json
POST /jobs
{
  "company_id": 1,
  "title": "Senior Backend Engineer",
  "url": "https://google.com/careers/job123",
  "status": "Applied",
  "deadline": "2024-12-31"
}
```

### Contacts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/contacts` | List all contacts (optional filter: `company_id`) |
| `POST` | `/contacts` | Create a contact |
| `GET` | `/contacts/{id}` | Get contact details |
| `PUT` | `/contacts/{id}` | Update contact info |
| `DELETE` | `/contacts/{id}` | Delete a contact |

**Example Request:**
```json
POST /contacts
{
  "company_id": 1,
  "name": "John Smith",
  "role": "Hiring Manager",
  "email": "john@google.com",
  "linkedin_url": "https://linkedin.com/in/johnsmith",
  "reached_out_on": "2024-11-15",
  "follow_up_date": "2024-11-30"
}
```

### Questions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/questions` | List questions (filters: `category`, `company_id`) |
| `POST` | `/questions` | Create a question |
| `GET` | `/questions/{id}` | Get question details |
| `PUT` | `/questions/{id}` | Update question/answer |
| `DELETE` | `/questions/{id}` | Delete a question |

**Example Request:**
```json
POST /questions
{
  "company_id": 1,
  "question": "Why do you want to work at Google?",
  "category": "Behavioral",
  "my_answer": "I'm passionate about...",
  "notes": "Focus on impact"
}
```

### Journal

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/journal` | List all journal entries (newest first) |
| `POST` | `/journal` | Create a new entry |
| `GET` | `/journal/{id}` | Get journal entry |
| `PUT` | `/journal/{id}` | Update an entry |
| `DELETE` | `/journal/{id}` | Delete an entry |

**Example Request:**
```json
POST /journal
{
  "date": "2024-11-20",
  "body": "Had a great technical interview today. Discussed system design..."
}
```

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dashboard` | Get aggregated stats and upcoming deadlines |

**Response:**
```json
{
  "companies": 15,
  "wishlist": 20,
  "applied": 8,
  "closed": 2,
  "contacts": 12,
  "questions": 45,
  "upcoming_deadlines": [
    {
      "type": "job",
      "id": 5,
      "label": "Senior Engineer",
      "company_name": "Google",
      "company_logo_url": "...",
      "deadline": "2024-12-31"
    }
  ]
}
```

## Key Features

### 1. Logo Enrichment

Company logos are automatically fetched using Google's favicon service:
- If you provide a `domain`, the logo is auto-resolved
- You can override with a custom `logo_url`

### 2. Company Linking

Jobs and contacts are linked to companies, enabling:
- Filter jobs/contacts by company
- View all jobs and contacts for a company
- Cascade delete (deleting a company removes associated jobs/contacts)

### 3. Status Tracking

Track job applications through three stages:
- **Wishlist** — companies of interest
- **Applied** — applications submitted
- **Closed** — final outcomes

### 4. Deadline Alerts

Dashboard shows upcoming deadlines (next 14 days) for:
- Job application deadlines
- Contact follow-up dates

### 5. Interview Prep

Organize questions by category:
- **Behavioral** — STAR method questions
- **Technical** — coding & system design
- **Case Study** — problem-solving scenarios
- **Other** — miscellaneous

## Database Schema

The SQLite database includes 6 tables:

- **companies** — employer data
- **jobs** — job postings and application statuses
- **contacts** — recruiter/employee connections
- **questions** — interview questions and your answers
- **journal_entries** — reflection log
- **journal_entries** — indexed by date for quick lookups

## CORS Configuration

Currently configured for development with the frontend at `http://localhost:5173`. Update `main.py` line 16–22 for production:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Change this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Development Notes

- Database is auto-created on first run (SQLite file: `db.sqlite`)
- All timestamps use UTC and server-side defaults
- Filtering is case-sensitive (consider adding case-insensitive search in future)
- No authentication is implemented (add JWT/OAuth for production)

## Future Enhancements

- [ ] User authentication (JWT)
- [ ] Advanced search and filtering
- [ ] Export data to CSV/PDF
- [ ] Email reminders for deadlines
- [ ] Integration with job boards (LinkedIn API)
- [ ] Interview scheduling
- [ ] Performance analytics

## Troubleshooting

**Port 8000 already in use:**
```bash
uvicorn main:app --reload --port 8001
```

**Database locked error:**
```bash
rm db.sqlite
# Restart the API — database will be recreated
```

**CORS errors in frontend:**
Check that `allow_origins` in `main.py` matches your frontend URL.

## License

MIT

## Support

For issues or questions, check the frontend README or open an issue in the repository.
