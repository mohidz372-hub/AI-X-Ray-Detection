const fs   = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const FILES = {
  patients : path.join(DATA_DIR, 'patients.json'),
  scans    : path.join(DATA_DIR, 'scans.json'),
};

// Read a collection
function read(collection) {
  const file = FILES[collection];
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

// Write a collection
function write(collection, data) {
  fs.writeFileSync(FILES[collection], JSON.stringify(data, null, 2));
}

// Seed default data
function seed() {
  if (read('patients').length === 0) {
    write('patients', [
      { patientId: '211001', name: 'Amir Ullah',   contact: '(374) 373833', age: 35, gender: 'Male',   ageGroup: '30-39', createdAt: new Date().toISOString() },
      { patientId: '211002', name: 'Sara Rahman',  contact: '(374) 373562', age: 28, gender: 'Female', ageGroup: '18-29', createdAt: new Date().toISOString() },
      { patientId: '211003', name: 'Bilal Khan',   contact: '(574) 375558', age: 42, gender: 'Male',   ageGroup: '40-49', createdAt: new Date().toISOString() },
      { patientId: '211004', name: 'Fatima Noor',  contact: '(574) 373853', age: 31, gender: 'Female', ageGroup: '30-39', createdAt: new Date().toISOString() },
      { patientId: '211005', name: 'Hassan Ali',   contact: '(514) 373053', age: 55, gender: 'Male',   ageGroup: '50-60+',createdAt: new Date().toISOString() },
    ]);
    console.log('✅ Patients seeded');
  }

  if (read('scans').length === 0) {
    write('scans', [
      { scanId: 'SCAN-101551', patientId: '211001', patientName: 'Amir Ullah',  status: 'Analyzed', prediction: 'PNEUMONIA',    aiConfidence: 94, scanDate: new Date().toISOString(), imagePath: null, detectionResults: { pneumonia: 0.89, tuberculosis: 0.12, normal: 0.01 }, createdAt: new Date().toISOString() },
      { scanId: 'SCAN-100225', patientId: '211002', patientName: 'Sara Rahman', status: 'Normal',   prediction: 'NORMAL',       aiConfidence: 91, scanDate: new Date().toISOString(), imagePath: null, detectionResults: { pneumonia: 0.05, tuberculosis: 0.02, normal: 0.93 }, createdAt: new Date().toISOString() },
      { scanId: 'SCAN-100937', patientId: '211004', patientName: 'Fatima Noor', status: 'Flagged',  prediction: 'TUBERCULOSIS', aiConfidence: 97, scanDate: new Date().toISOString(), imagePath: null, detectionResults: { pneumonia: 0.15, tuberculosis: 0.78, normal: 0.07 }, createdAt: new Date().toISOString() },
    ]);
    console.log('✅ Scans seeded');
  }
}

seed();
console.log('✅ JSON database ready →', DATA_DIR);

module.exports = { read, write };
