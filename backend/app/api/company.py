from flask import jsonify, Blueprint
from entities.company import Company, CompanyList

company_bp = Blueprint("company", __name__)


@company_bp.route("/all/full", methods=["GET"])
def get_all_companies_full():
    companies = CompanyList()

    return jsonify(companies.get_all(full_data=True)), 200


@company_bp.route("/all/partial", methods=["GET"])
def get_all_companies_partial():
    companies = CompanyList()

    return jsonify(companies.get_all(full_data=False)), 200


@company_bp.route("/search/<int:company_id>", methods=["GET"])
def get_company_by_id(company_id: int):
    company = Company.get_by_id(company_id=company_id)
    company_data = company.to_json()

    return company_data, 200


@company_bp.route("/search/<string:ticker>", methods=["GET"])
def get_company_by_ticker(ticker: str):
    company = Company.get_by_ticker(ticker=ticker)
    company_data = company.to_json()

    return company_data, 200
