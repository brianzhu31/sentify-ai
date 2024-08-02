from app.config import db
from sqlalchemy import Column, Integer, String, JSON, ARRAY


class User(db.Model):
    id = Column(Integer, primary_key=True)
    email = Column(String(254), unique=True, nullable=False)
    search_ids = Column(ARRAY(Integer), nullable=True)
