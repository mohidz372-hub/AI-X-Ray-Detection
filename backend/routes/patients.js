const express = require('express');
const router  = express.Router();
const { read, write } = require('../database');

// GET /api/patients
router.get('/', (req, res) => {
  try {
    const patients = read('patients').sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: patients });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/patients/:id
router.get('/:id', (req, res) => {
  try {
    const patient = read('patients').find(p => p.patientId === req.params.id);
    if (!patient) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: patient });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/patients
router.post('/', (req, res) => {
  try {
    const { name, contact, age, gender, ageGroup } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Name required' });

    const patients  = read('patients');
    const patientId = `PAT-${Date.now()}`;
    const newPatient = {
      patientId,
      name,
      contact   : contact  || '',
      age       : age       || 0,
      gender    : gender    || 'Male',
      ageGroup  : ageGroup  || '30-39',
      createdAt : new Date().toISOString()
    };

    patients.unshift(newPatient);
    write('patients', patients);
    res.json({ success: true, data: newPatient });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// DELETE /api/patients/:id
router.delete('/:id', (req, res) => {
  try {
    const patients = read('patients').filter(p => p.patientId !== req.params.id);
    write('patients', patients);
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
