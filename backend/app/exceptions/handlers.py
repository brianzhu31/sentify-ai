from flask import jsonify, Blueprint
from config import app
from app.exceptions.errors import *

errors_bp = Blueprint("errors", __name__)

@app.errorhandler(ExternalAPIError)
def handle_api_error(e):
    return jsonify({"message": str(e)}), 502

@app.errorhandler(InsufficientArticlesError)
def handle_insufficient_articles_error(e):
    return jsonify({"message": str(e)}), 422

@app.errorhandler(ExternalAPITimeoutError)
def handle_insufficient_articles_error(e):
    return jsonify({"message": str(e)}), 408
