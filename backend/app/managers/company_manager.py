from models import db, Company as CompanyModel
from exceptions.errors import NotFoundError

class CompanyManager:
    
    @staticmethod
    def get_company_by_ticker(ticker: str):
        company = CompanyModel.query.filter_by(ticker=ticker).one_or_none()

        if company is None:
            raise NotFoundError(f"Company with ticker {ticker} not found.")

        return company
