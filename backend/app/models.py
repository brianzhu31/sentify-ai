from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, ForeignKey, Integer, BigInteger, String, Float, UUID, JSON, ARRAY, DateTime, UniqueConstraint, Table
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import uuid

db = SQLAlchemy()


class User(db.Model):
    id = Column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid.uuid4)
    email = Column(String(254), unique=True, nullable=False)
    plan = Column(String(20), nullable=False, default="Basic")
    chats = relationship("Chat", back_populates="user", cascade="all, delete-orphan")
    daily_message_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class Chat(db.Model):    
    id = Column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False, index=True)
    name = Column(String(80), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    last_accessed = Column(DateTime, nullable=False, default=datetime.utcnow)
    messages = relationship("Message", back_populates="chat", cascade="all, delete-orphan")
    user = relationship("User", back_populates="chats")


class Message(db.Model):    
    id = Column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid.uuid4)
    chat_id = Column(UUID(as_uuid=True), ForeignKey("chat.id"), nullable=False, index=True)
    role = Column(String(10), nullable=False)
    content = Column(String, nullable=False)
    sources = Column(JSONB, nullable=True)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    chat = relationship("Chat", back_populates="messages")


class CompanyAnalytics(db.Model):
    __tablename__ = "company_analytics"
 
    id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    company_name = Column(String(80), nullable=False)
    ticker = Column(String(6), unique=True, nullable=False)
    summary_sections = Column(ARRAY(JSON), nullable=True)
    score = Column(Float, nullable=True)
    stock_price = Column(Float, nullable=True)
    time_series = Column(JSONB, nullable=True)
    stock_price_last_updated = Column(DateTime, nullable=True)
    time_series_last_updated = Column(DateTime, nullable=True)
    analytics_last_updated = Column(DateTime, nullable=True)


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
        UniqueConstraint("ticker", "title", name="uix_ticker_title"),
    )


class Company(db.Model):
    id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    company_name = Column(String(80), nullable=False)
    ticker = Column(String(6), unique=True, nullable=False)
    aliases = Column(ARRAY(String(80)), nullable=False)
    exchange = Column(String(10), nullable=False)
    currency = Column(String(10), nullable=False)
