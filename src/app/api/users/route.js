import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Helper: ตรวจสอบ JWT และ role
function verifyAdmin(req) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    if (decoded.role !== 1 && decoded.role !== "1") {
      return null
    }
    return decoded
  } catch (error) {
    return null
  }
}

export async function GET(request) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    
    const supabase = await createClient();
    
    // รับพารามิเตอร์สำหรับการกรองและเรียงลำดับ
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const is_active = searchParams.get('is_active') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    
    // สร้าง query
    let query = supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        address,
        role,
        is_active,
        created_at,
        updated_at
      `, { count: 'exact' });
    
    // เพิ่มการกรอง
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    if (role !== '') {
      query = query.eq('role', parseInt(role));
    }
    
    if (is_active !== '') {
      query = query.eq('is_active', is_active === 'true');
    }
    
    // เพิ่มการเรียงลำดับ
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // เพิ่ม pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
    
    const { data: users, error, count } = await query;
    
    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" }, { status: 500 });
    }
    
    const totalPages = Math.ceil((count || 0) / limit);
    
    return NextResponse.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit
      }
    });
    
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { email, password, first_name, last_name, phone, address, role } = await request.json();
    
    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
    }
    
    if (password.length < 6) {
      return NextResponse.json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    // ตรวจสอบว่าอีเมลซ้ำหรือไม่
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 400 });
    }
    
    // เข้ารหัสผ่าน
    const password_hash = await bcrypt.hash(password, 10);
    
    // สร้างผู้ใช้ใหม่
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password_hash,
          first_name,
          last_name,
          phone: phone || null,
          address: address || null,
          role: role || 0,
          is_active: true
        }
      ])
      .select('id, first_name, last_name, email, phone, address, role, is_active, created_at')
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างผู้ใช้" }, { status: 500 });
    }
    
    return NextResponse.json({
      message: "สร้างผู้ใช้สำเร็จ",
      user: newUser
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างผู้ใช้" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id, first_name, last_name, email, phone, address, role, is_active } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: "กรุณาระบุ ID ผู้ใช้" }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    // ตรวจสอบว่าผู้ใช้มีอยู่หรือไม่
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', id)
      .single();
    
    if (!existingUser) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    }
    
    // ตรวจสอบว่าอีเมลซ้ำหรือไม่ (ถ้ามีการเปลี่ยนอีเมล)
    if (email && email !== existingUser.email) {
      const { data: emailExists } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();
      
      if (emailExists) {
        return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 400 });
      }
    }
    
    // อัปเดตข้อมูลผู้ใช้
    const updateData = {};
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (role !== undefined) updateData.role = role;
    if (is_active !== undefined) updateData.is_active = is_active;
    
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, first_name, last_name, email, phone, address, role, is_active, updated_at')
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตผู้ใช้" }, { status: 500 });
    }
    
    return NextResponse.json({
      message: "อัปเดตผู้ใช้สำเร็จ",
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Error in PUT /api/users:', error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตผู้ใช้" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "กรุณาระบุ ID ผู้ใช้" }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    // ตรวจสอบว่าผู้ใช้มีอยู่หรือไม่
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', id)
      .single();
    
    if (!existingUser) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    }
    
    // ไม่ให้ลบ admin หลัก
    if (existingUser.role === 1) {
      return NextResponse.json({ error: "ไม่สามารถลบผู้ดูแลระบบได้" }, { status: 400 });
    }
    
    // ลบผู้ใช้
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบผู้ใช้" }, { status: 500 });
    }
    
    return NextResponse.json({
      message: "ลบผู้ใช้สำเร็จ"
    });
    
  } catch (error) {
    console.error('Error in DELETE /api/users:', error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบผู้ใช้" }, { status: 500 });
  }
}
