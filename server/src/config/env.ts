/**
 * Environment Configuration
 * E-Saraban Backend
 * 
 * โหลด environment variables และ validate ว่ามีค่าที่จำเป็นครบ
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ServiceConfig, GoogleSheetsConfig } from '../types/googleSheets.types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// โหลด .env จาก server/ directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ============================================
// Validation Helpers
// ============================================

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(
      `❌ Environment variable "${key}" is required but not set.\n` +
      `   Please set it in .env file or environment variables.\n` +
      `   See .env.example for reference.`
    );
  }
  return value.trim();
}

function optionalEnv(key: string, defaultValue: string): string {
  const value = process.env[key];
  return (value && value.trim() !== '') ? value.trim() : defaultValue;
}

// ============================================
// Configuration
// ============================================

export function getConfig(): ServiceConfig {
  return {
    port: parseInt(optionalEnv('PORT', '4000'), 10),
    nodeEnv: optionalEnv('NODE_ENV', 'development'),
    frontendUrl: optionalEnv('FRONTEND_URL', 'http://localhost:3000'),
    logLevel: optionalEnv('LOG_LEVEL', 'info'),
    googleSheets: getGoogleSheetsConfig(),
  };
}

export function getGoogleSheetsConfig(): GoogleSheetsConfig {
  return {
    spreadsheetId: optionalEnv('GOOGLE_SPREADSHEET_ID', ''),
    serviceAccountEmail: optionalEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL', ''),
    privateKey: optionalEnv('GOOGLE_PRIVATE_KEY', ''),
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/spreadsheets.readonly',
    ],
  };
}

// ============================================
// Configuration Validation
// ============================================

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  config: Partial<ServiceConfig>;
}

export function validateConfig(): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ตรวจสอบ Google Sheets Configuration
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID?.trim();
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.trim();
  const keyFilePath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE?.trim();

  if (!spreadsheetId) {
    errors.push('GOOGLE_SPREADSHEET_ID is not set');
  }

  if (!serviceAccountEmail) {
    errors.push('GOOGLE_SERVICE_ACCOUNT_EMAIL is not set');
  }

  if (!privateKey && !keyFilePath) {
    errors.push('Either GOOGLE_PRIVATE_KEY or GOOGLE_SERVICE_ACCOUNT_KEY_FILE must be set');
  }

  // ตรวจสอบรูปแบบ Spreadsheet ID
  if (spreadsheetId) {
    // Spreadsheet ID ควรเป็น string ที่ไม่มี / หรือ spaces
    if (spreadsheetId.includes('/') || spreadsheetId.includes(' ')) {
      errors.push('GOOGLE_SPREADSHEET_ID appears to be a URL. Please provide only the ID portion.');
    }
  }

  // ตรวจสอบรูปแบบ Private Key
  if (privateKey) {
    if (!privateKey.includes('-----BEGIN')) {
      warnings.push('GOOGLE_PRIVATE_KEY does not appear to be a valid PEM key');
    }
  }

  // Server Configuration
  const port = parseInt(optionalEnv('PORT', '4000'), 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push(`PORT must be a valid port number (1-65535), got: ${process.env.PORT}`);
  }

  // Security Warnings
  const nodeEnv = optionalEnv('NODE_ENV', 'development');
  if (nodeEnv === 'production') {
    if (!process.env.JWT_SECRET) {
      warnings.push('JWT_SECRET is not set (will be needed for authentication)');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    config: {
      port,
      nodeEnv,
      frontendUrl: optionalEnv('FRONTEND_URL', 'http://localhost:3000'),
      logLevel: optionalEnv('LOG_LEVEL', 'info'),
    },
  };
}

// ============================================
// Safe Config (ไม่ throw error)
// ============================================

export function getSafeConfig(): ServiceConfig | null {
  try {
    return getConfig();
  } catch {
    return null;
  }
}

export function isConfigured(): boolean {
  const validation = validateConfig();
  return validation.valid;
}

export function getConfigurationStatus(): {
  configured: boolean;
  missingFields: string[];
} {
  const validation = validateConfig();
  const missingFields: string[] = [];

  if (!process.env.GOOGLE_SPREADSHEET_ID?.trim()) {
    missingFields.push('GOOGLE_SPREADSHEET_ID');
  }
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim()) {
    missingFields.push('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  }
  if (!process.env.GOOGLE_PRIVATE_KEY?.trim() && !process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE?.trim()) {
    missingFields.push('GOOGLE_PRIVATE_KEY or GOOGLE_SERVICE_ACCOUNT_KEY_FILE');
  }

  return {
    configured: validation.valid,
    missingFields,
  };
}
