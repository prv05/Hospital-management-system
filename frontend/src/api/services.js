import api from './axios';

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// Doctor APIs
export const doctorAPI = {
  getDashboard: () => api.get('/doctors/dashboard'),
  getAppointments: (params) => api.get('/doctors/appointments', { params }),
  getQueue: () => api.get('/doctors/queue'),
  searchPatients: (query) => api.get('/doctors/patients/search', { params: { query } }),
  getPatientDetails: (id) => api.get(`/doctors/patients/${id}`),
  updateConsultation: (id, data) => api.put(`/doctors/appointments/${id}/consultation`, data),
  updateAppointmentStatus: (id, status) => api.patch(`/doctors/appointments/${id}/status`, { status }),
  getAnalytics: (period) => api.get('/doctors/analytics', { params: { period } }),
  updatePatientMedicalHistory: (id, data) => api.put(`/doctors/patients/${id}/medical-history`, data),
  addSurgeryRecord: (id, data) => api.post(`/doctors/patients/${id}/surgeries`, data),
  addVaccinationRecord: (id, data) => api.post(`/doctors/patients/${id}/vaccinations`, data),
  addPrescription: (id, data) => api.post(`/doctors/patients/${id}/prescriptions`, data),
};

// Patient APIs
export const patientAPI = {
  getDashboard: () => api.get('/patients/dashboard'),
  bookAppointment: (data) => api.post('/patients/appointments', data),
  getAppointments: (params) => api.get('/patients/appointments', { params }),
  cancelAppointment: (id, reason) => api.delete(`/patients/appointments/${id}`, { data: { reason } }),
  getMedicalHistory: () => api.get('/patients/medical-history'),
  getBillingHistory: () => api.get('/patients/billing'),
  updateProfile: (data) => api.put('/patients/profile', data),
  getDepartments: () => api.get('/patients/departments'),
  getDoctors: (departmentId) => api.get('/patients/doctors', { params: { department: departmentId } }),
};

// Nurse APIs
export const nurseAPI = {
  getDashboard: () => api.get('/nurses/dashboard'),
  getAssignedPatients: () => api.get('/nurses/patients'),
  recordVitals: (patientId, data) => api.post(`/nurses/patients/${patientId}/vitals`, data),
  updateObservations: (patientId, data) => api.put(`/nurses/patients/${patientId}/observations`, data),
  getBedOccupancy: (params) => api.get('/nurses/beds', { params }),
  recordMedication: (patientId, data) => api.post(`/nurses/patients/${patientId}/medication`, data),
  markAttendance: (data) => api.post('/nurses/attendance', data),
};

// Billing APIs
export const billingAPI = {
  generateBill: (data) => api.post('/billing/generate', data),
  searchBills: (params) => api.get('/billing/search', { params }),
  getBill: (id) => api.get(`/billing/${id}`),
  addPayment: (id, data) => api.post(`/billing/${id}/payment`, data),
  getAnalytics: (period) => api.get('/billing/analytics', { params: { period } }),
  applyDiscount: (id, data) => api.patch(`/billing/${id}/discount`, data),
};

// Pharmacy APIs
export const pharmacyAPI = {
  getAllMedicines: (params) => api.get('/pharmacy/medicines', { params }),
  addMedicine: (data) => api.post('/pharmacy/medicines', data),
  updateMedicine: (id, data) => api.put(`/pharmacy/medicines/${id}`, data),
  deleteMedicine: (id) => api.delete(`/pharmacy/medicines/${id}`),
  dispenseMedicine: (data) => api.post('/pharmacy/dispense', data),
  updateStock: (id, data) => api.patch(`/pharmacy/medicines/${id}/stock`, data),
  getAnalytics: () => api.get('/pharmacy/analytics'),
  getAlerts: () => api.get('/pharmacy/alerts'),
};

// Lab APIs
export const labAPI = {
  getAllTests: (params) => api.get('/lab/tests', { params }),
  createTest: (data) => api.post('/lab/tests', data),
  updateTestStatus: (id, status) => api.patch(`/lab/tests/${id}/status`, { status }),
  addTestResults: (id, data) => api.put(`/lab/tests/${id}/results`, data),
  getTest: (id) => api.get(`/lab/tests/${id}`),
  getAnalytics: (period) => api.get('/lab/analytics', { params: { period } }),
  getPendingTests: () => api.get('/lab/pending'),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getDepartments: () => api.get('/admin/departments'),
  getDepartmentDoctors: (id) => api.get(`/admin/departments/${id}/doctors`),
  createDepartment: (data) => api.post('/admin/departments', data),
  updateDepartment: (id, data) => api.put(`/admin/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/admin/departments/${id}`),
  getBeds: () => api.get('/admin/beds'),
  createBed: (data) => api.post('/admin/beds', data),
  updateBed: (id, data) => api.put(`/admin/beds/${id}`, data),
  deleteBed: (id) => api.delete(`/admin/beds/${id}`),
  getAnalytics: (period) => api.get('/admin/analytics', { params: { period } }),
};

// Department APIs
export const departmentAPI = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
};

// Appointment APIs
export const appointmentAPI = {
  getById: (id) => api.get(`/appointments/${id}`),
};
