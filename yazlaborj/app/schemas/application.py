from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.models.application import ApplicationStatus

class ApplicationBase(BaseModel):
    listing_id: int

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = None
    manager_notes: Optional[str] = None

class ApplicationDocumentUpdate(BaseModel):
    cv_path: Optional[str] = None
    diploma_path: Optional[str] = None
    publications_path: Optional[str] = None
    citations_path: Optional[str] = None
    conferences_path: Optional[str] = None

class ApplicationResponse(ApplicationBase):
    id: int
    candidate_id: int
    status: ApplicationStatus
    apply_date: datetime
    updated_at: Optional[datetime] = None
    cv_path: Optional[str] = None
    diploma_path: Optional[str] = None
    publications_path: Optional[str] = None
    citations_path: Optional[str] = None
    conferences_path: Optional[str] = None
    manager_notes: Optional[str] = None
    
    class Config:
        from_attributes = True

class ApplicationDetailResponse(ApplicationResponse):
    listing_position: str
    listing_department: str
    listing_faculty: str
    candidate_name: str
    
    class Config:
        from_attributes = True
