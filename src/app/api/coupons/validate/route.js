import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";
import jwt from "jsonwebtoken";

// Helper: ตรวจสอบ JWT token
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
  const user = verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { code, amount } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "กรุณาระบุรหัสคูปอง" }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "กรุณาระบุยอดสั่งซื้อ" }, { status: 400 });
    }

    const supabase = await createClient();

    // ค้นหาคูปอง
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ error: "ไม่พบคูปองหรือคูปองไม่ถูกต้อง" }, { status: 404 });
    }

    // ตรวจสอบวันหมดอายุ
    const now = new Date();
    const validUntil = new Date(coupon.valid_until);
    
    if (now > validUntil) {
      return NextResponse.json({ error: "คูปองหมดอายุแล้ว" }, { status: 400 });
    }

    // ตรวจสอบจำนวนการใช้งาน
    if (coupon.max_usage && coupon.current_usage >= coupon.max_usage) {
      return NextResponse.json({ error: "คูปองถูกใช้งานครบจำนวนแล้ว" }, { status: 400 });
    }

    // ตรวจสอบยอดขั้นต่ำ
    if (amount < coupon.min_order_amount) {
      return NextResponse.json({ 
        error: `ยอดสั่งซื้อขั้นต่ำ ${coupon.min_order_amount.toLocaleString()} บาท` 
      }, { status: 400 });
    }

    // คำนวณส่วนลด
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = amount * (coupon.discount_value / 100);
    } else {
      discount = coupon.discount_value;
    }

    // ตรวจสอบว่าส่วนลดไม่เกินยอดสั่งซื้อ
    discount = Math.min(discount, amount);

    const finalAmount = amount - discount;

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_order_amount: coupon.min_order_amount,
        max_usage: coupon.max_usage,
        current_usage: coupon.current_usage,
        valid_until: coupon.valid_until
      },
      calculation: {
        original_amount: amount,
        discount: discount,
        final_amount: finalAmount
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Validate coupon error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการตรวจสอบคูปอง" }, { status: 500 });
  }
}
