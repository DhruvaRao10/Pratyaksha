from sqlalchemy import Column, Integer, String, DateTime, Boolean
from database import Base
import datetime


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
    created_date = Column(DateTime, default=datetime.datetime.now)
