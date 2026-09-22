/**
 * Phase 1H — Google Sheets Full Discovery & Validation
 * E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์
 * 
 * READ ONLY — ห้ามเขียน/แก้ไขข้อมูล
 */

import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// โหลด .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

interface SheetData {
  sheetName: string;
  headers: string[];
  rows: string[][];
  rowCount: number;
  columnCount: number;
}

interface ValidationResult {
  spreadsheetId: string;
  spreadsheetTitle: string;
  sheets: SheetData[];
  timestamp: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  errors: string[];
}

async function discoverAllSheets(): Promise<ValidationResult> {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
    return {
      spreadsheetId: spreadsheetId || '',
      spreadsheetTitle: '',
      sheets: [],
      timestamp: new Date().toISOString(),
      status: 'FAILED',
      errors: ['Missing Google Sheets credentials'],
    };
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('PHASE 1H — GOOGLE SHEETS FULL DISCOVERY');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📡 Connecting to Google Sheets...');
  console.log(`   Spreadsheet ID: ${spreadsheetId.substring(0, 10)}...`);
  console.log(`   Service Account: ${serviceAccountEmail}\n`);

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // ดึง metadata
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

    for (const sheet of sheetsList) {
      const sheetName = sheet.properties?.title;
      if (!sheetName) continue;

      console.log(`📄 Reading sheet: ${sheetName}`);

      try {
        // อ่านข้อมูลทั้งหมด
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
        };

        allSheetsData.push(sheetData);

        console.log(`   ✅ Headers: ${headers.length}`);
        console.log(`   ✅ Data Rows: ${rows.length}`);
        console.log(`   ✅ Columns: ${headers.join(', ')}\n`);
      } catch (error) {
        const errorMsg = `Failed to read sheet "${sheetName}": ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`   ❌ ${errorMsg}\n`);
        errors.push(errorMsg);
      }
    }

    const result: ValidationResult = {
      spreadsheetId,
      spreadsheetTitle: spreadsheet.properties?.title || '',
      sheets: allSheetsData,
      timestamp: new Date().toISOString(),
      status: errors.length === 0 ? 'SUCCESS' : 'PARTIAL',
      errors,
    };

    // บันทึกผลลัพธ์
    const reportPath = path.resolve(__dirname, '../../../PHASE-1H-DISCOVERY-RESULT.json');
    fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
    console.log(`✅ Report saved to: ${reportPath}\n`);

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
    };
  }
}

// รัน script
discoverAllSheets().then((result) => {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('DISCOVERY COMPLETE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`\nStatus: ${result.status}`);
  console.log(`Sheets Read: ${result.sheets.length}/10`);
  
  if (result.errors.length > 0) {
    console.log(`\nErrors: ${result.errors.length}`);
    result.errors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err}`);
    });
  }
  
  console.log('\n');
  process.exit(result.status === 'FAILED' ? 1 : 0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
