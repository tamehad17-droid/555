import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

const payrollController = {
  getPayrolls: async (req, res) => {
    res.json({ success: true, data: { message: 'Payroll endpoint - To be implemented' } });
  },
};

router.use(authenticate);

router.get('/', asyncHandler(payrollController.getPayrolls));

export default router;
