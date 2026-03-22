from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.user import UserRegister, UserResponse
from app.services.auth import register_user
from app.dependencies import get_db
from app.schemas.user import UserRegister, UserResponse, UserLogin, TokenResponse
from app.services.auth import register_user, login_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    return register_user(db=db, data=data)

@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    return login_user(db=db, data=data)
