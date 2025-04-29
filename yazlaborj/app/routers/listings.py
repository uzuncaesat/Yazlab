from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.listing import Listing, ListingStatus
from app.models.user import User
from app.schemas.listing import ListingCreate, ListingResponse, ListingUpdate
from app.utils.auth import get_current_active_user, get_admin_user
from app.models.application import Application

router = APIRouter()

@router.post("/", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    listing: ListingCreate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    # Create new listing
    db_listing = Listing(
        **listing.dict(),
        created_by=current_user.id
    )
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    
    # Add applications count
    setattr(db_listing, "applications_count", 0)
    
    return db_listing

@router.get("/", response_model=List[ListingResponse])
def get_listings(
    skip: int = 0,
    limit: int = 100,
    status: ListingStatus = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(Listing)
    
    # Filter by status if provided
    if status:
        query = query.filter(Listing.status == status)
    
    # Get listings
    listings = query.offset(skip).limit(limit).all()
    
    # Add applications count to each listing
    for listing in listings:
        applications_count = db.query(Application).filter(Application.listing_id == listing.id).count()
        setattr(listing, "applications_count", applications_count)
    
    return listings

@router.get("/{listing_id}", response_model=ListingResponse)
def get_listing(
    listing_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Add applications count
    applications_count = db.query(Application).filter(Application.listing_id == listing.id).count()
    setattr(listing, "applications_count", applications_count)
    
    return listing

@router.put("/{listing_id}", response_model=ListingResponse)
def update_listing(
    listing_id: int,
    listing_update: ListingUpdate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Update listing fields
    for key, value in listing_update.dict(exclude_unset=True).items():
        setattr(listing, key, value)
    
    db.commit()
    db.refresh(listing)
    
    # Add applications count
    applications_count = db.query(Application).filter(Application.listing_id == listing.id).count()
    setattr(listing, "applications_count", applications_count)
    
    return listing

@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    db.delete(listing)
    db.commit()
    return None
