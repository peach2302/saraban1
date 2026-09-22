/**
 * E-Saraban Backend Server
 * ระบบสารบรรณอิเล็กทรอนิกส์ — เทศบาลตำบลป่งไฮ
 * 
 * Entry point สำหรับ Backend API Server
 * 
 * สถานะ: READY FOR GOOGLE SHEETS CONFIGURATION
 */

import express from 'express';
import cors from 'cors';
import { getConfig, validateConfig, getConfigurationStatus } from './config/env.js';
import healthRoutes from './routes/health.routes.js';
import googleSheetsRoutes from './routes/googleSheets.routes.js';
import auditLogRoutes from './routes/auditLog.routes.js';

// ============================================
// Server Setup
// ============================================

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// Routes
// ============================================

// Health check routes (ไม่ต้อง config ก็ได้)
app.use('/api', healthRoutes);

// Google Sheets routes (ต้อง config ก่อน)
app.use('/api/sheets', googleSheetsRoutes);

// Audit Log routes
app.use('/api/audit-logs', auditLogRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  const configStatus = getConfigurationStatus();

  res.json({
    service: 'E-Saraban Backend API',
    description: 'ระบบสารบรรณอิเล็กทรอนิกส์ — เทศบาลตำบลป่งไฮ',
    version: '1.0.0',
    status: configStatus.configured ? 'READY' : 'AWAITING_CONFIGURATION',
    endpoints: {
      health: '/api/health',
      healthGoogleSheets: '/api/health/google-sheets',
      healthConfig: '/api/health/config',
      sheetsMetadata: '/api/sheets/metadata',
      sheetsNames: '/api/sheets/names',
      sheetsSchema: '/api/sheets/schema',
      auditLogs: '/api/audit-logs',
    },
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'Endpoint not found',
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// Server Start
// ============================================

function startServer() {
  const config = getConfig();
  const validation = validateConfig();

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     E-Saraban Backend — ระบบสารบรรณอิเล็กทรอนิกส์       ║');
  console.log('║     เทศบาลตำบลป่งไฮ                                     ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  // แสดงสถานะ Configuration
  const configStatus = getConfigurationStatus();

  if (configStatus.configured) {
    console.log('✅ Configuration: COMPLETE');
    console.log(`   Server: http://localhost:${config.port}`);
    console.log(`   Environment: ${config.nodeEnv}`);
    console.log(`   Frontend URL: ${config.frontendUrl}`);
  } else {
    console.log('⚠️  Configuration: INCOMPLETE');
    console.log('');
    console.log('   Missing fields:');
    configStatus.missingFields.forEach((field) => {
      console.log(`   ❌ ${field}`);
    });
    console.log('');
    console.log('   การเชื่อมต่อ Google Sheets จะยังไม่ทำงาน');
    console.log('   แต่ Health Check endpoints จะใช้งานได้');
    console.log('');
    console.log('   ขั้นตอนการตั้งค่า:');
    console.log('   1. Copy server/.env.example → server/.env');
    console.log('   2. ใส่ GOOGLE_SPREADSHEET_ID');
    console.log('   3. ใส่ GOOGLE_SERVICE_ACCOUNT_EMAIL');
    console.log('   4. ใส่ GOOGLE_PRIVATE_KEY');
    console.log('   5. Share Google Spreadsheet กับ Service Account email');
    console.log('   6. Restart server');
  }

  if (validation.warnings.length > 0) {
    console.log('');
    console.log('⚠️  Warnings:');
    validation.warnings.forEach((warning) => {
      console.log(`   - ${warning}`);
    });
  }

  console.log('');
  console.log('──────────────────────────────────────────────────────────');
  console.log(`   API Base: http://localhost:${config.port}/api`);
  console.log(`   Health:   http://localhost:${config.port}/api/health`);
  console.log('──────────────────────────────────────────────────────────');
  console.log('');

  // แสดงสถานะ: READY FOR CONFIGURATION
  if (!configStatus.configured) {
    console.log('📋 STATUS: READY FOR GOOGLE SHEETS CONFIGURATION');
    console.log('');
  }

  app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
  });
}

// ============================================
// Start
// ============================================

startServer();

export default app;
