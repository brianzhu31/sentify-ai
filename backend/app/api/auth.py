from flask import jsonify, request, Blueprint
from config import supabase
from models import db, User
from gotrue.errors import AuthApiError

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register_user():
    email = request.json.get("email")
    password = request.json.get("password")
    
    if not email or not password:
        return {"error": "Email and password are required."}, 400

    response = supabase.auth.sign_up(credentials={"email": email, "password": password})

    user_data = response.user

    new_user = User(
        id=user_data.id,
        email=user_data.email,
        created_at=user_data.created_at
    )

    try:
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400

    return {"message": "User created."}, 201


@auth_bp.route("/sign_in", methods=["POST"])
def sign_in_user():
    email = request.json.get("email")
    password = request.json.get("password")

    if not email or not password:
        return {"error": "Email and password are required."}, 400

    try:
        response = supabase.auth.sign_in_with_password({"email": email, "password": password})
    except AuthApiError as e:
        return jsonify({"error": str(e)}), 401

    return {
        "message": "User signed in.",
        "access_token": response.session.access_token,
        "refresh_token": response.session.refresh_token,
    }, 201


@auth_bp.route("/sign_out", methods=["POST"])
def sign_out_user():
    response = supabase.auth.sign_out()

    return {}, 200
