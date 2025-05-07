import os
import requests
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)


class ExaSearch:
    def __init__(self):
        self.api_key = os.getenv("EXA_API_KEY")
        if not self.api_key:
            raise ValueError("EXA_API_KEY not found in environment variables")
        self.base_url = "https://api.exa.ai/search"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def search_related_papers(
        self, content: str, filters: List[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for related papers using Exa's neural search API with advanced filters.

        Args:
            content (str): The content to search for related papers
            filters (List[str]): List of categories to filter by (e.g., ["machine learning", "deep learning", "NLP", "AI"])

        Returns:
            List[Dict[str, Any]]: List of related papers with their metadata
        """
        try:
            search_params = {
                "query": content,
                "num_results": 10,
                "type": "neural", 
                "category": "research paper",  
                "text": True,
                "summary": {"query": "Key concepts and prerequisites"},
                "subpages": 1,
                "subpage_target": "sources",
                "extras": {"links": 1, "image_links": 1},
                "filters": filters
                or ["machine learning", "deep learning", "NLP", "AI"],
                "include_metadata": True,
            }

            # Make the API request
            response = requests.post(
                self.base_url, headers=self.headers, json=search_params
            )
            response.raise_for_status()

            # Process and format the results
            results = response.json()
            formatted_results = []

            for result in results.get("results", []):
                formatted_result = {
                    "title": result.get("title", ""),
                    "url": result.get("url", ""),
                    "authors": result.get("authors", []),
                    "publication_year": result.get("publication_year", ""),
                    "abstract": result.get("abstract", ""),
                    "categories": result.get("categories", []),
                    "relevance_score": result.get("relevance_score", 0.0),
                    "summary": result.get("summary", ""),  
                    "sources": result.get("sources", []), 
                }
                formatted_results.append(formatted_result)

            return formatted_results

        except requests.exceptions.RequestException as e:
            logger.error(f"Error making request to Exa API: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in Exa search: {str(e)}")
            raise
