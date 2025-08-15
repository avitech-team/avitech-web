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
  const admin = verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const supabase = await createClient();
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ events: events || [] });
  } catch (error) {
    console.error('Events API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const admin = verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, description, date, location, price, image_url } = await request.json();

    if (!name || !date) {
      return NextResponse.json({ error: "กรุณากรอกชื่ออีเวนต์และวันที่" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: newEvent, error } = await supabase
      .from('events')
      .insert([{
        name,
        description: description || '',
        date: new Date(date).toISOString(),
        location: location || '',
        price: price ? parseFloat(price) : 0,
        image_url: image_url || ''
      }])
      .select()
      .single();

    if (error) {
      console.error("Event creation error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างอีเวนต์" }, { status: 500 });
    }

    return NextResponse.json({
      message: "สร้างอีเวนต์สำเร็จ",
      event: newEvent
    });

  } catch (error) {
    console.error('Event creation API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const admin = verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, name, description, date, location, price, image_url } = await request.json();

    if (!id || !name || !date) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: updatedEvent, error } = await supabase
      .from('events')
      .update({
        name,
        description: description || '',
        date: new Date(date).toISOString(),
        location: location || '',
        price: price ? parseFloat(price) : 0,
        image_url: image_url || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Event update error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตอีเวนต์" }, { status: 500 });
    }

    return NextResponse.json({
      message: "อัปเดตอีเวนต์สำเร็จ",
      event: updatedEvent
    });

  } catch (error) {
    console.error('Event update API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const admin = verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing event id" }, { status: 400 });
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true }, { status: 200 });
} 
