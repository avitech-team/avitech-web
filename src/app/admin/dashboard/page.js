'use client'
import React, { useState, useEffect } from 'react'
import { showError } from '../../../../lib/sweetalert'

function DashboardAdmin() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: [],
    monthlyRevenue: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ดึงข้อมูลสถิติจาก API
  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/analytics?period=30d', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch dashboard stats')
      const data = await response.json()
      setStats(data.analytics || {})
    } catch (err) {
      setError(err.message)
      showError('เกิดข้อผิดพลาด', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount || 0)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('th-TH').format(num || 0)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">กำลังโหลดข้อมูล...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2 md:mb-4">แดชบอร์ด</h1>
        <div className="text-sm text-gray-500">
          อัปเดตล่าสุด: {new Date().toLocaleString('th-TH')}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* สถิติหลัก */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ผู้ใช้ทั้งหมด</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(stats.overview?.totalUsers || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">สินค้าทั้งหมด</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(stats.overview?.totalProducts || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ออเดอร์ทั้งหมด</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(stats.overview?.totalOrders || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">รายได้รวม</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(stats.overview?.totalRevenue || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* กราฟและตาราง */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ออเดอร์ล่าสุด */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ออเดอร์ล่าสุด</h3>
          <div className="space-y-4">
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.slice(0, 5).map((order, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      ออเดอร์ #{order.order_number || order.id}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.users ? `${order.users.first_name} ${order.users.last_name}`.trim() : 'ไม่ระบุ'} • {new Date(order.created_at).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'delivered' ? 'จัดส่งสำเร็จ' :
                       order.status === 'pending' ? 'รอการชำระเงิน' :
                       order.status === 'processing' ? 'กำลังดำเนินการ' :
                       order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>ยังไม่มีออเดอร์</p>
              </div>
            )}
          </div>
        </div>

        {/* สถิติการเติบโต */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">สถิติการเติบโต (30 วัน)</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">ผู้ใช้ใหม่</p>
                <p className="text-xs text-gray-500">เทียบกับเดือนที่แล้ว</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-blue-600">
                  {stats.overview?.userGrowthRate ? 
                    `${stats.overview.userGrowthRate > 0 ? '+' : ''}${stats.overview.userGrowthRate.toFixed(1)}%` : 
                    '0%'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">ออเดอร์ใหม่</p>
                <p className="text-xs text-gray-500">เทียบกับเดือนที่แล้ว</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-green-600">
                  {stats.overview?.orderGrowthRate ? 
                    `${stats.overview.orderGrowthRate > 0 ? '+' : ''}${stats.overview.orderGrowthRate.toFixed(1)}%` : 
                    '0%'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">รายได้</p>
                <p className="text-xs text-gray-500">เทียบกับเดือนที่แล้ว</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-purple-600">
                  {stats.overview?.revenueGrowthRate ? 
                    `${stats.overview.revenueGrowthRate > 0 ? '+' : ''}${stats.overview.revenueGrowthRate.toFixed(1)}%` : 
                    '0%'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* สรุปข้อมูลเพิ่มเติม */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">สินค้าที่มีจำหน่าย</h3>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {stats.overview?.activeProducts || 0}
            </p>
            <p className="text-sm text-gray-500">จากทั้งหมด {stats.overview?.totalProducts || 0} รายการ</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ออเดอร์ล่าสุด</h3>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {stats.overview?.recentOrders || 0}
            </p>
            <p className="text-sm text-gray-500">ใน 30 วันล่าสุด</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ผู้ใช้ใหม่</h3>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">
              {stats.overview?.newUsers || 0}
            </p>
            <p className="text-sm text-gray-500">ใน 30 วันล่าสุด</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardAdmin
