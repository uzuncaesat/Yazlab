from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime, func
from sqlalchemy.orm import relationship
import enum

from app.models.base import Base

class UserRole(str, enum.Enum):
    CANDIDATE = "candidate"
    ADMIN = "admin"
    MANAGER = "manager"
    JURY = "jury"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    tc_kimlik = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.CANDIDATE)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    applications = relationship("Application", back_populates="candidate")
    evaluations = relationship("Evaluation", back_populates="jury_member")
    
    # Additional fields for candidate profile
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    birth_date = Column(String, nullable=True)
