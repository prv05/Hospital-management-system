import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  getDoctorDashboard,
  getDoctorAppointments,
  getPatientQueue,
  getDoctorPatients,
  searchPatients,
  getPatientDetails,
  updateConsultationNotes,
  updateAppointmentStatus,
  getDoctorAnalytics,
  updatePatientMedicalHistory,
  addSurgeryRecord,
  addVaccinationRecord,
  addPrescription,
  addNewPatient,
  admitPatient,
  getAvailableBeds,
  orderLabTest,
  getDoctorLabTests,
  getLabTestDetails,
  getPatientLabTests,
  getDoctorPrescriptions,
  getPrescriptionDetails,
  getPatientPrescriptions
} from '../controllers/doctorController.js';

const router = express.Router();

// All routes are protected and require doctor role
router.use(authenticate);
router.use(authorize('doctor'));

router.get('/dashboard', getDoctorDashboard);
router.get('/appointments', getDoctorAppointments);
router.get('/queue', getPatientQueue);
router.get('/patients', getDoctorPatients);
router.get('/patients/search', searchPatients);
router.get('/patients/:id', getPatientDetails);
router.put('/patients/:id/medical-history', updatePatientMedicalHistory);
router.post('/patients/:id/surgeries', addSurgeryRecord);
router.post('/patients/:id/vaccinations', addVaccinationRecord);
router.post('/patients/:id/prescriptions', addPrescription);
router.get('/patients/:id/prescriptions', getPatientPrescriptions);
router.post('/patients/:id/lab-tests', orderLabTest);
router.get('/patients/:id/lab-tests', getPatientLabTests);
router.put('/appointments/:id/consultation', updateConsultationNotes);
router.patch('/appointments/:id/status', updateAppointmentStatus);
router.get('/analytics', getDoctorAnalytics);

// New routes for adding and admitting patients
router.post('/patients', addNewPatient);
router.post('/admissions', admitPatient);
router.get('/beds/available', getAvailableBeds);

// Lab test routes
router.get('/lab-tests', getDoctorLabTests);
router.get('/lab-tests/:id', getLabTestDetails);

// Prescription routes
router.get('/prescriptions', getDoctorPrescriptions);
router.get('/prescriptions/:id', getPrescriptionDetails);

export default router;
