from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.jury import JuryMemberResponse, JuryAssignmentCreate, JuryAssignmentResponse
from app.utils.auth import get_current_active_user, get_manager_user

router = APIRouter()

@router.get("/members", response_model=List[JuryMemberResponse])
def get_jury_members(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_manager_user),
    db: Session = Depends(get_db)
):
    try:
        # Get all users with JURY role
        jury_members = db.query(User).filter(
            User.role == UserRole.JURY
        ).offset(skip).limit(limit).all()
        
        return jury_members
    except Exception as e:
        print(f"Error in get_jury_members: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/assignments", response_model=JuryAssignmentResponse, status_code=status.HTTP_201_CREATED)
def create_jury_assignment(
    assignment: JuryAssignmentCreate,
    current_user: User = Depends(get_manager_user),
    db: Session = Depends(get_db)
):
    # Check if jury member exists
    jury_member = db.query(User).filter(
        User.id == assignment.jury_member_id,
        User.role == UserRole.JURY
    ).first()
    
    if not jury_member:
        raise HTTPException(status_code=404, detail="Jury member not found")
    
    # Create new assignment
    from app.models.jury_assignment import JuryAssignment
    
    db_assignment = JuryAssignment(
        jury_member_id=assignment.jury_member_id,
        department=assignment.department,
        assigned_by=current_user.id
    )
    
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    
    return db_assignment
