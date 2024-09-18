from models import Company as CompanyModel
from exceptions.errors import NotFoundError


class Company:
    def __init__(self):
        self.id = None
        self.company_name = None
        self.ticker = None
        self.aliases = None
        self.exchange = None
        self.currency = None

    @classmethod
    def get_by_id(cls, company_id: int):
        company_query = CompanyModel.query.get(company_id)

        if company_query is None:
            raise NotFoundError(f"Company with id {company_id} not found.")

        company_instance = cls()
        company_instance.id = company_query.id
        company_instance.company_name = company_query.company_name
        company_instance.ticker = company_query.ticker
        company_instance.aliases = company_query.aliases
        company_instance.exchange = company_query.exchange
        company_instance.currency = company_query.currency

        return company_instance

    @classmethod
    def get_by_ticker(cls, ticker: str):
        company_query = CompanyModel.query.filter_by(ticker=ticker).one_or_none()

        if company_query is None:
            raise NotFoundError(f"Company with ticker {ticker} not found.")

        company_instance = cls()
        company_instance.id = company_query.id
        company_instance.company_name = company_query.company_name
        company_instance.ticker = company_query.ticker
        company_instance.aliases = company_query.aliases
        company_instance.exchange = company_query.exchange
        company_instance.currency = company_query.currency
        return company_instance

    def to_json(self):
        return {
            "id": self.id,
            "company_name": self.company_name,
            "ticker": self.ticker,
            "aliases": self.aliases,
            "exchange": self.exchange,
            "currency": self.currency,
        }


class CompanyList:
    def __init__(self):
        companies = CompanyModel.query.all()
        self.companies = companies

    def get_all(self, full_data: bool = True):
        company_list = []
        for company in self.companies:
            company_data = {
                "id": company.id,
                "company_name": company.company_name,
                "ticker": company.ticker,
                "aliases": company.aliases,
            }

            if full_data:
                company_data.update(
                    {"exchange": company.exchange, "currency": company.currency}
                )

            company_list.append(company_data)

        return company_list
