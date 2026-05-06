-- =============================================
-- SIMPAR UKM — Database Migration
-- PostgreSQL (Neon)
-- =============================================

-- Users
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  phone      VARCHAR(20),
  role       VARCHAR(50)  NOT NULL DEFAULT 'anggota',
  status     VARCHAR(20)  NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Items (Inventaris Barang)
CREATE TABLE IF NOT EXISTS items (
  id              SERIAL PRIMARY KEY,
  code            VARCHAR(50) UNIQUE NOT NULL,
  name            VARCHAR(255) NOT NULL,
  category        VARCHAR(100) NOT NULL,
  description     TEXT,
  total_stock     INT NOT NULL DEFAULT 1,
  available_stock INT NOT NULL DEFAULT 1,
  condition       VARCHAR(50)  DEFAULT 'baik',
  location        VARCHAR(255),
  image_url       TEXT,
  status          VARCHAR(50)  NOT NULL DEFAULT 'available',
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Borrowings (Peminjaman)
CREATE TABLE IF NOT EXISTS borrowings (
  id                 SERIAL PRIMARY KEY,
  user_id            INT REFERENCES users(id) ON DELETE SET NULL,
  item_id            INT REFERENCES items(id) ON DELETE SET NULL,
  quantity           INT NOT NULL DEFAULT 1,
  borrow_date        DATE NOT NULL,
  return_date        DATE NOT NULL,
  actual_return_date DATE,
  purpose            TEXT NOT NULL,
  status             VARCHAR(50) NOT NULL DEFAULT 'pending',
  admin_note         TEXT,
  approved_by        INT REFERENCES users(id) ON DELETE SET NULL,
  created_at         TIMESTAMP DEFAULT NOW(),
  updated_at         TIMESTAMP DEFAULT NOW()
);

-- Archives (Pengarsipan Dokumen)
CREATE TABLE IF NOT EXISTS archives (
  id              SERIAL PRIMARY KEY,
  archive_number  VARCHAR(100) UNIQUE NOT NULL,
  title           VARCHAR(500) NOT NULL,
  year            INT NOT NULL,
  category        VARCHAR(100) NOT NULL,
  division        VARCHAR(255),
  description     TEXT,
  drive_file_id   VARCHAR(255) NOT NULL,
  preview_url     TEXT,
  access_level    VARCHAR(50)  NOT NULL DEFAULT 'internal',
  uploaded_by     INT REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Access Requests (Permintaan Akses Dokumen)
CREATE TABLE IF NOT EXISTS access_requests (
  id           SERIAL PRIMARY KEY,
  user_id      INT REFERENCES users(id) ON DELETE CASCADE,
  archive_id   INT REFERENCES archives(id) ON DELETE CASCADE,
  reason       TEXT NOT NULL,
  evidence     TEXT,
  status       VARCHAR(50) NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT NOW(),
  approved_by  INT REFERENCES users(id) ON DELETE SET NULL,
  approved_at  TIMESTAMP,
  expired_at   TIMESTAMP,
  admin_note   TEXT,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(255) NOT NULL,
  module      VARCHAR(100) NOT NULL,
  description TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Seed admin user (password: admin123)
-- bcrypt hash of 'admin123'
INSERT INTO users (name, email, password, phone, role, status)
VALUES (
  'Administrator',
  'admin@simpar.id',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHam',
  '08000000000',
  'admin',
  'active'
) ON CONFLICT (email) DO NOTHING;
