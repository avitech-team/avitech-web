# สรุปการแก้ไข API ให้ตรงกับโครงสร้างฐานข้อมูล

## การเปลี่ยนแปลงหลัก

### 1. ชื่อคอลัมน์ที่เปลี่ยนแปลง

#### Users Table
- `name` → `first_name`, `last_name`
- `status` → `is_active`
- `password` → `password_hash`

#### Products Table
- `stock` → `stock_quantity`
- `status` → `is_active`
- `image` → `images` (array)

#### Orders Table
- `total` → `total_amount`

#### Coupons Table
- `type` → `discount_type`
- `value` → `discount_value`
- `min_amount` → `min_order_amount`
- `used_count` → `current_usage`
- `expires_at` → `valid_until`
- `status` → `is_active`

#### Events Table
- `title` → `name`
- `event_date` → `date`

#### Courses Table
- `title` → `name`

### 2. API Routes ที่แก้ไข

#### ✅ แก้ไขแล้ว (ล่าสุด)
1. **`src/app/api/auth/register/route.js`**
   - เปลี่ยน `name` → `first_name`, `last_name`
   - เปลี่ยน `password` → `password_hash`
   - เปลี่ยน `status` → `is_active`

2. **`src/app/api/auth/setup-admin/route.js`**
   - เปลี่ยน `name` → `first_name`, `last_name`
   - เปลี่ยน `password` → `password_hash`
   - เปลี่ยน `status` → `is_active`

3. **`src/app/api/auth/reset/route.js`**
   - เปลี่ยน `password` → `password_hash`
   - ปรับปรุง error handling และ validation

4. **`src/app/api/auth/change-password/route.js`**
   - เปลี่ยน `password` → `password_hash`
   - เพิ่ม proper authentication และ validation

5. **`src/app/api/users/route.js`**
   - เปลี่ยน `name` → `first_name`, `last_name`
   - เปลี่ยน `password` → `password_hash`
   - เปลี่ยน `status` → `is_active`
   - ปรับปรุง filtering และ pagination

#### ✅ แก้ไขแล้วก่อนหน้านี้
6. **`src/app/api/analytics/route.js`**
   - เปลี่ยน `total` → `total_amount`
   - เปลี่ยน `status` → `is_active`

7. **`src/app/api/reports/route.js`**
   - เปลี่ยน `total` → `total_amount`
   - เปลี่ยน `name` → `first_name`, `last_name`
   - เปลี่ยน `stock` → `stock_quantity`
   - เปลี่ยน `status` → `is_active`

8. **`src/app/api/checkout/route.js`**
   - เปลี่ยน `stock` → `stock_quantity`
   - เปลี่ยน `status` → `is_active`
   - เปลี่ยน `type` → `discount_type`
   - เปลี่ยน `value` → `discount_value`
   - เปลี่ยน `min_amount` → `min_order_amount`
   - เปลี่ยน `used_count` → `current_usage`
   - เปลี่ยน `expires_at` → `valid_until`

9. **`src/app/api/seed/route.js`**
   - เปลี่ยน `stock` → `stock_quantity`
   - เปลี่ยน `type` → `discount_type`
   - เปลี่ยน `value` → `discount_value`
   - เปลี่ยน `min_amount` → `min_order_amount`
   - เปลี่ยน `used_count` → `current_usage`
   - เปลี่ยน `expires_at` → `valid_until`
   - เปลี่ยน `title` → `name` (events, courses)

10. **`src/app/api/migrate/route.js`**
    - อัปเดต SQL schema ให้ตรงกับโครงสร้างใหม่
    - เพิ่ม `cart_items` table
    - แก้ไขชื่อคอลัมน์ทั้งหมด

11. **`src/app/api/cart/route.js`**
    - เปลี่ยน `image` → `images`
    - เปลี่ยน `stock` → `stock_quantity`
    - เปลี่ยน `status` → `is_active`

12. **`src/app/api/auth/me/route.js`**
    - เปลี่ยน `name` → `first_name`, `last_name`
    - เปลี่ยน `status` → `is_active`

13. **`src/app/api/coupons/validate/route.js`**
    - เปลี่ยน `status` → `is_active`
    - เปลี่ยน `type` → `discount_type`
    - เปลี่ยน `value` → `discount_value`
    - เปลี่ยน `min_amount` → `min_order_amount`
    - เปลี่ยน `used_count` → `current_usage`
    - เปลี่ยน `expires_at` → `valid_until`

#### ✅ แก้ไขแล้วก่อนหน้านี้
14. **`src/app/api/users/route.js`** (แก้ไขแล้ว)
15. **`src/app/api/products/route.js`**
16. **`src/app/api/orders/route.js`**
17. **`src/app/api/categories/route.js`**
18. **`src/app/api/brands/route.js`**
19. **`src/app/api/coupons/route.js`**
20. **`src/app/api/auth/login/route.js`**
21. **`src/app/api/course/route.js`**
22. **`src/app/api/event/route.js`**
23. **`src/app/api/settings/route.js`**
24. **`src/app/api/settings/homepage/route.js`**
25. **`src/app/api/migrate/*.js`** (ทั้งหมด)

### 3. การเปลี่ยนแปลงในโครงสร้างข้อมูล

#### ตารางใหม่ที่เพิ่ม
- `cart_items` - ตารางตะกร้าสินค้า

#### คอลัมน์ใหม่ที่เพิ่ม
- `users.website_url` - URL เว็บไซต์ของแบรนด์
- `events.price` - ราคาอีเวนต์
- `courses.price` - ราคาคอร์ส (default 0)

#### คอลัมน์ที่ลบออก
- `products.sku` - ลบออกจาก seed data

### 4. การปรับปรุงฟังก์ชันการทำงาน

#### Authentication
- แก้ไข `verifyAdmin` function ให้ consistent กันทุก API
- เพิ่ม `if (!admin)` check ในทุก API route
- ปรับปรุง `verifyToken` function

#### Error Handling
- ปรับปรุง error messages ให้ชัดเจนขึ้น
- เพิ่ม proper error logging
- เพิ่ม validation สำหรับข้อมูล input

#### Data Validation
- เพิ่มการตรวจสอบข้อมูลก่อนบันทึก
- ปรับปรุง validation logic
- เพิ่มการตรวจสอบความยาวรหัสผ่าน

### 5. การเปลี่ยนแปลงใน Response Format

#### Users
```javascript
// เก่า
{ name: "John Doe" }

// ใหม่
{ first_name: "John", last_name: "Doe" }
```

#### Products
```javascript
// เก่า
{ stock: 10, status: true }

// ใหม่
{ stock_quantity: 10, is_active: true }
```

#### Orders
```javascript
// เก่า
{ total: 1000 }

// ใหม่
{ total_amount: 1000 }
```

#### Coupons
```javascript
// เก่า
{ type: "percentage", value: 10, min_amount: 1000 }

// ใหม่
{ discount_type: "percentage", discount_value: 10, min_order_amount: 1000 }
```

### 6. ไฟล์ SQL ที่อัปเดต

1. **`database_schema.sql`** - ไฟล์สมบูรณ์สำหรับสร้างฐานข้อมูล
2. **`supabase_migration.sql`** - ไฟล์สำหรับ Supabase

### 7. สถานะการทำงาน

✅ **เสร็จสิ้น**: API ทั้งหมดได้รับการแก้ไขให้ตรงกับโครงสร้างฐานข้อมูลใหม่
✅ **เสร็จสิ้น**: การแก้ไขปัญหา "Unauthorized" ในทุก API routes
✅ **เสร็จสิ้น**: การแก้ไขปัญหา "Could not find the 'status' column" ใน register API
✅ **เสร็จสิ้น**: การเพิ่มฟีเจอร์ filtering, sorting, pagination ใน admin pages
✅ **เสร็จสิ้น**: การสร้างไฟล์ SQL สำหรับฐานข้อมูล

### 8. ขั้นตอนต่อไป

1. รันคำสั่ง SQL ใน Supabase เพื่อสร้างฐานข้อมูล
2. ทดสอบการทำงานของ API ทั้งหมด
3. อัปเดต frontend components ให้ตรงกับ API response ใหม่
4. ทดสอบระบบทั้งหมด

### 9. การแก้ไขปัญหา Error ที่เกิดขึ้น

#### Error: "Could not find the 'status' column of 'users'"
- **สาเหตุ**: API register ยังใช้ชื่อคอลัมน์เก่า `status` แทน `is_active`
- **การแก้ไข**: เปลี่ยน `status` → `is_active` ในทุก API routes ที่เกี่ยวข้อง

#### Error: "Unauthorized"
- **สาเหตุ**: Inconsistent `verifyAdmin` function และ missing null checks
- **การแก้ไข**: Standardize `verifyAdmin` function และเพิ่ม `if (!admin)` checks

---

**หมายเหตุ**: การแก้ไขทั้งหมดนี้ทำให้ API routes ตรงกับโครงสร้างฐานข้อมูลที่กำหนดไว้ และแก้ไขปัญหา authentication และ database schema ที่เกิดขึ้นก่อนหน้านี้
