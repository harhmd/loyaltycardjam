-- ==============================================================
-- DATABASE INITIALIZATION FOR JAM LOYALTY CARD (loayltycardjam)
-- Database Name: jamcard_db & loyaltycardjam_db
-- Table Prefix: Jamcard_xxx
-- ==============================================================

-- 1. Create Tables with 'Jamcard_' Prefix
CREATE TABLE IF NOT EXISTS "Jamcard_members" (
    id VARCHAR(50) PRIMARY KEY,
    card_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    ic_number VARCHAR(50),
    category VARCHAR(50) DEFAULT 'Warga MADANI',
    points BIGINT DEFAULT 0,
    points_expiry_date VARCHAR(50) DEFAULT '2026-11-08 18:00',
    expired_points_total BIGINT DEFAULT 0,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Jamcard_sellers" (
    id VARCHAR(50) PRIMARY KEY,
    stall_number VARCHAR(50) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    total_collected_sen BIGINT DEFAULT 0,
    unclaimed_sen BIGINT DEFAULT 0,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Jamcard_transactions" (
    id VARCHAR(50) PRIMARY KEY,
    timestamp VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    member_id VARCHAR(50) NOT NULL,
    member_name VARCHAR(255) NOT NULL,
    seller_id VARCHAR(50),
    seller_name VARCHAR(255),
    stall_number VARCHAR(50),
    amount_sen BIGINT NOT NULL,
    amount_points BIGINT NOT NULL,
    amount_rm NUMERIC(10,2) NOT NULL,
    note TEXT,
    status VARCHAR(50) DEFAULT 'SUCCESS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Jamcard_claims" (
    id VARCHAR(50) PRIMARY KEY,
    seller_id VARCHAR(50) NOT NULL,
    seller_name VARCHAR(255) NOT NULL,
    stall_number VARCHAR(50) NOT NULL,
    amount_rm NUMERIC(10,2) NOT NULL,
    timestamp VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Jamcard_products" (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    stall_id VARCHAR(50),
    stall_name VARCHAR(255),
    price_rm NUMERIC(10,2) NOT NULL,
    subsidy_price_rm NUMERIC(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    stock INT DEFAULT 100,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Jamcard_events" (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    date_str VARCHAR(100) NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    subsidy_amount_rm NUMERIC(10,2) DEFAULT 10.00,
    subsidy_points BIGINT DEFAULT 1000,
    total_quota INT DEFAULT 1000,
    claimed_count INT DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Jamcard_campaigns" (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_budget_rm NUMERIC(12,2) DEFAULT 50000.00,
    allocated_rm NUMERIC(12,2) DEFAULT 0.00,
    rate_per_sen INT DEFAULT 1,
    default_expiry_days INT DEFAULT 4,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Jamcard_settings" (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Seed Initial Demo Data into Jamcard_xxx tables
INSERT INTO "Jamcard_members" (id, card_id, name, phone, ic_number, category, points, points_expiry_date, expired_points_total, avatar_url)
VALUES 
    ('MEM-001', 'JAM-88219-MY', 'Puan Siti Norhaliza binti Daud', '012-3456789', '850412-10-5432', 'Keluarga B40 Putrajaya', 1000, '2026-11-08 18:00', 0, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'),
    ('MEM-002', 'JAM-77341-MY', 'Encik Ahmad bin Kassim', '019-8765432', '780220-14-5123', 'Warga Emas Presint 9', 1000, '2026-11-08 18:00', 0, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'),
    ('MEM-003', 'JAM-66512-MY', 'Puan Fatimah binti Sulaiman', '017-6543210', '901103-08-6044', 'Ibu Tunggal Komuniti', 1000, '2026-11-08 18:00', 0, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    points = EXCLUDED.points,
    points_expiry_date = EXCLUDED.points_expiry_date;

INSERT INTO "Jamcard_sellers" (id, stall_number, business_name, owner_name, category, location, total_collected_sen, unclaimed_sen)
VALUES 
    ('STALL-001', 'A-01', 'Gerai Ayam Bismi Segar', 'Pak Ali bin Hassan', 'Ayam & Daging', 'Zon Basah Putrajaya', 0, 0),
    ('STALL-002', 'B-03', 'Gerai Telur & Runcit Samad', 'Cikgu Samad', 'Telur & Runcit', 'Zon Kering & Barangan Asas', 0, 0),
    ('STALL-003', 'C-05', 'Gerai Buah Tempatan Som', 'Kak Som', 'Buah-Buahan', 'Zon Buah Tropika', 0, 0),
    ('STALL-004', 'D-08', 'Gerai Sayur Kampung Mak Jah', 'Mak Jah', 'Sayur-Sayuran', 'Zon Tani Hijau', 0, 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Jamcard_products" (id, name, category, stall_id, stall_name, price_rm, subsidy_price_rm, unit, stock, image_url)
VALUES
    ('PROD-001', 'Ayam Segar Standard (1 Ekor)', 'Ayam Segar', 'STALL-001', 'Gerai Ayam Bismi Segar', 14.00, 10.00, 'ekor', 50, '/ayam_segar.png'),
    ('PROD-002', 'Telur Ayam Gred A (Sarang 30 Biji)', 'Telur Ayam', 'STALL-002', 'Gerai Telur & Runcit Samad', 16.50, 12.00, 'sarang', 80, '/telur_ayam.png'),
    ('PROD-003', 'Nenas MD2 Manis & Buah Tropika (1 Biji)', 'Buah Tempatan', 'STALL-003', 'Gerai Buah Tempatan Som', 8.00, 5.00, 'biji', 60, '/buah_tempatan.png'),
    ('PROD-004', 'Sayur Sawi, Kangkung & Bayam Segar', 'Sayur Kampung', 'STALL-004', 'Gerai Sayur Kampung Mak Jah', 5.00, 3.00, 'ikat', 100, '/sayur_kampung.png')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Jamcard_events" (id, name, venue, state, date_str, start_time, end_time, status, subsidy_amount_rm, subsidy_points, total_quota, claimed_count, description)
VALUES
    ('EVT-PUTRAJAYA', 'Jualan Agro MADANI Putrajaya Presint 2', 'Tapak Pasar Tani Mega, Presint 2, Putrajaya', 'W.P. Putrajaya', '06 Nov 2026 (Hari Ini)', '08:00', '18:00', 'ACTIVE', 10.00, 1000, 1000, 432, 'Program Jualan Agro MADANI Kebangsaan di Presint 2.'),
    ('EVT-SERDANG', 'Jualan Agro MADANI MAEPS Serdang', 'Laman Florikultur, Dewan D MAEPS, Serdang', 'Selangor', '06 Nov 2026 (Hari Ini)', '09:00', '20:00', 'ACTIVE', 10.00, 1000, 1500, 812, 'Jualan Agro MADANI berskala besar di MAEPS Serdang.'),
    ('EVT-SELAYANG', 'Jualan Agro MADANI Pasar Borong Selayang', 'Kompleks Pasar Borong Selayang, Batu Caves', 'Selangor', '06 Nov 2026 (Pagi Tadi)', '07:00', '13:00', 'ENDED', 10.00, 1000, 500, 500, 'Acara telah tamat pada jam 13:00. Mata telah dilupuskan.'),
    ('EVT-MELAWATI', 'Jualan Agro MADANI Stadium Melawati Shah Alam', 'Perkarangan Stadium Melawati, Seksyen 13', 'Selangor', '07 Nov 2026 (Esok)', '08:00', '17:00', 'UPCOMING', 10.00, 1000, 800, 0, 'Pendaftaran awal tuntutan mata subsidi JAM.')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, claimed_count = EXCLUDED.claimed_count;

INSERT INTO "Jamcard_campaigns" (id, name, total_budget_rm, allocated_rm, rate_per_sen, default_expiry_days, status)
VALUES
    ('CAMP-001', 'Kempen Subsidi Pelancaran Kad Kesetiaan JAM Putrajaya', 50000.00, 30.00, 1, 4, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Jamcard_settings" (key, value, description)
VALUES
    ('APP_NAME', 'Sistem Kad Kesetiaan Jualan Agro MADANI', 'Nama Rasmi Aplikasi'),
    ('TABLE_PREFIX', 'Jamcard_', 'Awalan Jadual Pangkalan Data'),
    ('EXCHANGE_RATE', '1 Point = 1 Sen (RM 0.01)', 'Kadar Penebusan Subsidi'),
    ('DEFAULT_EXPIRY', '2026-11-08 18:00', 'Tarikh Luput Lalai Mata'),
    ('GOVERNMENT_INITIATIVE', 'Kementerian Pertanian dan Keterjaminan Makanan (KPKM)', 'Agensi Induk')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
