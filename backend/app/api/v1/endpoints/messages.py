from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import or_, and_, desc

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.booking import Conversation, Message
from app.schemas.message import MessageCreate, MessageResponse, ConversationResponse
from app.schemas.common import ResponseModel

router = APIRouter()

@router.post("/send", response_model=ResponseModel[MessageResponse])
async def send_message(
    msg_in: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    conversation_id = msg_in.conversation_id
    
    # If no conversation_id, find or create one with recipient
    if not conversation_id:
        if not msg_in.recipient_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Must provide either conversation_id or recipient_id"
            )
        
        # Check if conversation already exists between these 2 users
        stmt = select(Conversation).where(
            or_(
                and_(Conversation.participant_1_id == current_user.id, Conversation.participant_2_id == msg_in.recipient_id),
                and_(Conversation.participant_1_id == msg_in.recipient_id, Conversation.participant_2_id == current_user.id)
            )
        )
        if msg_in.listing_id:
            stmt = stmt.where(Conversation.listing_id == msg_in.listing_id)

        res = await db.execute(stmt)
        conv = res.scalars().first()

        if not conv:
            conv = Conversation(
                participant_1_id=current_user.id,
                participant_2_id=msg_in.recipient_id,
                listing_id=msg_in.listing_id,
                subject=f"Inquiry on Listing #{msg_in.listing_id}" if msg_in.listing_id else "Marketplace Conversation"
            )
            db.add(conv)
            await db.commit()
            await db.refresh(conv)
        
        conversation_id = conv.id

    # Verify user is a participant
    conv_stmt = select(Conversation).where(Conversation.id == conversation_id)
    c_res = await db.execute(conv_stmt)
    conv = c_res.scalars().first()
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    
    if current_user.id not in [conv.participant_1_id, conv.participant_2_id] and not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized in this conversation")

    # Add message
    msg = Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        content=msg_in.content,
        attachment_url=msg_in.attachment_url,
        is_read=False
    )
    db.add(msg)

    # Update conversation last_message_at
    conv.last_message_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(msg)

    return ResponseModel(message="Message sent", data=msg)

@router.get("/conversations", response_model=ResponseModel[List[ConversationResponse]])
async def get_my_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Conversation)
        .where(
            or_(
                Conversation.participant_1_id == current_user.id,
                Conversation.participant_2_id == current_user.id
            )
        )
        .options(selectinload(Conversation.messages))
        .order_by(desc(Conversation.last_message_at))
    )
    res = await db.execute(stmt)
    return ResponseModel(data=res.scalars().all())

@router.get("/conversations/{conversation_id}/messages", response_model=ResponseModel[List[MessageResponse]])
async def get_conversation_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    conv_stmt = select(Conversation).where(Conversation.id == conversation_id)
    c_res = await db.execute(conv_stmt)
    conv = c_res.scalars().first()
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    if current_user.id not in [conv.participant_1_id, conv.participant_2_id] and not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    stmt = select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at.asc())
    res = await db.execute(stmt)
    messages = res.scalars().all()

    # Mark unread messages as read
    for m in messages:
        if m.sender_id != current_user.id and not m.is_read:
            m.is_read = True
    await db.commit()

    return ResponseModel(data=messages)
