from typing import Optional, Any
import uuid
from datetime import datetime
from pydantic import BaseModel, model_validator
from app.schemas.lesson import LessonSummary
from app.schemas.module import ModuleWithLessons


class CurriculumCreate(BaseModel):
    title: str
    description: str
    cover_image_url: Optional[str] = None


class CurriculumUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_published: Optional[bool] = None
    cover_image_url: Optional[str] = None


class CurriculumResponse(BaseModel):
    id: uuid.UUID
    creator_id: uuid.UUID
    creator_username: str = ""
    title: str
    description: str
    cover_image_url: Optional[str] = None
    creator_avatar_url: Optional[str] = None
    is_published: bool
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}



class CurriculumDetail(BaseModel):
    id: uuid.UUID
    creator_id: uuid.UUID
    creator_username: str
    title: str
    description: str
    cover_image_url: Optional[str] = None
    creator_avatar_url: Optional[str] = None
    is_published: bool
    created_at: datetime
    updated_at: datetime
    modules: list[ModuleWithLessons] = []
    model_config = {"from_attributes": True}



class CreatorPublicPage(BaseModel):
    creator_username: str
    creator_avatar_url: Optional[str] = None
    curricula: list[CurriculumResponse] = []

class PaginatedCurriculumResponse(BaseModel):
    items: list[CurriculumResponse]
    total: int
    skip: int
    limit: int