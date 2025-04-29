from sqlalchemy import Column, Integer, ForeignKey, DateTime, String, func
from sqlalchemy.orm import relationship

from app.models.base import Base

class JuryAssignment(Base):
    __tablename__ = "jury_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    jury_member_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    department = Column(String, nullable=False)
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_date = Column(DateTime(timezone=True), server_default=func.now())
