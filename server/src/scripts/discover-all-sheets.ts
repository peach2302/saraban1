/**
 * Phase 1C - Discover All Sheets Script
 * E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์
 * 
 * ทดสอบการเชื่อมต่อและค้นพบ sheets ทั้งหมด
 */

import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// โหลด .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function discoverAllSheets() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('PHASE 1C — DISCOVER ALL SHEETS');
  console.log('═══════════════════════════════════════════════════════════\n');

  // ตรวจสอบ environment variables
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!spreadsheetId) {
    console.error('❌ GOOGLE_SPREADSHEET_ID is not set');
    process.exit(1);
  }

  if (!serviceAccountEmail) {
    console.error('❌ GOOGLE_SERVICE_ACCOUNT_EMAIL is not set');
    process.exit(1);
  }

  if (!privateKey) {
    console.error('❌ GOOGLE_PRIVATE_KEY is not set');
    process.exit(1);
  }

  console.log('✅ Environment variables configured');
  console.log(`   Spreadsheet ID: ${spreadsheetId.substring(0, 10)}...`);
  console.log(`   Service Account: ${serviceAccountEmail}\n`);

  // สร้าง authenticated client
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: serviceAccountEmail,
      private_key: privateKey.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    // ทดสอบการเชื่อมต่อและดึง metadata
    console.log('📡 Testing connection...');
    const response = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
      includeGridData: false,
    });

    const spreadsheet = response.data;
    console.log('✅ Connection successful!\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('SPREADSHEET INFORMATION');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Title: ${spreadsheet.properties?.title}`);
    console.log(`ID: ${spreadsheetId}`);
    console.log(`Locale: ${spreadsheet.properties?.locale}`);
    console.log(`Timezone: ${spreadsheet.properties?.timeZone}`);
    console.log(`Total Sheets: ${spreadsheet.sheets?.length || 0}\n`);

    // แสดงรายชื่อ sheets ทั้งหมด
    console.log('═══════════════════════════════════════════════════════════');
    console.log('SHEETS DISCOVERED');
    console.log('═══════════════════════════════════════════════════════════\n');

    const sheetsList = spreadsheet.sheets || [];
    sheetsList.forEach((sheet, index) => {
      const properties = sheet.properties;
      console.log(`${index + 1}. ${properties?.title}`);
      console.log(`   Sheet ID: ${properties?.sheetId}`);
      console.log(`   Index: ${properties?.index}`);
      console.log(`   Type: ${properties?.sheetType}`);
      console.log(`   Hidden: ${properties?.hidden ? 'Yes' : 'No'}`);
      console.log(`   Grid: ${properties?.gridProperties?.rowCount} rows × ${properties?.gridProperties?.columnCount} columns`);
      console.log('');
    });

    // อ่าน headers และ sample data จากทุก sheets
    console.log('═══════════════════════════════════════════════════════════');
    console.log('READING HEADERS AND SAMPLE DATA');
    console.log('═══════════════════════════════════════════════════════════\n');

    const allSheetsData = [];

    for (const sheet of sheetsList) {
      const sheetName = sheet.properties?.title;
      if (!sheetName) continue;

      console.log(`📄 Sheet: ${sheetName}`);

      try {
        // อ่าน headers (แถวแรก)
        const headerResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: spreadsheetId,
          range: `${sheetName}!1:1`,
        });

        const headers = headerResponse.data.values?.[0] || [];
        console.log(`   Headers (${headers.length}): ${headers.join(', ')}`);

        // อ่าน sample data (5 แถวแรก)
        const dataResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: spreadsheetId,
          range: `${sheetName}!A1:Z5`,
        });

        const rows = dataResponse.data.values || [];
        console.log(`   Sample Rows: ${rows.length - 1} (excluding header)`);

        // แสดง sample data
        if (rows.length > 1) {
          console.log('   Sample Data:');
          rows.slice(1, Math.min(4, rows.length)).forEach((row, rowIndex) => {
            const rowData = headers.map((header, colIndex) => ({
              [header]: row[colIndex] || '',
            }));
            console.log(`     Row ${rowIndex + 1}:`, JSON.stringify(rowData));
          });
        }

        allSheetsData.push({
          sheetName,
          sheetId: sheet.properties?.sheetId,
          headers,
          rowCount: sheet.properties?.gridProperties?.rowCount,
          columnCount: sheet.properties?.gridProperties?.columnCount,
          sampleData: rows,
        });

        console.log('');
      } catch (error) {
        console.error(`   ❌ Error reading sheet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.log('');
      }
    }

    // สร้างรายงาน
    console.log('═══════════════════════════════════════════════════════════');
    console.log('DISCOVERY COMPLETE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\n✅ Successfully discovered ${sheetsList.length} sheets`);
    console.log(`✅ Read headers and sample data from all sheets\n`);

    // บันทึกข้อมูลเป็น JSON
    const reportData = {
      spreadsheetId,
      spreadsheetTitle: spreadsheet.properties?.title,
      discoveredAt: new Date().toISOString(),
      totalSheets: sheetsList.length,
      sheets: allSheetsData,
    };

    const fs = await import('fs');
    const reportPath = path.resolve(__dirname, '../../discovery-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`📄 Report saved to: ${reportPath}\n`);

    return reportData;
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    
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
    
    process.exit(1);
  }
}

discoverAllSheets();
