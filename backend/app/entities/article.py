from typing import List
from models import db, Article as ArticleModel
from entities.company import Company
from lib.inference.prompt import stock_queries
from lib.inference.embedding import check_article_relevance, embed_texts, filter_similar_texts
from lib.inference.external_api import create_parallel_request
from lib.inference.summary import (
    generate_base_summary,
    compress_base_summary,
    generate_sentiment_summaries,
    sentiment_to_int_score,
    impact_to_int_score,
)
from lib.utils import clean_text, create_batches
from lib.news import get_news
from exceptions.errors import InsufficientArticlesError
import asyncio


class Article:
    def __init__(
        self,
        title: str,
        content: str,
        url: str,
        media: str,
        published_date: str = "",
        clean_url: str = ""
    ):
        self.title: str = title
        self.content: str = clean_text(content)
        self.url: str = url
        self.media: str = media
        self.published_date: str = published_date
        self.clean_url: str = clean_url
        self.summary: str = ""
        self.compressed_summary: str = ""
        self.sentiment: str = ""
        self.impact: str = ""
        self.exists_in_db: bool = False

    def __str__(self):
        return f"Article title: {self.title}\nArticle content:\n{self.content}"

    def to_json(self):
        return {
            "title": self.title,
            "url": self.url,
            "media": self.media,
            "published_date": self.published_date,
            "clean_url": self.clean_url,
            "compressed_summary": self.compressed_summary
        }


class SummaryPoint:
    def __init__(self, value: str, source: Article):
        self.value = value
        self.source = source

    def to_json(self):
        return {
            "value": self.value,
            "source": self.source.url
        }


class ArticleCollection:
    def __init__(self, ticker: str, days_ago: int):
        self.ticker: str = ticker
        self.days_ago: int = days_ago

        company = Company.get_by_ticker(ticker=ticker)
        self.company_name: str = company.company_name
        self.aliases: List[str] = company.aliases

        self.relevant_articles: List[Article] = []
        self.score: float = 0
        self.overall_summary: str = ""
        self.positive_summaries: List[SummaryPoint] = []
        self.negative_summaries: List[SummaryPoint] = []

    def _fetch_articles(self, page: int = 1):
        keywords = self.aliases + [self.company_name, self.ticker]

        all_articles_data = get_news(keywords=keywords, days_ago=self.days_ago, page=page)

        if all_articles_data["status"].lower() != "ok":
            return None

        articles = []
        for article_data in all_articles_data["articles"]:
            article = Article(
                title=article_data["title"],
                content=article_data["summary"],
                url=article_data["link"],
                media=article_data["media"],
                published_date=article_data["published_date"],
                clean_url=article_data["clean_url"]
            )
            articles.append(article)
            
        title_set = set()
        for article in self.relevant_articles:
            title_set.add(article.title)
        unique_articles = []
        for article in articles:
            if article.title not in title_set:
                title_set.add(article.title)
                unique_articles.append(article)
        
        return unique_articles


    def generate_relevant_articles(self):
        page = 1
        minimum_article_threshold = 20
        while True:
            if len(self.relevant_articles) >= minimum_article_threshold:
                break
            
            new_unique_articles = self._fetch_articles(page=page)
            if new_unique_articles == None:
                break

            news_article_texts = [article.content for article in new_unique_articles]

            queries = stock_queries(self.company_name)

            article_embeddings = embed_texts(news_article_texts)
            query_embeddings = embed_texts(queries)

            relevant_articles = []
            for i, article_embedding in enumerate(article_embeddings):
                if check_article_relevance(article_embedding, query_embeddings):
                    relevant_articles.append(new_unique_articles[i])

            self.relevant_articles.extend(relevant_articles)
            page += 1

        if len(self.relevant_articles) < 10:
            raise InsufficientArticlesError(
                f"Insufficient data information about {self.company_name.rstrip('.')}. Please try increasing the time frame.")

    def summarize_articles(self):
        generate_base_summary_data = []
        compress_base_summary_data = []
        for article in self.relevant_articles:
            article_query = ArticleModel.query.filter_by(
                ticker=self.ticker, title=article.title).one_or_none()

            if article_query is not None:
                article.compressed_summary = article_query.compressed_summary
                article.sentiment = article_query.sentiment
                article.impact = article_query.impact
                article.media = article_query.media
                article.published_date = article_query.published_date
                article.clean_url = article_query.clean_url
                article.exists_in_db = True
            else:
                generate_base_summary_data.append({
                    "company_name": self.company_name,
                    "article": str(article)
                })
                compress_base_summary_data.append({
                    "company_name": self.company_name,
                    "article_title": article.title,
                    "summary": article.summary,
                })

        summaries = asyncio.run(
            create_parallel_request(
                func=generate_base_summary, data=generate_base_summary_data)
        )

        for article in self.relevant_articles:
            if not article.exists_in_db:
                article.summary = summaries[0]
                summaries.pop(0)

        analysis_results = asyncio.run(
            create_parallel_request(func=compress_base_summary, data=compress_base_summary_data)
        )
        
        for article in self.relevant_articles:
            if not article.exists_in_db:
                article.compressed_summary = analysis_results[0]["summary"]
                article.sentiment = analysis_results[0]["sentiment"]
                article.impact = analysis_results[0]["impact"]
                analysis_results.pop(0)

        total_score = 0
        total_weight = 0
        for article in self.relevant_articles:
            sentiment = article.sentiment
            impact = article.impact
            int_score = sentiment_to_int_score(sentiment)
            int_weight = impact_to_int_score(impact)
            total_score += int_score * int_weight
            total_weight += int_weight
            
            if not article.exists_in_db:
                try:
                    new_article = ArticleModel(
                        ticker=self.ticker,
                        title=article.title,
                        media=article.media,
                        published_date=article.published_date,
                        clean_url=article.clean_url,
                        compressed_summary=article.compressed_summary,
                        sentiment=article.sentiment,
                        impact=article.impact
                    )
                    db.session.add(new_article)
                    db.session.commit()
                except Exception as e:
                    db.session.rollback()
                    raise Exception(str(e))

        overall_score = total_score / total_weight if total_weight != 0 else 0

        self.score = round(overall_score, 1)

    def generate_sentiment_summaries(self, filter_unique: bool = False):
        article_batches = create_batches(self.relevant_articles, 10)
        index = 0
        data = []
        for batch in article_batches:
            article_summaries_batch = ""
            for article in batch:
                article_summaries_batch += f"** Article {index} **\nTitle: {article.title}\nSummary: {article.compressed_summary}\n\n"
                index += 1
            data.append({
                "company_name": self.company_name,
                "article_summaries": article_summaries_batch
            })

        sentiment_summary_batch_results = asyncio.run(
            create_parallel_request(
                func=generate_sentiment_summaries, data=data)
        )

        merged_results = {
            "positive": [],
            "negative": []
        }

        for batch in sentiment_summary_batch_results:
            merged_results["positive"].extend(batch.get("positive", []))
            merged_results["negative"].extend(batch.get("negative", []))

        positive_summaries = []
        negative_summaries = []
        for summary_point_json in merged_results["positive"]:
            summary_point_value = summary_point_json["info"]
            source = self.relevant_articles[summary_point_json["source"]]
            summary_point = SummaryPoint(
                value=summary_point_value, source=source)
            positive_summaries.append(summary_point)

        for summary_point_json in merged_results["negative"]:
            summary_point_value = summary_point_json["info"]
            source = self.relevant_articles[summary_point_json["source"]]
            summary_point = SummaryPoint(
                value=summary_point_value, source=source)
            negative_summaries.append(summary_point)

        self.positive_summaries = positive_summaries
        self.negative_summaries = negative_summaries

        if filter_unique:
            all_positive_summary_points = [
                summary.value for summary in self.positive_summaries]
            all_negative_summary_points = [
                summary.value for summary in self.negative_summaries]

            filtered_positive_summary_indices = filter_similar_texts(
                all_positive_summary_points, threshold=0.94)
            filtered_negative_summary_indices = filter_similar_texts(
                all_negative_summary_points, threshold=0.94)

            self.positive_summaries = [self.positive_summaries[i]
                                       for i in filtered_positive_summary_indices]
            self.negative_summaries = [self.negative_summaries[i]
                                       for i in filtered_negative_summary_indices]

    def full_analysis(self):
        self.generate_relevant_articles()
        self.summarize_articles()
        self.generate_sentiment_summaries(filter_unique=True)

        return {
            "positive": [summary.to_json() for summary in self.positive_summaries],
            "negative": [summary.to_json() for summary in self.negative_summaries],
            "score": self.score,
            "sources": [article.to_json() for article in self.relevant_articles]
        }
