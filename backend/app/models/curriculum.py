import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
from sqlalchemy import DateTime, ForeignKey, Text, Boolean, String
from sqlalchemy.orm import relationship
from typing import Optional



class Curriculum(Base):
    __tablename__ = "curricula"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    creator_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    is_published: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )
    cover_image_url: Mapped[Optional[str]] = mapped_column(
    String(500),
    nullable=True
    )
    
    @property
    def creator_username(self):
    return self.creator.username if self.creator else ""

    @property
    def creator_avatar_url(self):
        return self.creator.avatar_url if self.creator else None
    
    creator = relationship("User", back_populates="curricula")
    modules = relationship("Module", back_populates="curriculum", cascade="all, delete-orphan", order_by="Module.order")
