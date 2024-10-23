from pydantic import BaseModel
import datetime


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
    created_date: datetime.datetime
    
    

class GoogleAuthRequest(BaseModel):
    firebase_token: str
