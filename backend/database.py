from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./xray_detection.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ── Database Models ──

class Patient(Base):
    __tablename__ = "patients"

    id          = Column(Integer, primary_key=True, index=True)
    patient_id  = Column(String, unique=True, index=True)
    name        = Column(String, nullable=False)
    age         = Column(Integer)
    gender      = Column(String)
    contact     = Column(String)
    age_group   = Column(String)   # "30-39", "50-60+"
    created_at  = Column(DateTime, default=datetime.utcnow)

class Scan(Base):
    __tablename__ = "scans"

    id              = Column(Integer, primary_key=True, index=True)
    scan_id         = Column(String, unique=True, index=True)
    patient_id      = Column(String, index=True)
    patient_name    = Column(String)
    scan_type       = Column(String, default="Chest X-ray")  # Chest X-ray / CT
    scan_date       = Column(DateTime, default=datetime.utcnow)
    image_path      = Column(String)
    heatmap_path    = Column(String, nullable=True)
    status          = Column(String, default="Pending")  # Pending / Analyzed / Flagged
    ai_confidence   = Column(Float, nullable=True)
    prediction      = Column(String, nullable=True)   # Normal / Pneumonia / Tuberculosis
    pneumonia_prob  = Column(Float, nullable=True)
    tb_prob         = Column(Float, nullable=True)
    normal_prob     = Column(Float, nullable=True)
    notes           = Column(Text, nullable=True)
    flagged         = Column(Boolean, default=False)
    created_at      = Column(DateTime, default=datetime.utcnow)

class Report(Base):
    __tablename__ = "reports"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String)
    description = Column(Text)
    file_path   = Column(String, nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow)
