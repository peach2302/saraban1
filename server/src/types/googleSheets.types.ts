/**
 * Google Sheets Type Definitions
 * E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์
 */

// ============================================
// Connection Status Types
// ============================================

export type ConnectionStatus =
  | 'CONNECTED'
  | 'NOT_CONNECTED'
  | 'CONFIGURATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'SPREADSHEET_NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'UNKNOWN_ERROR';

export interface ConnectionTestResult {
  status: ConnectionStatus;
  message: string;
  spreadsheetId?: string;
  spreadsheetTitle?: string;
  sheetCount?: number;
  timestamp: string;
  // ไม่เปิดเผย credentials
}

// ============================================
// Spreadsheet Metadata Types
// ============================================

export interface SpreadsheetMetadata {
  spreadsheetId: string;
  title: string;
  locale: string;
  autoRecalc: string;
  timezone: string;
  defaultFormat: unknown;
  sheets: SheetMetadata[];
}

export interface SheetMetadata {
  sheetId: number;
  title: string;
  index: number;
  sheetType: string;
  gridProperties: {
    rowCount: number;
    columnCount: number;
    frozenRowCount?: number;
    frozenColumnCount?: number;
  };
}

// ============================================
// Sheet Data Types
// ============================================

export interface SheetHeaders {
  sheetName: string;
  headers: string[];
  headerCount: number;
}

export interface SheetRow {
  rowIndex: number;
  data: Record<string, string>;
}

export interface SheetData {
  sheetName: string;
  headers: string[];
  rows: SheetRow[];
  totalRows: number;
  totalColumns: number;
}

// ============================================
// Schema Discovery Types
// ============================================

export interface SheetSchema {
  sheetName: string;
  headers: string[];
  sampleRows: SheetRow[];
  rowCount: number;
  columnCount: number;
  inferredTypes: Record<string, InferredType>;
}

export interface InferredType {
  column: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'mixed' | 'empty';
  sampleValues: string[];
  nonEmptyCount: number;
  totalCount: number;
}

export interface SpreadsheetSchema {
  spreadsheetId: string;
  spreadsheetTitle: string;
  sheets: SheetSchema[];
  discoveredAt: string;
}

// ============================================
// API Request/Response Types
// ============================================

export interface GetRowsRequest {
  sheetName: string;
  range?: string;
  limit?: number;
  offset?: number;
}

export interface FindRowRequest {
  sheetName: string;
  column: string;
  value: string;
}

export interface AppendRowRequest {
  sheetName: string;
  data: Record<string, string>;
}

export interface UpdateRowRequest {
  sheetName: string;
  rowIndex: number;
  data: Record<string, string>;
}

export interface BatchUpdateRequest {
  sheetName: string;
  updates: Array<{
    rowIndex: number;
    data: Record<string, string>;
  }>;
}

// ============================================
// Error Types
// ============================================

export interface GoogleSheetsError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
}

export type GoogleSheetsErrorCode =
  | 'CONFIGURATION_MISSING'
  | 'AUTHENTICATION_FAILED'
  | 'SPREADSHEET_NOT_FOUND'
  | 'SHEET_NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_RANGE'
  | 'INVALID_DATA'
  | 'API_ERROR'
  | 'UNKNOWN_ERROR';

// ============================================
// Service Configuration Types
// ============================================

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  serviceAccountEmail: string;
  privateKey: string;
  scopes: string[];
}

export interface ServiceConfig {
  port: number;
  nodeEnv: string;
  frontendUrl: string;
  logLevel: string;
  googleSheets: GoogleSheetsConfig;
}
