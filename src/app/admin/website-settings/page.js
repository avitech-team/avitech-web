'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { showSuccess, showError, showLoading, closeLoading } from '../../../../lib/sweetalert'

function WebsiteSettingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('homepage')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [formData, setFormData] = useState({})

  // รับ tab จาก URL parameter หรือใช้ homepage เป็นค่าเริ่มต้น
  const tabParam = searchParams.get('tab') || 'homepage'

  useEffect(() => {
    setActiveTab(tabParam)
    loadSettings(tabParam)
  }, [tabParam])

  const loadSettings = async (tab) => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/settings/${tab}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch settings')
      }
      
      const data = await response.json()
      setFormData(data.settings || {})
    } catch (err) {
      setError(err.message)
      showError('เกิดข้อผิดพลาด', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    const url = `/admin?page=website-settings&tab=${tabId}`
    router.push(url, { scroll: false })
    loadSettings(tabId)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      
      showLoading('กำลังบันทึกการตั้งค่า...')
      
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/settings/${activeTab}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update settings')
      }
      
      const data = await response.json()
      setFormData(data.settings || {})
      setSuccess('อัปเดตการตั้งค่าเรียบร้อยแล้ว')
      
      closeLoading()
      showSuccess('บันทึกการตั้งค่าสำเร็จ', 'การตั้งค่าได้ถูกอัปเดตเรียบร้อยแล้ว')
    } catch (err) {
      setError(err.message)
      closeLoading()
      showError('เกิดข้อผิดพลาด', err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const renderHomepageForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            หัวข้อหลัก
          </label>
          <input
            type="text"
            value={formData.main_title || ''}
            onChange={(e) => handleInputChange('main_title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="หัวข้อหลักของเว็บไซต์"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            หัวข้อรอง
          </label>
          <input
            type="text"
            value={formData.sub_title || ''}
            onChange={(e) => handleInputChange('sub_title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="หัวข้อรองของเว็บไซต์"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          คำอธิบาย
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="คำอธิบายเกี่ยวกับเว็บไซต์"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ปุ่มหลัก - ข้อความ
          </label>
          <input
            type="text"
            value={formData.primary_button_text || ''}
            onChange={(e) => handleInputChange('primary_button_text', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="เช่น เริ่มต้นใช้งาน"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ปุ่มหลัก - ลิงก์
          </label>
          <input
            type="text"
            value={formData.primary_button_link || ''}
            onChange={(e) => handleInputChange('primary_button_link', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="เช่น /products"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ปุ่มรอง - ข้อความ
          </label>
          <input
            type="text"
            value={formData.secondary_button_text || ''}
            onChange={(e) => handleInputChange('secondary_button_text', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="เช่น เรียนรู้เพิ่มเติม"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ปุ่มรอง - ลิงก์
          </label>
          <input
            type="text"
            value={formData.secondary_button_link || ''}
            onChange={(e) => handleInputChange('secondary_button_link', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="เช่น /about"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          รูปภาพพื้นหลัง (URL)
        </label>
        <input
          type="url"
          value={formData.background_image || ''}
          onChange={(e) => handleInputChange('background_image', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/background.jpg"
        />
      </div>
    </div>
  )

  const renderAboutForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          หัวข้อเกี่ยวกับเรา
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="หัวข้อเกี่ยวกับเรา"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          คำอธิบาย
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="คำอธิบายเกี่ยวกับบริษัทหรือเว็บไซต์"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            จำนวนลูกค้า
          </label>
          <input
            type="number"
            value={formData.customer_count || ''}
            onChange={(e) => handleInputChange('customer_count', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="เช่น 1000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            จำนวนสินค้า
          </label>
          <input
            type="number"
            value={formData.product_count || ''}
            onChange={(e) => handleInputChange('product_count', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="เช่น 500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          รูปภาพ (URL)
        </label>
        <input
          type="url"
          value={formData.image || ''}
          onChange={(e) => handleInputChange('image', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/about-image.jpg"
        />
      </div>
    </div>
  )

  const renderImagesForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Logo (URL)
        </label>
        <input
          type="url"
          value={formData.logo || ''}
          onChange={(e) => handleInputChange('logo', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/logo.png"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Favicon (URL)
        </label>
        <input
          type="url"
          value={formData.favicon || ''}
          onChange={(e) => handleInputChange('favicon', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/favicon.ico"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          รูปภาพเริ่มต้น (URL)
        </label>
        <input
          type="url"
          value={formData.default_image || ''}
          onChange={(e) => handleInputChange('default_image', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/default-image.jpg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          รูปภาพข้อผิดพลาด (URL)
        </label>
        <input
          type="url"
          value={formData.error_image || ''}
          onChange={(e) => handleInputChange('error_image', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/error-image.jpg"
        />
      </div>
    </div>
  )

  const renderSocialForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Facebook URL
        </label>
        <input
          type="url"
          value={formData.facebook_url || ''}
          onChange={(e) => handleInputChange('facebook_url', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://facebook.com/..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instagram URL
        </label>
        <input
          type="url"
          value={formData.instagram_url || ''}
          onChange={(e) => handleInputChange('instagram_url', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://instagram.com/..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Twitter URL
        </label>
        <input
          type="url"
          value={formData.twitter_url || ''}
          onChange={(e) => handleInputChange('twitter_url', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://twitter.com/..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          YouTube URL
        </label>
        <input
          type="url"
          value={formData.youtube_url || ''}
          onChange={(e) => handleInputChange('youtube_url', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://youtube.com/..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Line ID
        </label>
        <input
          type="text"
          value={formData.line_id || ''}
          onChange={(e) => handleInputChange('line_id', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Line ID"
        />
      </div>
    </div>
  )

  const renderGalleryForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          หัวข้อแกลเลอรี่
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="หัวข้อแกลเลอรี่"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          คำอธิบาย
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="คำอธิบายแกลเลอรี่"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          รูปภาพแกลเลอรี่ (URLs คั่นด้วยเครื่องหมายจุลภาค)
        </label>
        <textarea
          value={formData.images || ''}
          onChange={(e) => handleInputChange('images', e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg, https://example.com/image3.jpg"
        />
        <p className="text-sm text-gray-500 mt-1">
          กรุณาใส่ URL ของรูปภาพคั่นด้วยเครื่องหมายจุลภาค (,)
        </p>
      </div>
    </div>
  )

  const renderSEOForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meta Title
        </label>
        <input
          type="text"
          value={formData.meta_title || ''}
          onChange={(e) => handleInputChange('meta_title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="ชื่อเว็บไซต์ - คำอธิบาย"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meta Description
        </label>
        <textarea
          value={formData.meta_description || ''}
          onChange={(e) => handleInputChange('meta_description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="คำอธิบายเว็บไซต์สำหรับ SEO"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meta Keywords
        </label>
        <input
          type="text"
          value={formData.meta_keywords || ''}
          onChange={(e) => handleInputChange('meta_keywords', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="คำสำคัญ, คั่นด้วย, เครื่องหมายจุลภาค"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Google Analytics Code
        </label>
        <textarea
          value={formData.google_analytics || ''}
          onChange={(e) => handleInputChange('google_analytics', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Google Analytics tracking code"
        />
      </div>
    </div>
  )

  const renderContactForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          หัวข้อติดต่อ
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="หัวข้อหน้าติดต่อ"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          คำอธิบาย
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="คำอธิบายหน้าติดต่อ"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            อีเมลติดต่อ
          </label>
          <input
            type="email"
            value={formData.contact_email || ''}
            onChange={(e) => handleInputChange('contact_email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="contact@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            เบอร์โทรศัพท์
          </label>
          <input
            type="text"
            value={formData.contact_phone || ''}
            onChange={(e) => handleInputChange('contact_phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="02-123-4567"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ที่อยู่
        </label>
        <textarea
          value={formData.address || ''}
          onChange={(e) => handleInputChange('address', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="ที่อยู่ของบริษัท"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          เวลาทำการ
        </label>
        <textarea
          value={formData.business_hours || ''}
          onChange={(e) => handleInputChange('business_hours', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="จันทร์-ศุกร์: 9:00-18:00\nเสาร์-อาทิตย์: 10:00-16:00"
        />
      </div>
    </div>
  )

  const renderEcommerceForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          หัวข้อสินค้า
        </label>
        <input
          type="text"
          value={formData.products_title || ''}
          onChange={(e) => handleInputChange('products_title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="สินค้าของเรา"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          คำอธิบายสินค้า
        </label>
        <textarea
          value={formData.products_description || ''}
          onChange={(e) => handleInputChange('products_description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="คำอธิบายเกี่ยวกับสินค้าของเรา"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            จำนวนสินค้าต่อหน้า
          </label>
          <input
            type="number"
            value={formData.products_per_page || ''}
            onChange={(e) => handleInputChange('products_per_page', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="12"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            สินค้าแนะนำ
          </label>
          <input
            type="number"
            value={formData.featured_products_count || ''}
            onChange={(e) => handleInputChange('featured_products_count', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="8"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ข้อความตะกร้าสินค้า
        </label>
        <input
          type="text"
          value={formData.cart_message || ''}
          onChange={(e) => handleInputChange('cart_message', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="สินค้าถูกเพิ่มลงในตะกร้าแล้ว"
        />
      </div>
    </div>
  )

  const renderSystemForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ชื่อเว็บไซต์
        </label>
        <input
          type="text"
          value={formData.site_name || ''}
          onChange={(e) => handleInputChange('site_name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="ชื่อเว็บไซต์"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          คำอธิบายเว็บไซต์
        </label>
        <textarea
          value={formData.site_description || ''}
          onChange={(e) => handleInputChange('site_description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="คำอธิบายเว็บไซต์"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            สกุลเงิน
          </label>
          <select
            value={formData.currency || 'THB'}
            onChange={(e) => handleInputChange('currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="THB">บาท (THB)</option>
            <option value="USD">ดอลลาร์ (USD)</option>
            <option value="EUR">ยูโร (EUR)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ภาษาเริ่มต้น
          </label>
          <select
            value={formData.default_language || 'th'}
            onChange={(e) => handleInputChange('default_language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="th">ไทย</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.maintenance_mode || false}
          onChange={(e) => handleInputChange('maintenance_mode', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-900">
          โหมดบำรุงรักษา
        </label>
      </div>
    </div>
  )

  const renderForm = () => {
    switch (activeTab) {
      case 'homepage':
        return renderHomepageForm()
      case 'about':
        return renderAboutForm()
      case 'images':
        return renderImagesForm()
      case 'social':
        return renderSocialForm()
      case 'gallery':
        return renderGalleryForm()
      case 'seo':
        return renderSEOForm()
      case 'contact':
        return renderContactForm()
      case 'ecommerce':
        return renderEcommerceForm()
      case 'system':
        return renderSystemForm()
      default:
        return renderHomepageForm()
    }
  }

  const tabs = [
    { id: 'homepage', label: 'หน้าหลัก' },
    { id: 'about', label: 'เกี่ยวกับเรา' },
    { id: 'images', label: 'รูปภาพ' },
    { id: 'social', label: 'Social Media' },
    { id: 'gallery', label: 'แกลเลอรี่' },
    { id: 'seo', label: 'SEO' },
    { id: 'contact', label: 'ติดต่อ' },
    { id: 'ecommerce', label: 'E-commerce' },
    { id: 'system', label: 'ระบบ' }
  ]

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
        <h1 className="text-2xl md:text-3xl font-semibold mb-2 md:mb-4">ตั้งค่าเว็บไซต์</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderForm()}
            
            <div className="flex justify-end pt-6 border-t">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function WebsiteSettings() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">กำลังโหลด...</div>}>
      <WebsiteSettingsContent />
    </Suspense>
  )
}

export default WebsiteSettings
