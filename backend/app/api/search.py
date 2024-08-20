from flask import jsonify, request, Blueprint, g
from services.search_service import get_company_analysis_data
from models import db, Search, User
from utils.validation import token_required
from utils.codec import int_to_base64

search_bp = Blueprint("search", __name__)


@search_bp.route("/search_company", methods=["POST"])
@token_required
def search_company():
    user_id = g.user["sub"]
    user = User.query.get(user_id)

    if user is None:
        return jsonify({"message": "User not found."}), 404

    if user.search_count >= 10:
        return jsonify({"message": "Daily search limit reached."}), 429

    company_name = request.json.get("company_name")
    ticker = request.json.get("ticker")
    days_ago = request.json.get("days_ago")

    analysis_data = get_company_analysis_data(company_name, ticker, days_ago)

    new_search = Search(
        company_name=company_name,
        ticker=ticker,
        positive_summaries=analysis_data.get("positive", []),
        negative_summaries=analysis_data.get("negative", []),
        top_sources=analysis_data.get("top_sources", []),
        score=analysis_data.get("score", 0),
        created_by=user_id,
    )

    try:
        with db.session.begin_nested():
            db.session.add(new_search)
            db.session.flush()
            
            user.search_ids.append(new_search.id)
            user.search_count += 1

        db.session.commit()

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 400

    return jsonify(analysis_data), 200


@search_bp.route("/search_history", methods=["GET"])
@token_required
def get_search_history():
    user_id = g.user["sub"]
    user = User.query.get(user_id)
    if user is None:
        return jsonify({"message": "User not found."}), 404

    searches = Search.query.filter(Search.id.in_(user.search_ids)).order_by(Search.created_at.desc()).all()

    search_content = {
        "label": "Search History",
        "searches": [
            {
                "search_id": search.id,
                "ticker": search.ticker,
                "href": f"/search/{int_to_base64(search.id)}",
                "label": search.company_name,
                "created_at": search.created_at,
                "active": False,
                "sub_fields": []
            }
            for search in searches
        ],
    }

    return jsonify(search_content), 200
