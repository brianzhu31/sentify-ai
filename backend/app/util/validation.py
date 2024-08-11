import os
import jwt
from dotenv import load_dotenv
from functools import wraps
from flask import request, jsonify, g

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")

def verify_jwt(token: str) -> dict:
    try:
        decoded_token = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )

        if decoded_token["role"] != "authenticated":
            return None

        return decoded_token

    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        decoded_token = verify_jwt(token)
        if not decoded_token:
            return jsonify({'message': 'Token is invalid or expired!'}), 401

        g.user = decoded_token

        return f(*args, **kwargs)

    return decorated
