import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
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
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const status = searchParams.get('status') || '';
    const featured = searchParams.get('featured') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        sale_price,
        stock_quantity,
        category_id,
        brand_id,
        images,
        is_active,
        is_featured,
        created_at,
        updated_at,
        categories (
          id,
          name,
          slug
        ),
        brands (
          id,
          name
        )
      `, { count: 'exact' });

    // กรองตาม search
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // กรองตาม category
    if (category) {
      query = query.eq('category_id', category);
    }

    // กรองตาม brand
    if (brand) {
      query = query.eq('brand_id', brand);
    }

    // กรองตาม status
    if (status !== '') {
      query = query.eq('is_active', status === 'true');
    }

    // กรองตาม featured
    if (featured !== '') {
      query = query.eq('is_featured', featured === 'true');
    }

    // เรียงลำดับ
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: products, error, count } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // คำนวณข้อมูล pagination
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      products: products || [],
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
    console.error('Products API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { 
      name, 
      description, 
      price, 
      sale_price, 
      stock_quantity, 
      category_id, 
      brand_id, 
      images, 
      is_active, 
      is_featured 
    } = await request.json();

    if (!name || !price) {
      return NextResponse.json({ error: "กรุณากรอกชื่อสินค้าและราคา" }, { status: 400 });
    }

    if (price < 0) {
      return NextResponse.json({ error: "ราคาต้องมากกว่าหรือเท่ากับ 0" }, { status: 400 });
    }

    if (sale_price && sale_price >= price) {
      return NextResponse.json({ error: "ราคาลดพิเศษต้องน้อยกว่าราคาปกติ" }, { status: 400 });
    }

    const supabase = await createClient();

    // สร้างสินค้าใหม่
    const { data: newProduct, error } = await supabase
      .from('products')
      .insert([{
        name,
        description: description || '',
        price: parseFloat(price),
        sale_price: sale_price ? parseFloat(sale_price) : null,
        stock_quantity: parseInt(stock_quantity) || 0,
        category_id: category_id || null,
        brand_id: brand_id || null,
        images: images || [],
        is_active: is_active !== false,
        is_featured: is_featured === true
      }])
      .select(`
        id,
        name,
        description,
        price,
        sale_price,
        stock_quantity,
        category_id,
        brand_id,
        images,
        is_active,
        is_featured,
        created_at,
        categories (
          id,
          name
        ),
        brands (
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error("Product creation error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างสินค้า" }, { status: 500 });
    }

    return NextResponse.json({
      message: "สร้างสินค้าสำเร็จ",
      product: newProduct
    });

  } catch (error) {
    console.error('Product creation API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { 
      id, 
      name, 
      description, 
      price, 
      sale_price, 
      stock_quantity, 
      category_id, 
      brand_id, 
      images, 
      is_active, 
      is_featured 
    } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ไม่พบ ID สินค้า" }, { status: 400 });
    }

    if (!name || !price) {
      return NextResponse.json({ error: "กรุณากรอกชื่อสินค้าและราคา" }, { status: 400 });
    }

    if (price < 0) {
      return NextResponse.json({ error: "ราคาต้องมากกว่าหรือเท่ากับ 0" }, { status: 400 });
    }

    if (sale_price && sale_price >= price) {
      return NextResponse.json({ error: "ราคาลดพิเศษต้องน้อยกว่าราคาปกติ" }, { status: 400 });
    }

    const supabase = await createClient();

    // ตรวจสอบว่าสินค้ามีอยู่หรือไม่
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingProduct) {
      return NextResponse.json({ error: "ไม่พบสินค้านี้" }, { status: 404 });
    }

    // อัปเดตข้อมูลสินค้า
    const updateData = {
      name,
      description: description || '',
      price: parseFloat(price),
      sale_price: sale_price ? parseFloat(sale_price) : null,
      stock_quantity: parseInt(stock_quantity) || 0,
      category_id: category_id || null,
      brand_id: brand_id || null,
      images: images || [],
      is_active: is_active !== false,
      is_featured: is_featured === true,
      updated_at: new Date().toISOString()
    };

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        name,
        description,
        price,
        sale_price,
        stock_quantity,
        category_id,
        brand_id,
        images,
        is_active,
        is_featured,
        created_at,
        updated_at,
        categories (
          id,
          name
        ),
        brands (
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error("Product update error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตสินค้า" }, { status: 500 });
    }

    return NextResponse.json({
      message: "อัปเดตสินค้าสำเร็จ",
      product: updatedProduct
    });

  } catch (error) {
    console.error('Product update API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ไม่พบ ID สินค้า" }, { status: 400 });
    }

    const supabase = await createClient();

    // ตรวจสอบว่าสินค้ามีอยู่หรือไม่
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingProduct) {
      return NextResponse.json({ error: "ไม่พบสินค้านี้" }, { status: 404 });
    }

    // ลบสินค้า
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Product deletion error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบสินค้า" }, { status: 500 });
    }

    return NextResponse.json({ message: "ลบสินค้าสำเร็จ" });

  } catch (error) {
    console.error('Product deletion API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
