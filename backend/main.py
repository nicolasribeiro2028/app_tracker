from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from typing import Optional
from urllib.parse import urlparse

import models, schemas
from database import engine, get_db, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Application Cycle Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helpers ──────────────────────────────────────────────────────────────────

def extract_domain(url: Optional[str]) -> Optional[str]:
    if not url:
        return None
    try:
        parsed = urlparse(url if "://" in url else f"https://{url}")
        host = parsed.netloc or parsed.path
        return host.lstrip("www.").split("/")[0] or None
    except Exception:
        return None


def clearbit_logo(domain: Optional[str]) -> Optional[str]:
    if domain:
        return f"https://www.google.com/s2/favicons?sz=64&domain={domain}"
    return None


def resolve_domain(domain: Optional[str], website: Optional[str]) -> Optional[str]:
    """Use explicit domain if set, otherwise derive it from website URL."""
    return domain or extract_domain(website)


def enrich_company(c: models.Company) -> schemas.Company:
    effective_domain = resolve_domain(c.domain, c.website)
    logo = c.logo_url or clearbit_logo(effective_domain)
    return schemas.Company(
        **{col: getattr(c, col) for col in ["id", "name", "industry", "size", "website", "domain", "notes", "created_at"]},
        logo_url=logo,
        job_count=len(c.jobs),
        contact_count=len(c.contacts),
    )


# ── Companies ─────────────────────────────────────────────────────────────────

@app.get("/companies", response_model=list[schemas.Company])
def list_companies(db: Session = Depends(get_db)):
    return [enrich_company(c) for c in db.query(models.Company).order_by(models.Company.name).all()]


@app.post("/companies", response_model=schemas.Company, status_code=201)
def create_company(payload: schemas.CompanyCreate, db: Session = Depends(get_db)):
    if payload.domain and not payload.logo_url:
        payload = payload.model_copy(update={"logo_url": clearbit_logo(payload.domain)})
    company = models.Company(**payload.model_dump())
    db.add(company)
    db.commit()
    db.refresh(company)
    return enrich_company(company)


@app.get("/companies/{company_id}", response_model=schemas.Company)
def get_company(company_id: int, db: Session = Depends(get_db)):
    c = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Company not found")
    return enrich_company(c)


@app.put("/companies/{company_id}", response_model=schemas.Company)
def update_company(company_id: int, payload: schemas.CompanyUpdate, db: Session = Depends(get_db)):
    c = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Company not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(c, k, v)
    if c.domain and not c.logo_url:
        c.logo_url = clearbit_logo(c.domain)
    db.commit()
    db.refresh(c)
    return enrich_company(c)


@app.delete("/companies/{company_id}", status_code=204)
def delete_company(company_id: int, db: Session = Depends(get_db)):
    c = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Company not found")
    db.delete(c)
    db.commit()


# ── Jobs ──────────────────────────────────────────────────────────────────────

def job_out(j: models.Job) -> schemas.Job:
    logo = None
    company_name = None
    if j.company:
        company_name = j.company.name
        logo = j.company.logo_url or clearbit_logo(resolve_domain(j.company.domain, j.company.website))
    return schemas.Job(
        **{col: getattr(j, col) for col in ["id", "company_id", "title", "url", "status", "applied_date", "deadline", "notes", "created_at"]},
        company_name=company_name,
        company_logo_url=logo,
    )


@app.get("/jobs", response_model=list[schemas.Job])
def list_jobs(status: Optional[str] = None, company_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(models.Job)
    if status:
        q = q.filter(models.Job.status == status)
    if company_id:
        q = q.filter(models.Job.company_id == company_id)
    return [job_out(j) for j in q.order_by(models.Job.created_at.desc()).all()]


@app.post("/jobs", response_model=schemas.Job, status_code=201)
def create_job(payload: schemas.JobCreate, db: Session = Depends(get_db)):
    job = models.Job(**payload.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job_out(job)


@app.get("/jobs/{job_id}", response_model=schemas.Job)
def get_job(job_id: int, db: Session = Depends(get_db)):
    j = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not j:
        raise HTTPException(status_code=404, detail="Job not found")
    return job_out(j)


@app.put("/jobs/{job_id}", response_model=schemas.Job)
def update_job(job_id: int, payload: schemas.JobUpdate, db: Session = Depends(get_db)):
    j = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not j:
        raise HTTPException(status_code=404, detail="Job not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(j, k, v)
    db.commit()
    db.refresh(j)
    return job_out(j)


@app.delete("/jobs/{job_id}", status_code=204)
def delete_job(job_id: int, db: Session = Depends(get_db)):
    j = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not j:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(j)
    db.commit()


# ── Contacts ──────────────────────────────────────────────────────────────────

def contact_out(c: models.Contact) -> schemas.Contact:
    logo = None
    company_name = None
    if c.company:
        company_name = c.company.name
        logo = c.company.logo_url or clearbit_logo(resolve_domain(c.company.domain, c.company.website))
    return schemas.Contact(
        **{col: getattr(c, col) for col in ["id", "company_id", "name", "role", "email", "linkedin_url", "reached_out_on", "follow_up_date", "notes"]},
        company_name=company_name,
        company_logo_url=logo,
    )


@app.get("/contacts", response_model=list[schemas.Contact])
def list_contacts(company_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(models.Contact)
    if company_id:
        q = q.filter(models.Contact.company_id == company_id)
    return [contact_out(c) for c in q.order_by(models.Contact.name).all()]


@app.post("/contacts", response_model=schemas.Contact, status_code=201)
def create_contact(payload: schemas.ContactCreate, db: Session = Depends(get_db)):
    contact = models.Contact(**payload.model_dump())
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact_out(contact)


@app.get("/contacts/{contact_id}", response_model=schemas.Contact)
def get_contact(contact_id: int, db: Session = Depends(get_db)):
    c = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact_out(c)


@app.put("/contacts/{contact_id}", response_model=schemas.Contact)
def update_contact(contact_id: int, payload: schemas.ContactUpdate, db: Session = Depends(get_db)):
    c = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Contact not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return contact_out(c)


@app.delete("/contacts/{contact_id}", status_code=204)
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    c = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Contact not found")
    db.delete(c)
    db.commit()


# ── Questions ─────────────────────────────────────────────────────────────────

def question_out(q: models.Question) -> schemas.Question:
    return schemas.Question(
        **{col: getattr(q, col) for col in ["id", "company_id", "question", "category", "my_answer", "notes", "created_at"]},
        company_name=q.company.name if q.company else None,
    )


@app.get("/questions", response_model=list[schemas.Question])
def list_questions(category: Optional[str] = None, company_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.Question)
    if category:
        query = query.filter(models.Question.category == category)
    if company_id:
        query = query.filter(models.Question.company_id == company_id)
    return [question_out(q) for q in query.order_by(models.Question.created_at.desc()).all()]


@app.post("/questions", response_model=schemas.Question, status_code=201)
def create_question(payload: schemas.QuestionCreate, db: Session = Depends(get_db)):
    q = models.Question(**payload.model_dump())
    db.add(q)
    db.commit()
    db.refresh(q)
    return question_out(q)


@app.get("/questions/{question_id}", response_model=schemas.Question)
def get_question(question_id: int, db: Session = Depends(get_db)):
    q = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    return question_out(q)


@app.put("/questions/{question_id}", response_model=schemas.Question)
def update_question(question_id: int, payload: schemas.QuestionUpdate, db: Session = Depends(get_db)):
    q = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(q, k, v)
    db.commit()
    db.refresh(q)
    return question_out(q)


@app.delete("/questions/{question_id}", status_code=204)
def delete_question(question_id: int, db: Session = Depends(get_db)):
    q = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(q)
    db.commit()


# ── Journal ───────────────────────────────────────────────────────────────────

@app.get("/journal", response_model=list[schemas.JournalEntry])
def list_journal(db: Session = Depends(get_db)):
    return db.query(models.JournalEntry).order_by(models.JournalEntry.date.desc()).all()


@app.post("/journal", response_model=schemas.JournalEntry, status_code=201)
def create_journal(payload: schemas.JournalEntryCreate, db: Session = Depends(get_db)):
    entry = models.JournalEntry(**payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@app.get("/journal/{entry_id}", response_model=schemas.JournalEntry)
def get_journal(entry_id: int, db: Session = Depends(get_db)):
    e = db.query(models.JournalEntry).filter(models.JournalEntry.id == entry_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Entry not found")
    return e


@app.put("/journal/{entry_id}", response_model=schemas.JournalEntry)
def update_journal(entry_id: int, payload: schemas.JournalEntryUpdate, db: Session = Depends(get_db)):
    e = db.query(models.JournalEntry).filter(models.JournalEntry.id == entry_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Entry not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(e, k, v)
    db.commit()
    db.refresh(e)
    return e


@app.delete("/journal/{entry_id}", status_code=204)
def delete_journal(entry_id: int, db: Session = Depends(get_db)):
    e = db.query(models.JournalEntry).filter(models.JournalEntry.id == entry_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(e)
    db.commit()


# ── Dashboard ─────────────────────────────────────────────────────────────────

@app.get("/dashboard", response_model=schemas.DashboardStats)
def dashboard(db: Session = Depends(get_db)):
    today = date.today()
    window = today + timedelta(days=14)

    companies = db.query(func.count(models.Company.id)).scalar()
    wishlist = db.query(func.count(models.Job.id)).filter(models.Job.status == "Wishlist").scalar()
    applied = db.query(func.count(models.Job.id)).filter(models.Job.status == "Applied").scalar()
    closed = db.query(func.count(models.Job.id)).filter(models.Job.status == "Closed").scalar()
    contacts_count = db.query(func.count(models.Contact.id)).scalar()
    questions_count = db.query(func.count(models.Question.id)).scalar()

    deadlines: list[schemas.DeadlineItem] = []

    jobs_due = db.query(models.Job).filter(
        models.Job.deadline != None,
        models.Job.deadline >= today,
        models.Job.deadline <= window,
    ).all()
    for j in jobs_due:
        logo = (j.company.logo_url or clearbit_logo(resolve_domain(j.company.domain, j.company.website))) if j.company else None
        deadlines.append(schemas.DeadlineItem(
            type="job", id=j.id, label=j.title,
            company_name=j.company.name if j.company else None,
            company_logo_url=logo,
            deadline=j.deadline,
        ))

    contacts_due = db.query(models.Contact).filter(
        models.Contact.follow_up_date != None,
        models.Contact.follow_up_date >= today,
        models.Contact.follow_up_date <= window,
    ).all()
    for c in contacts_due:
        logo = (c.company.logo_url or clearbit_logo(resolve_domain(c.company.domain, c.company.website))) if c.company else None
        deadlines.append(schemas.DeadlineItem(
            type="contact", id=c.id, label=c.name,
            company_name=c.company.name if c.company else None,
            company_logo_url=logo,
            deadline=c.follow_up_date,
        ))

    deadlines.sort(key=lambda d: d.deadline)

    return schemas.DashboardStats(
        companies=companies,
        wishlist=wishlist,
        applied=applied,
        closed=closed,
        contacts=contacts_count,
        questions=questions_count,
        upcoming_deadlines=deadlines,
    )
