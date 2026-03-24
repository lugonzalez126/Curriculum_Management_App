from typing import Optional
import uuid
from datetime import datetime
from pydantic import BaseModel

class CurriculumCreate(BaseModel):
    title: str
    description: str

class CurriculumUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_published: Optional[bool] = None


class CurriculumResponse(BaseModel):
    id: uuid.UUID
    creator_id: uuid.UUID
    title: str
    description: str
    is_published: bool
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}