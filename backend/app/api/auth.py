from flask import Blueprint, request
from app.managers.user_manager import UserManager
from app.lib.validation import service_role_key_required

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
@service_role_key_required
def register_user():
    user_id = request.json.get("user_id")
    email = request.json.get("email")
    
    user = UserManager.get_user_by_email(email=email)
    if user is not None:
        return {"message": f"User with email {email} already exists."}, 409

    UserManager.create_user(user_id=user_id, email=email)

    return {"message": "User created."}, 201
