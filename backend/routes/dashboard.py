from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from database import get_db, Scan, Patient

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)

    total_today     = db.query(Scan).filter(func.date(Scan.scan_date) == today).count()
    total_yesterday = db.query(Scan).filter(func.date(Scan.scan_date) == yesterday).count()
    positive_today  = db.query(Scan).filter(
        func.date(Scan.scan_date) == today,
        Scan.prediction != "NORMAL"
    ).count()
    pending         = db.query(Scan).filter(Scan.status == "Pending").count()
    total_scans     = db.query(Scan).count()

    # Recent scans for dashboard
    recent_scans = db.query(Scan).order_by(Scan.scan_date.desc()).limit(5).all()

    return {
        "total_scans_today":  total_today,
        "change_from_yesterday": total_today - total_yesterday,
        "positive_scans":     positive_today,
        "pending_review":     pending,
        "model_accuracy":     90.0,
        "total_scans":        total_scans,
        "recent_scans": [
            {
                "scan_id":      s.scan_id,
                "patient_name": s.patient_name,
                "scan_date":    s.scan_date.strftime("%d/%m/%Y"),
                "status":       s.prediction or s.status,
                "confidence":   s.ai_confidence,
                "image_path":   s.image_path,
                "heatmap_path": s.heatmap_path,
            }
            for s in recent_scans
        ]
    }
