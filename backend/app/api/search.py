from flask import jsonify, request, Blueprint
from services.search_service import get_company_analysis_data
from models import db, Search

search_bp = Blueprint("search", __name__)


@search_bp.route("/search_company", methods=["POST"])
def search_company():
    company_name = request.json.get("company_name")
    ticker = request.json.get("ticker")
    days_ago = request.json.get("days_ago")
    analysis_data = get_company_analysis_data(company_name, ticker, days_ago)
    new_search = Search(
        company_name=company_name,
        ticker=ticker,
        positive_summaries=analysis_data["positive"],
        negative_summaries=analysis_data["negative"],
        top_sources=analysis_data["top_sources"],
        score=analysis_data["score"],
    )
    try:
        db.session.add(new_search)
        db.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400
    return jsonify(analysis_data), 200
