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

    // คำสั่ง SQL สำหรับแก้ไขตาราง settings
    const fixSettingsSQL = `
      -- ตรวจสอบและเพิ่มคอลัมน์ address
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 
              FROM information_schema.columns 
              WHERE table_name = 'settings' 
              AND column_name = 'address'
          ) THEN
              ALTER TABLE settings ADD COLUMN address TEXT;
          END IF;
      END $$;

      -- ตรวจสอบและเพิ่มคอลัมน์อื่นๆ ที่จำเป็น
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'settings' AND column_name = 'site_name'
          ) THEN
              ALTER TABLE settings ADD COLUMN site_name VARCHAR(255);
          END IF;

          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'settings' AND column_name = 'site_description'
          ) THEN
              ALTER TABLE settings ADD COLUMN site_description TEXT;
          END IF;

          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'settings' AND column_name = 'contact_email'
          ) THEN
              ALTER TABLE settings ADD COLUMN contact_email VARCHAR(255);
          END IF;

          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'settings' AND column_name = 'contact_phone'
          ) THEN
              ALTER TABLE settings ADD COLUMN contact_phone VARCHAR(50);
          END IF;

          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'settings' AND column_name = 'facebook_url'
          ) THEN
              ALTER TABLE settings ADD COLUMN facebook_url TEXT;
          END IF;

          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'settings' AND column_name = 'instagram_url'
          ) THEN
              ALTER TABLE settings ADD COLUMN instagram_url TEXT;
          END IF;

          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'settings' AND column_name = 'line_id'
          ) THEN
              ALTER TABLE settings ADD COLUMN line_id VARCHAR(100);
          END IF;

          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'settings' AND column_name = 'currency'
          ) THEN
              ALTER TABLE settings ADD COLUMN currency VARCHAR(10) DEFAULT 'THB';
          END IF;

          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'settings' AND column_name = 'tax_rate'
          ) THEN
              ALTER TABLE settings ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 7.00;
          END IF;

          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'settings' AND column_name = 'shipping_fee'
          ) THEN
              ALTER TABLE settings ADD COLUMN shipping_fee DECIMAL(10,2) DEFAULT 50.00;
          END IF;

          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'settings' AND column_name = 'min_order_amount'
          ) THEN
              ALTER TABLE settings ADD COLUMN min_order_amount DECIMAL(10,2) DEFAULT 500.00;
          END IF;

          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'settings' AND column_name = 'maintenance_mode'
          ) THEN
              ALTER TABLE settings ADD COLUMN maintenance_mode BOOLEAN DEFAULT false;
          END IF;
      END $$;
    `

    // รันคำสั่ง SQL
    await supabase.rpc('exec_sql', { sql: fixSettingsSQL })

    // ตรวจสอบโครงสร้างตารางหลังจากแก้ไข
    const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          column_name, 
          data_type, 
          is_nullable, 
          column_default
        FROM information_schema.columns 
        WHERE table_name = 'settings' 
        ORDER BY ordinal_position;
      `
    })

    if (columnsError) {
      throw new Error(`Failed to check table structure: ${columnsError.message}`)
    }

    return Response.json({ 
      message: 'Settings table structure fixed successfully',
      success: true,
      tableStructure: columns
    })

  } catch (error) {
    console.error('Fix settings table error:', error)
    return Response.json(
      { error: error.message || 'Failed to fix settings table' },
      { status: 500 }
    )
  }
}
