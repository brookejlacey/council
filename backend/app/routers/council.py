import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..config import get_settings
from ..database import get_db
from ..models import Session, Message
from ..schemas import SessionCreate, SessionResponse, AdvisorInfo
from ..advisors.personas import ADVISORS
from ..engine.orchestrator import CouncilOrchestrator

router = APIRouter(prefix="/api/council", tags=["council"])


@router.get("/advisors", response_model=list[AdvisorInfo])
async def list_advisors():
    """List all available advisors."""
    return [
        AdvisorInfo(
            id=a["id"],
            name=a["name"],
            role=a["role"],
            personality=a["personality"],
            emoji=a["emoji"],
            color=a["color"],
        )
        for a in ADVISORS.values()
    ]


@router.post("/sessions", response_model=SessionResponse)
async def create_session(
    req: SessionCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new council session."""
    session = Session(title=req.title, user_context=req.user_context or {})
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.get("/sessions", response_model=list[SessionResponse])
async def list_sessions(db: AsyncSession = Depends(get_db)):
    """List all sessions."""
    result = await db.execute(select(Session).order_by(Session.updated_at.desc()))
    return result.scalars().all()


@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific session."""
    session = await db.get(Session, session_id)
    if not session:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.get("/sessions/{session_id}/messages")
async def get_messages(session_id: str, db: AsyncSession = Depends(get_db)):
    """Get all messages for a session."""
    result = await db.execute(
        select(Message)
        .where(Message.session_id == session_id)
        .order_by(Message.created_at)
    )
    messages = result.scalars().all()
    return [
        {
            "id": m.id,
            "role": m.role,
            "advisor_id": m.advisor_id,
            "content": m.content,
            "phase": m.phase,
            "metadata": m.metadata_,
            "created_at": m.created_at.isoformat(),
            "turn": m.turn,
        }
        for m in messages
    ]


@router.websocket("/ws/{session_id}")
async def council_websocket(
    websocket: WebSocket,
    session_id: str,
):
    """WebSocket endpoint for real-time council deliberation."""
    await websocket.accept()

    orchestrator = CouncilOrchestrator()

    try:
        while True:
            # Wait for user message
            data = await websocket.receive_text()
            payload = json.loads(data)
            user_message = payload.get("message", "")

            if not user_message:
                await websocket.send_json({"type": "error", "content": "Empty message"})
                continue

            # Get session context from DB
            from ..database import async_session as session_factory

            async with session_factory() as db:
                session = await db.get(Session, session_id)
                user_context = session.user_context if session else {}

                # Save user message
                user_msg = Message(
                    session_id=session_id,
                    role="user",
                    content=user_message,
                )
                db.add(user_msg)
                await db.commit()

                # Get conversation history
                result = await db.execute(
                    select(Message)
                    .where(Message.session_id == session_id)
                    .order_by(Message.created_at)
                )
                history = [
                    {
                        "role": m.role,
                        "advisor_name": ADVISORS.get(m.advisor_id, {}).get("name", "User")
                        if m.advisor_id
                        else "User",
                        "content": m.content,
                    }
                    for m in result.scalars().all()
                ]

            # Run deliberation and stream events
            async with session_factory() as db:
                async for event in orchestrator.deliberate(
                    user_message, user_context, history
                ):
                    await websocket.send_json(event)

                    # Save advisor messages to DB
                    if event["type"] in ("perspective", "debate", "synthesis"):
                        msg = Message(
                            session_id=session_id,
                            role="advisor" if event["type"] != "synthesis" else "synthesis",
                            advisor_id=event.get("advisor_id"),
                            content=event["content"],
                            phase=event.get("phase"),
                            turn=event.get("turn", 0),
                        )
                        db.add(msg)

                await db.commit()

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "content": str(e)})
        except Exception:
            pass
