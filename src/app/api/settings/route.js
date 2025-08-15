import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import jwt from 'jsonwebtoken';

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

// GET - ดึงข้อมูล settings (แถวเดียว)
export async function GET(request) {
  const admin = verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createClient();

    // ดึงข้อมูล settings แถวเดียว
    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // ไม่มีข้อมูล ให้สร้างแถวเดียว
        const defaultSettings = {
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
        }

        const { data: newSettings, error: insertError } = await supabase
          .from('settings')
          .insert(defaultSettings)
          .select()
          .single()

        if (insertError) {
          throw new Error(`Failed to create default settings: ${insertError.message}`)
        }

        return NextResponse.json({ 
          settings: newSettings,
          message: 'Created default settings'
        })
      }
      throw new Error(`Failed to fetch settings: ${error.message}`)
    }

    return NextResponse.json({ 
      settings,
      message: 'Settings retrieved successfully'
    })

  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get settings' },
      { status: 500 }
    )
  }
}

// PUT - อัปเดตข้อมูล settings (แถวเดียว)
export async function PUT(request) {
  try {
    const user = verifyAdmin(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json()
    
    const supabase = await createClient();

    // ตรวจสอบว่ามีข้อมูล settings หรือไม่
    const { data: existingSettings, error: checkError } = await supabase
      .from('settings')
      .select('id')
      .limit(1)
      .single()

    let result

    if (checkError && checkError.code === 'PGRST116') {
      // ไม่มีข้อมูล ให้สร้างใหม่
      const defaultSettings = {
        site_name: body.site_name || 'AVT Shop',
        site_description: body.site_description || 'ร้านค้าออนไลน์คุณภาพสูง',
        contact_email: body.contact_email || 'contact@avtshop.com',
        contact_phone: body.contact_phone || '02-123-4567',
        address: body.address || '',
        facebook_url: body.facebook_url || '',
        instagram_url: body.instagram_url || '',
        line_id: body.line_id || '',
        currency: body.currency || 'THB',
        tax_rate: body.tax_rate || 7.00,
        shipping_fee: body.shipping_fee || 50.00,
        min_order_amount: body.min_order_amount || 500.00,
        maintenance_mode: body.maintenance_mode || false
      }

      const { data: newSettings, error: insertError } = await supabase
        .from('settings')
        .insert(defaultSettings)
        .select()
        .single()

      if (insertError) {
        throw new Error(`Failed to create settings: ${insertError.message}`)
      }

      result = newSettings
    } else {
      // มีข้อมูลแล้ว ให้อัปเดต
      const updateData = {
        site_name: body.site_name,
        site_description: body.site_description,
        contact_email: body.contact_email,
        contact_phone: body.contact_phone,
        address: body.address,
        facebook_url: body.facebook_url,
        instagram_url: body.instagram_url,
        line_id: body.line_id,
        currency: body.currency,
        tax_rate: body.tax_rate,
        shipping_fee: body.shipping_fee,
        min_order_amount: body.min_order_amount,
        maintenance_mode: body.maintenance_mode,
        updated_at: new Date().toISOString()
      }

      // ลบค่า null ออก
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === undefined) {
          delete updateData[key]
        }
      })

      const { data: updatedSettings, error: updateError } = await supabase
        .from('settings')
        .update(updateData)
        .eq('id', existingSettings.id)
        .select()
        .single()

      if (updateError) {
        throw new Error(`Failed to update settings: ${updateError.message}`)
      }

      result = updatedSettings
    }

    return NextResponse.json({
      message: "อัปเดตการตั้งค่าเรียบร้อยแล้ว",
      settings: result
    })

  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    )
  }
}
