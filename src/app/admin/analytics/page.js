'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { showError } from '../../../../lib/sweetalert'

function AnalyticsAdmin() {
  const [analyticsData, setAnalyticsData] = useState({})
  const [period, setPeriod] = useState('7d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ดึงข้อมูลวิเคราะห์จาก API
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch analytics')
      const data = await response.json()
      setAnalyticsData(data.analytics || {})
    } catch (err) {
      setError(err.message)
      showError('เกิดข้อผิดพลาด', err.message)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount || 0)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('th-TH').format(num || 0)
  }

  const getGrowthColor = (rate) => {
    if (rate > 0) return 'text-green-600'
    if (rate < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getGrowthIcon = (rate) => {
    if (rate > 0) return '↗'
    if (rate < 0) return '↘'
    return '→'
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
        <h1 className="text-2xl md:text-3xl font-semibold mb-2 md:mb-4">การวิเคราะห์</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">7 วันล่าสุด</option>
          <option value="30d">30 วันล่าสุด</option>
          <option value="90d">90 วันล่าสุด</option>
          <option value="1y">1 ปีล่าสุด</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* สถิติหลัก */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ผู้ใช้ทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(analyticsData.overview?.totalUsers || 0)}
              </p>
            </div>
            <div className={`text-right ${getGrowthColor(analyticsData.overview?.userGrowthRate || 0)}`}>
              <div className="text-sm font-medium">
                {getGrowthIcon(analyticsData.overview?.userGrowthRate || 0)} {Math.abs(analyticsData.overview?.userGrowthRate || 0).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ออเดอร์ทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(analyticsData.overview?.totalOrders || 0)}
              </p>
            </div>
            <div className={`text-right ${getGrowthColor(analyticsData.overview?.orderGrowthRate || 0)}`}>
              <div className="text-sm font-medium">
                {getGrowthIcon(analyticsData.overview?.orderGrowthRate || 0)} {Math.abs(analyticsData.overview?.orderGrowthRate || 0).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">รายได้รวม</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analyticsData.overview?.totalRevenue || 0)}
              </p>
            </div>
            <div className={`text-right ${getGrowthColor(analyticsData.overview?.revenueGrowthRate || 0)}`}>
              <div className="text-sm font-medium">
                {getGrowthIcon(analyticsData.overview?.revenueGrowthRate || 0)} {Math.abs(analyticsData.overview?.revenueGrowthRate || 0).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">สินค้าทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(analyticsData.overview?.totalProducts || 0)}
              </p>
            </div>
            <div className="text-right text-purple-600">
              <div className="text-sm font-medium">
                {analyticsData.overview?.activeProducts || 0} ใช้งาน
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* สถิติการเติบโต */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">สถิติการเติบโต</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">ผู้ใช้ใหม่</p>
                <p className="text-xs text-gray-500">เทียบกับช่วงเวลาเดียวกัน</p>
              </div>
              <div className={`text-right ${getGrowthColor(analyticsData.overview?.userGrowthRate || 0)}`}>
                <p className="text-lg font-semibold">
                  {getGrowthIcon(analyticsData.overview?.userGrowthRate || 0)} {Math.abs(analyticsData.overview?.userGrowthRate || 0).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">ออเดอร์ใหม่</p>
                <p className="text-xs text-gray-500">เทียบกับช่วงเวลาเดียวกัน</p>
              </div>
              <div className={`text-right ${getGrowthColor(analyticsData.overview?.orderGrowthRate || 0)}`}>
                <p className="text-lg font-semibold">
                  {getGrowthIcon(analyticsData.overview?.orderGrowthRate || 0)} {Math.abs(analyticsData.overview?.orderGrowthRate || 0).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">รายได้</p>
                <p className="text-xs text-gray-500">เทียบกับช่วงเวลาเดียวกัน</p>
              </div>
              <div className={`text-right ${getGrowthColor(analyticsData.overview?.revenueGrowthRate || 0)}`}>
                <p className="text-lg font-semibold">
                  {getGrowthIcon(analyticsData.overview?.revenueGrowthRate || 0)} {Math.abs(analyticsData.overview?.revenueGrowthRate || 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">สรุปข้อมูล</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">ผู้ใช้ใหม่</p>
                <p className="text-xs text-gray-500">ในช่วงเวลาที่เลือก</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-blue-600">
                  {formatNumber(analyticsData.overview?.newUsers || 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">ออเดอร์ใหม่</p>
                <p className="text-xs text-gray-500">ในช่วงเวลาที่เลือก</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-green-600">
                  {formatNumber(analyticsData.overview?.recentOrders || 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">สินค้าที่มีจำหน่าย</p>
                <p className="text-xs text-gray-500">จากทั้งหมด</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-purple-600">
                  {analyticsData.overview?.activeProducts || 0} / {analyticsData.overview?.totalProducts || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ข้อมูลเพิ่มเติม */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">อัตราการเติบโตผู้ใช้</h3>
          <div className="text-center">
            <p className={`text-3xl font-bold ${getGrowthColor(analyticsData.overview?.userGrowthRate || 0)}`}>
              {analyticsData.overview?.userGrowthRate ?
                `${getGrowthIcon(analyticsData.overview.userGrowthRate)} ${Math.abs(analyticsData.overview.userGrowthRate).toFixed(1)}%` : '0%'
              }
            </p>
            <p className="text-sm text-gray-500">เทียบกับช่วงเวลาเดียวกัน</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">อัตราการเติบโตรายได้</h3>
          <div className="text-center">
            <p className={`text-3xl font-bold ${getGrowthColor(analyticsData.overview?.revenueGrowthRate || 0)}`}>
              {analyticsData.overview?.revenueGrowthRate ?
                `${getGrowthIcon(analyticsData.overview.revenueGrowthRate)} ${Math.abs(analyticsData.overview.revenueGrowthRate).toFixed(1)}%` : '0%'
              }
            </p>
            <p className="text-sm text-gray-500">เทียบกับช่วงเวลาเดียวกัน</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">อัตราสินค้าที่มีจำหน่าย</h3>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-900">
              {analyticsData.overview?.totalProducts ?
                Math.round((analyticsData.overview.activeProducts / analyticsData.overview.totalProducts) * 100) : 0
              }%
            </p>
            <p className="text-sm text-gray-500">สินค้าที่มีจำหน่าย</p>
          </div>
        </div>
      </div>

      {/* ข้อมูลช่วงเวลา */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลช่วงเวลา</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">ช่วงเวลาที่เลือก:</p>
            <p className="font-medium">
              {period === '7d' ? '7 วันล่าสุด' :
               period === '30d' ? '30 วันล่าสุด' :
               period === '90d' ? '90 วันล่าสุด' :
               '1 ปีล่าสุด'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">อัปเดตล่าสุด:</p>
            <p className="font-medium">{new Date().toLocaleString('th-TH')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsAdmin
