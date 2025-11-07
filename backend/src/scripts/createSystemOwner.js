import { supabaseAdmin } from '../config/database.js';
import config from '../config/config.js';
import logger from '../utils/logger.js';

/**
 * Create System Owner Account
 * Email: admin@promohive.com
 * Password: Admin123!
 */
async function createSystemOwner() {
  try {
    console.log('🔐 Creating system owner account...');

    // Check if service role key is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || 
        process.env.SUPABASE_SERVICE_ROLE_KEY === 'your_service_role_key_from_supabase_dashboard') {
      console.error('\n❌ ERROR: SUPABASE_SERVICE_ROLE_KEY is not configured!\n');
      console.log('📋 To fix this:');
      console.log('1. Go to: https://supabase.com/dashboard/project/kyxbhmvxtudrvdbhpjbz/settings/api');
      console.log('2. Copy the "service_role" key (⚠️ Keep it secret!)');
      console.log('3. Open backend\\.env file');
      console.log('4. Replace this line:');
      console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_supabase_dashboard');
      console.log('   with:');
      console.log('   SUPABASE_SERVICE_ROLE_KEY=<your_actual_key>');
      console.log('5. Run this script again: npm run create-admin\n');
      process.exit(1);
    }

    const email = 'admin@promohive.com';
    const password = 'Admin123!';
    const username = 'systemadmin';
    const fullName = 'System Administrator';

    // Step 1: Create auth user
    console.log('Step 1: Creating auth user...');
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
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Auth user already exists. Fetching existing user...');
        
        // Get existing user by email
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError) {
          throw new Error(`Failed to list users: ${listError.message}`);
        }

        const existingUser = users.find(u => u.email === email);
        
        if (!existingUser) {
          throw new Error('User exists but could not be found');
        }

        console.log(`✅ Found existing auth user: ${existingUser.id}`);
        authData.user = existingUser;
      } else {
        throw new Error(`Failed to create auth user: ${authError.message}`);
      }
    } else {
      console.log(`✅ Auth user created: ${authData.user.id}`);
    }

    const userId = authData.user.id;

    // Step 2: Get system_owner role
    console.log('Step 2: Getting system_owner role...');
    const { data: role, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('slug', 'system_owner')
      .single();

    if (roleError || !role) {
      throw new Error('system_owner role not found. Please run initial migration first.');
    }

    console.log(`✅ Found system_owner role: ${role.id}`);

    // Step 3: Create/Update user record
    console.log('Step 3: Creating user record...');
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userId,
        store_id: null, // System owner has no store
        role_id: role.id,
        username,
        full_name: fullName,
        email,
        is_active: true,
        account_expires_at: null, // System owner never expires
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (userError) {
      throw new Error(`Failed to create user record: ${userError.message}`);
    }

    console.log(`✅ User record created: ${user.id}`);

    // Success!
    console.log('\n🎉 System owner account created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    admin@promohive.com');
    console.log('🔑 Password: Admin123!');
    console.log('👤 Username: systemadmin');
    console.log('🆔 User ID:  ' + userId);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ You can now login with these credentials!');

  } catch (error) {
    console.error('\n❌ Failed to create system owner:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Run the script
createSystemOwner()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
