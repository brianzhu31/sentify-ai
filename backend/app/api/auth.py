from flask import Blueprint, g
from app.managers.user_manager import UserManager
from app.lib.validation import token_required

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
@token_required
def register_user():
    user_data = g.user

    user_id = user_data["sub"]
    email = user_data["email"]

    UserManager.create_user(user_id=user_id, email=email)

    return {"message": "User created."}, 201
