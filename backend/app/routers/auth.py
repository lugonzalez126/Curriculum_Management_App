from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.schemas.user import UserRegister, UserResponse, UserLogin, TokenResponse, RefreshTokenRequest
from app.services.auth import register_user, login_user, refresh_access_token, logout_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    return register_user(db=db, data=data)

@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    return login_user(db=db, data=data)

@router.post("/refresh", response_model=TokenResponse)
def refresh(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    return refresh_access_token(db=db, raw_token=data.refresh_token)

@router.post("/logout")
def logout(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    return logout_user(db=db, raw_token=data.refresh_token)
