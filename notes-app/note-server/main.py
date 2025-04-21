import models
from schema import (
    TokenSchema,
    TokenCreate,
    UserCreate,
    Passchange,
    GoogleAuthRequest,
    PdfDocumentResponse,
    VideoDocumentCreate,
    VideoDocumentResponse,
    LoginDetails,
    AnalysisHistory,
    ArxivSearchRequest,
    ElasticSearchRequest,
)
from pathlib import Path
import httpx

import jwt
from datetime import datetime, timezone
from models import User, TokenTable
from database import Base, engine, sessionLocal
from sqlalchemy.orm import Session
from fastapi import FastAPI, Depends, Query
from fastapi.responses import StreamingResponse


from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    status,
    File,
    UploadFile,
    Form,
    BackgroundTasks,
)
from fastapi.security import OAuth2PasswordBearer
from auth_bearer import JWTBearer
from functools import wraps
from utils import (
    create_access_token,
    decode_access_token,
    create_refresh_token,
    verify_password,
    get_hashed_password,
)
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, auth
from schema import TokenSchema
import logging
import boto3
from botocore.exceptions import ClientError
import os
from dotenv import load_dotenv
from RAG import RAGPipeline
from videoProcessor import YoutubeProcessor
from history import load_user_docs
import arxiv
from elasticsearch import Elasticsearch, ApiError, AsyncElasticsearch
import json
from search import search_arxiv, search_elastic, index_arxiv_paper


load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


ACCESS_TOKEN_EXPIRE = 90
REFRESH_TOKEN_EXPIRE = 60 * 24 * 7

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_REFRESH_SECRET_KEY = os.getenv("JWT_REFRESH_SECRET_KEY")
ALGORITHM = "HS256"


# UPLOAD_DIR = Path("uploads")
# UPLOAD_DIR.mkdir(exist_ok=True)

llama_api_key = os.getenv("LLAMA_APIKEY")
Base.metadata.create_all(engine)


cred = credentials.Certificate(
    "./intuitnote-2342a-firebase-adminsdk-ia7wu-e8ccda4780.json"
)
firebase_admin.initialize_app(cred)

s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION"),
)
BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")


def get_session():
    session = sessionLocal()
    try:
        yield session
    finally:
        session.close()


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/register")
def register_user(user: UserCreate, session: Session = Depends(get_session)):
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


@app.post("/login", response_model=TokenSchema)
def login(request: LoginDetails, db: Session = Depends(get_session)):
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
    print(access)
    refresh = create_refresh_token(user.id)
    print(refresh)

    token_db = models.TokenTable(
        user_id=user.id, access_token=access, refresh_token=refresh, status=True
    )
    db.add(token_db)
    db.commit()
    db.refresh(token_db)
    return {"access_token": access, "refresh_token": refresh}


@app.post("/login/google", response_model=TokenSchema)
async def google_login(request: GoogleAuthRequest, db: Session = Depends(get_session)):
    try:
        logger.info(f"Received token: {request.firebase_token[:10]}...")

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
def passchange(request: Passchange, db: Session = Depends(get_session)):
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
        if (datetime.now(tz=timezone.utc) - record.created_date).days > 1:
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


@app.post("/pdf-extract", response_model=PdfDocumentResponse)
async def upload_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: str = Form(...),
    db: Session = Depends(get_session),
    dependencies=Depends(JWTBearer()),
):
    try:
        logger.info(f"Attempting upload to bucket: {BUCKET_NAME}")
        logger.info(f"Region: {os.getenv('AWS_REGION')}")

        # listing all buckets to verify credentials and access
        try:
            response = s3_client.list_buckets()
            available_buckets = [bucket["Name"] for bucket in response["Buckets"]]
            logger.info(f"Available buckets: {available_buckets}")

            if BUCKET_NAME not in available_buckets:
                logger.error(f"Bucket {BUCKET_NAME} not found in available buckets!")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Bucket {BUCKET_NAME} not found in your AWS account",
                )
        except ClientError as e:
            logger.error(f"Error listing buckets: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error accessing AWS: {str(e)}",
            )

        # Generate a unique S3 key
        timestamp = datetime.now(tz=timezone.utc).strftime("%Y%m%d_%H%M%S")
        s3_key = f"pdfs/user_{user_id}/{timestamp}_{file.filename}"

        # Attempt upload
        try:
            s3_client.upload_fileobj(
                file.file,
                BUCKET_NAME,
                s3_key,
                ExtraArgs={"ContentType": "application/pdf", "ACL": "private"},
            )
            logger.info(f"Successfully uploaded file to {s3_key}")
        except ClientError as e:
            error_message = f"S3 Upload Error: {str(e)}"
            logger.error(error_message)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error_message
            )

        # Generate S3 URL
        s3_url = (
            f"https://{BUCKET_NAME}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{s3_key}"
        )

        # Create database record
        pdf_doc = models.PdfDocument(
            user_id=int(user_id),
            file_name=file.filename,
            s3_key=s3_key,
            s3_url=s3_url,
            file_size=file.size,
            mime_type=file.content_type,
            upload_date=datetime.now(tz=timezone.utc),
            processing_status="pending",
        )

        db.add(pdf_doc)
        db.commit()
        db.refresh(pdf_doc)

        background_tasks.add_task(
            process_pdf_background,
            s3_key=s3_key,
            document_id=str(pdf_doc.id),
            user_id=user_id,
        )

        return pdf_doc
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}",
        )


async def process_pdf_background(s3_key: str, document_id: str, user_id: str):
    try:
        # Initialize RAG pipeline with AWS credentials
        rag = RAGPipeline(
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            aws_region=os.getenv("AWS_REGION"),
        )

        # Use async context manager
        async with rag:
            # Process PDF directly from S3
            metadata = {
                "user_id": user_id,
                "upload_date": datetime.now(tz=timezone.utc).isoformat(),
            }

            response = await rag.process_pdf_from_s3(
                bucket=os.getenv("AWS_BUCKET_NAME"),
                key=s3_key,
                doc_id=document_id,
                metadata=metadata,
            )

            # Update database status
            db = sessionLocal()
            try:
                pdf_doc = db.query(models.PdfDocument).filter_by(id=document_id).first()
                if pdf_doc:
                    if response and "analysis" in response:
                        pdf_doc.processing_status = "completed"

                        # Save the analysis to history
                        analysis_history = models.History(
                            user_id=int(user_id),
                            doc_id=document_id,
                            file_name=pdf_doc.file_name,
                            s3_url=pdf_doc.s3_url,
                            analysis=response["analysis"],
                            processing_status="completed",
                            timestamp=datetime.now(tz=timezone.utc),
                        )
                        db.add(analysis_history)
                    else:
                        pdf_doc.processing_status = "failed"
                    db.commit()
                return response
            finally:
                db.close()

    except Exception as e:
        logger.error(f"PDF processing failed: {str(e)}")
        # Update database with error status
        db = sessionLocal()
        try:
            pdf_doc = db.query(models.PdfDocument).filter_by(id=document_id).first()
            if pdf_doc:
                pdf_doc.processing_status = "failed"
                pdf_doc.error_message = str(e)
                db.commit()
        finally:
            db.close()


@app.post("/video-extract", response_model=VideoDocumentResponse)
async def process_youtube_video(
    video: VideoDocumentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_session),
    dependencies=Depends(JWTBearer()),
):
    try:
        # Create initial database record
        timestamp = datetime.now(tz=timezone.utc).strftime("%Y%m%d_%H%M%S")
        temp_s3_key = f"videos/user_{video.user_id}/pending_{timestamp}"

        video_doc = models.VideoDocument(
            user_id=video.user_id,
            url=str(video.url),
            title=video.title or "",
            s3_key=temp_s3_key,
            processing_status="pending",
            transcript_status="pending",
            upload_date=datetime.now(tz=timezone.utc),
        )

        db.add(video_doc)
        db.commit()
        db.refresh(video_doc)

        # Add background task for processing
        background_tasks.add_task(
            process_video_background,
            url=str(video.url),
            document_id=str(video_doc.id),
            user_id=str(video.user_id),
        )

        return video_doc

    except Exception as e:
        logger.error(f"Video processing request failed: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Video processing failed: {str(e)}",
        )


@app.post("/analysis-history", response_model=AnalysisHistory)
async def store_history(
    user_id: int,
    doc_id: str,
    file_name: str,
    s3_url: str,
    analysis: str,
    db: Session = Depends(get_session),
):
    try:
        analysis_history = models.History(
            user_id=int(user_id),
            doc_id=doc_id,
            file_name=file_name,
            s3_url=s3_url,
            analysis=analysis,
            processing_status="completed",
            timestamp=datetime.now(tz=timezone.utc),
        )

        db.add(analysis_history)
        db.commit()
        db.refresh(analysis_history)

        return analysis_history
    except Exception as e:
        logger.error(f"Analysis storing request failed: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis storing failed: {str(e)}",
        )


@app.get("/user/{user_id}/analysis-history")
async def get_user_analysis_history(
    user_id: int, db: Session = Depends(get_session), dependencies=Depends(JWTBearer())
):
    try:
        history_entries = load_user_docs(db, user_id)
        return history_entries
    except Exception as e:
        logger.error(f"Error retrieving analysis history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving analysis history: {str(e)}",
        )


async def process_video_background(url: str, document_id: str, user_id: str):
    try:
        # Initialize processors
        youtube_processor = YoutubeProcessor(
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            aws_region=os.getenv("AWS_REGION"),
            bucket_name=os.getenv("AWS_BUCKET_NAME"),
        )

        # Process video
        result = await youtube_processor.process_video(url, user_id, document_id)

        # Initialize RAG pipeline
        rag = RAGPipeline(
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            aws_region=os.getenv("AWS_REGION"),
        )

        # Process transcript through RAG pipeline
        async with rag:
            metadata = {
                "user_id": user_id,
                "upload_date": datetime.now(tz=timezone.utc).isoformat(),
                "video_url": url,
                "video_title": result["title"],
            }

            success = await rag.process_pdf_from_s3(
                bucket=os.getenv("AWS_BUCKET_NAME"),
                key=result["transcript_key"],
                doc_id=document_id,
                metadata=metadata,
            )

        # Update database
        db = sessionLocal()
        try:
            video_doc = db.query(models.VideoDocument).filter_by(id=document_id).first()
            if video_doc:
                video_doc.processing_status = "completed" if success else "failed"
                video_doc.transcript_status = "completed"
                video_doc.s3_key = result["transcript_key"]
                video_doc.title = result["title"]
                video_doc.duration = result["duration"]
                db.commit()
        finally:
            db.close()

    except Exception as e:
        logger.error(f"Video processing failed: {str(e)}")
        db = sessionLocal()
        try:
            video_doc = db.query(models.VideoDocument).filter_by(id=document_id).first()
            if video_doc:
                video_doc.processing_status = "failed"
                video_doc.error_message = str(e)
                db.commit()
        finally:
            db.close()


def token_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):

        payload = jwt.decode(kwargs["dependencies"], JWT_SECRET_KEY, ALGORITHM)
        user_id = payload["sub"]
        data = (
            kwargs["session"]
            .query(models.TokenTable)
            .filter_by(
                user_id=user_id, access_token=kwargs["dependencies"], status=True
            )
            .first()
        )
        if data:
            return func(kwargs["dependencies"], kwargs["session"])

        else:
            return {"msg": "Token blocked"}

    return wrapper


@app.get("/analysis-history/{doc_id}")
async def get_document_analysis(
    doc_id: str, db: Session = Depends(get_session), dependencies=Depends(JWTBearer())
):
    try:
        history_entry = db.query(models.History).filter_by(doc_id=doc_id).first()
        if not history_entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Analysis for document {doc_id} not found",
            )
        return history_entry
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving document analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving document analysis: {str(e)}",
        )


# Elasticsearch client
es_host = os.getenv("ELASTICSEARCH_HOST")
es_client = Elasticsearch(hosts=[es_host])

# Create the papers index
if not es_client.indices.exists(index="arxiv_papers"):
    es_client.indices.create(
        index="arxiv_papers",
        body={
            "mappings": {
                "properties": {
                    "id": {"type": "keyword"},
                    "title": {"type": "text"},
                    "authors": {"type": "text"},
                    "summary": {"type": "text"},
                    "published": {"type": "date"},
                    "updated": {"type": "date"},
                    "categories": {"type": "keyword"},
                    "pdf_url": {"type": "keyword"},
                    "html_url": {"type": "keyword"},
                }
            }
        },
    )


# ArXiv Search endpoint
@app.post("/search/arxiv")
async def arxiv_search_endpoint(request: ArxivSearchRequest):
    return await search_arxiv(
        query=request.query,
        categories=request.categories,
        page=request.page,
        max_results=request.max_results,
    )


# Elasticsearch Search endpoint
@app.post("/search/elastic")
async def elastic_search_endpoint(request: ElasticSearchRequest):
    return await search_elastic(
        query=request.query, page=request.page, size=request.size
    )


@app.post("/index/arxiv")
async def index_arxiv_endpoint(request: dict):
    arxiv_id = request.get("arxiv_id")
    if not arxiv_id:
        raise HTTPException(status_code=400, detail="ArXiv ID is required")
    return await index_arxiv_paper(arxiv_id)


@app.get("/openalex-search")
async def openalex_search(query: str = Query(..., description="Search term")):
    openalex_url = "https://api.openalex.org/works"
    params = {
        "search": query,
        "sort": "cited_by_count:desc",
        "per-page": 25,  
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(openalex_url, params=params)
        response.raise_for_status()
        data = response.json()

    return data


@app.get("/papers", dependencies=[Depends(JWTBearer())])
async def get_papers(
    query: str | None = Query(
        None, alias="query", description="Keyword to search papers; omit for trending"
    ),
    task_filter: list[str] = Query(
        ["machine-learning", "deep-learning", "artificial-intelligence"],
        alias="task_filter",
        description="List of task IDs to filter papers by",
    ),
):
    base = "https://paperswithcode.com/api/v1"

    if query:
        url = f"{base}/papers/"
        params = {"search": query, "page": 1, "per_page": 10}
    else:
        url = f"{base}/trending/"
        params = {"page": 1, "per_page": 10}

    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, timeout=30.0)
        resp.raise_for_status()
        payload = resp.json()

    results = payload.get("results", [])

    filtered_results = []
    async with httpx.AsyncClient() as client:
        for paper in results:
            paper_id = paper.get("id")
            if paper_id:
                task_url = f"{base}/papers/{paper_id}/tasks/"
                task_resp = await client.get(task_url, timeout=10.0)
                if task_resp.status_code == 200:
                    tasks = task_resp.json().get("results", [])
                    task_ids = [task.get("id") for task in tasks]
                    if set(task_filter).intersection(task_ids):
                        filtered_results.append(paper)

    return [
        {
            "id": p["id"],
            "arxiv_id": p["arxiv_id"],
            "title": p["title"],
            "abstract": p.get("abstract", ""),
            "url_pdf": p.get("url_pdf"),
            "url_abs": p.get("url_abs"),
            "published_date": p.get("published"),
            "repositories": p.get("repositories", []),
            "datasets": p.get("datasets", []),
        }
        for p in filtered_results
    ]


@app.get("/user/{user_id}/pdfs")
async def get_user_pdfs(
    user_id: int, db: Session = Depends(get_session), dependencies=Depends(JWTBearer())
):
    try:
        pdfs = db.query(models.PdfDocument).filter_by(user_id=user_id).all()
        return [
            {
                "id": pdf.id,
                "file_name": pdf.file_name,
                "processing_status": pdf.processing_status,
                "upload_date": pdf.upload_date.isoformat(),
                "s3_url": pdf.s3_url,
            }
            for pdf in pdfs
        ]
    except Exception as e:
        logger.error(f"Error retrieving user PDFs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving user PDFs: {str(e)}",
        )


@app.get(
    "/pdf/{doc_id}/content",
    summary="Proxy and stream PDF from S3",
    response_class=StreamingResponse,
    dependencies=[Depends(JWTBearer())],
)
async def get_pdf_content(
    doc_id: str,
    db: Session = Depends(get_session),
    dependencies=Depends(JWTBearer()),
):
    """
    Streams a PDF from S3 through FastAPI, enforcing JWT auth and ownership instructs browsers to render it in-page.
    """
    token = dependencies
    try:
        payload = jwt.decode(token.credentials, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")

    pdf_doc = db.query(models.PdfDocument).filter_by(id=doc_id, user_id=user_id).first()
    if not pdf_doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "PDF not found or access denied")

    try:
        s3_resp = s3_client.get_object(Bucket=BUCKET_NAME, Key=pdf_doc.s3_key)
    except ClientError as e:
        code = e.response.get("Error", {}).get("Code")
        if code == "NoSuchKey":
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, "PDF file not found in storage"
            )
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, f"S3 error: {e}")

    # 4. Stream back to client
    return StreamingResponse(
        content=s3_resp["Body"].iter_chunks(chunk_size=1024 * 16),
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{pdf_doc.file_name}"'},
    )


@app.get("/pdf/{doc_id}/url")
async def get_pdf_url(
    doc_id: str, db: Session = Depends(get_session), dependencies=Depends(JWTBearer())
):
    token = dependencies
    payload = jwt.decode(
        token, JWT_SECRET_KEY, algorithms=[ALGORITHM]
    )  
    user_id = payload["sub"]
    pdf_doc = (
        db.query(models.PdfDocument).filter_by(id=doc_id, user_id=user_id).first()
    )  
    if not pdf_doc:
        raise HTTPException(
            status_code=404, detail="PDF not found or access denied"
        )  
    try:
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": BUCKET_NAME, "Key": pdf_doc.s3_key},
            ExpiresIn=3600,  
        )
        return {"url": url}
    except ClientError as e:
        logger.error(f"Error generating presigned URL for {pdf_doc.s3_key}: {e}")
        raise HTTPException(
            status_code=500, detail="Could not generate PDF access URL."
        )
