from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, func, Text, Boolean
from sqlalchemy.orm import relationship
import enum

from app.models.base import Base

class EvaluationResult(str, enum.Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"

class Evaluation(Base):
    __tablename__ = "evaluations"
    
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    jury_member_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    report = Column(Text, nullable=True)
    result = Column(Enum(EvaluationResult), nullable=True)
    assigned_date = Column(DateTime(timezone=True), server_default=func.now())
    completed_date = Column(DateTime(timezone=True), nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=False)
    is_completed = Column(Boolean, default=False)
    
    # Relationships
    application = relationship("Application", back_populates="evaluations")
    jury_member = relationship("User", back_populates="evaluations")
