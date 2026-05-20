# 🫁 PneumoScan AI — X-Ray Detection System
**FYP Project | AI-Powered Pneumonia & Tuberculosis Detection**

---

## Project Structure

```
xray-detection/
├── backend/                  ← Node.js + Express API
│   ├── server.js             ← Main server entry point
│   ├── models/               ← MongoDB schemas
│   │   ├── Patient.js
│   │   └── Scan.js
│   ├── routes/               ← API endpoints
│   │   ├── scans.js          ← /api/scans
│   │   ├── patients.js       ← /api/patients
│   │   └── reports.js        ← /api/reports
│   ├── middleware/
│   │   └── upload.js         ← Multer file upload config
│   ├── uploads/              ← Uploaded X-ray images stored here
│   └── .env.example          ← Environment variables template
│
├── frontend/                 ← React.js UI
│   ├── public/index.html
│   └── src/
│       ├── App.jsx           ← Root component + routing
│       ├── index.css         ← Global styles + CSS variables
│       ├── pages/
│       │   ├── Dashboard.jsx         ← Main dashboard
│       │   ├── ScansManagement.jsx   ← Upload + scan list
│       │   ├── PatientRecords.jsx    ← Patient management
│       │   └── Reports.jsx           ← Analytics + charts
│       ├── components/
│       │   └── Sidebar.jsx           ← Navigation sidebar
│       └── services/
│           └── api.js                ← Axios API calls + mock data
│
└── README.md
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Step 1 — Clone / Setup

```bash
# If you downloaded the zip, extract and open in VS Code
# Then open two terminals side by side
```

### Step 2 — Backend Setup

```bash
# Terminal 1
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:5000
✅ MongoDB connected
✅ Database seeded with sample data
```

### Step 3 — Frontend Setup

```bash
# Terminal 2
cd frontend
npm install
npm start
```

Browser opens at `http://localhost:3000` automatically.

---

## Environment Variables (backend/.env)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/xray_detection
ML_API_URL=http://localhost:8000
JWT_SECRET=your_secret_key_here
```

**MONGO_URI options:**
- Local MongoDB: `mongodb://localhost:27017/xray_detection`
- MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/xray_detection`

---

## API Endpoints

### Scans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/scans | Get all scans (with filters) |
| GET | /api/scans/:id | Get scan by ID |
| POST | /api/scans/upload | Upload X-ray images |
| PATCH | /api/scans/:id/status | Update scan status |
| DELETE | /api/scans/:id | Delete scan |
| GET | /api/scans/stats/dashboard | Dashboard statistics |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/patients | Get all patients |
| GET | /api/patients/:id | Get patient + their scans |
| POST | /api/patients | Create new patient |
| PUT | /api/patients/:id | Update patient |
| DELETE | /api/patients/:id | Delete patient |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/reports/analytics | Get analytics data |

---

## Connecting Your ML Model

When your ML model (from the Jupyter notebooks) is ready, create a Python Flask API:

```python
# ml_api.py — run this alongside backend
from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image

app = Flask(__name__)

# Load your trained model
model = tf.keras.models.load_model(r'G:\My Drive\FYP\xray_model_v3.keras')
CLASS_NAMES = ['NORMAL', 'PNEUMONIA']

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    image_path = data['image_path']
    
    img = Image.open(image_path).convert('RGB').resize((224, 224))
    img_array = np.expand_dims(np.array(img) / 255.0, axis=0)
    
    preds = model.predict(img_array)[0]
    pred_idx = np.argmax(preds)
    
    return jsonify({
        'prediction': CLASS_NAMES[pred_idx],
        'confidence': float(preds[pred_idx]) * 100,
        'results': {
            'normal': float(preds[0]),
            'pneumonia': float(preds[1]),
        }
    })

if __name__ == '__main__':
    app.run(port=8000)
```

```bash
# Terminal 3
pip install flask tensorflow pillow
python ml_api.py
```

The backend automatically calls this ML API when a scan is uploaded. If the ML API is not running, it falls back to mock results so the UI still works.

---

## Pages Overview

| Page | Route | Features |
|------|-------|---------|
| Dashboard | Default | Stats, X-ray analysis, Grad-CAM heatmap, recent scans |
| Scans Management | Scans tab | Drag & drop upload, scan list, filters |
| Patient Records | Patients tab | Full patient list, add/search/filter patients |
| Reports & Analytics | Reports tab | Disease prevalence pie chart, scan volume bar chart, batch reporting |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Recharts, React Dropzone |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| File Upload | Multer |
| ML Model | TensorFlow/Keras (ResNet50) |
| ML API Bridge | Python Flask |
| Fonts | Syne + DM Sans (Google Fonts) |

---

## MongoDB Setup (If Not Installed)

**Option A — Install MongoDB locally:**
Download from https://www.mongodb.com/try/download/community

**Option B — MongoDB Atlas (Free Cloud):**
1. Go to https://cloud.mongodb.com
2. Create free cluster
3. Get connection string
4. Paste into MONGO_URI in .env

---

## Common Issues

| Error | Fix |
|-------|-----|
| `Cannot connect to MongoDB` | Start MongoDB service or use Atlas |
| `Port 5000 in use` | Change PORT in .env to 5001 |
| `Module not found` | Run `npm install` in both frontend and backend |
| `ML API timeout` | Normal — app uses mock data when ML API is off |

