-- Ibrahim Accounting System Database Schema
-- Database: PostgreSQL (Supabase)
-- Version: 1.0.0
-- Date: 2025-11-07

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CORE TABLES
-- ============================================

-- Stores Table (Multi-tenant support)
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_plan VARCHAR(50) DEFAULT 'free', -- free, monthly, 6months, yearly
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    trial_end_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    status VARCHAR(50) DEFAULT 'active', -- active, suspended, expired, cancelled
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on stores
CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_stores_status ON stores(status);
CREATE INDEX idx_stores_subscription_end ON stores(subscription_end_date);

-- Currencies Table
CREATE TABLE currencies (
    code VARCHAR(3) PRIMARY KEY, -- TRY, SYP, USD
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    decimal_places INT DEFAULT 2,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default currencies
INSERT INTO currencies (code, name, symbol) VALUES
('TRY', 'Turkish Lira', '₺'),
('SYP', 'Syrian Pound', 'ل.س'),
('USD', 'US Dollar', '$');

-- Roles Table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(slug)
);

-- Insert default roles
INSERT INTO roles (name, slug, description, permissions) VALUES
('System Owner', 'system_owner', 'Full system access', '{"all": true}'),
('Store Manager', 'store_manager', 'Full store access', '{"store": "all"}'),
('Accountant', 'accountant', 'Financial operations', '{"invoices": ["read", "create", "update"], "reports": ["read", "export"]}'),
('Data Entry', 'data_entry', 'Data entry only', '{"invoices": ["create"], "inventory": ["create"]}'),
('Warehouse Manager', 'warehouse_manager', 'Inventory management', '{"inventory": ["all"]}'),
('Employee', 'employee', 'View own data only', '{"profile": ["read"]}');

-- Users Table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id),
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    avatar_url TEXT,
    locale VARCHAR(10) DEFAULT 'ar', -- ar, en, tr
    theme VARCHAR(20) DEFAULT 'light', -- light, dark
    account_expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes on users
CREATE INDEX idx_users_store_id ON users(store_id);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_account_expires ON users(account_expires_at);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- create, update, delete, login, logout
    entity_type VARCHAR(100), -- invoice, employee, inventory, etc.
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes on audit_logs
CREATE INDEX idx_audit_logs_store_id ON audit_logs(store_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- FINANCIAL TABLES
-- ============================================

-- Partners Table (Customers & Vendors)
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- customer, vendor, both
    code VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    tax_number VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    notes TEXT,
    credit_limit DECIMAL(15,2),
    current_balance DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes on partners
CREATE INDEX idx_partners_store_id ON partners(store_id);
CREATE INDEX idx_partners_type ON partners(type);
CREATE INDEX idx_partners_code ON partners(code);
CREATE INDEX idx_partners_name ON partners(name);

-- Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- income, expense, inventory
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    color VARCHAR(7),
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes on categories
CREATE INDEX idx_categories_store_id ON categories(store_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);

-- Invoices In (Revenues/Income)
CREATE TABLE invoices_in (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) REFERENCES currencies(code) NOT NULL,
    description TEXT,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    payment_status VARCHAR(50) DEFAULT 'unpaid', -- unpaid, partial, paid
    payment_method VARCHAR(50), -- cash, bank_transfer, credit_card, etc.
    attachments JSONB DEFAULT '[]',
    notes TEXT,
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes on invoices_in
CREATE INDEX idx_invoices_in_store_id ON invoices_in(store_id);
CREATE INDEX idx_invoices_in_customer_id ON invoices_in(customer_id);
CREATE INDEX idx_invoices_in_category_id ON invoices_in(category_id);
CREATE INDEX idx_invoices_in_invoice_date ON invoices_in(invoice_date DESC);
CREATE INDEX idx_invoices_in_currency ON invoices_in(currency);
CREATE INDEX idx_invoices_in_payment_status ON invoices_in(payment_status);

-- Invoices Out (Expenses)
CREATE TABLE invoices_out (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    vendor_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) REFERENCES currencies(code) NOT NULL,
    description TEXT,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    payment_status VARCHAR(50) DEFAULT 'unpaid', -- unpaid, partial, paid
    payment_method VARCHAR(50), -- cash, bank_transfer, credit_card, etc.
    attachments JSONB DEFAULT '[]',
    notes TEXT,
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes on invoices_out
CREATE INDEX idx_invoices_out_store_id ON invoices_out(store_id);
CREATE INDEX idx_invoices_out_vendor_id ON invoices_out(vendor_id);
CREATE INDEX idx_invoices_out_category_id ON invoices_out(category_id);
CREATE INDEX idx_invoices_out_invoice_date ON invoices_out(invoice_date DESC);
CREATE INDEX idx_invoices_out_currency ON invoices_out(currency);
CREATE INDEX idx_invoices_out_payment_status ON invoices_out(payment_status);

-- ============================================
-- INVENTORY TABLES
-- ============================================

-- Inventory Items Table
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    unit VARCHAR(50) NOT NULL, -- piece, kg, liter, box, etc.
    cost_price DECIMAL(15,2),
    selling_price DECIMAL(15,2),
    currency VARCHAR(3) REFERENCES currencies(code) NOT NULL,
    current_stock DECIMAL(15,3) DEFAULT 0,
    min_stock DECIMAL(15,3) DEFAULT 0,
    max_stock DECIMAL(15,3),
    reorder_point DECIMAL(15,3),
    location VARCHAR(255),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes on inventory_items
CREATE INDEX idx_inventory_items_store_id ON inventory_items(store_id);
CREATE INDEX idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_items_barcode ON inventory_items(barcode);
CREATE INDEX idx_inventory_items_category_id ON inventory_items(category_id);
CREATE INDEX idx_inventory_items_stock ON inventory_items(current_stock);

-- Inventory Movements Table
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- in, out, adjustment, transfer
    quantity DECIMAL(15,3) NOT NULL,
    unit_price DECIMAL(15,2),
    total_price DECIMAL(15,2),
    currency VARCHAR(3) REFERENCES currencies(code),
    reference_type VARCHAR(50), -- invoice_in, invoice_out, adjustment, etc.
    reference_id UUID,
    movement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes on inventory_movements
CREATE INDEX idx_inventory_movements_store_id ON inventory_movements(store_id);
CREATE INDEX idx_inventory_movements_item_id ON inventory_movements(item_id);
CREATE INDEX idx_inventory_movements_type ON inventory_movements(type);
CREATE INDEX idx_inventory_movements_date ON inventory_movements(movement_date DESC);
CREATE INDEX idx_inventory_movements_reference ON inventory_movements(reference_type, reference_id);

-- ============================================
-- EMPLOYEE & PAYROLL TABLES
-- ============================================

-- Employees Table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    employee_code VARCHAR(50),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    national_id VARCHAR(100),
    date_of_birth DATE,
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
    department VARCHAR(100),
    position VARCHAR(100),
    base_salary DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) REFERENCES currencies(code) NOT NULL,
    bank_name VARCHAR(255),
    bank_account VARCHAR(100),
    address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active', -- active, on_leave, suspended, terminated
    termination_date DATE,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes on employees
CREATE INDEX idx_employees_store_id ON employees(store_id);
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_code ON employees(employee_code);
CREATE INDEX idx_employees_status ON employees(status);

-- Employee Transactions Table (Advances, Deductions, Bonuses, Absences)
CREATE TABLE employee_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- advance, deduction, bonus, absence
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) REFERENCES currencies(code) NOT NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    reference_number VARCHAR(100),
    is_paid BOOLEAN DEFAULT false,
    paid_date DATE,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes on employee_transactions
CREATE INDEX idx_employee_transactions_store_id ON employee_transactions(store_id);
CREATE INDEX idx_employee_transactions_employee_id ON employee_transactions(employee_id);
CREATE INDEX idx_employee_transactions_type ON employee_transactions(type);
CREATE INDEX idx_employee_transactions_date ON employee_transactions(transaction_date DESC);

-- Payroll Table
CREATE TABLE payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    period_month INT NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    period_year INT NOT NULL CHECK (period_year >= 2000),
    base_salary DECIMAL(15,2) NOT NULL,
    total_bonuses DECIMAL(15,2) DEFAULT 0,
    total_deductions DECIMAL(15,2) DEFAULT 0,
    total_advances DECIMAL(15,2) DEFAULT 0,
    absence_days INT DEFAULT 0,
    absence_deduction DECIMAL(15,2) DEFAULT 0,
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    overtime_amount DECIMAL(15,2) DEFAULT 0,
    gross_salary DECIMAL(15,2) NOT NULL,
    net_salary DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) REFERENCES currencies(code) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- draft, approved, paid
    payment_date DATE,
    payment_method VARCHAR(50),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, period_month, period_year)
);

-- Create indexes on payroll
CREATE INDEX idx_payroll_store_id ON payroll(store_id);
CREATE INDEX idx_payroll_employee_id ON payroll(employee_id);
CREATE INDEX idx_payroll_period ON payroll(period_year, period_month);
CREATE INDEX idx_payroll_status ON payroll(status);

-- ============================================
-- NOTIFICATION & ALERTS TABLES
-- ============================================

-- Alerts Table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- low_stock, invoice_overdue, subscription_expiring, etc.
    severity VARCHAR(50) DEFAULT 'info', -- info, warning, critical
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ
);

-- Create indexes on alerts
CREATE INDEX idx_alerts_store_id ON alerts(store_id);
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);

-- User Notifications Table
CREATE TABLE user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes on user_notifications
CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_alert_id ON user_notifications(alert_id);
CREATE INDEX idx_user_notifications_is_read ON user_notifications(is_read);

-- ============================================
-- SETTINGS & CONFIGURATION TABLES
-- ============================================

-- Settings Table
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, category, key)
);

-- Create indexes on settings
CREATE INDEX idx_settings_store_id ON settings(store_id);
CREATE INDEX idx_settings_category ON settings(category);

-- ============================================
-- REPORTS CACHE TABLE
-- ============================================

CREATE TABLE reports_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    report_type VARCHAR(100) NOT NULL,
    params_hash VARCHAR(64) NOT NULL,
    data JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, report_type, params_hash)
);

-- Create indexes on reports_cache
CREATE INDEX idx_reports_cache_store_id ON reports_cache(store_id);
CREATE INDEX idx_reports_cache_type ON reports_cache(report_type);
CREATE INDEX idx_reports_cache_expires ON reports_cache(expires_at);

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_in_updated_at BEFORE UPDATE ON invoices_in FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_out_updated_at BEFORE UPDATE ON invoices_out FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_transactions_updated_at BEFORE UPDATE ON employee_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payroll_updated_at BEFORE UPDATE ON payroll FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update inventory stock
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'in' THEN
        UPDATE inventory_items 
        SET current_stock = current_stock + NEW.quantity
        WHERE id = NEW.item_id;
    ELSIF NEW.type = 'out' THEN
        UPDATE inventory_items 
        SET current_stock = current_stock - NEW.quantity
        WHERE id = NEW.item_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_inventory_stock
AFTER INSERT ON inventory_movements
FOR EACH ROW EXECUTE FUNCTION update_inventory_stock();

-- Function to check low stock and create alerts
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.current_stock <= NEW.min_stock AND NEW.is_active = true THEN
        INSERT INTO alerts (store_id, type, severity, title, message, reference_type, reference_id)
        VALUES (
            NEW.store_id,
            'low_stock',
            'warning',
            'Low Stock Alert',
            'Item ' || NEW.name || ' (SKU: ' || NEW.sku || ') is running low. Current stock: ' || NEW.current_stock || ', Minimum: ' || NEW.min_stock,
            'inventory_item',
            NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_check_low_stock
AFTER UPDATE OF current_stock ON inventory_items
FOR EACH ROW EXECUTE FUNCTION check_low_stock();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices_in ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices_out ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports_cache ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (examples - adjust based on your needs)
-- Users can only see data from their own store
CREATE POLICY users_store_isolation ON users
    FOR ALL
    USING (store_id = (SELECT store_id FROM users WHERE id = auth.uid()));

CREATE POLICY partners_store_isolation ON partners
    FOR ALL
    USING (store_id = (SELECT store_id FROM users WHERE id = auth.uid()));

CREATE POLICY invoices_in_store_isolation ON invoices_in
    FOR ALL
    USING (store_id = (SELECT store_id FROM users WHERE id = auth.uid()));

CREATE POLICY invoices_out_store_isolation ON invoices_out
    FOR ALL
    USING (store_id = (SELECT store_id FROM users WHERE id = auth.uid()));

CREATE POLICY inventory_items_store_isolation ON inventory_items
    FOR ALL
    USING (store_id = (SELECT store_id FROM users WHERE id = auth.uid()));

CREATE POLICY employees_store_isolation ON employees
    FOR ALL
    USING (store_id = (SELECT store_id FROM users WHERE id = auth.uid()));

-- ============================================
-- INITIAL DATA
-- ============================================

-- This will be handled by seed files

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE stores IS 'Stores table for multi-tenant architecture';
COMMENT ON TABLE users IS 'Users table extending Supabase auth.users';
COMMENT ON TABLE currencies IS 'Supported currencies (TRY, SYP, USD)';
COMMENT ON TABLE invoices_in IS 'Income/Revenue invoices';
COMMENT ON TABLE invoices_out IS 'Expense invoices';
COMMENT ON TABLE inventory_items IS 'Inventory items with stock tracking';
COMMENT ON TABLE inventory_movements IS 'All inventory movements (in/out/adjustments)';
COMMENT ON TABLE employees IS 'Employee master data';
COMMENT ON TABLE payroll IS 'Monthly payroll records with automatic calculations';
