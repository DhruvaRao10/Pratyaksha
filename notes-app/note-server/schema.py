from pydantic import BaseModel, HttpUrl, EmailStr, Field
from datetime import datetime
from typing import Optional, List


class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class LoginDetails(BaseModel):
    email: str
    password: str


class Passchange(BaseModel):
    email: str
    old_password: str
    new_password: str


class TokenSchema(BaseModel):
    access_token: str
    refresh_token: str


class TokenCreate(BaseModel):
    user_id: str
    access_token: str
    refresh_token: bool
    created_date: Optional[datetime]


class GoogleAuthRequest(BaseModel):
    firebase_token: str


class PdfDocumentResponse(BaseModel):
    id: Optional[int] = None
    user_id: int
    file_name: str
    file_size: int
    mime_type: str
    s3_key: str
    s3_url: Optional[HttpUrl] = None
    upload_date: Optional[datetime] = None
    processing_status: str

    class Config:
        from_attributes = True


class VideoDocumentCreate(BaseModel):
    url: HttpUrl
    user_id: int
    title: Optional[str] = None


class VideoDocumentResponse(BaseModel):
    id: Optional[int] = None
    user_id: int
    url: HttpUrl
    title: str
    s3_key: str
    s3_url: Optional[HttpUrl] = None
    upload_date: Optional[datetime] = None
    processing_status: str
    transcript_status: str
    duration: Optional[float] = None

    class Config:
        from_attributes = True


class AnalysisHistory(BaseModel):
    id: Optional[int] = None
    user_id: int
    doc_id: str
    file_name: str
    s3_url: Optional[HttpUrl] = None
    analysis: str
    processing_status: Optional[str] = "completed"
    timestamp: Optional[datetime] = None

    class Config:
        from_attributes = True


class ArxivSearchRequest(BaseModel):
    query: str
    categories: List[str] = []
    page: int = 1
    max_results: int = 10


class ElasticSearchRequest(BaseModel):
    query: str
    page: int = 1
    size: int = 10


class PrerequisitePapersRequest(BaseModel):
    title: Optional[str] = None
    doi: Optional[str] = None


class PrerequisitePaper(BaseModel):
    title: str
    authors: List[str]
    publication_year: int
    url: str



