#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const VALID_LAYOUTS = ['cover', 'chart', 'two_cols', 'one_col', 'multiline-type', 'floating-lines'];

function validateScript(script) {
  const errors = [];
  const warnings = [];
  const stats = {
    totalSections: 0,
    layoutTypes: {},
    contentCount: 0,
  };

  if (!script || typeof script !== 'object') {
    errors.push('Script must be a valid JSON object');
    return { isValid: false, errors, warnings, stats };
  }

  if (!script.title || typeof script.title !== 'string') {
    errors.push('Missing required field: title (must be string)');
  }

  if (!script.language || typeof script.language !== 'string') {
    errors.push('Missing required field: language (must be string)');
  }

  if (!Array.isArray(script.sections)) {
    errors.push('Missing required field: sections (must be array)');
    return { isValid: false, errors, warnings, stats };
  }

  stats.totalSections = script.sections.length;

  if (stats.totalSections === 0) {
    errors.push('Sections array must contain at least one section');
  }

  script.sections.forEach((section, index) => {
    validateSection(section, index, errors, warnings, stats);
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats,
  };
}

function validateSection(section, index, errors, warnings, stats) {
  const sectionPrefix = `Section ${index} (${section.title || 'untitled'})`;

  if (!section.id || typeof section.id !== 'string') {
    errors.push(`${sectionPrefix}: Missing or invalid field "id"`);
  }

  if (!section.title || typeof section.title !== 'string') {
    errors.push(`${sectionPrefix}: Missing or invalid field "title"`);
  }

  const layout = section.layout || 'two_cols';
  if (!VALID_LAYOUTS.includes(layout)) {
    errors.push(`${sectionPrefix}: Invalid layout type "${layout}". Must be one of: ${VALID_LAYOUTS.join(', ')}`);
  } else {
    stats.layoutTypes[layout] = (stats.layoutTypes[layout] || 0) + 1;
  }

  if (layout === 'chart') {
    const hasChartPath = section.chartPath && typeof section.chartPath === 'string';
    const hasChartConfig = section.chartConfig && typeof section.chartConfig === 'object';
    
    if (!hasChartPath && !hasChartConfig) {
      errors.push(`${sectionPrefix}: Missing required field "chartPath" or "chartConfig" for chart layout`);
    } else if (hasChartConfig) {
      validateChartConfig(section.chartConfig, sectionPrefix, errors);
    }
    
    // Warn if both are provided (chartPath takes priority)
    if (hasChartPath && hasChartConfig) {
      console.warn(`${sectionPrefix}: Both chartPath and chartConfig provided. chartPath will take priority.`);
    }
  }

  if (!Array.isArray(section.content)) {
    errors.push(`${sectionPrefix}: Missing or invalid field "content" (must be array)`);
  } else {
    if (section.content.length === 0) {
      warnings.push(`${sectionPrefix}: Content array is empty`);
    }

    section.content.forEach((item, contentIndex) => {
      validateContentItem(item, contentIndex, sectionPrefix, layout, errors, warnings);
      stats.contentCount++;
    });
  }

  if (section.illustration && typeof section.illustration !== 'string') {
    warnings.push(`${sectionPrefix}: "illustration" should be a string`);
  }
}

function validateChartConfig(config, sectionPrefix, errors) {
  if (!config.series || !Array.isArray(config.series)) {
    errors.push(`${sectionPrefix}: chartConfig missing "series" array`);
  } else {
    config.series.forEach((s, i) => {
      if (!s.name || typeof s.name !== 'string') {
        errors.push(`${sectionPrefix}: series[${i}] missing "name"`);
      }
      if (!s.type || typeof s.type !== 'string') {
        errors.push(`${sectionPrefix}: series[${i}] missing "type"`);
      }
      if (!Array.isArray(s.data)) {
        errors.push(`${sectionPrefix}: series[${i}] "data" must be array`);
      }
    });
  }

  if (config.xAxis) {
    const xAxis = Array.isArray(config.xAxis) ? config.xAxis[0] : config.xAxis;
    if (xAxis && xAxis.type === 'category' && !Array.isArray(xAxis.data)) {
      errors.push(`${sectionPrefix}: chartConfig xAxis.data must be array for category type`);
    }
  }

  if (config.yAxis && Array.isArray(config.yAxis)) {
    config.yAxis.forEach((axis, i) => {
      if (!axis.type) {
        errors.push(`${sectionPrefix}: chartConfig yAxis[${i}] missing "type"`);
      }
    });
  }
}

function validateContentItem(item, index, sectionPrefix, layout, errors, warnings) {
  const itemPrefix = `${sectionPrefix} > content[${index}]`;

  if (['two_cols', 'one_col'].includes(layout)) {
    if (!item.data || typeof item.data !== 'object') {
      errors.push(`${itemPrefix}: Missing "data" object for ${layout} layout`);
    } else {
      if (!item.data.title || typeof item.data.title !== 'string') {
        errors.push(`${itemPrefix}: data.title must be string`);
      }
      if (item.data.description && typeof item.data.description !== 'string') {
        warnings.push(`${itemPrefix}: data.description should be string`);
      }
      if (item.data.icon && typeof item.data.icon !== 'string') {
        warnings.push(`${itemPrefix}: data.icon should be string`);
      }
    }
  }

  if (['multiline-type', 'floating-lines'].includes(layout)) {
    if (!item.data || typeof item.data !== 'object') {
      errors.push(`${itemPrefix}: Missing "data" object for ${layout} layout`);
    } else {
      if (!item.data.title || typeof item.data.title !== 'string') {
        errors.push(`${itemPrefix}: data.title must be string for ${layout} layout`);
      }
    }
  }

  if (item.read_srt && typeof item.read_srt !== 'string') {
    warnings.push(`${itemPrefix}: read_srt should be string`);
  }

  if (item.duration && typeof item.duration !== 'number') {
    warnings.push(`${itemPrefix}: duration should be number`);
  }
}

function formatValidationReport(result) {
  const lines = [];

  lines.push('\n' + '='.repeat(60));
  lines.push('📋 PPT SCRIPT VALIDATION REPORT');
  lines.push('='.repeat(60));

  if (result.isValid) {
    lines.push('\n✅ VALIDATION PASSED - Script is valid!');
  } else {
    lines.push('\n❌ VALIDATION FAILED - Script has errors');
  }

  lines.push('\n📊 STATISTICS:');
  lines.push(`  • Total Sections: ${result.stats.totalSections}`);
  lines.push(`  • Total Content Items: ${result.stats.contentCount}`);
  lines.push('  • Layout Distribution:');
  Object.entries(result.stats.layoutTypes).forEach(([layout, count]) => {
    lines.push(`    - ${layout}: ${count}`);
  });

  if (result.errors.length > 0) {
    lines.push('\n❌ ERRORS (' + result.errors.length + '):');
    result.errors.forEach((error) => {
      lines.push(`  • ${error}`);
    });
  }

  if (result.warnings.length > 0) {
    lines.push('\n⚠️  WARNINGS (' + result.warnings.length + '):');
    result.warnings.forEach((warning) => {
      lines.push(`  • ${warning}`);
    });
  }

  if (result.isValid && result.warnings.length === 0) {
    lines.push('\n✨ No errors or warnings found!');
  }

  lines.push('\n' + '='.repeat(60) + '\n');

  return lines.join('\n');
}

const scriptPath = process.argv[2];

if (!scriptPath) {
  console.error('❌ Usage: node scripts/validateScript.js <path-to-script-json>');
  console.error('Example: node scripts/validateScript.js public/script/xiaolin-video-analytics.json');
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
    console.error(`  ${error.message || String(error)}`);
  }
  process.exit(1);
}
