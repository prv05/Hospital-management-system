import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  getAdminDashboard,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllDepartments,
  getDepartmentDoctors,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAllBeds,
  createBed,
  updateBed,
  deleteBed,
  getAnalytics,
  getAllAppointments,
  assignPatientToNurse,
  unassignPatientFromNurse
} from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/departments', getAllDepartments);
router.get('/departments/:id/doctors', getDepartmentDoctors);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);
router.get('/beds', getAllBeds);
router.post('/beds', createBed);
router.put('/beds/:id', updateBed);
router.delete('/beds/:id', deleteBed);
router.get('/appointments', getAllAppointments);
router.get('/analytics', getAnalytics);
router.post('/nurses/:nurseId/assign-patient', assignPatientToNurse);
router.delete('/nurses/:nurseId/unassign-patient/:patientId', unassignPatientFromNurse);

export default router;
