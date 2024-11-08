from typing import List
from app.managers.company_manager import CompanyManager
from app.managers.article_manager import ArticleManager
from app.lib.inference.prompt import stock_queries
from app.lib.inference.embedding import (
    check_article_relevance,
    embed_texts,
)
from app.lib.inference.batch import (
    create_jsonl_batch_file,
    create_jsonl_embedding_batch_file,
    submit_batch,
    get_batch_results,
)
from app.lib.inference.prompt import base_summarization_prompt, compress_base_prompt
from app.lib.utils import clean_text, datetime_to_unix
from app.lib.news import get_news
from openai import OpenAI
from pinecone import Pinecone
from datetime import datetime
import time
import os
import json
from app.logger import logger


OPENAI_KEY = os.getenv("OPENAI_KEY")

client = OpenAI(api_key=OPENAI_KEY)

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
pc = Pinecone(api_key=PINECONE_API_KEY)


class NewArticle:
    def __init__(
        self,
        article_id: int = None,
        company_name: str = "",
        ticker: str = "",
        title: str = "",
        content: str = "",
        url: str = "",
        media: str = "",
        published_date: datetime = None,
        clean_url: str = "",
    ):
        self.id = article_id
        self.company_name: str = company_name
        self.ticker: str = ticker
        self.title: str = title
        self.content: str = clean_text(content)
        self.url: str = url
        self.media: str = media
        self.published_date: datetime = published_date
        self.clean_url: str = clean_url
        self.summary: str = ""
        self.compressed_summary: str = ""
        self.sentiment: str = ""
        self.impact: str = ""
        self.exists_in_db: bool = False


class ArticleCollection:
    def __init__(self):
        self.articles: List[NewArticle] = []

    def fetch_articles(self, tickers: List[str], days_ago: int = 7):
        articles = []
        title_set = set()
        query_embeddings = {}

        for ticker in tickers:
            company = CompanyManager.get_company_by_ticker(ticker=ticker)
            keywords = company.aliases + [company.company_name, company.ticker]
            query_embeddings[company.company_name] = embed_texts(
                stock_queries(company.company_name)
            )
            logger.info(f"Fetching news articles for {ticker}.")

            max_pages = 1
            page = 1
            while page <= max_pages:
                request_page = get_news(keywords=keywords, days_ago=days_ago, page=page)

                for article_data in request_page.get("articles", []):
                    article_title = article_data["title"]
                    article_query = ArticleManager.get_article_by_title_and_ticker(
                        article_title=article_title, ticker=ticker
                    )
                    if article_query:
                        continue
                    if article_title not in title_set:
                        article = NewArticle(
                            company_name=company.company_name,
                            ticker=company.ticker,
                            title=article_data["title"],
                            content=article_data["summary"][:10000],
                            url=article_data["link"],
                            media=article_data["media"],
                            published_date=datetime.strptime(
                                article_data["published_date"], "%Y-%m-%d %H:%M:%S"
                            ),
                            clean_url=article_data["clean_url"],
                        )
                        title_set.add(article.title)
                        articles.append(article)

                if request_page["page"] >= request_page["total_pages"]:
                    break

                page += 1
                time.sleep(0.5)

        article_texts = []
        for article in articles:
            article_texts.append(article.content)

        article_embeddings = [0] * len(articles)

        create_jsonl_embedding_batch_file(
            texts=article_texts,
            output_dir="files",
            file_name="article_texts.jsonl",
        )
        logger.info(f"Created article_texts.jsonl")

        batch_id = submit_batch(
            filepath="files/article_texts.jsonl",
            endpoint="/v1/embeddings",
            job_description="article embedding job",
        )
        logger.info(f"Submitted article_texts.jsonl to /v1/embeddings")

        article_embeddings_batch_output = get_batch_results(
            batch_id=batch_id,
            output_dir="files",
            output_filename="article_embeddings.jsonl",
        )
        logger.info(f"Retrieved article_embeddings.jsonl")

        for embedding_data in article_embeddings_batch_output:
            article_index = int(embedding_data["custom_id"])
            try:
                embedding = embedding_data["response"]["body"]["data"][0]["embedding"]
                article_embeddings[article_index] = embedding
            except (KeyError, IndexError, TypeError) as e:
                article_embeddings[article_index] = None
                logger.debug(f"Failed to retrieve embedding for article_index {article_index}: {e}")

        relevant_articles = []
        for article, article_embedding in zip(articles, article_embeddings):
            if check_article_relevance(
                article_embedding, query_embeddings[article.company_name]
            ):
                relevant_articles.append(article)

        self.articles = relevant_articles

    def summarize_articles(self):
        if len(self.articles) == 0:
            return

        create_jsonl_batch_file(
            objects=self.articles,
            output_dir="files",
            file_name="articles.jsonl",
            prompt_function=base_summarization_prompt,
            prompt_args=["company_name", "content"],
        )
        logger.info(f"Created articles.jsonl")

        batch_id = submit_batch(
            filepath="files/articles.jsonl",
            endpoint="/v1/chat/completions",
            job_description="article summarization job",
        )
        logger.info(f"Submitted articles.jsonl to /v1/chat/completions")

        summaries_batch_output = get_batch_results(
            batch_id=batch_id,
            output_dir="files",
            output_filename="base_summaries.jsonl",
        )
        logger.info(f"Retrieved base_summaries.jsonl")

        for summary in summaries_batch_output:
            try:
                article_index = int(summary["custom_id"])
                self.articles[article_index].summary = summary["response"]["body"]["choices"][0]["message"]["content"]
            except (KeyError, IndexError, ValueError, TypeError) as e:
                logger.debug(f"Error processing summary for article index {summary.get('custom_id')}: {e}")
                self.articles[article_index].summary = ""

        create_jsonl_batch_file(
            objects=self.articles,
            output_dir="files",
            file_name="article_summaries.jsonl",
            prompt_function=compress_base_prompt,
            prompt_args=["company_name", "title", "summary"],
            output_json=True,
        )
        logger.info(f"Created article_summaries.jsonl")

        batch_id = submit_batch(
            filepath="files/article_summaries.jsonl",
            endpoint="/v1/chat/completions",
            job_description="article summary compression job",
        )
        logger.info(f"Submitted article_summaries.jsonl to /v1/chat/completions")

        compressed_summaries_batch_output = get_batch_results(
            batch_id=batch_id,
            output_dir="files",
            output_filename="compressed_summaries.jsonl",
        )
        logger.info(f"Retrieved compressed_summaries.jsonl")

        for summary in compressed_summaries_batch_output:
            try:
                article_index = int(summary["custom_id"])

                text_output = summary["response"]["body"]["choices"][0]["message"]["content"]
                json_output = json.loads(text_output)

                self.articles[article_index].compressed_summary = json_output.get("summary", "")
                self.articles[article_index].sentiment = json_output.get("sentiment", "")
                self.articles[article_index].impact = json_output.get("impact", "")

            except (KeyError, IndexError, ValueError, TypeError, json.JSONDecodeError) as e:
                logger.debug(f"Error processing summary for article index {summary.get('custom_id')}: {e}")

                self.articles[article_index].compressed_summary = ""
                self.articles[article_index].sentiment = ""
                self.articles[article_index].impact = ""

    def save_articles(self):
        if len(self.articles) == 0:
            return

        for article in self.articles:
            new_article = ArticleManager.add_article(
                ticker=article.ticker,
                title=article.title,
                media=article.media,
                published_date=article.published_date,
                url=article.url,
                clean_url=article.clean_url,
                compressed_summary=article.compressed_summary,
                sentiment=article.sentiment,
                impact=article.impact,
            )
            article.id = new_article.id

        logger.info("Saved new articles to Postgres DB.")

    def _batch_upsert(self, vectors: List, namespace: str, batch_size: int):
        index = pc.Index("company-info")
        for i in range(0, len(vectors), batch_size):
            batch = vectors[i:i + batch_size]
            index.upsert(vectors=batch, namespace=namespace)

    def embed_articles_to_vector_db(self):
        if len(self.articles) == 0:
            return

        summary_texts = []
        for article in self.articles:
            summary_texts.append(article.summary)

        create_jsonl_embedding_batch_file(
            texts=summary_texts,
            output_dir="files",
            file_name="summary_texts.jsonl",
        )
        logger.info(f"Created summary_texts.jsonl")

        batch_id = submit_batch(
            filepath="files/summary_texts.jsonl",
            endpoint="/v1/embeddings",
            job_description="article summaries embedding job",
        )
        logger.info(f"Submitted summary_texts.jsonl to /v1/embeddings")

        summary_embeddings_batch_output = get_batch_results(
            batch_id=batch_id,
            output_dir="files",
            output_filename="summary_embeddings.jsonl",
        )
        logger.info(f"Retrieved summary_embeddings.jsonl")
        
        summary_embeddings = [0] * len(self.articles)
        for embedding_data in summary_embeddings_batch_output:
            article_index = int(embedding_data["custom_id"])
            try:
                embedding = embedding_data["response"]["body"]["data"][0]["embedding"]
                summary_embeddings[article_index] = embedding
            except (KeyError, IndexError, TypeError) as e:
                summary_embeddings[article_index] = None
                logger.debug(f"Failed to retrieve embedding for article_index {article_index}: {e}")

        vectors = []
        for article, embedding in zip(self.articles, summary_embeddings):
            if embedding is not None:
                vector = {
                    "id": str(article.id),
                    "values": embedding,
                    "metadata": {
                        "article_title": article.title,
                        "ticker": article.ticker,
                        "media": article.media or "",
                        "published_date": datetime_to_unix(article.published_date) or "",
                        "url": article.url or "",
                        "clean_url": article.clean_url or "",
                        "text": article.summary or "",
                    },
                }
                vectors.append(vector)

        self._batch_upsert(vectors=vectors, namespace="articles", batch_size=100)
        logger.info(f"Upserted {len(vectors)} vectors into Pinecone DB.")
