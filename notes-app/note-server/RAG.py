import os
from os import getenv
from dotenv import load_dotenv
import io
import requests
import json
import boto3
from llama_index.llms.openrouter import OpenRouter
from llama_index.core.llms import ChatMessage

from weaviate.classes.query import Filter

# from langchain_core.chains import LLMChain
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
from llama_index.readers.file import PyMuPDFReader
import pymupdf
import pymupdf4llm
import logging
from pathlib import Path
import tempfile
import asyncio
from datetime import datetime, timezone
from botocore.exceptions import ClientError


load_dotenv()

logger = logging.getLogger(__name__)


class RAGPipeline:

    async def __aenter__(self):
        """Async context manager entry"""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        try:
            if hasattr(self, "weaviate_client") and self.weaviate_client is not None:
                logger.info("Closing Weaviate client connection")
                self.weaviate_client.close()
        except Exception as e:
            logger.error(f"Error closing Weaviate client: {str(e)}")

    def __init__(
        self,
        weaviate_url: str = "http://localhost:5000",
        class_name: str = "PDFDocument",
        embed_model: str = "sentence-transformers/all-MiniLM-L6-v2",
        chunk_size: int = 1024,
        chunk_overlap: int = 50,
        aws_access_key_id: Optional[str] = None,
        aws_secret_access_key: Optional[str] = None,
        aws_region: Optional[str] = None,
        base_model: str = "google/flan-t5-small",
        lora_adapter_path: str = "./summarization-lora-finetuned/final_model",
        openrouter_model: str = "meta-llama/llama-4-scout:free",
    ):
        """
        Initialize the RAG Pipeline with Weaviate, LlamaIndex, and MiniLM.
        """
        logger.info("Initializing RAGPipeline...")

        self.class_name = class_name
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.openrouter_model = openrouter_model

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

        # Initialize LLM with fallback options
        self._setup_llm()

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

    def ensure_schema(self) -> None:
        """Create Weaviate schema if it doesn't exist"""
        try:
            # Check if collection exists
            collection = self.weaviate_client.collections.get(self.class_name)
            if collection is None:
                # Create collection with properties
                collection = self.weaviate_client.collections.create(
                    name=self.class_name,
                    vectorizer_config=weaviate.config.Configure.Vectorizer.none(),  
                    properties=[
                        weaviate.properties.Property(
                            name="content",
                            data_type=weaviate.properties.DataType.TEXT,
                            indexing=weaviate.config.Configure.Property.Indexing(
                                filterable=True,
                                searchable=True,
                            ),
                        ),
                        weaviate.properties.Property(
                            name="doc_id",
                            data_type=weaviate.properties.DataType.TEXT,
                            indexing=weaviate.config.Configure.Property.Indexing(
                                filterable=True,
                            ),
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
                            data_type=weaviate.properties.DataType.DATE,
                        ),
                        weaviate.properties.Property(
                            name="user_id",
                            data_type=weaviate.properties.DataType.TEXT,
                        ),
                        weaviate.properties.Property(
                            name="upload_date",
                            data_type=weaviate.properties.DataType.TEXT,
                        ),
                        weaviate.properties.Property(
                            name="chunk_id",
                            data_type=weaviate.properties.DataType.NUMBER,
                        ),
                    ],
                )
                logger.info(f"Created Weaviate collection {self.class_name}")
        except Exception as e:
            logger.error(f"Error creating Weaviate schema: {str(e)}")
            raise

    async def delete_document(self, doc_id: str) -> bool:
        try:
            # Ensure Weaviate is connected
            self._ensure_weaviate_connected()

            # Get the collection
            collection = self.weaviate_client.collections.get(self.class_name)

            # Create the v4-compatible filter
            filters = Filter.by_property("doc_id").equal(doc_id)

            # Delete objects matching the filter
            collection.data.delete_many(where=filters)

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
        """Extract text content from PDF bytes using pymupdf4llm for Markdown conversion."""
        doc = None  # Initialize doc to None for the finally block
        try:
            logger.info(
                f"Starting PDF text extraction using pymupdf4llm from {len(pdf_bytes)} bytes"
            )

            # --- FIX: Explicitly open the document from bytes using pymupdf ---
            # Open the PDF directly from the bytes stream
            doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")

            # Pass the opened document object to pymupdf4llm
            md_text = pymupdf4llm.to_markdown(doc)
            # -----------------------------------------------------------------

            if not md_text or len(md_text.strip()) < 10:
                logger.warning(
                    f"pymupdf4llm returned very short or empty text for the PDF."
                )

            logger.info(
                f"Successfully extracted markdown text with length {len(md_text)} characters"
            )
            return md_text
        except Exception as e:
            logger.error(
                f"Error during pymupdf4llm text extraction: {str(e)}", exc_info=True
            )
            raise  # Re-raise the exception
        finally:
            # --- Ensure the document is closed ---
            if doc:
                doc.close()
                logger.debug("PyMuPDF document closed.")

    def _ensure_weaviate_connected(self):
        """Ensure the Weaviate client is connected, reconnect if necessary"""
        try:
            # Check if client is closed
            if not hasattr(self, "weaviate_client") or self.weaviate_client is None:
                logger.info("Weaviate client not initialized, connecting...")
                self.weaviate_client = weaviate.connect_to_local(
                    host="127.0.0.1", port=5000, grpc_port=50051
                )
                return

            try:
                self.weaviate_client.collections.get(self.class_name)
            except weaviate.exceptions.WeaviateClosedClientError:
                logger.info("Weaviate client disconnected, reconnecting...")
                self.weaviate_client = weaviate.connect_to_local(
                    host="127.0.0.1", port=5000, grpc_port=50051
                )
        except Exception as e:
            logger.error(f"Error connecting to Weaviate: {str(e)}")
            raise

    async def summarize_document(self, doc_id: str) -> Dict[str, Any]:
        """
        Generate a summary and extract key concepts from a document.
        """
        try:

            doc_id = str(doc_id)
            self._ensure_weaviate_connected()

            collection = self.weaviate_client.collections.get(self.class_name)

            filters = Filter.by_property("doc_id").equal(doc_id)
            results = collection.query.fetch_objects(limit=100, filters=filters).objects

            logger.info(f"Query returned {len(results)} results")

            if not results:
                logger.info("Trying a broader query to debug...")
                sample_results = collection.query.fetch_objects(limit=5).objects
                if sample_results:
                    logger.info(f"Found {len(sample_results)} documents in collection")
                    logger.info(
                        f"Sample document properties: {sample_results[0].properties}"
                    )
                else:
                    logger.info("No documents found in collection at all")

                return {"error": "Document not found"}

            full_text = " ".join([obj.properties["content"] for obj in results])

            max_text_length = 4000

            summary_prompt = f"""
            You are an expert document analyzer. Please analyze the following document and:
            1. Provide a concise summary (3-5 sentences)
            2. Extract the 5-7 most important concepts or topics
            3. Explain each key concept in simple terms
            4. Retain important terminology and technical language from the original and explain the technical language in detail as well 
            5. If you detect any Math in the pdf break that down intuitively 

            DOCUMENT:
            {full_text[:max_text_length]}
            
            FORMAT YOUR RESPONSE AS:
            
            SUMMARY:
            [Your summary here]
            
            KEY CONCEPTS:
            1. [Concept 1]: [Detailed explanation]
            2. [Concept 2]: [Detailed explanation]
            ...
            """
            # llama index assistant creation
            message = ChatMessage(role="user", content=summary_prompt)

            max_retries = 3
            retry_count = 0
            last_error = None

            while retry_count < max_retries:
                try:
                    logger.info(
                        f"Attempt {retry_count + 1} to generate summary with OpenRouter"
                    )
                    # streaming chat response
                    response = self.llm.stream_chat([message])
                    full_response = ""

                    for r in response:
                        print(r.delta, end="")
                        full_response += r.delta

                    logger.info("Successfully generated summary")
                    return {
                        "doc_id": doc_id,
                        "analysis": full_response,
                        "timestamp": datetime.now(tz=timezone.utc).isoformat(),
                    }
                except Exception as e:
                    retry_count += 1
                    last_error = e
                    logger.warning(f"Attempt {retry_count} failed: {str(e)}")

                    if retry_count < max_retries:
                        wait_time = 2**retry_count
                        logger.info(f"Waiting {wait_time} seconds before retry...")
                        await asyncio.sleep(wait_time)

                    if retry_count == max_retries - 1 and isinstance(
                        self.llm, OpenRouter
                    ):
                        logger.info("Switching to fallback LLM (Ollama)")
                        try:
                            # Switch to Ollama as fallback
                            backup_llm = Ollama(model="llama2", temperature=0.1)
                            response = backup_llm.complete(summary_prompt)
                            logger.info(
                                "Successfully generated summary with fallback LLM"
                            )
                            return {
                                "doc_id": doc_id,
                                "analysis": str(response),
                                "timestamp": datetime.now(tz=timezone.utc).isoformat(),
                            }
                        except Exception as fallback_error:
                            logger.error(
                                f"Fallback LLM also failed: {str(fallback_error)}"
                            )

            logger.error(f"All {max_retries} attempts to generate summary failed")
            return {
                "doc_id": doc_id,
                "error": f"Failed to generate summary after {max_retries} attempts: {str(last_error)}",
                "timestamp": datetime.now(tz=timezone.utc).isoformat(),
            }

        except Exception as e:
            logger.error(f"Error summarizing document {doc_id}: {str(e)}")
            raise

    async def query(
        self, query_text: str, doc_id: Optional[str] = None, top_k: int = 5
    ) -> Dict[str, Any]:
        """
        Query the vector store and get relevant responses.
        """
        try:
            self._ensure_weaviate_connected()

            self.vector_store = WeaviateVectorStore(
                weaviate_client=self.weaviate_client,
                class_name=self.class_name,
                text_key="content",
                metadata_key="metadata",
            )

            self.index = VectorStoreIndex(
                [],
                vector_store=self.vector_store,
            )

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
                        "path": ["doc_id"],
                        "valueString": doc_id,
                    }
                }
                query_engine = query_engine.update_vector_store_query_filter(
                    filter_dict
                )

            max_retries = 3
            retry_count = 0
            last_error = None

            while retry_count < max_retries:
                try:
                    logger.info(f"Attempt {retry_count + 1} to execute query")
                    response = await query_engine.aquery(query_text)

                    result = {
                        "answer": str(response.response),
                        "sources": [
                            {
                                "content": str(node.node.text),
                                "metadata": node.node.metadata,
                                "score": float(node.score) if node.score else None,
                            }
                            for node in response.source_nodes
                        ],
                    }

                    logger.info("Successfully executed query")
                    return result

                except Exception as e:
                    retry_count += 1
                    last_error = e
                    logger.warning(f"Query attempt {retry_count} failed: {str(e)}")

                    if retry_count < max_retries:
                        wait_time = 2**retry_count
                        logger.info(f"Waiting {wait_time} seconds before retry...")
                        await asyncio.sleep(wait_time)

                    if retry_count == max_retries - 1 and isinstance(
                        self.llm, OpenRouter
                    ):
                        logger.info("Trying query with fallback LLM")
                        try:
                            # temporary backup LLM
                            backup_llm = Ollama(model="llama2", temperature=0.1)

                            # Get the retrieved nodes first (which doesn't use the LLM)
                            retriever = self.index.as_retriever(similarity_top_k=top_k)
                            nodes = await retriever.aretrieve(query_text)

                            context = "\n\n".join([node.text for node in nodes])
                            prompt = f"""
                            Based on the following context, please answer the question.
                            
                            Context:
                            {context}
                            
                            Question:
                            {query_text}
                            """

                            answer = backup_llm.complete(prompt)

                            result = {
                                "answer": str(answer),
                                "sources": [
                                    {
                                        "content": str(node.text),
                                        "metadata": node.metadata,
                                        "score": None,
                                    }
                                    for node in nodes
                                ],
                                "note": "Generated using fallback LLM",
                            }

                            logger.info("Successfully executed query with fallback LLM")
                            return result

                        except Exception as fallback_error:
                            logger.error(
                                f"Fallback LLM query also failed: {str(fallback_error)}"
                            )

            logger.error(f"All {max_retries} query attempts failed")
            return {
                "error": f"Failed to execute query after {max_retries} attempts: {str(last_error)}",
                "sources": [],
            }

        except Exception as e:
            logger.error(f"Error querying index: {str(e)}")
            raise

    async def process_pdf_from_s3(
        self,
        bucket: str,
        key: str,
        doc_id: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        try:
            logger.info(
                f"Starting to process PDF from S3: bucket={bucket}, key={key}, doc_id={doc_id}"
            )

            doc_id = str(doc_id)

            self._ensure_weaviate_connected()

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

            logger.info("Step 3: Creating document with metadata")

            # Split text into chunks
            splitter = TokenTextSplitter(
                chunk_size=self.chunk_size, chunk_overlap=self.chunk_overlap
            )
            chunks = splitter.split_text(text)
            logger.info(f"Split text into {len(chunks)} chunks")

            # Insert chunks directly into Weaviate
            collection = self.weaviate_client.collections.get(self.class_name)

            for i, chunk in enumerate(chunks):
                chunk_uuid = generate_uuid5(f"{doc_id}_{i}")

                try:
                    collection.data.insert(
                        {
                            "content": chunk,
                            "doc_id": doc_id,
                            "source": "s3",
                            "bucket": bucket,
                            "key": key,
                            "timestamp": datetime.now(tz=timezone.utc).isoformat(),
                            "user_id": metadata.get("user_id", "") if metadata else "",
                            "upload_date": (
                                metadata.get("upload_date", "") if metadata else ""
                            ),
                            "chunk_id": i,
                        }
                    )
                    logger.info(f"Inserted chunk {i} for doc_id {doc_id}")
                except Exception as e:
                    logger.error(f"Error inserting chunk {i}: {str(e)}")

            # Verify insertion
            filters = Filter.by_property("doc_id").equal(doc_id)
            results = collection.query.fetch_objects(limit=100, filters=filters).objects
            logger.info(
                f"After insertion, found {len(results)} chunks for doc_id {doc_id}"
            )

            if len(results) > 0:
                logger.info("Document successfully inserted into Weaviate")
            else:
                logger.error("Failed to insert document chunks into Weaviate")

            # Still update the LlamaIndex index for other operations
            document = Document(text=text, metadata={"doc_id": doc_id, "source": "s3"})

            self.vector_store = WeaviateVectorStore(
                weaviate_client=self.weaviate_client,
                class_name=self.class_name,
                text_key="content",
                metadata_key="metadata",
            )

            # Update index
            logger.info("Updating LlamaIndex index")
            index = VectorStoreIndex.from_documents(
                [document],
                vector_store=self.vector_store,
                embed_model=self.embed_model,
                llm=self.llm,
            )

            self.index = index

            # Try to summarize if we have chunks
            if len(results) > 0:
                summary_result = await self.summarize_document(doc_id)
                logger.info(f"Generated document summary and analysis")
                return summary_result
            else:
                return {"error": "Failed to insert document"}

        except Exception as e:
            logger.error(f"Error in process_pdf_from_s3: {str(e)}", exc_info=True)
            raise

    def _setup_llm(self):
        """Setup LLM with fallback options"""
        logger.info(f"Setting up LLM with primary model: {self.openrouter_model}")

        try:
            api_key = os.getenv("OPENROUTER_API_KEY")
            if not api_key:
                logger.warning(
                    "OpenRouter API key not found, falling back to local model"
                )
                self.llm = Ollama(model="llama2", temperature=0.1)
                return

            self.llm = OpenRouter(
                api_key=api_key,
                max_tokens=1000,
                context_window=4096,
                model=self.openrouter_model,
                timeout=60,
            )
            logger.info(
                f"Successfully initialized OpenRouter with model: {self.openrouter_model}"
            )

        except Exception as e:
            logger.error(f"Failed to initialize OpenRouter: {str(e)}")
            try:
                # Fallback to a local model if available
                self.llm = Ollama(model="llama2", temperature=0.1)
                logger.info("Using fallback LLM (Ollama)")
            except Exception as fallback_error:
                logger.error(
                    f"Failed to initialize fallback LLM: {str(fallback_error)}"
                )
                from llama_index.core.llms import MockLLM

                self.llm = MockLLM()
                logger.warning("Using MockLLM as last resort fallback")
