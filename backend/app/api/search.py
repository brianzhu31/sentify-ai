from flask import jsonify, request, Blueprint, g
from models import db, SearchModel, UserModel, CompanyModel
from entities.article import Article, ArticleCollection
from lib.news import get_news
from lib.validation import token_required
from uuid import UUID
from datetime import datetime, timedelta

search_bp = Blueprint("search", __name__)


@search_bp.route("/search_company", methods=["POST"])
@token_required
def search_company():
    user_id = g.user["sub"]
    user = UserModel.query.get(user_id)

    if user is None:
        return jsonify({"message": "User not found."}), 404

    if user.plan == "Basic" and user.daily_search_count >= 10:
        return jsonify({"message": "Daily search limit reached."}), 429

    ticker = request.json.get("ticker")
    days_ago = request.json.get("days_ago")

    company = CompanyModel.query.filter_by(ticker=ticker).one_or_none()

    if company:
        company_name = company.company_name

        article_collection = ArticleCollection(
            ticker=ticker, days_ago=days_ago)

        created_at = datetime.utcnow()
        data_from = created_at - timedelta(days=days_ago)

        analysis_data = article_collection.full_analysis()

        new_search = SearchModel(
            company_name=company_name,
            ticker=ticker,
            overall_summary=analysis_data.get("overall_summary", ""),
            positive_summaries=analysis_data.get("positive", []),
            negative_summaries=analysis_data.get("negative", []),
            sources=analysis_data.get("sources", []),
            score=analysis_data.get("score", 0),
            days_range=days_ago,
            created_by=user_id,
            data_from=data_from,
            created_at=created_at
        )

    else:
        return jsonify({"message": f"No company found with ticker {ticker}"})

    try:
        db.session.add(new_search)
        db.session.commit()
        user.search_ids.append(new_search.id)
        user.daily_search_count += 1
        db.session.commit()

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 400

    json_output = {
        "search_id": new_search.id,
        "company_name": new_search.company_name,
        "ticker": new_search.ticker,
        "href": f"/search/{new_search.id}",
        "created_at": new_search.created_at,
    }

    return json_output, 200


@search_bp.route("/delete/<uuid:search_id>", methods=["DELETE"])
@token_required
def delete_search(search_id: UUID):
    user_id = g.user["sub"]
    user = UserModel.query.get(user_id)
    if user is None:
        return jsonify({"message": "User not found."}), 404

    search = SearchModel.query.get(search_id)
    if search is None:
        return jsonify({"message": f"Search {search_id} not found."}), 404

    if search.created_by != user_id:
        return jsonify({"message": "Unauthorized deletion attempt."}), 403

    try:
        SearchModel.query.filter_by(id=search_id).delete()
        user.search_ids.remove(search_id)
        db.session.commit()

        return jsonify({"message": f"Search {search_id} successfully deleted."}), 200

    except Exception:
        db.session.rollback()
        return jsonify({"message": f"An error occurred with deleting search {search_id}."}), 400


@search_bp.route("/get_search/<uuid:search_id>", methods=["GET"])
@token_required
def get_search_by_id(search_id: UUID):
    search = SearchModel.query.get(search_id)
    if search is None:
        return jsonify({"message": f"Search {search_id} not found."}), 404

    company = CompanyModel.query.filter_by(ticker=search.ticker).one_or_none()
    if company is None:
        return jsonify({"message": "Company not found."}), 404

    search_data = {
        "id": search.id,
        "company_name": search.company_name,
        "ticker": search.ticker,
        "exchange": company.exchange,
        "currency": company.currency,
        "days_range": search.days_range,
        "created_by": search.created_by,
        "data_from": search.data_from,
        "created_at": search.created_at,
        "analysis_data": {
            "overall_summary": search.overall_summary,
            "positive_summaries": search.positive_summaries,
            "negative_summaries": search.negative_summaries,
            "sources": search.sources,
            "score": search.score
        }
    }

    return jsonify(search_data), 200


@search_bp.route("/search_history", methods=["GET"])
@token_required
def get_search_history():
    user_id = g.user["sub"]
    user = UserModel.query.get(user_id)
    if user is None:
        return jsonify({"message": "User not found."}), 404

    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=30, type=int)

    if limit > 50:
        limit = 50

    searches_query = (
        SearchModel.query.filter(SearchModel.id.in_(user.search_ids))
        .order_by(SearchModel.created_at.desc())
        .paginate(page=page, per_page=limit)
    )

    searches = searches_query.items

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
        "has_more": searches_query.has_next,
    }

    return jsonify(search_content), 200
