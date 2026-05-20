const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  scanId: { type: String, unique: true, required: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  scanType: { type: String, enum: ['Chest X-ray', 'CT'], default: 'Chest X-ray' },
  scanDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Pending', 'Analyzed', 'Flagged', 'Normal'], default: 'Pending' },
  imagePath: { type: String },
  heatmapPath: { type: String },
  originalPath: { type: String },
  aiConfidence: { type: Number },
  detectionResults: {
    pneumonia: { type: Number, default: 0 },
    tuberculosis: { type: Number, default: 0 },
    normal: { type: Number, default: 0 },
    viralPneumonia: { type: Number, default: 0 },
    bacterialPneumonia: { type: Number, default: 0 }
  },
  prediction: { type: String },
  reviewedBy: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Scan', scanSchema);
