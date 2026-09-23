/**
 * Phase 1H — Base64 Export Script
 * 
 * สร้างไฟล์ Base64 encoded สำหรับโอนย้าย
 * 
 * วิธีใช้:
 * cd server
 * npx tsx src/scripts/phase1h-export-base64.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ไฟล์ที่ต้องการ encode
const filesToEncode = [
  {
    source: path.resolve(__dirname, '../scripts/phase1h-discovery.ts'),
    outputPath: path.resolve(__dirname, '../../../PHASE-1H-DISCOVERY-BASE64.txt'),
    label: 'phase1h-discovery.ts',
  },
  {
    source: path.resolve(__dirname, '../../package.json'),
    outputPath: path.resolve(__dirname, '../../../PHASE-1H-PACKAGE-JSON-BASE64.txt'),
    label: 'package.json',
  },
];

console.log('═══════════════════════════════════════════════════════════');
console.log('PHASE 1H — BASE64 EXPORT');
console.log('═══════════════════════════════════════════════════════════\n');

filesToEncode.forEach((file, index) => {
  console.log(`[${index + 1}/${filesToEncode.length}] Processing: ${file.label}`);
  
  try {
    // อ่านไฟล์ต้นฉบับ
    const content = fs.readFileSync(file.source, 'utf-8');
    const lines = content.split('\n').length;
    
    console.log(`   Source: ${file.source}`);
    console.log(`   Lines: ${lines}`);
    
    // Encode เป็น Base64
    const base64 = Buffer.from(content, 'utf-8').toString('base64');
    
    console.log(`   Base64 Length: ${base64.length} characters`);
    
    // สร้างไฟล์ output
    const outputContent = `PATH=${file.source.replace(/\\/g, '/').split('/').slice(-2).join('/')}\nLINES=${lines}\nBASE64_BEGIN\n${base64}\nBASE64_END\n`;
    
    fs.writeFileSync(file.outputPath, outputContent, 'utf-8');
    
    console.log(`   ✅ Output: ${file.outputPath}`);
    console.log('');
  } catch (error) {
    console.error(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.log('');
  }
});

console.log('═══════════════════════════════════════════════════════════');
console.log('EXPORT COMPLETE');
console.log('═══════════════════════════════════════════════════════════');
console.log('\nFiles created:');
filesToEncode.forEach(file => {
  console.log(`  - ${file.outputPath}`);
});
console.log('\nTo decode on local machine:');
console.log('  cat PHASE-1H-DISCOVERY-BASE64.txt | grep -A 9999 "BASE64_BEGIN" | grep -B 9999 "BASE64_END" | grep -v "BASE64_" | base64 -d > phase1h-discovery.ts');
console.log('  cat PHASE-1H-PACKAGE-JSON-BASE64.txt | grep -A 9999 "BASE64_BEGIN" | grep -B 9999 "BASE64_END" | grep -v "BASE64_" | base64 -d > package.json');
console.log('');
