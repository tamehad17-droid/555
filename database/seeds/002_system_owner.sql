-- Create System Owner Account
-- IMPORTANT: First create the auth user via Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Add User" > "Create new user"
-- 3. Email: admin@promohive.com
-- 4. Password: Admin123!
-- 5. Confirm Email: Yes
-- 6. Copy the user ID and replace in the script below

-- After creating the auth user, run this script:
-- Replace 'YOUR_AUTH_USER_ID_HERE' with the actual UUID from Supabase

DO $$
DECLARE
    v_role_id UUID;
    v_owner_id UUID := 'YOUR_AUTH_USER_ID_HERE'::UUID; -- REPLACE THIS WITH ACTUAL USER ID
BEGIN
    -- Check if the UUID was replaced
    IF v_owner_id::text = 'YOUR_AUTH_USER_ID_HERE' THEN
        RAISE EXCEPTION 'Please replace YOUR_AUTH_USER_ID_HERE with the actual auth.users ID from Supabase Dashboard';
    END IF;

    -- Get system_owner role
    SELECT id INTO v_role_id FROM roles WHERE slug = 'system_owner' LIMIT 1;

    IF v_role_id IS NULL THEN
        RAISE EXCEPTION 'system_owner role not found. Please run 001_initial_data.sql first';
    END IF;

    -- Insert system owner user
    INSERT INTO users (
        id,
        store_id,
        role_id,
        username,
        full_name,
        email,
        is_active
    ) VALUES (
        v_owner_id,
        NULL, -- System owner has no store
        v_role_id,
        'systemadmin',
        'System Administrator',
        'admin@promohive.com',
        true
    ) ON CONFLICT (id) DO UPDATE 
    SET role_id = v_role_id,
        email = 'admin@promohive.com',
        is_active = true,
        store_id = NULL;

    RAISE NOTICE 'System owner account created successfully for user ID: %', v_owner_id;
END $$;
