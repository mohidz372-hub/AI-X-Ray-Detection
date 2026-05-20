from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime
from typing import Optional, List
import os, shutil, uuid

from database import get_db, Scan, Patient
from models.schemas import ScanResponse, ScanUpdate
from ml_model.predictor import predict

router = APIRouter()

UPLOAD_DIR  = "uploads/scans"
HEATMAP_DIR = "uploads/heatmaps"
os.makedirs(UPLOAD_DIR,  exist_ok=True)
os.makedirs(HEATMAP_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff"}

@router.get("/", response_model=List[ScanResponse])
def get_scans(
    status:     Optional[str] = Query(None),
    scan_type:  Optional[str] = Query(None),
    search:     Optional[str] = Query(None),
    skip:       int = 0,
    limit:      int = 20,
    db:         Session = Depends(get_db)
):
    query = db.query(Scan)

    if status and status != "All":
        query = query.filter(Scan.status == status)
    if scan_type and scan_type != "All":
        query = query.filter(Scan.scan_type == scan_type)
    if search:
        query = query.filter(
            or_(
                Scan.patient_name.ilike(f"%{search}%"),
                Scan.scan_id.ilike(f"%{search}%")
            )
        )

    return query.order_by(Scan.scan_date.desc()).offset(skip).limit(limit).all()


@router.post("/upload")
async def upload_scan(
    file:       UploadFile = File(...),
    patient_id: str        = Form(...),
    scan_type:  str        = Form(default="Chest X-ray"),
    db:         Session    = Depends(get_db)
):
    # Validate file type
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Invalid file type. Allowed: {ALLOWED_EXTENSIONS}")

    # Check patient exists
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(404, f"Patient {patient_id} not found")

    # Save uploaded file
    scan_id   = f"Scan {str(uuid.uuid4())[:6].upper()}"
    filename  = f"{scan_id.replace(' ', '_')}_{uuid.uuid4().hex[:6]}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Run ML prediction
    heatmap_filename = f"heatmap_{filename}"
    heatmap_path     = os.path.join(HEATMAP_DIR, heatmap_filename)

    try:
        result = predict(file_path, save_heatmap_to=heatmap_path)
    except Exception as e:
        result = {"prediction": "Pending", "confidence": None,
                  "probabilities": {}, "heatmap_path": None}

    # Save to database
    scan = Scan(
        scan_id      = scan_id,
        patient_id   = patient_id,
        patient_name = patient.name,
        scan_type    = scan_type,
        image_path   = f"uploads/scans/{filename}",
        heatmap_path = f"uploads/heatmaps/{heatmap_filename}" if result.get("heatmap_path") else None,
        status       = "Analyzed" if result.get("prediction") not in [None, "Pending"] else "Pending",
        prediction   = result.get("prediction"),
        ai_confidence = round(result.get("confidence", 0) * 100, 1) if result.get("confidence") else None,
        pneumonia_prob = result.get("probabilities", {}).get("PNEUMONIA"),
        normal_prob    = result.get("probabilities", {}).get("NORMAL"),
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)

    return {
        "scan_id":     scan.scan_id,
        "prediction":  result.get("prediction"),
        "confidence":  scan.ai_confidence,
        "heatmap_url": scan.heatmap_path,
        "mock":        result.get("mock", False),
        "message":     "Scan uploaded and analyzed successfully"
    }


@router.get("/{scan_id}", response_model=ScanResponse)
def get_scan(scan_id: str, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.scan_id == scan_id).first()
    if not scan:
        raise HTTPException(404, "Scan not found")
    return scan


@router.patch("/{scan_id}")
def update_scan(scan_id: str, update: ScanUpdate, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.scan_id == scan_id).first()
    if not scan:
        raise HTTPException(404, "Scan not found")
    for field, value in update.dict(exclude_none=True).items():
        setattr(scan, field, value)
    db.commit()
    return {"message": "Scan updated"}


@router.delete("/{scan_id}")
def delete_scan(scan_id: str, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.scan_id == scan_id).first()
    if not scan:
        raise HTTPException(404, "Scan not found")
    # Clean up files
    for path in [scan.image_path, scan.heatmap_path]:
        if path and os.path.exists(path):
            os.remove(path)
    db.delete(scan)
    db.commit()
    return {"message": "Scan deleted"}
