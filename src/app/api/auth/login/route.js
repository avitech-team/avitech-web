import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  const { email, password } = await request.json();
  const supabase = await createClient();

  // ดึง user จาก email
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email);

  if (error || !data || data.length === 0) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const user = data[0];
  // เปรียบเทียบ password กับ hash
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // สร้าง accessToken (JWT)
  const accessToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "1h" }
  );

  return NextResponse.json({ user, accessToken }, { status: 200 });
}