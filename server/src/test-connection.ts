/**
 * Connection Test Script
 * E-Saraban Backend
 * 
 * ใช้ทดสอบการเชื่อมต่อกับ Google Sheets
 * 
 * วิธีใช้:
 *   cd server
 *   npm run test:connection
 * 
 * หรือ:
 *   npx tsx src/test-connection.ts
 */

import { getConfigurationStatus, validateConfig } from './config/env.js';
import googleSheetsService from './services/googleSheets.service.js';

async function testConnection() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     E-Saraban — Google Sheets Connection Test           ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  // Step 1: ตรวจสอบ Configuration
  console.log('📋 Step 1: Checking Configuration...');
  const configStatus = getConfigurationStatus();

  if (!configStatus.configured) {
    console.log('');
    console.log('❌ CONFIGURATION ERROR');
    console.log('');
    console.log('   Missing fields:');
    configStatus.missingFields.forEach((field) => {
      console.log(`   ❌ ${field}`);
    });
    console.log('');
    console.log('   วิธีแก้ไข:');
    console.log('   1. Copy .env.example → .env');
    console.log('   2. ใส่ค่าที่จำเป็น');
    console.log('   3. ลองใหม่อีกครั้ง');
    console.log('');
    console.log('   STATUS: NOT_CONNECTED');
    process.exit(1);
  }

  console.log('   ✅ Configuration is complete');
  console.log('');

  // Step 2: ตรวจสอบ Validation
  console.log('📋 Step 2: Validating Configuration...');
  const validation = validateConfig();

  if (!validation.valid) {
    console.log('');
    console.log('❌ VALIDATION ERRORS:');
    validation.errors.forEach((error) => {
      console.log(`   ❌ ${error}`);
    });
    console.log('');
    console.log('   STATUS: CONFIGURATION_ERROR');
    process.exit(1);
  }

  if (validation.warnings.length > 0) {
    console.log('   ⚠️  Warnings:');
    validation.warnings.forEach((warning) => {
      console.log(`   ⚠️  ${warning}`);
    });
  }

  console.log('   ✅ Configuration is valid');
  console.log('');

  // Step 3: ทดสอบเชื่อมต่อ
  console.log('📋 Step 3: Testing Google Sheets Connection...');

  try {
    const result = await googleSheetsService.testConnection();

    console.log('');
    switch (result.status) {
      case 'CONNECTED':
        console.log('✅ CONNECTION SUCCESSFUL');
        console.log('');
        console.log(`   Spreadsheet: ${result.spreadsheetTitle}`);
        console.log(`   ID: ${result.spreadsheetId}`);
        console.log(`   Sheets: ${result.sheetCount}`);
        console.log('');
        console.log('   STATUS: CONNECTED');
        console.log('');

        // Step 4: ดึง Sheet Names
        console.log('📋 Step 4: Discovering Sheets...');
        try {
          const metadata = await googleSheetsService.getSpreadsheetMetadata();
          console.log('');
          console.log('   📑 Found Sheets:');
          metadata.sheets.forEach((sheet, index) => {
            console.log(`   ${index + 1}. ${sheet.title} (${sheet.gridProperties.rowCount} rows × ${sheet.gridProperties.columnCount} cols)`);
          });
          console.log('');
          console.log('   STATUS: READY FOR DATA MAPPING');
        } catch (schemaError) {
          console.log('   ⚠️  Could not discover schema:', (schemaError as Error).message);
        }
        break;

      case 'AUTHENTICATION_ERROR':
        console.log('❌ AUTHENTICATION FAILED');
        console.log('');
        console.log(`   ${result.message}`);
        console.log('');
        console.log('   วิธีแก้ไข:');
        console.log('   1. ตรวจสอบ GOOGLE_SERVICE_ACCOUNT_EMAIL');
        console.log('   2. ตรวจสอบ GOOGLE_PRIVATE_KEY');
        console.log('   3. ตรวจสอบว่า Service Account มีสิทธิ์เข้าถึง Spreadsheet');
        console.log('');
        console.log('   STATUS: AUTHENTICATION_ERROR');
        break;

      case 'SPREADSHEET_NOT_FOUND':
        console.log('❌ SPREADSHEET NOT FOUND');
        console.log('');
        console.log(`   ${result.message}`);
        console.log('');
        console.log('   วิธีแก้ไข:');
        console.log('   1. ตรวจสอบ GOOGLE_SPREADSHEET_ID');
        console.log('   2. ตรวจสอบว่า Spreadsheet ยังอยู่');
        console.log('   3. ตรวจสอบว่า Share กับ Service Account แล้ว');
        console.log('');
        console.log('   STATUS: SPREADSHEET_NOT_FOUND');
        break;

      case 'CONFIGURATION_ERROR':
        console.log('❌ CONFIGURATION ERROR');
        console.log('');
        console.log(`   ${result.message}`);
        console.log('');
        console.log('   STATUS: CONFIGURATION_ERROR');
        break;

      default:
        console.log('❌ UNKNOWN ERROR');
        console.log('');
        console.log(`   ${result.message}`);
        console.log('');
        console.log('   STATUS: UNKNOWN_ERROR');
    }
  } catch (error) {
    console.log('');
    console.log('❌ TEST FAILED');
    console.log('');
    console.log(`   Error: ${(error as Error).message}`);
    console.log('');
    console.log('   STATUS: NOT_CONNECTED');
    process.exit(1);
  }

  console.log('');
  console.log('──────────────────────────────────────────────────────────');
  console.log(`   Test completed at: ${new Date().toISOString()}`);
  console.log('──────────────────────────────────────────────────────────');
  console.log('');
}

testConnection();
