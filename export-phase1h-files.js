#!/usr/bin/env node
/**
 * Phase 1H — Export Files as Base64
 * 
 * รัน script นี้บนเครื่อง local เพื่อสร้างไฟล์ Base64 encoded
 * 
 * วิธีใช้:
 * node export-phase1h-files.js
 * 
 * ผลลัพธ์:
 * - PHASE-1H-DISCOVERY-BASE64.txt
 * - PHASE-1H-PACKAGE-JSON-BASE64.txt
 */

const fs = require('fs');
const path = require('path');

// ไฟล์ที่ต้องการ encode
const filesToEncode = [
  {
    source: 'server/src/scripts/phase1h-discovery.ts',
    output: 'PHASE-1H-DISCOVERY-BASE64.txt',
    label: 'phase1h-discovery.ts',
  },
  {
    source: 'server/package.json',
    output: 'PHASE-1H-PACKAGE-JSON-BASE64.txt',
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
    const outputContent = `PATH=${file.source}\nLINES=${lines}\nBASE64_BEGIN\n${base64}\nBASE64_END\n`;
    
    fs.writeFileSync(file.output, outputContent, 'utf-8');
    
    console.log(`   ✅ Output: ${file.output}`);
    console.log('');
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    console.log('');
  }
});

console.log('═══════════════════════════════════════════════════════════');
console.log('EXPORT COMPLETE');
console.log('═══════════════════════════════════════════════════════════');
console.log('\nFiles created:');
filesToEncode.forEach(file => {
  console.log(`  - ${file.output}`);
});
console.log('\nTo decode on local machine:');
console.log('  # For phase1h-discovery.ts:');
console.log('  cat PHASE-1H-DISCOVERY-BASE64.txt | grep -A 9999 "BASE64_BEGIN" | grep -B 9999 "BASE64_END" | grep -v "BASE64_" | base64 -d > server/src/scripts/phase1h-discovery.ts');
console.log('');
console.log('  # For package.json:');
console.log('  cat PHASE-1H-PACKAGE-JSON-BASE64.txt | grep -A 9999 "BASE64_BEGIN" | grep -B 9999 "BASE64_END" | grep -v "BASE64_" | base64 -d > server/package.json');
console.log('');
console.log('  # Or use PowerShell on Windows:');
console.log('  # Get-Content PHASE-1H-DISCOVERY-BASE64.txt | Select-String -Pattern "BASE64_BEGIN" -Context 0,9999 | ForEach-Object { $_.Context.PostContext } | Set-Content -Encoding ASCII temp.txt');
console.log('  # [System.Convert]::FromBase64String((Get-Content temp.txt -Raw).Trim()) | Set-Content -Encoding UTF8 server/src/scripts/phase1h-discovery.ts');
console.log('');
