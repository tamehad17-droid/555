import { supabaseAdmin } from '../config/database.js';
import config from '../config/config.js';
import logger from '../utils/logger.js';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';

class StoreController {
  /**
   * Get all stores (System Owner only)
   */
  async getAllStores(req, res) {
    const { status, subscriptionPlan } = req.query;
    
    let query = supabaseAdmin
      .from('stores')
      .select(`
        *,
        owner:users!stores_owner_id_fkey(id, username, full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (subscriptionPlan) {
      query = query.eq('subscription_plan', subscriptionPlan);
    }

    const { data: stores, error } = await query;

    if (error) {
      logger.error('Failed to fetch stores:', error);
      throw new Error('Failed to fetch stores');
    }

    res.json({
      success: true,
      data: { stores },
    });
  }

  /**
   * Get single store
   */
  async getStore(req, res) {
    const { id } = req.params;

    const { data: store, error } = await supabaseAdmin
      .from('stores')
      .select(`
        *,
        owner:users!stores_owner_id_fkey(id, username, full_name, email, phone),
        users:users(count)
      `)
      .eq('id', id)
      .single();

    if (error || !store) {
      throw new NotFoundError('Store not found');
    }

    res.json({
      success: true,
      data: { store },
    });
  }

  /**
   * Create new store (System Owner only)
   */
  async createStore(req, res) {
    const { storeName, ownerUsername, ownerFullName, ownerEmail, ownerPassword, ownerPhone, subscriptionPlan = 'free' } = req.body;

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: ownerEmail,
      password: ownerPassword,
      email_confirm: true,
      user_metadata: {
        username: ownerUsername,
        full_name: ownerFullName,
      },
    });

    if (authError) {
      logger.error('Auth user creation failed:', authError);
      throw new Error('Failed to create owner account');
    }

    const ownerId = authData.user.id;

    // Create store
    const storeSlug = storeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const trialDays = config.subscriptionPlans[subscriptionPlan]?.duration || 30;

    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .insert({
        owner_id: ownerId,
        name: storeName,
        slug: `${storeSlug}-${Date.now()}`,
        subscription_plan: subscriptionPlan,
        status: 'active',
        contact_email: ownerEmail,
        contact_phone: ownerPhone,
        trial_end_date: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString(),
        subscription_end_date: subscriptionPlan !== 'free' 
          ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString()
          : null,
      })
      .select()
      .single();

    if (storeError) {
      await supabaseAdmin.auth.admin.deleteUser(ownerId);
      throw new Error('Failed to create store');
    }

    // Get store_manager role
    const { data: role } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('slug', 'store_manager')
      .single();

    // Create user record
    const accountExpiresAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString();

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: ownerId,
        store_id: store.id,
        role_id: role.id,
        username: ownerUsername,
        full_name: ownerFullName,
        email: ownerEmail,
        phone: ownerPhone,
        account_expires_at: accountExpiresAt,
        is_active: true,
        created_by: req.userId,
      })
      .select()
      .single();

    if (userError) {
      await supabaseAdmin.auth.admin.deleteUser(ownerId);
      await supabaseAdmin.from('stores').delete().eq('id', store.id);
      throw new Error('Failed to create user');
    }

    // Initialize store with default categories and settings
    await this.initializeStore(store.id);

    // Log activity
    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'create_store',
      entity_type: 'store',
      entity_id: store.id,
      new_data: { store, user },
    });

    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      data: { store, owner: user },
    });
  }

  /**
   * Update store
   */
  async updateStore(req, res) {
    const { id } = req.params;
    const updates = req.body;

    // System owner can update any store
    // Store owner can only update their own store
    if (req.role.slug !== 'system_owner') {
      const { data: store } = await supabaseAdmin
        .from('stores')
        .select('owner_id')
        .eq('id', id)
        .single();

      if (store?.owner_id !== req.userId) {
        throw new ForbiddenError('You can only update your own store');
      }
    }

    const { data, error } = await supabaseAdmin
      .from('stores')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update store');
    }

    res.json({
      success: true,
      message: 'Store updated successfully',
      data: { store: data },
    });
  }

  /**
   * Update store subscription (System Owner only)
   */
  async updateSubscription(req, res) {
    const { id } = req.params;
    const { subscriptionPlan, duration } = req.body;

    const planDuration = duration || config.subscriptionPlans[subscriptionPlan]?.duration || 30;
    const now = new Date();
    const endDate = new Date(now.getTime() + planDuration * 24 * 60 * 60 * 1000);

    const { data: store, error } = await supabaseAdmin
      .from('stores')
      .update({
        subscription_plan: subscriptionPlan,
        subscription_end_date: endDate.toISOString(),
        status: 'active',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update subscription');
    }

    // Update all users in this store
    await supabaseAdmin
      .from('users')
      .update({ account_expires_at: endDate.toISOString() })
      .eq('store_id', id);

    // Log activity
    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'update_subscription',
      entity_type: 'store',
      entity_id: id,
      new_data: { subscriptionPlan, endDate },
    });

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: { store },
    });
  }

  /**
   * Approve/Reject subscription request
   */
  async handleSubscriptionRequest(req, res) {
    const { id } = req.params;
    const { action, subscriptionPlan, duration } = req.body; // action: 'approve' or 'reject'

    if (action === 'approve') {
      return this.updateSubscription(req, res);
    } else if (action === 'reject') {
      // Log rejection
      await supabaseAdmin.from('audit_logs').insert({
        user_id: req.userId,
        action: 'reject_subscription',
        entity_type: 'store',
        entity_id: id,
      });

      res.json({
        success: true,
        message: 'Subscription request rejected',
      });
    }
  }

  /**
   * Suspend/Activate store
   */
  async toggleStoreStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body; // 'active', 'suspended', 'expired', 'cancelled'

    const { data, error } = await supabaseAdmin
      .from('stores')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update store status');
    }

    res.json({
      success: true,
      message: `Store ${status} successfully`,
      data: { store: data },
    });
  }

  /**
   * Delete store (System Owner only - dangerous operation)
   */
  async deleteStore(req, res) {
    const { id } = req.params;

    // This will cascade delete all related data due to ON DELETE CASCADE
    const { error } = await supabaseAdmin
      .from('stores')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error('Failed to delete store');
    }

    res.json({
      success: true,
      message: 'Store deleted successfully',
    });
  }

  /**
   * Initialize store with default data
   */
  async initializeStore(storeId) {
    try {
      await supabaseAdmin.rpc('seed_default_categories', { p_store_id: storeId });
      await supabaseAdmin.rpc('seed_default_settings', { p_store_id: storeId });
    } catch (error) {
      logger.error('Store initialization error:', error);
    }
  }
}

export default new StoreController();
