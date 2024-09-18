from flask import jsonify, request, Blueprint, g
from entities.search import Search
from entities.company import Company
from entities.user import User
from lib.validation import token_required
from exceptions.errors import (
    SearchLimitError,
    InvalidRequestError,
    PermissionDeniedError,
)
from uuid import UUID

search_bp = Blueprint("search", __name__)


@search_bp.route("/search_company", methods=["POST"])
@token_required
def search_company():
    user_id = g.user["sub"]
    user = User.get_by_id(user_id=user_id)

    if not user.can_perform_search():
        raise SearchLimitError("Daily search limit reached.")

    ticker = request.json.get("ticker")
    days_ago = request.json.get("days_ago")

    if not (isinstance(days_ago, int) and days_ago > 0):
        return InvalidRequestError("days_ago must be a valid positive integer.")

    company = Company.get_by_ticker(ticker=ticker)

    search = user.create_search(ticker=company.ticker, days_ago=days_ago)

    json_output = {
        "search_id": search.id,
        "company_name": search.company_name,
        "ticker": search.ticker,
        "href": f"/search/{search.id}",
        "created_at": search.created_at,
    }

    return json_output, 200


@search_bp.route("/delete/<uuid:search_id>", methods=["DELETE"])
@token_required
def delete_search(search_id: UUID):
    user_id = g.user["sub"]
    user = User.get_by_id(user_id=user_id)

    search = Search.get_by_id(search_id=search_id)

    if not search.check_permission(user.id):
        raise PermissionDeniedError("Unauthorized deletion attempt.")

    try:
        user.delete_search(search_id=search.id)
        return jsonify({"message": f"Search {search_id} successfully deleted."}), 200
    except Exception:
        pass


@search_bp.route("/get_search/<uuid:search_id>", methods=["GET"])
@token_required
def get_search_by_id(search_id: UUID):
    user_id = g.user["sub"]
    user = User.get_by_id(user_id=user_id)

    search = Search.get_by_id(search_id=search_id)
    
    if not search.check_permission(user_id=user.id):
        raise PermissionDeniedError(f"User {user.id} is unauthorized to view search {search.id}")
    
    company = Company.get_by_ticker(ticker=search.ticker)
    full_search_data = search.to_json()
    full_search_data.update(
        {"exchange": company.exchange, "currency": company.currency}
    )

    return jsonify(full_search_data), 200


@search_bp.route("/search_history", methods=["GET"])
@token_required
def get_search_history():
    user_id = g.user["sub"]
    user = User.get_by_id(user_id=user_id)

    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=30, type=int)

    if limit > 50:
        limit = 50

    paginated_search_history = user.get_search_history(page=page, limit=limit)
    searches = paginated_search_history["searches"]
    has_more = paginated_search_history["has_more"]

    search_content = {
        "label": "Search History",
        "searches": [
            {
                "search_id": search.id,
                "company_name": search.company_name,
                "ticker": search.ticker,
                "href": f"/search/{search.id}",
                "created_at": search.created_at,
            }
            for search in searches
        ],
        "has_more": has_more
    }

    return jsonify(search_content), 200
