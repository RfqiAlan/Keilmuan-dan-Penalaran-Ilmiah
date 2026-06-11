-- =============================================
-- SIMPAR UKM — Database Migration V2
-- Fitur: KTA Upload, Dual-Approval, Arsip per Periode
-- =============================================

-- 1. Add KTA (Kartu Tanda Anggota) Google Drive file ID to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS kta_drive_id VARCHAR(255);

-- 2. Add dual-approval system to archives
-- approval_status: 'approved' (default/non-dual), 'draft', 'approved_admin', 'approved_sekum'
ALTER TABLE archives ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'approved';
ALTER TABLE archives ADD COLUMN IF NOT EXISTS approved_by_admin INT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE archives ADD COLUMN IF NOT EXISTS approved_by_sekum INT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE archives ADD COLUMN IF NOT EXISTS admin_approved_at TIMESTAMP;
ALTER TABLE archives ADD COLUMN IF NOT EXISTS sekum_approved_at TIMESTAMP;

-- 3. Update existing archives to have approval_status = 'approved' (already the default)
-- This ensures backward compatibility
UPDATE archives SET approval_status = 'approved' WHERE approval_status IS NULL;
