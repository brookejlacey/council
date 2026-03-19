from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SessionCreate(BaseModel):
    title: Optional[str] = "New Session"
    user_context: Optional[dict] = {}


class SessionResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    user_context: dict

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    advisor_id: Optional[str] = None
    content: str
    phase: Optional[str] = None
    metadata_: Optional[dict] = {}
    created_at: datetime
    turn: int

    class Config:
        from_attributes = True


class CouncilRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class AdvisorInfo(BaseModel):
    id: str
    name: str
    role: str
    personality: str
    emoji: str
    color: str


class DebateEvent(BaseModel):
    type: str  # "routing", "perspective", "debate", "synthesis", "complete", "error"
    advisor_id: Optional[str] = None
    advisor_name: Optional[str] = None
    content: str
    phase: Optional[str] = None
    turn: Optional[int] = None
    metadata: Optional[dict] = {}
