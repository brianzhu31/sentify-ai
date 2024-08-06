from flask import jsonify, request, Blueprint
from services.search_service import get_company_analysis_data

search_bp = Blueprint("search", __name__)


@search_bp.route("/search", methods=["POST"])
def search_company():
    company_name = request.json.get("company_name")
    ticker = request.json.get("ticker")
    days_ago = request.json.get("days_ago")
    return get_company_analysis_data(company_name, ticker, days_ago)
