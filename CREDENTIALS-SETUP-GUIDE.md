# คู่มือการตั้งค่า Google Cloud Credentials

## สถานะปัจจุบัน

✅ **Spreadsheet ID:** `1JDfRSCQJy7bsNgONUztTaNc-ucNuKkJadOSUah7Gpes` (ทราบแล้ว)

❌ **Service Account Email:** ยังไม่ได้ตั้งค่า

❌ **Private Key:** ยังไม่ได้ตั้งค่า

---

## ทำไมต้องมี Service Account?

Google Sheets ต้องการ authentication เพื่อเข้าถึงข้อมูล ระบบ E-Saraban ใช้ **Service Account** ซึ่งเป็น:
- บัญชีพิเศษสำหรับ application (ไม่ใช่ user)
- ไม่ต้อง login ด้วย browser
- ปลอดภัยกว่าการใช้ user credentials
- เหมาะกับ backend server

---

## ขั้นตอนการตั้งค่า (ทีละขั้นตอน)

### ขั้นตอนที่ 1: สร้าง Google Cloud Project

1. เปิด browser ไปที่: https://console.cloud.google.com/
2. Login ด้วย Google Account ที่มีสิทธิ์เข้าถึง Spreadsheet
3. คลิกที่ dropdown ด้านบน (ข้างๆ "Google Cloud")
4. คลิก **"NEW PROJECT"** หรือ **"โปรเจ็กต์ใหม่"**
5. กรอกข้อมูล:
   - **Project name:** `e-saraban-ponghai` (หรือชื่อที่ต้องการ)
   - **Organization:** เลือก organization (ถ้ามี)
   - **Location:** เลือกได้ (optional)
6. คลิก **"CREATE"** หรือ **"สร้าง"**
7. รอจนสร้างเสร็จ (1-2 นาที)
8. เลือก project ที่สร้างเสร็จแล้วจาก dropdown ด้านบน

---

### ขั้นตอนที่ 2: เปิดใช้งาน Google Sheets API

1. ใน Google Cloud Console คลิกเมนู ☰ (มุมซ้ายบน)
2. ไปที่ **"APIs & Services"** > **"Library"**
3. ในช่องค้นหา พิมพ์: `Google Sheets API`
4. คลิกที่ **"Google Sheets API"**
5. คลิกปุ่ม **"ENABLE"** หรือ **"เปิดใช้งาน"**
6. รอจนเปิดใช้งานเสร็จ

---

### ขั้นตอนที่ 3: สร้าง Service Account

1. ใน Google Cloud Console ไปที่ **"APIs & Services"** > **"Credentials"**
2. คลิกปุ่ม **"+ CREATE CREDENTIALS"** หรือ **"+ สร้างข้อมูลรับรอง"**
3. เลือก **"Service account"** หรือ **"บัญชีบริการ"**
4. กรอกข้อมูล:
   - **Service account name:** `e-saraban-service`
   - **Service account ID:** จะถูกสร้างอัตโนมัติ
   - **Description:** `Service account for E-Saraban document management system`
5. คลิก **"CREATE AND CONTINUE"** หรือ **"สร้างและดำเนินการต่อ"**
6. **Grant this service account access to project:**
   - Role: เลือก **"Basic"** > **"Editor"**
   - หรือเลือก **"Project"** > **"Editor"**
7. คลิก **"CONTINUE"** หรือ **"ดำเนินการต่อ"**
8. **Grant users access to this service account:** ข้ามไป
9. คลิก **"DONE"** หรือ **"เสร็จสิ้น"**

---

### ขั้นตอนที่ 4: สร้าง Key สำหรับ Service Account

1. จะกลับมาที่หน้า Credentials
2. หา Service Account ที่สร้าง (ชื่อ `e-saraban-service`)
3. คลิกที่ชื่อ Service Account
4. ไปที่แท็บ **"KEYS"** หรือ **"คีย์"**
5. คลิก **"ADD KEY"** หรือ **"เพิ่มคีย์"** > **"Create new key"** หรือ **"สร้างคีย์ใหม่"**
6. เลือก **"JSON"**
7. คลิก **"CREATE"** หรือ **"สร้าง"**
8. **ไฟล์ JSON จะถูกดาวน์โหลดมาอัตโนมัติ**
9. **เก็บไฟล์นี้ไว้เป็นความลับ ห้ามแชร์!**

**ตัวอย่างชื่อไฟล์:** `e-saraban-ponghai-abc123def456.json`

---

### ขั้นตอนที่ 5: ดึงข้อมูลจากไฟล์ JSON

เปิดไฟล์ JSON ที่ดาวน์โหลดมา จะเห็นโครงสร้างแบบนี้:

```json
{
  "type": "service_account",
  "project_id": "e-saraban-ponghai",
  "private_key_id": "abc123def456...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "e-saraban-service@e-saraban-ponghai.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

**เก็บค่าเหล่านี้:**

1. **`client_email`** → ใช้เป็น `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - ตัวอย่าง: `e-saraban-service@e-saraban-ponghai.iam.gserviceaccount.com`

2. **`private_key`** → ใช้เป็น `GOOGLE_PRIVATE_KEY`
   - ตัวอย่าง: `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n...\n-----END PRIVATE KEY-----\n`

---

### ขั้นตอนที่ 6: ตั้งค่า Environment Variables

เปิดไฟล์ `.env` ในโฟลเดอร์ root ของ project:

```bash
# Windows
notepad .env

# Mac/Linux
nano .env
# หรือ
code .env
```

แก้ไขค่าเหล่านี้:

```env
# Google Sheets Configuration
GOOGLE_SPREADSHEET_ID=1JDfRSCQJy7bsNgONUztTaNc-ucNuKkJadOSUah7Gpes

# Service Account Email (จากไฟล์ JSON)
GOOGLE_SERVICE_ACCOUNT_EMAIL=e-saraban-service@e-saraban-ponghai.iam.gserviceaccount.com

# Private Key (จากไฟล์ JSON)
# สำคัญ: ต้องเปลี่ยน \n จริงใน key เป็น \\n
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBg...\\n...\\n-----END PRIVATE KEY-----\\n"
```

**หมายเหตุสำคัญสำหรับ Private Key:**

ในไฟล์ JSON, `private_key` มี `\n` (newline) อยู่ภายใน

ในไฟล์ `.env`, ต้องเปลี่ยนเป็น `\\n` (escaped newline)

**ตัวอย่าง:**

ใน JSON:
```
"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n...\n-----END PRIVATE KEY-----\n"
```

ใน .env:
```
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvQ...\\n...\\n-----END PRIVATE KEY-----\\n"
```

**หรือใช้วิธีทางเลือก:**

แทนที่จะใส่ private key ใน .env ให้ใช้ไฟล์ JSON โดยตรง:

1. Copy ไฟล์ JSON ไปไว้ในโฟลเดอร์ `server/`
2. ตั้งชื่อว่า `service-account-key.json`
3. ในไฟล์ `.env` ใส่:
   ```env
   GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./service-account-key.json
   ```
4. ลบบรรทัด `GOOGLE_PRIVATE_KEY=` ออก

---

### ขั้นตอนที่ 7: Share Google Sheets กับ Service Account

1. เปิด Google Sheets: https://docs.google.com/spreadsheets/d/1JDfRSCQJy7bsNgONUztTaNc-ucNuKkJadOSUah7Gpes/edit
2. คลิกปุ่ม **"Share"** หรือ **"แชร์"** (มุมขวาบน)
3. ในช่อง "Add people and groups" หรือ "เพิ่มบุคคลและกลุ่ม"
4. ใส่ email ของ Service Account:
   ```
   e-saraban-service@e-saraban-ponghai.iam.gserviceaccount.com
   ```
5. เลือกสิทธิ์: **"Editor"** หรือ **"แก้ไข"**
6. คลิก **"Send"** หรือ **"ส่ง"**
7. Service Account จะได้รับสิทธิ์เข้าถึง Spreadsheet

---

### ขั้นตอนที่ 8: ทดสอบการเชื่อมต่อ

```bash
# เข้าไปในโฟลเดอร์ server
cd server

# ติดตั้ง dependencies (ถ้ายังไม่ได้ทำ)
npm install

# ทดสอบการเชื่อมต่อ
npm run test:connection
```

**ผลลัพธ์ที่คาดหวัง:**

```
╔══════════════════════════════════════════════════════════╗
║     E-Saraban — Google Sheets Connection Test           ║
╚══════════════════════════════════════════════════════════╝

📋 Step 1: Checking Configuration...
   ✅ Configuration is complete

📋 Step 2: Validating Configuration...
   ✅ Configuration is valid

📋 Step 3: Testing Google Sheets Connection...

✅ CONNECTION SUCCESSFUL

   Spreadsheet: [ชื่อ Spreadsheet]
   ID: 1JDfR...Gpes
   Sheets: 10

   STATUS: CONNECTED
```

---

### ขั้นตอนที่ 9: ค้นพบ Schema

```bash
# ค้นพบโครงสร้างทั้งหมด
npm run discover:schema
```

**ผลลัพธ์:**
- แสดงรายชื่อทุก Sheet
- แสดง Headers ของแต่ละ Sheet
- สร้างไฟล์ `DATA-MAPPING-REPORT.md`

---

## การแก้ไขปัญหา

### ปัญหา: "AUTHENTICATION_ERROR"

**สาเหตุ:** Service Account credentials ไม่ถูกต้อง

**วิธีแก้:**
1. ตรวจสอบว่า `GOOGLE_SERVICE_ACCOUNT_EMAIL` ถูกต้อง
2. ตรวจสอบว่า `GOOGLE_PRIVATE_KEY` ถูกต้อง (ระวังเรื่อง `\n` vs `\\n`)
3. ตรวจสอบว่า Share Spreadsheet กับ Service Account แล้ว

---

### ปัญหา: "SPREADSHEET_NOT_FOUND"

**สาเหตุ:** Service Account ไม่มีสิทธิ์เข้าถึง Spreadsheet

**วิธีแก้:**
1. เปิด Spreadsheet
2. คลิก "Share"
3. เพิ่ม email ของ Service Account
4. ให้สิทธิ์ "Editor"

---

### ปัญหา: "PERMISSION_DENIED"

**สาเหตุ:** Service Account ไม่มีสิทธิ์

**วิธีแก้:**
1. ตรวจสอบว่า Share Spreadsheet แล้ว
2. ตรวจสอบว่าให้สิทธิ์ "Editor" หรือ "Viewer"
3. ลองลบและ Share ใหม่

---

### ปัญหา: "INVALID_KEY_FORMAT"

**สาเหตุ:** รูปแบบ Private Key ไม่ถูกต้อง

**วิธีแก้:**
1. ตรวจสอบว่าเปลี่ยน `\n` เป็น `\\n` แล้ว
2. ตรวจสอบว่าไม่มีช่องว่างเกิน
3. ลองใช้ `GOOGLE_SERVICE_ACCOUNT_KEY_FILE` แทน

---

## วิธีทางเลือก: ใช้ไฟล์ JSON โดยตรง

ถ้ามีปัญหาเรื่อง Private Key format ให้ใช้วิธีนี้:

1. Copy ไฟล์ JSON ไปไว้ใน `server/service-account-key.json`
2. ใน `.env` ใส่:
   ```env
   GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./service-account-key.json
   ```
3. ลบบรรทัด `GOOGLE_PRIVATE_KEY=` ออก
4. รัน `npm run test:connection`

---

## ความปลอดภัย

### สิ่งที่ต้องทำ:
- ✅ เก็บไฟล์ JSON ไว้ในที่ปลอดภัย
- ✅ อย่า commit ไฟล์ JSON ขึ้น Git
- ✅ อย่าแชร์ไฟล์ JSON ให้คนอื่น
- ✅ ใช้ `.gitignore` ป้องกันการ commit

### สิ่งที่ต้องห้าม:
- ❌ อย่าแชร์ Private Key
- ❌ อย่าอัพโหลดไฟล์ JSON ขึ้น GitHub
- ❌ อย่าส่งไฟล์ JSON ทาง email/chat
- ❌ อย่าเก็บไฟล์ JSON ในที่สาธารณะ

---

## สรุป

### สิ่งที่ต้องทำ:

1. ✅ สร้าง Google Cloud Project
2. ✅ เปิด Google Sheets API
3. ✅ สร้าง Service Account
4. ✅ สร้าง Key (JSON)
5. ✅ ดึง `client_email` และ `private_key`
6. ✅ ตั้งค่า `.env`
7. ✅ Share Spreadsheet กับ Service Account
8. ✅ ทดสอบ: `npm run test:connection`
9. ✅ ค้นพบ: `npm run discover:schema`

### ผลลัพธ์ที่คาดหวัง:

- เชื่อมต่อ Google Sheets สำเร็จ
- ค้นพบโครงสร้าง 10 Sheets
- สร้าง Data Mapping Report
- พร้อมสำหรับ Phase ถัดไป

---

## ติดต่อขอความช่วยเหลือ

ถ้ามีปัญหาในการตั้งค่า:
1. ตรวจสอบว่าทำครบทุกขั้นตอนแล้ว
2. ตรวจสอบ error message
3. ดู "การแก้ไขปัญหา" ด้านบน
4. ตรวจสอบว่า Spreadsheet ID ถูกต้อง

---

*คู่มือสร้างเมื่อ: Phase 1B — E-Saraban Project*
*สถานะ: รอการตั้งค่า Credentials*
