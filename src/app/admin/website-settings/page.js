'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function WebsiteSettings() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'homepage')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [settings, setSettings] = useState({})

  const tabs = [
    { id: 'homepage', name: 'หน้าหลัก', icon: '' },
    { id: 'about', name: 'เกี่ยวกับเรา', icon: '' },
    { id: 'images', name: 'รูปภาพ', icon: '' },
    { id: 'social', name: 'Social Media', icon: '' },
    { id: 'gallery', name: 'แกลเลอรี่', icon: '' },
    { id: 'seo', name: 'SEO', icon: '' },
    { id: 'contact', name: 'ติดต่อ', icon: '' },
    { id: 'ecommerce', name: 'E-commerce', icon: '' },
    { id: 'system', name: 'ระบบ', icon: '' }
  ]

  useEffect(() => {
    loadSettings(activeTab)
  }, [activeTab])

  // Sync activeTab with URL when page loads
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') || 'homepage'
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams, activeTab])

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
        throw new Error(errorData.error || 'Failed to load settings')
      }

      const data = await response.json()
      setSettings(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    // อัปเดต URL โดยไม่เปลี่ยนหน้า
    const url = `/admin?page=website-settings&tab=${tabId}`
    router.replace(url, { scroll: false })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/settings/${activeTab}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update settings')
      }

      const data = await response.json()
      setSuccess('อัปเดตการตั้งค่าเรียบร้อยแล้ว')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const renderHomepageForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          หัวข้อหลัก (Hero Title)
        </label>
        <input
          type="text"
          value={settings.hero_title || ''}
          onChange={(e) => handleInputChange('hero_title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          หัวข้อรอง (Hero Subtitle)
        </label>
        <textarea
          value={settings.hero_subtitle || ''}
          onChange={(e) => handleInputChange('hero_subtitle', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL รูปภาพ Hero
        </label>
        <input
          type="text"
          value={settings.hero_image_url || ''}
          onChange={(e) => handleInputChange('hero_image_url', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          จำนวนสินค้าแนะนำ
        </label>
        <input
          type="number"
          value={settings.featured_products_count || 8}
          onChange={(e) => handleInputChange('featured_products_count', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">การแสดงผล</h3>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.show_featured_products || false}
            onChange={(e) => handleInputChange('show_featured_products', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            แสดงสินค้าแนะนำ
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.show_latest_products || false}
            onChange={(e) => handleInputChange('show_latest_products', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            แสดงสินค้าใหม่
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.show_categories || false}
            onChange={(e) => handleInputChange('show_categories', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            แสดงหมวดหมู่
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.show_brands || false}
            onChange={(e) => handleInputChange('show_brands', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            แสดงแบรนด์
          </label>
        </div>
      </div>
    </div>
  )

  const renderAboutForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ชื่อบริษัท
        </label>
        <input
          type="text"
          value={settings.company_name || ''}
          onChange={(e) => handleInputChange('company_name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          คำอธิบายบริษัท
        </label>
        <textarea
          value={settings.company_description || ''}
          onChange={(e) => handleInputChange('company_description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ประวัติบริษัท
        </label>
        <textarea
          value={settings.company_history || ''}
          onChange={(e) => handleInputChange('company_history', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ภารกิจ (Mission)
        </label>
        <textarea
          value={settings.mission || ''}
          onChange={(e) => handleInputChange('mission', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          วิสัยทัศน์ (Vision)
        </label>
        <textarea
          value={settings.vision || ''}
          onChange={(e) => handleInputChange('vision', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ค่านิยม (Values)
        </label>
        <textarea
          value={settings.values || ''}
          onChange={(e) => handleInputChange('values', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  )

  const renderImagesForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL Logo
        </label>
        <input
          type="text"
          value={settings.logo_url || ''}
          onChange={(e) => handleInputChange('logo_url', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL Favicon
        </label>
        <input
          type="text"
          value={settings.favicon_url || ''}
          onChange={(e) => handleInputChange('favicon_url', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          รูปภาพสินค้าเริ่มต้น
        </label>
        <input
          type="text"
          value={settings.default_product_image || ''}
          onChange={(e) => handleInputChange('default_product_image', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          รูปภาพหมวดหมู่เริ่มต้น
        </label>
        <input
          type="text"
          value={settings.default_category_image || ''}
          onChange={(e) => handleInputChange('default_category_image', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          คุณภาพรูปภาพ (1-100)
        </label>
        <input
          type="number"
          min="1"
          max="100"
          value={settings.image_quality || 80}
          onChange={(e) => handleInputChange('image_quality', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ขนาดรูปภาพสูงสุด (KB)
        </label>
        <input
          type="number"
          value={settings.max_image_size || 2048}
          onChange={(e) => handleInputChange('max_image_size', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          value={settings.facebook_url || ''}
          onChange={(e) => handleInputChange('facebook_url', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instagram URL
        </label>
        <input
          type="url"
          value={settings.instagram_url || ''}
          onChange={(e) => handleInputChange('instagram_url', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Line ID
        </label>
        <input
          type="text"
          value={settings.line_id || ''}
          onChange={(e) => handleInputChange('line_id', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          WhatsApp Number
        </label>
        <input
          type="text"
          value={settings.whatsapp_number || ''}
          onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">การแสดงผล</h3>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.show_social_links || false}
            onChange={(e) => handleInputChange('show_social_links', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            แสดงลิงก์ Social Media
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.show_social_share || false}
            onChange={(e) => handleInputChange('show_social_share', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            แสดงปุ่มแชร์ Social Media
          </label>
        </div>
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
          value={settings.gallery_title || ''}
          onChange={(e) => handleInputChange('gallery_title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          คำอธิบายแกลเลอรี่
        </label>
        <textarea
          value={settings.gallery_description || ''}
          onChange={(e) => handleInputChange('gallery_description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          จำนวนรูปภาพต่อหน้า
        </label>
        <input
          type="number"
          value={settings.images_per_page || 12}
          onChange={(e) => handleInputChange('images_per_page', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">การแสดงผล</h3>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.show_lightbox || false}
            onChange={(e) => handleInputChange('show_lightbox', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            แสดง Lightbox
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.enable_zoom || false}
            onChange={(e) => handleInputChange('enable_zoom', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            เปิดใช้งาน Zoom
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.auto_play || false}
            onChange={(e) => handleInputChange('auto_play', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            เล่นอัตโนมัติ
          </label>
        </div>
      </div>
    </div>
  )

  const renderSEOForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ชื่อเว็บไซต์
        </label>
        <input
          type="text"
          value={settings.site_title || ''}
          onChange={(e) => handleInputChange('site_title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          คำอธิบายเว็บไซต์
        </label>
        <textarea
          value={settings.site_description || ''}
          onChange={(e) => handleInputChange('site_description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          คำค้นหา (Keywords)
        </label>
        <textarea
          value={settings.site_keywords || ''}
          onChange={(e) => handleInputChange('site_keywords', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="คีย์เวิร์ด1, คีย์เวิร์ด2, คีย์เวิร์ด3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Google Analytics ID
        </label>
        <input
          type="text"
          value={settings.google_analytics_id || ''}
          onChange={(e) => handleInputChange('google_analytics_id', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Facebook Pixel ID
        </label>
        <input
          type="text"
          value={settings.facebook_pixel_id || ''}
          onChange={(e) => handleInputChange('facebook_pixel_id', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  )

  const renderContactForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          อีเมลติดต่อ
        </label>
        <input
          type="email"
          value={settings.contact_email || ''}
          onChange={(e) => handleInputChange('contact_email', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          เบอร์โทรติดต่อ
        </label>
        <input
          type="text"
          value={settings.contact_phone || ''}
          onChange={(e) => handleInputChange('contact_phone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ที่อยู่
        </label>
        <textarea
          value={settings.contact_address || ''}
          onChange={(e) => handleInputChange('contact_address', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          เวลาทำการ
        </label>
        <textarea
          value={settings.business_hours || ''}
          onChange={(e) => handleInputChange('business_hours', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">การตั้งค่า</h3>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.contact_form_enabled || false}
            onChange={(e) => handleInputChange('contact_form_enabled', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            เปิดใช้งานฟอร์มติดต่อ
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.auto_reply_enabled || false}
            onChange={(e) => handleInputChange('auto_reply_enabled', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            เปิดใช้งานการตอบกลับอัตโนมัติ
          </label>
        </div>
      </div>
    </div>
  )

  const renderEcommerceForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          สกุลเงิน
        </label>
        <select
          value={settings.currency || 'THB'}
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
          อัตราภาษี (%)
        </label>
        <input
          type="number"
          step="0.01"
          value={settings.tax_rate || 7.00}
          onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ค่าจัดส่ง (บาท)
        </label>
        <input
          type="number"
          step="0.01"
          value={settings.shipping_fee || 50.00}
          onChange={(e) => handleInputChange('shipping_fee', parseFloat(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          จำนวนเงินสั่งซื้อขั้นต่ำ (บาท)
        </label>
        <input
          type="number"
          step="0.01"
          value={settings.min_order_amount || 500.00}
          onChange={(e) => handleInputChange('min_order_amount', parseFloat(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          จำนวนเงินส่งฟรี (บาท)
        </label>
        <input
          type="number"
          step="0.01"
          value={settings.free_shipping_threshold || 1000.00}
          onChange={(e) => handleInputChange('free_shipping_threshold', parseFloat(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">การตั้งค่า</h3>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.allow_guest_checkout || false}
            onChange={(e) => handleInputChange('allow_guest_checkout', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            อนุญาตให้สั่งซื้อโดยไม่ต้องสมัครสมาชิก
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.enable_reviews || false}
            onChange={(e) => handleInputChange('enable_reviews', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            เปิดใช้งานรีวิวสินค้า
          </label>
        </div>
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
          value={settings.site_name || ''}
          onChange={(e) => handleInputChange('site_name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          คำอธิบายเว็บไซต์
        </label>
        <textarea
          value={settings.site_description || ''}
          onChange={(e) => handleInputChange('site_description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">การตั้งค่าระบบ</h3>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.maintenance_mode || false}
            onChange={(e) => handleInputChange('maintenance_mode', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            โหมดบำรุงรักษา
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.enable_registration || false}
            onChange={(e) => handleInputChange('enable_registration', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            เปิดใช้งานการลงทะเบียน
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.enable_email_verification || false}
            onChange={(e) => handleInputChange('enable_email_verification', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            เปิดใช้งานการยืนยันอีเมล
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          เวลาหมดอายุเซสชัน (วินาที)
        </label>
        <input
          type="number"
          value={settings.session_timeout || 3600}
          onChange={(e) => handleInputChange('session_timeout', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">กำลังพัฒนาหน้า {tabs.find(tab => tab.id === activeTab)?.name}</p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2 md:mb-4">ตั้งค่าเว็บไซต์</h1>
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

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderForm()}
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default WebsiteSettings
