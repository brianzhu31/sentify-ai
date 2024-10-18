from flask import jsonify, Blueprint
from managers.company_manager import CompanyManager

company_bp = Blueprint("company", __name__)


@company_bp.route("/all/full", methods=["GET"])
def get_all_companies_full():
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
