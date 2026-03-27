from typing import Optional
import uuid
from datetime import datetime
from pydantic import BaseModel
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
    title: str
    description: str
    cover_image_url: str
    is_published: bool
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class CurriculumDetail(BaseModel):
    id: uuid.UUID
    creator_id: uuid.UUID
    title: str
    description: str
    is_published: bool
    created_at: datetime
    updated_at: datetime
    modules: list[ModuleWithLessons] = []
    model_config = {"from_attributes": True}