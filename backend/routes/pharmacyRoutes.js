import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  getAllMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  dispenseMedicine,
  updateStock,
  getPharmacyAnalytics,
  getStockAlerts,
  getAllPrescriptions,
  getPrescription
} from '../controllers/pharmacyController.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('pharmacy', 'admin'));

router.get('/medicines', getAllMedicines);
router.post('/medicines', addMedicine);
router.put('/medicines/:id', updateMedicine);
router.delete('/medicines/:id', deleteMedicine);
router.post('/dispense', dispenseMedicine);
router.patch('/medicines/:id/stock', updateStock);
router.get('/analytics', getPharmacyAnalytics);
router.get('/alerts', getStockAlerts);
router.get('/prescriptions', getAllPrescriptions);
router.get('/prescriptions/:id', getPrescription);

export default router;
