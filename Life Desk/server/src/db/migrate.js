import { pool } from '../config/db.js';

const schemaSQL = `
-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Assets Table (The Central Entity)
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,              -- Electronics, Appliances, Vehicles, Furniture
    brand VARCHAR(100),
    model_number VARCHAR(100),
    serial_number VARCHAR(100),
    purchase_date DATE,
    purchase_price NUMERIC(10,2) DEFAULT 0.00,
    store_vendor VARCHAR(150),
    location_room VARCHAR(100),                 -- Kitchen, Living Room, Garage, Office
    warranty_expiry_date DATE,
    status VARCHAR(30) DEFAULT 'Active',        -- Active, In Repair, Retired, Sold
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_warranty ON assets(warranty_expiry_date);

-- 3. Documents Table (LifeAdmin Module)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL, -- Can be linked to an asset or standalone
    title VARCHAR(150) NOT NULL,
    document_type VARCHAR(50) NOT NULL,         -- Invoice, Warranty_Card, Insurance_Policy, Manual, Other
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_documents_asset_id ON documents(asset_id);
CREATE INDEX IF NOT EXISTS idx_documents_expiry ON documents(expiry_date);

-- 4. Subscriptions & Contracts (SubSave Module)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL, -- Optional link (e.g., Car Insurance, Appliance AMC)
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,              -- Software, AMC, Insurance, Utility, Entertainment
    cost NUMERIC(10,2) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL,         -- Monthly, Quarterly, Annually
    start_date DATE DEFAULT CURRENT_DATE,
    next_renewal_date DATE NOT NULL,
    auto_renew BOOLEAN DEFAULT TRUE,
    reminder_days_before INTEGER DEFAULT 7,
    status VARCHAR(20) DEFAULT 'Active',        -- Active, Paused, Cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_subs_user_renewal ON subscriptions(user_id, next_renewal_date);

-- 5. Maintenance & Repairs (FixFlow Module)
CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    service_type VARCHAR(50) NOT NULL,          -- Repair, Inspection, Preventive, Cleaning
    status VARCHAR(30) DEFAULT 'Reported',      -- Reported, Scheduled, In_Progress, Completed
    reported_date DATE DEFAULT CURRENT_DATE,
    service_date DATE,
    service_provider_name VARCHAR(150),
    service_provider_contact VARCHAR(100),
    technician_notes TEXT,
    labor_cost NUMERIC(10,2) DEFAULT 0.00,
    parts_cost NUMERIC(10,2) DEFAULT 0.00,
    total_cost NUMERIC(10,2) GENERATED ALWAYS AS (labor_cost + parts_cost) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_maint_asset ON maintenance_records(asset_id);

-- 6. Activity Logs (Powers the Smart Timeline & Total Cost of Ownership)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,            -- Asset_Created, Doc_Uploaded, Service_Logged, Renewal_Paid
    description TEXT NOT NULL,
    cost_impact NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_activity_asset ON activity_logs(asset_id);

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reference_id UUID,
    reference_type VARCHAR(50) NOT NULL,        -- Warranty_Expiry, Subscription_Renewal, Maintenance_Due
    title VARCHAR(200) NOT NULL,
    message TEXT,
    due_date DATE NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, is_read);
`;

async function runSingleFileMigration() {
  const client = await pool.connect();
  try {
    console.log('🚀 Running complete LifeDesk database migration...\n');
    
    // Execute all tables in a single safe transaction
    await client.query('BEGIN');
    await client.query(schemaSQL);
    await client.query('COMMIT');

    console.log('✅ 1. users table ready');
    console.log('✅ 2. assets table ready');
    console.log('✅ 3. documents table ready (LifeAdmin Vault)');
    console.log('✅ 4. subscriptions table ready (SubSave)');
    console.log('✅ 5. maintenance_records table ready (FixFlow)');
    console.log('✅ 6. activity_logs table ready (Smart Timeline)');
    console.log('✅ 7. notifications table ready');
    console.log('\n🎉 Database setup completed successfully in life_desk_16!');
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed, rolled back changes:', err);
    process.exit(1);
  } finally {
    client.release();
  }
}

runSingleFileMigration();