from app.config import db
from sqlalchemy import Column, Integer, String, JSON, ARRAY


class Search(db.Model):
    id = Column(Integer, primary_key=True)
    company_name = Column(String(80), primary_key=True)
    ticker_symbol = Column(String(6), nullable=False)
    postive_summaries = Column(ARRAY(JSON), nullable=False)
    negative_summaries = Column(ARRAY(JSON), nullable=False)
    links = Column(ARRAY(JSON), nullable=False)
    rating = Column(Integer, nullable=False)
