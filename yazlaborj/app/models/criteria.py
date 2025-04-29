from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.models.base import Base
from app.models.listing import PositionType

class Criteria(Base):
    __tablename__ = "criteria"
    
    id = Column(Integer, primary_key=True, index=True)
    position_type = Column(Enum(PositionType), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    required = Column(Boolean, default=True)
    min_count = Column(Integer, default=1)
