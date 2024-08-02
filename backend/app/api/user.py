from flask import request, jsonify
from config import db, app


@app.route("/users", methods=["GET"])
def get_users():
    return {}
