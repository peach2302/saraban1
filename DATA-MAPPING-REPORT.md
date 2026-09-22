# 📊 PHASE 1B — DATA MAPPING REPORT

**Generated:** 2026
**Spreadsheet ID:** 1JDfRSCQJy7bsNgONUztTaNc-ucNuKkJadOSUah7Gpes
**Status:** PARTIAL — สามารถเข้าถึง Sheet "Users" ได้ แต่ไม่สามารถค้นหารายชื่อ Sheet อื่นๆ ได้ผ่าน Public API

---

## 1. Spreadsheet Information

| รายการ | ค่า |
|--------|-----|
| **Spreadsheet ID** | 1JDfRSCQJy7bsNgONUztTaNc-ucNuKkJadOSUah7Gpes |
| **Spreadsheet URL** | https://docs.google.com/spreadsheets/d/1JDfRSCQJy7bsNgONUztTaNc-ucNuKkJadOSUah7Gpes/edit |
| **Access Type** | Public (ผ่าน gviz endpoint) |
| **Connection Status** | ✅ CONNECTED |
| **Sheets Discovered** | 1 (Users) |
| **Sheets Expected** | 10 (ตาม requirement) |

---

## 2. Sheet Inventory

### Sheets ที่เข้าถึงได้

| # | Sheet Name | Status | Rows | Columns | Notes |
|---|------------|--------|-----:|--------:|-------|
| 1 | Users | ✅ ACCESSIBLE | 8 | 11 | ข้อมูลครบถ้วน |

### Sheets ที่ไม่สามารถเข้าถึงได้

**หมายเหตุ:** ไม่สามารถค้นหารายชื่อ Sheet อื่นๆ ได้ผ่าน Public API เนื่องจาก gviz endpoint จะ return ข้อมูลของ Sheet แรกเสมอเมื่อไม่พบ Sheet ที่ระบุ

**Sheet ที่คาดว่าจะมี (ตาม requirement):**
- ❓ Documents / หนังสือรับ / หนังสือส่ง
- ❓ Departments / แผนก
- ❓ Positions / ตำแหน่ง
- ❓ Units / งาน
- ❓ AuditLog
- ❓ Workflow
- ❓ Config
- ❓ อื่นๆ (รวมแล้วควรเป็น 10 Sheets)

**วิธีค้นหารายชื่อ Sheet ทั้งหมด:**
1. ใช้ Service Account credentials (แนะนำ)
2. เปิด Spreadsheet ใน browser และดูที่แท็บด้านล่าง
3. ใช้ Google Sheets API with authentication

---

## 3. Sheet: Users — Column Mapping

### Headers (11 Columns)

| # | Google Sheet Column | Application Field | Type (Inferred) | Required | Description |
|---|---------------------|-------------------|-----------------|----------|-------------|
| 1 | User_ID | userId | string (identifier) | ✅ Yes | รหัสผู้ใช้งาน (Primary Key) |
| 2 | ชื่อ-สกุล | fullName | string | ✅ Yes | ชื่อ-นามสกุลผู้ใช้งาน |
| 3 | Position_ID | positionId | string (identifier) | ✅ Yes | รหัสตำแหน่ง (Foreign Key → Positions) |
| 4 | ตำแหน่ง | positionName | string | ❓ No | ชื่อตำแหน่ง (Denormalized) |
| 5 | Department_ID | departmentId | string (identifier) | ✅ Yes | รหัสแผนก (Foreign Key → Departments) |
| 6 | Unit_ID | unitId | string (identifier) | ❌ No | รหัสงาน (Foreign Key → Units, Optional) |
| 7 | Role | role | string (enum) | ✅ Yes | บทบาทผู้ใช้งาน |
| 8 | Email | email | string (email) | ✅ Yes | อีเมลผู้ใช้งาน |
| 9 | สถานะ | status | string (enum) | ✅ Yes | สถานะผู้ใช้งาน |
| 10 | Can_View_All | canViewAll | boolean | ✅ Yes | สิทธิ์ดูข้อมูลทั้งหมด |
| 11 | Can_Sign | canSign | boolean | ✅ Yes | สิทธิ์ลงนามเอกสาร |

---

## 4. Sample Data (Users Sheet)

**หมายเหตุ:** ข้อมูลด้านล่างเป็นข้อมูลตัวอย่างที่ปรากฏใน Google Sheets (อาจเป็น test data)

| User_ID | ชื่อ-สกุล | Position_ID | ตำแหน่ง | Department_ID | Unit_ID | Role | Email | สถานะ | Can_View_All | Can_Sign |
|---------|-----------|-------------|----------|---------------|---------|------|-------|-------|--------------|----------|
| U001 | นายปรีชา กุมภิโร | P001 | นายกเทศมนตรี | D001 | | MAYOR | t***@example.com | ใช้งาน | ✔ | ✔ |
| U002 | ปลัดเทศบาลทดสอบ | P002 | ปลัดเทศบาล | D001 | | CLERK | t***@example.com | ใช้งาน | ✔ | ✔ |
| U003 | หัวหน้าสำนักปลัดทดสอบ | P003 | หัวหน้าสำนักปลัด | D002 | | OFFICE_HEAD | t***@example.com | ใช้งาน | ✗ | ✔ |
| U004 | ผู้อำนวยการกองช่างทดสอบ | P004 | ผู้อำนวยการกองช่าง | D003 | | DIVISION_HEAD | t***@example.com | ใช้งาน | ✗ | ✔ |
| U005 | ผู้อำนวยการกองคลังทดสอบ | P005 | ผู้อำนวยการกองคลัง | D004 | | DIVISION_HEAD | t***@example.com | ใช้งาน | ✗ | ✔ |
| U006 | ส.ต.ท.ทศพล จักสาน | P008 | นักจัดการงานเทศกิจชำนาญการ | D002 | UNT0015 | STAFF_HEAD | t***@example.com | ใช้งาน | ✗ | ✔ |
| U007 | เจ้าหน้าที่ทดสอบ | P009 | เจ้าหน้าที่ | D002 | UNT0015 | STAFF | t***@example.com | ใช้งาน | ✗ | ✗ |
| U008 | ธุรการกลางทดสอบ | P010 | ธุรการกลาง | D002 | | ADMIN | t***@example.com | ใช้งาน | ✗ | ✗ |

**หมายเหตุ:** Email ถูกปิดบังเพื่อความเป็นส่วนตัว (แสดงเฉพาะ t***@example.com)

---

## 5. Data Type Analysis

### Users Sheet

| Column | Inferred Type | Evidence | Confidence |
|--------|---------------|----------|------------|
| User_ID | string (identifier) | รูปแบบ U001, U002, ... | HIGH |
| ชื่อ-สกุล | string | ข้อความภาษาไทย | HIGH |
| Position_ID | string (identifier) | รูปแบบ P001, P002, ... | HIGH |
| ตำแหน่ง | string | ข้อความภาษาไทย | HIGH |
| Department_ID | string (identifier) | รูปแบบ D001, D002, ... | HIGH |
| Unit_ID | string (identifier) | รูปแบบ UNT0015, ว่าง | MEDIUM |
| Role | string (enum) | MAYOR, CLERK, OFFICE_HEAD, ... | HIGH |
| Email | string (email) | รูปแบบ xxx@example.com | HIGH |
| สถานะ | string (enum) | "ใช้งาน" (ค่าเดียวที่พบ) | MEDIUM |
| Can_View_All | boolean | ✔ / ✗ | HIGH |
| Can_Sign | boolean | ✔ / ✗ | HIGH |

---

## 6. Primary Key Candidates

### Users Sheet

| Column | Status | Evidence |
|--------|--------|----------|
| **User_ID** | ✅ **CONFIRMED** | ค่าไม่ซ้ำ (U001-U008), ไม่ว่าง, รูปแบบสม่ำเสมอ |

---

## 7. Foreign Key Candidates

### Users Sheet

| Column | Target Sheet | Target Column | Status | Evidence |
|--------|--------------|---------------|--------|----------|
| Position_ID | Positions (คาดว่า) | Position_ID | ⚠️ NOT VERIFIED | รูปแบบ P001, P002, ... แต่ยังไม่เห็น Sheet Positions |
| Department_ID | Departments (คาดว่า) | Department_ID | ⚠️ NOT VERIFIED | รูปแบบ D001, D002, ... แต่ยังไม่เห็น Sheet Departments |
| Unit_ID | Units (คาดว่า) | Unit_ID | ⚠️ NOT VERIFIED | รูปแบบ UNT0015, แต่ยังไม่เห็น Sheet Units |

**หมายเหตุ:** ไม่สามารถยืนยัน Foreign Key ได้เนื่องจากยังไม่เห็น Sheet เป้าหมาย

---

## 8. Relationships

### Confirmed Relationships

❌ **ไม่มี** — ยังไม่สามารถยืนยันความสัมพันธ์ได้เนื่องจากเห็นเพียง Sheet "Users"

### Potential Relationships (จากข้อมูล Users)

| From Sheet | Column | To Sheet (Expected) | Target Column | Status |
|------------|--------|---------------------|---------------|--------|
| Users | Position_ID | Positions | Position_ID | ⚠️ NOT VERIFIED |
| Users | Department_ID | Departments | Department_ID | ⚠️ NOT VERIFIED |
| Users | Unit_ID | Units | Unit_ID | ⚠️ NOT VERIFIED |

---

## 9. Enum Values Discovery

### Role Values (จาก Users Sheet)

| Value | Count | Description |
|-------|-------|-------------|
| MAYOR | 1 | นายกเทศมนตรี |
| CLERK | 1 | ปลัดเทศบาล |
| OFFICE_HEAD | 1 | หัวหน้าสำนักปลัด |
| DIVISION_HEAD | 2 | ผู้อำนวยการกอง |
| STAFF_HEAD | 1 | หัวหน้างาน |
| STAFF | 1 | เจ้าหน้าที่ |
| ADMIN | 1 | ธุรการกลาง |

**Total Unique Roles:** 7

### Status Values (จาก Users Sheet)

| Value | Count | Description |
|-------|-------|-------------|
| ใช้งาน | 8 | กำลังใช้งาน |

**Total Unique Status:** 1 (อาจมีค่าอื่นเช่น "ระงับ", "ลบ" แต่ยังไม่พบ)

### Can_View_All Values

| Value | Count | Description |
|-------|-------|-------------|
| ✔ | 2 | สามารถดูข้อมูลทั้งหมด |
| ✗ | 6 | ไม่สามารถดูข้อมูลทั้งหมด |

### Can_Sign Values

| Value | Count | Description |
|-------|-------|-------------|
| ✔ | 5 | สามารถลงนาม |
| ✗ | 3 | ไม่สามารถลงนาม |

---

## 10. Users Authentication Readiness

### Authentication Identity Source

| Field | Column | Status | Notes |
|-------|--------|--------|-------|
| **User ID** | User_ID | ✅ FOUND | ใช้เป็น unique identifier |
| **Email** | Email | ✅ FOUND | ใช้สำหรับ login |
| **Full Name** | ชื่อ-สกุล | ✅ FOUND | ใช้สำหรับ display |

### Authorization Source

| Field | Column | Status | Notes |
|-------|--------|--------|-------|
| **Role** | Role | ✅ FOUND | ใช้สำหรับ RBAC |
| **Can_View_All** | Can_View_All | ✅ FOUND | ใช้สำหรับ permission |
| **Can_Sign** | Can_Sign | ✅ FOUND | ใช้สำหรับ signing permission |
| **Status** | สถานะ | ✅ FOUND | ใช้สำหรับ active/inactive |

### Password Source

| Item | Status | Notes |
|------|--------|-------|
| **Password Column** | ❌ **NOT PRESENT IN GOOGLE SHEETS** | ไม่มี column สำหรับ password |
| **Password Storage** | ⚠️ **UNKNOWN** | ต้องตัดสินใจว่าจะเก็บ password ที่ไหน |

**ตัวเลือกสำหรับ Password Storage:**
1. เพิ่ม column ใน Users sheet (ไม่แนะนำ — ไม่ปลอดภัย)
2. ใช้ separate sheet สำหรับ credentials (แนะนำ)
3. ใช้ external authentication service (เช่น Firebase Auth, Auth0)
4. ใช้ hashed password ใน database แยก

### User Status Source

| Field | Column | Values Found |
|-------|--------|--------------|
| **Status** | สถานะ | "ใช้งาน" (ค่าเดียวที่พบ) |

**หมายเหตุ:** อาจมีค่าอื่นเช่น "ระงับ", "ลบ", "รอการอนุมัติ" แต่ยังไม่พบในข้อมูล

### Role Source

| Field | Column | Values Found |
|-------|--------|--------------|
| **Role** | Role | MAYOR, CLERK, OFFICE_HEAD, DIVISION_HEAD, STAFF_HEAD, STAFF, ADMIN |

---

## 11. Organization Structure (จากข้อมูล Users)

### Departments (จาก Department_ID)

| Department_ID | Name (จาก ตำแหน่ง) | Users Count |
|---------------|---------------------|------------:|
| D001 | ระดับบริหาร (นายก, ปลัด) | 2 |
| D002 | สำนักปลัด | 4 |
| D003 | กองช่าง | 1 |
| D004 | กองคลัง | 1 |

**หมายเหตุ:** ชื่อแผนกอนุมานจากตำแหน่ง ไม่ใช่จาก Sheet Departments โดยตรง

### Units (จาก Unit_ID)

| Unit_ID | Users Count |
|---------|------------:|
| UNT0015 | 2 |
| (ว่าง) | 6 |

**หมายเหตุ:** มีเพียง 1 Unit ID ที่พบ และผู้ใช้ส่วนใหญ่ไม่มี Unit_ID

---

## 12. Unknown / Unverified Items

### Sheets ที่ยังไม่เห็น

| # | Expected Sheet | Status | Notes |
|---|----------------|--------|-------|
| 1 | Documents / หนังสือรับ / หนังสือส่ง | ❓ UNKNOWN | ไม่สามารถเข้าถึงได้ |
| 2 | Departments | ❓ UNKNOWN | ไม่สามารถเข้าถึงได้ |
| 3 | Positions | ❓ UNKNOWN | ไม่สามารถเข้าถึงได้ |
| 4 | Units | ❓ UNKNOWN | ไม่สามารถเข้าถึงได้ |
| 5 | AuditLog | ❓ UNKNOWN | ไม่สามารถเข้าถึงได้ |
| 6 | Workflow | ❓ UNKNOWN | ไม่สามารถเข้าถึงได้ |
| 7 | Config | ❓ UNKNOWN | ไม่สามารถเข้าถึงได้ |
| 8-10 | อื่นๆ | ❓ UNKNOWN | ไม่ทราบชื่อ |

### Data ที่ยังไม่ยืนยัน

| Item | Status | Notes |
|------|--------|-------|
| Password storage location | ❓ UNKNOWN | ไม่มี password column ใน Users |
| Status values ทั้งหมด | ❓ UNKNOWN | พบแค่ "ใช้งาน" |
| Department names | ❓ UNKNOWN | อนุมานจากตำแหน่ง |
| Unit names | ❓ UNKNOWN | มีแค่ UNT0015 |
| Position details | ❓ UNKNOWN | มีแค่ ID และชื่อ |

---

## 13. Risks / Problems

### 🔴 Critical Issues

| # | Issue | Impact | Mitigation |
|---|-------|--------|------------|
| 1 | ไม่สามารถเข้าถึง Sheet อื่นๆ ได้ | ไม่เห็นโครงสร้างทั้งหมด | ใช้ Service Account credentials |
| 2 | ไม่มี Password column | ไม่สามารถทำ authentication ได้ | ตัดสินใจเรื่อง password storage |
| 3 | ไม่เห็น Sheet Departments, Positions, Units | ไม่สามารถยืนยัน relationships | ต้องเข้าถึง sheet เหล่านี้ |

### 🟡 Medium Issues

| # | Issue | Impact | Mitigation |
|---|-------|--------|------------|
| 1 | ข้อมูลเป็น test data | อาจไม่สะท้อนโครงสร้างจริง | ตรวจสอบกับข้อมูลจริง |
| 2 | Status มีค่าเดียว | อาจมีค่าอื่นที่ยังไม่เห็น | ตรวจสอบกับผู้ใช้ |
| 3 | Unit_ID ส่วนใหญ่ว่าง | อาจไม่จำเป็น หรือมีค่าอื่น | ตรวจสอบ requirement |

### 🟢 Low Issues

| # | Issue | Impact | Mitigation |
|---|-------|--------|------------|
| 1 | Email เป็น test@example.com | ไม่ใช่ข้อมูลจริง | ใช้ข้อมูลจริงเมื่อ deploy |
| 2 | ชื่อเป็น "ทดสอบ" | ไม่ใช่ข้อมูลจริง | ใช้ข้อมูลจริงเมื่อ deploy |

---

## 14. Security Observations

### ✅ Positive

- ไม่มี sensitive data ใน Sheet (เป็น test data)
- Email ถูกปิดบังในรายงาน
- ไม่มี password ใน Sheet

### ⚠️ Concerns

- Spreadsheet เป็น public access (ใครก็เข้าถึงได้)
- ไม่มี authentication สำหรับเข้าถึง data
- ต้องตัดสินใจเรื่อง password storage

### 🔒 Recommendations

1. **เปลี่ยน Spreadsheet เป็น private** และใช้ Service Account
2. **เพิ่ม Password column** หรือใช้ separate authentication system
3. **เพิ่ม Audit trail** สำหรับ tracking การเข้าถึง
4. **ใช้ HTTPS** สำหรับทุก API calls
5. **Implement RBAC** ตาม Role ที่พบ

---

## 15. Next Steps

### Immediate Actions (ต้องทำก่อน Phase 2)

1. **เข้าถึง Sheet อื่นๆ**
   - ใช้ Service Account credentials
   - หรือเปิด Spreadsheet ใน browser เพื่อดูรายชื่อ Sheet
   - หรือขอให้เจ้าของ Spreadsheet แชร์รายชื่อ Sheet

2. **ตัดสินใจเรื่อง Password Storage**
   - เพิ่ม column ใน Users sheet?
   - ใช้ separate sheet?
   - ใช้ external service?

3. **ยืนยันโครงสร้างข้อมูล**
   - ตรวจสอบว่าข้อมูลเป็น test data หรือข้อมูลจริง
   - ตรวจสอบกับผู้ใช้ว่าโครงสร้างถูกต้อง

### Phase 2 Preparation

1. **Authentication System**
   - ใช้ Email + Password (ต้องตัดสินใจเรื่อง password storage)
   - หรือใช้ external authentication

2. **Authorization System**
   - ใช้ Role-based access control (RBAC)
   - ใช้ Can_View_All และ Can_Sign permissions

3. **Data Access Layer**
   - สร้าง repository สำหรับแต่ละ Sheet
   - Implement caching (ถ้าจำเป็น)

---

## 16. Summary

### สิ่งที่ทราบแล้ว

✅ **Spreadsheet ID:** 1JDfRSCQJy7bsNgONUztTaNc-ucNuKkJadOSUah7Gpes

✅ **Users Sheet Structure:**
- 11 columns
- 8 rows (test data)
- Primary Key: User_ID
- Foreign Keys: Position_ID, Department_ID, Unit_ID (ยังไม่ยืนยัน)
- Roles: 7 values
- Status: 1 value (ใช้งาน)

✅ **Authentication Readiness:**
- User ID: ✅ Available
- Email: ✅ Available
- Role: ✅ Available
- Status: ✅ Available
- Password: ❌ Not present

### สิ่งที่ยังไม่ทราบ

❌ **รายชื่อ Sheet อื่นๆ** (คาดว่า 9 sheets)

❌ **โครงสร้าง Sheet อื่นๆ** (Documents, Departments, Positions, Units, etc.)

❌ **Relationships** (ยังไม่ยืนยัน)

❌ **Password storage location**

### สถานะ Phase 1B

**STATUS: ⏸️ PARTIAL — สามารถเข้าถึง Users Sheet ได้ แต่ต้องการ Service Account credentials เพื่อเข้าถึง Sheet อื่นๆ**

---

## 17. Appendix

### A. วิธีเข้าถึง Sheet อื่นๆ

#### วิธีที่ 1: ใช้ Service Account (แนะนำ)

```bash
cd server
cp .env.example .env
# แก้ไข .env ใส่ credentials
npm install
npm run test:connection
npm run discover:schema
```

#### วิธีที่ 2: เปิด Spreadsheet ใน Browser

1. เปิด https://docs.google.com/spreadsheets/d/1JDfRSCQJy7bsNgONUztTaNc-ucNuKkJadOSUah7Gpes/edit
2. ดูแท็บ Sheet ด้านล่าง
3. จดชื่อ Sheet ทั้งหมด
4. ส่งรายชื่อให้ developer

#### วิธีที่ 3: ใช้ Google Sheets API with OAuth

1. สร้าง OAuth credentials
2. ใช้ OAuth flow เพื่อเข้าถึง
3. ดึง metadata ของ spreadsheet

### B. Role Hierarchy (อนุมาน)

```
MAYOR (นายกเทศมนตรี)
  └─ CLERK (ปลัดเทศบาล)
       ├─ OFFICE_HEAD (หัวหน้าสำนักปลัด)
       │    └─ STAFF_HEAD (หัวหน้างาน)
       │         └─ STAFF (เจ้าหน้าที่)
       ├─ DIVISION_HEAD (ผู้อำนวยการกอง)
       │    └─ STAFF_HEAD (หัวหน้างาน)
       │         └─ STAFF (เจ้าหน้าที่)
       └─ ADMIN (ธุรการกลาง)
```

**หมายเหตุ:** นี่คือลำดับชั้นที่อนุมานจากข้อมูล อาจไม่ถูกต้อง 100%

### C. Permission Matrix (อนุมาน)

| Role | Can_View_All | Can_Sign | Notes |
|------|--------------|----------|-------|
| MAYOR | ✔ | ✔ | ดูได้ทั้งหมด, ลงนามได้ |
| CLERK | ✔ | ✔ | ดูได้ทั้งหมด, ลงนามได้ |
| OFFICE_HEAD | ✗ | ✔ | ดูเฉพาะแผนก, ลงนามได้ |
| DIVISION_HEAD | ✗ | ✔ | ดูเฉพาะกอง, ลงนามได้ |
| STAFF_HEAD | ✗ | ✔ | ดูเฉพาะงาน, ลงนามได้ |
| STAFF | ✗ | ✗ | ดูเฉพาะตัวเอง, ลงนามไม่ได้ |
| ADMIN | ✗ | ✗ | ธุรการ, ลงนามไม่ได้ |

**หมายเหตุ:** นี่คือ permission ที่อนุมานจากข้อมูล อาจไม่ถูกต้อง 100%

---

*รายงานสร้างเมื่อ: Phase 1B — E-Saraban Project*
*สถานะ: PARTIAL — ต้องการ Service Account credentials เพื่อเข้าถึง Sheet อื่นๆ*
