import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  generateBill,
  searchBills,
  getBillById,
  addPayment,
  getRevenueAnalytics,
  applyDiscount
} from '../controllers/billingController.js';

const router = express.Router();

router.use(authenticate);

router.post('/generate', authorize('billing', 'admin'), generateBill);
router.get('/search', authorize('billing', 'admin'), searchBills);
router.get('/analytics', authorize('billing', 'admin'), getRevenueAnalytics);
router.get('/:id', getBillById);
router.post('/:id/payment', authorize('billing', 'admin'), addPayment);
router.patch('/:id/discount', authorize('billing', 'admin'), applyDiscount);

export default router;
