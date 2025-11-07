import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../config/database.js';
import config from '../config/config.js';
import logger from '../utils/logger.js';
import {
  UnauthorizedError,
  ValidationError,
  ConflictError,
} from '../middleware/errorHandler.js';

class AuthController {
  /**
   * Register new store owner
   * Can only be done by system owner
   */
  async register(req, res) {
    const { storeName, username, fullName, email, password, phone } = req.body;

    // Note: In production, only system owner can create store accounts
    // This is enforced via middleware

    // Check if username exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      throw new ConflictError('Username already exists');
    }

    // Check if email exists
    if (email) {
      const { data: existingEmail } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingEmail) {
        throw new ConflictError('Email already exists');
      }
    }

    // Create auth user in Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email || `${username}@temp.local`,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        full_name: fullName,
      },
    });

    if (authError) {
      logger.error('Supabase auth error:', authError);
      throw new Error('Failed to create user account');
    }

    const userId = authData.user.id;

    // Create store
    const storeSlug = storeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .insert({
        owner_id: userId,
        name: storeName,
        slug: storeSlug + '-' + Date.now(),
        subscription_plan: 'free',
        status: 'active',
        contact_email: email,
        contact_phone: phone,
        trial_end_date: new Date(Date.now() + config.subscriptionPlans.free.duration * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (storeError) {
      // Rollback auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      logger.error('Store creation error:', storeError);
      throw new Error('Failed to create store');
    }

    // Get store_manager role
    const { data: role } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('slug', 'store_manager')
      .single();

    // Create user record
    const accountExpiresAt = new Date(Date.now() + config.subscriptionPlans.free.duration * 24 * 60 * 60 * 1000).toISOString();

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        store_id: store.id,
        role_id: role.id,
        username,
        full_name: fullName,
        email,
        phone,
        account_expires_at: accountExpiresAt,
        is_active: true,
      })
      .select()
      .single();

    if (userError) {
      // Rollback
      await supabaseAdmin.auth.admin.deleteUser(userId);
      await supabaseAdmin.from('stores').delete().eq('id', store.id);
      logger.error('User creation error:', userError);
      throw new Error('Failed to create user record');
    }

    // Initialize store with default data
    await this.initializeStore(store.id);

    // Generate tokens
    const tokens = this.generateTokens(userId);

    // Log activity
    await this.logActivity(user.id, store.id, 'register', 'Store owner registered successfully');

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          fullName: user.full_name,
          email: user.email,
          storeId: user.store_id,
          accountExpiresAt: user.account_expires_at,
        },
        store: {
          id: store.id,
          name: store.name,
          trialEndsAt: store.trial_end_date,
        },
        tokens,
      },
    });
  }

  /**
   * Login user
   */
  async login(req, res) {
    const { username, password } = req.body;

    // Get user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select(
        `
        *,
        store:stores(*),
        role:roles(*)
      `
      )
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password with Supabase auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.signInWithPassword({
        email: user.email || `${username}@temp.local`,
        password,
      });

    if (authError) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check account expiry
    if (user.account_expires_at && new Date(user.account_expires_at) < new Date()) {
      throw new UnauthorizedError('Account has expired. Please contact support to renew.');
    }

    // Check store subscription
    if (user.store) {
      const now = new Date();
      const subscriptionActive =
        user.store.status === 'active' &&
        ((user.store.subscription_end_date && new Date(user.store.subscription_end_date) > now) ||
          (user.store.trial_end_date && new Date(user.store.trial_end_date) > now));

      if (!subscriptionActive) {
        throw new UnauthorizedError('Store subscription has expired. Please contact support.');
      }
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    // Update last login
    await supabaseAdmin
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    // Log activity
    await this.logActivity(user.id, user.store_id, 'login', 'User logged in');

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          fullName: user.full_name,
          email: user.email,
          phone: user.phone,
          locale: user.locale,
          theme: user.theme,
          storeId: user.store_id,
          role: user.role,
          accountExpiresAt: user.account_expires_at,
        },
        store: user.store,
        tokens,
      },
    });
  }

  /**
   * Refresh access token
   */
  async refreshToken(req, res) {
    const { refreshToken } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Generate new tokens
    const tokens = this.generateTokens(decoded.userId);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { tokens },
    });
  }

  /**
   * Logout user
   */
  async logout(req, res) {
    // Log activity
    await this.logActivity(req.userId, req.storeId, 'logout', 'User logged out');

    // In a production environment, you would invalidate the refresh token here
    // This could be done by maintaining a blacklist or using token versioning

    res.json({
      success: true,
      message: 'Logout successful',
    });
  }

  /**
   * Get current user
   */
  async getCurrentUser(req, res) {
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  }

  /**
   * Change password
   */
  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const { error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: req.user.email || `${req.user.username}@temp.local`,
      password: currentPassword,
    });

    if (authError) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      req.userId,
      {
        password: newPassword,
      }
    );

    if (updateError) {
      logger.error('Password update error:', updateError);
      throw new Error('Failed to update password');
    }

    // Log activity
    await this.logActivity(req.userId, req.storeId, 'change_password', 'Password changed');

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res) {
    const { fullName, email, phone, locale, theme } = req.body;

    const updates = {};
    if (fullName) updates.full_name = fullName;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (locale) updates.locale = locale;
    if (theme) updates.theme = theme;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', req.userId)
      .select()
      .single();

    if (error) {
      logger.error('Profile update error:', error);
      throw new Error('Failed to update profile');
    }

    // Log activity
    await this.logActivity(req.userId, req.storeId, 'update_profile', 'Profile updated');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: data },
    });
  }

  /**
   * Forgot password
   */
  async forgotPassword(req, res) {
    const { email } = req.body;

    // Send password reset email via Supabase
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${config.frontendUrl}/reset-password`,
    });

    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    });
  }

  /**
   * Reset password
   */
  async resetPassword(req, res) {
    const { token, password } = req.body;

    // This would be handled by Supabase auth flow
    // For now, just a placeholder

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  }

  /**
   * Helper: Generate JWT tokens
   */
  generateTokens(userId) {
    const accessToken = jwt.sign({ userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign({ userId }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: config.jwt.expiresIn,
    };
  }

  /**
   * Helper: Initialize store with default data
   */
  async initializeStore(storeId) {
    try {
      // Call the seed function from database
      await supabaseAdmin.rpc('seed_default_categories', { p_store_id: storeId });
      await supabaseAdmin.rpc('seed_default_settings', { p_store_id: storeId });
    } catch (error) {
      logger.error('Store initialization error:', error);
      // Don't throw - store is created, this is just setup
    }
  }

  /**
   * Helper: Log user activity
   */
  async logActivity(userId, storeId, action, message) {
    try {
      await supabaseAdmin.from('audit_logs').insert({
        store_id: storeId,
        user_id: userId,
        action,
        entity_type: 'auth',
        metadata: { message },
      });
    } catch (error) {
      logger.error('Activity log error:', error);
    }
  }
}

export default new AuthController();
