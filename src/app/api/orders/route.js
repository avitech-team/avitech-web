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
    const status = searchParams.get('status') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('orders')
      .select(`
        id,
        user_id,
        order_number,
        status,
        total_amount,
        shipping_address,
        billing_address,
        payment_method,
        payment_status,
        notes,
        created_at,
        updated_at,
        users (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          unit_price,
          total_price,
          products (
            id,
            name,
            images
          )
        )
      `, { count: 'exact' });

    // กรองตาม search (order number หรือชื่อลูกค้า)
    if (search) {
      query = query.or(`order_number.ilike.%${search}%,users.first_name.ilike.%${search}%,users.last_name.ilike.%${search}%`);
    }

    // กรองตาม status
    if (status) {
      query = query.eq('status', status);
    }

    // กรองตาม payment status
    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus);
    }

    // เรียงลำดับ
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: orders, error, count } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // คำนวณข้อมูล pagination
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      orders: orders || [],
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
    console.error('Orders API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = verifyAdmin(request);
    const { 
      user_id, 
      order_number, 
      status, 
      total_amount, 
      shipping_address, 
      billing_address, 
      payment_method, 
      payment_status, 
      notes 
    } = await request.json();

    if (!order_number || !total_amount) {
      return NextResponse.json({ error: "กรุณากรอกเลขที่ออเดอร์และยอดรวม" }, { status: 400 });
    }

    const supabase = await createClient();

    // สร้างออเดอร์ใหม่
    const { data: newOrder, error } = await supabase
      .from('orders')
      .insert([{
        user_id: user_id || null,
        order_number,
        status: status || 'pending',
        total_amount: parseFloat(total_amount),
        shipping_address: shipping_address || '',
        billing_address: billing_address || '',
        payment_method: payment_method || '',
        payment_status: payment_status || 'pending',
        notes: notes || ''
      }])
      .select(`
        id,
        user_id,
        order_number,
        status,
        total_amount,
        shipping_address,
        billing_address,
        payment_method,
        payment_status,
        notes,
        created_at,
        users (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .single();

    if (error) {
      console.error("Order creation error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างออเดอร์" }, { status: 500 });
    }

    return NextResponse.json({
      message: "สร้างออเดอร์สำเร็จ",
      order: newOrder
    });

  } catch (error) {
    console.error('Order creation API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const admin = verifyAdmin(request);
    const { 
      id, 
      status, 
      payment_status, 
      shipping_address, 
      billing_address, 
      notes 
    } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ไม่พบ ID ออเดอร์" }, { status: 400 });
    }

    const supabase = await createClient();

    // ตรวจสอบว่าออเดอร์มีอยู่หรือไม่
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingOrder) {
      return NextResponse.json({ error: "ไม่พบออเดอร์นี้" }, { status: 404 });
    }

    // อัปเดตข้อมูลออเดอร์
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (payment_status !== undefined) updateData.payment_status = payment_status;
    if (shipping_address !== undefined) updateData.shipping_address = shipping_address;
    if (billing_address !== undefined) updateData.billing_address = billing_address;
    if (notes !== undefined) updateData.notes = notes;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        user_id,
        order_number,
        status,
        total_amount,
        shipping_address,
        billing_address,
        payment_method,
        payment_status,
        notes,
        created_at,
        updated_at,
        users (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .single();

    if (error) {
      console.error("Order update error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตออเดอร์" }, { status: 500 });
    }

    return NextResponse.json({
      message: "อัปเดตออเดอร์สำเร็จ",
      order: updatedOrder
    });

  } catch (error) {
    console.error('Order update API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const admin = verifyAdmin(request);
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ไม่พบ ID ออเดอร์" }, { status: 400 });
    }

    const supabase = await createClient();

    // ตรวจสอบว่าออเดอร์มีอยู่หรือไม่
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', id)
      .single();

    if (!existingOrder) {
      return NextResponse.json({ error: "ไม่พบออเดอร์นี้" }, { status: 404 });
    }

    // ป้องกันการลบออเดอร์ที่จัดส่งแล้ว
    if (existingOrder.status === 'delivered') {
      return NextResponse.json({ error: "ไม่สามารถลบออเดอร์ที่จัดส่งแล้วได้" }, { status: 400 });
    }

    // ลบออเดอร์ (order_items จะถูกลบอัตโนมัติเนื่องจาก CASCADE)
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Order deletion error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบออเดอร์" }, { status: 500 });
    }

    return NextResponse.json({ message: "ลบออเดอร์สำเร็จ" });

  } catch (error) {
    console.error('Order deletion API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
