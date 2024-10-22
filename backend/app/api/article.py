from managers.article_manager import ArticleManager
from flask import jsonify, Blueprint, request, Response, g

article_bp = Blueprint("article", __name__)


@article_bp.route("/<string:ticker>", methods=["GET"])
def get_articles_by_ticker(ticker: str):
    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=10, type=int)
    articles = ArticleManager.get_articles_by_ticker_paginated(
        ticker=ticker, time_period=14, page=page, limit=limit)

    if limit > 20:
        limit = 50

    paginated_articles = ArticleManager.get_articles_by_ticker_paginated(
        ticker=ticker, time_period=14, page=page, limit=limit)
    articles = paginated_articles["articles"]
    has_more = paginated_articles["has_more"]

    formatted_articles = {
        "articles": [article.to_json() for article in articles],
        "has_more": has_more
    }

    return jsonify(formatted_articles), 200
