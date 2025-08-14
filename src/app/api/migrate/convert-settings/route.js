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

    // คำสั่ง SQL สำหรับแปลงตาราง settings
    const convertSettingsSQL = `
      -- 1. สร้างตาราง settings ใหม่
      CREATE TABLE IF NOT EXISTS settings_new (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        site_name VARCHAR(255),
        site_description TEXT,
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        address TEXT,
        facebook_url TEXT,
        instagram_url TEXT,
        line_id VARCHAR(100),
        currency VARCHAR(10) DEFAULT 'THB',
        tax_rate DECIMAL(5,2) DEFAULT 7.00,
        shipping_fee DECIMAL(10,2) DEFAULT 50.00,
        min_order_amount DECIMAL(10,2) DEFAULT 500.00,
        maintenance_mode BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 2. แปลงข้อมูลจาก key-value เป็นแถวเดียว
      INSERT INTO settings_new (
        site_name,
        site_description,
        contact_email,
        contact_phone,
        address,
        facebook_url,
        instagram_url,
        line_id,
        currency,
        tax_rate,
        shipping_fee,
        min_order_amount,
        maintenance_mode
      )
      SELECT 
        MAX(CASE WHEN key = 'site_name' THEN value END) as site_name,
        MAX(CASE WHEN key = 'site_description' THEN value END) as site_description,
        MAX(CASE WHEN key = 'contact_email' THEN value END) as contact_email,
        MAX(CASE WHEN key = 'contact_phone' THEN value END) as contact_phone,
        MAX(CASE WHEN key = 'address' THEN value END) as address,
        MAX(CASE WHEN key = 'facebook_url' THEN value END) as facebook_url,
        MAX(CASE WHEN key = 'instagram_url' THEN value END) as instagram_url,
        MAX(CASE WHEN key = 'line_id' THEN value END) as line_id,
        MAX(CASE WHEN key = 'currency' THEN value END) as currency,
        MAX(CASE WHEN key = 'tax_rate' THEN CAST(value AS DECIMAL(5,2)) END) as tax_rate,
        MAX(CASE WHEN key = 'shipping_fee' THEN CAST(value AS DECIMAL(10,2)) END) as shipping_fee,
        MAX(CASE WHEN key = 'min_order_amount' THEN CAST(value AS DECIMAL(10,2)) END) as min_order_amount,
        MAX(CASE WHEN key = 'maintenance_mode' THEN CAST(value AS BOOLEAN) END) as maintenance_mode
      FROM settings;

      -- 3. ตรวจสอบว่ามีข้อมูลหรือไม่ ถ้าไม่มีให้ใส่ข้อมูลเริ่มต้น
      INSERT INTO settings_new (
        site_name,
        site_description,
        contact_email,
        contact_phone,
        address,
        facebook_url,
        instagram_url,
        line_id,
        currency,
        tax_rate,
        shipping_fee,
        min_order_amount,
        maintenance_mode
      )
      SELECT 
        'AVT Shop',
        'ร้านค้าออนไลน์คุณภาพสูง',
        'contact@avtshop.com',
        '02-123-4567',
        '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
        '',
        '',
        '',
        'THB',
        7.00,
        50.00,
        500.00,
        false
      WHERE NOT EXISTS (SELECT 1 FROM settings_new);

      -- 4. ลบตารางเก่าและเปลี่ยนชื่อตารางใหม่
      DROP TABLE IF EXISTS settings;
      ALTER TABLE settings_new RENAME TO settings;
    `

    // รันคำสั่ง SQL
    await supabase.rpc('exec_sql', { sql: convertSettingsSQL })

    // ตรวจสอบผลลัพธ์
    const { data: settings, error: checkError } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single()

    if (checkError) {
      throw new Error(`Failed to verify conversion: ${checkError.message}`)
    }

    return Response.json({ 
      message: 'Settings table converted to single row successfully',
      success: true,
      settings
    })

  } catch (error) {
    console.error('Convert settings error:', error)
    return Response.json(
      { error: error.message || 'Failed to convert settings table' },
      { status: 500 }
    )
  }
}
