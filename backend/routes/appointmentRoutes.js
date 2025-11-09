import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import Appointment from '../models/Appointment.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patient')
    .populate('doctor')
    .populate('department');

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  res.status(200).json({
    success: true,
    data: appointment
  });
}));

export default router;
