import uuid
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.models.curriculum import Curriculum
from app.models.user import User
from typing import Optional
from app.schemas.curriculum import CurriculumCreate, CurriculumUpdate
from app.models.module import Module


def create_curriculum(db: Session, creator_id: uuid.UUID, data: CurriculumCreate) -> Curriculum:
    curriculum = Curriculum(
        creator_id=creator_id,
        title=data.title,
        description=data.description,
    )
    db.add(curriculum)
    db.commit()
    db.refresh(curriculum)
    return curriculum


def get_curriculum(db: Session, curriculum_id: uuid.UUID, current_user: Optional[User]) -> Curriculum:
    curriculum = (db.query(Curriculum).options(joinedload(Curriculum.modules).joinedload(Module.lessons)).filter(Curriculum.id == curriculum_id).first())

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


def list_published_curricula(db: Session, search: Optional[str] = None, skip: int = 0, limit: int = 20) -> list[Curriculum]:
    query = db.query(Curriculum).filter(Curriculum.is_published == True)
    if search:
        query = query.filter(
            func.similarity(Curriculum.title, search) > 0.1
        ).order_by(func.similarity(Curriculum.title, search).desc())
    return query.offset(skip).limit(limit).all()


def get_creator_curricula(db: Session, username: str) -> list[Curriculum]:
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Creator not found")

    return db.query(Curriculum).filter(
        Curriculum.creator_id == user.id,
        Curriculum.is_published == True
    ).all()

def get_my_curricula(db: Session, current_user: User) -> list[Curriculum]:
    return db.query(Curriculum).filter(Curriculum.creator_id == current_user.id).all()