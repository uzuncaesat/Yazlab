from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, func, Enum
from sqlalchemy.orm import relationship
import enum

from app.models.base import Base

class PositionType(str, enum.Enum):
    DR = "Dr. Öğretim Üyesi"
    DOCENT = "Doçent"
    PROFESSOR = "Profesör"

class ListingStatus(str, enum.Enum):
    ACTIVE = "active"
    EXPIRED = "expired"

class Listing(Base):
    __tablename__ = "listings"
    
    id = Column(Integer, primary_key=True, index=True)
    position = Column(Enum(PositionType), nullable=False)
    department = Column(String, nullable=False)
    faculty = Column(String, nullable=False)
    publish_date = Column(DateTime(timezone=True), nullable=False)
    deadline = Column(DateTime(timezone=True), nullable=False)
    description = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)
    status = Column(Enum(ListingStatus), default=ListingStatus.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    applications = relationship("Application", back_populates="listing")
    
    # Admin who created the listing
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
