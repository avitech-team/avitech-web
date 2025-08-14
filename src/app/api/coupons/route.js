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
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('coupons')
      .select(`
        id,
        code,
        description,
        discount_type,
        discount_value,
        min_order_amount,
        max_usage,
        current_usage,
        valid_from,
        valid_until,
        is_active,
        created_at,
        updated_at
      `, { count: 'exact' });

    // กรองตาม search
    if (search) {
      query = query.or(`code.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // กรองตาม type
    if (type) {
      query = query.eq('discount_type', type);
    }

    // กรองตาม status
    if (status !== '') {
      query = query.eq('is_active', status === 'true');
    }

    // เรียงลำดับ
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: coupons, error, count } = await query;

    if (error) {
      console.error('Error fetching coupons:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // คำนวณข้อมูล pagination
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      coupons: coupons || [],
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
    console.error('Coupons API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = verifyAdmin(request);
    const { 
      code, 
      description, 
      discount_type, 
      discount_value, 
      min_order_amount, 
      max_usage, 
      valid_from, 
      valid_until, 
      is_active 
    } = await request.json();

    if (!code || !discount_value) {
      return NextResponse.json({ error: "กรุณากรอกรหัสคูปองและมูลค่าส่วนลด" }, { status: 400 });
    }

    if (discount_value <= 0) {
      return NextResponse.json({ error: "มูลค่าส่วนลดต้องมากกว่า 0" }, { status: 400 });
    }

    if (discount_type === 'percentage' && discount_value > 100) {
      return NextResponse.json({ error: "เปอร์เซ็นต์ส่วนลดต้องไม่เกิน 100%" }, { status: 400 });
    }

    const supabase = await createClient();

    // ตรวจสอบว่ารหัสคูปองซ้ำหรือไม่
    const { data: existingCoupon } = await supabase
      .from('coupons')
      .select('id')
      .eq('code', code.toUpperCase())
      .single();

    if (existingCoupon) {
      return NextResponse.json({ error: "รหัสคูปองนี้ถูกใช้งานแล้ว" }, { status: 400 });
    }

    // สร้างคูปองใหม่
    const { data: newCoupon, error } = await supabase
      .from('coupons')
      .insert([{
        code: code.toUpperCase(),
        description: description || '',
        discount_type: discount_type || 'percentage',
        discount_value: parseFloat(discount_value),
        min_order_amount: min_order_amount ? parseFloat(min_order_amount) : 0,
        max_usage: max_usage ? parseInt(max_usage) : null,
        used_count: 0,
        valid_from: valid_from || new Date().toISOString(),
        valid_until: valid_until || null,
        is_active: is_active !== false
      }])
      .select('id, code, description, discount_type, discount_value, min_order_amount, max_usage, used_count, valid_from, valid_until, is_active, created_at')
      .single();

    if (error) {
      console.error("Coupon creation error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างคูปอง" }, { status: 500 });
    }

    return NextResponse.json({
      message: "สร้างคูปองสำเร็จ",
      coupon: newCoupon
    });

  } catch (error) {
    console.error('Coupon creation API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const admin = verifyAdmin(request);
    const { 
      id, 
      code, 
      description, 
      discount_type, 
      discount_value, 
      min_order_amount, 
      max_usage, 
      valid_from, 
      valid_until, 
      is_active 
    } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ไม่พบ ID คูปอง" }, { status: 400 });
    }

    if (!code || !discount_value) {
      return NextResponse.json({ error: "กรุณากรอกรหัสคูปองและมูลค่าส่วนลด" }, { status: 400 });
    }

    if (discount_value <= 0) {
      return NextResponse.json({ error: "มูลค่าส่วนลดต้องมากกว่า 0" }, { status: 400 });
    }

    if (discount_type === 'percentage' && discount_value > 100) {
      return NextResponse.json({ error: "เปอร์เซ็นต์ส่วนลดต้องไม่เกิน 100%" }, { status: 400 });
    }

    const supabase = await createClient();

    // ตรวจสอบว่าคูปองมีอยู่หรือไม่
    const { data: existingCoupon } = await supabase
      .from('coupons')
      .select('id, code')
      .eq('id', id)
      .single();

    if (!existingCoupon) {
      return NextResponse.json({ error: "ไม่พบคูปองนี้" }, { status: 404 });
    }

    // ตรวจสอบว่ารหัสคูปองซ้ำหรือไม่ (ถ้ามีการเปลี่ยนรหัส)
    if (code.toUpperCase() !== existingCoupon.code) {
      const { data: codeExists } = await supabase
        .from('coupons')
        .select('id')
        .eq('code', code.toUpperCase())
        .neq('id', id)
        .single();

      if (codeExists) {
        return NextResponse.json({ error: "รหัสคูปองนี้ถูกใช้งานแล้ว" }, { status: 400 });
      }
    }

    // อัปเดตข้อมูลคูปอง
    const updateData = {
      code: code.toUpperCase(),
      description: description || '',
      discount_type: discount_type || 'percentage',
      discount_value: parseFloat(discount_value),
      min_order_amount: min_order_amount ? parseFloat(min_order_amount) : 0,
      max_usage: max_usage ? parseInt(max_usage) : null,
      valid_from: valid_from || new Date().toISOString(),
      valid_until: valid_until || null,
      is_active: is_active !== false,
      updated_at: new Date().toISOString()
    };

    const { data: updatedCoupon, error } = await supabase
      .from('coupons')
      .update(updateData)
      .eq('id', id)
      .select('id, code, description, discount_type, discount_value, min_order_amount, max_usage, used_count, valid_from, valid_until, is_active, created_at, updated_at')
      .single();

    if (error) {
      console.error("Coupon update error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตคูปอง" }, { status: 500 });
    }

    return NextResponse.json({
      message: "อัปเดตคูปองสำเร็จ",
      coupon: updatedCoupon
    });

  } catch (error) {
    console.error('Coupon update API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const admin = verifyAdmin(request);
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ไม่พบ ID คูปอง" }, { status: 400 });
    }

    const supabase = await createClient();

    // ตรวจสอบว่าคูปองมีอยู่หรือไม่
    const { data: existingCoupon } = await supabase
      .from('coupons')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingCoupon) {
      return NextResponse.json({ error: "ไม่พบคูปองนี้" }, { status: 404 });
    }

    // ลบคูปอง
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Coupon deletion error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบคูปอง" }, { status: 500 });
    }

    return NextResponse.json({ message: "ลบคูปองสำเร็จ" });

  } catch (error) {
    console.error('Coupon deletion API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
