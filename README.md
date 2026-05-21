# PneumoScan AI 🫁

> AI-Powered Chest X-Ray Detection System for Pneumonia and Tuberculosis

[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://python.org)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.17.0-orange)](https://tensorflow.org)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-20_LTS-green)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📋 Project Overview

PneumoScan AI is an intelligent medical imaging system that uses deep learning to automatically detect **Pneumonia** and **Tuberculosis** from chest X-ray images. The system provides real-time AI predictions with **Grad-CAM heatmap visualizations** showing the exact regions of concern.

Built as a Final Year Project (FYP) — 2025/2026.

---

## ✨ Features

- 🫁 **AI Detection** — Classifies X-rays as Normal, Pneumonia, or Tuberculosis
- 🔥 **Grad-CAM Heatmaps** — Visual explanation of AI predictions
- 📊 **Dashboard** — Real-time stats and analytics
- 👤 **Patient Records** — Manage patient scan history
- 📈 **Reports** — Charts and analytics with disease prevalence
- 🌙 **Dark/Light Theme** — Toggle between themes
- 📁 **Drag & Drop Upload** — Easy X-ray image upload
- ⚡ **Fast Inference** — 36ms per image

---

## 🏆 Model Performance

| Metric | Value |
|--------|-------|
| Test Accuracy | **87.46%** |
| Macro AUC | **0.9700** |
| Normal Recall | 0.853 |
| Pneumonia Recall | **0.972** |
| Tuberculosis Recall | 0.816 |
| Inference Speed | 36 ms/image |
| Parameters | 18,731,106 |
| Bias Detected | None ✅ |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Recharts, CSS Variables |
| Backend | Node.js, Express.js, Multer |
| Database | JSON File Storage (no server needed) |
| ML Framework | TensorFlow 2.17.0, Keras |
| ML API | Flask, Flask-CORS |
| Model | EfficientNetB4 (Transfer Learning + Fine-tuning) |
| Heatmap | Grad-CAM |
| Image Processing | Pillow, OpenCV, NumPy |

---

## 📁 Project Structure

```
PneumoScan-AI/
├── backend/                    # Node.js + Express backend
│   ├── routes/
│   │   ├── scans.js            # Upload, analyze, CRUD
│   │   ├── patients.js         # Patient management
│   │   └── reports.js          # Analytics data
│   ├── data/                   # JSON file database
│   │   ├── scans.json          # Scan records
│   │   └── patients.json       # Patient records
│   ├── uploads/                # Uploaded X-ray images
│   ├── database.js             # JSON database manager
│   ├── server.js               # Express server
│   └── package.json
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ScansManagement.jsx
│   │   │   ├── PatientRecords.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Settings.jsx
│   │   ├── components/
│   │   │   ├── HeatmapViewer.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   └── StatusBadge.jsx
│   │   └── context/
│   │       └── ThemeContext.jsx
│   └── package.json
├── ml_models/                  # Jupyter notebooks
│   ├── 01_preprocessing.ipynb
│   ├── 02_training_testing.ipynb
│   ├── bias_detection.ipynb
│   ├── evaluate_all_models.ipynb
│   ├── cross_validation_analysis.ipynb
│   └── model_monitoring.ipynb
├── ml_api.py                   # Flask ML API
├── .gitignore
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites

- Python 3.11
- Node.js 20 LTS
- VS Code (recommended)

### Step 1 — Clone Repository

```bash
git clone https://github.com/mohidz372-hub/AI-X-Ray-Detection.git
cd AI-X-Ray-Detection
```

### Step 2 — Download Trained Model

Models are too large for GitHub. Download from Google Drive:

| Model | Size |
|-------|------|
| [EfficientNetB4_finetuned.keras](your-google-drive-link) | 156 MB |
| [EfficientNetB4_best.keras](your-google-drive-link) | 118 MB |

Place downloaded models in:
```
Models/
    EfficientNetB4_finetuned.keras
    EfficientNetB4_best.keras
```

### Step 3 — Install Python Packages

```bash
pip install tensorflow==2.17.0 numpy==1.26.4 scikit-learn matplotlib opencv-python Pillow pandas flask flask-cors
```

### Step 4 — Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 5 — Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 6 — Configure ML API Path

Open `ml_api.py` and update model path:

```python
MODEL_PATH  = r'path\to\Models\EfficientNetB4_finetuned.keras'
CLASS_NAMES = ['normal', 'pneumonia', 'tuberculosis']
```

### Step 7 — Create Backend .env File

Create `backend/.env`:

```
PORT=5000
ML_API_URL=http://localhost:8000
JWT_SECRET=xray_fyp_secret_2024
```

---

## Model Download

Models are too large for GitHub. Download from Google Drive:

| Model | Link | Size |
|-------|------|------|
| EfficientNetB4_finetuned.keras (Best) | [Download]((https://drive.google.com/file/d/11whDMxIXhlL8ayWziuqeXOcDzLp_FsR-/view?usp=sharing)) | 156 MB |
| EfficientNetB4_best.keras | [Download]((https://drive.google.com/file/d/1KL8zjR3nfnI1H7a5kb_UnbPG_sxWaJK_/view?usp=sharing)) | 118 MB |
| xray_model_v3.keras | [Download]((https://drive.google.com/file/d/1FkCeGo2p5JxU1C22GjZjzcR--hPV_S4U/view?usp=sharing)) | 176 MB |

After downloading place models in:
Models/EfficientNetB4_finetuned.keras

## ▶️ Running the Application

Open **3 separate terminals** in VS Code:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
Expected output:
```
✅ JSON database ready
🚀 Server running on http://localhost:5000
📦 Database: JSON File (no installation needed)
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```

**Terminal 3 — ML API:**
```bash
python ml_api.py
```
Expected output:
```
✅ Model loaded successfully
🚀 ML API running on http://localhost:8000
```

Open browser at **http://localhost:3000**

---

## 🗄️ Database

This project uses a **JSON file database** — no database server installation required.

Data is stored in:
```
backend/data/
    scans.json      ← all scan records + heatmaps
    patients.json   ← all patient records
backend/uploads/    ← uploaded X-ray images
```

Benefits:
- ✅ No MongoDB or SQLite installation needed
- ✅ Works on any machine immediately
- ✅ Data persists between sessions
- ✅ Easy to backup — just copy the data/ folder

---

## 📊 Dataset

| Split | Normal | Pneumonia | Tuberculosis | Total |
|-------|--------|-----------|--------------|-------|
| Train (augmented) | 9,000 | 9,000 | 9,000 | 27,000 |
| Val (augmented) | 600 | 600 | 600 | 1,800 |
| Test (original) | 476 | 432 | 543 | 1,451 |

Dataset sources:
- Kaggle Chest X-Ray dataset (Pneumonia/Normal)
- Montgomery County X-ray Set (Tuberculosis)
- Shenzhen Hospital X-ray Set (Tuberculosis)

---

## 🧠 ML Pipeline

```
Raw Dataset (16,977 images)
    ↓ 01_preprocessing.ipynb
Cleaned & Balanced Dataset
    ↓ 02_training_testing.ipynb
Trained EfficientNetB4 (87.46% accuracy)
    ↓ bias_detection.ipynb
Zero bias confirmed
    ↓ evaluate_all_models.ipynb
Model comparison & selection
    ↓ model_monitoring.ipynb
Health dashboard & drift detection
    ↓ ml_api.py
Flask REST API (port 8000)
```

---

## 👥 Team

| Member | Role | Responsibilities |
|--------|------|-----------------|
| Member 1 | Frontend + Documentation | React pages, Heatmap viewer, Theme system, Sidebar, Docs |
| Member 2 | Backend Development | Express API, File uploads, ML integration, JSON database |
| Member 3 | Model Training & ML | Preprocessing, EfficientNetB4, Fine-tuning, Grad-CAM, Bias detection |

---

## 🤖 AI Tools Declaration

This project utilized AI language models including **Claude Sonnet 4.6** (Anthropic) and **Google Gemini** (Google DeepMind) as development assistants for code suggestions, debugging support, and documentation drafting. All final code, results, analysis, and conclusions were independently verified and are the work of the project team.

---

## 📚 Key References

1. Tan & Le (2019) — EfficientNet: Rethinking Model Scaling — ICML
2. Selvaraju et al. (2017) — Grad-CAM — ICCV
3. Rajpurkar et al. (2017) — CheXNet — Stanford ML Group
4. Jaeger et al. (2014) — Montgomery TB Dataset — Quant Imaging Med Surg
5. Kermany et al. (2018) — Chest X-Ray Dataset — Cell

---

## 📄 License

This project is licensed under the MIT License.

---

*Final Year Project — AI-Powered X-Ray Detection System — 2025/2026*
