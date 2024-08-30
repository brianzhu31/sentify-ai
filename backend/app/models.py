from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, UUID, JSON, ARRAY, DateTime
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy.dialects.postgresql import ARRAY
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
    overall_summary = Column(String(1500), nullable=True)
    positive_summaries = Column(ARRAY(JSON), nullable=False)
    negative_summaries = Column(ARRAY(JSON), nullable=False)
    top_sources = Column(ARRAY(JSON), nullable=False)
    score = Column(Integer, nullable=False)
    days_range = Column(Integer, nullable=False)
    created_by = Column(String(80), nullable=False)
    data_from = Column(DateTime, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class Company(db.Model):
    id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    company_name = Column(String(80), nullable=False)
    ticker = Column(String(6), unique=True, nullable=False)
    aliases = Column(ARRAY(String(80)), nullable=False)
    exchange = Column(String(10), nullable=False)
    currency = Column(String(10), nullable=False)
