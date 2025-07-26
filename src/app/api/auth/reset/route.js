import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const { token, password } = await request.json();
  const supabase = await createClient();

  // ตรวจสอบ token
  const { data: resetRows, error: resetError } = await supabase
    .from('password_resets')
    .select('*')
    .eq('token', token)
    .limit(1);

  if (resetError || !resetRows || resetRows.length === 0) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const reset = resetRows[0];
  if (new Date(reset.expires_at) < new Date()) {
    return NextResponse.json({ error: "Token expired" }, { status: 400 });
  }

  // hash password ใหม่
  const hashedPassword = await bcrypt.hash(password, 10);

  // อัปเดต password ใน users
  const { error: userError } = await supabase
    .from('users')
    .update({ password: hashedPassword })
    .eq('email', reset.email);

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 400 });
  }

  // ลบ token ออกจาก password_resets
  await supabase.from('password_resets').delete().eq('token', token);

  return NextResponse.json({ message: "Password reset successful" });
} 