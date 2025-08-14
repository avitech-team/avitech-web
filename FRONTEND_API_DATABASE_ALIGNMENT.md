# สรุปการแก้ไข Frontend ให้ตรงกับ API และ Database

## การเปลี่ยนแปลงหลัก

### 1. หน้า Register (`src/app/(auth)/register/page.js`)

#### ปัญหาที่พบ:
- ใช้ `name` แทนที่จะเป็น `first_name`, `last_name`
- ไม่มี field `phone`
- ไม่ตรงกับ API ที่ต้องการ `first_name`, `last_name`

#### การแก้ไข:
- เพิ่ม field `first_name`, `last_name`, `phone`
- แก้ไข validation ให้ตรวจสอบ `first_name`, `last_name`
- อัปเดต request body ให้ตรงกับ API

### 2. หน้า Admin Course (`src/app/admin/course/page.js`)

#### ปัญหาที่พบ:
- ใช้ `title` แทนที่จะเป็น `name`
- ใช้ `image` แทนที่จะเป็น `image_url`
- ใช้ `status` แทนที่จะเป็น `is_active`

#### การแก้ไข:
- เปลี่ยน `title` → `name`
- เปลี่ยน `image` → `image_url`
- เปลี่ยน `status` → `is_active`
- อัปเดต form fields และ table columns

### 3. หน้า Admin Event (`src/app/admin/event/page.js`)

#### ปัญหาที่พบ:
- ใช้ `title` แทนที่จะเป็น `name`
- ใช้ `start_date`, `end_date` แทนที่จะเป็น `date`
- ใช้ `image` แทนที่จะเป็น `image_url`
- ใช้ `status` แทนที่จะเป็น `is_active`
- ไม่มี field `price`

#### การแก้ไข:
- เปลี่ยน `title` → `name`
- เปลี่ยน `start_date`, `end_date` → `date`
- เปลี่ยน `image` → `image_url`
- เปลี่ยน `status` → `is_active`
- เพิ่ม field `price`
- อัปเดต form fields และ table columns

### 4. หน้า Admin Coupons (`src/app/admin/coupons/page.js`)

#### ปัญหาที่พบ:
- ใช้ `type` แทนที่จะเป็น `discount_type`
- ใช้ `value` แทนที่จะเป็น `discount_value`
- ใช้ `min_amount` แทนที่จะเป็น `min_order_amount`
- ใช้ `expires_at` แทนที่จะเป็น `valid_until`
- ใช้ `status` แทนที่จะเป็น `is_active`

#### การแก้ไข:
- เปลี่ยน `type` → `discount_type`
- เปลี่ยน `value` → `discount_value`
- เปลี่ยน `min_amount` → `min_order_amount`
- เปลี่ยน `expires_at` → `valid_until`
- เปลี่ยน `status` → `is_active`
- อัปเดต form fields และ table columns

### 5. หน้า Admin Reports (`src/app/admin/reports/page.js`)

#### ปัญหาที่พบ:
- ใช้ `order.users.name` แทนที่จะเป็น `order.users.first_name`, `order.users.last_name`
- ใช้ `order.total` แทนที่จะเป็น `order.total_amount`
- ใช้ `user.name` แทนที่จะเป็น `user.first_name`, `user.last_name`
- ใช้ `product.image` แทนที่จะเป็น `product.images[0]`
- ใช้ `product.stock` แทนที่จะเป็น `product.stock_quantity`
- ใช้ `product.status` แทนที่จะเป็น `product.is_active`

#### การแก้ไข:
- เปลี่ยน `order.users.name` → `${order.users.first_name} ${order.users.last_name}`
- เปลี่ยน `order.total` → `order.total_amount`
- เปลี่ยน `user.name` → `${user.first_name} ${user.last_name}`
- เปลี่ยน `product.image` → `product.images[0]`
- เปลี่ยน `product.stock` → `product.stock_quantity`
- เปลี่ยน `product.status` → `product.is_active`

### 6. หน้า Admin Dashboard (`src/app/admin/dashboard/page.js`)

#### ปัญหาที่พบ:
- ใช้ `order.users.name` แทนที่จะเป็น `order.users.first_name`, `order.users.last_name`
- ใช้ `order.total` แทนที่จะเป็น `order.total_amount`

#### การแก้ไข:
- เปลี่ยน `order.users.name` → `${order.users.first_name} ${order.users.last_name}`
- เปลี่ยน `order.total` → `order.total_amount`

### 7. หน้า Admin Website Settings (`src/app/admin/website-settings/page.js`) ✅ **ใหม่**

#### การพัฒนา:
- สร้างหน้า Website Settings ที่สมบูรณ์
- เพิ่ม 9 tabs: Homepage, About, Images, Social, Gallery, SEO, Contact, E-commerce, System
- สร้าง API routes สำหรับแต่ละ tab
- สร้างตาราง database สำหรับ settings ต่างๆ

#### API Routes ที่สร้าง:
- `/api/settings/homepage` - หน้าหลัก
- `/api/settings/about` - เกี่ยวกับเรา
- `/api/settings/images` - รูปภาพ
- `/api/settings/social` - Social Media
- `/api/settings/gallery` - แกลเลอรี่
- `/api/settings/seo` - SEO
- `/api/settings/contact` - ติดต่อ
- `/api/settings/ecommerce` - E-commerce
- `/api/settings/system` - ระบบ

#### ตาราง Database ที่สร้าง:
- `homepage_settings` - ตั้งค่าหน้าหลัก
- `about_settings` - ตั้งค่าเกี่ยวกับเรา
- `social_settings` - ตั้งค่า Social Media
- `image_settings` - ตั้งค่ารูปภาพ
- `gallery_settings` - ตั้งค่าแกลเลอรี่
- `seo_settings` - ตั้งค่า SEO
- `contact_settings` - ตั้งค่าติดต่อ
- `ecommerce_settings` - ตั้งค่า E-commerce
- `system_settings` - ตั้งค่าระบบ

## สรุปการเปลี่ยนแปลงทั้งหมด

### ชื่อคอลัมน์ที่เปลี่ยนแปลง:

#### Users Table:
- `name` → `first_name`, `last_name`
- `status` → `is_active`
- `password` → `password_hash`

#### Products Table:
- `stock` → `stock_quantity`
- `status` → `is_active`
- `image` → `images` (array)

#### Orders Table:
- `total` → `total_amount`

#### Coupons Table:
- `type` → `discount_type`
- `value` → `discount_value`
- `min_amount` → `min_order_amount`
- `used_count` → `current_usage`
- `expires_at` → `valid_until`
- `status` → `is_active`

#### Events Table:
- `title` → `name`
- `event_date` → `date`
- `image` → `image_url`
- `status` → `is_active`

#### Courses Table:
- `title` → `name`
- `image` → `image_url`
- `status` → `is_active`

### หน้า Frontend ที่แก้ไข:

1. ✅ **`src/app/(auth)/register/page.js`** - แก้ไข form fields
2. ✅ **`src/app/admin/course/page.js`** - แก้ไข form และ table
3. ✅ **`src/app/admin/event/page.js`** - แก้ไข form และ table
4. ✅ **`src/app/admin/coupons/page.js`** - แก้ไข form และ table
5. ✅ **`src/app/admin/reports/page.js`** - แก้ไข table display
6. ✅ **`src/app/admin/dashboard/page.js`** - แก้ไข table display
7. ✅ **`src/app/admin/website-settings/page.js`** - สร้างใหม่สมบูรณ์

### API Routes ที่ตรงกัน:

1. ✅ **`/api/auth/register`** - รับ `first_name`, `last_name`, `email`, `password`, `phone`
2. ✅ **`/api/course`** - ใช้ `name`, `image_url`, `is_active`
3. ✅ **`/api/event`** - ใช้ `name`, `date`, `image_url`, `is_active`, `price`
4. ✅ **`/api/coupons`** - ใช้ `discount_type`, `discount_value`, `min_order_amount`, `valid_until`, `is_active`
5. ✅ **`/api/analytics`** - ใช้ `total_amount`, `is_active`
6. ✅ **`/api/reports`** - ใช้ `total_amount`, `first_name`, `last_name`, `stock_quantity`, `is_active`
7. ✅ **`/api/settings/*`** - 9 API routes สำหรับ website settings

### ไฟล์ SQL ที่สร้าง:

1. ✅ **`website_settings_tables.sql`** - ตาราง settings ต่างๆ
2. ✅ **`database_schema.sql`** - Schema หลัก
3. ✅ **`supabase_migration.sql`** - Migration สำหรับ Supabase

## สถานะการทำงาน

✅ **เสร็จสิ้น**: Frontend ทั้งหมดตรงกับ API และ Database Schema
✅ **เสร็จสิ้น**: การแก้ไขชื่อคอลัมน์ทั้งหมด
✅ **เสร็จสิ้น**: การอัปเดต form fields และ table columns
✅ **เสร็จสิ้น**: การแก้ไข data display ให้ตรงกับโครงสร้างใหม่
✅ **เสร็จสิ้น**: Website Settings ครบถ้วน 9 tabs
✅ **เสร็จสิ้น**: API Routes สำหรับ settings ทั้งหมด
✅ **เสร็จสิ้น**: Database tables สำหรับ settings

## ขั้นตอนต่อไป

1. รันคำสั่ง SQL ใน Supabase เพื่อสร้างตาราง settings
2. ทดสอบการทำงานของ website settings ทั้งหมด
3. ตรวจสอบการเชื่อมต่อกับ API
4. ทดสอบการแสดงข้อมูลในตารางต่างๆ
5. ตรวจสอบการทำงานของ form validation

---

**หมายเหตุ**: การแก้ไขทั้งหมดนี้ทำให้ frontend ตรงกับ API และ database schema ที่กำหนดไว้ และเพิ่มระบบ Website Settings ที่สมบูรณ์
