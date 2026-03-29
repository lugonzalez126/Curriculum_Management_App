from typing import Optional
import uuid
from datetime import datetime
from pydantic import BaseModel, field_validator


class LessonCreate(BaseModel):
    title: str
    content: Optional[dict] = None


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[dict] = None
    is_published: Optional[bool] = None


class LessonResponse(BaseModel):
    id: uuid.UUID
    module_id: uuid.UUID
    content: dict = {}
    title: str
    is_published: bool
    order: float
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

    @field_validator('content', mode='before')
    @classmethod
    def content_not_none(cls, v):
        return v if v is not None else {}


class LessonSummary(BaseModel):
    id: uuid.UUID
    module_id: uuid.UUID
    title: str
    is_published: bool
    order: float
    model_config = {"from_attributes": True}