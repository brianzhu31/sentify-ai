from typing import List
from models import db, Article as ArticleModel
from entities.company import Company
from managers.company_manager import CompanyManager
from managers.article_manager import ArticleManager
from lib.inference.prompt import stock_queries
from lib.inference.embedding import (
    check_article_relevance,
    embed_texts,
    filter_similar_texts
)
from lib.inference.batch import create_jsonl_batch_file
from lib.inference.prompt import base_summarization_prompt, compress_base_prompt
from lib.utils import clean_text, create_batches, jsonl_string_to_list
from lib.news import get_news
from exceptions.errors import InsufficientArticlesError, NotFoundError, DBCommitError
from config import pc
from openai import OpenAI
from dotenv import load_dotenv
import asyncio
from datetime import datetime
import uuid
import time
import os
import json


load_dotenv(".env.local")

OPENAI_KEY = os.getenv("OPENAI_KEY")

client = OpenAI(api_key=OPENAI_KEY)


class Article:
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
        self.articles: List[Article] = []

    def fetch_articles(self, tickers: List[str] = None, days_ago: int = 1):
        articles = []
        title_set = set()
        query_embeddings = {}
        for ticker in tickers:
            company = CompanyManager.get_company_by_ticker(ticker=ticker)
            keywords = company.aliases + [company.company_name, company.ticker]
            query_embeddings[company.company_name] = embed_texts(
                stock_queries(company.company_name))

            max_pages = 1
            page = 1
            while page <= max_pages:
                request_page = get_news(
                    keywords=keywords, days_ago=days_ago, page=page
                )

                for article_data in request_page["articles"]:
                    article_title = article_data["title"]
                    article_query = ArticleManager.get_article_by_title_and_ticker(article_title=article_title, ticker=ticker)
                    if article_query:
                        continue
                    if article_title not in title_set:
                        article = Article(
                            company_name=company.company_name,
                            ticker=company.ticker,
                            title=article_data["title"],
                            content=article_data["summary"],
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
            time.sleep(1)

        article_texts = []
        for article in articles:
            article_texts.append(article.content)

        article_embeddings = embed_texts(article_texts)

        relevant_articles = []
        for article, article_embedding in zip(articles, article_embeddings):
            if check_article_relevance(article_embedding, query_embeddings[article.company_name]):
                relevant_articles.append(article)

        self.articles = relevant_articles

    def summarize_articles(self):
        if len(self.articles) == 0:
            return

        create_jsonl_batch_file(
            articles=self.articles,
            output_dir="files",
            file_name="articles.jsonl",
            prompt_function=base_summarization_prompt,
            prompt_args=['company_name', 'content']
        )

        batch_input_file = client.files.create(
            file=open("files/articles.jsonl", "rb"),
            purpose="batch"
        )

        batch_input_file_id = batch_input_file.id
        new_batch = client.batches.create(
            input_file_id=batch_input_file_id,
            endpoint="/v1/chat/completions",
            completion_window="24h",
            metadata={
                "description": "article summarization job"
            }
        )
        batch_id = new_batch.id

        batch_success = False
        while True:
            batch = client.batches.retrieve(batch_id)
            if batch.status == "completed":
                batch_success = True
                break
            if batch.status in ["failed", "expired", "cancelled"]:
                break

            time.sleep(10)

        file_response = None
        batch = client.batches.retrieve(batch_id)
        if batch_success:
            file_response = client.files.content(batch.output_file_id)
            output_dir = "files"
            output_file = os.path.join(output_dir, "base_summaries.jsonl")

            with open(output_file, 'w') as file:
                file.write(file_response.text)

            client.files.delete(batch.input_file_id)
            client.files.delete(batch.output_file_id)

        summaries_batch_output = jsonl_string_to_list(file_response.text)

        for summary in summaries_batch_output:
            article_index = int(summary["custom_id"])
            self.articles[article_index].summary = summary["response"]["body"]["choices"][0]["message"]["content"]

        create_jsonl_batch_file(
            articles=self.articles,
            output_dir="files",
            file_name="article_summaries.jsonl",
            prompt_function=compress_base_prompt,
            prompt_args=['company_name', 'title', 'summary'],
            output_json=True
        )

        batch_input_file = client.files.create(
            file=open("files/article_summaries.jsonl", "rb"),
            purpose="batch"
        )

        batch_input_file_id = batch_input_file.id
        new_batch = client.batches.create(
            input_file_id=batch_input_file_id,
            endpoint="/v1/chat/completions",
            completion_window="24h",
            metadata={
                "description": "article summary compression job"
            }
        )
        batch_id = new_batch.id

        batch_success = False
        while True:
            batch = client.batches.retrieve(batch_id)
            if batch.status == "completed":
                batch_success = True
                break
            if batch.status in ["failed", "expired", "cancelled"]:
                break

            time.sleep(10)

        file_response = None
        batch = client.batches.retrieve(batch_id)
        if batch_success:
            file_response = client.files.content(batch.output_file_id)
            output_dir = "files"
            output_file = os.path.join(
                output_dir, "compressed_summaries.jsonl")

            with open(output_file, 'w') as file:
                file.write(file_response.text)

            client.files.delete(batch.input_file_id)
            client.files.delete(batch.output_file_id)

        summaries_batch_output = jsonl_string_to_list(file_response.text)

        for summary in summaries_batch_output:
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
                impact=article.impact
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
                    "published_date": article.published_date.strftime("%Y-%m-%d %H:%M:%S"),
                    "url": article.url,
                    "clean_url": article.clean_url,
                    "text": article.summary
                }
            }
            vectors.append(vector)
        index = pc.Index("company-info")
        index.upsert(
            vectors=vectors,
            namespace="articles"
        )

    # def generate_sentiment_summaries(self, filter_unique: bool = False):
    #     article_batches = create_batches(self.relevant_articles, 10)
    #     index = 0
    #     data = []
    #     for batch in article_batches:
    #         article_summaries_batch = ""
    #         for article in batch:
    #             article_summaries_batch += f"** Article {index} **\nTitle: {article.title}\nSummary: {article.compressed_summary}\n\n"
    #             index += 1
    #         data.append(
    #             {
    #                 "company_name": self.company_name,
    #                 "article_summaries": article_summaries_batch,
    #             }
    #         )

    #     sentiment_summary_batch_results = asyncio.run(
    #         create_parallel_request(func=generate_sentiment_summaries, data=data)
    #     )

    #     merged_results = {"positive": [], "negative": []}

    #     for batch in sentiment_summary_batch_results:
    #         merged_results["positive"].extend(batch.get("positive", []))
    #         merged_results["negative"].extend(batch.get("negative", []))

    #     positive_summaries = []
    #     negative_summaries = []
    #     for summary_point_json in merged_results["positive"]:
    #         summary_point_value = summary_point_json["info"]
    #         source = self.relevant_articles[summary_point_json["source"]]
    #         summary_point = SummaryPoint(value=summary_point_value, source=source)
    #         positive_summaries.append(summary_point)

    #     for summary_point_json in merged_results["negative"]:
    #         summary_point_value = summary_point_json["info"]
    #         source = self.relevant_articles[summary_point_json["source"]]
    #         summary_point = SummaryPoint(value=summary_point_value, source=source)
    #         negative_summaries.append(summary_point)

    #     self.positive_summaries = positive_summaries
    #     self.negative_summaries = negative_summaries

    #     if filter_unique:
    #         all_positive_summary_points = [
    #             summary.value for summary in self.positive_summaries
    #         ]
    #         all_negative_summary_points = [
    #             summary.value for summary in self.negative_summaries
    #         ]

    #         filtered_positive_summary_indices = filter_similar_texts(
    #             all_positive_summary_points, threshold=0.94
    #         )
    #         filtered_negative_summary_indices = filter_similar_texts(
    #             all_negative_summary_points, threshold=0.94
    #         )

    #         self.positive_summaries = [
    #             self.positive_summaries[i] for i in filtered_positive_summary_indices
    #         ]
    #         self.negative_summaries = [
    #             self.negative_summaries[i] for i in filtered_negative_summary_indices
    #         ]

    # def full_analysis(self):
    #     self.generate_relevant_articles()
    #     self.summarize_articles()
    #     self.generate_sentiment_summaries(filter_unique=True)

    #     return {
    #         "positive": [summary.to_json() for summary in self.positive_summaries],
    #         "negative": [summary.to_json() for summary in self.negative_summaries],
    #         "score": self.score,
    #         "sources": [article.to_json() for article in self.relevant_articles],
    #     }
