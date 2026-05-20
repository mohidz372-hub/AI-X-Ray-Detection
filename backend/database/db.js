const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'xray_detection.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeDatabase() {
  db.exec(`
    -- Users table (doctors/radiologists)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'doctor',
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Patients table
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      contact TEXT,
      age_group TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Scans table
    CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scan_id TEXT UNIQUE NOT NULL,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      scan_type TEXT DEFAULT 'Chest X-ray',
      scan_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      image_path TEXT NOT NULL,
      heatmap_path TEXT,
      status TEXT DEFAULT 'Pending',
      ai_result TEXT,
      ai_confidence REAL,
      pneumonia_prob REAL,
      tuberculosis_prob REAL,
      normal_prob REAL,
      viral_pneumonia_prob REAL,
      bacterial_pneumonia_prob REAL,
      flagged INTEGER DEFAULT 0,
      reviewed_by INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reviewed_by) REFERENCES users(id)
    );

    -- Reports table
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      template TEXT,
      generated_by INTEGER,
      file_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (generated_by) REFERENCES users(id)
    );

    -- Analytics snapshots
    CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL,
      year INTEGER NOT NULL,
      total_scans INTEGER DEFAULT 0,
      pneumonia_count INTEGER DEFAULT 0,
      tuberculosis_count INTEGER DEFAULT 0,
      normal_count INTEGER DEFAULT 0,
      pending_count INTEGER DEFAULT 0
    );
  `);

  // Seed default doctor account
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('dr.imran@xrayai.com');
  if (!existingUser) {
    const hashedPassword = bcrypt.hashSync('doctor123', 10);
    db.prepare(`
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `).run('Dr. Mohad Imran', 'dr.imran@xrayai.com', hashedPassword, 'doctor');
  }

  // Seed sample patients
  const patientsExist = db.prepare('SELECT COUNT(*) as count FROM patients').get();
  if (patientsExist.count === 0) {
    const patients = [
      ['211001', 'Amir Ullah',   28, 'Male',   '(374) 373833', '30-39'],
      ['211002', 'Sara Rahman',  34, 'Female', '(374) 373562', '30-39'],
      ['211003', 'Bilal Khan',   45, 'Male',   '(574) 375558', '30-39'],
      ['211004', 'Bilal Khan',   52, 'Male',   '(374) 373582', '50-60+'],
      ['211005', 'Fatima Noor',  29, 'Female', '(574) 373853', '30-39'],
      ['211006', 'Bilal Khan',   38, 'Male',   '(574) 373858', '30-39'],
      ['211007', 'Bilal Khan',   41, 'Male',   '(374) 373852', '30-39'],
      ['211008', 'Fatima Noor',  55, 'Female', '(514) 373053', '50-60+'],
    ];
    const insertPatient = db.prepare(`
      INSERT INTO patients (patient_id, name, age, gender, contact, age_group)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    patients.forEach(p => insertPatient.run(...p));
  }

  // Seed sample scans
  const scansExist = db.prepare('SELECT COUNT(*) as count FROM scans').get();
  if (scansExist.count === 0) {
    const scans = [
      ['Scan 101551', '211001', 'Amir Ullah',  'sample_xray.jpg', 'Analyzed', 'Pneumonia',    94, 0.87, 0.12, 0.01, 0.65, 0.22, 0, '2023-09-17'],
      ['Scan 100225', '211002', 'Sara Rahman', 'sample_xray.jpg', 'Analyzed', 'Normal',       91, 0.05, 0.02, 0.93, 0.03, 0.02, 0, '2023-09-07'],
      ['Scan 100332', '211003', 'Bilal Khan',  'sample_xray.jpg', 'Pending',  'Pneumonia',    99, 0.96, 0.03, 0.01, 0.74, 0.22, 0, '2023-09-07'],
      ['Scan 100233', '211004', 'Bilal Khan',  'sample_xray.jpg', 'Analyzed', 'Normal',       93, 0.04, 0.01, 0.95, 0.02, 0.02, 0, '2023-09-07'],
      ['Scan 100937', '211005', 'Fatima Noor', 'sample_xray.jpg', 'Flagged',  'Tuberculosis', 97, 0.15, 0.82, 0.03, 0.10, 0.05, 1, '2023-09-28'],
    ];
    const insertScan = db.prepare(`
      INSERT INTO scans (scan_id, patient_id, patient_name, image_path, status, ai_result,
        ai_confidence, pneumonia_prob, tuberculosis_prob, normal_prob,
        viral_pneumonia_prob, bacterial_pneumonia_prob, flagged, scan_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    scans.forEach(s => insertScan.run(...s));
  }

  // Seed analytics
  const analyticsExist = db.prepare('SELECT COUNT(*) as count FROM analytics').get();
  if (analyticsExist.count === 0) {
    const months = [
      ['Jan', 2023, 45, 28, 10, 7, 5],
      ['Feb', 2023, 62, 35, 14, 13, 7],
      ['Mar', 2023, 58, 30, 12, 16, 6],
      ['Apr', 2023, 75, 42, 18, 15, 8],
      ['May', 2023, 90, 55, 20, 15, 10],
      ['Jun', 2023, 80, 48, 16, 16, 9],
      ['Jul', 2023, 95, 60, 22, 13, 11],
      ['Aug', 2023, 110, 70, 25, 15, 12],
    ];
    const insertAnalytics = db.prepare(`
      INSERT INTO analytics (month, year, total_scans, pneumonia_count, tuberculosis_count, normal_count, pending_count)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    months.forEach(m => insertAnalytics.run(...m));
  }

  console.log('✅ Database initialized successfully');
}

module.exports = { db, initializeDatabase };
