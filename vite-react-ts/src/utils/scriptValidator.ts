

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalSections: number;
    layoutTypes: Record<string, number>;
    contentCount: number;
  };
}

const VALID_LAYOUTS = ['cover', 'chart', 'two_cols', 'one_col', 'multiline-type', 'floating-lines', 'footage-placeholder'];

export function validateScript(script: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const stats = {
    totalSections: 0,
    layoutTypes: {} as Record<string, number>,
    contentCount: 0,
  };

  // Validate root structure
  if (!script || typeof script !== 'object') {
    errors.push('Script must be a valid JSON object');
    return { isValid: false, errors, warnings, stats };
  }

  // Check required root fields
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

  // Validate each section
  script.sections.forEach((section: any, index: number) => {
    validateSection(section, index, errors, warnings, stats);
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats,
  };
}

function validateSection(
  section: any,
  index: number,
  errors: string[],
  warnings: string[],
  stats: Record<string, any>
) {
  const sectionPrefix = `Section ${index} (${section.screen || 'untitled'})`;

  // Check required fields
  if (!section.id || typeof section.id !== 'string') {
    errors.push(`${sectionPrefix}: Missing or invalid field "id"`);
  }

  if (!section.screen || typeof section.screen !== 'string') {
    errors.push(`${sectionPrefix}: Missing or invalid field "screen"`);
  }

  if (section.read_srt !== undefined && typeof section.read_srt !== 'string') {
    errors.push(`${sectionPrefix}: Missing or invalid field "read_srt"`);
  }

  // Check layout
  const layout = section.layout || 'footage-placeholder';
  if (!VALID_LAYOUTS.includes(layout)) {
    errors.push(`${sectionPrefix}: Invalid layout type "${layout}". Must be one of: ${VALID_LAYOUTS.join(', ')}`);
  } else {
    stats.layoutTypes[layout] = (stats.layoutTypes[layout] || 0) + 1;
  }

  // Chart-specific validation
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

  // Validate content array depending on layout
  const contentRequiredLayouts = ['two_cols', 'one_col', 'multiline-type', 'floating-lines'];
  const isContentRequired = contentRequiredLayouts.includes(layout);

  if (section.content === undefined || section.content === null) {
    if (isContentRequired) {
      errors.push(`${sectionPrefix}: Missing required field "content" for layout ${layout}`);
    }
  } else if (!Array.isArray(section.content)) {
    errors.push(`${sectionPrefix}: Missing or invalid field "content" (must be array)`);
  } else {
    if (section.content.length === 0) {
      warnings.push(`${sectionPrefix}: Content array is empty`);
    }

    section.content.forEach((item: any, contentIndex: number) => {
      validateContentItem(item, contentIndex, sectionPrefix, layout, errors, warnings);
      stats.contentCount++;
    });
  }

  // Optional fields
  if (section.illustration && typeof section.illustration !== 'string') {
    warnings.push(`${sectionPrefix}: "illustration" should be a string`);
  }

  // Section-level read_srt validation (moved from content items)
  if (section.read_srt && typeof section.read_srt !== 'string') {
    warnings.push(`${sectionPrefix}: read_srt should be string`);
  }
}

function validateChartConfig(
  config: any,
  sectionPrefix: string,
  errors: string[]
) {
  // Basic chart validation
  if (!config.series || !Array.isArray(config.series)) {
    errors.push(`${sectionPrefix}: chartConfig missing "series" array`);
  } else {
    config.series.forEach((s: any, i: number) => {
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

  // Check xAxis
  if (config.xAxis) {
    const xAxis = Array.isArray(config.xAxis) ? config.xAxis[0] : config.xAxis;
    if (xAxis && xAxis.type === 'category' && !Array.isArray(xAxis.data)) {
      errors.push(`${sectionPrefix}: chartConfig xAxis.data must be array for category type`);
    }
  }

  // Check yAxis
  if (config.yAxis && Array.isArray(config.yAxis)) {
    config.yAxis.forEach((axis: any, i: number) => {
      if (!axis.type) {
        errors.push(`${sectionPrefix}: chartConfig yAxis[${i}] missing "type"`);
      }
    });
  }
}

function validateContentItem(
  item: any,
  index: number,
  sectionPrefix: string,
  layout: string,
  errors: string[],
  warnings: string[]
) {
  const itemPrefix = `${sectionPrefix} > content[${index}]`;

  // Check data for layouts that require it
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

  // Check data for multiline-type and floating-lines
  if (['multiline-type', 'floating-lines'].includes(layout)) {
    if (!item.data || typeof item.data !== 'object') {
      errors.push(`${itemPrefix}: Missing "data" object for ${layout} layout`);
    } else {
      if (!item.data.title || typeof item.data.title !== 'string') {
        errors.push(`${itemPrefix}: data.title must be string for ${layout} layout`);
      }
    }
  }

  // Optional fields validation
  // read_srt moved to section level
  if (item.duration && typeof item.duration !== 'number') {
    warnings.push(`${itemPrefix}: duration should be number`);
  }
}

export function formatValidationReport(result: ValidationResult): string {
  const lines: string[] = [];

  lines.push('\n' + '='.repeat(60));
  lines.push('📋 PPT SCRIPT VALIDATION REPORT');
  lines.push('='.repeat(60));

  // Overall status
  if (result.isValid) {
    lines.push('\n✅ VALIDATION PASSED - Script is valid!');
  } else {
    lines.push('\n❌ VALIDATION FAILED - Script has errors');
  }

  // Stats
  lines.push('\n📊 STATISTICS:');
  lines.push(`  • Total Sections: ${result.stats.totalSections}`);
  lines.push(`  • Total Content Items: ${result.stats.contentCount}`);
  lines.push('  • Layout Distribution:');
  Object.entries(result.stats.layoutTypes).forEach(([layout, count]) => {
    lines.push(`    - ${layout}: ${count}`);
  });

  // Errors
  if (result.errors.length > 0) {
    lines.push('\n❌ ERRORS (' + result.errors.length + '):');
    result.errors.forEach((error) => {
      lines.push(`  • ${error}`);
    });
  }

  // Warnings
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

export default validateScript;
