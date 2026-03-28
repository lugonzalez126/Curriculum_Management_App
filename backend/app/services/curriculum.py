import uuid
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.models.curriculum import Curriculum
from app.models.user import User
from app.models.module import Module
from typing import Optional
from app.schemas.curriculum import CurriculumCreate, CurriculumUpdate


def create_curriculum(db: Session, creator_id: uuid.UUID, data: CurriculumCreate) -> Curriculum:
    curriculum = Curriculum(
        creator_id=creator_id,
        title=data.title,
        description=data.description,
        cover_image_url=data.cover_image_url,
    )
    db.add(curriculum)
    db.commit()
    db.refresh(curriculum)
    return curriculum


def get_curriculum(db: Session, curriculum_id: uuid.UUID, current_user: Optional[User]) -> Curriculum:
    curriculum = (
        db.query(Curriculum)
        .options(
            joinedload(Curriculum.creator),
            joinedload(Curriculum.modules).joinedload(Module.lessons)
        )
        .filter(Curriculum.id == curriculum_id)
        .first()
    )

    if not curriculum:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Curriculum not found")

    if current_user and curriculum.creator_id == current_user.id:
        return curriculum

    if not curriculum.is_published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Curriculum not found")

    return curriculum


def update_curriculum(db: Session, curriculum_id: uuid.UUID, data: CurriculumUpdate, current_user: User) -> Curriculum:
    curriculum = db.query(Curriculum).filter(Curriculum.id == curriculum_id).first()

    if not curriculum:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Curriculum not found")

    if curriculum.creator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(curriculum, field, value)

    db.commit()
    db.refresh(curriculum)
    return curriculum


def delete_curriculum(db: Session, curriculum_id: uuid.UUID, current_user: User) -> dict:
    curriculum = db.query(Curriculum).filter(Curriculum.id == curriculum_id).first()

    if not curriculum:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Curriculum not found")

    if curriculum.creator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    db.delete(curriculum)
    db.commit()
    return {"message": "Deleted successfully"}


def list_published_curricula(db: Session, search: Optional[str] = None, skip: int = 0, limit: int = 20) -> dict:
    query = (
        db.query(Curriculum)
        .options(joinedload(Curriculum.creator))
        .filter(Curriculum.is_published == True)
    )
    if search:
        query = query.filter(
            func.similarity(Curriculum.title, search) > 0.1
        ).order_by(func.similarity(Curriculum.title, search).desc())
    
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    
    return {"items": items, "total": total, "skip": skip, "limit": limit}


def get_creator_curricula(db: Session, username: str) -> dict:
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Creator not found")

    curricula = (
        db.query(Curriculum)
        .options(joinedload(Curriculum.creator))
        .filter(
            Curriculum.creator_id == user.id,
            Curriculum.is_published == True
        )
        .all()
    )

    return {
        "creator_username": user.username,
        "creator_avatar_url": user.avatar_url,
        "curricula": curricula
    }


def get_my_curricula(db: Session, current_user: User) -> list[Curriculum]:
    return (
        db.query(Curriculum)
        .options(joinedload(Curriculum.creator))
        .filter(Curriculum.creator_id == current_user.id)
        .all()
    )