import { useState } from 'react';
import { Sparkles, Copy, Check, AlertCircle, HelpCircle, ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react';
import { getExcelFormulaHelper } from '../../services/gemini';
import PreviewTable from './PreviewTable';

const PRESETS = [
  { label: '📧 이메일에서 아이디 추출', query: 'A열에 있는 이메일 주소에서 @ 앞부분인 아이디만 추출해줘.' },
  { label: '🔍 직원 정보 조회 (XLOOKUP)', query: 'A열에 직원 사번이 있고, Sheet2의 A열 사번에서 B열 이름을 찾아서 가져오고 싶어.' },
  { label: '📅 날짜에서 분기 구하기', query: 'A열 날짜(예: 2026-06-20)에서 연도와 분기만 추출해서 "2026 2분기" 형식으로 만들어줘.' },
  { label: '💰 원화 표시 텍스트를 숫자로', query: 'A열에 "12,500원" 처럼 문자열로 되어 있는 값을 순수한 숫자 12500으로 변경하고 싶어.' },
];

export default function ExcelCoach() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [useSafeFormula, setUseSafeFormula] = useState(false);
  const [result, setResult] = useState<{
    formula: string;
    explanation: string;
    safeFormula: string;
    formulaBreakdown: Array<{ part: string; desc: string }>;
    headers: string[];
    mockData: Array<{ before: string[]; after: string[] }>;
  } | null>(null);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setIsLoading(true);
    setError('');
    
    try {
      const res = await getExcelFormulaHelper(searchQuery);
      setResult(res);
      setUseSafeFormula(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '수식 분석 중 에러가 발생했습니다. API Key를 확인해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeFormula = useSafeFormula && result ? result.safeFormula : result?.formula || '';

  return (
    <div className="card-container fade-in text-left">
      <div className="coach-welcome-header">
        <div className="green-accent-badge">Vite + Gemini Pro</div>
        <h2 className="section-title">스프레드시트 & 엑셀 AI 헬퍼</h2>
        <p className="section-subtitle">
          하고 싶은 작업을 한글로 편하게 작성해 보세요. 복사해서 바로 쓸 수 있는 수식과 눈으로 확인하는 Before/After 테이블을 제공해 드립니다.
        </p>
      </div>

      <div className="presets-container mt-4">
        <span className="presets-title">추천 예시:</span>
        <div className="preset-chips">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              className="preset-chip"
              onClick={() => handleSearch(preset.query)}
              disabled={isLoading}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(query);
        }}
        className="coach-form mt-4"
      >
        <div className="form-group">
          <textarea
            className="textarea-input"
            rows={3}
            placeholder="예시: A열 이름과 B열 성을 공백 하나 사이에 두고 합치고 싶어"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className="btn-primary w-full flex items-center justify-center gap-2"
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? (
            <>
              <div className="spinner-sm"></div>
              수식 생성 및 데이터 연산 중...
            </>
          ) : (
            <>
              수식 설계하기
              <Sparkles size={16} />
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="error-box mt-4">
          <AlertCircle size={20} className="text-danger flex-shrink-0" />
          <div className="text-left">
            <h4 className="font-bold">에러가 발생했습니다</h4>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {result && !isLoading && (
        <div className="result-section mt-6 fade-in">
          <div className="formula-display-card">
            <div className="formula-card-header">
              <span className="card-tag">추천 엑셀 수식</span>
              
              <button 
                type="button"
                className={`safe-mode-toggle ${useSafeFormula ? 'active' : ''}`}
                onClick={() => setUseSafeFormula(!useSafeFormula)}
                title="에러(#N/A 등) 발생 시 공백으로 처리하도록 수식을 포장합니다."
              >
                {useSafeFormula ? (
                  <>
                    <ShieldCheck size={16} className="text-success" />
                    <span>오류 방지 ON</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert size={16} className="text-muted" />
                    <span>오류 방지 OFF</span>
                  </>
                )}
              </button>
            </div>

            <div className="formula-box-container">
              <code className="formula-text">{activeFormula}</code>
              <button
                className="btn-copy-formula"
                onClick={() => handleCopy(activeFormula)}
                title="클립보드에 복사"
              >
                {copied ? <Check size={18} className="text-success animate-bounce" /> : <Copy size={18} />}
              </button>
            </div>
            
            <div className="formula-mode-desc">
              {useSafeFormula ? (
                <p className="text-xs text-success">
                  💡 `IFERROR`로 감싸져 데이터가 없거나 수식 오류가 나도 화면에 지저분한 에러 대신 빈 칸이 보입니다.
                </p>
              ) : (
                <p className="text-xs text-muted">
                  💡 오류 방지 토글을 켜면 에러(#N/A, #VALUE!) 발생 시 공백으로 대처해 주는 안전 장치 수식을 받으실 수 있습니다.
                </p>
              )}
            </div>
          </div>

          <div className="preview-section mt-6">
            <div className="section-subtitle-with-icon">
              <Sparkles size={16} className="text-success" />
              <h4>수식 적용 미리보기 (Before & After)</h4>
            </div>
            <p className="section-desc">가상의 엑셀 데이터에 위 수식을 적용했을 때의 변화를 미리 눈으로 확인해 보세요.</p>
            
            <PreviewTable headers={result.headers} mockData={result.mockData} />
          </div>

          <div className="breakdown-section mt-6">
            <div className="section-subtitle-with-icon">
              <HelpCircle size={16} className="text-success" />
              <h4>인수(Argument) 맞춤 가이드</h4>
            </div>
            <p className="section-desc">내 시트 상황에 맞게 수식의 셀 범위를 조정하여 사용해 보세요.</p>
            
            <div className="breakdown-grid">
              {result.formulaBreakdown.map((item, idx) => (
                <div key={idx} className="breakdown-item">
                  <div className="breakdown-part">
                    <code>{item.part}</code>
                  </div>
                  <div className="breakdown-arrow">
                    <ArrowRight size={14} className="text-muted" />
                  </div>
                  <div className="breakdown-desc">
                    <span>{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="explanation-section mt-6">
            <h4 className="explanation-title">📝 상세 작동 원리</h4>
            <div className="explanation-body">
              <p>{result.explanation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
