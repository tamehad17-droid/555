import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

const partnerController = {
  getPartners: async (req, res) => {
    res.json({ success: true, data: { message: 'Partners endpoint - To be implemented' } });
  },
};

router.use(authenticate);

router.get('/', asyncHandler(partnerController.getPartners));

export default router;
