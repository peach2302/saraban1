# 📋 Phase 1C — คู่มือการรัน Discovery

## สถานะ: ✅ READY TO RUN

Credentials ถูกตั้งค่าแล้ว พร้อมรัน Discovery Script

---

## ขั้นตอนการรัน

### ขั้นตอนที่ 1: ติดตั้ง Dependencies

```bash
cd server
npm install
```

### ขั้นตอนที่ 2: รัน Discovery Script

```bash
npm run phase1c
```

### ขั้นตอนที่ 3: ตรวจสอบผลลัพธ์

ไฟล์ `discovery-report.json` จะถูกสร้างในโฟลเดอร์ root

### ขั้นตอนที่ 4: รัน Backend Server (Optional)

```bash
npm run dev
```

### ขั้นตอนที่ 5: เปิด Frontend (Optional)

เปิด browser ที่ `http://localhost:3000`

---

## ผลลัพธ์ที่คาดหวัง

### Console Output

```
═══════════════════════════════════════════════════════════
PHASE 1C — DISCOVER ALL SHEETS
═══════════════════════════════════════════════════════════

✅ Environment variables configured
   Spreadsheet ID: 1JDfRSCQJ...
   Service Account: saraban@glassy-clarity-509403-v7.iam.gserviceaccount.com

📡 Testing connection...
✅ Connection successful!

═══════════════════════════════════════════════════════════
SPREADSHEET INFORMATION
═══════════════════════════════════════════════════════════
Title: [ชื่อ Spreadsheet]
ID: 1JDfRSCQJy7bsNgONUztTaNc-ucNuKkJadOSUah7Gpes
Locale: th
Timezone: Asia/Bangkok
Total Sheets: 10

═══════════════════════════════════════════════════════════
SHEETS DISCOVERED
═══════════════════════════════════════════════════════════

1. Users
   Sheet ID: 0
   Index: 0
   Type: GRID
   Hidden: No
   Grid: 1000 rows × 26 columns

2. Documents
   Sheet ID: 123456789
   Index: 1
   Type: GRID
   Hidden: No
   Grid: 1000 rows × 26 columns

... (sheets อื่นๆ)

═══════════════════════════════════════════════════════════
READING HEADERS AND SAMPLE DATA
═══════════════════════════════════════════════════════════

📄 Sheet: Users
   Headers (11): User_ID, ชื่อ-สกุล, Position_ID, ตำแหน่ง, Department_ID, Unit_ID, Role, Email, สถานะ, Can_View_All, Can_Sign
   Sample Rows: 7 (excluding header)
   Sample Data:
     Row 1: [{"User_ID":"U001","ชื่อ-สกุล":"นายปรีชา กุมภิโร",...}]
     ...

... (sheets อื่นๆ)

═══════════════════════════════════════════════════════════
DISCOVERY COMPLETE
═══════════════════════════════════════════════════════════

✅ Successfully discovered 10 sheets
✅ Read headers and sample data from all sheets

📄 Report saved to: /path/to/project/discovery-report.json
```

### JSON Output (discovery-report.json)

```json
{
  "spreadsheetId": "1JDfRSCQJy7bsNgONUztTaNc-ucNuKkJadOSUah7Gpes",
  "spreadsheetTitle": "E-Saraban Data",
  "discoveredAt": "2026-...",
  "totalSheets": 10,
  "sheets": [
    {
      "sheetName": "Users",
      "sheetId": 0,
      "headers": ["User_ID", "ชื่อ-สกุล", "Position_ID", ...],
      "rowCount": 1000,
      "columnCount": 26,
      "sampleData": [
        ["User_ID", "ชื่อ-สกุล", ...],
        ["U001", "นายปรีชา กุมภิโร", ...],
        ...
      ]
    },
    ...
  ]
}
```

---

## การแก้ไขปัญหา

### ปัญหา: "GOOGLE_SPREADSHEET_ID is not set"

**วิธีแก้:**
```bash
# ตรวจสอบ .env file
cat .env

# ตรวจสอบว่ามี GOOGLE_SPREADSHEET_ID หรือไม่
grep GOOGLE_SPREADSHEET_ID .env
```

### ปัญหา: "GOOGLE_SERVICE_ACCOUNT_EMAIL is not set"

**วิธีแก้:**
```bash
# ตรวจสอบ .env file
cat .env

# ตรวจสอบว่ามี GOOGLE_SERVICE_ACCOUNT_EMAIL หรือไม่
grep GOOGLE_SERVICE_ACCOUNT_EMAIL .env
```

### ปัญหา: "GOOGLE_PRIVATE_KEY is not set"

**วิธีแก้:**
```bash
# ตรวจสอบ .env file
cat .env

# ตรวจสอบว่ามี GOOGLE_PRIVATE_KEY หรือไม่
grep GOOGLE_PRIVATE_KEY .env
```

### ปัญหา: "Permission denied" หรือ "403 Forbidden"

**สาเหตุ:** Service Account ไม่มีสิทธิ์เข้าถึง Spreadsheet

**วิธีแก้:**
1. เปิด Google Sheets
2. คลิก "Share"
3. เพิ่ม email: `saraban@glassy-clarity-509403-v7.iam.gserviceaccount.com`
4. ให้สิทธิ์ "Viewer" หรือ "Editor"

### ปัญหา: "Spreadsheet not found" หรือ "404 Not Found"

**สาเหตุ:** Spreadsheet ID ไม่ถูกต้อง

**วิธีแก้:**
1. เปิด Google Sheets
2. ดู URL: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`
3. Copy Spreadsheet ID
4. อัปเดต `.env`: `GOOGLE_SPREADSHEET_ID=[SPREADSHEET_ID]`

---

## Scripts ที่พร้อมใช้งาน

| Script | Command | Purpose |
|--------|---------|---------|
| ตรวจสอบ Environment | `npm run check:env` | ตรวจสอบว่าตั้งค่า env ครบหรือยัง |
| ทดสอบการเชื่อมต่อ | `npm run test:connection` | ทดสอบเชื่อมต่อกับ Google Sheets |
| ค้นพบ Sheets ทั้งหมด | `npm run phase1c` | ค้นพบ sheets และสร้างรายงาน |
| รัน Server | `npm run dev` | รัน Backend server |

---

## สรุป

**สถานะ:** ✅ READY TO RUN

**ขั้นตอน:**
1. `cd server`
2. `npm install`
3. `npm run phase1c`
4. ตรวจสอบ `discovery-report.json`

**ผลลัพธ์ที่คาดหวัง:**
- ✅ ค้นพบ sheets ทั้งหมด (คาดว่า 10 sheets)
- ✅ อ่าน headers ของทุก sheets
- ✅ อ่าน sample data
- ✅ สร้าง `discovery-report.json`

---

*คู่มือสร้างเมื่อ: Phase 1C — E-Saraban Project*
*สถานะ: ✅ READY TO RUN*
