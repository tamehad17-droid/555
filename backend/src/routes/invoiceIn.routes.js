import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

const invoiceInController = {
  getInvoices: async (req, res) => {
    res.json({ success: true, data: { message: 'Invoices In endpoint - To be implemented' } });
  },
};

router.use(authenticate);

router.get('/', asyncHandler(invoiceInController.getInvoices));

export default router;
