# Phase 1H — Google Sheets Full Discovery

**E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์**  
**เทศบาลตำบลป่งไฮ**  
**วันที่:** 2026  
**สถานะ:** ⚠️ IMPLEMENTATION PREPARED — NOT EXECUTED

---

## ⚠️ IMPORTANT NOTICE

**ไฟล์นี้ถูกสร้างใน workspace แต่ยังไม่ถูก execute จริง**

- ✅ Discovery script ถูกสร้างแล้ว
- ✅ npm script ถูกเพิ่มแล้ว
- ❌ ยังไม่ได้ execute script
- ❌ ยังไม่ได้อ่าน Google Sheets จริง
- ❌ ยังไม่มีผลลัพธ์จริง

**ต้อง execute script บนเครื่อง local ก่อนจึงจะได้ข้อมูลจริง**

---

## Implementation Status

### Files Created

```
✅ server/src/scripts/phase1h-discovery.ts (191 lines)
✅ server/package.json (updated with phase1h script)
```

### npm Script Added

```json
"phase1h": "tsx src/scripts/phase1h-discovery.ts"
```

### Execution Required

```bash
cd server
npm install
npm run phase1h
```

---

## What This Script Does

1. **Connects to Google Sheets** using Service Account credentials
2. **Reads all 10 sheets:**
   - Users
   - Positions
   - Departments
   - Units
   - Documents
   - Incoming
   - Outgoing
   - Workflow
   - Signatures
   - AuditLog
3. **Extracts:**
   - Sheet names
   - Headers
   - All data rows
   - Row counts
   - Column counts
4. **Validates:**
   - Sheet structure
   - Empty sheets (reported as SUCCESS with 0 rows)
   - Failed reads (reported as FAILED)
5. **Creates output:**
   - `PHASE-1H-DISCOVERY-RESULT.json`

---

## Expected Output

After execution, the script will create:

```
server/PHASE-1H-DISCOVERY-RESULT.json
```

**Structure:**

```json
{
  "spreadsheetId": "1JDfRSCQJy7bsNgONUztTaNc-ucNuKkJadOSUah7Gpes",
  "spreadsheetTitle": "...",
  "sheets": [
    {
      "sheetName": "Users",
      "headers": ["User_ID", "ชื่อ-สกุล", ...],
      "rows": [...],
      "rowCount": 8,
      "columnCount": 11,
      "readStatus": "SUCCESS"
    },
    // ... (10 sheets)
  ],
  "timestamp": "...",
  "status": "SUCCESS",
  "errors": [],
  "warnings": [],
  "summary": {
    "totalSheets": 10,
    "sheetsWithData": X,
    "emptySheets": Y,
    "failedSheets": Z
  }
}
```

---

## What This Script Does NOT Do

- ❌ Does NOT modify Google Sheets
- ❌ Does NOT add rows/columns
- ❌ Does NOT create mock data
- ❌ Does NOT implement authentication
- ❌ Does NOT add Password_Hash
- ❌ Does NOT infer workflow semantics
- ❌ Does NOT guess missing data

---

## READ-ONLY Guarantee

This script uses:
- `spreadsheets.readonly` scope
- `spreadsheets.values.get` API only
- No write operations
- No update operations
- No delete operations

---

## How to Execute

### Prerequisites

1. `.env` file must exist with:
   ```
   GOOGLE_SPREADSHEET_ID=1JDfRSCQJy7bsNgONUztTaNc-ucNuKkJadOSUah7Gpes
   GOOGLE_SERVICE_ACCOUNT_EMAIL=...
   GOOGLE_PRIVATE_KEY=...
   ```

2. Service Account must have access to the Spreadsheet

3. Dependencies must be installed:
   ```bash
   npm install
   ```

### Execution Steps

```bash
# 1. Navigate to server directory
cd server

# 2. Install dependencies (if not already done)
npm install

# 3. Verify environment
npm run check:env

# 4. Test connection
npm run test:connection

# 5. Run discovery
npm run phase1h
```

### Expected Console Output

```
═══════════════════════════════════════════════════════════
PHASE 1H — GOOGLE SHEETS FULL DISCOVERY
E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์
═══════════════════════════════════════════════════════════

📡 Connecting to Google Sheets...
   Spreadsheet ID: 1JDfRSCQ...
   Service Account: saraban@glassy-clarity-509403-v7.iam.gserviceaccount.com

📋 Reading spreadsheet metadata...
✅ Connected successfully!
   Title: [ชื่อ Spreadsheet]
   Total Sheets: 10

📄 Reading sheet: Users
   ✅ Headers: 11
   ✅ Data Rows: 8
   ✅ Columns: User_ID, ชื่อ-สกุล, Position_ID, ...

📄 Reading sheet: Positions
   ✅ Headers: 5
   ✅ Data Rows: 8
   ✅ Columns: Position_ID, ตำแหน่ง, Department_ID, ...

... (อ่านครบ 10 sheets)

═══════════════════════════════════════════════════════════
DISCOVERY COMPLETE
═══════════════════════════════════════════════════════════

Status: SUCCESS
Sheets Read: 10/10
  - With Data: X
  - Empty: Y
  - Failed: Z

✅ Report saved to: PHASE-1H-DISCOVERY-RESULT.json
```

---

## Error Handling

### Missing Credentials

```
❌ Missing Google Sheets credentials in .env
```

**Solution:** Check `.env` file has all required variables

### Authentication Failed

```
❌ Connection failed: The request is missing a valid API key or token.
```

**Solution:** Verify Service Account credentials are correct

### Permission Denied

```
❌ Connection failed: The caller does not have permission
   Error Code: 403
```

**Solution:** Share Spreadsheet with Service Account email

### Spreadsheet Not Found

```
❌ Connection failed: Requested entity was not found
   Error Code: 404
```

**Solution:** Verify Spreadsheet ID is correct

---

## Validation Rules

### Empty Sheets

If a sheet has headers but no data rows:
- **Status:** `EMPTY`
- **Reported as:** SUCCESS (not failure)
- **Row count:** 0

### Failed Reads

If a sheet cannot be read:
- **Status:** `FAILED`
- **Error message:** Included in errors array
- **Does not stop:** Other sheets continue to be read

### Partial Success

If some sheets fail:
- **Overall status:** `PARTIAL`
- **Successful sheets:** Included in result
- **Failed sheets:** Listed in errors

---

## Security

### What is NOT Logged

- ❌ Private keys
- ❌ Access tokens
- ❌ Passwords
- ❌ Credentials
- ❌ Secrets

### What is Logged

- ✅ Spreadsheet ID (partial)
- ✅ Service Account email
- ✅ Sheet names
- ✅ Row counts
- ✅ Column names
- ✅ Error messages (without secrets)

---

## Next Steps After Execution

1. **Review the output file:**
   ```bash
   cat PHASE-1H-DISCOVERY-RESULT.json
   ```

2. **Verify all 10 sheets were read**

3. **Check for errors or warnings**

4. **Analyze the data:**
   - Users validation
   - Positions validation
   - Departments validation
   - Units validation
   - Cross-sheet relationships

5. **Create validation reports** based on actual data

---

## Summary

```
========================================
PHASE 1H DISCOVERY SCRIPT
========================================

Status: IMPLEMENTED (NOT EXECUTED)
Script: server/src/scripts/phase1h-discovery.ts
Lines: 191
npm script: phase1h

Execution Required:
cd server
npm run phase1h

Expected Output:
PHASE-1H-DISCOVERY-RESULT.json

Read-Only: ✅ YES
Modifies Sheets: ❌ NO
Creates Mock Data: ❌ NO
========================================
```

---

*เอกสารสร้างเมื่อ: Phase 1H — E-Saraban Project*  
*สถานะ: ⚠️ IMPLEMENTATION PREPARED — NOT EXECUTED*  
*วันที่: 2026*
