from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.schemas.curriculum import CurriculumResponse, CreatorPublicPage
from app.services.curriculum import get_creator_curricula

router = APIRouter(tags=["discovery"])


@router.get("/creators/{username}", response_model=CreatorPublicPage)
def creator_curricula(username: str, db: Session = Depends(get_db)):
    return get_creator_curricula(username=username, db=db)