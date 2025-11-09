import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  getNurseDashboard,
  getAssignedPatients,
  recordVitals,
  getBedOccupancy,
  recordMedicationAdministration,
  markAttendance,
  updatePatientObservations,
  getAllBeds,
  updateBedAssignment,
  dischargeBed
} from '../controllers/nurseController.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('nurse'));

router.get('/dashboard', getNurseDashboard);
router.get('/patients', getAssignedPatients);
router.post('/patients/:id/vitals', recordVitals);
router.put('/patients/:id/observations', updatePatientObservations);
router.get('/beds', getBedOccupancy);
router.get('/beds/all', getAllBeds);
router.put('/beds/:id/assign', updateBedAssignment);
router.put('/beds/:id/discharge', dischargeBed);
router.post('/patients/:id/medication', recordMedicationAdministration);
router.post('/attendance', markAttendance);

export default router;
