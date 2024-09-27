import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from models import db
from pinecone import Pinecone

load_dotenv(".env.local")

SUPABASE_URI = os.getenv("SUPABASE_URI")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

pc = Pinecone(api_key=PINECONE_API_KEY)

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = f"{SUPABASE_URI}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
