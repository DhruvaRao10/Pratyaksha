from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    DateTime,
    Boolean,
    ForeignKey,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timezone


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50))
    email = Column(String(100), unique=True)
    password = Column(String(100))
    firebase_uid = Column(String(128), unique=True, nullable=True)


class TokenTable(Base):
    __tablename__ = "token"
    user_id = Column(Integer)
    access_token = Column(String(500), primary_key=True)
    refresh_token = Column(String(500), nullable=False)

    status = Column(Boolean)
    created_date = Column(DateTime, default=datetime.now)


class UserProfile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    username = Column(String(50))
    email = Column(String(100), unique=True)
    password = Column(String(100))
    bio = Column(String)
    firebase_uid = Column(String(128), unique=True, nullable=True)

    # pdf_documents = relationship("PdfDocument", back_populates="user")


class PdfDocument(Base):
    __tablename__ = "pdf_documents"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    s3_key = Column(String(500), unique=True, nullable=False)
    s3_url = Column(String(1000))
    file_size = Column(Integer)
    mime_type = Column(String(100))
    upload_date = Column(DateTime, default=datetime.now(tz=timezone.utc))
    last_accessed = Column(DateTime)
    processing_status = Column(String(20), default="pending")

    # user = relationship("User", back_populates="pdf_documents")

    related_papers = relationship("RelatedPaper", back_populates="document")


class VideoDocument(Base):
    __tablename__ = "video_documents"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    url = Column(String(500), nullable=False)
    title = Column(String(500))
    s3_key = Column(String(500), unique=True, nullable=False)
    s3_url = Column(String(1000))
    upload_date = Column(DateTime, default=datetime.now(tz=timezone.utc))
    last_accessed = Column(DateTime)
    processing_status = Column(String(20), default="pending")
    transcript_status = Column(String(20), default="pending")
    duration = Column(Float)
    error_message = Column(String(1000))


class History(Base):
    __tablename__ = "notes_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doc_id = Column(String(255), nullable=False)
    file_name = Column(String(255), nullable=False)
    s3_url = Column(String(1000))
    analysis = Column(Text)
    processing_status = Column(String(20), default="completed")
    timestamp = Column(DateTime, default=datetime.now(tz=timezone.utc))


class RelatedPaper(Base):
    __tablename__ = "related_papers"

    id = Column(Integer, primary_key=True, index=True)
    doc_id = Column(Integer, ForeignKey("pdf_documents.id"))
    title = Column(String(500))
    url = Column(String(1000))
    authors = Column(JSON)
    publication_year = Column(String(10))
    abstract = Column(Text)
    categories = Column(JSON)
    relevance_score = Column(Float)
    created_at = Column(DateTime(timezone=True), default=datetime.now(tz=timezone.utc))

    document = relationship("PdfDocument", back_populates="related_papers")


PdfDocument.related_papers = relationship("RelatedPaper", back_populates="document")
