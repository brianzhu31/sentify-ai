from models import db, Article as ArticleModel
from datetime import datetime, timedelta
from exceptions.errors import DBCommitError


class ArticleManager:

    @staticmethod
    def get_article_by_id(article_id: int):
        article = ArticleModel.query.get(article_id)
        return article

    @staticmethod
    def get_article_by_title_and_ticker(article_title: str, ticker: str):
        article = ArticleModel.query.filter_by(
            title=article_title, ticker=ticker
        ).one_or_none()
        return article

    @staticmethod
    def get_articles_by_ticker(ticker: str, time_period: int, limit: int = 100):
        cutoff_date = datetime.now() - timedelta(days=time_period)
        return (
            ArticleModel.query.filter(
                ArticleModel.ticker == ticker,
                ArticleModel.published_date >= cutoff_date,
            )
            .order_by(ArticleModel.published_date.desc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def add_article(
        ticker: str,
        title: str,
        compressed_summary: str,
        sentiment: str,
        impact: str,
        url: str = None,
        published_date: datetime = None,
        clean_url: str = None,
        media: str = None,
    ):
        new_article = ArticleModel(
            ticker=ticker,
            title=title,
            media=media,
            published_date=published_date,
            url=url,
            clean_url=clean_url,
            compressed_summary=compressed_summary,
            sentiment=sentiment,
            impact=impact,
        )
        try:
            db.session.add(new_article)
            db.session.commit()
            return new_article
        except Exception as e:
            print(e)
            db.session.rollback()
            raise DBCommitError("Error saving article.")
