from flask import jsonify, Blueprint
from config import app
from exceptions.errors import *

errors_bp = Blueprint("errors", __name__)

@app.errorhandler(ExternalAPIError)
def handle_api_error(e):
    return jsonify({"message": str(e)}), 502

@app.errorhandler(InsufficientArticlesError)
def handle_insufficient_articles_error(e):
    return jsonify({"message": str(e)}), 422

@app.errorhandler(ExternalAPITimeoutError)
def handle_external_api_timeout_error(e):
    return jsonify({"message": str(e)}), 408

@app.errorhandler(NotFoundError)
def handle_not_found_error(e):
    return jsonify({"message": str(e)}), 404

@app.errorhandler(DBCommitError)
def handle_db_commit_error(e):
    return jsonify({"message": str(e)}), 404

@app.errorhandler(SearchLimitError)
def handle_search_limit_error(e):
    return jsonify({"message": str(e)}), 429

@app.errorhandler(InvalidRequestError)
def handle_invalid_request_error(e):
    return jsonify({"message": str(e)}), 404

@app.errorhandler(PermissionDeniedError)
def handle_permission_denied_error(e):
    return jsonify({"message": str(e)}), 403