from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, BigInteger, String, Float, UUID, JSON, ARRAY, DateTime, UniqueConstraint
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy.dialects.postgresql import ARRAY
from pgvector.sqlalchemy import Vector
import uuid

db = SQLAlchemy()


class User(db.Model):
    id = Column(UUID(as_uuid=True), primary_key=True, nullable=False)
    email = Column(String(254), unique=True, nullable=False)
    plan = Column(String(20), nullable=False, default="Basic")
    search_ids = Column(MutableList.as_mutable(ARRAY(UUID(as_uuid=True))), nullable=True, default=list)
    daily_search_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class Search(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_name = Column(String(80), nullable=False)
    ticker = Column(String(6), nullable=False)
    overall_summary = Column(String, nullable=True)
    positive_summaries = Column(ARRAY(JSON), nullable=False)
    negative_summaries = Column(ARRAY(JSON), nullable=False)
    sources = Column(ARRAY(JSON), nullable=False)
    score = Column(Float, nullable=False)
    days_range = Column(Integer, nullable=False)
    created_by = Column(UUID(as_uuid=True), nullable=False)
    data_from = Column(DateTime, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class Article(db.Model):
    id = Column(BigInteger, primary_key=True, nullable=False, autoincrement=True)
    ticker = Column(String(6), nullable=False)
    title =  Column(String, nullable=False)
    media = Column(String, nullable=True)
    published_date = Column(DateTime, nullable=True)
    url = Column(String, nullable=True)
    clean_url = Column(String, nullable=True)
    compressed_summary = Column(String, nullable=False)
    sentiment = Column(String(15), nullable=False)
    impact = Column(String(15), nullable=False)

    __table_args__ = (
        UniqueConstraint('ticker', 'title', name='uix_ticker_title'),
    )


class Company(db.Model):
    id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    company_name = Column(String(80), nullable=False)
    ticker = Column(String(6), unique=True, nullable=False)
    aliases = Column(ARRAY(String(80)), nullable=False)
    exchange = Column(String(10), nullable=False)
    currency = Column(String(10), nullable=False)
