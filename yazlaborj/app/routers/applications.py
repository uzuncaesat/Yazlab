from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from app.database import get_db
from app.models.application import Application, ApplicationStatus
from app.models.listing import Listing
from app.models.user import User, UserRole
from app.schemas.application import (
    ApplicationCreate, ApplicationResponse, ApplicationUpdate, 
    ApplicationDetailResponse, ApplicationDocumentUpdate
)
from app.utils.auth import get_current_active_user, get_admin_or_manager_user
from app.utils.file_upload import save_upload_file

router = APIRouter()

@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    application: ApplicationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check if listing exists
    listing = db.query(Listing).filter(Listing.id == application.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Check if listing is active
    if listing.status != "active":
        raise HTTPException(status_code=400, detail="Listing is not active")
    
    # Check if deadline has passed
    # Use timezone-aware datetime for comparison
    now_utc = datetime.now(timezone.utc)
    if listing.deadline < now_utc:
        raise HTTPException(status_code=400, detail="Application deadline has passed")
    
    # Check if user already applied to this listing
    existing_application = db.query(Application).filter(
        Application.candidate_id == current_user.id,
        Application.listing_id == application.listing_id
    ).first()
    
    if existing_application:
        raise HTTPException(status_code=400, detail="You have already applied to this listing")
    
    # Create new application
    db_application = Application(
        candidate_id=current_user.id,
        listing_id=application.listing_id
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    
    return db_application

@router.get("/", response_model=List[ApplicationDetailResponse])
def get_applications(
    skip: int = 0,
    limit: int = 100,
    status: ApplicationStatus = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(
        Application,
        Listing.position.label("listing_position"),
        Listing.department.label("listing_department"),
        Listing.faculty.label("listing_faculty"),
        User.name.label("candidate_name")
    ).join(
        Listing, Application.listing_id == Listing.id
    ).join(
        User, Application.candidate_id == User.id
    )
    
    # Filter by status if provided
    if status:
        query = query.filter(Application.status == status)
    
    # Filter based on user role
    if current_user.role == UserRole.CANDIDATE:
        # Candidates can only see their own applications
        query = query.filter(Application.candidate_id == current_user.id)
    
    # Get applications
    results = query.offset(skip).limit(limit).all()
    
    # Convert to response model
    applications = []
    for result in results:
        app_dict = result[0].__dict__
        app_dict["listing_position"] = result.listing_position
        app_dict["listing_department"] = result.listing_department
        app_dict["listing_faculty"] = result.listing_faculty
        app_dict["candidate_name"] = result.candidate_name
        applications.append(app_dict)
    
    return applications

@router.get("/{application_id}", response_model=ApplicationDetailResponse)
def get_application(
    application_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Query application with join
    result = db.query(
        Application,
        Listing.position.label("listing_position"),
        Listing.department.label("listing_department"),
        Listing.faculty.label("listing_faculty"),
        User.name.label("candidate_name")
    ).join(
        Listing, Application.listing_id == Listing.id
    ).join(
        User, Application.candidate_id == User.id
    ).filter(
        Application.id == application_id
    ).first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check if user has permission to view this application
    application = result[0]
    if current_user.role == UserRole.CANDIDATE and application.candidate_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this application")
    
    # Convert to response model
    app_dict = application.__dict__
    app_dict["listing_position"] = result.listing_position
    app_dict["listing_department"] = result.listing_department
    app_dict["listing_faculty"] = result.listing_faculty
    app_dict["candidate_name"] = result.candidate_name
    
    return app_dict

@router.put("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: int,
    application_update: ApplicationUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check permissions
    if current_user.role == UserRole.CANDIDATE:
        # Candidates can only update their own applications
        if application.candidate_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this application")
        
        # Candidates cannot update status
        if application_update.status:
            raise HTTPException(status_code=403, detail="Not authorized to update application status")
    
    # Update application fields
    for key, value in application_update.dict(exclude_unset=True).items():
        setattr(application, key, value)
    
    db.commit()
    db.refresh(application)
    
    return application

@router.post("/{application_id}/documents", response_model=ApplicationResponse)
def upload_application_documents(
    application_id: int,
    cv: Optional[UploadFile] = File(None),
    diploma: Optional[UploadFile] = File(None),
    publications: Optional[UploadFile] = File(None),
    citations: Optional[UploadFile] = File(None),
    conferences: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check if user has permission to update this application
    if current_user.role == UserRole.CANDIDATE and application.candidate_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this application")
    
    # Save uploaded files
    if cv:
        application.cv_path = save_upload_file(cv, "cv")
    
    if diploma:
        application.diploma_path = save_upload_file(diploma, "diploma")
    
    if publications:
        application.publications_path = save_upload_file(publications, "publications")
    
    if citations:
        application.citations_path = save_upload_file(citations, "citations")
    
    if conferences:
        application.conferences_path = save_upload_file(conferences, "conferences")
    
    db.commit()
    db.refresh(application)
    
    return application

@router.put("/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: int,
    status: ApplicationStatus,
    current_user: User = Depends(get_admin_or_manager_user),
    db: Session = Depends(get_db)
):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Update status
    application.status = status
    db.commit()
    db.refresh(application)
    
    return application
