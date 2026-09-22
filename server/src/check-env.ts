/**
 * Environment Status Check Script
 * E-Saraban Backend
 * 
 * ตรวจสอบสถานะของ Environment Variables
 * โดยไม่เปิดเผยค่าจริง
 * 
 * วิธีใช้:
 *   cd server
 *   npx tsx src/check-env.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// โหลด .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('');
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║     E-Saraban — Environment Status Check                ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('');

// ตรวจสอบ Environment Variables
const checks = [
  {
    name: 'GOOGLE_SPREADSHEET_ID',
    required: true,
    description: 'Google Sheets Spreadsheet ID',
    hint: 'จาก URL: https://docs.google.com/spreadsheets/d/[ID]/edit',
  },
  {
    name: 'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    required: true,
    description: 'Service Account Email',
    hint: 'จาก Google Cloud Console > Service Accounts',
  },
  {
    name: 'GOOGLE_PRIVATE_KEY',
    required: true,
    description: 'Service Account Private Key',
    hint: 'จาก JSON key file (PEM format)',
  },
  {
    name: 'GOOGLE_SERVICE_ACCOUNT_KEY_FILE',
    required: false,
    description: 'Path to Service Account JSON key file',
    hint: 'ทางเลือกแทน GOOGLE_PRIVATE_KEY',
  },
  {
    name: 'PORT',
    required: false,
    description: 'Server port',
    hint: 'Default: 4000',
  },
  {
    name: 'NODE_ENV',
    required: false,
    description: 'Environment',
    hint: 'Default: development',
  },
  {
    name: 'FRONTEND_URL',
    required: false,
    description: 'Frontend URL for CORS',
    hint: 'Default: http://localhost:3000',
  },
];

console.log('📋 Environment Variables Status:');
console.log('');

let configuredCount = 0;
let requiredMissing = 0;

for (const check of checks) {
  const value = process.env[check.name];
  const isSet = value && value.trim() !== '';
  const status = isSet ? '✅ CONFIGURED' : '❌ MISSING';
  
  if (isSet) {
    configuredCount++;
  } else if (check.required) {
    requiredMissing++;
  }

  console.log(`  ${status}  ${check.name}`);
  console.log(`           ${check.description}`);
  if (!isSet && check.hint) {
    console.log(`           💡 ${check.hint}`);
  }
  console.log('');
}

console.log('──────────────────────────────────────────────────────────');
console.log('');

// สรุปสถานะ
if (requiredMissing === 0) {
  console.log('✅ STATUS: ALL REQUIRED VARIABLES CONFIGURED');
  console.log('');
  console.log('   สามารถรัน: npm run test:connection');
} else {
  console.log(`❌ STATUS: ${requiredMissing} REQUIRED VARIABLE(S) MISSING`);
  console.log('');
  console.log('   ขั้นตอนการตั้งค่า:');
  console.log('   1. Copy .env.example → .env');
  console.log('   2. ใส่ค่าที่จำเป็น (ดูจาก MISSING ด้านบน)');
  console.log('   3. รัน script นี้อีกครั้ง');
}

console.log('');
console.log(`   Configured: ${configuredCount}/${checks.length}`);
console.log('');

// ตรวจสอบ .env file
const fs = await import('fs');
const envPath = path.resolve(__dirname, '../../.env');
const envExists = fs.existsSync(envPath);

console.log('──────────────────────────────────────────────────────────');
console.log('');
console.log(`📁 .env file: ${envExists ? '✅ EXISTS' : '❌ NOT FOUND'}`);

if (!envExists) {
  console.log('');
  console.log('   สร้าง .env file:');
  console.log('   cd server');
  console.log('   cp .env.example .env');
  console.log('   # แก้ไข .env ใส่ค่าจริง');
}

console.log('');
console.log('──────────────────────────────────────────────────────────');
console.log('');
