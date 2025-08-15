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
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ courses: courses || [] });
  } catch (error) {
    console.error('Courses API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const admin = verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, description, price, duration, instructor, image_url } = await request.json();

    if (!name || !price) {
      return NextResponse.json({ error: "กรุณากรอกชื่อคอร์สและราคา" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: newCourse, error } = await supabase
      .from('courses')
      .insert([{
        name,
        description: description || '',
        price: parseFloat(price),
        duration: duration || '',
        instructor: instructor || '',
        image_url: image_url || ''
      }])
      .select()
      .single();

    if (error) {
      console.error("Course creation error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างคอร์ส" }, { status: 500 });
    }

    return NextResponse.json({
      message: "สร้างคอร์สสำเร็จ",
      course: newCourse
    });

  } catch (error) {
    console.error('Course creation API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const admin = verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, name, description, price, duration, instructor, image_url } = await request.json();

    if (!id || !name || !price) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: updatedCourse, error } = await supabase
      .from('courses')
      .update({
        name,
        description: description || '',
        price: parseFloat(price),
        duration: duration || '',
        instructor: instructor || '',
        image_url: image_url || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Course update error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตคอร์ส" }, { status: 500 });
    }

    return NextResponse.json({
      message: "อัปเดตคอร์สสำเร็จ",
      course: updatedCourse
    });

  } catch (error) {
    console.error('Course update API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const admin = verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing course id" }, { status: 400 });
  const supabase = await createClient();
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true }, { status: 200 });
}
