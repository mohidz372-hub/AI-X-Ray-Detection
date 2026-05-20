from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import uvicorn
import os

from database import engine, get_db, Base
from routes import scans, patients, reports, dashboard

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="X-Ray Detection API", version="1.0.0")

# CORS — allows React frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded X-ray images statically
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Routes
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(scans.router,     prefix="/api/scans",     tags=["Scans"])
app.include_router(patients.router,  prefix="/api/patients",  tags=["Patients"])
app.include_router(reports.router,   prefix="/api/reports",   tags=["Reports"])

@app.get("/")
def root():
    return {"message": "X-Ray Detection API is running", "version": "1.0.0"}

@app.get("/api/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
