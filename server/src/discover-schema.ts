/**
 * Schema Discovery Script
 * E-Saraban Backend
 * 
 * ค้นพบโครงสร้างทั้งหมดของ Google Sheets
 * สร้างรายงาน Data Mapping
 * 
 * วิธีใช้:
 *   cd server
 *   npx tsx src/discover-schema.ts
 * 
 * ผลลัพธ์:
 *   - แสดงโครงสร้างทุก Sheet
 *   - สร้างไฟล์ DATA-MAPPING-REPORT.md
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import googleSheetsService from './services/googleSheets.service.js';
import { generateDataMappingFromSchema } from './services/dataMapping.service.js';
import { getConfigurationStatus } from './config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// โหลด .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function discoverSchema() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     E-Saraban — Schema Discovery                        ║');
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
    console.log('   STATUS: BLOCKED — GOOGLE SHEETS CONFIGURATION REQUIRED');
    process.exit(1);
  }

  console.log('   ✅ Configuration is complete');
  console.log('');

  // Step 2: ทดสอบการเชื่อมต่อ
  console.log('📋 Step 2: Testing Connection...');
  const connectionResult = await googleSheetsService.testConnection();

  if (connectionResult.status !== 'CONNECTED') {
    console.log('');
    console.log(`❌ CONNECTION FAILED: ${connectionResult.status}`);
    console.log(`   ${connectionResult.message}`);
    console.log('');
    console.log('   STATUS: BLOCKED — CONNECTION FAILED');
    process.exit(1);
  }

  console.log('   ✅ Connection successful');
  console.log(`   Spreadsheet: ${connectionResult.spreadsheetTitle}`);
  console.log(`   Sheets: ${connectionResult.sheetCount}`);
  console.log('');

  // Step 3: ค้นพบ Schema
  console.log('📋 Step 3: Discovering Schema...');
  const schema = await googleSheetsService.discoverSchema();
  console.log('   ✅ Schema discovery complete');
  console.log('');

  // Step 4: แสดงผลลัพธ์
  console.log('═══════════════════════════════════════════════════════════');
  console.log('SPREADSHEET INFORMATION');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Title: ${schema.spreadsheetTitle}`);
  console.log(`ID: ${maskId(schema.spreadsheetId)}`);
  console.log(`Total Sheets: ${schema.sheets.length}`);
  console.log(`Discovered At: ${schema.discoveredAt}`);
  console.log('');

  // Step 5: แสดงรายละเอียดแต่ละ Sheet
  console.log('═══════════════════════════════════════════════════════════');
  console.log('SHEET INVENTORY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  schema.sheets.forEach((sheet, index) => {
    console.log(`${index + 1}. ${sheet.sheetName}`);
    console.log(`   Rows: ${sheet.rowCount}`);
    console.log(`   Columns: ${sheet.columnCount}`);
    console.log(`   Headers:`);
    sheet.headers.forEach((header, colIndex) => {
      const inferredType = sheet.inferredTypes[header];
      const type = inferredType?.type || 'unknown';
      const nonEmpty = inferredType?.nonEmptyCount || 0;
      const total = inferredType?.totalCount || 0;
      console.log(`     ${colIndex + 1}. ${header} [${type}] (${nonEmpty}/${total} non-empty)`);
    });
    console.log('');
  });

  // Step 6: สร้าง Data Mapping
  console.log('═══════════════════════════════════════════════════════════');
  console.log('GENERATING DATA MAPPING REPORT');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  const report = generateDataMappingFromSchema(schema);

  // สร้าง Markdown report
  const markdown = generateMarkdownReport(report, schema);

  // บันทึกไฟล์
  const reportPath = path.resolve(__dirname, '../../DATA-MAPPING-REPORT.md');
  fs.writeFileSync(reportPath, markdown, 'utf-8');

  console.log(`✅ Data Mapping Report saved to: ${reportPath}`);
  console.log('');

  // Step 7: แสดงสรุป
  console.log('═══════════════════════════════════════════════════════════');
  console.log('SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log(`Sheets Discovered: ${schema.sheets.length}`);
  console.log(`Relationships Found: ${report.relationships.length}`);
  console.log(`Unknown Items: ${report.unknownItems.length}`);
  console.log(`Risks Identified: ${report.risks.length}`);
  console.log('');

  if (report.usersAudit) {
    console.log('Users Audit:');
    console.log(`  User ID Column: ${report.usersAudit.userIdColumn || 'NOT FOUND'}`);
    console.log(`  Email Column: ${report.usersAudit.emailColumn || 'NOT FOUND'}`);
    console.log(`  Role Column: ${report.usersAudit.roleColumn || 'NOT FOUND'}`);
    console.log(`  Password Source: ${report.usersAudit.passwordSource}`);
    console.log(`  Auth Readiness: ${report.usersAudit.authenticationReadiness}`);
    console.log('');
  }

  if (report.unknownItems.length > 0) {
    console.log('Unknown Items:');
    report.unknownItems.forEach((item) => {
      console.log(`  ⚠️  ${item}`);
    });
    console.log('');
  }

  if (report.risks.length > 0) {
    console.log('Risks:');
    report.risks.forEach((risk) => {
      console.log(`  ⚠️  ${risk}`);
    });
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('STATUS: SCHEMA DISCOVERY COMPLETE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
}

/**
 * สร้าง Markdown Report
 */
function generateMarkdownReport(report: any, schema: any): string {
  let md = '';

  md += '# E-Saraban Data Mapping Report\n\n';
  md += `**Generated:** ${report.generatedAt}\n\n`;
  md += '---\n\n';

  // Spreadsheet Information
  md += '## 1. Spreadsheet Information\n\n';
  md += `- **Title:** ${report.spreadsheetInfo.title}\n`;
  md += `- **ID:** ${report.spreadsheetInfo.id}\n`;
  md += `- **Number of Sheets:** ${report.spreadsheetInfo.sheetCount}\n`;
  md += `- **Connection Status:** ${report.spreadsheetInfo.connectionStatus}\n\n`;
  md += '---\n\n';

  // Sheet Inventory
  md += '## 2. Sheet Inventory\n\n';
  md += '| # | Sheet Name | Rows | Columns | Status |\n';
  md += '| - | ---------- | ---: | ------: | ------ |\n';
  schema.sheets.forEach((sheet: any, index: number) => {
    const status = sheet.rowCount > 0 ? '✅ OK' : '⚠️ EMPTY';
    md += `| ${index + 1} | ${sheet.sheetName} | ${sheet.rowCount} | ${sheet.columnCount} | ${status} |\n`;
  });
  md += '\n---\n\n';

  // Column Mapping
  md += '## 3. Column Mapping\n\n';
  for (const sheetMapping of report.sheets) {
    md += `### Sheet: ${sheetMapping.sheetName}\n\n`;
    md += '| Google Sheet Column | Application Field | Type | Required | Description | Status |\n';
    md += '| ------------------- | ----------------- | ---- | -------- | ----------- | ------ |\n';
    for (const col of sheetMapping.columns) {
      md += `| ${col.sheetColumn} | ${col.applicationField} | ${col.type} | ${col.required ? 'Yes' : 'No'} | ${col.description} | ${col.status} |\n`;
    }
    md += '\n';
  }
  md += '---\n\n';

  // Primary Key Candidates
  md += '## 4. Primary Key Candidates\n\n';
  for (const sheetMapping of report.sheets) {
    if (sheetMapping.primaryKey) {
      md += `- **${sheetMapping.sheetName}:** ${sheetMapping.primaryKey.column} (${sheetMapping.primaryKey.status})\n`;
    }
  }
  md += '\n---\n\n';

  // Relationships
  md += '## 5. Relationships\n\n';
  if (report.relationships.length === 0) {
    md += '*No relationships discovered yet*\n\n';
  } else {
    md += '| From Sheet | Column | To Sheet | Target Column | Status |\n';
    md += '| ---------- | ------ | -------- | ------------- | ------ |\n';
    for (const rel of report.relationships) {
      md += `| ${rel.fromSheet} | ${rel.fromColumn} | ${rel.toSheet} | ${rel.toColumn} | ${rel.status} |\n`;
    }
  }
  md += '\n---\n\n';

  // Users Audit
  if (report.usersAudit) {
    md += '## 6. Users Authentication Readiness\n\n';
    md += `- **User ID Column:** ${report.usersAudit.userIdColumn || 'NOT FOUND'}\n`;
    md += `- **Email Column:** ${report.usersAudit.emailColumn || 'NOT FOUND'}\n`;
    md += `- **Role Column:** ${report.usersAudit.roleColumn || 'NOT FOUND'}\n`;
    md += `- **Status Column:** ${report.usersAudit.statusColumn || 'NOT FOUND'}\n`;
    md += `- **Department Column:** ${report.usersAudit.departmentColumn || 'NOT FOUND'}\n`;
    md += `- **Unit Column:** ${report.usersAudit.unitColumn || 'NOT FOUND'}\n`;
    md += `- **Position Column:** ${report.usersAudit.positionColumn || 'NOT FOUND'}\n`;
    md += `- **Can_View_All Column:** ${report.usersAudit.canViewAllColumn || 'NOT FOUND'}\n`;
    md += `- **Can_Sign Column:** ${report.usersAudit.canSignColumn || 'NOT FOUND'}\n`;
    md += `- **Password Source:** ${report.usersAudit.passwordSource}\n`;
    md += `- **Authentication Readiness:** ${report.usersAudit.authenticationReadiness}\n\n`;
    md += '---\n\n';
  }

  // Unknown Items
  md += '## 7. Unknown / Unverified Items\n\n';
  if (report.unknownItems.length === 0) {
    md += '*No unknown items*\n\n';
  } else {
    report.unknownItems.forEach((item: string) => {
      md += `- ⚠️ ${item}\n`;
    });
  }
  md += '\n---\n\n';

  // Risks
  md += '## 8. Risks / Problems\n\n';
  if (report.risks.length === 0) {
    md += '*No risks identified*\n\n';
  } else {
    report.risks.forEach((risk: string) => {
      md += `- ⚠️ ${risk}\n`;
    });
  }
  md += '\n---\n\n';

  md += '*This report was auto-generated from Google Sheets schema discovery.*\n';

  return md;
}

/**
 * ปิดบัง ID
 */
function maskId(id: string): string {
  if (id.length <= 10) return '***';
  return id.substring(0, 6) + '...' + id.substring(id.length - 4);
}

// รัน script
discoverSchema().catch((error) => {
  console.error('');
  console.error('❌ FATAL ERROR');
  console.error('');
  console.error(`   ${error.message}`);
  console.error('');
  console.error('   STATUS: BLOCKED — ERROR OCCURRED');
  process.exit(1);
});
