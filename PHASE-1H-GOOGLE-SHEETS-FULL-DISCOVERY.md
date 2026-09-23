# Phase 1H — Google Sheets Full Discovery

## Overview

Phase 1H เป็นขั้นตอนการตรวจสอบและวิเคราะห์โครงสร้างข้อมูลจริงจาก Google Sheets ทั้ง 10 Sheets ของระบบ E-Saraban

**สถานะปัจจุบัน:** ✅ Script สร้างเสร็จแล้ว, ⏳ รอการ Execute

## Script Information

**File:** `server/src/scripts/phase1h-discovery.ts`  
**Lines:** 592  
**Purpose:** อ่านและตรวจสอบข้อมูลจาก Google Sheets ทั้ง 10 Sheets แบบ READ-ONLY

## Features

### 1. Sheet Discovery
- ตรวจสอบว่ามี Sheets ครบ 10 Sheets ที่คาดหวังหรือไม่
- รายงาน Sheets ที่ขาดหายหรือเกินมา
- อ่านข้อมูลจากทุก Sheet ที่มีอยู่

### 2. Column Validation
ตรวจสอบ columns ที่คาดหวังสำหรับแต่ละ Sheet:

**Users (11 columns):**
- User_ID, ชื่อ-สกุล, Position_ID, ตำแหน่ง, Department_ID, Unit_ID, Role, Email, สถานะ, Can_View_All, Can_Sign

**Positions (5 columns):**
- Position_ID, ตำแหน่ง, Department_ID, Role, ลำดับอนุมัติ

**Departments (3 columns):**
- Department_ID, ชื่อหน่วยงาน, สถานะ

**Units (5 columns):**
- Unit_ID, ชื่อฝ่าย/งาน, Department_ID, ประเภท, สถานะ

**Documents (18 columns):**
- Document_ID, ประเภททะเบียน, ประเภทหนังสือ, Incoming_ID, Outgoing_ID, เลขที่หนังสือ, เรื่อง, ลงวันที่, จาก, ถึง, หน่วยงานรับผิดชอบ, งานรับผิดชอบ, ชั้นความลับ, ความเร่งด่วน, สถานะ, File_ID, วันที่สร้าง, ผู้สร้าง

**Incoming (16 columns):**
- Incoming_ID, Document_ID, เลขทะเบียนรับ, เลขที่หนังสือ, ลงวันที่, จาก, ถึง, เรื่อง, หน่วยงานรับผิดชอบ, งานรับผิดชอบ, ชั้นความลับ, ความเร่งด่วน, File_ID, วันที่รับ, ผู้รับหนังสือ, สถานะ

**Outgoing (16 columns):**
- Outgoing_ID, Document_ID, เลขที่หนังสือ, ประเภทหนังสือ, ลงวันที่, จาก, ถึง, เรื่อง, หน่วยงานเจ้าของเรื่อง, งานเจ้าของเรื่อง, ชั้นความลับ, ความเร่งด่วน, File_ID, ผู้จัดทำ, สถานะ, วันที่ส่ง

**Workflow (11 columns):**
- Workflow_ID, Document_ID, ลำดับ, จากผู้ดำเนินการ, ถึงผู้ดำเนินการ, การดำเนินการ, คำสั่ง/ความเห็น, วันที่ส่ง, วันที่รับ, สถานะ, หมายเหตุ

**Signatures (7 columns):**
- Signature_ID, User_ID, ชื่อ-สกุล, ตำแหน่ง, Signature_File_ID, วันที่บันทึก, สถานะ

**AuditLog (6 columns):**
- Audit_ID, Document_ID, การกระทำ, รายละเอียด, วันที่เวลา, IP_Address

### 3. Data Validation

**Users Validation:**
- ตรวจสอบ duplicate User_ID
- ตรวจสอบ missing User_ID
- ตรวจสอบ duplicate Email
- ตรวจสอบ missing Email
- ตรวจสอบ Position_ID references
- ตรวจสอบ Department_ID references
- ตรวจสอบ Unit_ID references
- วิเคราะห์ Role values
- วิเคราะห์ status values
- วิเคราะห์ Can_View_All values (✔/✗)
- วิเคราะห์ Can_Sign values (✔/✗)

**Positions Validation:**
- ตรวจสอบ duplicate Position_ID
- ตรวจสอบ missing Position_ID
- ตรวจสอบ Department_ID references
- วิเคราะห์ Role values
- วิเคราะห์ approval sequence (ลำดับอนุมัติ)

**Departments Validation:**
- ตรวจสอบ duplicate Department_ID
- ตรวจสอบ missing Department_ID
- วิเคราะห์ status values

**Units Validation:**
- ตรวจสอบ duplicate Unit_ID
- ตรวจสอบ blank Unit_ID
- ตรวจสอบ Department_ID references
- วิเคราะห์ status values
- วิเคราะห์ type values

### 4. Relationship Validation

ตรวจสอบ relationships ระหว่าง Sheets:
- Users.Position_ID → Positions.Position_ID
- Users.Department_ID → Departments.Department_ID
- Signatures.User_ID → Users.User_ID
- (และอื่นๆ เมื่อมีข้อมูล)

### 5. Organization Mapping

สร้าง mapping ของโครงสร้างองค์กร:
- Departments → Units → Users
- แสดง relationships ระหว่าง entities
- ระบุ unresolved records

## Expected Output

**File:** `PHASE-1H-DISCOVERY-RESULT.json`

**Structure:**
```json
{
  "timestamp": "2026-...",
  "spreadsheet": {
    "id": "...",
    "title": "..."
  },
  "expectedSheetCount": 10,
  "actualSheetCount": 10,
  "missingExpectedSheets": [],
  "unexpectedSheets": [],
  "sheets": {
    "Users": { ... },
    "Positions": { ... },
    ...
  },
  "users": {
    "data": { ... },
    "validation": {
      "duplicates": 0,
      "missing": 0,
      "invalid": 0,
      "duplicateUserIds": [],
      "missingUserIds": 0,
      "duplicateEmails": [],
      "missingEmails": 0,
      "roleValues": { "MAYOR": 1, "CLERK": 1, ... },
      "statusValues": { "ใช้งาน": 8 },
      "canViewAllValues": { "✔": 2, "✗": 6 },
      "canSignValues": { "✔": 6, "✗": 2 }
    }
  },
  "positions": { ... },
  "departments": { ... },
  "units": { ... },
  "relationships": [
    {
      "from": "Users",
      "fromField": "Position_ID",
      "to": "Positions",
      "toField": "Position_ID",
      "status": "VERIFIED",
      "matchedCount": 8,
      "orphanCount": 0
    }
  ],
  "organizationMapping": {
    "departments": { ... },
    "units": { ... },
    "unresolved": []
  },
  "gaps": [],
  "warnings": [],
  "errors": [],
  "overallStatus": "SUCCESS"
}
```

## Execution Instructions

### Prerequisites

1. **Environment Variables** - ต้องมี `.env` file ที่มี:
   ```env
   GOOGLE_SPREADSHEET_ID=1JDfRSCQJy7bsNgONUztTaNc-ucNuKkJadOSUah7Gpes
   GOOGLE_SERVICE_ACCOUNT_EMAIL=...
   GOOGLE_PRIVATE_KEY=...
   ```

2. **Dependencies** - ต้องติดตั้ง dependencies:
   ```bash
   cd server
   npm install
   ```

3. **Service Account Access** - Service Account ต้องมีสิทธิ์เข้าถึง Google Sheets

### Execution Steps

```bash
# 1. เข้าไปในโฟลเดอร์ server
cd server

# 2. ติดตั้ง dependencies (ถ้ายังไม่ได้ทำ)
npm install

# 3. ตรวจสอบ environment
npm run check:env

# 4. ทดสอบการเชื่อมต่อ
npm run test:connection

# 5. รัน Phase 1H Discovery
npm run phase1h
```

### Expected Console Output

```
═══════════════════════════════════════════════════════════
PHASE 1H — GOOGLE SHEETS FULL DISCOVERY & VALIDATION
E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์
═══════════════════════════════════════════════════════════

📡 Connecting to Google Sheets...
   Spreadsheet ID: 1JDfRSCQ...
   Service Account: saraban@glassy-clarity-509403-v7.iam.gserviceaccount.com

📋 Reading spreadsheet metadata...
✅ Connected successfully!
   Title: E-Saraban Data
   Total Sheets: 10

📄 Reading sheet: Users
   ✅ Headers: 11
   ✅ Data Rows: 8

📄 Reading sheet: Positions
   ✅ Headers: 5
   ✅ Data Rows: 8

... (อ่านทุก sheet)

🔍 Validating sheets...

🔗 Validating relationships...

🏢 Creating organization mapping...

═══════════════════════════════════════════════════════════
DISCOVERY COMPLETE
═══════════════════════════════════════════════════════════

Overall Status: SUCCESS
Expected Sheets: 10
Actual Sheets: 10
Missing Expected: 0
Unexpected: 0
Errors: 0
Warnings: 0
Gaps: 0

✅ Report saved to: PHASE-1H-DISCOVERY-RESULT.json
```

## READ-ONLY Guarantee

Script นี้เป็น **READ-ONLY** เท่านั้น:
- ✅ ใช้ `spreadsheets.get` API
- ✅ ใช้ `values.get` API
- ❌ ไม่ใช้ `values.update`
- ❌ ไม่ใช้ `values.append`
- ❌ ไม่ใช้ `batchUpdate`
- ❌ ไม่แก้ไขข้อมูลใน Google Sheets
- ❌ ไม่เพิ่ม/ลบ/แก้ไข columns หรือ rows

## Important Notes

### Boolean Values
- Can_View_All และ Can_Sign ใช้สัญลักษณ์ `✔` และ `✗`
- Script จะเก็บค่าจริงจาก Sheet (ไม่แปลงเป็น TRUE/FALSE)
- สามารถวิเคราะห์ distribution ของค่าได้

### Empty Sheets
- ถ้า Sheet มี headers แต่ไม่มี data rows จะถูกระบุเป็น `EMPTY`
- ไม่ถือเป็น error
- จะถูกรวมในผลลัพธ์ด้วย

### Missing Columns
- ถ้า Sheet มี columns ไม่ครบตาม expected จะถูกรายงานใน `missingColumns`
- ไม่แก้ไข Sheet
- จะถูกรายงานใน `warnings`

### Relationships
- ถ้าไม่มีข้อมูลเพียงพอ จะถูกระบุเป็น `UNVERIFIED_NO_DATA`
- ไม่ fabricate ข้อมูล
- จะถูกรายงานใน `gaps`

## Troubleshooting

### Error: Missing Google Sheets credentials
```
Missing Google Sheets credentials in .env
```
**Solution:** ตรวจสอบ `.env` file ว่ามี `GOOGLE_SPREADSHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` ครบถ้วน

### Error: Permission denied
```
The caller does not have permission
```
**Solution:** ตรวจสอบว่า Service Account มีสิทธิ์เข้าถึง Google Sheets (ต้อง share spreadsheet กับ service account email)

### Error: Spreadsheet not found
```
Requested entity was not found
```
**Solution:** ตรวจสอบว่า `GOOGLE_SPREADSHEET_ID` ถูกต้อง

## Next Steps

หลังจาก execute script สำเร็จ:

1. **ตรวจสอบผลลัพธ์** - เปิด `PHASE-1H-DISCOVERY-RESULT.json`
2. **วิเคราะห์ gaps** - ตรวจสอบว่ามีข้อมูลขาดหายหรือไม่
3. **ตรวจสอบ relationships** - ยืนยันว่า relationships ถูกต้อง
4. **เตรียม Phase 2** - ใช้ข้อมูลจากการ discovery เพื่อออกแบบ authentication

## Status

- ✅ Script สร้างเสร็จแล้ว
- ⏳ รอการ Execute จาก Project Owner
- ⏳ รอผลลัพธ์จริงจาก Google Sheets

**หมายเหตุ:** Script นี้ยังไม่ถูก execute ใน environment นี้ ต้อง execute บนเครื่อง local ของ Project Owner เท่านั้น
