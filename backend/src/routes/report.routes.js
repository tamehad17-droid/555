import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

const reportController = {
  getReports: async (req, res) => {
    res.json({ success: true, data: { message: 'Reports endpoint - To be implemented' } });
  },
};

router.use(authenticate);

router.get('/', asyncHandler(reportController.getReports));

export default router;
