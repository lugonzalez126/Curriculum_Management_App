from typing import Optional
import uuid
from datetime import datetime
from pydantic import BaseModel


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

class LessonSummary(BaseModel):
    id: uuid.UUID
    module_id: uuid.UUID
    title: str
    is_published: bool
    order: float
    model_config = {"from_attributes": True}

