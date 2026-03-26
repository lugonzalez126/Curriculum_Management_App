from typing import Optional
import uuid
from datetime import datetime
from pydantic import BaseModel
from app.schemas.lesson import LessonSummary


class ModuleCreate(BaseModel):
    title: str


class ModuleUpdate(BaseModel):
    title: Optional[str] = None
    is_published: Optional[bool] = None


class ModuleResponse(BaseModel):
    id: uuid.UUID
    curriculum_id: uuid.UUID
    title: str
    is_published: bool
    order: float
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class ModuleWithLessons(BaseModel):
    id: uuid.UUID
    curriculum_id: uuid.UUID
    title: str
    is_published: bool
    order: float
    lessons: list[LessonSummary] = []
    model_config = {"from_attributes": True}