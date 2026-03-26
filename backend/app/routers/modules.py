from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.module import ModuleCreate, ModuleUpdate, ModuleResponse
import uuid
from app.services.module import create_module, update_module, delete_module, reorder_module

router = APIRouter(tags=["modules"])


@router.post("/curricula/{curriculum_id}/modules", response_model=ModuleResponse)
def create(curriculum_id: uuid.UUID, data: ModuleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_module(db=db, curriculum_id=curriculum_id, data=data)


@router.patch("/modules/{module_id}", response_model=ModuleResponse)
def update(module_id: uuid.UUID, data: ModuleUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return update_module(db=db, module_id=module_id, data=data, current_user=current_user)


@router.delete("/modules/{module_id}")
def delete(module_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return delete_module(db=db, module_id=module_id, current_user=current_user)


@router.patch("/modules/{module_id}/reorder", response_model=ModuleResponse)
def reorder(module_id: uuid.UUID, new_position: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return reorder_module(db=db, module_id=module_id, new_position=new_position, current_user=current_user)