from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    industry = Column(String)
    size = Column(String)
    website = Column(String)
    domain = Column(String)
    logo_url = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    jobs = relationship("Job", back_populates="company", cascade="all, delete-orphan")
    contacts = relationship("Contact", back_populates="company", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="company")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    title = Column(String, nullable=False)
    url = Column(String)
    status = Column(String, default="Wishlist")  # Wishlist | Applied | Closed
    applied_date = Column(Date)
    deadline = Column(Date)
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    company = relationship("Company", back_populates="jobs")


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    name = Column(String, nullable=False)
    role = Column(String)
    email = Column(String)
    linkedin_url = Column(String)
    reached_out_on = Column(Date)
    follow_up_date = Column(Date)
    notes = Column(Text)
    star_rating = Column(Integer, nullable=True)  # 1-5

    company = relationship("Company", back_populates="contacts")
    sessions = relationship("ChatSession", back_populates="contact", cascade="all, delete-orphan")


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)
    date = Column(Date, nullable=False)
    summary = Column(String)       # one-line headline
    raw_notes = Column(Text)       # original messy notes
    created_at = Column(DateTime, server_default=func.now())

    contact = relationship("Contact", back_populates="sessions")
    learnings = relationship("Learning", back_populates="session", cascade="all, delete-orphan")


class Learning(Base):
    __tablename__ = "learnings"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)
    bullet = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    session = relationship("ChatSession", back_populates="learnings")
    contact = relationship("Contact")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    question = Column(Text, nullable=False)
    category = Column(String, default="Behavioral")  # Behavioral | Technical | Case | Other
    my_answer = Column(Text)
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    company = relationship("Company", back_populates="questions")


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    body = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
