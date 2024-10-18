from models import db, Company as CompanyModel, CompanyAnalytics as CompanyAnalyticsModel
from exceptions.errors import NotFoundError
from datetime import datetime


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
            "aliases": self.aliases
        }

        if not trim:
            company_data.update({
                "exchange": self.exchange,
                "currency": self.currency
            })

        return company_data


class CompanyAnalytics:
    def __init__(self, company_data: CompanyAnalyticsModel):
        self.id = company_data.id
        self.company_name = company_data.company_name
        self.ticker = company_data.ticker
        self.overall_summary = company_data.overall_summary
        self.positive_summaries = company_data.positive_summaries
        self.negatyive_summaries = company_data.negative_summaries
        self.score = company_data.score
        self.last_updated = company_data.last_updated
    
    def to_json(self):
        return {
            "id": self.id,
            "company_name": self.company_name,
            "ticker": self.ticker,
            "overall_summary": self.overall_summary,
            "positive_summaries": self.positive_summaries,
            "negative_summaries": self.negatyive_summaries,
            "score": self.score,
            "last_updated": self.last_updated.strftime("%Y-%m-%d %H:%M:%S") if self.last_updated else None
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
        company_analytics_query = CompanyAnalyticsModel.query.filter_by(ticker=ticker).one_or_none()
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
        overall_summary: str,
        positive_summaries: list,
        negative_summaries: list,
        score: float,
    ):
        try:
            company = cls.get_company_by_ticker(ticker=ticker)
            company_name = company.company_name
            company_data_query = CompanyAnalyticsModel.query.filter_by(ticker=ticker).one_or_none()

            if company_data_query:
                company_data_query.overall_summary = overall_summary
                company_data_query.positive_summaries = positive_summaries
                company_data_query.negative_summaries = negative_summaries
                company_data_query.score = score
                company_data_query.last_updated = datetime.utcnow()
            else:
                new_company = CompanyAnalyticsModel(
                    company_name=company_name,
                    ticker=ticker,
                    overall_summary=overall_summary,
                    positive_summaries=positive_summaries,
                    negative_summaries=negative_summaries,
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
