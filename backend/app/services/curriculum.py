import uuid
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.curriculum import Curriculum
from app.models.user import User
from typing import Optional
from app.schemas.curriculum import CurriculumCreate, CurriculumUpdate
from sqlalchemy.orm import joinedload
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
    curriculum = (
        db.query(Curriculum)
        .options(joinedload(Curriculum.modules).joinedload(Module.lessons))
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


def list_published_curricula(db: Session) -> list[Curriculum]:
    return db.query(Curriculum).filter(Curriculum.is_published == True).all()