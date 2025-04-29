from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.models.evaluation import EvaluationResult

class EvaluationBase(BaseModel):
    application_id: int
    jury_member_id: int
    deadline: datetime

class EvaluationCreate(EvaluationBase):
    pass

class EvaluationUpdate(BaseModel):
    report: Optional[str] = None
    result: Optional[EvaluationResult] = None
    is_completed: Optional[bool] = None

class EvaluationResponse(EvaluationBase):
    id: int
    report: Optional[str] = None
    result: Optional[EvaluationResult] = None
    assigned_date: datetime
    completed_date: Optional[datetime] = None
    is_completed: bool
    
    class Config:
        from_attributes = True

class EvaluationDetailResponse(EvaluationResponse):
    candidate_name: str
    position: str
    department: str
    jury_name: str
    
    class Config:
        from_attributes = True
