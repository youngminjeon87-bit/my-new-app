interface PreviewTableProps {
  headers: string[];
  mockData: Array<{
    before: string[];
    after: string[];
  }>;
}

export default function PreviewTable({ headers, mockData }: PreviewTableProps) {
  const beforeColCount = mockData[0]?.before?.length || 0;
  const afterColCount = mockData[0]?.after?.length || 0;
  const totalColCount = beforeColCount + afterColCount;

  const getColLabel = (index: number) => {
    return String.fromCharCode(65 + index);
  };

  return (
    <div className="preview-table-container">
      <div className="preview-table-header-desc">
        <div className="legend-item before-legend">
          <span className="legend-color-dot before-dot"></span>
          <span>원본 데이터 (Before)</span>
        </div>
        <div className="legend-item after-legend">
          <span className="legend-color-dot after-dot animate-pulse"></span>
          <span>수식 적용 결과 (After)</span>
        </div>
      </div>

      <div className="sheet-viewport">
        <table className="sheet-grid">
          <thead>
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
            {mockData.map((row, rowIdx) => {
              const rowNum = rowIdx + 2;
              return (
                <tr key={rowIdx} className="sheet-row">
                  <td className="row-number-cell">{rowNum}</td>
                  {row.before.map((val, cellIdx) => (
                    <td key={`before-${cellIdx}`} className="sheet-cell before-cell">
                      {val}
                    </td>
                  ))}
                  {row.after.map((val, cellIdx) => (
                    <td key={`after-${cellIdx}`} className="sheet-cell after-cell highlight-after">
                      {val}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
