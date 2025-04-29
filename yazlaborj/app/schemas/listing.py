from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.models.listing import PositionType, ListingStatus

class ListingBase(BaseModel):
    position: PositionType
    department: str
    faculty: str
    publish_date: datetime
    deadline: datetime
    description: Optional[str] = None
    requirements: Optional[str] = None

class ListingCreate(ListingBase):
    pass

class ListingUpdate(BaseModel):
    position: Optional[PositionType] = None
    department: Optional[str] = None
    faculty: Optional[str] = None
    publish_date: Optional[datetime] = None
    deadline: Optional[datetime] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    status: Optional[ListingStatus] = None

class ListingResponse(ListingBase):
    id: int
    status: ListingStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    applications_count: Optional[int] = None
    
    class Config:
        from_attributes = True
