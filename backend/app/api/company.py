from flask import jsonify, Blueprint
from models import Company as CompanyModel

company_bp = Blueprint("company", __name__)


@company_bp.route("/all/full", methods=["GET"])
def get_all_companies_full():
    companies = CompanyModel.query.all()

    company_list = [
        {
            "id": company.id,
            "company_name": company.company_name,
            "ticker": company.ticker,
            "aliases": company.aliases,
            "exchange": company.exchange,
            "currency": company.currency,
        }
        for company in companies
    ]

    return jsonify(company_list), 200


@company_bp.route("/all/partial", methods=["GET"])
def get_all_companies_partial():
    companies = CompanyModel.query.all()

    company_list = [
        {
            "id": company.id,
            "company_name": company.company_name,
            "ticker": company.ticker,
            "aliases": company.aliases,
        }
        for company in companies
    ]

    return jsonify(company_list), 200


@company_bp.route("/search/<int:company_id>", methods=["GET"])
def get_company_by_id(company_id: int):
    company = CompanyModel.query.get(company_id)

    if company is None:
        return jsonify({"message": "Company not found."}), 404

    company_data = {
        "id": company.id,
        "company_name": company.company_name,
        "ticker": company.ticker,
        "aliases": company.aliases,
        "exchange": company.exchange,
        "currency": company.currency,
    }

    return jsonify(company_data), 200
