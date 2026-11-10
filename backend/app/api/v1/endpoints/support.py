from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.support import SupportTicket
from app.schemas.support import (
    SupportTicketCreate,
    SupportTicketResponse,
    SupportTicketUpdate
)
from app.schemas.common import ResponseModel
from app.api.v1.endpoints.admin import verify_admin

router = APIRouter()

@router.post("", response_model=ResponseModel[SupportTicketResponse], status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/", response_model=ResponseModel[SupportTicketResponse], status_code=status.HTTP_201_CREATED)
async def submit_support_ticket(
    ticket_in: SupportTicketCreate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Submit a contact and support ticket to platform administrators."""
    ticket = SupportTicket(
        user_id=current_user.id if current_user else None,
        full_name=ticket_in.full_name,
        email=ticket_in.email,
        phone_number=ticket_in.phone_number,
        category=ticket_in.category,
        subject=ticket_in.subject,
        message=ticket_in.message,
        status="PENDING"
    )
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)

    return ResponseModel(
        message="Thank you for contacting Properties & Autos. Your inquiry has been routed to our corporate support desk.",
        data=ticket
    )

@router.get("", response_model=ResponseModel[List[SupportTicketResponse]], include_in_schema=False)
@router.get("/", response_model=ResponseModel[List[SupportTicketResponse]])
async def list_support_tickets(
    status: Optional[str] = Query(None, description="Filter by status: PENDING, IN_PROGRESS, RESOLVED"),
    search: Optional[str] = Query(None, description="Search by name, email, or subject"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Admin endpoint to view and manage customer support inquiries."""
    verify_admin(current_user)

    stmt = select(SupportTicket).order_by(SupportTicket.created_at.desc())
    res = await db.execute(stmt)
    tickets = res.scalars().all()

    if status:
        tickets = [t for t in tickets if t.status.upper() == status.upper()]

    if search:
        s = search.lower()
        tickets = [
            t for t in tickets
            if s in t.full_name.lower()
            or s in t.email.lower()
            or s in t.subject.lower()
            or s in t.message.lower()
        ]

    return ResponseModel(data=tickets)

@router.put("/{ticket_id}", response_model=ResponseModel[SupportTicketResponse])
async def update_support_ticket(
    ticket_id: int,
    ticket_update: SupportTicketUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Admin endpoint to update ticket status or write official response notes."""
    verify_admin(current_user)

    stmt = select(SupportTicket).where(SupportTicket.id == ticket_id)
    ticket = (await db.execute(stmt)).scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found")

    if ticket_update.status:
        ticket.status = ticket_update.status.upper()

    if ticket_update.admin_response:
        ticket.admin_response = ticket_update.admin_response
        ticket.responded_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(ticket)

    return ResponseModel(
        message=f"Ticket #{ticket.id} status updated to {ticket.status}.",
        data=ticket
    )
