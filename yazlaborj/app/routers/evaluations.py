from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from app.database import get_db
from app.models.evaluation import Evaluation, EvaluationResult
from app.models.application import Application
from app.models.listing import Listing
from app.models.user import User, UserRole
from app.schemas.evaluation import (
    EvaluationCreate, EvaluationResponse, EvaluationUpdate, 
    EvaluationDetailResponse
)
from app.utils.auth import get_current_active_user, get_manager_user, get_jury_user

router = APIRouter()

@router.post("/", response_model=EvaluationResponse, status_code=status.HTTP_201_CREATED)
def create_evaluation(
    evaluation: EvaluationCreate,
    current_user: User = Depends(get_manager_user),
    db: Session = Depends(get_db)
):
    try:
        # Check if application exists
        application = db.query(Application).filter(Application.id == evaluation.application_id).first()
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Check if jury member exists
        jury_member = db.query(User).filter(
            User.id == evaluation.jury_member_id,
            User.role == UserRole.JURY
        ).first()
        if not jury_member:
            raise HTTPException(status_code=404, detail="Jury member not found")
        
        # Check if evaluation already exists
        existing_evaluation = db.query(Evaluation).filter(
            Evaluation.application_id == evaluation.application_id,
            Evaluation.jury_member_id == evaluation.jury_member_id
        ).first()
        
        if existing_evaluation:
            raise HTTPException(status_code=400, detail="Evaluation already exists")
        
        # Create new evaluation
        db_evaluation = Evaluation(**evaluation.dict())
        db.add(db_evaluation)
        db.commit()
        db.refresh(db_evaluation)
        
        return db_evaluation
    except Exception as e:
        db.rollback()
        print(f"Error in create_evaluation: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/", response_model=List[EvaluationDetailResponse])
def get_evaluations(
    skip: int = 0,
    limit: int = 100,
    is_completed: bool = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        # Base query with joins
        query = db.query(
            Evaluation,
            User.name.label("jury_name"),
            Application.candidate_id,
            Listing.position,
            Listing.department
        ).join(
            User, Evaluation.jury_member_id == User.id
        ).join(
            Application, Evaluation.application_id == Application.id
        ).join(
            Listing, Application.listing_id == Listing.id
        )
        
        # Filter by completion status if provided
        if is_completed is not None:
            query = query.filter(Evaluation.is_completed == is_completed)
        
        # Filter based on user role
        if current_user.role == UserRole.JURY:
            # Jury members can only see their own evaluations
            query = query.filter(Evaluation.jury_member_id == current_user.id)
        
        # Get evaluations
        results = query.offset(skip).limit(limit).all()
        
        # Convert to response model
        evaluations = []
        for result in results:
            eval_dict = result[0].__dict__
            eval_dict["jury_name"] = result.jury_name
            
            # Get candidate name directly
            candidate = db.query(User).filter(User.id == result.candidate_id).first()
            eval_dict["candidate_name"] = candidate.name if candidate else "Unknown"
            
            eval_dict["position"] = result.position
            eval_dict["department"] = result.department
            evaluations.append(eval_dict)
        
        return evaluations
    except Exception as e:
        print(f"Error in get_evaluations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{evaluation_id}", response_model=EvaluationDetailResponse)
def get_evaluation(
    evaluation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Query evaluation with joins
    result = db.query(
        Evaluation,
        User.name.label("jury_name"),
        Application.candidate_id,
        Listing.position,
        Listing.department
    ).join(
        User, Evaluation.jury_member_id == User.id
    ).join(
        Application, Evaluation.application_id == Application.id
    ).join(
        Listing, Application.listing_id == Listing.id
    ).filter(
        Evaluation.id == evaluation_id
    ).first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    # Check if user has permission to view this evaluation
    evaluation = result[0]
    if current_user.role == UserRole.JURY and evaluation.jury_member_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this evaluation")
    
    # Get candidate name
    candidate = db.query(User).filter(User.id == result.candidate_id).first()
    
    # Convert to response model
    eval_dict = evaluation.__dict__
    eval_dict["jury_name"] = result.jury_name
    eval_dict["candidate_name"] = candidate.name if candidate else "Unknown"
    eval_dict["position"] = result.position
    eval_dict["department"] = result.department
    
    return eval_dict

@router.put("/{evaluation_id}", response_model=EvaluationResponse)
def update_evaluation(
    evaluation_id: int,
    evaluation_update: EvaluationUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    # Check permissions
    if current_user.role == UserRole.JURY:
        # Jury members can only update their own evaluations
        if evaluation.jury_member_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this evaluation")
    
    # If marking as completed, set completed date
    if evaluation_update.is_completed and evaluation_update.is_completed != evaluation.is_completed:
        evaluation.completed_date = datetime.now()
    
    # Update evaluation fields
    for key, value in evaluation_update.dict(exclude_unset=True).items():
        setattr(evaluation, key, value)
    
    db.commit()
    db.refresh(evaluation)
    
    return evaluation

@router.delete("/{evaluation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_evaluation(
    evaluation_id: int,
    current_user: User = Depends(get_manager_user),
    db: Session = Depends(get_db)
):
    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    db.delete(evaluation)
    db.commit()
    return None
