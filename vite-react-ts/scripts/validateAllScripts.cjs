#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const SCRIPT_DIR = path.join(__dirname, '..', 'public', 'scripts');
const VALIDATOR_SCRIPT = path.join(__dirname, 'validateScript.cjs');

async function validateAllScripts() {
  console.log('\n🔍 Scanning for JSON script files...\n');

  const files = fs.readdirSync(SCRIPT_DIR).filter(file => {
    return file.endsWith('.json') && file !== 'index.json';
  });

  if (files.length === 0) {
    console.log('❌ No JSON script files found in ' + SCRIPT_DIR);
    process.exit(1);
  }

  console.log(`Found ${files.length} script file(s) to validate:\n`);
  files.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });
  console.log('');

  let passCount = 0;
  let failCount = 0;
  const results = [];

  for (const file of files) {
    const filePath = path.join(SCRIPT_DIR, file);
    const relPath = path.relative(process.cwd(), filePath);

    process.stdout.write(`\n📝 Validating: ${file}... `);

    try {
      await execAsync(`node "${VALIDATOR_SCRIPT}" "${filePath}"`, {
        stdio: 'pipe'
      });
      console.log('✅ PASS');
      passCount++;
      results.push({ file, status: 'PASS' });
    } catch (error) {
      console.log('❌ FAIL');
      failCount++;
      results.push({ file, status: 'FAIL', error: error.message });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`\n  ✅ Passed: ${passCount}/${files.length}`);
  console.log(`  ❌ Failed: ${failCount}/${files.length}`);

  if (failCount > 0) {
    console.log('\n📋 Failed Files:');
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        console.log(`  • ${r.file}`);
      });
  }

  console.log('\n' + '='.repeat(60) + '\n');

  process.exit(failCount > 0 ? 1 : 0);
}

validateAllScripts().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
