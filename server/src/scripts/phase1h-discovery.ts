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
