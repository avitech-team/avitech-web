import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { first_name, last_name, email, password, phone } = await request.json();

    if (!first_name || !last_name || !email || !password) {
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

    // สร้างผู้ใช้ใหม่
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          first_name,
          last_name,
          email,
          password_hash: hashedPassword,
          phone: phone || null,
          role: 0, // ผู้ใช้ทั่วไป
          is_active: true
        }
      ])
      .select('id, first_name, last_name, email, phone, role, is_active, created_at')
      .single();

    if (error) {
      console.error("Registration error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลงทะเบียน" }, { status: 500 });
    }

    return NextResponse.json({
      message: "ลงทะเบียนสำเร็จ",
      user: newUser
    }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลงทะเบียน" }, { status: 500 });
  }
}
