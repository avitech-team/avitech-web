import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

function verifyAdmin(req) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    if (decoded.role !== 1 && decoded.role !== "1") {
      return null
    }
    return decoded
  } catch (error) {
    return null
  }
}

export async function POST(request) {
  try {
    const user = verifyAdmin(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    // คำสั่ง SQL สำหรับสร้างตารางตั้งค่าเว็บไซต์แยกตามหมวดหมู่
    const createWebsiteSettingsSQL = `
      -- 1. หน้าหลัก (Homepage Settings)
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

      -- 2. เกี่ยวกับเรา (About Us Settings)
      CREATE TABLE IF NOT EXISTS about_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        company_name VARCHAR(255),
        company_description TEXT,
        company_history TEXT,
        mission TEXT,
        vision TEXT,
        values TEXT,
        team_description TEXT,
        about_image_url TEXT,
        show_team_section BOOLEAN DEFAULT true,
        show_history_section BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 3. รูปภาพ (Image Settings)
      CREATE TABLE IF NOT EXISTS image_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        logo_url TEXT,
        favicon_url TEXT,
        default_product_image TEXT,
        default_category_image TEXT,
        default_user_avatar TEXT,
        image_quality INTEGER DEFAULT 80,
        max_image_size INTEGER DEFAULT 5242880, -- 5MB
        allowed_image_types TEXT[] DEFAULT ARRAY['jpg', 'jpeg', 'png', 'webp'],
        enable_image_compression BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 4. Social Media Settings
      CREATE TABLE IF NOT EXISTS social_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        facebook_url TEXT,
        instagram_url TEXT,
        twitter_url TEXT,
        youtube_url TEXT,
        tiktok_url TEXT,
        line_id VARCHAR(100),
        line_url TEXT,
        whatsapp_number VARCHAR(20),
        whatsapp_url TEXT,
        telegram_url TEXT,
        linkedin_url TEXT,
        show_social_links BOOLEAN DEFAULT true,
        show_social_share BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 5. รูปภาพที่เกี่ยวข้อง (Gallery Settings)
      CREATE TABLE IF NOT EXISTS gallery_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        gallery_title VARCHAR(255),
        gallery_description TEXT,
        max_images_per_page INTEGER DEFAULT 12,
        show_gallery_section BOOLEAN DEFAULT true,
        enable_lightbox BOOLEAN DEFAULT true,
        enable_slideshow BOOLEAN DEFAULT false,
        slideshow_interval INTEGER DEFAULT 5000,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 6. SEO Settings
      CREATE TABLE IF NOT EXISTS seo_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        site_title VARCHAR(255),
        site_description TEXT,
        site_keywords TEXT,
        google_analytics_id VARCHAR(50),
        google_tag_manager_id VARCHAR(50),
        facebook_pixel_id VARCHAR(50),
        meta_robots VARCHAR(100) DEFAULT 'index, follow',
        og_image_url TEXT,
        twitter_card_type VARCHAR(20) DEFAULT 'summary_large_image',
        enable_schema_markup BOOLEAN DEFAULT true,
        enable_sitemap BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 7. Contact Settings
      CREATE TABLE IF NOT EXISTS contact_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        contact_address TEXT,
        contact_map_url TEXT,
        business_hours TEXT,
        show_contact_form BOOLEAN DEFAULT true,
        show_map BOOLEAN DEFAULT true,
        show_business_hours BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 8. E-commerce Settings
      CREATE TABLE IF NOT EXISTS ecommerce_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        currency VARCHAR(10) DEFAULT 'THB',
        currency_symbol VARCHAR(5) DEFAULT '฿',
        tax_rate DECIMAL(5,2) DEFAULT 7.00,
        shipping_fee DECIMAL(10,2) DEFAULT 50.00,
        min_order_amount DECIMAL(10,2) DEFAULT 500.00,
        free_shipping_threshold DECIMAL(10,2) DEFAULT 1000.00,
        enable_coupons BOOLEAN DEFAULT true,
        enable_reviews BOOLEAN DEFAULT true,
        enable_wishlist BOOLEAN DEFAULT true,
        enable_compare BOOLEAN DEFAULT true,
        products_per_page INTEGER DEFAULT 12,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 9. System Settings
      CREATE TABLE IF NOT EXISTS system_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        maintenance_mode BOOLEAN DEFAULT false,
        maintenance_message TEXT,
        timezone VARCHAR(50) DEFAULT 'Asia/Bangkok',
        date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
        time_format VARCHAR(10) DEFAULT '24',
        language VARCHAR(10) DEFAULT 'th',
        enable_registration BOOLEAN DEFAULT true,
        enable_guest_checkout BOOLEAN DEFAULT true,
        session_timeout INTEGER DEFAULT 3600,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- ปิด RLS สำหรับทุกตาราง
      ALTER TABLE homepage_settings DISABLE ROW LEVEL SECURITY;
      ALTER TABLE about_settings DISABLE ROW LEVEL SECURITY;
      ALTER TABLE image_settings DISABLE ROW LEVEL SECURITY;
      ALTER TABLE social_settings DISABLE ROW LEVEL SECURITY;
      ALTER TABLE gallery_settings DISABLE ROW LEVEL SECURITY;
      ALTER TABLE seo_settings DISABLE ROW LEVEL SECURITY;
      ALTER TABLE contact_settings DISABLE ROW LEVEL SECURITY;
      ALTER TABLE ecommerce_settings DISABLE ROW LEVEL SECURITY;
      ALTER TABLE system_settings DISABLE ROW LEVEL SECURITY;

      -- เพิ่มข้อมูลเริ่มต้นในแต่ละตาราง
      INSERT INTO homepage_settings (
        hero_title,
        hero_subtitle,
        hero_image_url,
        featured_products_count,
        show_featured_products,
        show_latest_products,
        show_categories,
        show_brands
      ) VALUES (
        'ยินดีต้อนรับสู่ AVT Shop',
        'ร้านค้าออนไลน์คุณภาพสูง พร้อมบริการส่งฟรีทั่วประเทศ',
        '',
        8,
        true,
        true,
        true,
        true
      ) ON CONFLICT DO NOTHING;

      INSERT INTO about_settings (
        company_name,
        company_description,
        company_history,
        mission,
        vision,
        values
      ) VALUES (
        'AVT Shop',
        'ร้านค้าออนไลน์ที่มุ่งมั่นให้บริการลูกค้าด้วยสินค้าคุณภาพสูงและบริการที่ดีที่สุด',
        'ก่อตั้งขึ้นในปี 2024 ด้วยความมุ่งมั่นที่จะเป็นร้านค้าออนไลน์ชั้นนำ',
        'มุ่งมั่นให้บริการลูกค้าด้วยสินค้าคุณภาพสูงและบริการที่ดีที่สุด',
        'เป็นร้านค้าออนไลน์ชั้นนำที่ลูกค้าไว้วางใจ',
        'คุณภาพ, ความซื่อสัตย์, การบริการที่ดี'
      ) ON CONFLICT DO NOTHING;

      INSERT INTO image_settings (
        logo_url,
        favicon_url,
        default_product_image,
        image_quality,
        max_image_size,
        allowed_image_types
      ) VALUES (
        '',
        '',
        '',
        80,
        5242880,
        ARRAY['jpg', 'jpeg', 'png', 'webp']
      ) ON CONFLICT DO NOTHING;

      INSERT INTO social_settings (
        facebook_url,
        instagram_url,
        line_id,
        show_social_links,
        show_social_share
      ) VALUES (
        '',
        '',
        '',
        true,
        true
      ) ON CONFLICT DO NOTHING;

      INSERT INTO gallery_settings (
        gallery_title,
        gallery_description,
        max_images_per_page,
        show_gallery_section,
        enable_lightbox
      ) VALUES (
        'แกลเลอรี่',
        'ชมภาพสินค้าและกิจกรรมต่างๆ ของเรา',
        12,
        true,
        true
      ) ON CONFLICT DO NOTHING;

      INSERT INTO seo_settings (
        site_title,
        site_description,
        site_keywords,
        meta_robots,
        enable_schema_markup,
        enable_sitemap
      ) VALUES (
        'AVT Shop - ร้านค้าออนไลน์คุณภาพสูง',
        'ร้านค้าออนไลน์คุณภาพสูง พร้อมบริการส่งฟรีทั่วประเทศ',
        'ร้านค้าออนไลน์, สินค้าคุณภาพ, ส่งฟรี',
        'index, follow',
        true,
        true
      ) ON CONFLICT DO NOTHING;

      INSERT INTO contact_settings (
        contact_email,
        contact_phone,
        contact_address,
        show_contact_form,
        show_map,
        show_business_hours
      ) VALUES (
        'contact@avtshop.com',
        '02-123-4567',
        '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
        true,
        true,
        true
      ) ON CONFLICT DO NOTHING;

      INSERT INTO ecommerce_settings (
        currency,
        currency_symbol,
        tax_rate,
        shipping_fee,
        min_order_amount,
        free_shipping_threshold,
        enable_coupons,
        enable_reviews,
        products_per_page
      ) VALUES (
        'THB',
        '฿',
        7.00,
        50.00,
        500.00,
        1000.00,
        true,
        true,
        12
      ) ON CONFLICT DO NOTHING;

      INSERT INTO system_settings (
        maintenance_mode,
        maintenance_message,
        timezone,
        date_format,
        time_format,
        language,
        enable_registration,
        enable_guest_checkout
      ) VALUES (
        false,
        'เว็บไซต์อยู่ระหว่างการบำรุงรักษา กรุณาลองใหม่อีกครั้งในภายหลัง',
        'Asia/Bangkok',
        'DD/MM/YYYY',
        '24',
        'th',
        true,
        true
      ) ON CONFLICT DO NOTHING;
    `

    // รันคำสั่ง SQL
    await supabase.rpc('exec_sql', { sql: createWebsiteSettingsSQL })

    return Response.json({ 
      message: 'Website settings tables created successfully',
      success: true,
      tables: [
        'homepage_settings',
        'about_settings', 
        'image_settings',
        'social_settings',
        'gallery_settings',
        'seo_settings',
        'contact_settings',
        'ecommerce_settings',
        'system_settings'
      ]
    })

  } catch (error) {
    console.error('Create website settings error:', error)
    return Response.json(
      { error: error.message || 'Failed to create website settings tables' },
      { status: 500 }
    )
  }
}
