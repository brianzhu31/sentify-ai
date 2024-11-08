from app.models import (
    db,
    Company as CompanyModel,
    CompanyAnalytics as CompanyAnalyticsModel,
)
from app.exceptions.errors import NotFoundError
from datetime import datetime
from typing import Dict, List


class Company:
    def __init__(self, company_model: CompanyModel):
        self.id = company_model.id
        self.company_name = company_model.company_name
        self.ticker = company_model.ticker
        self.aliases = company_model.aliases
        self.exchange = company_model.exchange
        self.currency = company_model.currency

    def to_json(self, trim: bool = False):
        company_data = {
            "id": self.id,
            "company_name": self.company_name,
            "ticker": self.ticker,
            "aliases": self.aliases,
        }

        if not trim:
            company_data.update({"exchange": self.exchange, "currency": self.currency})

        return company_data


class CompanyAnalytics:
    def __init__(self, company_data: CompanyAnalyticsModel):
        self.id = company_data.id
        self.company_name = company_data.company_name
        self.ticker = company_data.ticker
        self.summary_sections = company_data.summary_sections
        self.score = company_data.score
        self.stock_price = company_data.stock_price
        self.time_series = company_data.time_series
        self.stock_price_last_updated = company_data.stock_price_last_updated
        self.time_series_last_updated = company_data.time_series_last_updated
        self.analytics_last_updated = company_data.analytics_last_updated

    def to_json(self):
        return {
            "id": self.id,
            "company_name": self.company_name,
            "ticker": self.ticker,
            "summary_sections": self.summary_sections,
            "score": self.score,
            "last_updated": (
                self.analytics_last_updated.strftime("%Y-%m-%d %H:%M:%S")
                if self.analytics_last_updated
                else None
            ),
        }


class CompanyManager:

    @staticmethod
    def get_company_by_id(company_id: int):
        company = CompanyModel.query.get(company_id)
        if company is None:
            raise NotFoundError(f"Company with id {company_id} not found.")
        return Company(company)

    @staticmethod
    def get_company_analytics_by_ticker(ticker: str):
        company_analytics_query = CompanyAnalyticsModel.query.filter_by(
            ticker=ticker
        ).one_or_none()
        if company_analytics_query is None:
            raise NotFoundError(f"Company with ticker {ticker} not found.")
        company_analytics = CompanyAnalytics(company_analytics_query)
        return company_analytics

    @staticmethod
    def get_company_by_ticker(ticker: str):
        company = CompanyModel.query.filter_by(ticker=ticker).one_or_none()
        if company is None:
            raise NotFoundError(f"Company with ticker {ticker} not found.")
        return Company(company)

    @staticmethod
    def get_all_companies():
        company_models = CompanyModel.query.all()
        companies = [Company(company_model) for company_model in company_models]
        return companies

    @classmethod
    def get_all_companies_full_json(cls):
        companies = cls.get_all_companies()
        companies_list = []
        for company in companies:
            companies_list.append(company.to_json())
        return companies_list

    @classmethod
    def get_all_companies_partial_json(cls):
        companies = cls.get_all_companies()
        companies_list = []
        for company in companies:
            companies_list.append(company.to_json(trim=True))
        return companies_list

    @classmethod
    def add_analysis_data(
        cls,
        ticker: str,
        summary_sections: list,
        score: float,
    ):
        try:
            company = cls.get_company_by_ticker(ticker=ticker)
            company_name = company.company_name
            company_data_query = CompanyAnalyticsModel.query.filter_by(
                ticker=ticker
            ).one_or_none()

            if company_data_query:
                company_data_query.summary_sections = summary_sections
                company_data_query.score = score
                company_data_query.analytics_last_updated = datetime.utcnow()
            else:
                new_company = CompanyAnalyticsModel(
                    company_name=company_name,
                    ticker=ticker,
                    summary_sections=summary_sections,
                    score=score,
                )
                db.session.add(new_company)

            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise Exception(e)

    @classmethod
    def get_analytics_json(cls, ticker: str):
        company_analytics = cls.get_company_analytics_by_ticker(ticker=ticker)
        return company_analytics.to_json()

    @staticmethod
    def get_company_analytics_by_tickers(tickers: List[str]):
        return CompanyAnalyticsModel.query.filter(CompanyAnalyticsModel.ticker.in_(tickers)).all()

    @classmethod
    def get_all_companies_with_score(cls):
        companies = cls.get_all_companies()
        tickers = [company.ticker for company in companies]
        analytics_data = {
            analytics.ticker: analytics.score
            for analytics in cls.get_company_analytics_by_tickers(tickers)
        }

        companies_list = []
        for company in companies:
            row = company.to_json()
            row["score"] = analytics_data.get(company.ticker)
            companies_list.append(row)

        return companies_list

    @classmethod
    def get_stock_price_last_updated(cls, ticker: str):
        company_analytics = cls.get_company_analytics_by_ticker(ticker)
        return company_analytics.stock_price_last_updated

    @classmethod
    def get_time_series_last_updated(cls, ticker: str):
        company_analytics = cls.get_company_analytics_by_ticker(ticker)
        return company_analytics.time_series_last_updated

    @classmethod
    def get_stock_price(cls, ticker: str):
        company_analytics = cls.get_company_analytics_by_ticker(ticker)
        return company_analytics.stock_price

    @classmethod
    def get_time_series(cls, ticker: str):
        company_analytics = cls.get_company_analytics_by_ticker(ticker)
        return company_analytics.time_series

    @staticmethod
    def update_stock_price(ticker: str, price: float):
        company_analytics_query = CompanyAnalyticsModel.query.filter_by(
            ticker=ticker
        ).one_or_none()
        if company_analytics_query is None:
            raise NotFoundError(f"Company with ticker {ticker} not found.")
        try:
            company_analytics_query.stock_price = price
            company_analytics_query.stock_price_last_updated = datetime.utcnow()
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise Exception(e)

    @staticmethod
    def update_time_series(ticker: str, time_series: Dict):
        company_analytics_query = CompanyAnalyticsModel.query.filter_by(
            ticker=ticker
        ).one_or_none()
        if company_analytics_query is None:
            raise NotFoundError(f"Company with ticker {ticker} not found.")
        try:
            company_analytics_query.time_series = time_series
            company_analytics_query.time_series_last_updated = datetime.utcnow()
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise Exception(e)
