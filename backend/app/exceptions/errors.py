from config import app
from flask import jsonify

class InsufficientArticlesError(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)
        
@app.errorhandler(InsufficientArticlesError)
def handle_insufficient_articles_error(e):
    return jsonify({"message": str(e)}), 400