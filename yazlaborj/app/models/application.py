from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, func, Text
from sqlalchemy.orm import relationship
import enum

from app.models.base import Base

class ApplicationStatus(str, enum.Enum):
    PENDING = "pending"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    REJECTED = "rejected"

class Application(Base):
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.PENDING)
    apply_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Document paths
    cv_path = Column(String, nullable=True)
    diploma_path = Column(String, nullable=True)
    publications_path = Column(String, nullable=True)
    citations_path = Column(String, nullable=True)
    conferences_path = Column(String, nullable=True)
    
    # Relationships
    candidate = relationship("User", back_populates="applications")
    listing = relationship("Listing", back_populates="applications")
    evaluations = relationship("Evaluation", back_populates="application")
    
    # Notes from manager
    manager_notes = Column(Text, nullable=True)
