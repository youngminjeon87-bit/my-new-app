import { useState, useEffect } from 'react';
import { evaluateExcelFormula } from '../../lib/formulaEvaluator';

interface PreviewTableProps {
  headers: string[];
  mockData: Array<{
    before: string[];
    after: string[];
  }>;
  formula: string; // The currently active formula (e.g. standard or safe)
}

export default function PreviewTable({ headers, mockData, formula }: PreviewTableProps) {
  const beforeColCount = mockData[0]?.before?.length || 0;
  const afterColCount = mockData[0]?.after?.length || 0;
  const totalColCount = beforeColCount + afterColCount;

  // State to store the values of the interactive sandbox sheet
  // Format: Array of rows, e.g. [{ A: 'chulsoo@company.com', B: 'chulsoo' }, ...]
  const [sheetRows, setSheetRows] = useState<Record<string, string>[]>([]);

  // Initialize sheetRows whenever mockData changes
  useEffect(() => {
    const initialRows = mockData.map(row => {
      const rowObj: Record<string, string> = {};
      // Map before values to columns (A, B, C...)
      row.before.forEach((val, idx) => {
        const colLabel = String.fromCharCode(65 + idx);
        rowObj[colLabel] = val;
      });
      return rowObj;
    });
    setSheetRows(initialRows);
  }, [mockData]);

  const handleCellChange = (rowIdx: number, colIdx: number, value: string) => {
    setSheetRows(prev => {
      const updated = [...prev];
      const colLabel = String.fromCharCode(65 + colIdx);
      updated[rowIdx] = {
        ...updated[rowIdx],
        [colLabel]: value
      };
      return updated;
    });
  };

  const getColLabel = (index: number) => {
    return String.fromCharCode(65 + index);
  };

  return (
    <div className="preview-table-container">
      {/* Legend / Info bar */}
      <div className="preview-table-header-desc">
        <div className="legend-item before-legend">
          <span className="legend-color-dot before-dot"></span>
          <span>원본 데이터 (수정 가능)</span>
        </div>
        <div className="legend-item after-legend">
          <span className="legend-color-dot after-dot animate-pulse"></span>
          <span>실시간 수식 계산 결과 (Sandbox)</span>
        </div>
      </div>

      <div className="sheet-viewport">
        <table className="sheet-grid">
          <thead>
            {/* Column Labels (A, B, C...) */}
            <tr className="column-labels-row">
              <th className="row-number-header"></th>
              {Array.from({ length: totalColCount }).map((_, idx) => {
                const isAfter = idx >= beforeColCount;
                return (
                  <th 
                    key={idx} 
                    className={`col-label-header ${isAfter ? 'after-col-header' : 'before-col-header'}`}
                  >
                    {getColLabel(idx)}
                  </th>
                );
              })}
            </tr>
            {/* User Custom Headers */}
            <tr className="custom-headers-row">
              <th className="row-number-header">1</th>
              {headers.map((header, idx) => {
                const isAfter = idx >= beforeColCount;
                return (
                  <th 
                    key={idx} 
                    className={`custom-header-cell ${isAfter ? 'after-cell-bg' : 'before-cell-bg'}`}
                  >
                    {header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sheetRows.map((row, rowIdx) => {
              const rowNum = rowIdx + 2; // Rows starts at 2 (headers at 1)
              return (
                <tr key={rowIdx} className="sheet-row">
                  <td className="row-number-cell">{rowNum}</td>
                  
                  {/* Before (Editable Input Columns) */}
                  {Array.from({ length: beforeColCount }).map((_, colIdx) => {
                    const colLabel = getColLabel(colIdx);
                    const val = row[colLabel] || '';
                    return (
                      <td key={`before-${colIdx}`} className="sheet-cell before-cell p-0">
                        <input
                          type="text"
                          className="sheet-cell-input"
                          value={val}
                          onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                        />
                      </td>
                    );
                  })}

                  {/* After (Computed Formula Columns) */}
                  {Array.from({ length: afterColCount }).map((_, colIdx) => {
                    // Compute formula dynamically based on the current row values and overall sheet rows
                    const evaluatedVal = evaluateExcelFormula(formula, row, sheetRows);
                    return (
                      <td 
                        key={`after-${colIdx}`} 
                        className="sheet-cell after-cell highlight-after text-left font-mono"
                      >
                        {evaluatedVal}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-right text-[10px] text-muted-foreground mt-2">
        ※ 원본 데이터 열의 값을 클릭해 수정해 보세요. 수식이 실시간으로 계산을 수행합니다.
      </p>
    </div>
  );
}
