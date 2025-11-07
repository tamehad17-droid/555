-- Ibrahim Accounting System - Seed Data
-- This file contains initial data for development and testing

-- ============================================
-- SEED DEFAULT CATEGORIES
-- ============================================

-- Income Categories (will be inserted per store)
-- INSERT INTO categories (store_id, type, name, slug, description, color, icon) VALUES
-- These will be added programmatically when a store is created

-- Example seed function to create default categories for a store
CREATE OR REPLACE FUNCTION seed_default_categories(p_store_id UUID)
RETURNS void AS $$
BEGIN
    -- Income Categories
    INSERT INTO categories (store_id, type, name, slug, color, icon) VALUES
    (p_store_id, 'income', 'Sales', 'sales', '#10b981', 'shopping-cart'),
    (p_store_id, 'income', 'Services', 'services', '#3b82f6', 'briefcase'),
    (p_store_id, 'income', 'Other Income', 'other-income', '#8b5cf6', 'plus-circle');

    -- Expense Categories
    INSERT INTO categories (store_id, type, name, slug, color, icon) VALUES
    (p_store_id, 'expense', 'Rent', 'rent', '#ef4444', 'home'),
    (p_store_id, 'expense', 'Utilities', 'utilities', '#f59e0b', 'zap'),
    (p_store_id, 'expense', 'Salaries', 'salaries', '#ec4899', 'users'),
    (p_store_id, 'expense', 'Supplies', 'supplies', '#06b6d4', 'package'),
    (p_store_id, 'expense', 'Marketing', 'marketing', '#14b8a6', 'megaphone'),
    (p_store_id, 'expense', 'Transportation', 'transportation', '#6366f1', 'truck'),
    (p_store_id, 'expense', 'Other Expenses', 'other-expenses', '#64748b', 'minus-circle');

    -- Inventory Categories
    INSERT INTO categories (store_id, type, name, slug, color, icon) VALUES
    (p_store_id, 'inventory', 'Raw Materials', 'raw-materials', '#84cc16', 'layers'),
    (p_store_id, 'inventory', 'Finished Products', 'finished-products', '#22c55e', 'box'),
    (p_store_id, 'inventory', 'Spare Parts', 'spare-parts', '#a855f7', 'tool'),
    (p_store_id, 'inventory', 'Consumables', 'consumables', '#f97316', 'package');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DEFAULT SETTINGS FOR A STORE
-- ============================================

CREATE OR REPLACE FUNCTION seed_default_settings(p_store_id UUID)
RETURNS void AS $$
BEGIN
    -- General Settings
    INSERT INTO settings (store_id, category, key, value, description) VALUES
    (p_store_id, 'general', 'default_currency', '"TRY"', 'Default currency for the store'),
    (p_store_id, 'general', 'default_language', '"ar"', 'Default language (ar, en, tr)'),
    (p_store_id, 'general', 'date_format', '"DD/MM/YYYY"', 'Date display format'),
    (p_store_id, 'general', 'time_format', '"24h"', 'Time format (12h or 24h)'),
    (p_store_id, 'general', 'timezone', '"Asia/Damascus"', 'Store timezone');

    -- Invoice Settings
    INSERT INTO settings (store_id, category, key, value, description) VALUES
    (p_store_id, 'invoices', 'auto_approve', 'false', 'Automatically approve invoices'),
    (p_store_id, 'invoices', 'invoice_prefix_in', '"INV-IN-"', 'Prefix for income invoices'),
    (p_store_id, 'invoices', 'invoice_prefix_out', '"INV-OUT-"', 'Prefix for expense invoices'),
    (p_store_id, 'invoices', 'next_invoice_number_in', '1', 'Next invoice number for income'),
    (p_store_id, 'invoices', 'next_invoice_number_out', '1', 'Next invoice number for expense');

    -- Inventory Settings
    INSERT INTO settings (store_id, category, key, value, description) VALUES
    (p_store_id, 'inventory', 'enable_low_stock_alerts', 'true', 'Enable low stock alerts'),
    (p_store_id, 'inventory', 'auto_deduct_stock', 'true', 'Automatically deduct stock on sales'),
    (p_store_id, 'inventory', 'enable_barcode', 'true', 'Enable barcode scanning');

    -- Payroll Settings
    INSERT INTO settings (store_id, category, key, value, description) VALUES
    (p_store_id, 'payroll', 'working_days_per_month', '26', 'Standard working days per month'),
    (p_store_id, 'payroll', 'working_hours_per_day', '8', 'Standard working hours per day'),
    (p_store_id, 'payroll', 'overtime_multiplier', '1.5', 'Overtime payment multiplier'),
    (p_store_id, 'payroll', 'auto_calculate_absence', 'true', 'Automatically calculate absence deductions');

    -- Notification Settings
    INSERT INTO settings (store_id, category, key, value, description) VALUES
    (p_store_id, 'notifications', 'enable_email', 'true', 'Enable email notifications'),
    (p_store_id, 'notifications', 'enable_push', 'true', 'Enable push notifications'),
    (p_store_id, 'notifications', 'low_stock_threshold', '0.2', 'Alert when stock is below 20% of max'),
    (p_store_id, 'notifications', 'invoice_overdue_days', '7', 'Days before invoice overdue alert');

    -- Report Settings
    INSERT INTO settings (store_id, category, key, value, description) VALUES
    (p_store_id, 'reports', 'default_export_format', '"pdf"', 'Default report export format'),
    (p_store_id, 'reports', 'include_logo', 'true', 'Include store logo in reports'),
    (p_store_id, 'reports', 'cache_duration_minutes', '30', 'How long to cache report data');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CREATE COMPLETE STORE SETUP
-- ============================================

CREATE OR REPLACE FUNCTION create_complete_store(
    p_owner_id UUID,
    p_store_name VARCHAR(255),
    p_store_slug VARCHAR(255),
    p_owner_username VARCHAR(100),
    p_owner_full_name VARCHAR(255),
    p_owner_email VARCHAR(255),
    p_owner_password VARCHAR(255)
) RETURNS UUID AS $$
DECLARE
    v_store_id UUID;
    v_role_id UUID;
BEGIN
    -- Create the store
    INSERT INTO stores (owner_id, name, slug, subscription_plan, status, contact_email)
    VALUES (p_owner_id, p_store_name, p_store_slug, 'free', 'active', p_owner_email)
    RETURNING id INTO v_store_id;

    -- Get store_manager role
    SELECT id INTO v_role_id FROM roles WHERE slug = 'store_manager' LIMIT 1;

    -- Create the owner user
    INSERT INTO users (id, store_id, role_id, username, full_name, email, is_active)
    VALUES (p_owner_id, v_store_id, v_role_id, p_owner_username, p_owner_full_name, p_owner_email, true);

    -- Seed default categories
    PERFORM seed_default_categories(v_store_id);

    -- Seed default settings
    PERFORM seed_default_settings(v_store_id);

    RETURN v_store_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA FOR DEVELOPMENT (Optional)
-- ============================================

-- Uncomment below to create sample data for development

/*
-- Create a demo store
DO $$
DECLARE
    v_owner_id UUID := uuid_generate_v4();
    v_store_id UUID;
BEGIN
    -- Note: In production, this should be done through Supabase auth
    -- This is just for development purposes
    
    v_store_id := create_complete_store(
        v_owner_id,
        'Demo Store - متجر تجريبي',
        'demo-store',
        'admin',
        'System Administrator',
        'admin@demo.com',
        'hashed_password_here'
    );

    -- Create sample partners
    INSERT INTO partners (store_id, type, name, phone, email, address) VALUES
    (v_store_id, 'customer', 'أحمد محمد', '+963999111222', 'ahmad@example.com', 'دمشق، سوريا'),
    (v_store_id, 'customer', 'فاطمة علي', '+963999333444', 'fatima@example.com', 'حلب، سوريا'),
    (v_store_id, 'vendor', 'شركة التوريدات المحدودة', '+963999555666', 'supplies@example.com', 'اسطنبول، تركيا'),
    (v_store_id, 'vendor', 'مؤسسة الخدمات', '+963999777888', 'services@example.com', 'دمشق، سوريا');

    -- Create sample inventory items
    INSERT INTO inventory_items (store_id, sku, name, unit, cost_price, selling_price, currency, current_stock, min_stock) VALUES
    (v_store_id, 'ITEM-001', 'منتج أ', 'قطعة', 10.00, 15.00, 'TRY', 100, 10),
    (v_store_id, 'ITEM-002', 'منتج ب', 'كرتونة', 50.00, 75.00, 'TRY', 50, 5),
    (v_store_id, 'ITEM-003', 'منتج ج', 'كيلو', 20.00, 30.00, 'USD', 200, 20);

    -- Create sample employees
    INSERT INTO employees (store_id, employee_code, full_name, phone, hire_date, position, base_salary, currency, status) VALUES
    (v_store_id, 'EMP-001', 'محمد أحمد', '+963999111000', '2024-01-01', 'محاسب', 2000.00, 'TRY', 'active'),
    (v_store_id, 'EMP-002', 'سارة خالد', '+963999222000', '2024-02-01', 'مدخل بيانات', 1500.00, 'TRY', 'active');

    RAISE NOTICE 'Demo store created successfully with ID: %', v_store_id;
END $$;
*/

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Function to generate next invoice number
CREATE OR REPLACE FUNCTION get_next_invoice_number(
    p_store_id UUID,
    p_type VARCHAR(10) -- 'in' or 'out'
) RETURNS VARCHAR(100) AS $$
DECLARE
    v_prefix VARCHAR(50);
    v_next_number INT;
    v_invoice_number VARCHAR(100);
    v_setting_key VARCHAR(100);
BEGIN
    -- Get prefix
    v_setting_key := 'invoice_prefix_' || p_type;
    SELECT value::TEXT INTO v_prefix 
    FROM settings 
    WHERE store_id = p_store_id 
    AND category = 'invoices' 
    AND key = v_setting_key;
    
    v_prefix := REPLACE(v_prefix, '"', '');

    -- Get next number
    v_setting_key := 'next_invoice_number_' || p_type;
    SELECT value::TEXT::INT INTO v_next_number 
    FROM settings 
    WHERE store_id = p_store_id 
    AND category = 'invoices' 
    AND key = v_setting_key;

    -- Generate invoice number
    v_invoice_number := v_prefix || LPAD(v_next_number::TEXT, 6, '0');

    -- Update next number
    UPDATE settings 
    SET value = (v_next_number + 1)::TEXT::JSONB
    WHERE store_id = p_store_id 
    AND category = 'invoices' 
    AND key = v_setting_key;

    RETURN v_invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate net salary
CREATE OR REPLACE FUNCTION calculate_net_salary(
    p_base_salary DECIMAL(15,2),
    p_bonuses DECIMAL(15,2),
    p_deductions DECIMAL(15,2),
    p_advances DECIMAL(15,2),
    p_absence_deduction DECIMAL(15,2),
    p_overtime_amount DECIMAL(15,2)
) RETURNS DECIMAL(15,2) AS $$
BEGIN
    RETURN p_base_salary + p_bonuses + p_overtime_amount - p_deductions - p_advances - p_absence_deduction;
END;
$$ LANGUAGE plpgsql;

-- Function to check subscription status
CREATE OR REPLACE FUNCTION is_store_subscription_active(p_store_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_status VARCHAR(50);
    v_end_date TIMESTAMPTZ;
    v_trial_end TIMESTAMPTZ;
BEGIN
    SELECT status, subscription_end_date, trial_end_date 
    INTO v_status, v_end_date, v_trial_end
    FROM stores 
    WHERE id = p_store_id;

    -- Check if active and within subscription or trial period
    IF v_status = 'active' THEN
        IF v_end_date IS NOT NULL AND v_end_date > NOW() THEN
            RETURN TRUE;
        ELSIF v_trial_end IS NOT NULL AND v_trial_end > NOW() THEN
            RETURN TRUE;
        END IF;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
    p_user_id UUID,
    p_resource VARCHAR(100),
    p_action VARCHAR(50)
) RETURNS BOOLEAN AS $$
DECLARE
    v_permissions JSONB;
    v_resource_permissions JSONB;
BEGIN
    SELECT r.permissions INTO v_permissions
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = p_user_id;

    -- Check for full access
    IF v_permissions->>'all' = 'true' THEN
        RETURN TRUE;
    END IF;

    -- Check specific resource permissions
    v_resource_permissions := v_permissions->p_resource;
    
    IF v_resource_permissions IS NOT NULL THEN
        -- Check if action is allowed
        IF v_resource_permissions::TEXT = '"all"' THEN
            RETURN TRUE;
        ELSIF v_resource_permissions ? p_action THEN
            RETURN TRUE;
        END IF;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SCHEDULED JOBS (Comments for reference)
-- ============================================

-- These would be set up as cron jobs or using pg_cron extension:

-- 1. Check expiring subscriptions daily
-- SELECT id, name, subscription_end_date FROM stores 
-- WHERE status = 'active' 
-- AND subscription_end_date BETWEEN NOW() AND NOW() + INTERVAL '7 days';

-- 2. Auto-expire subscriptions
-- UPDATE stores SET status = 'expired' 
-- WHERE subscription_end_date < NOW() AND status = 'active';

-- 3. Clean old audit logs (keep last 6 months)
-- DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '6 months';

-- 4. Clean old reports cache
-- DELETE FROM reports_cache WHERE expires_at < NOW();

-- 5. Generate monthly payroll reminders
-- Check if payroll has been generated for current month for each active employee
