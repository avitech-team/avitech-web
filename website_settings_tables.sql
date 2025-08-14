-- สร้างตาราง Website Settings ต่างๆ

-- 1. ตาราง Homepage Settings
CREATE TABLE IF NOT EXISTS homepage_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_title VARCHAR(255),
  hero_subtitle TEXT,
  hero_image_url TEXT,
  featured_products_count INTEGER DEFAULT 8,
  show_featured_products BOOLEAN DEFAULT true,
  show_latest_products BOOLEAN DEFAULT true,
  show_categories BOOLEAN DEFAULT true,
  show_brands BOOLEAN DEFAULT true,
  show_testimonials BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ตาราง About Settings
CREATE TABLE IF NOT EXISTS about_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name VARCHAR(255),
  company_description TEXT,
  company_history TEXT,
  mission TEXT,
  vision TEXT,
  values TEXT,
  team_members JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ตาราง Social Settings
CREATE TABLE IF NOT EXISTS social_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facebook_url TEXT,
  instagram_url TEXT,
  line_id VARCHAR(100),
  whatsapp_number VARCHAR(50),
  twitter_url TEXT,
  youtube_url TEXT,
  tiktok_url TEXT,
  show_social_links BOOLEAN DEFAULT true,
  show_social_share BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ตาราง Image Settings
CREATE TABLE IF NOT EXISTS image_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  logo_url TEXT,
  favicon_url TEXT,
  default_product_image TEXT,
  default_category_image TEXT,
  watermark_url TEXT,
  watermark_position VARCHAR(50) DEFAULT 'bottom-right',
  image_quality INTEGER DEFAULT 80,
  max_image_size INTEGER DEFAULT 2048,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ตาราง Gallery Settings
CREATE TABLE IF NOT EXISTS gallery_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gallery_title VARCHAR(255),
  gallery_description TEXT,
  images_per_page INTEGER DEFAULT 12,
  show_lightbox BOOLEAN DEFAULT true,
  enable_zoom BOOLEAN DEFAULT true,
  auto_play BOOLEAN DEFAULT false,
  auto_play_speed INTEGER DEFAULT 3000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ตาราง SEO Settings
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_title VARCHAR(255),
  site_description TEXT,
  site_keywords TEXT,
  google_analytics_id VARCHAR(100),
  google_tag_manager_id VARCHAR(100),
  facebook_pixel_id VARCHAR(100),
  meta_robots VARCHAR(100) DEFAULT 'index, follow',
  og_image_url TEXT,
  twitter_card_type VARCHAR(50) DEFAULT 'summary_large_image',
  canonical_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ตาราง Contact Settings
CREATE TABLE IF NOT EXISTS contact_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_address TEXT,
  business_hours TEXT,
  map_embed_code TEXT,
  contact_form_enabled BOOLEAN DEFAULT true,
  auto_reply_enabled BOOLEAN DEFAULT true,
  auto_reply_subject VARCHAR(255),
  auto_reply_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ตาราง E-commerce Settings
CREATE TABLE IF NOT EXISTS ecommerce_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  currency VARCHAR(10) DEFAULT 'THB',
  currency_symbol VARCHAR(10) DEFAULT '฿',
  tax_rate DECIMAL(5,2) DEFAULT 7.00,
  shipping_fee DECIMAL(10,2) DEFAULT 50.00,
  min_order_amount DECIMAL(10,2) DEFAULT 500.00,
  free_shipping_threshold DECIMAL(10,2) DEFAULT 1000.00,
  stock_warning_threshold INTEGER DEFAULT 5,
  allow_guest_checkout BOOLEAN DEFAULT true,
  require_account_for_purchase BOOLEAN DEFAULT false,
  enable_reviews BOOLEAN DEFAULT true,
  enable_wishlist BOOLEAN DEFAULT true,
  enable_compare BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. ตาราง System Settings
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_name VARCHAR(255),
  site_description TEXT,
  maintenance_mode BOOLEAN DEFAULT false,
  maintenance_message TEXT,
  timezone VARCHAR(100) DEFAULT 'Asia/Bangkok',
  date_format VARCHAR(50) DEFAULT 'DD/MM/YYYY',
  time_format VARCHAR(50) DEFAULT 'HH:mm',
  language VARCHAR(10) DEFAULT 'th',
  enable_registration BOOLEAN DEFAULT true,
  enable_email_verification BOOLEAN DEFAULT false,
  session_timeout INTEGER DEFAULT 3600,
  max_login_attempts INTEGER DEFAULT 5,
  lockout_duration INTEGER DEFAULT 900,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง Indexes
CREATE INDEX IF NOT EXISTS idx_homepage_settings_updated_at ON homepage_settings(updated_at);
CREATE INDEX IF NOT EXISTS idx_about_settings_updated_at ON about_settings(updated_at);
CREATE INDEX IF NOT EXISTS idx_social_settings_updated_at ON social_settings(updated_at);
CREATE INDEX IF NOT EXISTS idx_image_settings_updated_at ON image_settings(updated_at);
CREATE INDEX IF NOT EXISTS idx_gallery_settings_updated_at ON gallery_settings(updated_at);
CREATE INDEX IF NOT EXISTS idx_seo_settings_updated_at ON seo_settings(updated_at);
CREATE INDEX IF NOT EXISTS idx_contact_settings_updated_at ON contact_settings(updated_at);
CREATE INDEX IF NOT EXISTS idx_ecommerce_settings_updated_at ON ecommerce_settings(updated_at);
CREATE INDEX IF NOT EXISTS idx_system_settings_updated_at ON system_settings(updated_at);

-- สร้าง Triggers สำหรับ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_homepage_settings_updated_at BEFORE UPDATE ON homepage_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_about_settings_updated_at BEFORE UPDATE ON about_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_settings_updated_at BEFORE UPDATE ON social_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_image_settings_updated_at BEFORE UPDATE ON image_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_settings_updated_at BEFORE UPDATE ON gallery_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seo_settings_updated_at BEFORE UPDATE ON seo_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_settings_updated_at BEFORE UPDATE ON contact_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ecommerce_settings_updated_at BEFORE UPDATE ON ecommerce_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- หมายเหตุ: ไม่มีการเพิ่มข้อมูลเริ่มต้น ต้องเพิ่มข้อมูลผ่าน API หรือ admin panel
