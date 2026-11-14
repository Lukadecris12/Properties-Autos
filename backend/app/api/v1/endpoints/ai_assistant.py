from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.config import settings
from app.core.dependencies import get_optional_current_user
from app.models.user import User
from app.schemas.common import ResponseModel
from app.services.ai_service import AIService

router = APIRouter()

@router.get("/status", response_model=ResponseModel[dict])
async def ai_status():
    return ResponseModel(data={
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "gemini_model": settings.GEMINI_MODEL,
        "last_error": AIService.last_error,
    })

class ChatMessage(BaseModel):
    role: str
    text: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = None
    context: Optional[dict] = None

class EnhanceListingRequest(BaseModel):
    title: str
    category: str
    transaction_type: str
    features: Dict[str, Any]

class AnalyzeDocumentRequest(BaseModel):
    document_type: str
    filename: str

@router.post("/chat", response_model=ResponseModel[dict])
async def ai_chat_concierge(
    req: ChatRequest,
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    user_context = {"user_id": current_user.id, "active_mode": current_user.active_mode} if current_user else {}
    if req.context:
        user_context.update(req.context)
    history = [{"role": m.role, "text": m.text} for m in req.history] if req.history else None
    response = AIService.answer_concierge_query(
        req.message,
        user_context=user_context or None,
        history=history,
    )
    return ResponseModel(data=response)

@router.post("/enhance-listing", response_model=ResponseModel[dict])
async def enhance_listing_content(req: EnhanceListingRequest):
    result = AIService.enhance_listing(
        title=req.title,
        category=req.category,
        transaction_type=req.transaction_type,
        features=req.features
    )
    return ResponseModel(data=result)

@router.post("/analyze-document", response_model=ResponseModel[dict])
async def analyze_document_content(req: AnalyzeDocumentRequest):
    result = AIService.analyze_document_text(
        document_type=req.document_type,
        filename=req.filename
    )
    return ResponseModel(data=result)
