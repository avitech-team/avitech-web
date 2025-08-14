import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: "กรุณาระบุข้อมูลให้ครบถ้วน" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
    }

    const supabase = await createClient();

    // ตรวจสอบ token
    const { data: resetToken, error: tokenError } = await supabase
      .from('password_resets')
      .select('user_id, expires_at')
      .eq('token', token)
      .single();

    if (tokenError || !resetToken) {
      return NextResponse.json({ error: "Token ไม่ถูกต้องหรือหมดอายุ" }, { status: 400 });
    }

    // ตรวจสอบวันหมดอายุ
    const now = new Date();
    const expiresAt = new Date(resetToken.expires_at);
    
    if (now > expiresAt) {
      return NextResponse.json({ error: "Token หมดอายุแล้ว" }, { status: 400 });
    }

    // hash password ใหม่
    const hashedPassword = await bcrypt.hash(password, 10);

    // อัปเดต password ใน users
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', resetToken.user_id);

    if (updateError) {
      console.error("Reset password error:", updateError);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน" }, { status: 500 });
    }

    // ลบ token ที่ใช้แล้ว
    await supabase
      .from('password_resets')
      .delete()
      .eq('token', token);

    return NextResponse.json({ message: "รีเซ็ตรหัสผ่านสำเร็จ" });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน" }, { status: 500 });
  }
} 
