import express from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validators.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import storeController from '../controllers/store.controller.js';

const router = express.Router();

router.use(authenticate);

/**
 * @route   GET /api/stores
 * @desc    Get all stores (System Owner only)
 * @access  Private (System Owner)
 */
router.get(
  '/',
  authorize('system_owner'),
  asyncHandler(storeController.getAllStores)
);

/**
 * @route   POST /api/stores
 * @desc    Create new store (System Owner only)
 * @access  Private (System Owner)
 */
router.post(
  '/',
  authorize('system_owner'),
  [
    body('storeName').trim().notEmpty().withMessage('Store name is required'),
    body('ownerUsername').trim().notEmpty().withMessage('Owner username is required'),
    body('ownerFullName').trim().notEmpty().withMessage('Owner full name is required'),
    body('ownerEmail').isEmail().withMessage('Valid email is required'),
    body('ownerPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate,
  ],
  asyncHandler(storeController.createStore)
);

/**
 * @route   GET /api/stores/:id
 * @desc    Get store details
 * @access  Private
 */
router.get(
  '/:id',
  asyncHandler(storeController.getStore)
);

/**
 * @route   PUT /api/stores/:id
 * @desc    Update store
 * @access  Private (System Owner or Store Owner)
 */
router.put(
  '/:id',
  asyncHandler(storeController.updateStore)
);

/**
 * @route   PUT /api/stores/:id/subscription
 * @desc    Update store subscription (System Owner only)
 * @access  Private (System Owner)
 */
router.put(
  '/:id/subscription',
  authorize('system_owner'),
  [
    body('subscriptionPlan').isIn(['free', 'monthly', '6months', 'yearly']).withMessage('Invalid subscription plan'),
    validate,
  ],
  asyncHandler(storeController.updateSubscription)
);

/**
 * @route   POST /api/stores/:id/subscription-request
 * @desc    Handle subscription request (approve/reject)
 * @access  Private (System Owner)
 */
router.post(
  '/:id/subscription-request',
  authorize('system_owner'),
  [
    body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
    validate,
  ],
  asyncHandler(storeController.handleSubscriptionRequest)
);

/**
 * @route   PUT /api/stores/:id/status
 * @desc    Toggle store status (System Owner only)
 * @access  Private (System Owner)
 */
router.put(
  '/:id/status',
  authorize('system_owner'),
  [
    body('status').isIn(['active', 'suspended', 'expired', 'cancelled']).withMessage('Invalid status'),
    validate,
  ],
  asyncHandler(storeController.toggleStoreStatus)
);

/**
 * @route   DELETE /api/stores/:id
 * @desc    Delete store (System Owner only)
 * @access  Private (System Owner)
 */
router.delete(
  '/:id',
  authorize('system_owner'),
  asyncHandler(storeController.deleteStore)
);

export default router;
