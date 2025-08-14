import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

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

export async function POST(request) {
  try {
    const user = verifyAdmin(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    // ลบตารางทั้งหมด
    const tables = [
      'order_items',
      'orders', 
      'cart_items',
      'products',
      'categories',
      'brands',
      'coupons',
      'events',
      'courses',
      'settings',
      'users'
    ]

    for (const table of tables) {
      try {
        await supabase.rpc('exec_sql', { 
          sql: `DROP TABLE IF EXISTS ${table} CASCADE;` 
        })
      } catch (error) {
        console.log(`Error dropping table ${table}:`, error.message)
      }
    }

    return Response.json({ 
      message: 'Database reset successfully',
      success: true 
    })

  } catch (error) {
    console.error('Reset database error:', error)
    return Response.json(
      { error: error.message || 'Failed to reset database' },
      { status: 500 }
    )
  }
}
