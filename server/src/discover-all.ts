/**
 * Comprehensive Sheet Discovery Script
 * E-Saraban Backend
 * 
 * พยายามค้นพบ sheets ทั้งหมดด้วยวิธีต่างๆ:
 * 1. Google Sheets API + Service Account (ถ้ามี credentials)
 * 2. Public access + gviz endpoint (ถ้า spreadsheet เป็น public)
 * 3. Brute-force ชื่อ sheets ที่อาจเป็นไปได้ (สุดท้าย)
 * 
 * วิธีใช้:
 *   cd server
 *   npm run discover:all
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import googleSheetsService from './services/googleSheets.service.js';
import { getConfigurationStatus } from './config/env.js';
import { 
  testPublicAccess, 
  getPublicHeaders, 
  getPublicRows,
  KNOWN_SHEETS 
} from './services/publicGoogleSheets.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// โหลด .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SPREADSHEET_ID = '1JDfRSCQJy7bsNgONUztTaNc-ucNuKkJadOSUah7Gpes';

// รายชื่อ sheets ที่อาจเป็นไปได้ (อนุมานจากข้อมูล Users)
const POTENTIAL_SHEETS = [
  'Users',
  'Documents',
  'Incoming',
  'Outgoing',
  'Departments',
  'Positions',
  'Units',
  'Workflow',
  'AuditLog',
  'Config',
  'Settings',
  'หนังสือรับ',
  'หนังสือส่ง',
  'แผนก',
  'ตำแหน่ง',
  'งาน',
  'เอกสาร',
  'การ workflow',
  'บันทึก',
  'ตั้งค่า',
];

async function discoverWithServiceAccount(): Promise<any> {
  console.log('\n📋 Method 1: Google Sheets API + Service Account');
  
  const configStatus = getConfigurationStatus();
  
  if (!configStatus.configured) {
    console.log('   ❌ Service Account credentials not configured');
    console.log('   Missing:', configStatus.missingFields.join(', '));
    return null;
  }
  
  try {
    console.log('   ✅ Credentials configured');
    console.log('   Testing connection...');
    
    const result = await googleSheetsService.testConnection();
    
    if (result.status !== 'CONNECTED') {
      console.log(`   ❌ Connection failed: ${result.status}`);
      console.log(`   ${result.message}`);
      return null;
    }
    
    console.log('   ✅ Connected successfully');
    console.log(`   Spreadsheet: ${result.spreadsheetTitle}`);
    console.log(`   Sheets: ${result.sheetCount}`);
    
    // Discover all sheets
    console.log('   Discovering all sheets...');
    const schema = await googleSheetsService.discoverSchema();
    
    console.log(`   ✅ Discovered ${schema.sheets.length} sheets`);
    
    return {
      method: 'Service Account',
      spreadsheetTitle: schema.spreadsheetTitle,
      sheets: schema.sheets,
    };
  } catch (error) {
    console.log('   ❌ Error:', (error as Error).message);
    return null;
  }
}

async function discoverWithPublicAccess(): Promise<any> {
  console.log('\n📋 Method 2: Public Access + gviz endpoint');
  
  try {
    console.log('   Testing public access...');
    const hasAccess = await testPublicAccess();
    
    if (!hasAccess) {
      console.log('   ❌ No public access');
      return null;
    }
    
    console.log('   ✅ Public access confirmed');
    console.log('   Discovering sheets...');
    
    const discoveredSheets: any[] = [];
    
    // ทดลองดึง sheets ที่ทราบแล้ว
    for (const sheetName of KNOWN_SHEETS) {
      try {
        const headers = await getPublicHeaders(sheetName);
        if (headers.headers.length > 0) {
          console.log(`   ✅ Found: ${sheetName} (${headers.headerCount} columns)`);
          discoveredSheets.push({
            name: sheetName,
            headers: headers.headers,
          });
        }
      } catch {
        console.log(`   ❌ Not found: ${sheetName}`);
      }
    }
    
    if (discoveredSheets.length === 0) {
      console.log('   ❌ No sheets discovered');
      return null;
    }
    
    console.log(`   ✅ Discovered ${discoveredSheets.length} sheets`);
    
    return {
      method: 'Public Access',
      spreadsheetTitle: 'Unknown (Public)',
      sheets: discoveredSheets,
    };
  } catch (error) {
    console.log('   ❌ Error:', (error as Error).message);
    return null;
  }
}

async function discoverWithBruteForce(): Promise<any> {
  console.log('\n📋 Method 3: Brute-force potential sheet names');
  console.log('   ⚠️  WARNING: This method tries to guess sheet names');
  
  try {
    const discoveredSheets: any[] = [];
    
    for (const sheetName of POTENTIAL_SHEETS) {
      try {
        const headers = await getPublicHeaders(sheetName);
        if (headers.headers.length > 0) {
          console.log(`   ✅ Found: ${sheetName} (${headers.headerCount} columns)`);
          discoveredSheets.push({
            name: sheetName,
            headers: headers.headers,
          });
        }
      } catch {
        // Sheet ไม่存在
      }
    }
    
    if (discoveredSheets.length === 0) {
      console.log('   ❌ No sheets discovered');
      return null;
    }
    
    console.log(`   ✅ Discovered ${discoveredSheets.length} sheets`);
    
    return {
      method: 'Brute-force',
      spreadsheetTitle: 'Unknown (Public)',
      sheets: discoveredSheets,
    };
  } catch (error) {
    console.log('   ❌ Error:', (error as Error).message);
    return null;
  }
}

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     E-Saraban — Comprehensive Sheet Discovery           ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Spreadsheet ID: ${SPREADSHEET_ID}`);
  
  // ลองวิธีที่ 1: Service Account
  let result = await discoverWithServiceAccount();
  
  // ลองวิธีที่ 2: Public Access
  if (!result) {
    result = await discoverWithPublicAccess();
  }
  
  // ลองวิธีที่ 3: Brute-force
  if (!result) {
    result = await discoverWithBruteForce();
  }
  
  // สรุปผล
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('DISCOVERY RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  
  if (!result) {
    console.log('\n❌ DISCOVERY FAILED');
    console.log('\nไม่สามารถค้นพบ sheets ได้');
    console.log('\nสาเหตุ:');
    console.log('1. ไม่มี Service Account credentials');
    console.log('2. Spreadsheet ไม่เป็น public access');
    console.log('3. ไม่มี sheet ที่ทราบชื่อ');
    console.log('\nวิธีแก้:');
    console.log('1. สร้าง Service Account credentials (แนะนำ)');
    console.log('   ดูคู่มือ: CREDENTIALS-SETUP-GUIDE.md');
    console.log('2. หรือระบุรายชื่อ sheets ด้วยมือ');
    console.log('3. หรือตรวจสอบว่า Spreadsheet เป็น public access');
    process.exit(1);
  }
  
  console.log(`\n✅ DISCOVERY SUCCESSFUL`);
  console.log(`Method: ${result.method}`);
  console.log(`Spreadsheet: ${result.spreadsheetTitle}`);
  console.log(`Total Sheets: ${result.sheets.length}`);
  
  console.log('\n───────────────────────────────────────────────────────────');
  console.log('SHEETS DISCOVERED');
  console.log('───────────────────────────────────────────────────────────');
  
  result.sheets.forEach((sheet: any, index: number) => {
    console.log(`\n${index + 1}. ${sheet.name}`);
    if (sheet.headers) {
      console.log(`   Columns: ${sheet.headers.length}`);
      console.log(`   Headers: ${sheet.headers.join(', ')}`);
    }
    if (sheet.rowCount !== undefined) {
      console.log(`   Rows: ${sheet.rowCount}`);
    }
  });
  
  // สร้าง report
  const report = {
    spreadsheetId: SPREADSHEET_ID,
    spreadsheetTitle: result.spreadsheetTitle,
    method: result.method,
    totalSheets: result.sheets.length,
    sheets: result.sheets,
    discoveredAt: new Date().toISOString(),
  };
  
  const reportPath = path.resolve(__dirname, '../../DISCOVERY-REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  
  console.log(`\n✅ Report saved to: ${reportPath}`);
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('STATUS: DISCOVERY COMPLETE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
}

main().catch((error) => {
  console.error('\n❌ FATAL ERROR:', error.message);
  process.exit(1);
});
