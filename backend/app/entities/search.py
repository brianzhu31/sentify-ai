from models import db, Search as SearchModel
from uuid import UUID
from entities.article import ArticleCollection
from entities.company import Company
from exceptions.errors import NotFoundError, DBCommitError
from typing import Dict
from datetime import datetime, timedelta

class Search:
    def __init__(self):
        self.id: UUID = None
        self.company_name: str = None
        self.ticker: str = None
        self.overall_summary: str = None
        self.positive_summaries: Dict = None
        self.negative_summaries: Dict = None
        self.sources: Dict = None
        self.score: float = None
        self.days_range: int = None
        self.created_by: UUID = None
        self.data_from: datetime = None
        self.created_at: datetime = None

    @classmethod
    def get_by_id(cls, search_id: UUID):
        search_query = SearchModel.query.get(search_id)
        if search_query is None:
            raise NotFoundError(f"Search with id {search_id} not found.")

        search_instance = cls()
        search_instance.id = search_query.id
        search_instance.company_name = search_query.company_name
        search_instance.ticker = search_query.ticker
        search_instance.overall_summary = search_query.overall_summary
        search_instance.positive_summaries = search_query.positive_summaries
        search_instance.negative_summaries = search_query.negative_summaries
        search_instance.sources = search_query.sources
        search_instance.score = search_query.score
        search_instance.days_range = search_query.days_range
        search_instance.created_by = search_query.created_by
        search_instance.data_from = search_query.data_from
        search_instance.created_at = search_query.created_at

        return search_instance

    @classmethod
    def generate_by_inference(cls, user_id: UUID, ticker: str, days_ago: int):
        company = Company.get_by_ticker(ticker=ticker)

        created_at = datetime.utcnow()
        data_from = created_at - timedelta(days=days_ago)

        article_collection = ArticleCollection(ticker=ticker, days_ago=days_ago)

        analysis_data = article_collection.full_analysis()

        new_search = SearchModel(
            company_name=company.company_name,
            ticker=ticker,
            overall_summary=analysis_data.get("overall_summary", ""),
            positive_summaries=analysis_data.get("positive", []),
            negative_summaries=analysis_data.get("negative", []),
            sources=analysis_data.get("sources", []),
            score=analysis_data.get("score", 0),
            days_range=days_ago,
            created_by=user_id,
            data_from=data_from,
            created_at=created_at,
        )

        try:
            db.session.add(new_search)
            db.session.commit()

        except Exception:
            db.session.rollback()
            raise DBCommitError("Error saving search.")

        search_instance = cls()
        search_instance.id = new_search.id
        search_instance.company_name = new_search.company_name
        search_instance.ticker = new_search.ticker
        search_instance.overall_summary = new_search.overall_summary
        search_instance.positive_summaries = new_search.positive_summaries
        search_instance.negative_summaries = new_search.negative_summaries
        search_instance.sources = new_search.sources
        search_instance.score = new_search.score
        search_instance.days_range = new_search.days_range
        search_instance.created_by = new_search.created_by
        search_instance.data_from = new_search.data_from
        search_instance.created_at = new_search.created_at

        return search_instance
    
    def delete(self):
        try:
            SearchModel.query.filter_by(id=self.id).delete()
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise DBCommitError(f"An error occurred with deleting search {self.id}.")

    def check_permission(self, user_id: str) :
        return self.created_by == user_id

    def to_json(self):
        return {
            "id": str(self.id),
            "company_name": self.company_name,
            "ticker": self.ticker,
            "days_range": self.days_range,
            "created_by": self.created_by,
            "data_from": self.data_from,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "analysis_data": {
                "overall_summary": self.overall_summary,
                "positive_summaries": self.positive_summaries,
                "negative_summaries": self.negative_summaries,
                "sources": self.sources,
                "score": self.score,
            },
        }
