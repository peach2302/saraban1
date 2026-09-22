/**
 * Google Sheets Service
 * E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์
 * 
 * Service สำหรับเชื่อมต่อกับ Google Sheets API
 * รองรับ: อ่าน metadata, headers, rows, เขียน, อัปเดต
 * 
 * สถานะ: READY FOR GOOGLE SHEETS CONFIGURATION
 * (ยังไม่มี Spreadsheet ID และ Credentials จริง)
 */

import { google, sheets_v4 } from 'googleapis';
import type {
  ConnectionTestResult,
  SpreadsheetMetadata,
  SheetMetadata,
  SheetHeaders,
  SheetData,
  SheetRow,
  SheetSchema,
  SpreadsheetSchema,
  InferredType,
  GoogleSheetsError,
  GoogleSheetsErrorCode,
} from '../types/googleSheets.types.js';
import { getConfigurationStatus, getGoogleSheetsConfig } from '../config/env.js';

// ============================================
// Logger
// ============================================

function log(level: string, message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [GoogleSheetsService] [${level.toUpperCase()}]`;
  if (data) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }
}

// ============================================
// Google Sheets Client
// ============================================

class GoogleSheetsService {
  private client: sheets_v4.Sheets | null = null;
  private spreadsheetId: string = '';
  private initialized: boolean = false;

  /**
   * เริ่มต้น Google Sheets Client
   * ใช้ Service Account สำหรับ Authentication
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const config = getGoogleSheetsConfig();

    if (!config.spreadsheetId) {
      throw this.createError(
        'CONFIGURATION_MISSING',
        'GOOGLE_SPREADSHEET_ID is not configured'
      );
    }

    if (!config.serviceAccountEmail || !config.privateKey) {
      throw this.createError(
        'CONFIGURATION_MISSING',
        'Google Service Account credentials are not configured'
      );
    }

    try {
      const auth = new google.auth.JWT({
        email: config.serviceAccountEmail,
        key: config.privateKey.replace(/\\n/g, '\n'),
        scopes: config.scopes,
      });

      this.client = google.sheets({ version: 'v4', auth });
      this.spreadsheetId = config.spreadsheetId;
      this.initialized = true;

      log('info', 'Google Sheets Service initialized successfully');
    } catch (error) {
      throw this.createError(
        'AUTHENTICATION_FAILED',
        'Failed to initialize Google Sheets client',
        error
      );
    }
  }

  /**
   * ตรวจสอบว่า Service ถูก initialize แล้วหรือยัง
   */
  private ensureInitialized(): sheets_v4.Sheets {
    if (!this.client) {
      throw this.createError(
        'CONFIGURATION_MISSING',
        'Google Sheets Service is not initialized. Call initialize() first.'
      );
    }
    return this.client;
  }

  // ============================================
  // Connection Test
  // ============================================

  /**
   * ทดสอบการเชื่อมต่อกับ Google Sheets
   * ไม่เปิดเผย credentials ในผลลัพธ์
   */
  async testConnection(): Promise<ConnectionTestResult> {
    const timestamp = new Date().toISOString();

    // ตรวจสอบ Configuration ก่อน
    const configStatus = getConfigurationStatus();
    if (!configStatus.configured) {
      return {
        status: 'CONFIGURATION_ERROR',
        message: `Missing configuration: ${configStatus.missingFields.join(', ')}`,
        timestamp,
      };
    }

    try {
      await this.initialize();
      const client = this.ensureInitialized();

      // ทดสอบอ่าน Spreadsheet metadata
      const response = await client.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
        includeGridData: false,
      });

      if (!response.data) {
        return {
          status: 'SPREADSHEET_NOT_FOUND',
          message: 'Spreadsheet not found or not accessible',
          timestamp,
        };
      }

      const sheetCount = response.data.sheets?.length || 0;

      return {
        status: 'CONNECTED',
        message: 'Successfully connected to Google Sheets',
        spreadsheetId: this.maskId(this.spreadsheetId),
        spreadsheetTitle: response.data.properties?.title || 'Unknown',
        sheetCount,
        timestamp,
      };
    } catch (error) {
      return this.handleConnectionError(error, timestamp);
    }
  }

  /**
   * จัดการ Connection Error โดยไม่เปิดเผยข้อมูลลับ
   */
  private handleConnectionError(error: unknown, timestamp: string): ConnectionTestResult {
    const err = error as { code?: number; message?: string; errors?: unknown[] };

    if (err.code === 401 || err.code === 403) {
      return {
        status: 'AUTHENTICATION_ERROR',
        message: 'Authentication failed. Check Service Account credentials and sharing permissions.',
        timestamp,
      };
    }

    if (err.code === 404) {
      return {
        status: 'SPREADSHEET_NOT_FOUND',
        message: 'Spreadsheet not found. Check GOOGLE_SPREADSHEET_ID.',
        timestamp,
      };
    }

    if (err.code === 400) {
      return {
        status: 'CONFIGURATION_ERROR',
        message: 'Invalid configuration. Check your settings.',
        timestamp,
      };
    }

    return {
      status: 'UNKNOWN_ERROR',
      message: `Connection failed: ${err.message || 'Unknown error'}`,
      timestamp,
    };
  }

  /**
   * ปิดบัง Spreadsheet ID เพื่อความปลอดภัย
   */
  private maskId(id: string): string {
    if (id.length <= 10) return '***';
    return id.substring(0, 6) + '...' + id.substring(id.length - 4);
  }

  // ============================================
  // Metadata Operations
  // ============================================

  /**
   * ดึง Metadata ของ Spreadsheet ทั้งหมด
   */
  async getSpreadsheetMetadata(): Promise<SpreadsheetMetadata> {
    const client = this.ensureInitialized();

    try {
      const response = await client.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
        includeGridData: false,
      });

      if (!response.data) {
        throw this.createError('SPREADSHEET_NOT_FOUND', 'Spreadsheet data is empty');
      }

      const sheets: SheetMetadata[] = (response.data.sheets || []).map((sheet) => ({
        sheetId: sheet.properties?.sheetId || 0,
        title: sheet.properties?.title || '',
        index: sheet.properties?.index || 0,
        sheetType: sheet.properties?.sheetType || 'GRID',
        gridProperties: {
          rowCount: sheet.properties?.gridProperties?.rowCount || 0,
          columnCount: sheet.properties?.gridProperties?.columnCount || 0,
          frozenRowCount: sheet.properties?.gridProperties?.frozenRowCount,
          frozenColumnCount: sheet.properties?.gridProperties?.frozenColumnCount,
        },
      }));

      return {
        spreadsheetId: this.spreadsheetId,
        title: response.data.properties?.title || '',
        locale: response.data.properties?.locale || '',
        autoRecalc: response.data.properties?.autoRecalc || '',
        timezone: response.data.properties?.timeZone || '',
        defaultFormat: response.data.properties?.defaultFormat,
        sheets,
      };
    } catch (error) {
      throw this.wrapError(error, 'Failed to get spreadsheet metadata');
    }
  }

  /**
   * ดึงรายชื่อ Sheets ทั้งหมด
   */
  async getSheetNames(): Promise<string[]> {
    const metadata = await this.getSpreadsheetMetadata();
    return metadata.sheets.map((sheet) => sheet.title);
  }

  // ============================================
  // Data Read Operations
  // ============================================

  /**
   * ดึง Headers (แถวแรก) ของ Sheet
   */
  async getHeaders(sheetName: string): Promise<SheetHeaders> {
    const client = this.ensureInitialized();

    try {
      const response = await client.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!1:1`,
      });

      const values = response.data.values || [];
      const headers = values[0] || [];

      return {
        sheetName,
        headers: headers.map((h) => String(h).trim()),
        headerCount: headers.length,
      };
    } catch (error) {
      throw this.wrapError(error, `Failed to get headers for sheet "${sheetName}"`);
    }
  }

  /**
   * ดึงข้อมูลทั้งหมดจาก Sheet
   */
  async getRows(sheetName: string, options?: {
    range?: string;
    limit?: number;
    offset?: number;
  }): Promise<SheetData> {
    const client = this.ensureInitialized();

    try {
      // ดึง headers ก่อน
      const headersResult = await this.getHeaders(sheetName);
      const headers = headersResult.headers;

      if (headers.length === 0) {
        return {
          sheetName,
          headers: [],
          rows: [],
          totalRows: 0,
          totalColumns: 0,
        };
      }

      // คำนวณ range
      const startRow = (options?.offset || 0) + 2; // +2 เพราะแถว 1 เป็น headers
      const endRow = options?.limit
        ? startRow + options.limit - 1
        : '';

      const range = options?.range ||
        `${sheetName}!A${startRow}:${endRow ? this.columnLetter(headers.length - 1) + endRow : ''}`;

      const response = await client.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: options?.range || `${sheetName}!A${startRow}:${this.columnLetter(headers.length - 1)}`,
        valueRenderOption: 'FORMATTED_VALUE',
      });

      const values = response.data.values || [];
      const rows: SheetRow[] = values.map((row, index) => {
        const data: Record<string, string> = {};
        headers.forEach((header, colIndex) => {
          data[header] = row[colIndex] ? String(row[colIndex]).trim() : '';
        });
        return {
          rowIndex: startRow + index,
          data,
        };
      });

      return {
        sheetName,
        headers,
        rows,
        totalRows: rows.length,
        totalColumns: headers.length,
      };
    } catch (error) {
      throw this.wrapError(error, `Failed to get rows for sheet "${sheetName}"`);
    }
  }

  /**
   * ค้นหา Row ตามเงื่อนไข
   */
  async findRow(sheetName: string, column: string, value: string): Promise<SheetRow | null> {
    const data = await this.getRows(sheetName);
    const found = data.rows.find((row) => row.data[column] === value);
    return found || null;
  }

  /**
   * ค้นหา Rows หลายแถวตามเงื่อนไข
   */
  async findRows(sheetName: string, column: string, value: string): Promise<SheetRow[]> {
    const data = await this.getRows(sheetName);
    return data.rows.filter((row) => row.data[column] === value);
  }

  // ============================================
  // Data Write Operations
  // ============================================

  /**
   * เพิ่ม Row ใหม่
   */
  async appendRow(sheetName: string, data: Record<string, string>): Promise<{ rowIndex: number }> {
    const client = this.ensureInitialized();

    try {
      const headersResult = await this.getHeaders(sheetName);
      const headers = headersResult.headers;

      // สร้าง row data ตามลำดับ headers
      const rowData = headers.map((header) => data[header] || '');

      const response = await client.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [rowData],
        },
      });

      const updates = response.data.updates;
      const rowIndex = updates?.updatedRange
        ? parseInt(updates.updatedRange.split('!')[1].split(':')[0].replace(/\D/g, ''))
        : 0;

      log('info', `Row appended to sheet "${sheetName}"`, { rowIndex });

      return { rowIndex };
    } catch (error) {
      throw this.wrapError(error, `Failed to append row to sheet "${sheetName}"`);
    }
  }

  /**
   * อัปเดต Row ที่มีอยู่
   */
  async updateRow(sheetName: string, rowIndex: number, data: Record<string, string>): Promise<void> {
    const client = this.ensureInitialized();

    try {
      const headersResult = await this.getHeaders(sheetName);
      const headers = headersResult.headers;

      // สร้าง row data ตามลำดับ headers
      const rowData = headers.map((header) => data[header] || '');

      await client.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A${rowIndex}:${this.columnLetter(headers.length - 1)}${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [rowData],
        },
      });

      log('info', `Row ${rowIndex} updated in sheet "${sheetName}"`);
    } catch (error) {
      throw this.wrapError(error, `Failed to update row ${rowIndex} in sheet "${sheetName}"`);
    }
  }

  /**
   * อัปเดตหลาย Row พร้อมกัน (Batch)
   */
  async batchUpdate(
    sheetName: string,
    updates: Array<{ rowIndex: number; data: Record<string, string> }>
  ): Promise<{ updatedCount: number }> {
    const client = this.ensureInitialized();

    try {
      const headersResult = await this.getHeaders(sheetName);
      const headers = headersResult.headers;

      const data = updates.map((update) => {
        const rowData = headers.map((header) => update.data[header] || '');
        return {
          range: `${sheetName}!A${update.rowIndex}:${this.columnLetter(headers.length - 1)}${update.rowIndex}`,
          values: [rowData],
        };
      });

      await client.spreadsheets.values.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data,
        },
      });

      log('info', `Batch update completed for sheet "${sheetName}"`, { count: updates.length });

      return { updatedCount: updates.length };
    } catch (error) {
      throw this.wrapError(error, `Failed to batch update sheet "${sheetName}"`);
    }
  }

  // ============================================
  // Schema Discovery
  // ============================================

  /**
   * ค้นพบ Schema ของ Spreadsheet ทั้งหมด
   * อ่าน Sheet Names, Headers, Sample Rows, และ Inferred Types
   */
  async discoverSchema(): Promise<SpreadsheetSchema> {
    await this.initialize();

    const metadata = await this.getSpreadsheetMetadata();
    const sheetSchemas: SheetSchema[] = [];

    for (const sheet of metadata.sheets) {
      try {
        const sheetSchema = await this.discoverSheetSchema(sheet.title);
        sheetSchemas.push(sheetSchema);
      } catch (error) {
        log('warn', `Failed to discover schema for sheet "${sheet.title}"`, error);
        sheetSchemas.push({
          sheetName: sheet.title,
          headers: [],
          sampleRows: [],
          rowCount: 0,
          columnCount: 0,
          inferredTypes: {},
        });
      }
    }

    return {
      spreadsheetId: this.spreadsheetId,
      spreadsheetTitle: metadata.title,
      sheets: sheetSchemas,
      discoveredAt: new Date().toISOString(),
    };
  }

  /**
   * ค้นพบ Schema ของ Sheet เดียว
   */
  async discoverSheetSchema(sheetName: string): Promise<SheetSchema> {
    const headersResult = await this.getHeaders(sheetName);
    const headers = headersResult.headers;

    // ดึง sample rows (สูงสุด 10 แถว)
    const data = await this.getRows(sheetName, { limit: 10 });

    // Infer types จากข้อมูลตัวอย่าง
    const inferredTypes: Record<string, InferredType> = {};

    for (const header of headers) {
      const values = data.rows.map((row) => row.data[header]).filter((v) => v !== '');
      const nonEmptyCount = values.length;
      const totalCount = data.rows.length;

      inferredTypes[header] = {
        column: header,
        type: this.inferType(values),
        sampleValues: values.slice(0, 5),
        nonEmptyCount,
        totalCount,
      };
    }

    return {
      sheetName,
      headers,
      sampleRows: data.rows.slice(0, 5),
      rowCount: data.totalRows,
      columnCount: headers.length,
      inferredTypes,
    };
  }

  /**
   * Infer data type จาก values
   */
  private inferType(values: string[]): InferredType['type'] {
    if (values.length === 0) return 'empty';

    const types = values.map((v) => {
      if (/^\d+$/.test(v)) return 'number';
      if (/^\d+\.\d+$/.test(v)) return 'number';
      if (/^\d{4}-\d{2}-\d{2}/.test(v)) return 'date';
      if (/^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(v)) return 'date';
      if (/^(true|false)$/i.test(v)) return 'boolean';
      return 'string';
    });

    const uniqueTypes = [...new Set(types)];
    if (uniqueTypes.length === 1) return uniqueTypes[0] as InferredType['type'];
    return 'mixed';
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * แปลง column index เป็น letter (0=A, 1=B, ..., 25=Z, 26=AA)
   */
  private columnLetter(index: number): string {
    let result = '';
    let n = index;
    while (n >= 0) {
      result = String.fromCharCode((n % 26) + 65) + result;
      n = Math.floor(n / 26) - 1;
    }
    return result;
  }

  /**
   * สร้าง Error Object
   */
  private createError(code: GoogleSheetsErrorCode, message: string, details?: unknown): GoogleSheetsError {
    return {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Wrap unknown error เป็น GoogleSheetsError
   */
  private wrapError(error: unknown, context: string): GoogleSheetsError {
    if (error && typeof error === 'object' && 'code' in error) {
      return error as GoogleSheetsError;
    }

    const err = error as { message?: string; code?: number };

    let errorCode: GoogleSheetsErrorCode = 'UNKNOWN_ERROR';
    if (err.code === 404) errorCode = 'SHEET_NOT_FOUND';
    else if (err.code === 403) errorCode = 'PERMISSION_DENIED';
    else if (err.code === 429) errorCode = 'RATE_LIMIT_EXCEEDED';
    else if (err.code === 400) errorCode = 'INVALID_RANGE';

    return {
      code: errorCode,
      message: `${context}: ${err.message || 'Unknown error'}`,
      details: error,
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================
// Singleton Export
// ============================================

export const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;
