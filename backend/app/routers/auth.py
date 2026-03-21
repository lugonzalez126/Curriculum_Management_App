from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.user import UserRegister, UserResponse
from app.services.auth import register_user
from app.dependencies import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    return register_user(db=db, data=data)