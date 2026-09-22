/**
 * Discovery Routes
 * E-Saraban Backend
 */

import { Router, Request, Response } from 'express';
import { google } from 'googleapis';
import { getGoogleSheetsConfig } from '../config/env.js';

const router = Router();

/**
 * POST /api/discover
 * ค้นพบ sheets ทั้งหมดจาก Google Sheets
 */
router.post('/', async (_req: Request, res: Response) => {
  try {
    const config = getGoogleSheetsConfig();

    if (!config.spreadsheetId || !config.serviceAccountEmail || !config.privateKey) {
      res.status(400).json({
        error: 'CONFIGURATION_MISSING',
        message: 'Google Sheets credentials not configured',
      });
      return;
    }

    // สร้าง authenticated client
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: config.serviceAccountEmail,
        private_key: config.privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // ดึง metadata ของ spreadsheet
    const spreadsheetResponse = await sheets.spreadsheets.get({
      spreadsheetId: config.spreadsheetId,
      includeGridData: false,
    });

    const spreadsheet = spreadsheetResponse.data;
    const sheetsList = spreadsheet.sheets || [];

    // อ่าน headers และ sample data จากทุก sheets
    const allSheetsData = [];

    for (const sheet of sheetsList) {
      const sheetName = sheet.properties?.title;
      if (!sheetName) continue;

      try {
        // อ่าน headers
        const headerResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: config.spreadsheetId,
          range: `${sheetName}!1:1`,
        });

        const headers = headerResponse.data.values?.[0] || [];

        // อ่าน sample data (5 แถวแรก)
        const dataResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: config.spreadsheetId,
          range: `${sheetName}!A1:Z5`,
        });

        const rows = dataResponse.data.values || [];

        allSheetsData.push({
          sheetName,
          sheetId: sheet.properties?.sheetId,
          headers,
          rowCount: sheet.properties?.gridProperties?.rowCount,
          columnCount: sheet.properties?.gridProperties?.columnCount,
          sampleData: rows,
        });
      } catch (error) {
        console.error(`Error reading sheet ${sheetName}:`, error);
      }
    }

    const report = {
      spreadsheetId: config.spreadsheetId,
      spreadsheetTitle: spreadsheet.properties?.title,
      discoveredAt: new Date().toISOString(),
      totalSheets: sheetsList.length,
      sheets: allSheetsData,
    };

    res.json(report);
  } catch (error) {
    console.error('Discovery error:', error);
    res.status(500).json({
      error: 'DISCOVERY_FAILED',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
