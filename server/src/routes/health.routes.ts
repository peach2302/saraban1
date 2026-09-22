/**
 * Health Check Routes
 * E-Saraban Backend
 */

import { Router, Request, Response } from 'express';
import { getConfigurationStatus, validateConfig } from '../config/env.js';
import googleSheetsService from '../services/googleSheets.service.js';

const router = Router();

/**
 * GET /api/health
 * ตรวจสอบสถานะของ Backend
 */
router.get('/health', (_req: Request, res: Response) => {
  const configStatus = getConfigurationStatus();
  const validation = validateConfig();

  res.json({
    status: 'OK',
    service: 'E-Saraban Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    configuration: {
      configured: configStatus.configured,
      missingFields: configStatus.missingFields,
    },
    warnings: validation.warnings,
  });
});

/**
 * GET /api/health/google-sheets
 * ทดสอบการเชื่อมต่อกับ Google Sheets
 * ไม่เปิดเผย credentials
 */
router.get('/health/google-sheets', async (_req: Request, res: Response) => {
  try {
    const configStatus = getConfigurationStatus();

    if (!configStatus.configured) {
      res.json({
        status: 'NOT_CONNECTED',
        message: 'Google Sheets is not configured',
        missingFields: configStatus.missingFields,
        timestamp: new Date().toISOString(),
        instructions: {
          step1: 'Copy .env.example to .env',
          step2: 'Set GOOGLE_SPREADSHEET_ID from your Google Sheets URL',
          step3: 'Set GOOGLE_SERVICE_ACCOUNT_EMAIL from your Service Account',
          step4: 'Set GOOGLE_PRIVATE_KEY from your Service Account JSON key',
          step5: 'Share the Google Spreadsheet with the Service Account email',
          step6: 'Restart the server',
        },
      });
      return;
    }

    const result = await googleSheetsService.testConnection();
    res.json(result);
  } catch (error) {
    const err = error as { message?: string };
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: err.message || 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/health/config
 * ตรวจสอบ Configuration (ไม่เปิดเผย secrets)
 */
router.get('/health/config', (_req: Request, res: Response) => {
  const validation = validateConfig();

  // ตรวจสอบว่ามีค่าอะไรบ้าง (ไม่แสดงค่าจริง)
  const configFields = {
    GOOGLE_SPREADSHEET_ID: process.env.GOOGLE_SPREADSHEET_ID?.trim() ? 'SET' : 'NOT_SET',
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() ? 'SET' : 'NOT_SET',
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY?.trim() ? 'SET' : 'NOT_SET',
    GOOGLE_SERVICE_ACCOUNT_KEY_FILE: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE?.trim() ? 'SET' : 'NOT_SET',
    PORT: process.env.PORT || '4000',
    NODE_ENV: process.env.NODE_ENV || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  };

  res.json({
    valid: validation.valid,
    errors: validation.errors,
    warnings: validation.warnings,
    fields: configFields,
    timestamp: new Date().toISOString(),
  });
});

export default router;
