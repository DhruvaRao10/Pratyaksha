#!/usr/bin/env python3
"""
Script to manually update the trending papers cache.
Run this script to refresh the cache after Redis server is started.
"""

import asyncio
from cron_cache_search import fetch_papers_with_code
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def update_cache():
    """Update the trending papers cache manually"""
    logger.info("Starting manual update of trending papers cache...")
    try:
        papers = await fetch_papers_with_code()
        logger.info(f"Successfully updated cache with {len(papers)} papers")
        return papers
    except Exception as e:
        logger.error(f"Error updating cache: {str(e)}")
        return None


if __name__ == "__main__":
    papers = asyncio.run(update_cache())
    if papers:
        logger.info("Cache update complete! Sample of papers:")
        for i, paper in enumerate(papers[:2], 1):
            logger.info(f"{i}. {paper['title']} (Stars: {paper['github_stars']})")
    else:
        logger.error("Failed to update cache")
