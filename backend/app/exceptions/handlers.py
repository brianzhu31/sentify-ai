from flask import jsonify, Blueprint
from app.exceptions.errors import *

errors_bp = Blueprint("errors", __name__)

@errors_bp.app_errorhandler(ExternalAPIError)
def handle_api_error(e):
    return jsonify({"message": str(e)}), 502

@errors_bp.app_errorhandler(InsufficientArticlesError)
def handle_insufficient_articles_error(e):
    return jsonify({"message": str(e)}), 422

@errors_bp.app_errorhandler(ExternalAPITimeoutError)
def handle_external_api_timeout_error(e):
    return jsonify({"message": str(e)}), 408

@errors_bp.app_errorhandler(NotFoundError)
def handle_not_found_error(e):
    return jsonify({"message": str(e)}), 404

@errors_bp.app_errorhandler(InvalidRequestError)
def handle_invalid_request_error(e):
    return jsonify({"message": str(e)}), 404

@errors_bp.app_errorhandler(PermissionDeniedError)
def handle_permission_denied_error(e):
    return jsonify({"message": str(e)}), 403

@errors_bp.app_errorhandler(DailyMessageCountExceededError)
def handle_daily_message_count_exceeded_error(e):
    return jsonify({"message": e.message}), 429
