from flask import jsonify, request, Blueprint, g
from services.search_service import get_company_analysis_data
from models import db, Search, User, Company
from utils.validation import token_required
from utils.codec import int_to_base64
from exceptions.errors import InsufficientArticlesError

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

    ticker = request.json.get("ticker")
    days_ago = request.json.get("days_ago")

    company = Company.query.filter_by(ticker=ticker).one_or_none()

    if company:
        company_name = company.company_name
        keywords = company.aliases + [company_name, ticker]
        company_id = company.id

        try:
            analysis_data = get_company_analysis_data(company_name, keywords, days_ago)

            new_search = Search(
                company_name=company_name,
                ticker=ticker,
                positive_summaries=analysis_data.get("positive", []),
                negative_summaries=analysis_data.get("negative", []),
                top_sources=analysis_data.get("top_sources", []),
                score=analysis_data.get("score", 0),
                created_by=user_id,
            )

        except InsufficientArticlesError as e:
            raise InsufficientArticlesError
    else:
        return jsonify({"message": f"No company found with ticker {ticker}"})

    try:
        db.session.add(new_search)
        db.session.commit()
        user.search_ids.append(new_search.id)
        user.search_count += 1
        db.session.commit()

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 400

    search_id = new_search.id
    search_id_b64 = int_to_base64(search_id)

    json_output = {
        "company_name": new_search.company_name,
        "ticker": new_search.ticker,
        "search_id": search_id,
        "search_id_b64": search_id_b64,
        "company_id": company_id,
        "analysis": analysis_data
    }

    return json_output, 200


@search_bp.route("/get_search/<int:search_id>", methods=["GET"])
@token_required
def get_search_by_id(search_id: int):
    search = Search.query.get(search_id)
    if search is None:
        return jsonify({"message": "Search not found."}), 404

    search_data = {
        "id": search.id,
        "company_name": search.company_name,
        "ticker": search.ticker,
        "positive_summaries": search.positive_summaries,
        "negative_summaries": search.negative_summaries,
        "top_sources": search.top_sources,
        "score": search.score,
        "created_by": search.created_by,
        "created_at": search.created_at
    }

    return jsonify(search_data), 200


@search_bp.route("/search_history", methods=["GET"])
@token_required
def get_search_history():
    user_id = g.user["sub"]
    user = User.query.get(user_id)
    if user is None:
        return jsonify({"message": "User not found."}), 404

    searches = Search.query.filter(Search.id.in_(
        user.search_ids)).order_by(Search.created_at.desc()).all()

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
