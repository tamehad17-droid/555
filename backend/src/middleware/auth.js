import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { supabaseAdmin } from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No token provided',
        },
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Token has expired',
          },
        });
      }
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid token',
        },
      });
    }

    // Get user from database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select(
        `
        *,
        store:stores(*),
        role:roles(*)
      `
      )
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found or inactive',
        },
      });
    }

    // Check if user's account has expired
    if (user.account_expires_at && new Date(user.account_expires_at) < new Date()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_EXPIRED',
          message: 'Your account has expired. Please contact support.',
        },
      });
    }

    // Check if store subscription is active
    if (user.store) {
      const subscriptionActive = await checkStoreSubscription(user.store);
      if (!subscriptionActive) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'SUBSCRIPTION_EXPIRED',
            message: 'Store subscription has expired. Please renew to continue.',
            contact: {
              email: config.contact.email,
              phone: config.contact.phone,
              whatsapp: config.contact.whatsapp,
            },
          },
        });
      }
    }

    // Update last login
    await supabaseAdmin
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    // Attach user to request
    req.user = user;
    req.userId = user.id;
    req.storeId = user.store_id;
    req.role = user.role;

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication failed',
      },
    });
  }
};

/**
 * Check if store subscription is active
 */
const checkStoreSubscription = async (store) => {
  const now = new Date();

  // Check if store is active
  if (store.status !== 'active') {
    return false;
  }

  // Check subscription end date
  if (store.subscription_end_date && new Date(store.subscription_end_date) > now) {
    return true;
  }

  // Check trial end date
  if (store.trial_end_date && new Date(store.trial_end_date) > now) {
    return true;
  }

  return false;
};

/**
 * Authorization middleware
 * Checks if user has required permission
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.role) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    // System owner has all permissions
    if (req.role.slug === 'system_owner') {
      return next();
    }

    // Check if user's role is in allowed roles
    if (allowedRoles.includes(req.role.slug)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'You do not have permission to perform this action',
      },
    });
  };
};

/**
 * Permission-based authorization
 */
export const can = (resource, action) => {
  return (req, res, next) => {
    if (!req.user || !req.role) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    // System owner and store manager have all permissions
    if (req.role.slug === 'system_owner' || req.role.slug === 'store_manager') {
      return next();
    }

    const permissions = req.role.permissions || {};

    // Check for full access
    if (permissions.all === true) {
      return next();
    }

    // Check resource permissions
    const resourcePermissions = permissions[resource];
    if (!resourcePermissions) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this resource',
        },
      });
    }

    // Check if has all permissions on resource
    if (resourcePermissions === 'all') {
      return next();
    }

    // Check specific action
    if (Array.isArray(resourcePermissions) && resourcePermissions.includes(action)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: `You do not have permission to ${action} ${resource}`,
      },
    });
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    await authenticate(req, res, next);
  } catch (error) {
    // Continue without authentication
    next();
  }
};

export default {
  authenticate,
  authorize,
  can,
  optionalAuth,
};
