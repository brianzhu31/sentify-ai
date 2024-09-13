from typing import List, Optional, Dict
from lib.inference.prompt import stock_queries
from lib.inference.embedding import check_article_relevance, embed_texts
from lib.inference.external_api import create_parallel_request
from lib.inference.summary import (
    generate_base_summary,
    compress_base_summary,
    generate_overall_summaries,
    sentiment_to_int_score,
    impact_to_int_score,
)
from lib.text import clean_text
import asyncio


class Article:
    def __init__(
        self,
        title: str,
        content: str,
        url: str,
        summary: str = "",
        compressed_summary: str = "",
    ):
        self.title: str = title
        self.content: str = clean_text(content)
        self.url: str = url
        self.summary: str = summary
        self.compressed_summary: str = compressed_summary

    def __str__(self):
        return f"Article title: {self.title}\nArticle content:\n{self.content}"


class SummaryPoint:
    def __init__(self, value: str, source_article: Article):
        self.value = value
        self.source_article = source_article


class ArticleCollection:
    def __init__(self, company: str, articles: Optional[List[Article]] = []):
        self.company: str = company
        self.articles: List[Article] = articles
        self.articles: List[Article] = self._get_unique_articles()
        self.relevant_articles: List[Article] = []
        self.score: float = 0
        self.overall_summary: str = ""
        self.positive_summaries = List[SummaryPoint]
        self.negative_summaries = List[SummaryPoint]

    def _get_unique_articles(self):
        title_set = set()
        unique_articles = []
        for article in self.articles:
            if article.title not in title_set:
                title_set.add(article.title)
                unique_articles.append(article)
        return unique_articles

    def filter_articles(self):
        news_article_texts = [article.content for article in self.articles]

        queries = stock_queries(self.company)

        article_embeddings = embed_texts(news_article_texts)
        query_embeddings = embed_texts(queries)

        relevant_articles = []
        for i, article_embedding in enumerate(article_embeddings):
            if check_article_relevance(article_embedding, query_embeddings):
                relevant_articles.append(self.articles[i])

        self.relevant_articles = relevant_articles

    def summarize_articles(self):
        data = [
            {"company_name": self.company, "article": str(article)}
            for article in self.relevant_articles
        ]

        summaries = asyncio.run(
            create_parallel_request(func=generate_base_summary, data=data)
        )

        for article, summary in zip(self.relevant_articles, summaries):
            article.summary = summary

        data = [
            {
                "company_name": self.company,
                "article_title": article.title,
                "summary": article.summary,
            }
            for article in self.relevant_articles
        ]

        analysis_results = asyncio.run(
            create_parallel_request(func=compress_base_summary, data=data)
        )

        total_score = 0
        total_weight = 0
        for article, result in zip(self.relevant_articles, analysis_results):
            article.compressed_summary = result["summary"]
            sentiment = result["sentiment"]
            impact = result["impact"]
            int_score = sentiment_to_int_score(sentiment)
            int_weight = impact_to_int_score(impact)
            total_score += int_score * int_weight
            total_weight += int_weight

        overall_score = total_score / total_weight if total_weight != 0 else 0

        self.score = overall_score

    def generate_overall_summaries(self):
        article_summaries = ""
        for i, article in enumerate(self.relevant_articles):
            article_summaries += f"** Article {i} **\nTitle: {article.title}\nSummary: {article.compressed_summary}\n\n"

        inference_output = generate_overall_summaries(
            company_name=self.company, article_summaries=article_summaries
        )

        self.overall_summary = inference_output["overall_summary"]

        positive_summaries = []
        negative_summaries = []
        for summary_point_json in inference_output["positive"]:
            summary_point_value = summary_point_json["info"]
            article_source = self.relevant_articles[summary_point_json["source"]]
            summary_point = SummaryPoint(value=summary_point_value, source_article=article_source)
            positive_summaries.append(summary_point)
        
        for summary_point_json in inference_output["negative"]:
            summary_point_value = summary_point_json["info"]
            article_source = self.relevant_articles[summary_point_json["source"]]
            summary_point = SummaryPoint(value=summary_point_value, source_article=article_source)
            negative_summaries.append(summary_point)
        
        self.positive_summaries = positive_summaries
        self.negative_summaries = negative_summaries
