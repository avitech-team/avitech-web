import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import jwt from "jsonwebtoken";

// Helper: ตรวจสอบ JWT
function verifyToken(req) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    return decoded;
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      shipping_address,
      billing_address,
      payment_method,
      coupon_code,
      notes
    } = await request.json();

    if (!shipping_address) {
      return NextResponse.json({ error: "กรุณาระบุที่อยู่จัดส่ง" }, { status: 400 });
    }

    const supabase = await createClient();

    // ดึงข้อมูลตะกร้าสินค้า
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        *,
        products(
          id,
          name,
          price,
          sale_price,
          stock_quantity,
          is_active
        )
      `)
      .eq('user_id', user.id);

    if (cartError) {
      console.error("Get cart error:", cartError);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลตะกร้าสินค้า" }, { status: 500 });
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "ตะกร้าสินค้าว่างเปล่า" }, { status: 400 });
    }

    // ตรวจสอบสต็อกสินค้า
    for (const item of cartItems) {
      if (!item.products.is_active) {
        return NextResponse.json({ error: `สินค้า ${item.products.name} ไม่พร้อมจำหน่าย` }, { status: 400 });
      }
      if (item.products.stock_quantity < item.quantity) {
        return NextResponse.json({ error: `สินค้า ${item.products.name} ในสต็อกไม่เพียงพอ` }, { status: 400 });
      }
    }

    // คำนวณยอดรวม
    let subtotal = cartItems.reduce((sum, item) => {
      const price = item.products.sale_price || item.products.price;
      return sum + (price * item.quantity);
    }, 0);

    // ตรวจสอบคูปอง
    let discount = 0;
    let coupon = null;
    if (coupon_code) {
      const { data: couponData, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', coupon_code)
        .eq('is_active', true)
        .single();

      if (!couponError && couponData) {
        const now = new Date();
        const validUntil = new Date(couponData.valid_until);
        
        if (now <= validUntil && 
            couponData.current_usage < (couponData.max_usage || 999999) &&
            subtotal >= couponData.min_order_amount) {
          
          coupon = couponData;
          if (couponData.discount_type === 'percentage') {
            discount = (subtotal * couponData.discount_value) / 100;
          } else {
            discount = couponData.discount_value;
          }
          
          // ตรวจสอบว่าส่วนลดไม่เกินยอดรวม
          if (discount > subtotal) {
            discount = subtotal;
          }
        }
      }
    }

    // คำนวณยอดรวมสุดท้าย
    const total = subtotal - discount;

    // สร้างออเดอร์
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: total,
        shipping_address,
        billing_address: billing_address || shipping_address,
        payment_method,
        notes,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error("Create order error:", orderError);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างออเดอร์" }, { status: 500 });
    }

    // สร้างรายการสินค้าในออเดอร์
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.products.name,
      quantity: item.quantity,
      unit_price: item.products.sale_price || item.products.price,
      total_price: (item.products.sale_price || item.products.price) * item.quantity
    }));

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (orderItemsError) {
      console.error("Create order items error:", orderItemsError);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างรายการสินค้า" }, { status: 500 });
    }

    // อัปเดตสต็อกสินค้า
    for (const item of cartItems) {
      const { error: updateStockError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: item.products.stock_quantity - item.quantity 
        })
        .eq('id', item.product_id);

      if (updateStockError) {
        console.error("Update stock error:", updateStockError);
      }
    }

    // อัปเดตจำนวนการใช้คูปอง
    if (coupon) {
      const { error: updateCouponError } = await supabase
        .from('coupons')
        .update({ 
          current_usage: coupon.current_usage + 1 
        })
        .eq('id', coupon.id);

      if (updateCouponError) {
        console.error("Update coupon usage error:", updateCouponError);
      }
    }

    // ลบข้อมูลตะกร้าสินค้า
    const { error: deleteCartError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (deleteCartError) {
      console.error("Delete cart error:", deleteCartError);
    }

    return NextResponse.json({
      message: "สร้างออเดอร์สำเร็จ",
      order: {
        id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        status: order.status
      }
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 });
  }
}
