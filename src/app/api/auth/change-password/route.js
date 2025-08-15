import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Helper: ตรวจสอบ JWT
function verifyToken(req) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    return decoded;
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "กรุณาระบุรหัสผ่านปัจจุบันและรหัสผ่านใหม่" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
    }

    const supabase = await createClient();

    // ดึงข้อมูลผู้ใช้ปัจจุบัน
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
    }

    // ตรวจสอบรหัสผ่านปัจจุบัน
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, userData.password_hash);
    if (!isValidCurrentPassword) {
      return NextResponse.json({ error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" }, { status: 400 });
    }

    // เข้ารหัสผ่านใหม่
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // อัปเดตรหัสผ่าน
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password_hash: hashedNewPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error("Change password error:", updateError);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" }, { status: 500 });
    }

    return NextResponse.json({
      message: "เปลี่ยนรหัสผ่านสำเร็จ"
    }, { status: 200 });

  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" }, { status: 500 });
  }
}
