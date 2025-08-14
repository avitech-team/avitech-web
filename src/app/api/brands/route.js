import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";
import jwt from "jsonwebtoken";

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
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('brands')
      .select(`
        id,
        name,
        description,
        logo_url,
        website_url,
        is_active,
        created_at,
        updated_at
      `, { count: 'exact' });

    // กรองตาม search
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // กรองตาม status
    if (status !== '') {
      query = query.eq('is_active', status === 'true');
    }

    // เรียงลำดับ
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: brands, error, count } = await query;

    if (error) {
      console.error('Error fetching brands:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // คำนวณข้อมูล pagination
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      brands: brands || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count || 0,
        hasNextPage,
        hasPrevPage,
        limit
      }
    });

  } catch (error) {
    console.error('Brands API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = verifyAdmin(request);
    const { name, logo_url, description, is_active } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "กรุณากรอกชื่อแบรนด์" }, { status: 400 });
    }

    const supabase = await createClient();

    // ตรวจสอบว่าชื่อแบรนด์ซ้ำหรือไม่
    const { data: existingBrand } = await supabase
      .from('brands')
      .select('id')
      .eq('name', name)
      .single();

    if (existingBrand) {
      return NextResponse.json({ error: "ชื่อแบรนด์นี้ถูกใช้งานแล้ว" }, { status: 400 });
    }

    // สร้างแบรนด์ใหม่
    const { data: newBrand, error } = await supabase
      .from('brands')
      .insert([{
        name,
        logo_url: logo_url || '',
        description: description || '',
        is_active: is_active !== false
      }])
      .select('id, name, logo_url, description, is_active, created_at')
      .single();

    if (error) {
      console.error("Brand creation error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างแบรนด์" }, { status: 500 });
    }

    return NextResponse.json({
      message: "สร้างแบรนด์สำเร็จ",
      brand: newBrand
    });

  } catch (error) {
    console.error('Brand creation API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const admin = verifyAdmin(request);
    const { id, name, logo_url, description, is_active } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ไม่พบ ID แบรนด์" }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: "กรุณากรอกชื่อแบรนด์" }, { status: 400 });
    }

    const supabase = await createClient();

    // ตรวจสอบว่าแบรนด์มีอยู่หรือไม่
    const { data: existingBrand } = await supabase
      .from('brands')
      .select('id, name')
      .eq('id', id)
      .single();

    if (!existingBrand) {
      return NextResponse.json({ error: "ไม่พบแบรนด์นี้" }, { status: 404 });
    }

    // ตรวจสอบว่าชื่อแบรนด์ซ้ำหรือไม่ (ถ้ามีการเปลี่ยนชื่อ)
    if (name !== existingBrand.name) {
      const { data: nameExists } = await supabase
        .from('brands')
        .select('id')
        .eq('name', name)
        .neq('id', id)
        .single();

      if (nameExists) {
        return NextResponse.json({ error: "ชื่อแบรนด์นี้ถูกใช้งานแล้ว" }, { status: 400 });
      }
    }

    // อัปเดตข้อมูลแบรนด์
    const updateData = {
      name,
      logo_url: logo_url || '',
      description: description || '',
      is_active: is_active !== false,
      updated_at: new Date().toISOString()
    };

    const { data: updatedBrand, error } = await supabase
      .from('brands')
      .update(updateData)
      .eq('id', id)
      .select('id, name, logo_url, description, is_active, created_at, updated_at')
      .single();

    if (error) {
      console.error("Brand update error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตแบรนด์" }, { status: 500 });
    }

    return NextResponse.json({
      message: "อัปเดตแบรนด์สำเร็จ",
      brand: updatedBrand
    });

  } catch (error) {
    console.error('Brand update API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const admin = verifyAdmin(request);
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ไม่พบ ID แบรนด์" }, { status: 400 });
    }

    const supabase = await createClient();

    // ตรวจสอบว่าแบรนด์มีอยู่หรือไม่
    const { data: existingBrand } = await supabase
      .from('brands')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingBrand) {
      return NextResponse.json({ error: "ไม่พบแบรนด์นี้" }, { status: 404 });
    }

    // ตรวจสอบว่ามีสินค้าในแบรนด์นี้หรือไม่
    const { data: productsInBrand } = await supabase
      .from('products')
      .select('id')
      .eq('brand_id', id)
      .limit(1);

    if (productsInBrand && productsInBrand.length > 0) {
      return NextResponse.json({ error: "ไม่สามารถลบแบรนด์ที่มีสินค้าอยู่ได้" }, { status: 400 });
    }

    // ลบแบรนด์
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Brand deletion error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบแบรนด์" }, { status: 500 });
    }

    return NextResponse.json({ message: "ลบแบรนด์สำเร็จ" });

  } catch (error) {
    console.error('Brand deletion API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
