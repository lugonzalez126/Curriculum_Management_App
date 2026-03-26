from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user, get_optional_user
from app.models.user import User
from app.schemas.curriculum import CurriculumCreate, CurriculumUpdate, CurriculumResponse, CurriculumDetail
from typing import Optional
from app.services.curriculum import (
    create_curriculum, get_curriculum, update_curriculum,
    delete_curriculum, list_published_curricula
)
import uuid

router = APIRouter(prefix="/curricula", tags=["curricula"])


@router.get("", response_model=list[CurriculumResponse])
def list_curricula(db: Session = Depends(get_db)):
    return list_published_curricula(db=db)


@router.get("/{curriculum_id}", response_model=CurriculumDetail)
def get_one(curriculum_id: uuid.UUID, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_optional_user)):
    return get_curriculum(db=db, curriculum_id=curriculum_id, current_user=current_user)


@router.post("", response_model=CurriculumResponse)
def create(data: CurriculumCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_curriculum(db=db, creator_id=current_user.id, data=data)


@router.patch("/{curriculum_id}", response_model=CurriculumResponse)
def update(curriculum_id: uuid.UUID, data: CurriculumUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return update_curriculum(db=db, curriculum_id=curriculum_id, data=data, current_user=current_user)


@router.delete("/{curriculum_id}")
def delete(curriculum_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return delete_curriculum(db=db, curriculum_id=curriculum_id, current_user=current_user)