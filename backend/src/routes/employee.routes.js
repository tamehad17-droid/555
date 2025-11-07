import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

const employeeController = {
  getEmployees: async (req, res) => {
    res.json({ success: true, data: { message: 'Employees endpoint - To be implemented' } });
  },
};

router.use(authenticate);

router.get('/', asyncHandler(employeeController.getEmployees));

export default router;
