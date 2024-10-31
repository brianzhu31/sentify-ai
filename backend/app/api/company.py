from flask import jsonify, Blueprint, request
from managers.company_manager import CompanyManager
from services.stock import StockClient

company_bp = Blueprint("company", __name__)


@company_bp.route("/all/full", methods=["GET"])
def get_all_companies_full():
    get_score = request.args.get("score", default="false").lower() == "true"
    if get_score:
        companies = CompanyManager.get_all_companies_with_score()
    else:
        companies = CompanyManager.get_all_companies_full_json()

    return companies, 200


@company_bp.route("/all/partial", methods=["GET"])
def get_all_companies_partial():
    companies = CompanyManager.get_all_companies_partial_json()

    return companies, 200


@company_bp.route("/<int:company_id>", methods=["GET"])
def get_company_by_id(company_id: int):
    company = CompanyManager.get_company_by_id(company_id=company_id)
    company_data = company.to_json()

    return company_data, 200


@company_bp.route("/<string:ticker>", methods=["GET"])
def get_company_by_ticker(ticker: str):
    company = CompanyManager.get_company_by_ticker(ticker=ticker)
    company_data = company.to_json()

    return company_data, 200

@company_bp.route("/analytics/<string:ticker>", methods=["GET"])
def get_company_analytics_by_ticker(ticker: str):
    company_analytics = CompanyManager.get_analytics_json(ticker=ticker)
    return company_analytics, 200

@company_bp.route("/stock/price/<string:ticker>", methods=["GET"])
def get_stock_price(ticker: str):
    stock_client = StockClient()
    stock_price = stock_client.get_stock_price(ticker=ticker)
    return {
        "ticker": ticker,
        "price": stock_price
    }, 200

@company_bp.route("/stock/time_series/<string:ticker>", methods=["GET"])
def get_time_series(ticker: str):
    stock_client = StockClient()
    time_series_options = stock_client.get_time_series_options(ticker=ticker)
    return time_series_options, 200
