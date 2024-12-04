import os
import jwt
from functools import wraps
from flask import request, jsonify, g
import time

JWT_SECRET = os.getenv("JWT_SECRET")
PUBLIC_SUPABASE_URL = os.getenv("PUBLIC_SUPABASE_URL")
SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


def verify_jwt(token: str) -> dict:
    try:
        decoded_token = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
            options={"verify_iat": False},
        )

        iss = decoded_token["iss"]
        role = decoded_token["role"]
        exp = decoded_token["exp"]

        if (
            iss.startswith(PUBLIC_SUPABASE_URL)
            and role == "authenticated"
            and time.time() < exp
        ):
            return decoded_token
        else:
            return None

    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if "Authorization" in request.headers:
            token = request.headers["Authorization"].split(" ")[1]

        if not token:
            return jsonify({"message": "Token is missing!"}), 401

        decoded_token = verify_jwt(token)
        if not decoded_token:
            return jsonify({"message": "Invalid or outdated sesion. Please refresh the page."}), 401

        g.user = decoded_token

        return f(*args, **kwargs)

    return decorated


def service_role_key_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authorization token is missing or invalid"}), 401
        
        token = auth_header.split("Bearer ")[1]
        
        if token != SERVICE_ROLE_KEY:
            return jsonify({"error": "Invalid authorization token"}), 403

        return f(*args, **kwargs)
    
    return wrapper
