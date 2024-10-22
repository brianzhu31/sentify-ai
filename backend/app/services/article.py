from typing import List
from models import db, Article as ArticleModel
from entities.company import Company
from managers.company_manager import CompanyManager
from managers.article_manager import ArticleManager
from lib.inference.prompt import stock_queries
from lib.inference.embedding import (
    check_article_relevance,
    embed_texts,
)
from lib.inference.batch import (
    create_jsonl_batch_file,
    create_jsonl_embedding_batch_file,
    submit_batch,
    get_batch_results,
)
from lib.inference.prompt import base_summarization_prompt, compress_base_prompt
from lib.utils import clean_text, create_batches, jsonl_string_to_list, datetime_to_unix
from lib.news import get_news
from exceptions.errors import InsufficientArticlesError, NotFoundError, DBCommitError
from openai import OpenAI
from pinecone import Pinecone
from dotenv import load_dotenv
from datetime import datetime
import uuid
import time
import os
import json


load_dotenv(".env.local")

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

    def fetch_articles(self, tickers: List[str] = None, days_ago: int = 7):
        articles = []
        title_set = set()
        query_embeddings = {}
        for ticker in tickers:
            company = CompanyManager.get_company_by_ticker(ticker=ticker)
            keywords = company.aliases + [company.company_name, company.ticker]
            query_embeddings[company.company_name] = embed_texts(
                stock_queries(company.company_name)
            )

            max_pages = 2
            page = 1
            while page <= max_pages:
                request_page = get_news(keywords=keywords, days_ago=days_ago, page=page)

                for article_data in request_page["articles"]:
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
                time.sleep(1.5)

        article_texts = []
        for article in articles:
            article_texts.append(article.content)

        article_embeddings = [0] * len(articles)

        create_jsonl_embedding_batch_file(
            texts=article_texts,
            output_dir="files",
            file_name="article_texts.jsonl",
        )

        batch_id = submit_batch(
            filepath="files/article_texts.jsonl",
            endpoint="/v1/embeddings",
            job_description="article embedding job",
        )

        article_embeddings_batch_output = get_batch_results(
            batch_id=batch_id,
            output_dir="files",
            output_filename="article_embeddings.jsonl",
        )

        for embedding_data in article_embeddings_batch_output:
            article_index = int(embedding_data["custom_id"])
            embedding = embedding_data["response"]["body"]["data"][0]["embedding"]
            article_embeddings[article_index] = embedding

        relevant_articles = []
        for article, article_embedding in zip(articles, article_embeddings):
            if check_article_relevance(
                article_embedding, query_embeddings[article.company_name]
            ):
                relevant_articles.append(article)
                print("RELEVANT", article.title)
            else:
                print("NOT RELEVANT", article.title)

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

        batch_id = submit_batch(
            filepath="files/articles.jsonl",
            endpoint="/v1/chat/completions",
            job_description="article summarization job",
        )

        summaries_batch_output = get_batch_results(
            batch_id=batch_id,
            output_dir="files",
            output_filename="base_summaries.jsonl",
        )

        for summary in summaries_batch_output:
            article_index = int(summary["custom_id"])
            self.articles[article_index].summary = summary["response"]["body"][
                "choices"
            ][0]["message"]["content"]

        create_jsonl_batch_file(
            objects=self.articles,
            output_dir="files",
            file_name="article_summaries.jsonl",
            prompt_function=compress_base_prompt,
            prompt_args=["company_name", "title", "summary"],
            output_json=True,
        )

        batch_id = submit_batch(
            filepath="files/article_summaries.jsonl",
            endpoint="/v1/chat/completions",
            job_description="article summary compression job",
        )

        compressed_summaries_batch_output = get_batch_results(
            batch_id=batch_id,
            output_dir="files",
            output_filename="compressed_summaries.jsonl",
        )

        for summary in compressed_summaries_batch_output:
            article_index = int(summary["custom_id"])
            text_output = summary["response"]["body"]["choices"][0]["message"]["content"]
            json_output = json.loads(text_output)
            self.articles[article_index].compressed_summary = json_output["summary"]
            self.articles[article_index].sentiment = json_output["sentiment"]
            self.articles[article_index].impact = json_output["impact"]

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

    def embed_articles_to_vector_db(self):
        if len(self.articles) == 0:
            return

        summary_texts = []
        for article in self.articles:
            summary_texts.append(article.summary)
        summary_embeddings = embed_texts(summary_texts)

        vectors = []
        for article, embedding in zip(self.articles, summary_embeddings):
            vector = {
                "id": str(article.id),
                "values": embedding,
                "metadata": {
                    "article_title": article.title,
                    "ticker": article.ticker,
                    "media": article.media,
                    "published_date": datetime_to_unix(article.published_date),
                    "url": article.url,
                    "clean_url": article.clean_url,
                    "text": article.summary,
                },
            }
            vectors.append(vector)
        index = pc.Index("company-info")
        index.upsert(vectors=vectors, namespace="articles")
