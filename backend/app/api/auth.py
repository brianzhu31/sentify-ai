from flask import Blueprint, g
from entities.user import User
from lib.validation import token_required

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
@token_required
def register_user():
    user_data = g.user

    user_id = user_data["sub"]
    email = user_data["email"]

    user = User(user_id=user_id, email=email)
    user.register()

    return {"message": "User created."}, 201
