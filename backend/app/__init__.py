import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from app.models import db

if os.getenv("FLASK_ENV") == "production":
    load_dotenv(".env.production")
elif os.getenv("FLASK_ENV") == "development":
    load_dotenv(".env.local")

app = Flask(__name__)
CORS(app)

app.config.from_object('app.config.Config')

db.init_app(app)

from app.api.auth import auth_bp
from app.api.company import company_bp
from app.api.chat import chat_bp
from app.api.article import article_bp
from app.exceptions.handlers import errors_bp

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(company_bp, url_prefix="/api/company")
app.register_blueprint(chat_bp, url_prefix="/api/chat")
app.register_blueprint(article_bp, url_prefix="/api/article")
app.register_blueprint(errors_bp)
