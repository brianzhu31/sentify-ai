from flask import jsonify, request, Blueprint, g
from services.search_service import get_company_analysis_data
from models import db, Search, User
from app.utils.validation import token_required

search_bp = Blueprint("search", __name__)


@search_bp.route("/search_company", methods=["POST"])
@token_required
def search_company():
    user_id = g.user['sub']
    user = User.query.get(user_id)
    if user is None:
        return jsonify({"message": "User not found."}), 404
    search_count = user.search_count
    if search_count >= 10:
        return jsonify({"message": "Daily search limit reached."}), 429

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
        created_by=user_id
    )
    try:
        db.session.add(new_search)
        db.session.commit()
        
        new_search_id = new_search.id

        user.search_ids.append(new_search_id)
        user.search_count += 1

        db.session.commit()
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 400
    return jsonify(analysis_data), 200


@search_bp.route("/search_history", methods=["GET"])
@token_required
def get_searches():
    user_id = g.user['sub']
    user = User.query.get(user_id)
    if user is None:
        return jsonify({"message": "User not found."}), 404

    searches = Search.query.filter(Search.id.in_(user.search_ids)).all()

    list_of_search_contents = [
        {
            "search_id": search.id,
            "company_name": search.company_name,
            "ticker": search.ticker,
            "created_at": search.created_at
        }
        for search in searches
    ]
    
    return jsonify(list_of_search_contents), 200
