# E-Saraban Backend Server

ระบบสารบรรณอิเล็กทรอนิกส์ — เทศบาลตำบลป่งไฮ

## สถานะ: READY FOR GOOGLE SHEETS CONFIGURATION

Backend ยังไม่พร้อมทำงานเต็มรูปแบบ ต้องตั้งค่า Google Sheets ก่อน

---

## สถาปัตยกรรม

```
Frontend (React + Vite)
    ↓ HTTP
Backend (Node.js + Express)
    ↓ googleapis
Google Sheets API
    ↓
Google Sheets (10 Sheets — Source of Truth)
```

---

## โครงสร้างโฟลเดอร์

```
server/
├── package.json
├── tsconfig.json
├── .env.example          ← Environment template
├── README.md
└── src/
    ├── index.ts           ← Server entry point
    ├── test-connection.ts ← Connection test script
    ├── config/
    │   └── env.ts         ← Environment configuration
    ├── services/
    │   ├── googleSheets.service.ts  ← Google Sheets API
    │   └── auditLog.service.ts      ← Audit logging
    ├── routes/
    │   ├── health.routes.ts         ← Health check
    │   ├── googleSheets.routes.ts   ← Sheets API
    │   └── auditLog.routes.ts       ← Audit logs
    └── types/
        └── googleSheets.types.ts    ← Type definitions
```

---

## วิธีติดตั้ง

```bash
cd server
npm install
```

---

## วิธีตั้งค่า

### 1. สร้าง .env file

```bash
cp .env.example .env
```

### 2. ตั้งค่า Google Sheets

#### 2.1 สร้าง Service Account

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้าง Project ใหม่ (หรือใช้ Project ที่มีอยู่)
3. เปิด **APIs & Services > Library**
4. ค้นหาและเปิด **Google Sheets API**
5. ไปที่ **APIs & Services > Credentials**
6. สร้าง **Service Account**
7. สร้าง **Key** แบบ JSON
8. บันทึก email และ private_key

#### 2.2 ใส่ค่าใน .env

```env
GOOGLE_SPREADSHEET_ID=<spreadsheet-id-from-url>
GOOGLE_SERVICE_ACCOUNT_EMAIL=<service-account-email>
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

**หมายเหตุ:** 
- `GOOGLE_SPREADSHEET_ID` คือ ID จาก URL ของ Google Sheets
  - URL: `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit`
  - ID: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms`
- `GOOGLE_PRIVATE_KEY` ต้องเปลี่ยน `\n` จริงเป็น `\\n`

#### 2.3 Share Google Spreadsheet

1. เปิด Google Spreadsheet
2. คลิก **Share**
3. ใส่ email ของ Service Account
4. ให้สิทธิ์ **Editor**

### 3. ทดสอบการเชื่อมต่อ

```bash
npm run test:connection
```

ผลลัพธ์ที่คาดหวัง:
```
✅ CONNECTION SUCCESSFUL
   Spreadsheet: [ชื่อ Spreadsheet]
   Sheets: 10
   STATUS: CONNECTED
```

---

## วิธีรัน

### Development

```bash
npm run dev
```

Server จะรันที่ `http://localhost:4000`

### Production

```bash
npm run build
npm start
```

---

## API Endpoints

### Health Check (ไม่ต้อง Config)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Service info |
| GET | `/api/health` | Server health |
| GET | `/api/health/google-sheets` | Google Sheets connection |
| GET | `/api/health/config` | Configuration status |

### Google Sheets (ต้อง Config)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sheets/metadata` | Spreadsheet metadata |
| GET | `/api/sheets/names` | Sheet names |
| GET | `/api/sheets/schema` | Full schema discovery |
| GET | `/api/sheets/:sheetName/headers` | Sheet headers |
| GET | `/api/sheets/:sheetName/rows` | Sheet data |
| GET | `/api/sheets/:sheetName/find?column=X&value=Y` | Find row |
| GET | `/api/sheets/:sheetName/schema` | Sheet schema |
| POST | `/api/sheets/:sheetName/rows` | Append row |
| PUT | `/api/sheets/:sheetName/rows/:rowIndex` | Update row |
| POST | `/api/sheets/:sheetName/batch-update` | Batch update |

### Audit Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audit-logs` | Get audit logs |
| GET | `/api/audit-logs/count` | Count logs |

---

## Connection Test Results

| Status | Description |
|--------|-------------|
| `CONNECTED` | เชื่อมต่อสำเร็จ |
| `NOT_CONNECTED` | ยังไม่ได้ตั้งค่า |
| `CONFIGURATION_ERROR` | ตั้งค่าไม่ถูกต้อง |
| `AUTHENTICATION_ERROR` | Authentication ล้มเหลว |
| `SPREADSHEET_NOT_FOUND` | ไม่พบ Spreadsheet |
| `PERMISSION_DENIED` | ไม่มีสิทธิ์เข้าถึง |
| `UNKNOWN_ERROR` | ข้อผิดพลาดที่ไม่ทราบสาเหตุ |

---

## Security

- ❌ ไม่เปิดเผย credentials ใน API responses
- ❌ ไม่ส่ง Google credentials ไป Frontend
- ✅ Service Account credentials เก็บใน Backend เท่านั้น
- ✅ ทุก API endpoint ตรวจสอบ Configuration
- ✅ Audit Log บันทึกทุก Action สำคัญ
- ✅ CORS configured สำหรับ Frontend URL

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_SPREADSHEET_ID` | ✅ | Google Sheets ID |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | ✅ | Service Account email |
| `GOOGLE_PRIVATE_KEY` | ✅* | Private key (PEM format) |
| `GOOGLE_SERVICE_ACCOUNT_KEY_FILE` | ✅* | Path to JSON key file |
| `PORT` | ❌ | Server port (default: 4000) |
| `NODE_ENV` | ❌ | Environment (default: development) |
| `FRONTEND_URL` | ❌ | Frontend URL for CORS |
| `LOG_LEVEL` | ❌ | Log level (default: info) |

*ต้องมีอย่างใดอย่างหนึ่ง

---

## สิ่งที่ต้องทำต่อ

- [ ] ตั้งค่า Google Sheets credentials
- [ ] ทดสอบการเชื่อมต่อ
- [ ] ตรวจสอบ 10 Sheets
- [ ] สร้าง Data Mapping
- [ ] เพิ่ม Authentication
- [ ] เพิ่ม Authorization (RBAC)
- [ ] เชื่อม Audit Log กับ Google Sheets

---

## Troubleshooting

### "CONFIGURATION_ERROR"
- ตรวจสอบว่า .env file ถูกสร้างแล้ว
- ตรวจสอบว่าค่าใน .env ไม่มีช่องว่างเกิน

### "AUTHENTICATION_ERROR"
- ตรวจสอบ Service Account email
- ตรวจสอบ Private Key format
- ตรวจสอบว่า Share Spreadsheet กับ Service Account แล้ว

### "SPREADSHEET_NOT_FOUND"
- ตรวจสอบ Spreadsheet ID
- ตรวจสอบว่า Spreadsheet ยังไม่ถูกลบ
- ตรวจสอบว่า Service Account มีสิทธิ์เข้าถึง

### "PERMISSION_DENIED"
- Share Spreadsheet กับ Service Account email
- ให้สิทธิ์ Editor
