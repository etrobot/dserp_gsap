import * as fs from 'fs';
import * as path from 'path';
import { validateScript, formatValidationReport } from '../src/utils/scriptValidator';

const scriptPath = process.argv[2];

if (!scriptPath) {
  console.error('❌ Usage: npx ts-node scripts/validateScript.ts <path-to-script-json>');
  console.error('Example: npx ts-node scripts/validateScript.ts public/script/xiaolin-video-analytics.json');
  process.exit(1);
}

const fullPath = path.resolve(scriptPath);

if (!fs.existsSync(fullPath)) {
  console.error(`❌ File not found: ${fullPath}`);
  process.exit(1);
}

try {
  const fileContent = fs.readFileSync(fullPath, 'utf-8');
  const script = JSON.parse(fileContent);

  const result = validateScript(script);
  const report = formatValidationReport(result);

  console.log(report);

  process.exit(result.isValid ? 0 : 1);
} catch (error) {
  if (error instanceof SyntaxError) {
    console.error('❌ JSON Syntax Error:');
    console.error(`  ${error.message}`);
  } else {
    console.error('❌ Error reading or parsing file:');
    console.error(`  ${error instanceof Error ? error.message : String(error)}`);
  }
  process.exit(1);
}
