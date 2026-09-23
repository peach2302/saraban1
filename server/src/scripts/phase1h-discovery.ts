/**
 * Phase 1H — Google Sheets Full Discovery & Validation
 * E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์
 * เทศบาลตำบลป่งไฮ
 * 
 * READ ONLY — ห้ามเขียน/แก้ไขข้อมูลใน Google Sheets
 * 
 * Features:
 * - อ่าน Google Sheets ทั้ง 10 Sheets
 * - ตรวจสอบ columns ที่คาดหวัง
 * - ตรวจสอบ relationships
 * - ตรวจสอบ duplicates
 * - สร้าง master organization mapping
 * - สร้างรายงานการตรวจสอบแบบละเอียด
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
// Expected Sheet Definitions
// ============================================

const EXPECTED_SHEETS = [
  'Users',
  'Positions',
  'Departments',
  'Units',
  'Documents',
  'Incoming',
  'Outgoing',
  'Workflow',
  'Signatures',
  'AuditLog',
];

const EXPECTED_COLUMNS: Record<string, string[]> = {
  Users: [
    'User_ID',
    'ชื่อ-สกุล',
    'Position_ID',
    'ตำแหน่ง',
    'Department_ID',
    'Unit_ID',
    'Role',
    'Email',
    'สถานะ',
    'Can_View_All',
    'Can_Sign',
  ],
  Positions: [
    'Position_ID',
    'ตำแหน่ง',
    'Department_ID',
    'Role',
    'ลำดับอนุมัติ',
  ],
  Departments: [
    'Department_ID',
    'ชื่อหน่วยงาน',
    'สถานะ',
  ],
  Units: [
    'Unit_ID',
    'ชื่อฝ่าย/งาน',
    'Department_ID',
    'ประเภท',
    'สถานะ',
  ],
  Documents: [
    'Document_ID',
    'ประเภททะเบียน',
    'ประเภทหนังสือ',
    'Incoming_ID',
    'Outgoing_ID',
    'เลขที่หนังสือ',
    'เรื่อง',
    'ลงวันที่',
    'จาก',
    'ถึง',
    'หน่วยงานรับผิดชอบ',
    'งานรับผิดชอบ',
    'ชั้นความลับ',
    'ความเร่งด่วน',
    'สถานะ',
    'File_ID',
    'วันที่สร้าง',
    'ผู้สร้าง',
  ],
  Incoming: [
    'Incoming_ID',
    'Document_ID',
    'เลขทะเบียนรับ',
    'เลขที่หนังสือ',
    'ลงวันที่',
    'จาก',
    'ถึง',
    'เรื่อง',
    'หน่วยงานรับผิดชอบ',
    'งานรับผิดชอบ',
    'ชั้นความลับ',
    'ความเร่งด่วน',
    'File_ID',
    'วันที่รับ',
    'ผู้รับหนังสือ',
    'สถานะ',
  ],
  Outgoing: [
    'Outgoing_ID',
    'Document_ID',
    'เลขที่หนังสือ',
    'ประเภทหนังสือ',
    'ลงวันที่',
    'จาก',
    'ถึง',
    'เรื่อง',
    'หน่วยงานเจ้าของเรื่อง',
    'งานเจ้าของเรื่อง',
    'ชั้นความลับ',
    'ความเร่งด่วน',
    'File_ID',
    'ผู้จัดทำ',
    'สถานะ',
    'วันที่ส่ง',
  ],
  Workflow: [
    'Workflow_ID',
    'Document_ID',
    'ลำดับ',
    'จากผู้ดำเนินการ',
    'ถึงผู้ดำเนินการ',
    'การดำเนินการ',
    'คำสั่ง/ความเห็น',
    'วันที่ส่ง',
    'วันที่รับ',
    'สถานะ',
    'หมายเหตุ',
  ],
  Signatures: [
    'Signature_ID',
    'User_ID',
    'ชื่อ-สกุล',
    'ตำแหน่ง',
    'Signature_File_ID',
    'วันที่บันทึก',
    'สถานะ',
  ],
  AuditLog: [
    'Audit_ID',
    'Document_ID',
    'การกระทำ',
    'รายละเอียด',
    'วันที่เวลา',
    'IP_Address',
  ],
};

// ============================================
// Types
// ============================================

interface SheetData {
  sheetName: string;
  headers: string[];
  rows: Record<string, string>[];
  rowCount: number;
  columnCount: number;
  readStatus: 'SUCCESS' | 'FAILED' | 'EMPTY';
  missingColumns: string[];
  extraColumns: string[];
  error?: string;
}

interface ValidationResult {
  duplicates: number;
  missing: number;
  invalid: number;
  details: string[];
}

interface UsersValidation extends ValidationResult {
  duplicateUserIds: string[];
  missingUserIds: number;
  duplicateEmails: string[];
  missingEmails: number;
  invalidPositionIds: string[];
  invalidDepartmentIds: string[];
  invalidUnitIds: string[];
  roleValues: Record<string, number>;
  statusValues: Record<string, number>;
  canViewAllValues: Record<string, number>;
  canSignValues: Record<string, number>;
}

interface PositionsValidation extends ValidationResult {
  duplicatePositionIds: string[];
  missingPositionIds: number;
  invalidDepartmentIds: string[];
  roleValues: Record<string, number>;
  approvalSequenceObserved: Record<string, number>;
  approvalSequenceSemantics: string;
}

interface DepartmentsValidation extends ValidationResult {
  duplicateDepartmentIds: string[];
  missingDepartmentIds: number;
  statusValues: Record<string, number>;
}

interface UnitsValidation extends ValidationResult {
  duplicateUnitIds: string[];
  blankUnitIds: number;
  invalidDepartmentIds: string[];
  statusValues: Record<string, number>;
  typeValues: Record<string, number>;
  blankUnitIdRows: number;
}

interface RelationshipResult {
  from: string;
  fromField: string;
  to: string;
  toField: string;
  status: 'VERIFIED' | 'UNVERIFIED_NO_DATA' | 'UNVERIFIED' | 'FAILED';
  matchedCount: number;
  orphanCount: number;
  details: string[];
}

interface OrganizationMapping {
  departments: Record<string, {
    name: string;
    units: string[];
    users: string[];
  }>;
  units: Record<string, {
    name: string;
    departmentId: string;
    users: string[];
  }>;
  unresolved: string[];
}

interface DiscoveryResult {
  timestamp: string;
  spreadsheet: {
    id: string;
    title: string;
  };
  expectedSheetCount: number;
  actualSheetCount: number;
  missingExpectedSheets: string[];
  unexpectedSheets: string[];
  sheets: Record<string, SheetData>;
  users: {
    data: SheetData;
    validation: UsersValidation;
  } | null;
  positions: {
    data: SheetData;
    validation: PositionsValidation;
  } | null;
  departments: {
    data: SheetData;
    validation: DepartmentsValidation;
  } | null;
  units: {
    data: SheetData;
    validation: UnitsValidation;
  } | null;
  documents: SheetData | null;
  incoming: SheetData | null;
  outgoing: SheetData | null;
  workflow: SheetData | null;
  signatures: SheetData | null;
  auditLog: SheetData | null;
  relationships: RelationshipResult[];
  organizationMapping: OrganizationMapping;
  gaps: string[];
  warnings: string[];
  errors: string[];
  overallStatus: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'BLOCKED';
}

// ============================================
// Helper Functions
// ============================================

function findDuplicates(arr: string[]): string[] {
  const counts: Record<string, number> = {};
  arr.forEach(item => {
    counts[item] = (counts[item] || 0) + 1;
  });
  return Object.keys(counts).filter(item => counts[item] > 1);
}

function validateColumns(actual: string[], expected: string[]): { missing: string[]; extra: string[] } {
  const missing = expected.filter(col => !actual.includes(col));
  const extra = actual.filter(col => !expected.includes(col));
  return { missing, extra };
}

// ============================================
// Main Discovery Function
// ============================================

async function discoverAllSheets(): Promise<DiscoveryResult> {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  const result: DiscoveryResult = {
    timestamp: new Date().toISOString(),
    spreadsheet: {
      id: spreadsheetId || '',
      title: '',
    },
    expectedSheetCount: EXPECTED_SHEETS.length,
    actualSheetCount: 0,
    missingExpectedSheets: [],
    unexpectedSheets: [],
    sheets: {},
    users: null,
    positions: null,
    departments: null,
    units: null,
    documents: null,
    incoming: null,
    outgoing: null,
    workflow: null,
    signatures: null,
    auditLog: null,
    relationships: [],
    organizationMapping: {
      departments: {},
      units: {},
      unresolved: [],
    },
    gaps: [],
    warnings: [],
    errors: [],
    overallStatus: 'BLOCKED',
  };

  // ตรวจสอบ credentials
  if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
    result.errors.push('Missing Google Sheets credentials in .env');
    result.overallStatus = 'FAILED';
    return result;
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('PHASE 1H — GOOGLE SHEETS FULL DISCOVERY & VALIDATION');
  console.log('E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์');
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
    result.spreadsheet.title = spreadsheet.properties?.title || '';
    const sheetsList = spreadsheet.sheets || [];
    result.actualSheetCount = sheetsList.length;

    console.log(`✅ Connected successfully!`);
    console.log(`   Title: ${result.spreadsheet.title}`);
    console.log(`   Total Sheets: ${result.actualSheetCount}\n`);

    // ตรวจสอบ expected sheets
    const actualSheetNames = sheetsList.map(s => s.properties?.title).filter(Boolean) as string[];
    result.missingExpectedSheets = EXPECTED_SHEETS.filter(s => !actualSheetNames.includes(s));
    result.unexpectedSheets = actualSheetNames.filter(s => !EXPECTED_SHEETS.includes(s));

    if (result.missingExpectedSheets.length > 0) {
      result.warnings.push(`Missing expected sheets: ${result.missingExpectedSheets.join(', ')}`);
    }

    if (result.unexpectedSheets.length > 0) {
      result.warnings.push(`Unexpected sheets found: ${result.unexpectedSheets.join(', ')}`);
    }

    // อ่านข้อมูลทุก sheet
    for (const sheet of sheetsList) {
      const sheetName = sheet.properties?.title;
      if (!sheetName) continue;

      console.log(`📄 Reading sheet: ${sheetName}`);

      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `'${sheetName}'`,
          valueRenderOption: 'FORMATTED_VALUE',
        });

        const values = response.data.values || [];
        const headers = values[0] || [];
        const dataRows = values.slice(1);

        // แปลง rows เป็น objects
        const rows: Record<string, string>[] = dataRows.map(row => {
          const obj: Record<string, string> = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });

        // ตรวจสอบ columns
        const expectedColumns = EXPECTED_COLUMNS[sheetName] || [];
        const { missing: missingColumns, extra: extraColumns } = validateColumns(headers, expectedColumns);

        const sheetData: SheetData = {
          sheetName,
          headers,
          rows,
          rowCount: rows.length,
          columnCount: headers.length,
          readStatus: rows.length === 0 ? 'EMPTY' : 'SUCCESS',
          missingColumns,
          extraColumns,
        };

        result.sheets[sheetName] = sheetData;

        console.log(`   ✅ Headers: ${headers.length}`);
        console.log(`   ✅ Data Rows: ${rows.length}`);
        
        if (missingColumns.length > 0) {
          console.log(`   ⚠️  Missing columns: ${missingColumns.join(', ')}`);
          result.warnings.push(`${sheetName}: Missing columns: ${missingColumns.join(', ')}`);
        }

        if (extraColumns.length > 0) {
          console.log(`   ℹ️  Extra columns: ${extraColumns.join(', ')}`);
        }

        if (rows.length === 0) {
          console.log(`   ⚠️  Sheet is empty (headers only)\n`);
        } else {
          console.log('');
        }
      } catch (error) {
        const errorMsg = `Failed to read sheet "${sheetName}": ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`   ❌ ${errorMsg}\n`);
        result.errors.push(errorMsg);

        result.sheets[sheetName] = {
          sheetName,
          headers: [],
          rows: [],
          rowCount: 0,
          columnCount: 0,
          readStatus: 'FAILED',
          missingColumns: [],
          extraColumns: [],
          error: errorMsg,
        };
      }
    }

    // Validate แต่ละ sheet
    console.log('🔍 Validating sheets...\n');

    // Users validation
    if (result.sheets.Users) {
      result.users = validateUsers(result.sheets.Users);
    }

    // Positions validation
    if (result.sheets.Positions) {
      result.positions = validatePositions(result.sheets.Positions);
    }

    // Departments validation
    if (result.sheets.Departments) {
      result.departments = validateDepartments(result.sheets.Departments);
    }

    // Units validation
    if (result.sheets.Units) {
      result.units = validateUnits(result.sheets.Units);
    }

    // Assign sheets
    result.documents = result.sheets.Documents || null;
    result.incoming = result.sheets.Incoming || null;
    result.outgoing = result.sheets.Outgoing || null;
    result.workflow = result.sheets.Workflow || null;
    result.signatures = result.sheets.Signatures || null;
    result.auditLog = result.sheets.AuditLog || null;

    // Validate relationships
    console.log('🔗 Validating relationships...\n');
    result.relationships = validateRelationships(result);

    // Create organization mapping
    console.log('🏢 Creating organization mapping...\n');
    result.organizationMapping = createOrganizationMapping(result);

    // Determine overall status
    result.overallStatus = determineOverallStatus(result);

    // บันทึกผลลัพธ์
    const reportPath = path.resolve(__dirname, '../../../PHASE-1H-DISCOVERY-RESULT.json');
    fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));

    console.log('═══════════════════════════════════════════════════════════');
    console.log('DISCOVERY COMPLETE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\nOverall Status: ${result.overallStatus}`);
    console.log(`Expected Sheets: ${result.expectedSheetCount}`);
    console.log(`Actual Sheets: ${result.actualSheetCount}`);
    console.log(`Missing Expected: ${result.missingExpectedSheets.length}`);
    console.log(`Unexpected: ${result.unexpectedSheets.length}`);
    console.log(`Errors: ${result.errors.length}`);
    console.log(`Warnings: ${result.warnings.length}`);
    console.log(`Gaps: ${result.gaps.length}`);
    console.log(`\n✅ Report saved to: ${reportPath}\n`);

    return result;
  } catch (error) {
    console.error('\n❌ Connection failed:', error instanceof Error ? error.message : 'Unknown error');
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    result.overallStatus = 'FAILED';
    return result;
  }
}

// ============================================
// Validation Functions
// ============================================

function validateUsers(sheet: SheetData): { data: SheetData; validation: UsersValidation } {
  const userIds = sheet.rows.map(r => r.User_ID).filter(Boolean);
  const emails = sheet.rows.map(r => r.Email).filter(Boolean);
  const positionIds = sheet.rows.map(r => r.Position_ID).filter(Boolean);
  const departmentIds = sheet.rows.map(r => r.Department_ID).filter(Boolean);
  const unitIds = sheet.rows.map(r => r.Unit_ID).filter(Boolean);

  const roleValues: Record<string, number> = {};
  const statusValues: Record<string, number> = {};
  const canViewAllValues: Record<string, number> = {};
  const canSignValues: Record<string, number> = {};

  sheet.rows.forEach(row => {
    if (row.Role) roleValues[row.Role] = (roleValues[row.Role] || 0) + 1;
    if (row['สถานะ']) statusValues[row['สถานะ']] = (statusValues[row['สถานะ']] || 0) + 1;
    if (row.Can_View_All) canViewAllValues[row.Can_View_All] = (canViewAllValues[row.Can_View_All] || 0) + 1;
    if (row.Can_Sign) canSignValues[row.Can_Sign] = (canSignValues[row.Can_Sign] || 0) + 1;
  });

  const validation: UsersValidation = {
    duplicates: findDuplicates(userIds).length,
    missing: sheet.rows.filter(r => !r.User_ID).length,
    invalid: 0,
    details: [],
    duplicateUserIds: findDuplicates(userIds),
    missingUserIds: sheet.rows.filter(r => !r.User_ID).length,
    duplicateEmails: findDuplicates(emails),
    missingEmails: sheet.rows.filter(r => !r.Email).length,
    invalidPositionIds: [],
    invalidDepartmentIds: [],
    invalidUnitIds: [],
    roleValues,
    statusValues,
    canViewAllValues,
    canSignValues,
  };

  if (validation.duplicateUserIds.length > 0) {
    validation.details.push(`Duplicate User_IDs: ${validation.duplicateUserIds.join(', ')}`);
  }

  if (validation.duplicateEmails.length > 0) {
    validation.details.push(`Duplicate Emails: ${validation.duplicateEmails.join(', ')}`);
  }

  return { data: sheet, validation };
}

function validatePositions(sheet: SheetData): { data: SheetData; validation: PositionsValidation } {
  const positionIds = sheet.rows.map(r => r.Position_ID).filter(Boolean);
  const departmentIds = sheet.rows.map(r => r.Department_ID).filter(Boolean);

  const roleValues: Record<string, number> = {};
  const approvalSequenceObserved: Record<string, number> = {};

  sheet.rows.forEach(row => {
    if (row.Role) roleValues[row.Role] = (roleValues[row.Role] || 0) + 1;
    if (row['ลำดับอนุมัติ']) {
      approvalSequenceObserved[row['ลำดับอนุมัติ']] = (approvalSequenceObserved[row['ลำดับอนุมัติ']] || 0) + 1;
    }
  });

  const validation: PositionsValidation = {
    duplicates: findDuplicates(positionIds).length,
    missing: sheet.rows.filter(r => !r.Position_ID).length,
    invalid: 0,
    details: [],
    duplicatePositionIds: findDuplicates(positionIds),
    missingPositionIds: sheet.rows.filter(r => !r.Position_ID).length,
    invalidDepartmentIds: [],
    roleValues,
    approvalSequenceObserved,
    approvalSequenceSemantics: 'UNVERIFIED',
  };

  if (validation.duplicatePositionIds.length > 0) {
    validation.details.push(`Duplicate Position_IDs: ${validation.duplicatePositionIds.join(', ')}`);
  }

  return { data: sheet, validation };
}

function validateDepartments(sheet: SheetData): { data: SheetData; validation: DepartmentsValidation } {
  const departmentIds = sheet.rows.map(r => r.Department_ID).filter(Boolean);

  const statusValues: Record<string, number> = {};
  sheet.rows.forEach(row => {
    if (row['สถานะ']) statusValues[row['สถานะ']] = (statusValues[row['สถานะ']] || 0) + 1;
  });

  const validation: DepartmentsValidation = {
    duplicates: findDuplicates(departmentIds).length,
    missing: sheet.rows.filter(r => !r.Department_ID).length,
    invalid: 0,
    details: [],
    duplicateDepartmentIds: findDuplicates(departmentIds),
    missingDepartmentIds: sheet.rows.filter(r => !r.Department_ID).length,
    statusValues,
  };

  if (validation.duplicateDepartmentIds.length > 0) {
    validation.details.push(`Duplicate Department_IDs: ${validation.duplicateDepartmentIds.join(', ')}`);
  }

  return { data: sheet, validation };
}

function validateUnits(sheet: SheetData): { data: SheetData; validation: UnitsValidation } {
  const unitIds = sheet.rows.map(r => r.Unit_ID).filter(Boolean);
  const departmentIds = sheet.rows.map(r => r.Department_ID).filter(Boolean);

  const statusValues: Record<string, number> = {};
  const typeValues: Record<string, number> = {};

  sheet.rows.forEach(row => {
    if (row['สถานะ']) statusValues[row['สถานะ']] = (statusValues[row['สถานะ']] || 0) + 1;
    if (row['ประเภท']) typeValues[row['ประเภท']] = (typeValues[row['ประเภท']] || 0) + 1;
  });

  const blankUnitIdRows = sheet.rows.filter(r => !r.Unit_ID).length;

  const validation: UnitsValidation = {
    duplicates: findDuplicates(unitIds).length,
    missing: sheet.rows.filter(r => !r.Unit_ID).length,
    invalid: 0,
    details: [],
    duplicateUnitIds: findDuplicates(unitIds),
    blankUnitIds: blankUnitIdRows,
    invalidDepartmentIds: [],
    statusValues,
    typeValues,
    blankUnitIdRows,
  };

  if (validation.duplicateUnitIds.length > 0) {
    validation.details.push(`Duplicate Unit_IDs: ${validation.duplicateUnitIds.join(', ')}`);
  }

  if (blankUnitIdRows > 0) {
    validation.details.push(`Rows with blank Unit_ID: ${blankUnitIdRows}`);
  }

  return { data: sheet, validation };
}

// ============================================
// Relationship Validation
// ============================================

function validateRelationships(result: DiscoveryResult): RelationshipResult[] {
  const relationships: RelationshipResult[] = [];

  // Users.Position_ID → Positions.Position_ID
  if (result.users && result.positions) {
    const positionIds = new Set(result.positions.data.rows.map(r => r.Position_ID));
    const userPositionIds = result.users.data.rows.map(r => r.Position_ID).filter(Boolean);
    const orphans = userPositionIds.filter(id => !positionIds.has(id));

    relationships.push({
      from: 'Users',
      fromField: 'Position_ID',
      to: 'Positions',
      toField: 'Position_ID',
      status: orphans.length === 0 ? 'VERIFIED' : 'FAILED',
      matchedCount: userPositionIds.length - orphans.length,
      orphanCount: orphans.length,
      details: orphans.length > 0 ? [`Orphan Position_IDs: ${orphans.join(', ')}`] : [],
    });
  } else {
    relationships.push({
      from: 'Users',
      fromField: 'Position_ID',
      to: 'Positions',
      toField: 'Position_ID',
      status: 'UNVERIFIED_NO_DATA',
      matchedCount: 0,
      orphanCount: 0,
      details: ['Missing sheet data'],
    });
  }

  // Users.Department_ID → Departments.Department_ID
  if (result.users && result.departments) {
    const departmentIds = new Set(result.departments.data.rows.map(r => r.Department_ID));
    const userDepartmentIds = result.users.data.rows.map(r => r.Department_ID).filter(Boolean);
    const orphans = userDepartmentIds.filter(id => !departmentIds.has(id));

    relationships.push({
      from: 'Users',
      fromField: 'Department_ID',
      to: 'Departments',
      toField: 'Department_ID',
      status: orphans.length === 0 ? 'VERIFIED' : 'FAILED',
      matchedCount: userDepartmentIds.length - orphans.length,
      orphanCount: orphans.length,
      details: orphans.length > 0 ? [`Orphan Department_IDs: ${orphans.join(', ')}`] : [],
    });
  } else {
    relationships.push({
      from: 'Users',
      fromField: 'Department_ID',
      to: 'Departments',
      toField: 'Department_ID',
      status: 'UNVERIFIED_NO_DATA',
      matchedCount: 0,
      orphanCount: 0,
      details: ['Missing sheet data'],
    });
  }

  // Signatures.User_ID → Users.User_ID
  if (result.signatures && result.users) {
    const userIds = new Set(result.users.data.rows.map(r => r.User_ID));
    const signatureUserIds = result.signatures.rows.map(r => r.User_ID).filter(Boolean);
    const orphans = signatureUserIds.filter(id => !userIds.has(id));

    relationships.push({
      from: 'Signatures',
      fromField: 'User_ID',
      to: 'Users',
      toField: 'User_ID',
      status: orphans.length === 0 ? 'VERIFIED' : 'FAILED',
      matchedCount: signatureUserIds.length - orphans.length,
      orphanCount: orphans.length,
      details: orphans.length > 0 ? [`Orphan User_IDs: ${orphans.join(', ')}`] : [],
    });
  } else {
    relationships.push({
      from: 'Signatures',
      fromField: 'User_ID',
      to: 'Users',
      toField: 'User_ID',
      status: 'UNVERIFIED_NO_DATA',
      matchedCount: 0,
      orphanCount: 0,
      details: ['Missing sheet data'],
    });
  }

  return relationships;
}

// ============================================
// Organization Mapping
// ============================================

function createOrganizationMapping(result: DiscoveryResult): OrganizationMapping {
  const mapping: OrganizationMapping = {
    departments: {},
    units: {},
    unresolved: [],
  };

  // Build departments
  if (result.departments) {
    result.departments.data.rows.forEach(row => {
      const deptId = row.Department_ID;
      if (deptId) {
        mapping.departments[deptId] = {
          name: row['ชื่อหน่วยงาน'] || '',
          units: [],
          users: [],
        };
      }
    });
  }

  // Build units
  if (result.units) {
    result.units.data.rows.forEach(row => {
      const unitId = row.Unit_ID;
      const deptId = row.Department_ID;
      if (unitId) {
        mapping.units[unitId] = {
          name: row['ชื่อฝ่าย/งาน'] || '',
          departmentId: deptId || '',
          users: [],
        };

        if (deptId && mapping.departments[deptId]) {
          mapping.departments[deptId].units.push(unitId);
        }
      }
    });
  }

  // Build users
  if (result.users) {
    result.users.data.rows.forEach(row => {
      const userId = row.User_ID;
      const deptId = row.Department_ID;
      const unitId = row.Unit_ID;

      if (userId) {
        if (deptId && mapping.departments[deptId]) {
          mapping.departments[deptId].users.push(userId);
        }

        if (unitId && mapping.units[unitId]) {
          mapping.units[unitId].users.push(userId);
        }

        if (!deptId || !mapping.departments[deptId]) {
          mapping.unresolved.push(`User ${userId} has no valid department`);
        }
      }
    });
  }

  return mapping;
}

// ============================================
// Status Determination
// ============================================

function determineOverallStatus(result: DiscoveryResult): 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'BLOCKED' {
  if (result.errors.length > 0 && result.actualSheetCount === 0) {
    return 'FAILED';
  }

  if (result.missingExpectedSheets.length > 0) {
    return 'PARTIAL';
  }

  const failedSheets = Object.values(result.sheets).filter(s => s.readStatus === 'FAILED').length;
  if (failedSheets > 0) {
    return 'PARTIAL';
  }

  if (result.errors.length > 0) {
    return 'PARTIAL';
  }

  return 'SUCCESS';
}

// ============================================
// Execute
// ============================================

discoverAllSheets().then((result) => {
  process.exit(result.overallStatus === 'FAILED' || result.overallStatus === 'BLOCKED' ? 1 : 0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
