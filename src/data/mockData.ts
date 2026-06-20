export interface JobProfile {
  title: string;
  tools: string[];
  painPoints: string[];
  roadmap: {
    step1: { title: string; desc: string; prompt: string };
    step2: { title: string; desc: string; prompt: string };
    step3: { title: string; desc: string; prompt: string };
  };
}

export const jobData: Record<string, JobProfile> = {
  office: {
    title: "오피스 직군 (사무/행정)",
    tools: ["Excel", "PowerPoint", "Word"],
    painPoints: ["반복적인 보고서 작성", "엑셀 수식 오류", "데이터 시각화의 어려움"],
    roadmap: {
      step1: {
        title: "기본 문서 초안 작성",
        desc: "주제와 주요 키워드만 전달하여 30초 안에 보고서 초안 완성하기",
        prompt: "다음 주제로 주간 보고서 초안을 작성해줘: [주제]"
      },
      step2: {
        title: "대화형 데이터 분석",
        desc: "AI에게 가상의 데이터 분석가 역할을 부여하여 복잡한 함수와 상관관계 추출하기",
        prompt: "너는 시니어 데이터 분석가야. 아래 데이터를 바탕으로 매출 성장을 이끄는 핵심 요인 3가지를 분석해줘: [데이터]"
      },
      step3: {
        title: "커스텀 보고서 자동화 에이전트",
        desc: "입력값만 주면 정해진 포맷의 마크다운 보고서를 출력하는 전용 GPTs 설계",
        prompt: "역할: 보고서 작성 전문가\n입력: 로우 데이터\n출력: 요약본 + 본문 + 액션 아이템 형식"
      }
    }
  },
  service: {
    title: "서비스 직군 (소상공인/고객 응대)",
    tools: ["Instagram", "KakaoTalk", "엑셀"],
    painPoints: ["마케팅 홍보 문구 작성", "악성 고객 리뷰 응대", "매장 공지사항 작성"],
    roadmap: {
      step1: {
        title: "홍보 피드 문구 자동 생성",
        desc: "해시태그와 매장 혜택을 담은 인스타그램 문구 작성하기",
        prompt: "우리 카페의 신메뉴 [메뉴명]를 홍보하는 인스타그램 피드 문구와 해시태그 5개를 작성해줘."
      },
      step2: {
        title: "멀티 턴 리뷰 응대 봇",
        desc: "리뷰 톤앤매너를 설정하여 친절하고 논리적으로 대처하기",
        prompt: "다음 부정적인 고객 리뷰에 대해 정중하고 해결책을 제시하는 답변을 써줘: [리뷰내용]"
      },
      step3: {
        title: "고객 문의 FAQ 자동화 에이전트",
        desc: "자주 묻는 질문에 대한 매뉴얼을 사전 주입하여 답장 템플릿을 뽑아내는 에이전트 설계",
        prompt: "역할: 24/7 고객 지원실\n지식: 매장 운영 규정 매뉴얼\n출력: 친절한 카카오톡 답변"
      }
    }
  }
};

// 프롬프트 교정 모의 규칙
export function getPromptFeedback(prompt: string, jobType: string): {
  score: number;
  suggestions: string[];
  improved: string;
} {
  const lower = prompt.toLowerCase();
  const suggestions: string[] = [];
  let score = 50;

  if (lower.length < 15) {
    suggestions.push("구체적인 맥락(배경 설명)을 추가해 주세요.");
    score -= 10;
  }
  if (!lower.includes("역할") && !lower.includes("너는") && !lower.includes("persona")) {
    suggestions.push("AI에게 특정한 역할(페르소나)을 부여해 보세요. (예: '너는 카피라이터야')");
    score += 10;
  }
  if (!lower.includes("형식") && !lower.includes("포맷") && !lower.includes("출력")) {
    suggestions.push("원하는 출력 형식(글머리 기호, 테이블, 줄 길이 등)을 지정해 보세요.");
    score += 10;
  }
  if (lower.includes("잘") || lower.includes("아무거나")) {
    suggestions.push("'잘 해줘', '아무거나' 대신 명확한 제약 조건이나 타겟을 적어주세요.");
    score -= 5;
  }

  score = Math.max(10, Math.min(100, score));

  // 개선된 프롬프트 예시 생성
  let improved = prompt;
  if (jobType === "office") {
    improved = `[역할 부여] 너는 시니어 행정 기획자야.\n[배경 정보] ${prompt}\n[출력 형식] 핵심 요약 3줄, 구체적인 실행 방안 3가지로 나누어 마크다운 형식으로 알려줘.`;
  } else {
    improved = `[역할 부여] 너는 트렌디한 마케터이자 소셜 미디어 작가야.\n[배경 정보] ${prompt}\n[톤앤매너] 이모지를 적절히 사용하고, 친근하고 유쾌한 대화체로 작성해줘.`;
  }

  return { score, suggestions, improved };
}
