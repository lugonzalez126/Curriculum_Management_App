import uuid
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.module import Module
from app.models.user import User
from app.schemas.module import ModuleCreate, ModuleUpdate
from app.services.ordering import get_order_value


def create_module(db: Session, curriculum_id: uuid.UUID, data: ModuleCreate) -> Module:
    existing = db.query(Module).filter(Module.curriculum_id == curriculum_id).order_by(Module.order).all()
    order = get_order_value(existing, len(existing))

    module = Module(
        curriculum_id=curriculum_id,
        title=data.title,
        order=order
    )
    db.add(module)
    db.commit()
    db.refresh(module)
    return module


def update_module(db: Session, module_id: uuid.UUID, data: ModuleUpdate, current_user: User) -> Module:
    module = db.query(Module).filter(Module.id == module_id).first()

    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")

    if module.curriculum.creator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(module, field, value)

    db.commit()
    db.refresh(module)
    return module


def delete_module(db: Session, module_id: uuid.UUID, current_user: User) -> dict:
    module = db.query(Module).filter(Module.id == module_id).first()

    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")

    if module.curriculum.creator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    db.delete(module)
    db.commit()
    return {"message": "Deleted successfully"}


def reorder_module(db: Session, module_id: uuid.UUID, new_position: int, current_user: User) -> Module:
    module = db.query(Module).filter(Module.id == module_id).first()

    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")

    if module.curriculum.creator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    all_modules = db.query(Module).filter(
        Module.curriculum_id == module.curriculum_id
    ).order_by(Module.order).all()

    # Removed thes module from list before calculating new position
    all_modules = [m for m in all_modules if m.id != module_id]
    module.order = get_order_value(all_modules, new_position)

    db.commit()
    db.refresh(module)
    return module