from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.schemas.user import UserRegister
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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