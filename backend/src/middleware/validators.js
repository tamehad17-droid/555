import { validationResult } from 'express-validator';
import { ValidationError } from './errorHandler.js';

/**
 * Middleware to validate request using express-validator
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    throw new ValidationError('Validation failed', formattedErrors);
  }

  next();
};

/**
 * Pagination middleware
 * Parses and validates pagination parameters
 */
export const paginate = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Max 100
  const offset = (page - 1) * limit;

  req.pagination = {
    page,
    limit,
    offset,
  };

  next();
};

/**
 * Sanitize query parameters
 */
export const sanitizeQuery = (req, res, next) => {
  // Remove undefined or null values
  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      if (req.query[key] === undefined || req.query[key] === null || req.query[key] === '') {
        delete req.query[key];
      }
    });
  }

  next();
};

/**
 * Add store filter to query (for multi-tenant)
 */
export const addStoreFilter = (req, res, next) => {
  if (!req.storeId) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'NO_STORE',
        message: 'User is not associated with any store',
      },
    });
  }

  // Add store_id to query filters
  req.filters = req.filters || {};
  req.filters.store_id = req.storeId;

  next();
};

/**
 * Audit log middleware
 * Logs all create/update/delete actions
 */
export const auditLog = (action, entityType) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to capture response
    res.json = function (data) {
      // Only log successful operations
      if (data.success && req.user) {
        // Async log (don't wait)
        logAudit({
          storeId: req.storeId,
          userId: req.userId,
          action,
          entityType,
          entityId: data.data?.id,
          oldData: req.oldData,
          newData: data.data,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        }).catch((err) => {
          logger.error('Audit log error:', err);
        });
      }

      // Call original json method
      return originalJson(data);
    };

    next();
  };
};

/**
 * Helper function to log audit
 */
const logAudit = async (auditData) => {
  const { supabaseAdmin } = await import('../config/database.js');
  
  await supabaseAdmin.from('audit_logs').insert({
    store_id: auditData.storeId,
    user_id: auditData.userId,
    action: auditData.action,
    entity_type: auditData.entityType,
    entity_id: auditData.entityId,
    old_data: auditData.oldData,
    new_data: auditData.newData,
    ip_address: auditData.ipAddress,
    user_agent: auditData.userAgent,
  });
};

export default {
  validate,
  paginate,
  sanitizeQuery,
  addStoreFilter,
  auditLog,
};
