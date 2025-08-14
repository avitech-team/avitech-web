import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";
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

export async function POST(request) {
  const admin = verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();
  const results = {};

  try {
    // ตรวจสอบว่าตารางมีอยู่หรือไม่
    const { data: categories } = await supabase.from('categories').select('id').limit(1);
    const { data: brands } = await supabase.from('brands').select('id').limit(1);
    const { data: products } = await supabase.from('products').select('id').limit(1);
    const { data: coupons } = await supabase.from('coupons').select('id').limit(1);
    const { data: settings } = await supabase.from('settings').select('id').limit(1);
    const { data: events } = await supabase.from('events').select('id').limit(1);
    const { data: courses } = await supabase.from('courses').select('id').limit(1);

    results.categories = { exists: categories && categories.length > 0, count: categories?.length || 0 };
    results.brands = { exists: brands && brands.length > 0, count: brands?.length || 0 };
    results.products = { exists: products && products.length > 0, count: products?.length || 0 };
    results.coupons = { exists: coupons && coupons.length > 0, count: coupons?.length || 0 };
    results.settings = { exists: settings && settings.length > 0, count: settings?.length || 0 };
    results.events = { exists: events && events.length > 0, count: events?.length || 0 };
    results.courses = { exists: courses && courses.length > 0, count: courses?.length || 0 };

    return NextResponse.json({
      message: "Database tables checked successfully",
      results
    });

  } catch (error) {
    console.error('Seed check error:', error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 });
  }
}
