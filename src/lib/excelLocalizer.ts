/**
 * Utility to localize and format Excel formulas based on regional settings.
 */

export interface RegionalConfig {
  separator: ',' | ';';
  useUppercase: boolean;
}

/**
 * Localizes an Excel formula based on the user's regional configuration.
 * Automatically handles argument separator conversion (, to ;) while ignoring commas inside double quotes.
 */
export function localizeFormula(formula: string, config: RegionalConfig): string {
  if (!formula) return '';

  let processed = formula;

  // 1. Convert casing if requested
  if (config.useUppercase) {
    // Convert formula function names to uppercase (simple uppercase for now, leaving strings inside quotes intact)
    processed = uppercaseFunctions(processed);
  }

  // 2. Convert argument separators
  if (config.separator === ';') {
    processed = convertSeparatorsToSemicolon(processed);
  } else {
    processed = convertSeparatorsToComma(processed);
  }

  return processed;
}

/**
 * Converts list separators inside a formula from comma to semicolon.
 * Avoids converting commas that are inside literal strings (e.g., "Hello, World").
 */
function convertSeparatorsToSemicolon(formula: string): string {
  let result = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < formula.length; i++) {
    const char = formula[i];

    if ((char === '"' || char === "'") && (i === 0 || formula[i - 1] !== '\\')) {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
      }
      result += char;
    } else if (char === ',' && !inQuotes) {
      result += ';';
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * Converts list separators inside a formula from semicolon to comma.
 * Avoids converting semicolons that are inside literal strings.
 */
function convertSeparatorsToComma(formula: string): string {
  let result = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < formula.length; i++) {
    const char = formula[i];

    if ((char === '"' || char === "'") && (i === 0 || formula[i - 1] !== '\\')) {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
      }
      result += char;
    } else if (char === ';' && !inQuotes) {
      result += ',';
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * Converts words before parentheses to uppercase (standard Excel practice).
 * e.g., "xlookup(a1, b1)" -> "XLOOKUP(a1, b1)"
 */
function uppercaseFunctions(formula: string): string {
  // Regex to find words followed immediately by '('
  // Excludes content inside quotes
  let result = '';
  let inQuotes = false;
  let quoteChar = '';
  let currentWord = '';

  for (let i = 0; i < formula.length; i++) {
    const char = formula[i];

    if ((char === '"' || char === "'") && (i === 0 || formula[i - 1] !== '\\')) {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
      }
      result += char;
    } else if (inQuotes) {
      result += char;
    } else {
      // Check if character is part of a word
      if (/[a-zA-Z0-9_]/.test(char)) {
        currentWord += char;
      } else {
        if (char === '(') {
          result += currentWord.toUpperCase();
        } else {
          result += currentWord;
        }
        currentWord = '';
        result += char;
      }
    }
  }
  
  if (currentWord) {
    result += currentWord;
  }

  return result;
}
