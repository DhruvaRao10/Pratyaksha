import httpx
import json
import asyncio
import uuid
from redis_config import redis_client, set_cached_data, CACHE_EXPIRATION
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PAPERS_WITH_CODE_API = "https://paperswithcode.com/api/v1/search/"
PAPERS_WITH_CODE_TRENDING_API = "https://paperswithcode.com/api/v1/trending/"
CACHE_KEY_PREFIX = "papers_with_code:"


async def fetch_papers_with_code():
    """Fetch trending papers from PapersWithCode API"""
    try:
        async with httpx.AsyncClient() as client:
            # First try using the trending endpoint
            try:
                logger.info("Trying trending endpoint first...")
                response = await client.get(
                    PAPERS_WITH_CODE_TRENDING_API,
                    params={"limit": 6, "page": 1},
                    timeout=10.0,
                )
                response.raise_for_status()
                papers = response.json()
                logger.info("Successfully fetched papers from the trending endpoint")
            except Exception as e:
                logger.warning(
                    f"Error with trending endpoint: {str(e)}, falling back to search API"
                )
                # Fallback to search API if trending endpoint fails
                response = await client.get(
                    PAPERS_WITH_CODE_API,
                    params={"ordering": "-github_stars", "limit": 6, "type": "paper"},
                    timeout=10.0,
                )
                response.raise_for_status()
                papers = response.json()
                logger.info("Successfully fetched papers from the search API")

            # Format the response to include only necessary fields
            formatted_papers = []
            for paper in papers.get("results", []):
                formatted_paper = {
                    "id": paper.get("id") or str(uuid.uuid4()),
                    "title": paper.get("title", "Untitled Paper"),
                    "abstract": paper.get("abstract", "No abstract available"),
                    "url_pdf": paper.get("url_pdf"),
                    "url_abs": paper.get("url_abs"),
                    "published": paper.get("published", "Unknown date"),
                    "github_stars": paper.get("github_stars", 0),
                    "repositories": paper.get("repositories", []),
                    "datasets": paper.get("datasets", []),
                }
                formatted_papers.append(formatted_paper)

            # Check if we have valid papers
            if not formatted_papers:
                logger.warning("No papers returned from API, using mock data")
                formatted_papers = get_mock_papers()

            # Cache the formatted results
            cache_key = f"{CACHE_KEY_PREFIX}trending"
            try:
                set_cached_data(
                    cache_key,
                    json.dumps(formatted_papers),
                    CACHE_EXPIRATION["papers_with_code"],
                )
                logger.info(
                    f"Successfully cached {len(formatted_papers)} trending papers"
                )
            except Exception as e:
                logger.error(f"Error caching papers: {str(e)}")

            return formatted_papers

    except Exception as e:
        logger.error(f"Error fetching papers from PapersWithCode: {str(e)}")

        # Return mock data as a fallback
        mock_papers = get_mock_papers()

        # Try to cache the mock papers
        try:
            cache_key = f"{CACHE_KEY_PREFIX}trending"
            set_cached_data(
                cache_key,
                json.dumps(mock_papers),
                CACHE_EXPIRATION["papers_with_code"],
            )
            logger.info("Successfully cached mock papers as fallback")
        except Exception as cache_err:
            logger.error(f"Error caching mock papers: {str(cache_err)}")

        return mock_papers


def get_mock_papers():
    """Return mock papers data as a fallback"""
    return [
        {
            "id": "mock1",
            "title": "Sora: A Review on Background, Technology, Limitations, and Opportunities of Large Vision Models",
            "abstract": "Recent advancements in AI have led to the development of Sora, OpenAI's text-to-video model that can generate realistic and imaginative scenes from text instructions.",
            "url_pdf": "https://arxiv.org/pdf/2402.17177",
            "url_abs": "https://arxiv.org/abs/2402.17177",
            "published": "2024-02-27",
            "github_stars": 320,
            "repositories": [],
            "datasets": [],
        },
        {
            "id": "mock2",
            "title": "GPT-4 Vision for Multimodal Reasoning: Capabilities and Limitations",
            "abstract": "Large Language Models (LLMs) have revolutionized machine learning, enabling systems to generate coherent, contextually relevant text. Recent advancements have extended these models to multimodal inputs.",
            "url_pdf": "https://arxiv.org/pdf/2311.15732",
            "url_abs": "https://arxiv.org/abs/2311.15732",
            "published": "2023-11-27",
            "github_stars": 245,
            "repositories": [],
            "datasets": [],
        },
        {
            "id": "mock3",
            "title": "A Survey on Evaluation of Large Language Models",
            "abstract": "The rapid advancement of Large Language Models (LLMs) has revolutionized natural language processing. This survey provides a comprehensive review of evaluation methods for LLMs.",
            "url_pdf": "https://arxiv.org/pdf/2307.03109",
            "url_abs": "https://arxiv.org/abs/2307.03109",
            "published": "2023-07-06",
            "github_stars": 198,
            "repositories": [],
            "datasets": [],
        },
        {
            "id": "mock4",
            "title": "The Impact of Transformer Architecture on Natural Language Understanding",
            "abstract": "This research explores how different Transformer architectures affect performance on natural language understanding tasks, providing insights for more efficient model design.",
            "url_pdf": None,
            "url_abs": "https://paperswithcode.com/paper/attention-is-all-you-need",
            "published": "2023-12-01",
            "github_stars": 178,
            "repositories": [],
            "datasets": [],
        },
        {
            "id": "mock5",
            "title": "Diffusion Models: A Comprehensive Survey of Methods and Applications",
            "abstract": "Diffusion models have emerged as a powerful class of generative models with applications in image, audio, and video synthesis. This survey provides a taxonomy of diffusion models.",
            "url_pdf": "https://arxiv.org/pdf/2209.00796",
            "url_abs": "https://arxiv.org/abs/2209.00796",
            "published": "2023-09-15",
            "github_stars": 163,
            "repositories": [],
            "datasets": [],
        },
    ]


async def main():
    """Main function to run the cron job"""
    logger.info(f"Starting PapersWithCode cache update at {datetime.now()}")
    try:
        await fetch_papers_with_code()
        logger.info("PapersWithCode cache update completed successfully")
    except Exception as e:
        logger.error(f"Error during PapersWithCode cache update: {str(e)}")


if __name__ == "__main__":
    asyncio.run(main())
