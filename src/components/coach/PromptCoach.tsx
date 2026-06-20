import { useState } from 'react';
import { Send, Sparkles, Award, Copy, Check, Info, History } from 'lucide-react';
import { getPromptFeedback } from '../../services/gemini';

interface PromptCoachProps {
  currentJob: string;
}

interface CoachHistoryEntry {
  prompt: string;
  score: number;
  improvedPrompt: string;
}

export default function PromptCoach({ currentJob }: PromptCoachProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    score: number;
    suggestions: string[];
    improvedPrompt: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<CoachHistoryEntry[]>([]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError('');
    try {
      const res = await getPromptFeedback(prompt, currentJob || 'office');
      setFeedback(res);
      setHistory(prev => [{ prompt, score: res.score, improvedPrompt: res.improvedPrompt }, ...prev]);
    } catch (err: any) {
      setError(err.message || '분석 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (entry: CoachHistoryEntry) => {
    setPrompt(entry.prompt);
    setError('');
    setFeedback({ score: entry.score, suggestions: [], improvedPrompt: entry.improvedPrompt });
  };

  const handleCopyImproved = () => {
    if (!feedback?.improvedPrompt) return;
    navigator.clipboard.writeText(feedback.improvedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success border-success';
    if (score >= 50) return 'text-warning border-warning';
    return 'text-danger border-danger';
  };

  return (
    <div className="card-container fade-in">
      <h2 className="section-title">실시간 프롬프트 코치</h2>
      <p className="section-subtitle">
        AI 비서에게 지시할 프롬프트를 입력해 보세요. 더 완벽하고 일 잘하는 지시문으로 즉시 고쳐 드립니다.
      </p>

      <form onSubmit={handleAnalyze} className="coach-form">
        <div className="form-group">
          <label className="form-label">프롬프트 작성하기</label>
          <textarea
            className="textarea-input"
            rows={4}
            placeholder="예: 우리 매장 인스타그램 광고 문구 작성해줘."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={isLoading || !prompt.trim()}>
          {isLoading ? '프롬프트 첨삭 중...' : '프롬프트 첨삭 받기'}
          <Send size={18} className="icon-right" />
        </button>
      </form>

      {error && (
        <div className="error-box mt-4">
          <Info size={16} className="icon-inline" /> {error}
        </div>
      )}

      {feedback && (
        <div className="feedback-result mt-6 fade-in">
          <div className="feedback-header-row">
            <div className="score-badge-container">
              <div className={`score-circle ${getScoreColor(feedback.score)}`}>
                <span className="score-num">{feedback.score}</span>
                <span className="score-label">점</span>
              </div>
            </div>
            <div className="feedback-summary">
              <h3 className="feedback-status-title">
                <Award size={18} className="icon-inline" /> 
                {feedback.score >= 80 ? '훌륭한 지시문입니다!' : feedback.score >= 50 ? '조금 더 다듬어 볼까요?' : '설명이 많이 필요합니다.'}
              </h3>
              <p className="feedback-status-desc">피드백 리포트를 확인하여 지시 효율을 높여보세요.</p>
            </div>
          </div>

          <div className="suggestions-box mt-4">
            <h4 className="box-sub-title">💡 더 좋아지기 위한 제안사항</h4>
            <ul className="suggestions-list">
              {feedback.suggestions.map((suggestion, idx) => (
                <li key={idx} className="suggestion-item">{suggestion}</li>
              ))}
            </ul>
          </div>

          <div className="improved-prompt-box mt-4">
            <div className="improved-header">
              <div className="improved-title">
                <Sparkles size={16} className="icon-inline text-sparkle" />
                이렇게 고치면 더 일을 잘해요
              </div>
              <button className="btn-text" onClick={handleCopyImproved}>
                {copied ? (
                  <>
                    <Check size={14} className="icon-inline text-success" />
                    복사 완료
                  </>
                ) : (
                  <>
                    <Copy size={14} className="icon-inline" />
                    복사하기
                  </>
                )}
              </button>
            </div>
            <pre className="improved-code">{feedback.improvedPrompt}</pre>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="coach-history mt-6">
          <h4 className="box-sub-title">
            <History size={16} className="icon-inline" /> 최근 코칭 히스토리
          </h4>
          <ul className="coach-history-list">
            {history.map((entry, idx) => (
              <li key={idx} className="coach-history-item" onClick={() => handleSelectHistory(entry)}>
                <span className={`score-badge ${getScoreColor(entry.score)}`}>{entry.score}점</span>
                <span className="coach-history-prompt">{entry.prompt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
