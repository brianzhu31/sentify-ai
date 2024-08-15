import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from models import db
from supabase import create_client, Client

load_dotenv(".env.local")

SUPABASE_URI = os.getenv("SUPABASE_URI")
url = os.getenv("PUBLIC_SUPABASE_URL")
key = os.getenv("PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = f"{SUPABASE_URI}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
