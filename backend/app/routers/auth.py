from fastapi import APIRouter, Depends, Response, Request, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.schemas.user import UserRegister, UserResponse, UserLogin, TokenResponse
from app.services.auth import register_user, login_user, refresh_access_token, logout_user
from app.limiter import limiter
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse)
@limiter.limit("5/minute")
def register(request: Request, data: UserRegister, db: Session = Depends(get_db)):
    return register_user(db=db, data=data)

@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, data: UserLogin, response: Response, db: Session = Depends(get_db)):
    # step 1 — service does its job, returns everything
    result = login_user(db=db, data=data)
    
    # step 2 — router sets the cookie (HTTP concern stays in router)
    response.set_cookie(
        key="refresh_token",
        value=result["refresh_token"],
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 7
    )
    
    # step 3 — return only what frontend needs in the body
    return {
        "access_token": result["access_token"],
        "token_type": result["token_type"]
    }

@router.post("/refresh", response_model=TokenResponse)
def refresh(request: Request, db: Session = Depends(get_db)):
    raw_token = request.cookies.get("refresh_token")
    if not raw_token:
        raise HTTPException(status_code=401, detail="No refresh token found")
    return refresh_access_token(db=db, raw_token=raw_token)

@router.post("/logout")
def logout(request: Request, db: Session = Depends(get_db)):
    raw_token = request.cookies.get("refresh_token")
    if not raw_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")
    return logout_user(db=db, raw_token=raw_token)

@router.patch("/me", response_model=UserResponse)
def update_me(data: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return update_user(db=db, current_user=current_user, data=data)