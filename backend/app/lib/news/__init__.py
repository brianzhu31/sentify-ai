import os
import json
from newscatcherapi import NewsCatcherApiClient
from exceptions.errors import ExternalAPIError

NEWSCATCHER_KEY = os.getenv("NEWSCATCHER_KEY")


def get_news(keywords: list, days_ago: int, page: int = 1) -> dict:
    try:
        newscatcherapi = NewsCatcherApiClient(x_api_key=NEWSCATCHER_KEY)
        search_query = " OR ".join(f'"{keyword}"' for keyword in keywords)
        news_articles = newscatcherapi.get_search(
            q=search_query, lang="en", from_=f"{days_ago} days ago",
            to_rank=500, page_size=100, page=page
        )
        
        with open("raw_news_data.json", "w", encoding="utf-8") as json_file:
            json.dump(news_articles, json_file, indent=4)

        return news_articles
    except Exception as e:
        raise ExternalAPIError("Error fetching data from external API.")