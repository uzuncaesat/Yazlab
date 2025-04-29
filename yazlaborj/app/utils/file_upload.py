import os
import shutil
from fastapi import UploadFile, HTTPException
from pathlib import Path
import uuid

# Base directory for file uploads
UPLOAD_DIR = Path("uploads")

def create_upload_dir():
    """Create upload directory if it doesn't exist"""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    for dir_name in ["cv", "diploma", "publications", "citations", "conferences"]:
        os.makedirs(UPLOAD_DIR / dir_name, exist_ok=True)

def save_upload_file(upload_file: UploadFile, directory: str) -> str:
    """Save an upload file to the specified directory and return the file path"""
    create_upload_dir()
    
    # Validate directory
    if directory not in ["cv", "diploma", "publications", "citations", "conferences"]:
        raise HTTPException(status_code=400, detail="Invalid directory")
    
    # Create a unique filename
    file_extension = os.path.splitext(upload_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # Full path to save the file
    file_path = UPLOAD_DIR / directory / unique_filename
    
    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    # Return the relative path
    return str(Path(directory) / unique_filename)

def get_file_path(relative_path: str) -> Path:
    """Get the full path for a file from its relative path"""
    return UPLOAD_DIR / relative_path
