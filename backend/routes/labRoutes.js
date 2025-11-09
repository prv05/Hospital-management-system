import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  getAllLabTests,
  createLabTest,
  updateTestStatus,
  addTestResults,
  getTestById,
  getLabAnalytics,
  getPendingTests
} from '../controllers/labController.js';

const router = express.Router();

router.use(authenticate);

router.get('/tests', authorize('lab', 'admin'), getAllLabTests);
router.post('/tests', authorize('doctor', 'admin'), createLabTest);
router.patch('/tests/:id/status', authorize('lab', 'admin'), updateTestStatus);
router.put('/tests/:id/results', authorize('lab', 'admin'), addTestResults);
router.get('/tests/:id', getTestById);
router.get('/analytics', authorize('lab', 'admin'), getLabAnalytics);
router.get('/pending', authorize('lab', 'admin'), getPendingTests);

export default router;
