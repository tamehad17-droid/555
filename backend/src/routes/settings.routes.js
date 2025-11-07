import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

const settingsController = {
  getSettings: async (req, res) => {
    res.json({ success: true, data: { message: 'Settings endpoint - To be implemented' } });
  },
};

router.use(authenticate);

router.get('/', asyncHandler(settingsController.getSettings));

export default router;
