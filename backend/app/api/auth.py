from flask import jsonify, request, Blueprint
from config import supabase
from pprint import pprint

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register_user():
    email = request.json.get("email")
    password = request.json.get("password")

    response = supabase.auth.sign_up(credentials={"email": email, "password": password})
    
    print('response', response)

    return jsonify(response.session.access_token), 201
