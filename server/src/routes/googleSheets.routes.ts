/**
 * Google Sheets Routes
 * E-Saraban Backend
 * 
 * API endpoints สำหรับ Google Sheets operations
 * ทุก endpoint ต้องตรวจสอบ Configuration ก่อน
 */

import { Router, Request, Response } from 'express';
import googleSheetsService from '../services/googleSheets.service.js';
import { getConfigurationStatus } from '../config/env.js';

const router = Router();

// ============================================
// Middleware: ตรวจสอบ Configuration
// ============================================

function requireConfig(req: Request, res: Response, next: Function) {
  const configStatus = getConfigurationStatus();
  if (!configStatus.configured) {
    res.status(503).json({
      error: 'SERVICE_NOT_CONFIGURED',
      message: 'Google Sheets is not configured',
      missingFields: configStatus.missingFields,
      timestamp: new Date().toISOString(),
    });
    return;
  }
  next();
}

// ใช้ middleware กับทุก routes
router.use(requireConfig);

// ============================================
// Metadata Endpoints
// ============================================

/**
 * GET /api/sheets/metadata
 * ดึง Metadata ของ Spreadsheet ทั้งหมด
 */
router.get('/metadata', async (_req: Request, res: Response) => {
  try {
    await googleSheetsService.initialize();
    const metadata = await googleSheetsService.getSpreadsheetMetadata();
    res.json({
      success: true,
      data: metadata,
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * GET /api/sheets/names
 * ดึงรายชื่อ Sheets ทั้งหมด
 */
router.get('/names', async (_req: Request, res: Response) => {
  try {
    await googleSheetsService.initialize();
    const names = await googleSheetsService.getSheetNames();
    res.json({
      success: true,
      data: { sheetNames: names, count: names.length },
    });
  } catch (error) {
    handleError(error, res);
  }
});

// ============================================
// Read Endpoints
// ============================================

/**
 * GET /api/sheets/:sheetName/headers
 * ดึง Headers ของ Sheet
 */
router.get('/:sheetName/headers', async (req: Request, res: Response) => {
  try {
    await googleSheetsService.initialize();
    const { sheetName } = req.params;
    const headers = await googleSheetsService.getHeaders(decodeURIComponent(sheetName));
    res.json({
      success: true,
      data: headers,
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * GET /api/sheets/:sheetName/rows
 * ดึงข้อมูลจาก Sheet
 * Query params: limit, offset
 */
router.get('/:sheetName/rows', async (req: Request, res: Response) => {
  try {
    await googleSheetsService.initialize();
    const { sheetName } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

    const data = await googleSheetsService.getRows(decodeURIComponent(sheetName), { limit, offset });
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * GET /api/sheets/:sheetName/find
 * ค้นหา Row ตาม column และ value
 * Query params: column, value
 */
router.get('/:sheetName/find', async (req: Request, res: Response) => {
  try {
    await googleSheetsService.initialize();
    const { sheetName } = req.params;
    const column = req.query.column as string;
    const value = req.query.value as string;

    if (!column || !value) {
      res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'Query params "column" and "value" are required',
      });
      return;
    }

    const row = await googleSheetsService.findRow(decodeURIComponent(sheetName), column, value);
    res.json({
      success: true,
      data: { found: !!row, row },
    });
  } catch (error) {
    handleError(error, res);
  }
});

// ============================================
// Schema Discovery Endpoints
// ============================================

/**
 * GET /api/sheets/schema
 * ค้นพบ Schema ทั้งหมดของ Spreadsheet
 */
router.get('/schema', async (_req: Request, res: Response) => {
  try {
    const schema = await googleSheetsService.discoverSchema();
    res.json({
      success: true,
      data: schema,
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * GET /api/sheets/:sheetName/schema
 * ค้นพบ Schema ของ Sheet เดียว
 */
router.get('/:sheetName/schema', async (req: Request, res: Response) => {
  try {
    await googleSheetsService.initialize();
    const { sheetName } = req.params;
    const schema = await googleSheetsService.discoverSheetSchema(decodeURIComponent(sheetName));
    res.json({
      success: true,
      data: schema,
    });
  } catch (error) {
    handleError(error, res);
  }
});

// ============================================
// Write Endpoints
// ============================================

/**
 * POST /api/sheets/:sheetName/rows
 * เพิ่ม Row ใหม่
 */
router.post('/:sheetName/rows', async (req: Request, res: Response) => {
  try {
    await googleSheetsService.initialize();
    const { sheetName } = req.params;
    const { data } = req.body;

    if (!data || typeof data !== 'object') {
      res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'Request body must contain "data" object',
      });
      return;
    }

    const result = await googleSheetsService.appendRow(decodeURIComponent(sheetName), data);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * PUT /api/sheets/:sheetName/rows/:rowIndex
 * อัปเดต Row
 */
router.put('/:sheetName/rows/:rowIndex', async (req: Request, res: Response) => {
  try {
    await googleSheetsService.initialize();
    const { sheetName, rowIndex } = req.params;
    const { data } = req.body;

    if (!data || typeof data !== 'object') {
      res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'Request body must contain "data" object',
      });
      return;
    }

    await googleSheetsService.updateRow(
      decodeURIComponent(sheetName),
      parseInt(rowIndex),
      data
    );
    res.json({
      success: true,
      message: `Row ${rowIndex} updated successfully`,
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * POST /api/sheets/:sheetName/batch-update
 * อัปเดตหลาย Row พร้อมกัน
 */
router.post('/:sheetName/batch-update', async (req: Request, res: Response) => {
  try {
    await googleSheetsService.initialize();
    const { sheetName } = req.params;
    const { updates } = req.body;

    if (!updates || !Array.isArray(updates)) {
      res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'Request body must contain "updates" array',
      });
      return;
    }

    const result = await googleSheetsService.batchUpdate(
      decodeURIComponent(sheetName),
      updates
    );
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleError(error, res);
  }
});

// ============================================
// Error Handler
// ============================================

function handleError(error: unknown, res: Response) {
  const err = error as { code?: string; message?: string; timestamp?: string };

  if (err.code && err.message) {
    // เป็น GoogleSheetsError
    const statusCode = mapErrorCodeToStatus(err.code);
    res.status(statusCode).json({
      success: false,
      error: err.code,
      message: err.message,
      timestamp: err.timestamp || new Date().toISOString(),
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    });
  }
}

function mapErrorCodeToStatus(code: string): number {
  switch (code) {
    case 'CONFIGURATION_MISSING': return 503;
    case 'AUTHENTICATION_FAILED': return 401;
    case 'SPREADSHEET_NOT_FOUND': return 404;
    case 'SHEET_NOT_FOUND': return 404;
    case 'PERMISSION_DENIED': return 403;
    case 'RATE_LIMIT_EXCEEDED': return 429;
    case 'INVALID_RANGE': return 400;
    case 'INVALID_DATA': return 400;
    default: return 500;
  }
}

export default router;
