import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
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

export async function GET(request) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // ดึงข้อมูลผู้ใช้ปัจจุบัน
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, phone, role, is_active, created_at, updated_at')
      .eq('id', user.id)
      .single();

    if (error || !userData) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
    }

    if (!userData.is_active) {
      return NextResponse.json({ error: "บัญชีผู้ใช้ถูกระงับการใช้งาน" }, { status: 403 });
    }

    return NextResponse.json({
      user: userData
    }, { status: 200 });

  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { first_name, last_name, phone } = await request.json();

    const supabase = await createClient();

    // อัปเดตข้อมูลผู้ใช้
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        first_name: first_name || undefined,
        last_name: last_name || undefined,
        phone: phone || undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select('id, first_name, last_name, email, phone, role, is_active, created_at, updated_at')
      .single();

    if (error) {
      console.error("Update user error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" }, { status: 500 });
    }

    return NextResponse.json({
      message: "อัปเดตข้อมูลสำเร็จ",
      user: updatedUser
    }, { status: 200 });

  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" }, { status: 500 });
  }
}
