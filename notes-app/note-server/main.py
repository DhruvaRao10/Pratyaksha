import models
import schema
import jwt
from datetime import datetime
from models import User, TokenTable
from database import Base, engine, sessionLocal
from sqlalchemy.orm import Session
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from auth_bearer import JWTBearer
from functools import wraps
from utils import (
    create_access_token,
    create_refresh_token,
    verify_password,
    get_hashed_password,
)
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, auth
from schema import TokenSchema
import logging


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


ACCESS_TOKEN_EXPIRE = 90
REFRESH_TOKEN_EXPIRE = 60 * 24 * 7

JWT_SECRET_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcyOTM5ODE2MSwiaWF0IjoxNzI5Mzk4MTYxfQ.psKzl2mOOl4EWNWKLxFxYhZ0AoQMOdIddTPNG6boaGw"
ALGORITHM = "HS256"
JWT_REFRESH_SECRET_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcyOTM5ODI0OCwiaWF0IjoxNzI5Mzk4MjQ4fQ.xvV1MAm6GHuBZrN7QqOoG1Z4bzBI2WpwqrfA4B9tntg"


Base.metadata.create_all(engine)


cred = credentials.Certificate(
    "./intuitnote-2342a-firebase-adminsdk-ia7wu-e8ccda4780.json"
)
firebase_admin.initialize_app(cred)


def get_session():
    session = sessionLocal()
    try:
        yield session
    finally:
        session.close()


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/register")
def register_user(user: schema.UserCreate, session: Session = Depends(get_session)):
    print("Entering register")
    existing_user = session.query(models.User).filter_by(email=user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    encrypted_password = get_hashed_password(user.password)

    new_user = models.User(
        username=user.username, email=user.email, password=encrypted_password
    )

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return {"message": "user created successfully"}


@app.post("/login", response_model=schema.TokenSchema)
def login(request: schema.LoginDetails, db: Session = Depends(get_session)):
    user = db.query(User).filter(User.email == request.email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect email"
        )
    hashed_pass = user.password
    if not verify_password(request.password, hashed_pass):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect password"
        )

    access = create_access_token(user.id)
    refresh = create_refresh_token(user.id)

    token_db = models.TokenTable(
        user_id=user.id, access_token=access, refresh_token=refresh, status=True
    )
    db.add(token_db)
    db.commit()
    db.refresh(token_db)
    return {"access_token": access, "refresh_token": refresh}


@app.post("/login/google", response_model=schema.TokenSchema)
async def google_login(
    request: schema.GoogleAuthRequest, db: Session = Depends(get_session)
):
    try:
        logger.info(
            f"Received token: {request.firebase_token[:10]}..."
        )  

        # Verify the Firebase token
        decoded_token = auth.verify_id_token(request.firebase_token)
        logger.info(f"Decoded token: {decoded_token}")

        # Get user info from decoded token
        email = decoded_token["email"]
        firebase_uid = decoded_token["uid"]
        name = decoded_token.get("name", email.split("@")[0])

        logger.info(f"Processing login for email: {email}")

        # verify user
        user = db.query(User).filter(User.email == email).first()

        if not user:
            logger.info(f"Creating new user for email: {email}")
            # Create new user if they don't exist
            new_user = models.User(
                email=email,
                firebase_uid=firebase_uid,
                username=name,
                password=get_hashed_password(firebase_uid),  # Simplified for debugging
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            user = new_user

        # Create tokens
        access = create_access_token(user.id)
        refresh = create_refresh_token(user.id)

        # Store tokens
        token_db = models.TokenTable(
            user_id=user.id, access_token=access, refresh_token=refresh, status=True
        )
        db.add(token_db)
        db.commit()
        db.refresh(token_db)

        return {"access_token": access, "refresh_token": refresh}

    except auth.InvalidIdTokenError as e:
        logger.error(f"Invalid Firebase token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Firebase token: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Error in google_login: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error processing Google login: {str(e)}",
        )


@app.get("/getusers")
def getusers(
    dependencies=Depends(JWTBearer()), session: Session = Depends(get_session)
):
    user = session.query(models.User).all()
    return user


@app.post("/passchange")
def passchange(request: schema.Passchange, db: Session = Depends(get_session)):
    user = db.query(models.User).filter(models.User.email == request.email).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="User not found"
        )

    if not verify_password(request.old_password, user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid old password"
        )

    encrypted_password = get_hashed_password(request.new_password)
    user.password = encrypted_password
    db.commit()

    return {"message": "Password changed successfully"}


@app.post("/logout")
def logout(dependencies=Depends(JWTBearer()), db: Session = Depends(get_session)):
    token = dependencies
    payload = jwt.decode(token, JWT_SECRET_KEY, ALGORITHM)
    user_id = payload["sub"]
    token_record = db.query(models.TokenTable).all()
    info = []
    for record in token_record:
        print("record", record)
        if (datetime.utcnow() - record.created_date).days > 1:
            info.append(record.user_id)

    if info:
        existing_token = (
            db.query(models.TokenTable)
            .filter(
                models.TokenTable.user_id == user_id,
                models.TokenTable.access_token == token,
            )
            .first()
        )
        if existing_token:
            existing_token.status = False
            db.add(existing_token)
            db.commit()
            db.refresh(existing_token)
        return {"message": "logout successfully"}


def token_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):

        payload = jwt.decode(kwargs["dependencies"], JWT_SECRET_KEY, ALGORITHM)
        user_id = payload["sub"]
        data = (
            kwargs["session"]
            .query(models.TokenTable)
            .filter_by(user_id=user_id, access_toke=kwargs["dependencies"], status=True)
            .first()
        )
        if data:
            return func(kwargs["dependencies"], kwargs["session"])

        else:
            return {"msg": "Token blocked"}

    return wrapper
