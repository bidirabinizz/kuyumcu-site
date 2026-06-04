-- SQL SETUP FOR SUPABASE DATABASE
-- COPY AND PASTE THIS ENTIRE SCRIPT INTO THE SQL EDITOR OF YOUR SUPABASE DASHBOARD

-- ========================================================
-- 1. DROP EXISTING TABLES IF THEY EXIST (For clean setup)
-- ========================================================
DROP TABLE IF EXISTS public.links CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;

-- ========================================================
-- 2. CREATE TABLES
-- ========================================================

-- Links Table
CREATE TABLE public.links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Products Table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    weight TEXT,
    carat TEXT,
    code TEXT UNIQUE,
    image TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Settings Table (Key-Value configuration store)
CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ========================================================
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- 4. CREATE POLICIES (Public read, Authenticated write)
-- ========================================================

-- Links Policies
CREATE POLICY "Allow public read access" ON public.links FOR SELECT USING (true);
CREATE POLICY "Allow admin write access" ON public.links FOR ALL TO authenticated USING (true);

-- Products Policies
CREATE POLICY "Allow public read access" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow admin write access" ON public.products FOR ALL TO authenticated USING (true);

-- Settings Policies
CREATE POLICY "Allow public read access" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow admin write access" ON public.settings FOR ALL TO authenticated USING (true);

-- ========================================================
-- 5. SEED DATA (Initial configuration)
-- ========================================================

-- Seed Settings
INSERT INTO public.settings (key, value) VALUES
('whatsapp_number', '905441398739'),
('address', 'Karaca İbrahim Mahallesi, Cumhuriyet Caddesi, No: 23/B, Merkez / Kırklareli'),
('working_hours', '09:00 - 19:00 (Pazar Günleri Kapalıdır)'),
('bg_video_url', 'https://linki.ax/uploads/backgrounds/9ffec930f2decea4d7b82a3349c53ef7.mp4'),
('show_video', 'true'),
('video_opacity', '0.35');

-- Seed Links (Default bio links in sorted order)
INSERT INTO public.links (title, url, is_featured, is_active, sort_order) VALUES
('DİJİTAL KATALOG', '/catalog', true, true, 10),
('WHATSAPP SİPARİŞ', 'whatsapp-siparis', false, true, 20),
('CANLI DÖVİZ & ALTIN', 'canli-doviz', false, true, 30),
('IBAN BİLGİLERİMİZ', 'iban-bilgileri', false, true, 40),
('MAĞAZA SHOWROOM', 'https://share.google/7twxxNF1WEA2hylQG', false, true, 50),
('TOPTAN BİLGİ AL', 'https://share.google/SdKPha71l8JnpTRsC', false, true, 60),
('INSTAGRAM', 'https://www.instagram.com/cantekinkuyumculuk', false, true, 70),
('MÜŞTERİ YORUMLARI', 'https://j1.web.tr/id/cantekinkuyumculuk', false, true, 80),
('İLETİŞİM: SHOWROOM', 'tel:+905441398739', false, true, 90),
('İLETİŞİM: TOPTAN', 'tel:+902882141427', false, true, 100),
('E-POSTA İLETİŞİM', 'mailto:caparkuyumculuk@gmail.com', false, true, 110);

-- Seed Products (Sample catalog products)
INSERT INTO public.products (title, category, weight, carat, code, image, description) VALUES
('Çapar 22 Ayar Üçlü Adana Burma Bilezik', 'bilezikler', '28.40 gr', '22 Ayar Altın', 'CPR-B201', '/images/burma_bilezik.png', 'Geleneksel el işçiliğinin zarafetle buluştuğu, 22 ayar altından üretilmiş özel Adana burması bilezik. Yatırımlık ve ömür boyu kullanılabilecek şık bir tasarım.'),
('Çapar Baget Kesim Pırlanta Tektaş Yüzük', 'yüzükler', '2.85 gr', '0.55 Karat F-VS1 / 14K Beyaz Altın', 'CPR-Y405', '/images/baget_yuzuk.png', 'Modern geometrik hatları ve üstün berraklıktaki F-VS1 baget pırlantasıyla göz kamaştıran, 14 ayar beyaz altın montürlü eşsiz bir evlilik teklifi veya özel gün yüzüğü.'),
('Çapar Osmanlı Tuğralı 22 Ayar Gerdanlık', 'kolyeler', '18.20 gr', '22 Ayar Altın', 'CPR-K302', '/images/tugrali_gerdanlik.png', 'Tarihin asaletini boynunuzda taşıyın. İnce detaylar ve el kalem işçiliğiyle süslenmiş, 22 ayar altın zincir ve Osmanlı tuğrası motifli gerdanlık kolye.'),
('Çapar Doğal İnci Detaylı Altın Küpe', 'küpeler', '4.15 gr', '14 Ayar Altın & Doğal İnci', 'CPR-KU108', '/images/inci_kupe.png', 'Doğal incilerin pürüzsüz parlaklığı ve 14 ayar sarı altının sıcak tonlarının mükemmel uyumu. Hem günlük kullanım hem de özel davetler için zarif bir dokunuş.'),
('Çapar Safir Taşlı Lüks Pırlanta Gerdanlık Set', 'setler', '22.50 gr (Toplam)', '1.20 Karat Safir & 0.85K Pırlanta / 18K', 'CPR-S501', '/images/safir_set.png', 'Derin okyanus mavisi doğal safir taşları ve mikro pırlantalarla bezenmiş gerdanlık, küpe ve yüzükten oluşan 18 ayar beyaz altın lüks saray seti.');
