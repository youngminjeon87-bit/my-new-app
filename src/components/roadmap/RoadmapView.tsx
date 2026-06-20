import { Copy, Check, RefreshCw, Sparkles, BookOpen } from 'lucide-react';
import { useState } from 'react';

interface RoadmapStep {
  stepNumber: number;
  level: string;
  title: string;
  desc: string;
  examplePrompt: string;
}

interface RoadmapData {
  title: string;
  analysis: string;
  steps: RoadmapStep[];
}

interface RoadmapViewProps {
  data: RoadmapData;
  onReset: () => void;
}

export default function RoadmapView({ data, onReset }: RoadmapViewProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="card-container fade-in">
      <div className="roadmap-header">
        <div className="roadmap-title-row">
          <Sparkles size={24} className="sparkle-icon" />
          <h2 className="section-title mb-0">{data.title || '직무 맞춤형 AI 도입 로드맵'}</h2>
        </div>
        <button className="btn-icon" onClick={onReset} title="다시 설문하기">
          <RefreshCw size={18} />
          다시 하기
        </button>
      </div>

      <div className="analysis-box">
        <h3 className="analysis-title">
          <BookOpen size={16} className="icon-inline" /> PM의 맞춤 분석 및 진단
        </h3>
        <p className="analysis-text">{data.analysis || '입력하신 프로필과 페인 포인트를 분석하여 도출된 로드맵입니다.'}</p>
      </div>

      <div className="roadmap-timeline">
        {data.steps.map((step, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-badge-col">
              <div className="timeline-number">{step.stepNumber || index + 1}</div>
              <div className="timeline-line"></div>
            </div>
            
            <div className="timeline-content-card">
              <div className="step-level-tag">{step.level || `Step ${step.stepNumber}`}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
              
              <div className="prompt-template-box">
                <div className="prompt-template-header">
                  <span className="prompt-template-label">실행 프롬프트 템플릿</span>
                  <button 
                    className="btn-text" 
                    onClick={() => handleCopy(step.examplePrompt, index)}
                  >
                    {copiedIndex === index ? (
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
                <pre className="prompt-template-code">{step.examplePrompt}</pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
