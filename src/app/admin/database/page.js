'use client'
import React, { useState, useEffect } from 'react'

function DatabaseAdmin() {
  const [migrationStatus, setMigrationStatus] = useState('')
  const [seedStatus, setSeedStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const runMigration = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      setMigrationStatus('กำลังสร้างตาราง...')
      
      const token = localStorage.getItem('token')
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to run migration')
      }

      const data = await response.json()
      setMigrationStatus('สร้างตารางสำเร็จ!')
      setSuccess('สร้างตารางฐานข้อมูลเรียบร้อยแล้ว')
    } catch (err) {
      setError(err.message)
      setMigrationStatus('เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const runSeed = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      setSeedStatus('กำลังเพิ่มข้อมูลตัวอย่าง...')
      
      const token = localStorage.getItem('token')
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to run seed')
      }

      const data = await response.json()
      setSeedStatus('เพิ่มข้อมูลตัวอย่างสำเร็จ!')
      setSuccess('เพิ่มข้อมูลตัวอย่างเรียบร้อยแล้ว')
    } catch (err) {
      setError(err.message)
      setSeedStatus('เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const resetDatabase = async () => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะรีเซ็ตฐานข้อมูลทั้งหมด? การดำเนินการนี้จะลบข้อมูลทั้งหมดและไม่สามารถกู้คืนได้!')) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      
      const token = localStorage.getItem('token')
      const response = await fetch('/api/migrate/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reset database')
      }

      setSuccess('รีเซ็ตฐานข้อมูลเรียบร้อยแล้ว')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fixSettingsTable = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      
      const token = localStorage.getItem('token')
      const response = await fetch('/api/migrate/fix-settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fix settings table')
      }

      const data = await response.json()
      setSuccess('แก้ไขโครงสร้างตาราง settings เรียบร้อยแล้ว')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const convertSettingsTable = async () => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะแปลงตาราง settings เป็นแถวเดียว? การดำเนินการนี้จะแปลงข้อมูลจาก key-value pairs เป็นแถวเดียว')) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      
      const token = localStorage.getItem('token')
      const response = await fetch('/api/migrate/convert-settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to convert settings table')
      }

      const data = await response.json()
      setSuccess('แปลงตาราง settings เป็นแถวเดียวเรียบร้อยแล้ว')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createWebsiteSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      
      const token = localStorage.getItem('token')
      const response = await fetch('/api/migrate/create-website-settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create website settings tables')
      }

      const data = await response.json()
      setSuccess('สร้างตารางตั้งค่าเว็บไซต์เรียบร้อยแล้ว')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2 md:mb-4">จัดการฐานข้อมูล</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* การสร้างตาราง */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">สร้างตารางฐานข้อมูล</h2>
        <p className="text-gray-600 mb-4">
          สร้างตารางทั้งหมดที่จำเป็นสำหรับระบบ e-commerce รวมถึง:
        </p>
        <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
          <li>ตารางผู้ใช้ (users)</li>
          <li>ตารางสินค้า (products)</li>
          <li>ตารางหมวดหมู่ (categories)</li>
          <li>ตารางแบรนด์ (brands)</li>
          <li>ตารางออเดอร์ (orders)</li>
          <li>ตารางรายการออเดอร์ (order_items)</li>
          <li>ตารางคูปอง (coupons)</li>
          <li>ตารางตั้งค่า (settings)</li>
          <li>ตารางอีเวนต์ (events)</li>
          <li>ตารางคอร์ส (courses)</li>
        </ul>
        <button
          onClick={runMigration}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
        >
          {loading ? 'กำลังดำเนินการ...' : 'สร้างตาราง'}
        </button>
        {migrationStatus && (
          <p className="mt-2 text-sm text-gray-600">{migrationStatus}</p>
        )}
      </div>

      {/* การเพิ่มข้อมูลตัวอย่าง */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">เพิ่มข้อมูลตัวอย่าง</h2>
        <p className="text-gray-600 mb-4">
          เพิ่มข้อมูลตัวอย่างสำหรับการทดสอบระบบ รวมถึง:
        </p>
        <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
          <li>หมวดหมู่สินค้าตัวอย่าง</li>
          <li>แบรนด์ตัวอย่าง</li>
          <li>สินค้าตัวอย่าง</li>
          <li>คูปองตัวอย่าง</li>
          <li>อีเวนต์ตัวอย่าง</li>
          <li>คอร์สตัวอย่าง</li>
          <li>ตั้งค่าระบบเริ่มต้น</li>
        </ul>
        <button
          onClick={runSeed}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
        >
          {loading ? 'กำลังดำเนินการ...' : 'เพิ่มข้อมูลตัวอย่าง'}
        </button>
        {seedStatus && (
          <p className="mt-2 text-sm text-gray-600">{seedStatus}</p>
        )}
      </div>

      {/* แก้ไขตาราง settings */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">แก้ไขตาราง Settings</h2>
        <p className="text-gray-600 mb-4">
          แก้ไขโครงสร้างตาราง settings เพื่อเพิ่มคอลัมน์ที่หายไป เช่น address และอื่นๆ
        </p>
        <button
          onClick={fixSettingsTable}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
        >
          {loading ? 'กำลังดำเนินการ...' : 'แก้ไขตาราง Settings'}
        </button>
      </div>

      {/* สร้างตารางตั้งค่าเว็บไซต์ */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">สร้างตารางตั้งค่าเว็บไซต์</h2>
        <p className="text-gray-600 mb-4">
          สร้างตารางตั้งค่าเว็บไซต์แยกตามหมวดหมู่: หน้าหลัก, เกี่ยวกับเรา, รูปภาพ, Social Media, แกลเลอรี่, SEO, ติดต่อ, E-commerce, ระบบ
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                หมวดหมู่ที่สร้าง
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>หน้าหลัก (Homepage Settings)</li>
                  <li>เกี่ยวกับเรา (About Settings)</li>
                  <li>รูปภาพ (Image Settings)</li>
                  <li>Social Media (Social Settings)</li>
                  <li>แกลเลอรี่ (Gallery Settings)</li>
                  <li>SEO (SEO Settings)</li>
                  <li>ติดต่อ (Contact Settings)</li>
                  <li>E-commerce (E-commerce Settings)</li>
                  <li>ระบบ (System Settings)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={createWebsiteSettings}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
        >
          {loading ? 'กำลังดำเนินการ...' : 'สร้างตารางตั้งค่าเว็บไซต์'}
        </button>
      </div>

      {/* แปลงตาราง settings เป็นแถวเดียว */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">แปลงตาราง Settings เป็นแถวเดียว</h2>
        <p className="text-gray-600 mb-4">
          แปลงตาราง settings จาก key-value pairs เป็นแถวเดียวที่มีแค่ GET และ UPDATE เท่านั้น
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 text-blue-400 flex items-center justify-center">
                <span className="text-lg">ℹ</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                คำแนะนำ
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  การแปลงนี้จะเปลี่ยนโครงสร้างตารางจาก key-value pairs เป็นแถวเดียว 
                  ทำให้จัดการข้อมูลได้ง่ายขึ้นและมีประสิทธิภาพมากขึ้น
                </p>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={convertSettingsTable}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
        >
          {loading ? 'กำลังดำเนินการ...' : 'แปลงตาราง Settings'}
        </button>
      </div>

      {/* การรีเซ็ตฐานข้อมูล */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">รีเซ็ตฐานข้อมูล</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                คำเตือน
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  การรีเซ็ตฐานข้อมูลจะลบข้อมูลทั้งหมดและไม่สามารถกู้คืนได้ 
                  กรุณาแน่ใจว่าคุณได้สำรองข้อมูลสำคัญแล้ว
                </p>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={resetDatabase}
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
        >
          {loading ? 'กำลังดำเนินการ...' : 'รีเซ็ตฐานข้อมูล'}
        </button>
      </div>

      {/* ข้อมูลโครงสร้างฐานข้อมูล */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">โครงสร้างฐานข้อมูล</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">ตารางหลัก</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">users</span>
                <span className="text-xs text-gray-500">ผู้ใช้</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">products</span>
                <span className="text-xs text-gray-500">สินค้า</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">categories</span>
                <span className="text-xs text-gray-500">หมวดหมู่</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">brands</span>
                <span className="text-xs text-gray-500">แบรนด์</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">orders</span>
                <span className="text-xs text-gray-500">ออเดอร์</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">ตารางรอง</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">order_items</span>
                <span className="text-xs text-gray-500">รายการออเดอร์</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">coupons</span>
                <span className="text-xs text-gray-500">คูปอง</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">settings</span>
                <span className="text-xs text-gray-500">ตั้งค่า</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">events</span>
                <span className="text-xs text-gray-500">อีเวนต์</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">courses</span>
                <span className="text-xs text-gray-500">คอร์ส</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* คำแนะนำการใช้งาน */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">คำแนะนำการใช้งาน</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>1. กดปุ่ม &quot;สร้างตาราง&quot; เพื่อสร้างโครงสร้างฐานข้อมูล</p>
          <p>2. กดปุ่ม &quot;เพิ่มข้อมูลตัวอย่าง&quot; เพื่อเพิ่มข้อมูลสำหรับการทดสอบ</p>
          <p>3. หลังจากนั้นคุณสามารถเริ่มใช้งานระบบได้</p>
          <p>4. หากต้องการเริ่มต้นใหม่ ให้กดปุ่ม &quot;รีเซ็ตฐานข้อมูล&quot;</p>
        </div>
      </div>
    </div>
  )
}

export default DatabaseAdmin
