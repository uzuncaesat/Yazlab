from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class JuryAssignmentBase(BaseModel):
    jury_member_id: int
    department: str

class JuryAssignmentCreate(JuryAssignmentBase):
    pass

class JuryAssignmentResponse(JuryAssignmentBase):
    id: int
    assigned_by: int
    assigned_date: datetime
    
    class Config:
        from_attributes = True

class JuryMemberResponse(BaseModel):
    id: int
    tc_kimlik: str
    name: str
    email: str
    department: Optional[str] = None
    faculty: Optional[str] = None
    university: Optional[str] = None
    
    class Config:
        from_attributes = True
