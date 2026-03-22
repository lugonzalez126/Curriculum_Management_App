from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.models.user import User
import secrets
from datetime import timedelta
from jose import jwt
from app.config import settings
from app.models.refresh_token import RefreshToken
import uuid
from app.schemas.user import UserRegister, UserLogin
from datetime import datetime, timezone, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    to_encode.update({"exp": expire})
    return jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm
    )

def create_refresh_token(db: Session, user_id: uuid.UUID) -> str:
    # Generate a random token
    raw_token = secrets.token_urlsafe(32)

    # Hash it before storing
    token_hash = pwd_context.hash(raw_token)

    # Store in database
    refresh_token = RefreshToken(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(
            days=settings.refresh_token_expire_days
        )
    )
    db.add(refresh_token)
    db.commit()

    # Return the raw token to send to client
    return raw_token

def register_user(db: Session, data: UserRegister) -> User:
    # 1. Check email not taken
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # 2. Check username not taken
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # 3. Check passwords match
    if data.password != data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )

    # 4. Hash the password
    hashed_password = pwd_context.hash(data.password)

    # 5. Create the user
    user = User(
        email=data.email,
        username=data.username,
        hashed_password=hashed_password
    )

    # 6. Save to database
    db.add(user)
    db.commit()
    db.refresh(user)

    return user

def login_user(db: Session, data: UserLogin) -> dict:
    # 1. Find user by email
    user = db.query(User).filter(User.email == data.email).first()

    # 2. Check user exists and password is correct
    if not user or not pwd_context.verify(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # 3. Create access token
    access_token = create_access_token({"sub": str(user.id)})

    # 4. Create and store refresh token
    refresh_token = create_refresh_token(db=db, user_id=user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }
