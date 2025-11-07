import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

const alertController = {
  getAlerts: async (req, res) => {
    res.json({ success: true, data: { message: 'Alerts endpoint - To be implemented' } });
  },
};

router.use(authenticate);

router.get('/', asyncHandler(alertController.getAlerts));

export default router;
