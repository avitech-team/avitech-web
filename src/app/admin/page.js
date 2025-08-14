'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'

// ดึงหน้าต่างๆ จากไฟล์แยก
const CourseAdmin = dynamic(() => import('./course/page'), { ssr: false })
const EventAdmin = dynamic(() => import('./event/page'), { ssr: false })
const UsersAdmin = dynamic(() => import('./users/page'), { ssr: false })
const ProductsAdmin = dynamic(() => import('./products/page'), { ssr: false })
const OrdersAdmin = dynamic(() => import('./orders/page'), { ssr: false })
const CategoriesAdmin = dynamic(() => import('./categories/page'), { ssr: false })
const BrandsAdmin = dynamic(() => import('./brands/page'), { ssr: false })
const CouponsAdmin = dynamic(() => import('./coupons/page'), { ssr: false })
const SettingsAdmin = dynamic(() => import('./settings/page'), { ssr: false })
const WebsiteSettings = dynamic(() => import('./website-settings/page'), { ssr: false })
const ReportsAdmin = dynamic(() => import('./reports/page'), { ssr: false })
const AnalyticsAdmin = dynamic(() => import('./analytics/page'), { ssr: false })
// const DatabaseAdmin = dynamic(() => import('./database/page'), { ssr: false })

// แยกหมวดหมู่เมนู
const menuSections = [
  {
    title: 'ทั่วไป',
    items: [
      { key: 'dashboard', label: 'แผงควบคุม', path: '/admin', component: <div><h1 className="text-2xl md:text-3xl font-semibold mb-2 md:mb-4">แผงควบคุมแอดมิน</h1><p>ยินดีต้อนรับสู่แผงควบคุมแอดมิน</p></div> },
      { key: 'users', label: 'ผู้ใช้', path: '/admin/users', component: <UsersAdmin /> },
      { key: 'settings', label: 'ตั้งค่า', path: '/admin/settings', component: <SettingsAdmin /> },
      { key: 'website-settings', label: 'ตั้งค่าเว็บไซต์', path: '/admin?page=website-settings', component: <WebsiteSettings /> },
      // { key: 'database', label: 'จัดการฐานข้อมูล', path: '/admin/database', component: <DatabaseAdmin /> },
    ]
  },
  {
    title: 'สินค้าและออเดอร์',
    items: [
      { key: 'products', label: 'สินค้า', path: '/admin/products', component: <ProductsAdmin /> },
      { key: 'orders', label: 'ออเดอร์', path: '/admin/orders', component: <OrdersAdmin /> },
      { key: 'categories', label: 'หมวดหมู่', path: '/admin/categories', component: <CategoriesAdmin /> },
      { key: 'brands', label: 'แบรนด์', path: '/admin/brands', component: <BrandsAdmin /> },
      { key: 'coupons', label: 'คูปอง', path: '/admin/coupons', component: <CouponsAdmin /> },
    ]
  },
  {
    title: 'คอร์สและอีเวนต์',
    items: [
      { key: 'course', label: 'คอร์ส', path: '/admin/course', component: <CourseAdmin /> },
      { key: 'event', label: 'อีเวนต์', path: '/admin/event', component: <EventAdmin /> },
    ]
  },
  {
    title: 'การวิเคราะห์และรายงาน',
    items: [
      { key: 'reports', label: 'รายงาน', path: '/admin/reports', component: <ReportsAdmin /> },
      { key: 'analytics', label: 'วิเคราะห์', path: '/admin/analytics', component: <AnalyticsAdmin /> },
    ]
  }
]

// รวมทุกหน้าไว้ใน array เดียวสำหรับค้นหา
const pages = menuSections.flatMap(section => section.items)

function Breadcrumb({ path }) {
  // path เช่น /admin/course
  const segments = path.split('/').filter(Boolean)
  let current = ''
  return (
    <nav className="text-sm mb-4" aria-label="breadcrumb">
      <ol className="list-none flex flex-wrap gap-1">
        {segments.map((seg, idx) => {
          current += '/' + seg
          const isLast = idx === segments.length - 1
          return (
            <li key={current} className="flex items-center">
              {!isLast ? (
                <>
                  <span className="text-blue-600">{seg}</span>
                  <span className="mx-1">/</span>
                </>
              ) : (
                <span className="font-semibold">{seg}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function LoginForm({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        // ตรวจสอบว่าเป็น admin หรือไม่
        if (data.user.role === 1) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          onLogin(data.user)
        } else {
          setError('คุณไม่มีสิทธิ์เข้าถึงแผงควบคุมแอดมิน')
        }
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            เข้าสู่ระบบแอดมิน
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">อีเมล</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="อีเมล"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">รหัสผ่าน</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="รหัสผ่าน"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Admin() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  
  // รับ page จาก URL parameter หรือใช้ dashboard เป็นค่าเริ่มต้น
  const pageParam = searchParams.get('page') || 'dashboard'
  const currentPage = pages.find(page => page.key === pageParam) || pages.find(page => page.key === 'dashboard')

  useEffect(() => {
    // ตรวจสอบ token เมื่อโหลดหน้า
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        if (user.role === 1) {
          setIsAuthenticated(true)
          setUser(user)
        } else {
          // ถ้าไม่ใช่ admin ให้ลบ token
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      } catch (err) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [])

  const handleLogin = (userData) => {
    setIsAuthenticated(true)
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
  }

  const handlePageChange = (pageKey) => {
    // อัปเดต URL โดยไม่รีเฟรชหน้า
    const url = pageKey === 'dashboard' ? '/admin' : `/admin?page=${pageKey}`
    router.push(url, { scroll: false })
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      <aside className="w-full md:w-56 bg-gray-100 p-4 md:p-8 shadow-md flex flex-row md:flex-col gap-2 md:gap-4 items-center md:items-stretch">
        <div className="flex flex-col w-full">
          <h2 className="mb-4 md:mb-8 text-xl md:text-2xl font-bold text-center md:text-left">แอดมิน</h2>
          
          {/* แสดงข้อมูลผู้ใช้ */}
          {user && (
            <div className="mb-4 p-3 bg-white rounded-lg shadow-sm">
              <p className="text-sm font-medium text-gray-900">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          )}
          
          <nav className="flex flex-col gap-4 w-full">
            {menuSections.map(section => (
              <div key={section.title} className="w-full">
                <div className="text-gray-500 text-xs font-semibold mb-1 px-2">{section.title}</div>
                <div className="flex flex-row md:flex-col gap-2 md:gap-2 flex-wrap md:flex-nowrap w-full">
                  {section.items.map(page => (
                    <button
                      key={page.key}
                      onClick={() => handlePageChange(page.key)}
                      className={`hover:text-blue-600 transition-colors text-left w-full px-2 py-1 rounded ${pageParam === page.key ? 'bg-blue-100 font-bold text-blue-700' : ''}`}
                      style={{ outline: 'none', border: 'none', background: 'none', cursor: 'pointer' }}
                      type="button"
                    >
                      {page.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          
          {/* ปุ่มออกจากระบบ */}
          <button
            onClick={handleLogout}
            className="mt-auto w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            ออกจากระบบ
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8">
        {currentPage && <Breadcrumb path={currentPage.path} />}
        {currentPage?.component}
      </main>
    </div>
  )
}

export default Admin
