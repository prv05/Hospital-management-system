import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  getPatientDashboard,
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getMedicalHistory,
  getBillingHistory,
  updateProfile,
  getDepartments,
  getDoctorsByDepartment
} from '../controllers/patientController.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('patient'));

router.get('/dashboard', getPatientDashboard);
router.get('/departments', getDepartments);
router.get('/doctors', getDoctorsByDepartment);
router.post('/appointments', bookAppointment);
router.get('/appointments', getMyAppointments);
router.delete('/appointments/:id', cancelAppointment);
router.get('/medical-history', getMedicalHistory);
router.get('/billing', getBillingHistory);
router.put('/profile', updateProfile);

export default router;
