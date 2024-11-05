import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from models import db
import logging
from logging.handlers import RotatingFileHandler

if os.getenv("FLASK_ENV") == "production":
    load_dotenv(".env.production")
elif os.getenv("FLASK_ENV") == "development":
    load_dotenv(".env.local")

SUPABASE_URI = os.getenv("SUPABASE_URI")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = f"{SUPABASE_URI}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SCHEDULER_API_ENABLED"] = True
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_pre_ping": True,
    "pool_recycle": 3600,
    "connect_args": {
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
    },
}


logger = logging.getLogger("flask_app_logger")
logger.setLevel(logging.DEBUG)

env = os.getenv("FLASK_ENV", "development")

if env == "production":
    if not os.path.exists("logs"):
        os.mkdir("logs")
    file_handler = RotatingFileHandler("logs/app.log", maxBytes=10240, backupCount=10)
    file_handler.setLevel(logging.ERROR)
    file_handler.setFormatter(logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s [in %(pathname)s:%(lineno)d]"
    ))
    logger.addHandler(file_handler)
else:
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG)
    console_handler.setFormatter(logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    ))
    logger.addHandler(console_handler)


db.init_app(app)
