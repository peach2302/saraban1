/**
 * Data Mapping Module
 * E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์
 * 
 * Module สำหรับสร้าง Data Mapping จาก Google Sheets Schema จริง
 * จะถูก populate เมื่อมี Spreadsheet ID และ Credentials
 * 
 * สถานะ: AWAITING REAL DATA FROM GOOGLE SHEETS
 */

import type { SpreadsheetSchema, SheetSchema } from '../types/googleSheets.types.js';

// ============================================
// Data Mapping Types
// ============================================

export interface ColumnMapping {
  sheetColumn: string;      // ชื่อ column ใน Google Sheets
  applicationField: string; // ชื่อ field ใน Application
  type: string;             // Data type
  required: boolean;        // Required หรือ optional
  description: string;      // คำอธิบาย
  status: 'VERIFIED' | 'INFERRED' | 'NOT_VERIFIED';
}

export interface SheetMapping {
  sheetName: string;
  columns: ColumnMapping[];
  primaryKey?: {
    column: string;
    status: 'CONFIRMED' | 'CANDIDATE' | 'NOT_VERIFIED';
  };
}

export interface RelationshipMapping {
  fromSheet: string;
  fromColumn: string;
  toSheet: string;
  toColumn: string;
  status: 'VERIFIED' | 'NOT_VERIFIED';
}

export interface DataMappingReport {
  spreadsheetInfo: {
    title: string;
    id: string; // masked
    sheetCount: number;
    connectionStatus: string;
  };
  sheets: SheetMapping[];
  relationships: RelationshipMapping[];
  usersAudit?: UsersAuditResult;
  unknownItems: string[];
  risks: string[];
  generatedAt: string;
}

export interface UsersAuditResult {
  userIdColumn?: string;
  emailColumn?: string;
  roleColumn?: string;
  statusColumn?: string;
  departmentColumn?: string;
  unitColumn?: string;
  positionColumn?: string;
  canViewAllColumn?: string;
  canSignColumn?: string;
  passwordSource: 'PRESENT_IN_SHEET' | 'NOT_PRESENT_IN_SHEET' | 'NOT_VERIFIED';
  authenticationReadiness: 'READY' | 'NEEDS_PASSWORD_SOURCE' | 'NOT_READY';
}

// ============================================
// Data Mapping Generator
// ============================================

/**
 * สร้าง Data Mapping จาก Schema จริง
 * ยังไม่ถูกเรียกจนกว่าจะมีข้อมูลจริงจาก Google Sheets
 */
export function generateDataMappingFromSchema(schema: SpreadsheetSchema): DataMappingReport {
  const report: DataMappingReport = {
    spreadsheetInfo: {
      title: schema.spreadsheetTitle,
      id: maskSpreadsheetId(schema.spreadsheetId),
      sheetCount: schema.sheets.length,
      connectionStatus: 'CONNECTED',
    },
    sheets: [],
    relationships: [],
    unknownItems: [],
    risks: [],
    generatedAt: new Date().toISOString(),
  };

  // สร้าง mapping สำหรับแต่ละ sheet
  for (const sheetSchema of schema.sheets) {
    const sheetMapping = generateSheetMapping(sheetSchema);
    report.sheets.push(sheetMapping);
  }

  // ค้นหา relationships
  report.relationships = discoverRelationships(schema.sheets);

  // ตรวจสอบ Users sheet
  const usersSheet = schema.sheets.find(s => 
    s.sheetName.toLowerCase().includes('user') || 
    s.sheetName.toLowerCase().includes('users')
  );
  
  if (usersSheet) {
    report.usersAudit = auditUsersSheet(usersSheet);
  }

  // ตรวจสอบปัญหา
  report.unknownItems = identifyUnknownItems(schema.sheets);
  report.risks = identifyRisks(schema.sheets);

  return report;
}

/**
 * สร้าง Sheet Mapping จาก Sheet Schema
 */
function generateSheetMapping(sheetSchema: SheetSchema): SheetMapping {
  const columns: ColumnMapping[] = sheetSchema.headers.map(header => {
    const inferredType = sheetSchema.inferredTypes[header];
    
    return {
      sheetColumn: header,
      applicationField: convertToCamelCase(header),
      type: inferredType?.type || 'string',
      required: isInferredRequired(header, inferredType),
      description: `Column: ${header}`,
      status: 'INFERRED' as const,
    };
  });

  // หา primary key candidate
  const primaryKey = findPrimaryKeyCandidate(sheetSchema);

  return {
    sheetName: sheetSchema.sheetName,
    columns,
    primaryKey,
  };
}

/**
 * ค้นพบ Relationships ระหว่าง Sheets
 */
function discoverRelationships(sheets: SheetSchema[]): RelationshipMapping[] {
  const relationships: RelationshipMapping[] = [];
  const allColumnNames = new Map<string, string[]>(); // columnName -> [sheetNames]

  // รวบรวม column names จากทุก sheet
  for (const sheet of sheets) {
    for (const header of sheet.headers) {
      if (!allColumnNames.has(header)) {
        allColumnNames.set(header, []);
      }
      allColumnNames.get(header)!.push(sheet.sheetName);
    }
  }

  // ค้นหา columns ที่ปรากฏในหลาย sheets (อาจเป็น foreign keys)
  for (const [columnName, sheetNames] of allColumnNames) {
    if (sheetNames.length > 1 && columnName.includes('_ID')) {
      // อาจเป็น foreign key
      for (const fromSheet of sheetNames) {
        for (const toSheet of sheetNames) {
          if (fromSheet !== toSheet) {
            relationships.push({
              fromSheet,
              fromColumn: columnName,
              toSheet,
              toColumn: columnName,
              status: 'NOT_VERIFIED', // ต้องตรวจสอบข้อมูลจริง
            });
          }
        }
      }
    }
  }

  return relationships;
}

/**
 * ตรวจสอบ Users Sheet
 */
function auditUsersSheet(sheetSchema: SheetSchema): UsersAuditResult {
  const headers = sheetSchema.headers.map(h => h.toLowerCase());
  
  const findColumn = (keywords: string[]): string | undefined => {
    for (const keyword of keywords) {
      const found = sheetSchema.headers.find(h => 
        h.toLowerCase().includes(keyword)
      );
      if (found) return found;
    }
    return undefined;
  };

  const result: UsersAuditResult = {
    userIdColumn: findColumn(['user_id', 'userid', 'id']),
    emailColumn: findColumn(['email']),
    roleColumn: findColumn(['role']),
    statusColumn: findColumn(['status', 'สถานะ']),
    departmentColumn: findColumn(['department', 'แผนก']),
    unitColumn: findColumn(['unit', 'งาน']),
    positionColumn: findColumn(['position', 'ตำแหน่ง']),
    canViewAllColumn: findColumn(['can_view_all', 'canviewall']),
    canSignColumn: findColumn(['can_sign', 'cansign']),
    passwordSource: 'NOT_VERIFIED',
    authenticationReadiness: 'NOT_READY',
  };

  // ตรวจสอบว่ามี password column หรือไม่
  const hasPassword = headers.some(h => 
    h.includes('password') || h.includes('รหัสผ่าน')
  );
  
  result.passwordSource = hasPassword ? 'PRESENT_IN_SHEET' : 'NOT_PRESENT_IN_SHEET';

  // ตรวจสอบ authentication readiness
  if (result.userIdColumn && result.emailColumn) {
    if (result.passwordSource === 'NOT_PRESENT_IN_SHEET') {
      result.authenticationReadiness = 'NEEDS_PASSWORD_SOURCE';
    } else {
      result.authenticationReadiness = 'READY';
    }
  }

  return result;
}

/**
 * หา Primary Key Candidate
 */
function findPrimaryKeyCandidate(sheetSchema: SheetSchema): SheetMapping['primaryKey'] {
  // หา column ที่มี "_ID" หรือ "ID" ในชื่อ
  const idColumns = sheetSchema.headers.filter(h => 
    h.toUpperCase().includes('_ID') || h.toUpperCase() === 'ID'
  );

  if (idColumns.length === 0) {
    return undefined;
  }

  // ตรวจสอบว่า column มีค่าไม่ซ้ำหรือไม่
  for (const col of idColumns) {
    const inferredType = sheetSchema.inferredTypes[col];
    if (inferredType && inferredType.nonEmptyCount === inferredType.totalCount) {
      // มีค่าครบทุกแถว
      return {
        column: col,
        status: 'CANDIDATE', // ต้องตรวจสอบข้อมูลจริงเพื่อยืนยัน
      };
    }
  }

  return {
    column: idColumns[0],
    status: 'NOT_VERIFIED',
  };
}

/**
 * ระบุ Unknown Items
 */
function identifyUnknownItems(sheets: SheetSchema[]): string[] {
  const unknowns: string[] = [];

  // ตรวจสอบว่ามี sheet ที่ไม่มีข้อมูลหรือไม่
  for (const sheet of sheets) {
    if (sheet.rowCount === 0) {
      unknowns.push(`Sheet "${sheet.sheetName}" ไม่มีข้อมูล`);
    }
    if (sheet.headers.length === 0) {
      unknowns.push(`Sheet "${sheet.sheetName}" ไม่มี headers`);
    }
  }

  return unknowns;
}

/**
 * ระบุ Risks
 */
function identifyRisks(sheets: SheetSchema[]): string[] {
  const risks: string[] = [];

  // ตรวจสอบ duplicate headers
  for (const sheet of sheets) {
    const headerCounts = new Map<string, number>();
    for (const header of sheet.headers) {
      headerCounts.set(header, (headerCounts.get(header) || 0) + 1);
    }
    
    for (const [header, count] of headerCounts) {
      if (count > 1) {
        risks.push(`Sheet "${sheet.sheetName}" มี duplicate header: "${header}" (${count} ครั้ง)`);
      }
    }
  }

  // ตรวจสอบ empty columns
  for (const sheet of sheets) {
    for (const [col, type] of Object.entries(sheet.inferredTypes)) {
      if (type.nonEmptyCount === 0) {
        risks.push(`Sheet "${sheet.sheetName}" column "${col}" ว่างเปล่าทั้งหมด`);
      }
    }
  }

  return risks;
}

// ============================================
// Utility Functions
// ============================================

/**
 * ปิดบัง Spreadsheet ID
 */
function maskSpreadsheetId(id: string): string {
  if (id.length <= 10) return '***';
  return id.substring(0, 6) + '...' + id.substring(id.length - 4);
}

/**
 * แปลงชื่อ column เป็น camelCase
 */
function convertToCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\u0e00-\u0e7f]/g, ' ')
    .split(' ')
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}

/**
 * ตรวจสอบว่า column เป็น required หรือไม่
 */
function isInferredRequired(header: string, inferredType?: any): boolean {
  // ถ้ามี "_ID" ในชื่อ หรือเป็น column แรก มักจะเป็น required
  if (header.toUpperCase().includes('_ID')) {
    return true;
  }
  
  // ถ้าไม่มีข้อมูลเลย อาจเป็น optional
  if (inferredType && inferredType.nonEmptyCount === 0) {
    return false;
  }

  // ถ้ามีข้อมูลครบทุกแถว อาจเป็น required
  if (inferredType && inferredType.nonEmptyCount === inferredType.totalCount) {
    return true;
  }

  return false;
}

// ============================================
// Export
// ============================================

export default {
  generateDataMappingFromSchema,
};
