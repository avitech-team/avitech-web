import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "กรุณากรอกอีเมลและรหัสผ่าน" }, { status: 400 });
    }

    const supabase = await createClient();

    // ค้นหาผู้ใช้จากฐานข้อมูล
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    // ตรวจสอบสถานะผู้ใช้
    if (!user.is_active) {
      return NextResponse.json({ error: "บัญชีผู้ใช้ถูกระงับการใช้งาน" }, { status: 401 });
    }

    // ตรวจสอบรหัสผ่าน
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    // สร้าง JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // ลบรหัสผ่านออกจากข้อมูลที่ส่งกลับ
    const { password_hash: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: "เข้าสู่ระบบสำเร็จ",
      user: userWithoutPassword,
      token
    }, { status: 200 });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" }, { status: 500 });
  }
}
