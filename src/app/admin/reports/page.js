'use client'
import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { showError } from '../../../../lib/sweetalert'

function ReportsAdmin() {
  const [reportData, setReportData] = useState([])
  const [summary, setSummary] = useState({})
  const [reportType, setReportType] = useState('sales')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ตั้งค่าวันเริ่มต้นและสิ้นสุด (30 วันล่าสุด)
  useEffect(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)
    
    setEndDate(end.toISOString().split('T')[0])
    setStartDate(start.toISOString().split('T')[0])
  }, [])

  // ดึงข้อมูลรายงานจาก API
  const fetchReport = useCallback(async () => {
    if (!startDate || !endDate) {
      setError('กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด')
      showError('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/reports?type=${reportType}&startDate=${startDate}&endDate=${endDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch report')
      }
      
      const data = await response.json()
      setReportData(data.report || [])
      setSummary(data.summary || {})
    } catch (err) {
      setError(err.message)
      showError('เกิดข้อผิดพลาด', err.message)
    } finally {
      setLoading(false)
    }
  }, [reportType, startDate, endDate])

  useEffect(() => {
    if (startDate && endDate) {
      fetchReport()
    }
  }, [fetchReport, startDate, endDate])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount || 0)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('th-TH').format(num || 0)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered': return 'จัดส่งสำเร็จ'
      case 'pending': return 'รอการชำระเงิน'
      case 'processing': return 'กำลังดำเนินการ'
      case 'cancelled': return 'ยกเลิก'
      default: return status
    }
  }

  const renderSalesReport = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ออเดอร์ #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ลูกค้า
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              วันที่สั่งซื้อ
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ยอดรวม
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              สถานะ
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reportData.map((order, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">#{order.order_number || order.id}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {order.users ? `${order.users.first_name} ${order.users.last_name}`.trim() : 'ไม่ระบุ'}
                </div>
                <div className="text-sm text-gray-500">
                  {order.users?.email || 'ไม่ระบุ'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {order.created_at ? new Date(order.created_at).toLocaleDateString('th-TH') : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(order.total_amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderUsersReport = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ชื่อ
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              อีเมล
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              เบอร์โทร
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              สิทธิ์
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              วันที่สมัคร
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reportData.map((user, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{user.phone || '-'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.role === 1 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.role === 1 ? 'แอดมิน' : 'ผู้ใช้'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.created_at ? new Date(user.created_at).toLocaleDateString('th-TH') : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderProductsReport = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              รูปภาพ
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ชื่อสินค้า
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ราคา
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              คลัง
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              หมวดหมู่
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              สถานะ
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reportData.map((product, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="object-cover rounded"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-500 text-xs">ไม่มีรูป</span>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                <div className="text-sm text-gray-500">{product.description}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {product.sale_price ? (
                    <>
                      <span className="line-through text-gray-500">฿{product.price}</span>
                      <br />
                      <span className="text-red-600 font-medium">฿{product.sale_price}</span>
                    </>
                  ) : (
                    <span>฿{product.price}</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{product.stock_quantity}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{product.categories?.name || '-'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  product.is_active !== false 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.is_active !== false ? 'มีจำหน่าย' : 'ไม่มีจำหน่าย'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2 md:mb-4">รายงาน</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* ตัวกรองรายงาน */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ประเภทรายงาน
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sales">รายงานยอดขาย</option>
              <option value="users">รายงานผู้ใช้</option>
              <option value="products">รายงานสินค้า</option>
              <option value="inventory">รายงานสินค้าคงคลัง</option>
              <option value="revenue">รายงานรายได้</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              วันที่เริ่มต้น
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              วันที่สิ้นสุด
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
            >
              {loading ? 'กำลังโหลด...' : 'สร้างรายงาน'}
            </button>
          </div>
        </div>
      </div>

      {/* สรุปข้อมูล */}
      {summary && Object.keys(summary).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">สรุปข้อมูล</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">จำนวนทั้งหมด</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatNumber(summary.totalCount || 0)}
              </p>
            </div>
            {(reportType === 'sales' || reportType === 'revenue') && (
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">ยอดรวม</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.totalAmount || 0)}
                </p>
              </div>
            )}
            {(reportType === 'sales' || reportType === 'revenue') && (
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">ยอดเฉลี่ย</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(summary.averageAmount || 0)}
                </p>
              </div>
            )}
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">ช่วงเวลา</p>
              <p className="text-sm text-gray-900">
                {startDate} ถึง {endDate}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ตารางรายงาน */}
      {reportData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {reportType === 'sales' && 'รายงานยอดขาย'}
              {reportType === 'users' && 'รายงานผู้ใช้'}
              {reportType === 'products' && 'รายงานสินค้า'}
              {reportType === 'inventory' && 'รายงานสินค้าคงคลัง'}
              {reportType === 'revenue' && 'รายงานรายได้'}
            </h3>
          </div>
          <div className="p-6">
            {reportType === 'sales' && renderSalesReport()}
            {reportType === 'users' && renderUsersReport()}
            {reportType === 'products' && renderProductsReport()}
            {reportType === 'inventory' && renderProductsReport()}
            {reportType === 'revenue' && renderSalesReport()}
          </div>
        </div>
      )}

      {!loading && reportData.length === 0 && (
        <div className="bg-white p-12 rounded-lg shadow-md text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">ไม่พบข้อมูลในรายงาน</p>
        </div>
      )}
    </div>
  )
}

export default ReportsAdmin
