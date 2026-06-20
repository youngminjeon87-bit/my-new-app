/**
 * A lightweight client-side Excel formula interpreter for the Sandbox Simulator.
 * Supports basic text and string manipulation functions:
 * LEFT, RIGHT, MID, FIND, SUBSTITUTE, VALUE, IFERROR, CONCAT, &, etc.
 */

export function evaluateExcelFormula(
  formula: string,
  rowValues: Record<string, string>, // e.g. { A: 'chulsoo@company.com', B: '123' }
  allRows: Record<string, string>[] // For VLOOKUP/XLOOKUP lookups
): string {
  if (!formula) return '';
  let cleanFormula = formula.trim();

  // Excel formulas start with '='
  if (cleanFormula.startsWith('=')) {
    cleanFormula = cleanFormula.substring(1);
  } else {
    return cleanFormula; // Literal value
  }

  try {
    return evalToken(cleanFormula, rowValues, allRows);
  } catch (err) {
    console.error('Formula Eval Error:', err);
    return '#VALUE!';
  }
}

function evalToken(
  expr: string,
  rowValues: Record<string, string>,
  allRows: Record<string, string>[]
): string {
  let token = expr.trim();

  // 1. Handle IFERROR(expr, fallback)
  if (token.toUpperCase().startsWith('IFERROR(')) {
    const argsString = token.substring(8, token.length - 1);
    const args = splitArgs(argsString);
    if (args.length >= 2) {
      try {
        const val = evalToken(args[0], rowValues, allRows);
        if (val.startsWith('#')) {
          return evalToken(args[1], rowValues, allRows);
        }
        return val;
      } catch {
        return evalToken(args[1], rowValues, allRows);
      }
    }
  }

  // 2. Handle LEFT(text, num_chars)
  if (token.toUpperCase().startsWith('LEFT(')) {
    const argsString = token.substring(5, token.length - 1);
    const args = splitArgs(argsString);
    if (args.length >= 2) {
      const text = evalToken(args[0], rowValues, allRows);
      const num = parseInt(evalToken(args[1], rowValues, allRows), 10);
      return text.substring(0, isNaN(num) ? 0 : num);
    }
  }

  // 3. Handle RIGHT(text, num_chars)
  if (token.toUpperCase().startsWith('RIGHT(')) {
    const argsString = token.substring(6, token.length - 1);
    const args = splitArgs(argsString);
    if (args.length >= 2) {
      const text = evalToken(args[0], rowValues, allRows);
      const num = parseInt(evalToken(args[1], rowValues, allRows), 10);
      return text.substring(text.length - (isNaN(num) ? 0 : num));
    }
  }

  // 4. Handle MID(text, start_num, num_chars)
  if (token.toUpperCase().startsWith('MID(')) {
    const argsString = token.substring(4, token.length - 1);
    const args = splitArgs(argsString);
    if (args.length >= 3) {
      const text = evalToken(args[0], rowValues, allRows);
      const start = parseInt(evalToken(args[1], rowValues, allRows), 10) - 1; // Excel is 1-indexed
      const num = parseInt(evalToken(args[2], rowValues, allRows), 10);
      return text.substring(start, start + (isNaN(num) ? 0 : num));
    }
  }

  // 5. Handle FIND(find_text, within_text, [start_num])
  if (token.toUpperCase().startsWith('FIND(')) {
    const argsString = token.substring(5, token.length - 1);
    const args = splitArgs(argsString);
    if (args.length >= 2) {
      const findText = evalToken(args[0], rowValues, allRows).replace(/^"|"$/g, ''); // strip quotes
      const withinText = evalToken(args[1], rowValues, allRows);
      const start = args[2] ? parseInt(evalToken(args[2], rowValues, allRows), 10) - 1 : 0;
      const idx = withinText.indexOf(findText, start);
      if (idx === -1) return '#VALUE!';
      return (idx + 1).toString(); // Excel is 1-indexed
    }
  }

  // 6. Handle SUBSTITUTE(text, old_text, new_text)
  if (token.toUpperCase().startsWith('SUBSTITUTE(')) {
    const argsString = token.substring(11, token.length - 1);
    const args = splitArgs(argsString);
    if (args.length >= 3) {
      const text = evalToken(args[0], rowValues, allRows);
      const oldText = evalToken(args[1], rowValues, allRows).replace(/^"|"$/g, '');
      const newText = evalToken(args[2], rowValues, allRows).replace(/^"|"$/g, '');
      return text.replaceAll(oldText, newText);
    }
  }

  // 7. Handle VALUE(text)
  if (token.toUpperCase().startsWith('VALUE(')) {
    const argsString = token.substring(6, token.length - 1);
    const text = evalToken(argsString, rowValues, allRows).replace(/[^\d.-]/g, ''); // strip currencies/commas
    const num = parseFloat(text);
    if (isNaN(num)) return '#VALUE!';
    return num.toString();
  }

  // 8. Handle CONCAT(text1, text2, ...)
  if (token.toUpperCase().startsWith('CONCAT(')) {
    const argsString = token.substring(7, token.length - 1);
    const args = splitArgs(argsString);
    return args.map(arg => evalToken(arg, rowValues, allRows)).join('');
  }

  // 9. Handle XLOOKUP or VLOOKUP
  // E.g. XLOOKUP(A2, Sheet2!A:A, Sheet2!B:B)
  // Let's implement a mock lookup that simulates lookup based on cell values
  if (token.toUpperCase().startsWith('XLOOKUP(') || token.toUpperCase().startsWith('VLOOKUP(')) {
    const isX = token.toUpperCase().startsWith('XLOOKUP(');
    const argsString = token.substring(isX ? 8 : 8, token.length - 1);
    const args = splitArgs(argsString);
    if (args.length >= 3) {
      const lookupVal = evalToken(args[0], rowValues, allRows);
      // We will look in allRows for a row where the "before" column matches lookupVal
      // If found, return its second column or the result mapped column
      const matchRow = allRows.find(r => r.A === lookupVal || r.B === lookupVal);
      if (matchRow) {
        // Return first column that is different from lookupVal
        const values = Object.values(matchRow);
        const matchVal = values.find(v => v !== lookupVal) || values[1];
        return matchVal || '';
      }
      return args[3] ? evalToken(args[3], rowValues, allRows).replace(/^"|"$/g, '') : '#N/A';
    }
  }

  // 10. Handle Concatenation Operator &
  // e.g. A2 & " " & B2
  if (token.includes('&')) {
    const parts = splitAmpersands(token);
    return parts.map(part => evalToken(part, rowValues, allRows)).join('');
  }

  // 11. Handle Literal Strings
  if (token.startsWith('"') && token.endsWith('"')) {
    return token.substring(1, token.length - 1);
  }

  // 12. Handle Number literals
  if (/^\d+(\.\d+)?$/.test(token)) {
    return token;
  }

  // 13. Handle basic Cell References (e.g. A2, B2)
  // Extract the column label (A, B, C) and ignore the row number for local row evaluation
  const cellRefMatch = token.match(/^([A-Z]+)\d+$/i);
  if (cellRefMatch) {
    const col = cellRefMatch[1].toUpperCase();
    return rowValues[col] !== undefined ? rowValues[col] : '';
  }

  // Basic math expressions fallback (e.g. A2-1)
  const mathMatch = token.match(/^([A-Z]+)\d+\s*([-+*/])\s*(\d+)$/i);
  if (mathMatch) {
    const col = mathMatch[1].toUpperCase();
    const op = mathMatch[2];
    const val2 = parseInt(mathMatch[3], 10);
    const val1 = parseInt(rowValues[col] || '0', 10);
    if (isNaN(val1) || isNaN(val2)) return '#VALUE!';
    if (op === '-') return (val1 - val2).toString();
    if (op === '+') return (val1 + val2).toString();
    if (op === '*') return (val1 * val2).toString();
    if (op === '/') return val2 !== 0 ? (val1 / val2).toString() : '#DIV/0!';
  }

  return token; // Fallback
}

/**
 * Splits function arguments by comma, ignoring commas inside parentheses or double quotes.
 */
function splitArgs(argsString: string): string[] {
  const result: string[] = [];
  let current = '';
  let parenDepth = 0;
  let inQuotes = false;

  for (let i = 0; i < argsString.length; i++) {
    const char = argsString[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (inQuotes) {
      current += char;
    } else {
      if (char === '(') {
        parenDepth++;
        current += char;
      } else if (char === ')') {
        parenDepth--;
        current += char;
      } else if (char === ',' && parenDepth === 0) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }
  if (current) {
    result.push(current.trim());
  }
  return result;
}

/**
 * Splits string by ampersand &, ignoring ampersands inside double quotes.
 */
function splitAmpersands(str: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === '&' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current) {
    result.push(current.trim());
  }
  return result;
}
