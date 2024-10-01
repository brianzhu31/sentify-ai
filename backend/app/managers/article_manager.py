from models import db, Article as ArticleModel
from datetime import datetime
from exceptions.errors import DBCommitError


class ArticleManager:

    @classmethod
    def get_article_by_id(cls, article_id: int):
        article = ArticleModel.query.get(article_id)
        return article

    @classmethod
    def get_article_by_title_and_ticker(cls, article_title: str, ticker: str):
        article = ArticleModel.query.filter_by(
            title=article_title, ticker=ticker
        ).one_or_none()
        return article

    @classmethod
    def add_article(
            cls,
            ticker: str,
            title: str,
            compressed_summary: str,
            sentiment: str,
            impact: str,
            url: str = None,
            published_date: datetime = None,
            clean_url: str = None,
            media: str = None):
        new_article = ArticleModel(
            ticker=ticker,
            title=title,
            media=media,
            published_date=published_date,
            url=url,
            clean_url=clean_url,
            compressed_summary=compressed_summary,
            sentiment=sentiment,
            impact=impact
        )
        try:
            db.session.add(new_article)
            db.session.commit()
            return new_article
        except Exception as e:
            print(e)
            db.session.rollback()
            raise DBCommitError("Error saving article.")
