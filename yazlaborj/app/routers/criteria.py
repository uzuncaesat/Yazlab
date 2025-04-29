from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.criteria import Criteria
from app.models.listing import PositionType
from app.models.user import User
from app.schemas.criteria import CriteriaCreate, CriteriaResponse, CriteriaUpdate
from app.utils.auth import get_current_active_user, get_manager_user

router = APIRouter()

@router.post("/", response_model=CriteriaResponse, status_code=status.HTTP_201_CREATED)
def create_criteria(
    criteria: CriteriaCreate,
    current_user: User = Depends(get_manager_user),
    db: Session = Depends(get_db)
):
    # Create new criteria
    db_criteria = Criteria(**criteria.dict())
    db.add(db_criteria)
    db.commit()
    db.refresh(db_criteria)
    
    return db_criteria

@router.get("/", response_model=List[CriteriaResponse])
def get_criteria(
    position_type: PositionType = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(Criteria)
    
    # Filter by position type if provided
    if position_type:
        query = query.filter(Criteria.position_type == position_type)
    
    criteria = query.all()
    return criteria

@router.get("/{criteria_id}", response_model=CriteriaResponse)
def get_criterion(
    criteria_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    criterion = db.query(Criteria).filter(Criteria.id == criteria_id).first()
    if not criterion:
        raise HTTPException(status_code=404, detail="Criterion not found")
    
    return criterion

@router.put("/{criteria_id}", response_model=CriteriaResponse)
def update_criterion(
    criteria_id: int,
    criteria_update: CriteriaUpdate,
    current_user: User = Depends(get_manager_user),
    db: Session = Depends(get_db)
):
    criterion = db.query(Criteria).filter(Criteria.id == criteria_id).first()
    if not criterion:
        raise HTTPException(status_code=404, detail="Criterion not found")
    
    # Update criterion fields
    for key, value in criteria_update.dict(exclude_unset=True).items():
        setattr(criterion, key, value)
    
    db.commit()
    db.refresh(criterion)
    
    return criterion

@router.delete("/{criteria_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_criterion(
    criteria_id: int,
    current_user: User = Depends(get_manager_user),
    db: Session = Depends(get_db)
):
    criterion = db.query(Criteria).filter(Criteria.id == criteria_id).first()
    if not criterion:
        raise HTTPException(status_code=404, detail="Criterion not found")
    
    db.delete(criterion)
    db.commit()
    return None
