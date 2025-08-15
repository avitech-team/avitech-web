import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { email, password, first_name, last_name } = await request.json();

    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
    }

    const supabase = await createClient();

    // ตรวจสอบว่าอีเมลซ้ำหรือไม่
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 400 });
    }

    // เข้ารหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 12);

    // สร้างผู้ดูแลระบบ
    const { data: newAdmin, error } = await supabase
      .from('users')
      .insert([
        {
          first_name,
          last_name,
          email,
          password_hash: hashedPassword,
          role: 1, // ผู้ดูแลระบบ
          is_active: true
        }
      ])
      .select('id, first_name, last_name, email, role, is_active, created_at')
      .single();

    if (error) {
      console.error("Setup admin error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างผู้ดูแลระบบ" }, { status: 500 });
    }

    return NextResponse.json({
      message: "สร้างผู้ดูแลระบบสำเร็จ",
      admin: newAdmin
    }, { status: 201 });

  } catch (error) {
    console.error("Setup admin error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างผู้ดูแลระบบ" }, { status: 500 });
  }
}
