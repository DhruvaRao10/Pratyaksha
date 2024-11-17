import os
import io
import boto3
from llama_index.core import (
    VectorStoreIndex,
    ServiceContext,
    Settings,
    StorageContext,
    load_index_from_storage,
    Document,
)
from llama_index.llms.llama_api import LlamaAPI
from llama_index.vector_stores.weaviate import WeaviateVectorStore
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.node_parser import TokenTextSplitter
from llama_index.core.node_parser import SimpleNodeParser
from llama_index.llms.ollama import Ollama
from typing import List, Optional, Dict, Any
import weaviate
from weaviate.util import generate_uuid5
from PyPDF2 import PdfReader
import logging
from pathlib import Path
import tempfile
import asyncio
from datetime import datetime, timezone
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)


class RAGPipeline:

    async def __aenter__(self):
        """Async context manager entry"""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if hasattr(self, "weaviate_client"):
            self.weaviate_client.close()

    def __init__(
        self,
        weaviate_url: str = "http://localhost:5000",
        class_name: str = "PDFDocument",
        embed_model: str = "sentence-transformers/all-MiniLM-L6-v2",
        chunk_size: int = 512,
        chunk_overlap: int = 50,
        aws_access_key_id: Optional[str] = None,
        aws_secret_access_key: Optional[str] = None,
        aws_region: Optional[str] = None,
    ):
        """
        Initialize the RAG Pipeline with Weaviate, LlamaIndex, and MiniLM.
        """
        logger.info("Initializing RAGPipeline...")

        self.class_name = class_name
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

        # Initialize AWS S3 client
        self.s3_client = boto3.client(
            "s3",
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            region_name=aws_region,
        )

        # Initialize Weaviate client (v4)
        client = weaviate.connect_to_local(host="127.0.0.1", port=5000, grpc_port=50051)
        self.weaviate_client = client
        # Create schema if it doesn't exist
        self.ensure_schema()

        # Initialize embedding model
        self.embed_model = HuggingFaceEmbedding(
            model_name=embed_model, embed_batch_size=32
        )

        # Initialize LLM (Ollama running Llama2)
        self.llm = Ollama(model="llama2", temperature=0.1)

        # Initialize vector store
        self.vector_store = WeaviateVectorStore(
            weaviate_client=self.weaviate_client,
            class_name=self.class_name,
            text_key="content",
            metadata_key="metadata",
        )

        # Create service context
        Settings.llm = self.llm
        Settings.embed_model = self.embed_model
        Settings.node_parser = SimpleNodeParser.from_defaults(
            chunk_size=self.chunk_size, chunk_overlap=self.chunk_overlap
        )
        # self.service_context = ServiceContext.from_defaults(
        #     llm=self.llm,
        #     embed_model=self.embed_model,
        #     node_parser=SimpleNodeParser.from_defaults(
        #         chunk_size=self.chunk_size, chunk_overlap=self.chunk_overlap
        #     ),
        # )

        # Initialize the index
        self.vector_store = WeaviateVectorStore(
            weaviate_client=self.weaviate_client,
            class_name=self.class_name,
            text_key="content",
            metadata_key="metadata",
        )

        # Initialize the index
        try:
            self.index = VectorStoreIndex(
                [],
                vector_store=self.vector_store,
            )
        except Exception as e:
            logger.error(f"Error initializing index: {str(e)}")
            raise
        finally:
            # Close the Weaviate client
            self.weaviate_client.close()

    def ensure_schema(self) -> None:
        """Create Weaviate schema if it doesn't exist"""
        try:
            # Check if collection exists
            collection = self.weaviate_client.collections.get(self.class_name)
            if collection is None:
                # Create collection with properties
                collection = self.weaviate_client.collections.create(
                    name=self.class_name,
                    vectorizer_config=weaviate.config.Configure.Vectorizer.none(),  # we use our own embeddings
                    properties=[
                        weaviate.properties.Property(
                            name="content",
                            data_type=weaviate.properties.DataType.TEXT,
                        ),
                        weaviate.properties.Property(
                            name="metadata",
                            data_type=weaviate.properties.DataType.OBJECT,
                            nested_properties=[
                                weaviate.properties.Property(
                                    name="doc_id",
                                    data_type=weaviate.properties.DataType.TEXT,
                                ),
                                weaviate.properties.Property(
                                    name="source",
                                    data_type=weaviate.properties.DataType.TEXT,
                                ),
                                weaviate.properties.Property(
                                    name="bucket",
                                    data_type=weaviate.properties.DataType.TEXT,
                                ),
                                weaviate.properties.Property(
                                    name="key",
                                    data_type=weaviate.properties.DataType.TEXT,
                                ),
                                weaviate.properties.Property(
                                    name="timestamp",
                                    data_type=weaviate.properties.DataType.TEXT,
                                ),
                                weaviate.properties.Property(
                                    name="user_id",
                                    data_type=weaviate.properties.DataType.TEXT,
                                ),
                                weaviate.properties.Property(
                                    name="upload_date",
                                    data_type=weaviate.properties.DataType.TEXT,
                                ),
                            ],
                        ),
                        weaviate.properties.Property(
                            name="doc_id",
                            data_type=weaviate.properties.DataType.TEXT,
                        ),
                        weaviate.properties.Property(
                            name="chunk_id",
                            data_type=weaviate.properties.DataType.NUMBER,
                        ),
                        weaviate.properties.Property(
                            name="timestamp",
                            data_type=weaviate.properties.DataType.DATE,
                        ),
                    ],
                )
                logger.info(f"Created Weaviate collection {self.class_name}")
        except Exception as e:
            logger.error(f"Error creating Weaviate schema: {str(e)}")
            raise

    async def delete_document(self, doc_id: str) -> bool:
        """Delete all objects associated with a document"""
        try:
            collection = self.weaviate_client.collections.get(self.class_name)
            collection.data.delete_many(
                where=collection.query.field("doc_id").equal(doc_id)
            )
            logger.info(f"Deleted document {doc_id} from vector store")
            return True
        except Exception as e:
            logger.error(f"Error deleting document {doc_id}: {str(e)}")
            return False

    def _download_from_s3(self, bucket: str, key: str) -> bytes:
        """Download file from S3 and return as bytes"""
        try:
            logger.info(f"Attempting to download from S3: bucket={bucket}, key={key}")
            response = self.s3_client.get_object(Bucket=bucket, Key=key)
            content = response["Body"].read()
            logger.info(f"Successfully downloaded {len(content)} bytes from S3")
            return content
        except ClientError as e:
            logger.error(f"S3 ClientError: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error downloading from S3: {str(e)}")
            raise

    def _extract_text_from_pdf_bytes(self, pdf_bytes: bytes) -> str:
        """Extract text content from PDF bytes"""
        try:
            logger.info(f"Starting PDF text extraction from {len(pdf_bytes)} bytes")
            text = ""
            pdf_file = io.BytesIO(pdf_bytes)
            pdf_reader = PdfReader(pdf_file)
            logger.info(f"PDF has {len(pdf_reader.pages)} pages")

            for page_num, page in enumerate(pdf_reader.pages, 1):
                try:
                    page_text = page.extract_text()
                    text += page_text + "\n"
                    logger.info(
                        f"Extracted {len(page_text)} characters from page {page_num}"
                    )
                except Exception as e:
                    logger.error(
                        f"Error extracting text from page {page_num}: {str(e)}"
                    )

            final_text = text.strip()
            logger.info(f"Successfully extracted total of {len(final_text)} characters")
            return final_text
        except Exception as e:
            logger.error(f"Error in PDF text extraction: {str(e)}", exc_info=True)
            raise

    async def query(
        self, query_text: str, doc_id: Optional[str] = None, top_k: int = 5
    ) -> Dict[str, Any]:
        """
        Query the vector store and get relevant responses.
        """
        try:
            # Create query engine
            query_engine = self.index.as_query_engine(
                similarity_top_k=top_k,
                vector_store_query_mode="hybrid",
                llm=self.llm,
            )

            # Add document filter if doc_id provided
            if doc_id:
                filter_dict = {
                    "where_filter": {
                        "operator": "Equal",
                        "path": ["metadata", "doc_id"],
                        "valueString": doc_id,
                    }
                }
                query_engine = query_engine.update_vector_store_query_filter(
                    filter_dict
                )

            # Execute query
            response = await query_engine.aquery(query_text)

            # Format results
            result = {
                "answer": str(response.response),  # Ensure response is string
                "sources": [
                    {
                        "content": str(node.node.text),
                        "metadata": node.node.metadata,
                        "score": float(node.score) if node.score else None,
                    }
                    for node in response.source_nodes
                ],
            }

            return result

        except Exception as e:
            logger.error(f"Error querying index: {str(e)}")
            raise

    async def process_pdf_from_s3(
        self,
        bucket: str,
        key: str,
        doc_id: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """Process a PDF file from S3 and store it in the vector database."""
        try:
            logger.info(
                f"Starting to process PDF from S3: bucket={bucket}, key={key}, doc_id={doc_id}"
            )

            # Download PDF from S3
            logger.info("Step 1: Downloading from S3")
            pdf_bytes = self._download_from_s3(bucket, key)

            # Extract text from PDF bytes
            logger.info("Step 2: Extracting text from PDF")
            text = self._extract_text_from_pdf_bytes(pdf_bytes)
            logger.info(f"Extracted text length: {len(text)}")

            if not text:
                logger.error(f"No text extracted from PDF {key}")
                return False

            # Create document with metadata
            logger.info("Step 3: Creating document with metadata")
            doc_metadata = {
                "doc_id": doc_id,
                "source": "s3",
                "bucket": bucket,
                "key": key,
                "timestamp": datetime.now(tz=timezone.utc).isoformat(),
                "user_id": metadata.get("user_id", "") if metadata else "",
                "upload_date": metadata.get("upload_date", "") if metadata else "",
            }
            logger.info(f"Document metadata: {doc_metadata}")

            document = Document(text=text, metadata=doc_metadata)
            logger.info("Document created successfully")

            # Create storage context and index
            logger.info("Step 4: Creating storage context and index")
            try:
                index = VectorStoreIndex.from_documents(
                    [document],
                    vector_store=self.vector_store,
                    embed_model=self.embed_model,
                    llm=self.llm,
                )

                logger.info("Vector store insertion completed")

                # Update instance index
                self.index = index
                logger.info("Instance index updated")

                return True
            except Exception as e:
                logger.error(f"Error in indexing step: {str(e)}", exc_info=True)
                raise

        except Exception as e:
            logger.error(f"Error in process_pdf_from_s3: {str(e)}", exc_info=True)
            raise

    async def delete_document(self, doc_id: str) -> bool:
        """Delete all chunks associated with a document"""
        try:
            where_filter = {
                "path": ["doc_id"],
                "operator": "Equal",
                "valueString": doc_id,
            }
            self.weaviate_client.batch.delete_objects(
                class_name=self.class_name, where=where_filter
            )
            logger.info(f"Deleted document {doc_id} from vector store")
            return True
        except Exception as e:
            logger.error(f"Error deleting document {doc_id}: {str(e)}")
            return False
