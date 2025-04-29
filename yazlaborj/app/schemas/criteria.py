from pydantic import BaseModel
from typing import Optional, List

from app.models.listing import PositionType

class CriteriaBase(BaseModel):
    position_type: PositionType
    name: str
    description: Optional[str] = None
    required: bool = True
    min_count: int = 1

class CriteriaCreate(CriteriaBase):
    pass

class CriteriaUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    required: Optional[bool] = None
    min_count: Optional[int] = None

class CriteriaResponse(CriteriaBase):
    id: int
    
    class Config:
        from_attributes = True
