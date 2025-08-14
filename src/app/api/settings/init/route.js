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
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    
    // ลบตาราง settings เดิม (ถ้ามี)
    const dropTableSQL = `DROP TABLE IF EXISTS settings;`;
    await supabase.rpc('exec_sql', { sql: dropTableSQL });
    
    // สร้างตาราง settings ใหม่แบบแถวเดียว
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        site_name VARCHAR(255),
        site_description TEXT,
        contact_email VARCHAR(255),
        contact_phone VARCHAR(20),
        maintenance_mode BOOLEAN DEFAULT false,
        currency VARCHAR(10) DEFAULT 'THB',
        tax_rate DECIMAL(5,2) DEFAULT 7.00,
        shipping_fee DECIMAL(10,2) DEFAULT 100.00,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (createError) {
      console.error("Error creating settings table:", createError);
      return NextResponse.json({ 
        error: "Failed to create settings table",
        details: createError.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      message: "Settings table created successfully",
      note: "No default data inserted. Please add settings data manually."
    }, { status: 200 });
    
  } catch (error) {
    console.error("Settings init error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(request) {
  const admin = verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    
    // ตรวจสอบว่าตารางมีอยู่หรือไม่
    const { data, error } = await supabase.from("settings").select("*").limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({
          exists: false,
          message: "Settings table does not exist"
        }, { status: 200 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({
      exists: true,
      count: data.length,
      settings: data[0] || null
    }, { status: 200 });
    
  } catch (error) {
    console.error("Settings check error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 });
  }
}
