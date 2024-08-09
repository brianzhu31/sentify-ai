from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, JSON, ARRAY

db = SQLAlchemy()


class User(db.Model):
    id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    email = Column(String(254), unique=True, nullable=False)
    search_ids = Column(ARRAY(Integer), nullable=True)


class Search(db.Model):
    id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    company_name = Column(String(80), nullable=False)
    ticker = Column(String(6), nullable=False)
    positive_summaries = Column(ARRAY(JSON), nullable=False)
    negative_summaries = Column(ARRAY(JSON), nullable=False)
    top_sources = Column(ARRAY(JSON), nullable=False)
    score = Column(Integer, nullable=False)
