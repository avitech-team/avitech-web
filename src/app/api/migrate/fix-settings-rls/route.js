import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server';

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

    // คำสั่ง SQL สำหรับแก้ไข RLS ของตาราง settings
    const fixRLSSQL = `
      -- ปิด RLS สำหรับตาราง settings
      ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

      -- ลบ policy เก่าทั้งหมด (ถ้ามี)
      DROP POLICY IF EXISTS "Enable read access for all users" ON settings;
      DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON settings;
      DROP POLICY IF EXISTS "Enable update for users based on email" ON settings;
      DROP POLICY IF EXISTS "Enable delete for users based on email" ON settings;

      -- สร้าง policy ใหม่ที่อนุญาตให้ทุกคนอ่านและเขียนได้
      CREATE POLICY "Allow all operations on settings" ON settings
        FOR ALL USING (true) WITH CHECK (true);
    `

    // รันคำสั่ง SQL
    await supabase.rpc('exec_sql', { sql: fixRLSSQL })

    // ตรวจสอบว่าตาราง settings มีข้อมูลหรือไม่
    const { data: settings, error: checkError } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single()

    if (checkError && checkError.code === 'PGRST116') {
      // ไม่มีข้อมูล ให้เพิ่มข้อมูลเริ่มต้น
      const { data: newSettings, error: insertError } = await supabase
        .from('settings')
        .insert({
          site_name: 'AVT Shop',
          site_description: 'ร้านค้าออนไลน์คุณภาพสูง',
          contact_email: 'contact@avtshop.com',
          contact_phone: '02-123-4567',
          address: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
          facebook_url: '',
          instagram_url: '',
          line_id: '',
          currency: 'THB',
          tax_rate: 7.00,
          shipping_fee: 50.00,
          min_order_amount: 500.00,
          maintenance_mode: false
        })
        .select()
        .single()

      if (insertError) {
        throw new Error(`Failed to insert default settings: ${insertError.message}`)
      }

      return Response.json({ 
        message: 'RLS fixed and default settings created successfully',
        success: true,
        settings: newSettings
      })
    }

    if (checkError) {
      throw new Error(`Failed to check settings: ${checkError.message}`)
    }

    return Response.json({ 
      message: 'RLS fixed successfully',
      success: true,
      settings
    })

  } catch (error) {
    console.error('Fix RLS error:', error)
    return Response.json(
      { error: error.message || 'Failed to fix RLS' },
      { status: 500 }
    )
  }
}
