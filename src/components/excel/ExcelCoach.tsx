import { useState } from 'react';
import { Sparkles, Copy, Check, AlertCircle, HelpCircle, ShieldAlert, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { getExcelFormulaHelper } from '../../services/gemini';
import { localizeFormula } from '../../lib/excelLocalizer';
import { anonymizeText } from '../../lib/anonymizer';
import PreviewTable from './PreviewTable';

const PRESETS = [
  { label: '📧 이메일에서 아이디 추출', query: 'A열에 있는 이메일 주소에서 chulsoo@company.com 앞부분인 아이디만 추출해줘.' },
  { label: '🔍 직원 정보 조회 (XLOOKUP)', query: 'A열에 직원 사번(사번: 010-1234-5678)이 있고, Sheet2의 사번에서 이름을 찾아서 가져오고 싶어.' },
  { label: '📅 날짜에서 분기 구하기', query: 'A열 날짜(예: 2026-06-20)에서 연도와 분기만 추출해서 "2026 2분기" 형식으로 만들어줘.' },
  { label: '💰 원화 표시 텍스트를 숫자로', query: 'A열에 "12,500원" 처럼 문자열로 되어 있는 값을 순수한 숫자 12500으로 변경하고 싶어.' },
];

export default function ExcelCoach() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Custom Controls for Differentiators
  const [useSafeFormula, setUseSafeFormula] = useState(false);
  const [separator, setSeparator] = useState<',' | ';'>(',');
  const forceUppercase = true;
  const [useAnonymizer, setUseAnonymizer] = useState(true);
  const [maskedNotice, setMaskedNotice] = useState<string | null>(null);

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
    setMaskedNotice(null);
    
    try {
      let finalQuery = searchQuery;
      if (useAnonymizer) {
        const anon = anonymizeText(searchQuery);
        if (anon.hasMasked) {
          finalQuery = anon.text;
          const maskDetails = anon.replacements
            .map(r => `"${r.original}" ➔ "${r.masked}"`)
            .join(', ');
          setMaskedNotice(`보안 필터링 적용 완료: ${maskDetails}`);
        }
      }

      const res = await getExcelFormulaHelper(finalQuery);
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

  const activeRawFormula = useSafeFormula && result ? result.safeFormula : result?.formula || '';
  
  // Apply regional localizer formatting
  const localizedFormula = result 
    ? localizeFormula(activeRawFormula, { separator, useUppercase: forceUppercase })
    : '';

  return (
    <div className="card-container fade-in text-left">
      <div className="coach-welcome-header">
        <div className="green-accent-badge">Vite + Gemini Pro</div>
        <h2 className="section-title">스프레드시트 & 엑셀 AI 헬퍼</h2>
        <p className="section-subtitle">
          하고 싶은 작업을 한글로 편하게 작성해 보세요. 복사해서 바로 쓸 수 있는 수식과 눈으로 확인하는 Sandbox 테이블을 제공해 드립니다.
        </p>
      </div>

      {/* Preset Chips */}
      <div className="presets-container mt-4">
        <span className="presets-title">추천 예시 (개인정보 포함):</span>
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

      {/* Input Form with Anonymizer Indicator */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(query);
        }}
        className="coach-form mt-4"
      >
        <div className="form-group mb-2">
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

        {/* Form controls (Anonymizer Toggle) */}
        <div className="flex justify-between items-center mb-4">
          <button
            type="button"
            className={`btn-icon btn-xs ${useAnonymizer ? 'border-success text-success' : ''}`}
            onClick={() => setUseAnonymizer(!useAnonymizer)}
            title="AI로 전송 전 이름, 연락처, 이메일 등의 개인정보를 가상 데이터로 자동 변경하여 보안 위반을 방지합니다."
          >
            {useAnonymizer ? (
              <>
                <ShieldCheck size={14} />
                <span>로컬 보안 필터 ON</span>
              </>
            ) : (
              <>
                <ShieldAlert size={14} className="text-muted" />
                <span>로컬 보안 필터 OFF</span>
              </>
            )}
          </button>
          <span className="text-[11px] text-muted-foreground">※ 개인정보는 브라우저 내에서만 마스킹 처리됩니다.</span>
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

      {/* Security filter notification */}
      {maskedNotice && (
        <div className="info-box bg-success/10 border border-success/30 rounded-lg p-3 text-xs mt-3 text-success">
          🔒 {maskedNotice}
        </div>
      )}

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
          
          {/* Delimiter / regional settings widget */}
          <div className="flex flex-wrap gap-2 items-center justify-between mb-3 bg-white/5 border border-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe size={14} className="text-excel-green" />
              <span>사용 중인 컴퓨터의 엑셀 환경에 맞춤 설정:</span>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                className={`btn-secondary btn-xs ${separator === ',' ? 'active border-success text-success bg-success/5' : ''}`}
                onClick={() => setSeparator(',')}
              >
                쉼표 구분자 ( , )
              </button>
              <button
                type="button"
                className={`btn-secondary btn-xs ${separator === ';' ? 'active border-success text-success bg-success/5' : ''}`}
                onClick={() => setSeparator(';')}
              >
                세미콜론 구분자 ( ; )
              </button>
            </div>
          </div>

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
              <code className="formula-text">{localizedFormula}</code>
              <button
                className="btn-copy-formula"
                onClick={() => handleCopy(localizedFormula)}
                title="클립보드에 복사"
              >
                {copied ? <Check size={18} className="text-success animate-bounce" /> : <Copy size={18} />}
              </button>
            </div>
            
            <div className="formula-mode-desc text-left text-xs">
              {useSafeFormula ? (
                <span className="text-success">
                  💡 `IFERROR`로 감싸져 데이터가 없거나 수식 오류가 나도 화면에 지저분한 에러 대신 빈 칸이 보입니다.
                </span>
              ) : (
                <span className="text-muted">
                  💡 오류 방지 토글을 켜면 에러(#N/A, #VALUE!) 발생 시 공백으로 대처해 주는 안전 장치 수식을 받으실 수 있습니다.
                </span>
              )}
            </div>
          </div>

          {/* Sandbox spreadsheet preview */}
          <div className="preview-section mt-6">
            <div className="section-subtitle-with-icon">
              <Sparkles size={16} className="text-success" />
              <h4>수식 적용 미리보기 (Before & After)</h4>
            </div>
            <p className="section-desc">가상의 엑셀 데이터에 위 수식을 적용했을 때의 변화를 미리 눈으로 확인해 보세요.</p>
            
            <PreviewTable 
              headers={result.headers} 
              mockData={result.mockData} 
              formula={localizedFormula} 
            />
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
