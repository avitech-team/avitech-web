import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";
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
    const type = searchParams.get('type') || 'sales';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Missing startDate or endDate parameters" }, { status: 400 });
    }

    const supabase = await createClient();
    let report = [];

    switch (type) {
      case 'sales':
        // รายงานยอดขาย
        const { data: salesData, error: salesError } = await supabase
          .from('orders')
          .select(`
            id,
            total_amount,
            status,
            created_at,
            users (
              id,
              first_name,
              last_name,
              email
            )
          `)
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: false });

        if (salesError) {
          console.error('Error fetching sales data:', salesError);
          return NextResponse.json({ error: "Failed to fetch sales data" }, { status: 500 });
        }

        report = salesData || [];
        break;

      case 'users':
        // รายงานผู้ใช้
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, first_name, last_name, email, role, is_active, created_at')
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: false });

        if (usersError) {
          console.error('Error fetching users data:', usersError);
          return NextResponse.json({ error: "Failed to fetch users data" }, { status: 500 });
        }

        report = usersData || [];
        break;

      case 'products':
        // รายงานสินค้า
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            price,
            stock_quantity,
            is_active,
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
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: false });

        if (productsError) {
          console.error('Error fetching products data:', productsError);
          return NextResponse.json({ error: "Failed to fetch products data" }, { status: 500 });
        }

        report = productsData || [];
        break;

      case 'inventory':
        // รายงานสินค้าคงคลัง
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            price,
            stock_quantity,
            is_active,
            categories (
              id,
              name
            ),
            brands (
              id,
              name
            )
          `)
          .order('stock_quantity', { ascending: true });

        if (inventoryError) {
          console.error('Error fetching inventory data:', inventoryError);
          return NextResponse.json({ error: "Failed to fetch inventory data" }, { status: 500 });
        }

        report = inventoryData || [];
        break;

      case 'revenue':
        // รายงานรายได้
        const { data: revenueData, error: revenueError } = await supabase
          .from('orders')
          .select(`
            id,
            total_amount,
            status,
            created_at,
            users (
              id,
              first_name,
              last_name,
              email
            )
          `)
          .eq('status', 'delivered')
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: false });

        if (revenueError) {
          console.error('Error fetching revenue data:', revenueError);
          return NextResponse.json({ error: "Failed to fetch revenue data" }, { status: 500 });
        }

        report = revenueData || [];
        break;

      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    // คำนวณสถิติเพิ่มเติม
    const summary = {
      totalCount: report.length,
      totalAmount: type === 'sales' || type === 'revenue' ? 
        report.reduce((sum, item) => sum + (item.total_amount || 0), 0) : 0,
      averageAmount: type === 'sales' || type === 'revenue' ? 
        (report.length > 0 ? report.reduce((sum, item) => sum + (item.total_amount || 0), 0) / report.length : 0) : 0,
      startDate,
      endDate,
      type
    };

    return NextResponse.json({ 
      report,
      summary
    }, { status: 200 });

  } catch (error) {
    console.error('Reports error:', error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 });
  }
}
