import express from 'express';
import { supabaseAdmin } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * @route   POST /api/setup/create-owner
 * @desc    Create system owner account (One-time setup)
 * @access  Public (disabled after first use)
 */
router.post('/create-owner', asyncHandler(async (req, res) => {
  // Check if system owner already exists
  const { data: existingOwner } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', 'admin@promohive.com')
    .single();

  if (existingOwner) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'System owner already exists. This endpoint is disabled.',
      },
    });
  }

  const email = 'admin@promohive.com';
  const password = 'Admin123!';
  const username = 'systemadmin';
  const fullName = 'System Administrator';

  try {
    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        full_name: fullName,
      },
    });

    if (authError) {
      throw new Error(`Auth creation failed: ${authError.message}`);
    }

    const userId = authData.user.id;

    // Step 2: Get system_owner role
    const { data: role, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('slug', 'system_owner')
      .single();

    if (roleError || !role) {
      // Rollback auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error('system_owner role not found');
    }

    // Step 3: Create user record
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        store_id: null,
        role_id: role.id,
        username,
        full_name: fullName,
        email,
        is_active: true,
        account_expires_at: null,
      })
      .select()
      .single();

    if (userError) {
      // Rollback auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(`User record creation failed: ${userError.message}`);
    }

    res.status(201).json({
      success: true,
      message: 'System owner created successfully! 🎉',
      data: {
        userId: user.id,
        email: user.email,
        username: user.username,
        credentials: {
          email: 'admin@promohive.com',
          password: 'Admin123!',
        },
        note: 'This endpoint is now disabled. Please login at http://localhost:5173',
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message,
      },
    });
  }
}));

export default router;
