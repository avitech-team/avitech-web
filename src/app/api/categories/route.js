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
      .from('categories')
      .select(`
        id,
        name,
        description,
        slug,
        image_url,
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

    const { data: categories, error, count } = await query;

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // คำนวณข้อมูล pagination
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      categories: categories || [],
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
    console.error('Categories API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = verifyAdmin(request);
    const { name, slug, description, image_url, is_active } = await request.json();

    if (!name || !slug) {
      return NextResponse.json({ error: "กรุณากรอกชื่อและ slug" }, { status: 400 });
    }

    const supabase = await createClient();

    // ตรวจสอบว่า slug ซ้ำหรือไม่
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingCategory) {
      return NextResponse.json({ error: "Slug นี้ถูกใช้งานแล้ว" }, { status: 400 });
    }

    // สร้างหมวดหมู่ใหม่
    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert([{
        name,
        slug,
        description: description || '',
        image_url: image_url || '',
        is_active: is_active !== false
      }])
      .select('id, name, slug, description, image_url, is_active, created_at')
      .single();

    if (error) {
      console.error("Category creation error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างหมวดหมู่" }, { status: 500 });
    }

    return NextResponse.json({
      message: "สร้างหมวดหมู่สำเร็จ",
      category: newCategory
    });

  } catch (error) {
    console.error('Category creation API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const admin = verifyAdmin(request);
    const { id, name, slug, description, image_url, is_active } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ไม่พบ ID หมวดหมู่" }, { status: 400 });
    }

    if (!name || !slug) {
      return NextResponse.json({ error: "กรุณากรอกชื่อและ slug" }, { status: 400 });
    }

    const supabase = await createClient();

    // ตรวจสอบว่าหมวดหมู่มีอยู่หรือไม่
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id, slug')
      .eq('id', id)
      .single();

    if (!existingCategory) {
      return NextResponse.json({ error: "ไม่พบหมวดหมู่นี้" }, { status: 404 });
    }

    // ตรวจสอบว่า slug ซ้ำหรือไม่ (ถ้ามีการเปลี่ยน slug)
    if (slug !== existingCategory.slug) {
      const { data: slugExists } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single();

      if (slugExists) {
        return NextResponse.json({ error: "Slug นี้ถูกใช้งานแล้ว" }, { status: 400 });
      }
    }

    // อัปเดตข้อมูลหมวดหมู่
    const updateData = {
      name,
      slug,
      description: description || '',
      image_url: image_url || '',
      is_active: is_active !== false,
      updated_at: new Date().toISOString()
    };

    const { data: updatedCategory, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select('id, name, slug, description, image_url, is_active, created_at, updated_at')
      .single();

    if (error) {
      console.error("Category update error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตหมวดหมู่" }, { status: 500 });
    }

    return NextResponse.json({
      message: "อัปเดตหมวดหมู่สำเร็จ",
      category: updatedCategory
    });

  } catch (error) {
    console.error('Category update API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const admin = verifyAdmin(request);
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ไม่พบ ID หมวดหมู่" }, { status: 400 });
    }

    const supabase = await createClient();

    // ตรวจสอบว่าหมวดหมู่มีอยู่หรือไม่
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingCategory) {
      return NextResponse.json({ error: "ไม่พบหมวดหมู่นี้" }, { status: 404 });
    }

    // ตรวจสอบว่ามีสินค้าในหมวดหมู่นี้หรือไม่
    const { data: productsInCategory } = await supabase
      .from('products')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (productsInCategory && productsInCategory.length > 0) {
      return NextResponse.json({ error: "ไม่สามารถลบหมวดหมู่ที่มีสินค้าอยู่ได้" }, { status: 400 });
    }

    // ลบหมวดหมู่
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Category deletion error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบหมวดหมู่" }, { status: 500 });
    }

    return NextResponse.json({ message: "ลบหมวดหมู่สำเร็จ" });

  } catch (error) {
    console.error('Category deletion API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
