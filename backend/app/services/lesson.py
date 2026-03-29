import uuid
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.lesson import Lesson
from app.models.user import User
from app.schemas.lesson import LessonCreate, LessonUpdate
from app.services.ordering import get_order_value
from typing import Optional


def create_lesson(db: Session, module_id: uuid.UUID, data: LessonCreate) -> Lesson:
    existing = db.query(Lesson).filter(Lesson.module_id == module_id).order_by(Lesson.order).all()
    order = get_order_value(existing, len(existing))

    new_lesson = Lesson(
        module_id=module_id,
        title=data.title,
        order=order,
        content=data.content if data.content is not None else {}
    )
    db.add(new_lesson)
    db.commit()
    db.refresh(new_lesson)
    return new_lesson


def get_lesson(db: Session, lesson_id: uuid.UUID, current_user: Optional[User]) -> Lesson:
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    if current_user and lesson.module.curriculum.creator_id == current_user.id:
        return lesson

    if not lesson.is_published or not lesson.module.is_published or not lesson.module.curriculum.is_published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    return lesson


def update_lesson(db: Session, lesson_id: uuid.UUID, data: LessonUpdate, current_user: User) -> Lesson:
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    if lesson.module.curriculum.creator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(lesson, field, value)

    db.commit()
    db.refresh(lesson)
    return lesson


def delete_lesson(db: Session, lesson_id: uuid.UUID, current_user: User) -> dict:
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    if lesson.module.curriculum.creator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    db.delete(lesson)
    db.commit()
    return {"message": "Deleted successfully"}


def reorder_lesson(db: Session, lesson_id: uuid.UUID, new_position: int, current_user: User) -> Lesson:
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    if lesson.module.curriculum.creator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    all_lessons = db.query(Lesson).filter(
        Lesson.module_id == lesson.module_id
    ).order_by(Lesson.order).all()

    all_lessons = [l for l in all_lessons if l.id != lesson_id]
    lesson.order = get_order_value(all_lessons, new_position)

    db.commit()
    db.refresh(lesson)
    return lesson