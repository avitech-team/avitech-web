import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import jwt from "jsonwebtoken";

// Helper: ตรวจสอบ JWT และ role
function verifyAdmin(req) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    if (!(decoded.role === 1 || decoded.role === "1")) return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(request) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ products: data }, { status: 200 });
}

export async function POST(request) {
  const admin = verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").insert([body]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ product: data[0] }, { status: 201 });
}

export async function PUT(request) {
  const admin = verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "Missing product id" }, { status: 400 });
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").update(body).eq("id", body.id).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ product: data[0] }, { status: 200 });
}

export async function DELETE(request) {
  const admin = verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing product id" }, { status: 400 });
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true }, { status: 200 });
} 