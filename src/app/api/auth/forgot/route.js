import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";
import { sendResetEmail } from "../../../../../lib/sendResetEmail";

export async function POST(request) {
  const { email } = await request.json();
  const supabase = await createClient();

  // สร้าง token แบบสุ่ม
  const token = Math.random().toString(36).substring(2) + Date.now();
  const expires_at = new Date(Date.now() + 1000 * 60 * 30).toISOString(); // 30 นาที

  // บันทึก token ลง table password_resets
  await supabase.from('password_resets').insert([
    { email, token, expires_at }
  ]);

  // สร้างลิงก์ reset
  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/auth/reset?token=${token}`;

  // ส่งอีเมล reset password จริง
  try {
    await sendResetEmail(email, resetLink);
  } catch (e) {
    // ไม่แจ้ง error จริงเพื่อความปลอดภัย
    console.error("Send email error", e);
  }

  return NextResponse.json({ message: "If this email exists, a reset link will be sent." });
} 
