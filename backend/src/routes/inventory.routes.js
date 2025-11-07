import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

const inventoryController = {
  getItems: async (req, res) => {
    res.json({ success: true, data: { message: 'Inventory endpoint - To be implemented' } });
  },
};

router.use(authenticate);

router.get('/items', asyncHandler(inventoryController.getItems));

export default router;
