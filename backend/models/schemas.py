from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# ── Patient Schemas ──
class PatientCreate(BaseModel):
    name:       str
    age:        int
    gender:     str
    contact:    str
    age_group:  Optional[str] = None

class PatientResponse(BaseModel):
    id:          int
    patient_id:  str
    name:        str
    age:         int
    gender:      str
    contact:     str
    age_group:   Optional[str]
    created_at:  datetime

    class Config:
        from_attributes = True

# ── Scan Schemas ──
class ScanResponse(BaseModel):
    id:             int
    scan_id:        str
    patient_id:     str
    patient_name:   str
    scan_type:      str
    scan_date:      datetime
    image_path:     Optional[str]
    heatmap_path:   Optional[str]
    status:         str
    ai_confidence:  Optional[float]
    prediction:     Optional[str]
    pneumonia_prob: Optional[float]
    tb_prob:        Optional[float]
    normal_prob:    Optional[float]
    notes:          Optional[str]
    flagged:        bool
    created_at:     datetime

    class Config:
        from_attributes = True

class ScanUpdate(BaseModel):
    status:   Optional[str]
    notes:    Optional[str]
    flagged:  Optional[bool]

# ── Report Schemas ──
class ReportCreate(BaseModel):
    title:        str
    description:  str

class ReportResponse(BaseModel):
    id:          int
    title:       str
    description: str
    file_path:   Optional[str]
    created_at:  datetime

    class Config:
        from_attributes = True
