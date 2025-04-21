import os
import arxiv
import logging
from elasticsearch import Elasticsearch
from fastapi import HTTPException
from typing import List, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Elasticsearch client
es_host = os.getenv("ELASTICSEARCH_HOST")


def get_es_client():
    try:
        client = Elasticsearch(hosts=[es_host])
        if not client.ping():
            logger.warning("Cannot connect to Elasticsearch")
            return None
        return client
    except Exception as e:
        logger.error(f"Error connecting to Elasticsearch: {e}")
        return None


def setup_es_index(client):
    if client and not client.indices.exists(index="arxiv_papers"):
        try:
            client.indices.create(
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
            logger.info("Created arxiv_papers index")
        except Exception as e:
            logger.error(f"Error creating index: {e}")


# Initialize Elasticsearch
es_client = get_es_client()
if es_client:
    setup_es_index(es_client)


async def search_arxiv(
    query: str, categories: List[str] = None, page: int = 1, max_results: int = 10
):
    """
    Search for papers on ArXiv with optional category filtering
    """
    search_query = f"{query}"

    # Add filters 
    if categories and len(categories) > 0:
        category_filter = " OR ".join([f"cat:{cat}" for cat in categories])
        search_query = f"{search_query} AND ({category_filter})"

    logger.info(f"ArXiv search query: {search_query}")

    # Execute the search
    search = arxiv.Search(
        query=search_query,
        max_results=max_results,
        sort_by=arxiv.SortCriterion.Relevance,
        sort_order=arxiv.SortOrder.Descending,
        # start=(page - 1) * max_results,
    )

    results = []
    try:
        for result in search.results():
            authors = [author.name for author in result.authors]
            categories = [cat for cat in result.categories]

            paper = {
                "id": result.get_short_id(),
                "title": result.title,
                "authors": authors,
                "summary": result.summary,
                "published": result.published.isoformat(),
                "updated": result.updated.isoformat() if result.updated else None,
                "categories": categories,
                "pdf_url": result.pdf_url,
                "html_url": f"https://arxiv.org/abs/{result.get_short_id()}",
            }

            results.append(paper)
    except Exception as e:
        logger.error(f"Error searching ArXiv: {e}")
        raise HTTPException(status_code=500, detail=f"Error searching ArXiv: {str(e)}")

    total = 100 if len(results) == max_results else len(results)

    return {"papers": results, "total": total}


async def search_elastic(query: str, page: int = 1, size: int = 10):
    """
    Search for papers in Elasticsearch index
    """
    if not es_client:
        raise HTTPException(status_code=503, detail="Elasticsearch service unavailable")

    try:
        # Basic multi-match query for relevant fields
        query_body = {
            "query": {
                "multi_match": {
                    "query": query,
                    "fields": ["title^3", "summary^2", "authors", "categories"],
                    "fuzziness": "AUTO",
                }
            },
            "from": (page - 1) * size,
            "size": size,
        }

        response = es_client.search(index="arxiv_papers", body=query_body)

        hits = response["hits"]["hits"]
        total = response["hits"]["total"]["value"]

        papers = [hit["_source"] for hit in hits]

        return {"papers": papers, "total": total}

    except Exception as e:
        logger.error(f"Error searching Elasticsearch: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error searching Elasticsearch: {str(e)}"
        )


async def index_arxiv_paper(arxiv_id: str):
    """
    Retrieve a paper from ArXiv by id and index it in Elasticsearch
    """
    if not es_client:
        raise HTTPException(status_code=503, detail="Elasticsearch service unavailable")

    try:
        # Search for the paper in ArXiv
        search = arxiv.Search(query=f"id:{arxiv_id}", max_results=1)

        result = next(search.results())

        # Prepare the data
        authors = [author.name for author in result.authors]
        categories = [cat for cat in result.categories]

        paper = {
            "id": result.get_short_id(),
            "title": result.title,
            "authors": authors,
            "summary": result.summary,
            "published": result.published.isoformat(),
            "updated": result.updated.isoformat() if result.updated else None,
            "categories": categories,
            "pdf_url": result.pdf_url,
            "html_url": f"https://arxiv.org/abs/{result.get_short_id()}",
        }

        # Check if paper already exists
        try:
            es_client.get(index="arxiv_papers", id=result.get_short_id())
            es_client.update(
                index="arxiv_papers", id=result.get_short_id(), body={"doc": paper}
            )
            return {"message": "Paper updated in index", "paper": paper}
        except Exception:
            es_client.index(index="arxiv_papers", id=result.get_short_id(), body=paper)
            return {"message": "Paper added to index", "paper": paper}

    except StopIteration:
        raise HTTPException(
            status_code=404, detail=f"ArXiv paper with ID {arxiv_id} not found"
        )
    except Exception as e:
        logger.error(f"Error indexing ArXiv paper: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error indexing ArXiv paper: {str(e)}"
        )                         
