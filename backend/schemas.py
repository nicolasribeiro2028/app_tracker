from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


# --- Company ---

class CompanyBase(BaseModel):
    name: str
    industry: Optional[str] = None
    size: Optional[str] = None
    website: Optional[str] = None
    domain: Optional[str] = None
    logo_url: Optional[str] = None
    notes: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(CompanyBase):
    name: Optional[str] = None

class Company(CompanyBase):
    id: int
    created_at: Optional[datetime] = None
    job_count: int = 0
    contact_count: int = 0

    class Config:
        from_attributes = True


# --- Job ---

class JobBase(BaseModel):
    company_id: int
    title: str
    url: Optional[str] = None
    status: Optional[str] = "Wishlist"
    applied_date: Optional[date] = None
    deadline: Optional[date] = None
    notes: Optional[str] = None

class JobCreate(JobBase):
    pass

class JobUpdate(JobBase):
    company_id: Optional[int] = None
    title: Optional[str] = None

class Job(JobBase):
    id: int
    created_at: Optional[datetime] = None
    company_name: Optional[str] = None
    company_logo_url: Optional[str] = None

    class Config:
        from_attributes = True


# --- Contact ---

class ContactBase(BaseModel):
    company_id: Optional[int] = None
    name: str
    role: Optional[str] = None
    email: Optional[str] = None
    linkedin_url: Optional[str] = None
    reached_out_on: Optional[date] = None
    follow_up_date: Optional[date] = None
    notes: Optional[str] = None
    star_rating: Optional[int] = None

class ContactCreate(ContactBase):
    pass

class ContactUpdate(ContactBase):
    name: Optional[str] = None

class Contact(ContactBase):
    id: int
    company_name: Optional[str] = None
    company_logo_url: Optional[str] = None
    session_count: int = 0
    last_chat: Optional[date] = None

    class Config:
        from_attributes = True


# --- Chat Session ---

class LearningBase(BaseModel):
    bullet: str

class LearningCreate(LearningBase):
    pass

class Learning(LearningBase):
    id: int
    session_id: int
    contact_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChatSessionBase(BaseModel):
    contact_id: int
    date: date
    summary: Optional[str] = None
    raw_notes: Optional[str] = None

class ChatSessionCreate(ChatSessionBase):
    learnings: list[str] = []

class ChatSessionUpdate(BaseModel):
    date: Optional[date] = None
    summary: Optional[str] = None
    raw_notes: Optional[str] = None
    learnings: Optional[list[str]] = None

class ChatSession(ChatSessionBase):
    id: int
    created_at: Optional[datetime] = None
    learnings: list[Learning] = []
    contact_name: Optional[str] = None
    contact_company: Optional[str] = None
    contact_logo_url: Optional[str] = None

    class Config:
        from_attributes = True


# --- AI Extract ---

class ExtractRequest(BaseModel):
    raw_notes: str

class ExtractResponse(BaseModel):
    learnings: list[str]


# --- Question ---

class QuestionBase(BaseModel):
    company_id: Optional[int] = None
    question: str
    category: Optional[str] = "Behavioral"
    my_answer: Optional[str] = None
    notes: Optional[str] = None

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(QuestionBase):
    question: Optional[str] = None

class Question(QuestionBase):
    id: int
    created_at: Optional[datetime] = None
    company_name: Optional[str] = None

    class Config:
        from_attributes = True


# --- Journal ---

class JournalEntryBase(BaseModel):
    date: date
    body: str

class JournalEntryCreate(JournalEntryBase):
    pass

class JournalEntryUpdate(JournalEntryBase):
    date: Optional[date] = None
    body: Optional[str] = None

class JournalEntry(JournalEntryBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Dashboard ---

class DeadlineItem(BaseModel):
    type: str  # "job" | "contact"
    id: int
    label: str
    company_name: Optional[str] = None
    company_logo_url: Optional[str] = None
    deadline: date

class DashboardStats(BaseModel):
    companies: int
    wishlist: int
    applied: int
    closed: int
    contacts: int
    questions: int
    upcoming_deadlines: list[DeadlineItem]
