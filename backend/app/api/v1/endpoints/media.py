import os
import uuid
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter()

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
    "image/heic",
    "image/heif"
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB per image

class UploadedImageResponse(BaseModel):
    url: str
    filename: str
    original_name: str
    size: int

class MultiUploadResponse(BaseModel):
    images: List[UploadedImageResponse]
    message: str

@router.post("/upload", response_model=MultiUploadResponse)
async def upload_images(
    files: List[UploadFile] = File(...)
):
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files provided for upload."
        )

    if len(files) > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can upload at most 5 pictures at once."
        )

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    uploaded = []

    for file in files:
        content_type = file.content_type or ""
        ext = os.path.splitext(file.filename or "")[1].lower()
        if not ext and content_type:
            ext_map = {
                "image/jpeg": ".jpg",
                "image/png": ".png",
                "image/webp": ".webp",
                "image/gif": ".gif",
                "image/avif": ".avif"
            }
            ext = ext_map.get(content_type, ".jpg")

        if ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".heic", ".heif"] and not content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format: {file.filename}. Only images (JPEG, PNG, WebP, GIF, AVIF) are accepted."
            )

        unique_name = f"{uuid.uuid4().hex}{ext or '.jpg'}"
        dest_path = os.path.join(settings.UPLOAD_DIR, unique_name)

        size = 0
        with open(dest_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):  # 1MB chunks
                size += len(chunk)
                if size > MAX_FILE_SIZE:
                    buffer.close()
                    if os.path.exists(dest_path):
                        os.remove(dest_path)
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"File {file.filename} exceeds maximum size limit of 10MB."
                    )
                buffer.write(chunk)

        file_url = f"/uploads/{unique_name}"
        uploaded.append(
            UploadedImageResponse(
                url=file_url,
                filename=unique_name,
                original_name=file.filename or unique_name,
                size=size
            )
        )

    return MultiUploadResponse(
        images=uploaded,
        message=f"Successfully uploaded {len(uploaded)} image(s)."
    )
