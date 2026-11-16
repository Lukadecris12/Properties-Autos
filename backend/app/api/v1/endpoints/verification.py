import asyncio
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from app.core.database import get_db, utc_now
from app.core.dependencies import get_current_user, require_admin
from app.models.user import User, VerificationDocument
from app.models.enums import VerificationStatus
from app.schemas.user import VerificationDocumentCreate, VerificationDocumentResponse
from app.schemas.common import ResponseModel
from app.services.ai_service import AIService

router = APIRouter()

IDENTITY_DOC_TYPES = {"NATIONAL_ID", "PASSPORT", "DRIVERS_LICENSE"}
BUSINESS_DOC_TYPES = {"CAC_CERTIFICATE", "TAX_CLEARANCE", "BUSINESS_REG"}

@router.post("/documents", response_model=ResponseModel[VerificationDocumentResponse], status_code=status.HTTP_201_CREATED)
async def upload_verification_document(
    doc_in: VerificationDocumentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    doc_type = doc_in.document_type.strip().upper()
    if doc_type not in IDENTITY_DOC_TYPES and doc_type not in BUSINESS_DOC_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported document type. Use NATIONAL_ID, PASSPORT, DRIVERS_LICENSE, CAC_CERTIFICATE, TAX_CLEARANCE, or BUSINESS_REG."
        )

    # Run autonomous AI KYC verification
    ai_verdict = await asyncio.to_thread(
        AIService.verify_kyc_document,
        document_type=doc_type,
        document_number=doc_in.document_number,
        file_url=doc_in.file_url,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        company_name=current_user.company_name,
        is_email_verified=bool(current_user.is_email_verified),
    )

    decision = ai_verdict.get("decision", "PENDING")
    reason = ai_verdict.get("reason", "")

    if decision == "APPROVED":
        doc_status = VerificationStatus.APPROVED
        if doc_type in IDENTITY_DOC_TYPES:
            current_user.is_identity_verified = True
        elif doc_type in BUSINESS_DOC_TYPES:
            current_user.is_business_verified = True

        if current_user.is_identity_verified and current_user.is_business_verified:
            current_user.verification_badge = "Fully Verified"
        elif current_user.is_business_verified:
            current_user.verification_badge = "Business Verified"
        else:
            current_user.verification_badge = "Identity Verified"
        response_msg = f"AI Verified: {reason}"
    elif decision == "REJECTED":
        doc_status = VerificationStatus.REJECTED
        response_msg = f"Verification Rejected: {reason}"
    else:
        doc_status = VerificationStatus.PENDING
        response_msg = reason or "Verification document queued."

    doc = VerificationDocument(
        user_id=current_user.id,
        document_type=doc_type,
        document_number=doc_in.document_number,
        file_url=doc_in.file_url,
        status=doc_status,
        reviewer_notes=reason,
        reviewed_at=utc_now() if doc_status != VerificationStatus.PENDING else None,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return ResponseModel(message=response_msg, data=doc)

@router.get("/my-documents", response_model=ResponseModel[List[VerificationDocumentResponse]])
async def get_my_verification_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(VerificationDocument).where(VerificationDocument.user_id == current_user.id).order_by(desc(VerificationDocument.created_at))
    res = await db.execute(stmt)
    return ResponseModel(data=res.scalars().all())

@router.get("/admin/pending", response_model=ResponseModel[List[VerificationDocumentResponse]])
async def get_pending_documents(
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(VerificationDocument).where(VerificationDocument.status == VerificationStatus.PENDING).order_by(VerificationDocument.created_at.asc())
    res = await db.execute(stmt)
    return ResponseModel(data=res.scalars().all())

@router.put("/admin/review/{doc_id}", response_model=ResponseModel[VerificationDocumentResponse])
async def review_document(
    doc_id: int,
    status: VerificationStatus,
    reviewer_notes: Optional[str] = None,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(VerificationDocument).where(VerificationDocument.id == doc_id)
    res = await db.execute(stmt)
    doc = res.scalars().first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    doc.status = status
    doc.reviewer_notes = reviewer_notes
    doc.reviewed_by = admin_user.id
    doc.reviewed_at = utc_now()

    # If approved, update user's verification badge and flags
    if status == VerificationStatus.APPROVED:
        user_stmt = select(User).where(User.id == doc.user_id)
        u_res = await db.execute(user_stmt)
        user = u_res.scalars().first()
        if user:
            if doc.document_type in ["NATIONAL_ID", "PASSPORT", "DRIVERS_LICENSE"]:
                user.is_identity_verified = True
                user.verification_badge = "Identity Verified"
            elif doc.document_type in ["CAC_CERTIFICATE", "TAX_CLEARANCE", "BUSINESS_REG"]:
                user.is_business_verified = True
                user.verification_badge = "Business Verified"

    await db.commit()
    await db.refresh(doc)
    return ResponseModel(message=f"Document reviewed: {status.value}", data=doc)
