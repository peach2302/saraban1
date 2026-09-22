/**
 * Public Google Sheets Access Service
 * E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์
 * 
 * Fallback mechanism สำหรับ public spreadsheets
 * ใช้เมื่อไม่มี Service Account credentials
 * 
 * ข้อจำกัด:
 * - เข้าถึงได้เฉพาะ public spreadsheets
 * - ต้องรู้ชื่อ sheet ล่วงหน้า (ไม่สามารถ discover ได้)
 * - ใช้ gviz endpoint ซึ่งมีข้อจำกัด
 */

import type {
  SheetHeaders,
  SheetData,
  SheetRow,
} from '../types/googleSheets.types.js';

const SPREADSHEET_ID = '1JDfRSCQJy7bsNgONUztTaNc-ucNuKkJadOSUah7Gpes';

/**
 * ดึงข้อมูลจาก public spreadsheet ผ่าน gviz endpoint
 */
async function fetchPublicSheet(sheetName: string): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.statusText}`);
    }
    
    const text = await response.text();
    
    // Parse CSV
    const rows = text.split('\n').map(row => {
      // Simple CSV parser (ไม่รองรับ quoted fields ที่มี commas)
      return row.split(',').map(cell => cell.trim().replace(/^"(.*)"$/, '$1'));
    });
    
    return rows;
  } catch (error) {
    console.error(`Error fetching sheet "${sheetName}":`, error);
    throw error;
  }
}

/**
 * ดึง headers ของ sheet
 */
export async function getPublicHeaders(sheetName: string): Promise<SheetHeaders> {
  const rows = await fetchPublicSheet(sheetName);
  
  if (rows.length === 0) {
    return {
      sheetName,
      headers: [],
      headerCount: 0,
    };
  }
  
  const headers = rows[0].filter(h => h !== '');
  
  return {
    sheetName,
    headers,
    headerCount: headers.length,
  };
}

/**
 * ดึงข้อมูลจาก sheet
 */
export async function getPublicRows(sheetName: string, limit?: number): Promise<SheetData> {
  const rows = await fetchPublicSheet(sheetName);
  
  if (rows.length === 0) {
    return {
      sheetName,
      headers: [],
      rows: [],
      totalRows: 0,
      totalColumns: 0,
    };
  }
  
  const headers = rows[0].filter(h => h !== '');
  const dataRows = rows.slice(1);
  
  if (limit) {
    dataRows.splice(limit);
  }
  
  const sheetRows: SheetRow[] = dataRows.map((row, index) => {
    const data: Record<string, string> = {};
    headers.forEach((header, colIndex) => {
      data[header] = row[colIndex] || '';
    });
    return {
      rowIndex: index + 2, // +2 เพราะแถว 1 เป็น headers
      data,
    };
  });
  
  return {
    sheetName,
    headers,
    rows: sheetRows,
    totalRows: sheetRows.length,
    totalColumns: headers.length,
  };
}

/**
 * ทดสอบการเข้าถึง public spreadsheet
 */
export async function testPublicAccess(): Promise<boolean> {
  try {
    const headers = await getPublicHeaders('Users');
    return headers.headers.length > 0;
  } catch {
    return false;
  }
}

/**
 * รายชื่อ sheets ที่ทราบแล้ว (ต้องระบุด้วยมือ)
 * ข้อจำกัดของ public access: ไม่สามารถ discover sheets ได้
 */
export const KNOWN_SHEETS = [
  'Users',
  // เพิ่มชื่อ sheets อื่นๆ ที่นี่เมื่อทราบ
];

/**
 * ดึงข้อมูลจากทุก sheets ที่ทราบ
 */
export async function getAllPublicSheets(): Promise<SheetData[]> {
  const results: SheetData[] = [];
  
  for (const sheetName of KNOWN_SHEETS) {
    try {
      const data = await getPublicRows(sheetName);
      results.push(data);
    } catch (error) {
      console.error(`Failed to fetch sheet "${sheetName}":`, error);
    }
  }
  
  return results;
}
