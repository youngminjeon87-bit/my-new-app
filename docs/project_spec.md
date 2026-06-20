# AI-Bridge 프로젝트 명세서 (Project Specification)

## 1. 개요
* **프로젝트명**: AI-Bridge (전 직군 맞춤형 AI 도입 가이드 솔루션)
* **목적**: 사용자의 직무와 툴 환경에 따른 맞춤형 AI 사용 로드맵 및 프롬프트 코칭 제공.
* **기술 스택**: React + Vite + TypeScript + Vanilla CSS + Lucide Icons (LLM 연동 보류/대기)

---

## 2. 개발 로드맵 (Task List)
- [ ] Onboarding: 직무 및 페인 포인트 수집 설문 UI
- [ ] Roadmap: 단계별(Step 1, 2, 3) AI 로드맵 카드 컴포넌트
- [ ] Prompt Coach: 모의 프롬프트 입력 및 피드백 실시간 코칭 UI
- [ ] API Integration: (승인 후) GPT/Claude API 연동

---

## 3. 파일 구조 계획
* `src/data/mockData.ts` -> 직무별 가상 로드맵 데이터 및 모의 피드백 규칙
* `src/components/onboarding/OnboardingSurvey.tsx` -> 설문 입력 UI
* `src/components/roadmap/RoadmapView.tsx` -> 맞춤 로드맵 출력 UI
* `src/components/coach/PromptCoach.tsx` -> 실시간 프롬프트 코칭 UI
