import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

const invoiceOutController = {
  getInvoices: async (req, res) => {
    res.json({ success: true, data: { message: 'Invoices Out endpoint - To be implemented' } });
  },
};

router.use(authenticate);

router.get('/', asyncHandler(invoiceOutController.getInvoices));

export default router;
