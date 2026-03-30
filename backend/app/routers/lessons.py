from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user, get_optional_user
from app.models.user import User
from app.schemas.lesson import LessonCreate, LessonUpdate, LessonResponse
import uuid
from app.services.lesson import create_lesson, get_lesson, update_lesson, delete_lesson, reorder_lesson

router = APIRouter(tags=["lessons"])


@router.post("/modules/{module_id}/lessons", response_model=LessonResponse)
def create(module_id: uuid.UUID, data: LessonCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_lesson(db=db, module_id=module_id, data=data)


@router.get("/lessons/{lesson_id}", response_model=LessonResponse)
def get_one(lesson_id: uuid.UUID, db: Session = Depends(get_db), current_user: User | None = Depends(get_optional_user)):
    return get_lesson(db=db, lesson_id=lesson_id, current_user=current_user)


@router.patch("/lessons/{lesson_id}", response_model=LessonResponse)
def update(lesson_id: uuid.UUID, data: LessonUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return update_lesson(db=db, lesson_id=lesson_id, data=data, current_user=current_user)


@router.delete("/lessons/{lesson_id}")
def delete(lesson_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return delete_lesson(db=db, lesson_id=lesson_id, current_user=current_user)


@router.patch("/lessons/{lesson_id}/reorder", response_model=LessonResponse)
def reorder(lesson_id: uuid.UUID, new_position: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return reorder_lesson(db=db, lesson_id=lesson_id, new_position=new_position, current_user=current_user)