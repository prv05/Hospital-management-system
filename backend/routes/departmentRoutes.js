import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import Department from '../models/Department.js';
import Doctor from '../models/Doctor.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const departments = await Department.find({ isActive: true })
    .populate('head')
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: departments.length,
    data: departments
  });
}));

// @desc    Get department by ID
// @route   GET /api/departments/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id)
    .populate('head');

  if (!department) {
    return res.status(404).json({
      success: false,
      message: 'Department not found'
    });
  }

  // Get doctors in this department
  const doctors = await Doctor.find({ department: department._id, isActive: true })
    .populate('user');

  res.status(200).json({
    success: true,
    data: {
      department,
      doctors
    }
  });
}));

export default router;
