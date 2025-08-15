'use client'
import React, { useState, useEffect } from 'react'
import { showSuccess, showError, showLoading, closeLoading } from '../../../../lib/sweetalert'

function SetupAdmin() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSetup, setIsSetup] = useState(false)
  const [adminExists, setAdminExists] = useState(false)

  useEffect(() => {
    // ตรวจสอบว่ามี admin อยู่แล้วหรือไม่
    checkAdminExists()
  }, [])

  const checkAdminExists = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        const adminUsers = data.users?.filter(user => user.role === 1) || []
        if (adminUsers.length > 0) {
          setAdminExists(true)
        }
      }
    } catch (error) {
      showError('เกิดข้อผิดพลาด', 'ไม่สามารถตรวจสอบสถานะแอดมินได้')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // ตรวจสอบรหัสผ่าน
    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน')
      showError('รหัสผ่านไม่ตรงกัน', 'กรุณาตรวจสอบรหัสผ่านและรหัสผ่านยืนยัน')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      showError('รหัสผ่านสั้นเกินไป', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      setLoading(false)
      return
    }

    try {
      showLoading('กำลังสร้างแอดมิน...')
      const response = await fetch('/api/auth/setup-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('สร้างแอดมินสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว')
        setIsSetup(true)
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        })
        closeLoading()
        showSuccess('สร้างแอดมินสำเร็จ', 'คุณสามารถเข้าสู่ระบบได้แล้ว')
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการสร้างแอดมิน')
        closeLoading()
        showError('สร้างแอดมินไม่สำเร็จ', data.error || 'เกิดข้อผิดพลาดในการสร้างแอดมิน')
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
      closeLoading()
      showError('เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  if (isSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              ตั้งค่าเสร็จสิ้น
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              มีแอดมินในระบบแล้ว คุณสามารถเข้าสู่ระบบได้
            </p>
          </div>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success || 'ระบบพร้อมใช้งานแล้ว'}
          </div>
          <div className="text-center">
            <a
              href="/admin"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              ไปหน้าเข้าสู่ระบบ
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ตั้งค่าแอดมินเริ่มต้น
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            สร้างบัญชีแอดมินคนแรกสำหรับระบบ
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                ชื่อ
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="ชื่อแอดมิน"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                อีเมล
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                รหัสผ่าน
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                ยืนยันรหัสผ่าน
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="ยืนยันรหัสผ่าน"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
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

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'กำลังสร้างแอดมิน...' : 'สร้างแอดมิน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SetupAdmin
