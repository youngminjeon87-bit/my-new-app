import { useState } from 'react';
import { Sparkles, Key, AlertCircle, RefreshCw, BarChart2 } from 'lucide-react';
import ExcelCoach from './components/excel/ExcelCoach';

export default function App() {
  const [apiKeyInput, setApiKeyInput] = useState(() => {
    const savedKey = localStorage.getItem('sheet_pilot_api_key');
    if (savedKey) {
      (window as any).VITE_GEMINI_API_KEY = savedKey;
      return savedKey;
    }
    return import.meta.env.VITE_GEMINI_API_KEY || '';
  });

  const [isKeyConfigured, setIsKeyConfigured] = useState(() => {
    const key = localStorage.getItem('sheet_pilot_api_key') || import.meta.env.VITE_GEMINI_API_KEY;
    return !!(key && key !== 'your_gemini_api_key_here' && key.trim() !== '');
  });

  const saveApiKey = () => {
    if (!apiKeyInput.trim()) {
      alert('올바른 API Key를 입력해 주세요.');
      return;
    }
    localStorage.setItem('sheet_pilot_api_key', apiKeyInput.trim());
    (window as any).VITE_GEMINI_API_KEY = apiKeyInput.trim();
    setIsKeyConfigured(true);
    alert('API Key가 브라우저에 저장되었습니다. 이제 수식 생성을 시도해 보세요!');
  };

  const clearApiKey = () => {
    localStorage.removeItem('sheet_pilot_api_key');
    (window as any).VITE_GEMINI_API_KEY = '';
    setApiKeyInput('');
    setIsKeyConfigured(false);
    alert('API Key가 제거되었습니다.');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand-logo">
          <div className="logo-glow-wrapper">
            <Sparkles className="logo-icon text-excel-green" />
          </div>
          <h1>Sheet-Pilot</h1>
          <span className="badge-new bg-excel-green-dark">v1.2</span>
        </div>
        <p className="header-subtitle text-muted">일반 회사원을 위한 초정밀 엑셀 & 스프레드시트 AI 코치</p>
      </header>

      <main className="app-main split-layout">
        <div className="main-content-panel">
          {!isKeyConfigured && (
            <div className="key-warning-banner">
              <AlertCircle size={18} className="text-warning flex-shrink-0" />
              <span>
                Gemini API Key가 설정되지 않았습니다. 수식 분석 및 Before/After 엑셀 표 가상의 생성을 보시려면 우측 설정에서 API Key를 등록해 주세요.
              </span>
            </div>
          )}
          <ExcelCoach />
        </div>

        <div className="sidebar-panel">
          <div className="card-container sidebar-card">
            <h3 className="side-card-title">
              <Key size={16} className="icon-inline text-excel-green" />
              API Key 설정
            </h3>
            <p className="side-card-desc">
              구글 AI Studio에서 발급받은 **Gemini API Key**를 입력하세요. 입력된 키는 외부 서버에 전송되지 않고 브라우저(Local)에만 보관됩니다.
            </p>
            <div className="form-group mt-3">
              <input
                type="password"
                className="text-input"
                placeholder="AI Studio API Key (AIzaSy...)"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 mt-3">
              <button 
                type="button" 
                className="btn-primary flex-1 btn-sm" 
                onClick={saveApiKey}
              >
                저장하기
              </button>
              {isKeyConfigured && (
                <button 
                  type="button" 
                  className="btn-secondary btn-sm" 
                  onClick={clearApiKey}
                  title="초기화"
                >
                  <RefreshCw size={14} />
                </button>
              )}
            </div>
            
            {isKeyConfigured ? (
              <span className="status-label status-success mt-2">
                ● 연결 상태: 설정 완료
              </span>
            ) : (
              <span className="status-label status-warning mt-2">
                ⚠️ 연결 상태: 키 등록 필요
              </span>
            )}
          </div>

          <div className="card-container sidebar-card mt-4">
            <h3 className="side-card-title">
              <BarChart2 size={16} className="icon-inline text-excel-green" />
              실무 엑셀 팁
            </h3>
            <ul className="quick-guide-list">
              <li>
                <strong>IFERROR로 마감하기:</strong> 
                수식을 만들 때는 항상 오류 처리를 해 주는 것이 깔끔합니다. 본 코치 앱의 <code>오류 방지 토글</code>을 활용하세요.
              </li>
              <li>
                <strong>XLOOKUP 우선 사용:</strong> 
                VLOOKUP보다 속도가 빠르고 인수가 간단한 XLOOKUP을 추천해 달라고 명시적으로 지시해 보세요.
              </li>
              <li>
                <strong>빠른 채우기 (Ctrl + E):</strong> 
                간단한 텍스트 합치기나 나누기는 수식 없이 단축키 하나로 엑셀이 자동 학습해 채워줍니다.
              </li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2026 Sheet-Pilot. All rights reserved.</p>
      </footer>
    </div>
  );
}
