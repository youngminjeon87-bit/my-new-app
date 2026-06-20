import React, { useState } from 'react';
import { Briefcase, Settings, AlertCircle, ArrowRight } from 'lucide-react';

interface OnboardingSurveyProps {
  onSubmit: (job: string, tools: string[], painPoints: string[]) => void;
  isLoading: boolean;
}

export default function OnboardingSurvey({ onSubmit, isLoading }: OnboardingSurveyProps) {
  const [job, setJob] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [customTool, setCustomTool] = useState('');
  const [painPoint, setPainPoint] = useState('');

  const jobPresets = [
    { id: 'office', label: '오피스 직군 (사무/행정)', desc: '엑셀, PPT, 메일 작성 및 문서 최적화 필요' },
    { id: 'service', label: '서비스 직군 (소상공인)', desc: '인스타 마케팅, 고객 리뷰 답장, 매장 관리 필요' },
    { id: 'production', label: '물류/현장/엔지니어', desc: '매뉴얼 디지털화, 재고 분석, 공정 관리 필요' },
    { id: 'custom', label: '기타 직군 (직접 입력)', desc: '나만의 직무를 직접 적어서 가이드를 받습니다' }
  ];

  const toolPresets = ['Excel', 'PowerPoint', 'Word', 'Instagram', 'KakaoTalk', 'Slack', 'Notion', 'ChatGPT'];

  const handleToolToggle = (tool: string) => {
    setSelectedTools(prev => 
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    );
  };

  const handleAddCustomTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTool.trim() && !selectedTools.includes(customTool.trim())) {
      setSelectedTools(prev => [...prev, customTool.trim()]);
      setCustomTool('');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !painPoint.trim()) return;
    
    // Tools list merging
    const allTools = [...selectedTools];
    onSubmit(job, allTools, [painPoint.trim()]);
  };

  return (
    <div className="card-container fade-in">
      <h2 className="section-title">직무 온보딩 설문</h2>
      <p className="section-subtitle">맞춤형 AI 도입 로드맵과 프롬프트 피드백을 제공하기 위해 업무 환경을 공유해주세요.</p>

      <form onSubmit={handleFormSubmit} className="survey-form">
        {/* 1. 직무 선택 */}
        <div className="form-group">
          <label className="form-label">
            <Briefcase size={18} className="icon-inline" /> 1. 당신의 직무는 무엇인가요?
          </label>
          <div className="radio-grid">
            {jobPresets.map(preset => (
              <div 
                key={preset.id} 
                className={`radio-card ${job === preset.id || (preset.id === 'custom' && !['office', 'service', 'production'].includes(job) && job !== '') ? 'active' : ''}`}
                onClick={() => setJob(preset.id === 'custom' ? '' : preset.id)}
              >
                <div className="radio-header">
                  <span className="radio-title">{preset.label}</span>
                </div>
                <p className="radio-desc">{preset.desc}</p>
              </div>
            ))}
          </div>

          {!['office', 'service', 'production'].includes(job) && (
            <input 
              type="text" 
              className="text-input mt-2" 
              placeholder="상세 직무를 적어주세요 (예: 주니어 프론트엔드 개발자, 프리랜서 번역가)"
              value={job === 'custom' ? '' : job}
              onChange={(e) => setJob(e.target.value)}
              required
            />
          )}
        </div>

        {/* 2. 사용 툴 선택 */}
        <div className="form-group">
          <label className="form-label">
            <Settings size={18} className="icon-inline" /> 2. 업무에 주로 사용하는 툴을 선택해주세요 (중복 가능)
          </label>
          <div className="checkbox-grid">
            {toolPresets.map(tool => (
              <button
                type="button"
                key={tool}
                className={`tag-button ${selectedTools.includes(tool) ? 'active' : ''}`}
                onClick={() => handleToolToggle(tool)}
              >
                {tool}
              </button>
            ))}
          </div>
          <div className="custom-tool-input-row">
            <input
              type="text"
              className="text-input-small"
              placeholder="직접 도구 추가 (예: Jira, Figma)"
              value={customTool}
              onChange={(e) => setCustomTool(e.target.value)}
            />
            <button type="button" className="btn-secondary" onClick={handleAddCustomTool}>추가</button>
          </div>
        </div>

        {/* 3. 업무 페인포인트 */}
        <div className="form-group">
          <label className="form-label">
            <AlertCircle size={18} className="icon-inline" /> 3. 현재 어떤 업무에서 가장 비효율을 느끼시나요? (Pain Point)
          </label>
          <textarea
            className="textarea-input"
            rows={3}
            placeholder="예: 고객 문의 메일에 일일이 정중한 답장을 쓰는 시간이 너무 오래 걸려요. / 매주 수요일마다 엑셀 로우 데이터를 기획 보고서 템플릿으로 옮겨 적는 작업을 자동화하고 싶습니다."
            value={painPoint}
            onChange={(e) => setPainPoint(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn-primary w-full mt-4" 
          disabled={isLoading || !job || !painPoint.trim()}
        >
          {isLoading ? '맞춤 AI 로드맵 설계 중...' : '맞춤형 AI 로드맵 만들기'}
          <ArrowRight size={18} className="icon-right" />
        </button>
      </form>
    </div>
  );
}
