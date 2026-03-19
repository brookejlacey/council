import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, JSON, ForeignKey, Integer
from sqlalchemy.orm import relationship
from .database import Base


def utcnow():
    return datetime.now(timezone.utc)


def new_id():
    return str(uuid.uuid4())


class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, default=new_id)
    title = Column(String, default="New Session")
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
    user_context = Column(JSON, default=dict)
    messages = relationship("Message", back_populates="session", order_by="Message.created_at")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=new_id)
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False)
    role = Column(String, nullable=False)  # "user", "advisor", "synthesis", "system"
    advisor_id = Column(String, nullable=True)  # which advisor spoke
    content = Column(Text, nullable=False)
    phase = Column(String, nullable=True)  # "perspective", "debate", "synthesis"
    metadata_ = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime, default=utcnow)
    turn = Column(Integer, default=0)

    session = relationship("Session", back_populates="messages")


class UserMemory(Base):
    __tablename__ = "user_memory"

    id = Column(String, primary_key=True, default=new_id)
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False)
    key = Column(String, nullable=False)
    value = Column(Text, nullable=False)
    source_advisor = Column(String, nullable=True)
    created_at = Column(DateTime, default=utcnow)
