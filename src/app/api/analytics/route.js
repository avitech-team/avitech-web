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
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    
    const supabase = await createClient();
    
    // คำนวณวันที่เริ่มต้นตามช่วงเวลา
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // ดึงข้อมูลผู้ใช้ทั้งหมด
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, created_at, role')
      .gte('created_at', startDate.toISOString());

    if (usersError) {
      console.error('Error fetching users:', usersError);
    }

    // ดึงข้อมูลออเดอร์ทั้งหมด
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount, created_at, status')
      .gte('created_at', startDate.toISOString());

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
    }

    // ดึงข้อมูลสินค้าทั้งหมด
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, is_active');

    if (productsError) {
      console.error('Error fetching products:', productsError);
    }

    // คำนวณสถิติ
    const totalUsers = users?.length || 0;
    const newUsers = users?.filter(user => new Date(user.created_at) >= startDate).length || 0;
    const totalOrders = orders?.length || 0;
    const recentOrders = orders?.filter(order => new Date(order.created_at) >= startDate).length || 0;
    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    const totalProducts = products?.length || 0;
    const activeProducts = products?.filter(product => product.is_active !== false).length || 0;

    // คำนวณอัตราการเติบโต
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(startDate);
    
    switch (period) {
      case '7d':
        previousStartDate.setDate(startDate.getDate() - 7);
        previousEndDate.setDate(startDate.getDate() - 1);
        break;
      case '30d':
        previousStartDate.setDate(startDate.getDate() - 30);
        previousEndDate.setDate(startDate.getDate() - 1);
        break;
      case '90d':
        previousStartDate.setDate(startDate.getDate() - 90);
        previousEndDate.setDate(startDate.getDate() - 1);
        break;
      case '1y':
        previousStartDate.setFullYear(startDate.getFullYear() - 1);
        previousEndDate.setDate(startDate.getDate() - 1);
        break;
    }

    // ดึงข้อมูลช่วงก่อนหน้าเพื่อเปรียบเทียบ
    const { data: previousUsers } = await supabase
      .from('users')
      .select('id')
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', previousEndDate.toISOString());

    const { data: previousOrders } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', previousEndDate.toISOString());

    const previousUsersCount = previousUsers?.length || 0;
    const previousOrdersCount = previousOrders?.length || 0;
    const previousRevenue = previousOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    // คำนวณเปอร์เซ็นต์การเติบโต
    const userGrowthRate = previousUsersCount > 0 ? ((newUsers - previousUsersCount) / previousUsersCount) * 100 : 0;
    const orderGrowthRate = previousOrdersCount > 0 ? ((recentOrders - previousOrdersCount) / previousOrdersCount) * 100 : 0;
    const revenueGrowthRate = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    const analytics = {
      overview: {
        totalUsers,
        newUsers,
        totalOrders,
        recentOrders,
        totalRevenue,
        totalProducts,
        activeProducts,
        userGrowthRate: Math.round(userGrowthRate * 100) / 100,
        orderGrowthRate: Math.round(orderGrowthRate * 100) / 100,
        revenueGrowthRate: Math.round(revenueGrowthRate * 100) / 100
      },
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      period
    };

    return NextResponse.json({ analytics }, { status: 200 });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 });
  }
}
