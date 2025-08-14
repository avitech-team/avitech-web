import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";
import jwt from "jsonwebtoken";

// Helper: ตรวจสอบ JWT
function verifyAdmin(req) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    return decoded;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

export async function GET(request) {
  const admin = verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    
    // ดึงข้อมูล ecommerce settings
    const { data: settings, error } = await supabase
      .from('ecommerce_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching ecommerce settings:', error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่า" }, { status: 500 });
    }

    return NextResponse.json(settings || {});
  } catch (error) {
    console.error('Error in GET /api/settings/ecommerce:', error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่า" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const updateData = await request.json();

    // ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
    const { data: existingSettings, error: checkError } = await supabase
      .from('ecommerce_settings')
      .select('id')
      .limit(1)
      .single();

    let result;

    if (checkError && checkError.code === 'PGRST116') {
      // ไม่มีข้อมูล ให้สร้างใหม่
      const { data: newSettings, error: insertError } = await supabase
        .from('ecommerce_settings')
        .insert([updateData])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating ecommerce settings:', insertError);
        return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างการตั้งค่า" }, { status: 500 });
      }

      result = newSettings;
    } else {
      // มีข้อมูลแล้ว ให้อัปเดต
      const { data: updatedSettings, error: updateError } = await supabase
        .from('ecommerce_settings')
        .update(updateData)
        .eq('id', existingSettings.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating ecommerce settings:', updateError);
        return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตการตั้งค่า" }, { status: 500 });
      }

      result = updatedSettings;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in PUT /api/settings/ecommerce:', error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตการตั้งค่า" }, { status: 500 });
  }
}
