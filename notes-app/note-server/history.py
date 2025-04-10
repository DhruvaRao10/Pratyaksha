from dataclasses import dataclass
from collections import defaultdict
from sqlalchemy.orm import Session
from models import PdfDocument, History
from database import Base, engine, sessionLocal
from typing import List, Dict, Any


@dataclass
class DocumentInfo:
    doc_id: str
    file_name: str
    s3_url: str
    analysis: str

def load_user_docs(session: Session, user_id: int) -> List[DocumentInfo]:
    """Get all analysis history for a user"""
    try:
        # First check for history entries
        history_records = (
            session
            .query(History)
            .filter(History.user_id == user_id)
            .order_by(History.timestamp.desc())
            .all()
        )
        
        # Convert history records to DocumentInfo objects
        infos = []
        for record in history_records:
            infos.append(DocumentInfo(
                doc_id=record.doc_id,
                file_name=record.file_name,
                s3_url=record.s3_url,
                analysis=record.analysis
            ))
        
        return infos
    except Exception as e:
        print(f"Error loading user documents: {str(e)}")
        return []

# usage
session = Session(engine)
user_123_docs = load_user_docs(session, 62)
for info in user_123_docs:
    print(info.s3_url, "-", info.analysis)
