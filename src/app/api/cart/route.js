import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";
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

export async function GET(request) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // ดึงข้อมูลตะกร้าสินค้าของผู้ใช้
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products(
          id,
          name,
          price,
          sale_price,
          images,
          stock_quantity,
          is_active
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error("Get cart error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลตะกร้าสินค้า" }, { status: 500 });
    }

    // คำนวณยอดรวม
    const total = cartItems?.reduce((sum, item) => {
      const price = item.products?.sale_price || item.products?.price || 0;
      return sum + (price * item.quantity);
    }, 0) || 0;

    return NextResponse.json({
      cart: cartItems || [],
      total: total
    }, { status: 200 });

  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลตะกร้าสินค้า" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { product_id, quantity = 1 } = await request.json();

    if (!product_id) {
      return NextResponse.json({ error: "กรุณาระบุสินค้า" }, { status: 400 });
    }

    const supabase = await createClient();

    // ตรวจสอบว่าสินค้ามีอยู่และพร้อมจำหน่าย
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, price, stock_quantity, is_active')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 });
    }

    if (!product.is_active) {
      return NextResponse.json({ error: "สินค้าไม่พร้อมจำหน่าย" }, { status: 400 });
    }

    if (product.stock_quantity < quantity) {
      return NextResponse.json({ error: "สินค้าในสต็อกไม่เพียงพอ" }, { status: 400 });
    }

    // ตรวจสอบว่าสินค้าอยู่ในตะกร้าแล้วหรือไม่
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .single();

    if (existingItem) {
      // อัปเดตจำนวนสินค้า
      const newQuantity = existingItem.quantity + quantity;
      
      if (product.stock_quantity < newQuantity) {
        return NextResponse.json({ error: "สินค้าในสต็อกไม่เพียงพอ" }, { status: 400 });
      }

      const { data: updatedItem, error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (updateError) {
        console.error("Update cart error:", updateError);
        return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตตะกร้าสินค้า" }, { status: 500 });
      }

      return NextResponse.json({
        message: "เพิ่มสินค้าลงตะกร้าสำเร็จ",
        item: updatedItem
      }, { status: 200 });
    } else {
      // เพิ่มสินค้าใหม่ลงตะกร้า
      const { data: newItem, error: insertError } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: product_id,
          quantity: quantity
        })
        .select()
        .single();

      if (insertError) {
        console.error("Add to cart error:", insertError);
        return NextResponse.json({ error: "เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า" }, { status: 500 });
      }

      return NextResponse.json({
        message: "เพิ่มสินค้าลงตะกร้าสำเร็จ",
        item: newItem
      }, { status: 201 });
    }

  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { item_id, quantity } = await request.json();

    if (!item_id || quantity === undefined) {
      return NextResponse.json({ error: "กรุณาระบุข้อมูลให้ครบถ้วน" }, { status: 400 });
    }

    if (quantity <= 0) {
      // ลบสินค้าออกจากตะกร้า
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', item_id)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error("Delete cart error:", deleteError);
        return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบสินค้าออกจากตะกร้า" }, { status: 500 });
      }

      return NextResponse.json({
        message: "ลบสินค้าออกจากตะกร้าสำเร็จ"
      }, { status: 200 });
    } else {
      // ตรวจสอบสต็อกสินค้า
      const { data: cartItem } = await supabase
        .from('cart_items')
        .select(`
          *,
          products(stock_quantity)
        `)
        .eq('id', item_id)
        .eq('user_id', user.id)
        .single();

      if (!cartItem) {
        return NextResponse.json({ error: "ไม่พบสินค้าในตะกร้า" }, { status: 404 });
      }

      if (quantity > cartItem.products.stock_quantity) {
        return NextResponse.json({ error: "สินค้าในสต็อกไม่เพียงพอ" }, { status: 400 });
      }

      // อัปเดตจำนวนสินค้า
      const { data: updatedItem, error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: quantity })
        .eq('id', item_id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error("Update cart error:", updateError);
        return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตตะกร้าสินค้า" }, { status: 500 });
      }

      return NextResponse.json({
        message: "อัปเดตตะกร้าสินค้าสำเร็จ",
        item: updatedItem
      }, { status: 200 });
    }

  } catch (error) {
    console.error("Update cart error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตตะกร้าสินค้า" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const item_id = searchParams.get('item_id');

    if (!item_id) {
      return NextResponse.json({ error: "กรุณาระบุสินค้าที่ต้องการลบ" }, { status: 400 });
    }

    const supabase = await createClient();

    // ลบสินค้าออกจากตะกร้า
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', item_id)
      .eq('user_id', user.id);

    if (error) {
      console.error("Delete cart error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบสินค้าออกจากตะกร้า" }, { status: 500 });
    }

    return NextResponse.json({
      message: "ลบสินค้าออกจากตะกร้าสำเร็จ"
    }, { status: 200 });

  } catch (error) {
    console.error("Delete cart error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบสินค้าออกจากตะกร้า" }, { status: 500 });
  }
}
