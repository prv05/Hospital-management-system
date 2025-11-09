import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  getDoctorDashboard,
  getDoctorAppointments,
  getPatientQueue,
  searchPatients,
  getPatientDetails,
  updateConsultationNotes,
  updateAppointmentStatus,
  getDoctorAnalytics,
  updatePatientMedicalHistory,
  addSurgeryRecord,
  addVaccinationRecord,
  addPrescription
} from '../controllers/doctorController.js';

const router = express.Router();

// All routes are protected and require doctor role
router.use(authenticate);
router.use(authorize('doctor'));

router.get('/dashboard', getDoctorDashboard);
router.get('/appointments', getDoctorAppointments);
router.get('/queue', getPatientQueue);
router.get('/patients/search', searchPatients);
router.get('/patients/:id', getPatientDetails);
router.put('/patients/:id/medical-history', updatePatientMedicalHistory);
router.post('/patients/:id/surgeries', addSurgeryRecord);
router.post('/patients/:id/vaccinations', addVaccinationRecord);
router.post('/patients/:id/prescriptions', addPrescription);
router.put('/appointments/:id/consultation', updateConsultationNotes);
router.patch('/appointments/:id/status', updateAppointmentStatus);
router.get('/analytics', getDoctorAnalytics);

export default router;
