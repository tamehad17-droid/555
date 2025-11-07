import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

const userController = {
  getUsers: async (req, res) => {
    res.json({ success: true, data: { message: 'Users endpoint - To be implemented' } });
  },
};

router.use(authenticate);

router.get('/', asyncHandler(userController.getUsers));

export default router;
