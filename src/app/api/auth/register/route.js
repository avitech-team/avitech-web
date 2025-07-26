import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const { email, password, role } = await request.json();
  const supabase = await createClient();

  // hash password ก่อนบันทึก
  const hashedPassword = await bcrypt.hash(password, 10);

  // สมัครสมาชิก
  // role: 0=user, 1=admin
  const roleValue = role === "1" ? 1 : 0;
  const { data, error } = await supabase
    .from('users')
    .insert([{ email, password: hashedPassword, role: roleValue }])
    .select(); // คืนค่าข้อมูล user ที่เพิ่ง insert

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Register failed" }, { status: 500 });
  }

  return NextResponse.json({ user: data[0] }, { status: 200 });
}