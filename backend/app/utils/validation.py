import os
import jwt
from dotenv import load_dotenv
from functools import wraps
from flask import request, jsonify, g
import time

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
NEXT_PUBLIC_SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")


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
            iss.startswith(NEXT_PUBLIC_SUPABASE_URL)
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
            return jsonify({"message": "Token is invalid or expired!"}), 401

        g.user = decoded_token

        return f(*args, **kwargs)

    return decorated
