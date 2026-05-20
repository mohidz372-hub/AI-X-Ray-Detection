import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

export const scansAPI = {
  getAll: (params) => API.get('/scans', { params }),
  getById: (id) => API.get(`/scans/${id}`),
  upload: (formData) => API.post('/scans/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateStatus: (id, status) => API.patch(`/scans/${id}/status`, { status }),
  delete: (id) => API.delete(`/scans/${id}`),
  getDashboardStats: () => API.get('/scans/stats/dashboard'),
};

export const patientsAPI = {
  getAll: (params) => API.get('/patients', { params }),
  create: (data) => API.post('/patients', data),
  update: (id, data) => API.put(`/patients/${id}`, data),
  delete: (id) => API.delete(`/patients/${id}`),
};

export const reportsAPI = {
  getAnalytics: () => API.get('/reports/analytics'),
};

export const mockData = {
  stats: { totalToday: 24, positive: 9, pending: 4, modelAccuracy: 96, yesterdayDiff: 3 },
  recentScans: [
    { scanId: 'Scan 101551', patientName: 'Amir Ullah', scanDate: '17/09/2023', status: 'Analyzed', prediction: 'Pneumonia', aiConfidence: 94 },
    { scanId: 'Scan 100225', patientName: 'Sara Rahman', scanDate: '07/08/2023', status: 'Normal', prediction: 'Normal', aiConfidence: 91 },
    { scanId: 'Scan 100332', patientName: 'Bilal Khan', scanDate: '07/08/2023', status: 'Pending', prediction: 'Pending', aiConfidence: 99 },
    { scanId: 'Scan 100233', patientName: 'Bilal Khan', scanDate: '07/08/2023', status: 'Normal', prediction: 'Normal', aiConfidence: 93 },
    { scanId: 'Scan 100937', patientName: 'Fatima Noor', scanDate: '28/09/2023', status: 'Flagged', prediction: 'Tuberculosis', aiConfidence: 97 },
  ],
  patients: [
    { patientId: '211001', name: 'Amir Ullah', contact: '(374) 373833', scanDate: '03/10/2023', lastStatus: 'Pneumonia' },
    { patientId: '211002', name: 'Sara Rahman', contact: '(374) 373562', scanDate: '01/09/2023', lastStatus: 'Normal' },
    { patientId: '211003', name: 'Bilal Khan', contact: '(574) 375558', scanDate: '13/09/2023', lastStatus: 'Pneumonia' },
    { patientId: '211004', name: 'Bilal Khan', contact: '(574) 373582', scanDate: '13/09/2023', lastStatus: 'Normal' },
    { patientId: '211005', name: 'Fatimo Noor', contact: '(574) 373853', scanDate: '15/09/2023', lastStatus: 'Randing' },
    { patientId: '211006', name: 'Bilal Khan', contact: '(574) 373858', scanDate: '15/09/2023', lastStatus: 'Normal' },
    { patientId: '211007', name: 'Bilal Khan', contact: '(574) 373852', scanDate: '10/01/2023', lastStatus: 'Randing' },
    { patientId: '211008', name: 'Fatimo Noor', contact: '(514) 373053', scanDate: '03/08/2023', lastStatus: 'Randing' },
  ],
  analytics: {
    prevalence: [
      { name: 'Pneumonia', value: 33 }, { name: 'Tuberculosis', value: 25 },
      { name: 'Tobomatia', value: 22 }, { name: 'Normal', value: 20 }
    ],
    scanVolume: [
      { month: 'Jan', scans: 45, positive: 28 }, { month: 'Feb', scans: 62, positive: 35 },
      { month: 'Mar', scans: 58, positive: 30 }, { month: 'Apr', scans: 80, positive: 48 },
      { month: 'May', scans: 95, positive: 55 }, { month: 'Jun', scans: 110, positive: 62 },
      { month: 'Jul', scans: 130, positive: 80 }, { month: 'Aug', scans: 145, positive: 90 }
    ]
  }
};
