# Phase 1H — Complete Report

**E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์**  
**เทศบาลตำบลป่งไฮ**  
**วันที่:** 2026

---

## PHASE 1H TRANSFER PACKAGE — COMPLETE FILE LIST

### Files Created/Modified

```
✅ server/src/scripts/phase1h-discovery.ts (191 lines)
✅ server/package.json (updated)
✅ PHASE-1H-GOOGLE-SHEETS-FULL-DISCOVERY.md
✅ PHASE-1H-SUMMARY.md
✅ PHASE-1H-COMPLETE-REPORT.md (this file)
```

---

## FILE 1: server/src/scripts/phase1h-discovery.ts

**Status:** ✅ CREATED  
**Lines:** 191  
**Purpose:** Google Sheets Discovery Script (READ-ONLY)

**Complete Source Code:**

```typescript
/**
 * Phase 1H — Google Sheets Full Discovery & Validation
 * E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์
 * เทศบาลตำบลป่งไฮ
 * 
 * READ ONLY — ห้ามเขียน/แก้ไขข้อมูลใน Google Sheets
 * 
 * วัตถุประสงค์:
 * - อ่าน Google Sheets ทั้ง 10 Sheets
 * - ตรวจสอบโครงสร้างข้อมูล
 * - ตรวจสอบ relationships
 * - สร้างรายงานการตรวจสอบ
 */

import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// โหลด .env จาก project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// ============================================
// Types
// ============================================

interface SheetData {
  sheetName: string;
  headers: string[];
  rows: string[][];
  rowCount: number;
  columnCount: number;
  readStatus: 'SUCCESS' | 'FAILED' | 'EMPTY';
  error?: string;
}

interface ValidationResult {
  spreadsheetId: string;
  spreadsheetTitle: string;
  sheets: SheetData[];
  timestamp: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  errors: string[];
  warnings: string[];
  summary: {
    totalSheets: number;
    sheetsWithData: number;
    emptySheets: number;
    failedSheets: number;
  };
}

// ============================================
// Main Discovery Function
// ============================================

async function discoverAllSheets(): Promise<ValidationResult> {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  // ตรวจสอบ credentials
  if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
    return {
      spreadsheetId: spreadsheetId || '',
      spreadsheetTitle: '',
      sheets: [],
      timestamp: new Date().toISOString(),
      status: 'FAILED',
      errors: ['Missing Google Sheets credentials in .env'],
      warnings: [],
      summary: {
        totalSheets: 0,
        sheetsWithData: 0,
        emptySheets: 0,
        failedSheets: 0,
      },
    };
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('PHASE 1H — GOOGLE SHEETS FULL DISCOVERY');
  console.log('E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📡 Connecting to Google Sheets...');
  console.log(`   Spreadsheet ID: ${spreadsheetId.substring(0, 10)}...`);
  console.log(`   Service Account: ${serviceAccountEmail}\n`);

  try {
    // สร้าง authenticated client
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // ดึง metadata ของ spreadsheet
    console.log('📋 Reading spreadsheet metadata...');
    const metadataResponse = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false,
    });

    const spreadsheet = metadataResponse.data;
    const sheetsList = spreadsheet.sheets || [];

    console.log(`✅ Connected successfully!`);
    console.log(`   Title: ${spreadsheet.properties?.title}`);
    console.log(`   Total Sheets: ${sheetsList.length}\n`);

    // อ่านข้อมูลทุก sheet
    const allSheetsData: SheetData[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const sheet of sheetsList) {
      const sheetName = sheet.properties?.title;
      if (!sheetName) continue;

      console.log(`📄 Reading sheet: ${sheetName}`);

      try {
        // อ่านข้อมูลทั้งหมดจาก sheet
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: sheetName,
          valueRenderOption: 'FORMATTED_VALUE',
        });

        const values = response.data.values || [];
        const headers = values[0] || [];
        const rows = values.slice(1);

        const sheetData: SheetData = {
          sheetName,
          headers,
          rows,
          rowCount: rows.length,
          columnCount: headers.length,
          readStatus: rows.length === 0 ? 'EMPTY' : 'SUCCESS',
        };

        allSheetsData.push(sheetData);

        console.log(`   ✅ Headers: ${headers.length}`);
        console.log(`   ✅ Data Rows: ${rows.length}`);
        console.log(`   ✅ Columns: ${headers.join(', ')}`);
        
        if (rows.length === 0) {
          console.log(`   ⚠️  Sheet is empty (headers only)\n`);
        } else {
          console.log('');
        }
      } catch (error) {
        const errorMsg = `Failed to read sheet "${sheetName}": ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`   ❌ ${errorMsg}\n`);
        errors.push(errorMsg);
        
        allSheetsData.push({
          sheetName,
          headers: [],
          rows: [],
          rowCount: 0,
          columnCount: 0,
          readStatus: 'FAILED',
          error: errorMsg,
        });
      }
    }

    // สรุปผล
    const sheetsWithData = allSheetsData.filter(s => s.readStatus === 'SUCCESS').length;
    const emptySheets = allSheetsData.filter(s => s.readStatus === 'EMPTY').length;
    const failedSheets = allSheetsData.filter(s => s.readStatus === 'FAILED').length;

    const result: ValidationResult = {
      spreadsheetId,
      spreadsheetTitle: spreadsheet.properties?.title || '',
      sheets: allSheetsData,
      timestamp: new Date().toISOString(),
      status: errors.length === 0 ? 'SUCCESS' : 'PARTIAL',
      errors,
      warnings,
      summary: {
        totalSheets: allSheetsData.length,
        sheetsWithData,
        emptySheets,
        failedSheets,
      },
    };

    // บันทึกผลลัพธ์
    const reportPath = path.resolve(__dirname, '../../../PHASE-1H-DISCOVERY-RESULT.json');
    fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('DISCOVERY COMPLETE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\nStatus: ${result.status}`);
    console.log(`Sheets Read: ${allSheetsData.length}/10`);
    console.log(`  - With Data: ${sheetsWithData}`);
    console.log(`  - Empty: ${emptySheets}`);
    console.log(`  - Failed: ${failedSheets}`);
    
    if (errors.length > 0) {
      console.log(`\nErrors: ${errors.length}`);
      errors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`);
      });
    }
    
    console.log(`\n✅ Report saved to: ${reportPath}\n`);

    return result;
  } catch (error) {
    console.error('\n❌ Connection failed:', error instanceof Error ? error.message : 'Unknown error');
    
    if (error && typeof error === 'object' && 'code' in error) {
      const apiError = error as any;
      console.error(`   Error Code: ${apiError.code}`);
      console.error(`   Error Status: ${apiError.status}`);
      
      if (apiError.code === 403) {
        console.error('\n💡 Hint: Service Account อาจไม่มีสิทธิ์เข้าถึง Spreadsheet');
        console.error('   ตรวจสอบว่า Share Spreadsheet กับ Service Account Email แล้ว');
      } else if (apiError.code === 404) {
        console.error('\n💡 Hint: Spreadsheet ID อาจไม่ถูกต้อง');
      }
    }

    return {
      spreadsheetId,
      spreadsheetTitle: '',
      sheets: [],
      timestamp: new Date().toISOString(),
      status: 'FAILED',
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      warnings: [],
      summary: {
        totalSheets: 0,
        sheetsWithData: 0,
        emptySheets: 0,
        failedSheets: 0,
      },
    };
  }
}

// ============================================
// Execute
// ============================================

discoverAllSheets().then((result) => {
  process.exit(result.status === 'FAILED' ? 1 : 0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

---

## FILE 2: server/package.json

**Status:** ✅ UPDATED  
**Lines:** 31

**Complete File:**

```json
{
  "name": "e-saraban-server",
  "version": "1.0.0",
  "description": "Backend API for E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์ เทศบาลตำบลป่งไฮ",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test:connection": "tsx src/test-connection.ts",
    "check:env": "tsx src/check-env.ts",
    "discover:schema": "tsx src/discover-schema.ts",
    "discover:all": "tsx src/discover-all.ts",
    "phase1c": "tsx src/scripts/discover-all-sheets.ts",
    "phase1h": "tsx src/scripts/phase1h-discovery.ts"
  },
  "dependencies": {
    "googleapis": "^144.0.0",
    "express": "^4.21.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^22.0.0",
    "typescript": "^5.7.0",
    "tsx": "^4.19.0"
  }
}
```

**Change:** Line 15 — Added `"phase1h": "tsx src/scripts/phase1h-discovery.ts"`

---

## FILE 3: PHASE-1H-GOOGLE-SHEETS-FULL-DISCOVERY.md

**Status:** ✅ CREATED  
**Purpose:** Documentation for discovery script

**Location:** See workspace file

---

## FILE 4: PHASE-1H-SUMMARY.md

**Status:** ✅ CREATED  
**Purpose:** Summary report

**Location:** See workspace file

---

## FILE 5: PHASE-1H-COMPLETE-REPORT.md

**Status:** ✅ CREATED  
**Purpose:** This file — complete report with all file contents

---

## TRANSFER INSTRUCTIONS

### For Project Owner

**Step 1: Create Directory Structure**

```bash
cd C:\Users\admin\Desktop\saraban1
mkdir -p server/src/scripts
```

**Step 2: Create phase1h-discovery.ts**

Copy the complete source code from FILE 1 above and save to:

```
server/src/scripts/phase1h-discovery.ts
```

**Step 3: Update package.json**

Add line 15 to `server/package.json`:

```json
"phase1h": "tsx src/scripts/phase1h-discovery.ts"
```

**Step 4: Verify Files**

```bash
# Check script exists
ls -la server/src/scripts/phase1h-discovery.ts

# Check npm script
cat server/package.json | grep phase1h
```

**Step 5: Execute Discovery**

```bash
cd server
npm install
npm run phase1h
```

**Step 6: Verify Output**

```bash
# Check output file
ls -la PHASE-1H-DISCOVERY-RESULT.json

# View results
cat PHASE-1H-DISCOVERY-RESULT.json
```

---

## IMPORTANT DISCLAIMERS

### What Was NOT Done

❌ **Did NOT execute the script**
- Script exists in workspace
- Has NOT been run against Google Sheets
- No real data has been read

❌ **Did NOT commit to git**
- Files are in workspace only
- Not in git history
- Not pushed to remote

❌ **Did NOT update Project Owner's repository**
- Files must be transferred manually
- Must be committed after transfer

❌ **Did NOT verify Google Sheets data**
- No real data from Sheets
- No validation results
- No organization mapping

### What Was Done

✅ **Created discovery script**
- 191 lines of TypeScript
- READ-ONLY operations
- Error handling
- Output generation

✅ **Updated package.json**
- Added phase1h npm script
- Preserved existing scripts

✅ **Created documentation**
- Discovery guide
- Summary report
- Complete report (this file)

---

## FINAL STATUS

```
========================================
PHASE 1H TRANSFER PACKAGE STATUS
========================================

Implementation:
phase1h-discovery.ts = CREATED ✅
npm script = CREATED ✅
Documentation = CREATED ✅

Execution:
Google Sheets Discovery = NOT EXECUTED ⏳
Sheets Read = PENDING

Repository:
Project Owner repository = NOT UPDATED ❌
Git commit = NOT PERFORMED ❌
Git push = NOT PERFORMED ❌

Phase 2:
BLOCKED ❌

Next step:
Project Owner must transfer/apply the prepared files 
to the local repository, then execute Phase 1H from 
the local machine.
========================================
```

---

*รายงานสร้างเมื่อ: Phase 1H — E-Saraban Project*  
*สถานะ: ⚠️ IMPLEMENTATION PREPARED — NOT EXECUTED*  
*วันที่: 2026*
