# Claude Code 지침서: AI-Bridge 상용화 1단계 고도화 작업

이 파일은 AI-Bridge의 UI 완성도와 비용 절감을 위해 Claude가 직접 코드를 수정할 수 있도록 정리한 지침서입니다. 아래 가이드라인을 따라 코드를 업데이트해 주세요.

---

## 작업 1: 로컬 캐싱 적용 (API 비용 절감 및 상태 보존)
**목표**: 페이지를 새로고침하더라도 생성된 로드맵과 프로필이 유지되고, 중복 API 호출로 인한 비용을 방지합니다.

### 수정 파일: `src/App.tsx`
1. `App` 컴포넌트의 초기 상태값(`userProfile`, `roadmapData`)을 `localStorage`에서 읽어오도록 수정합니다.
2. 로드맵이 성공적으로 생성되면 `localStorage`에 `userProfile`과 `roadmapData`를 저장합니다.
3. `handleReset` 함수 실행 시 `localStorage`에 저장된 데이터를 삭제합니다.

**변경할 코드 제안 (App.tsx)**:
```typescript
// 초기 상태 선언 변경
const [userProfile, setUserProfile] = useState<{
  job: string;
  tools: string[];
  painPoints: string[];
} | null>(() => {
  const saved = localStorage.getItem('ab_user_profile');
  return saved ? JSON.parse(saved) : null;
});

const [roadmapData, setRoadmapData] = useState<any>(() => {
  const saved = localStorage.getItem('ab_roadmap_data');
  return saved ? JSON.parse(saved) : null;
});

// handleSurveySubmit 성공 시점에 추가
localStorage.setItem('ab_user_profile', JSON.stringify({ job, tools, painPoints }));
localStorage.setItem('ab_roadmap_data', JSON.stringify(res / 또는 mock data));

// handleReset 시점에 추가
localStorage.removeItem('ab_user_profile');
localStorage.removeItem('ab_roadmap_data');
```

---

## 작업 2: UI/UX 고도화 (글래스모피즘 호버 글로우 효과 추가)
**목표**: 카드를 올렸을 때 마우스 커서를 따라 빛나는 네온 테두리 효과를 부여하여 premium 감성을 극대화합니다.

### 수정 파일: `src/index.css`
1. `index.css` 하단에 아래 CSS 클래스를 추가하거나 기존 카드 호버 스타일을 강화해 주세요.

```css
/* 프리미엄 호버 글로우 효과 */
.timeline-content-card {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.timeline-content-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.timeline-content-card:hover {
  transform: translateY(-4px) scale(1.01);
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 12px 24px -10px rgba(99, 102, 241, 0.3);
}

.timeline-content-card:hover::before {
  opacity: 1;
}

.timeline-content-card > * {
  position: relative;
  z-index: 1;
}
```

---

## 작업 3: 프롬프트 코치 피드백 히스토리 기록
**목표**: 사용자가 첨삭받은 과거 프롬프트 기록을 세션 동안 모아볼 수 있는 간단한 사이드 히스토리 목록을 제공합니다.

### 수정 파일: `src/components/coach/PromptCoach.tsx`
1. `PromptCoach` 내부 상태에 `history` 리스트를 추가합니다.
2. 성공적인 첨삭 피드백을 받을 때마다 `{ prompt, score, improvedPrompt }` 객체를 `history` 배열 상단에 추가합니다.
3. 프롬프트 코치 UI 하단에 **"최근 코칭 히스토리"** 영역을 렌더링하고, 클릭 시 해당 항목을 다시 불러오는 기능을 추가합니다.
