async function callGemini(systemInstruction: string, prompt: string, responseSchema?: any) {
  const apiKey = (window as any).VITE_GEMINI_API_KEY || localStorage.getItem('sheet_pilot_api_key') || import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('API Key가 설정되지 않았습니다. 설정 패널에서 구글 Gemini API Key를 저장해 주세요.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const requestBody: any = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: {
      temperature: 0.2,
    }
  };

  if (responseSchema) {
    requestBody.generationConfig.responseMimeType = "application/json";
    requestBody.generationConfig.responseSchema = responseSchema;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `API 호출 실패 (Status: ${response.status})`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (responseSchema) {
    return JSON.parse(text);
  }
  return text;
}

// 1. 맞춤형 AI 도입 로드맵 생성 함수
export async function generateRoadmap(job: string, tools: string[], painPoints: string[]) {
  const systemInstruction = `너는 직군별 맞춤형 AI 도입 가이드 전문가야. 사용자의 직무, 주로 사용하는 도구, 업무 애로사항(Pain Points)을 분석하여 개인화된 3단계 AI 활용 로드맵을 JSON 형태로 생성해줘.`;
  
  const prompt = `
  사용자 정보:
  - 직무: ${job}
  - 사용하는 도구: ${tools.join(', ')}
  - 해결하고 싶은 업무 문제: ${painPoints.join(', ')}

  각 단계(Step 1: 초급, Step 2: 중급, Step 3: 고급)별로 구체적인 활용법과 바로 쓸 수 있는 프롬프트 템플릿 예시를 포함해줘.
  `;

  const schema = {
    type: "OBJECT",
    properties: {
      title: { type: "STRING" },
      analysis: { type: "STRING" },
      steps: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            stepNumber: { type: "INTEGER" },
            level: { type: "STRING" },
            title: { type: "STRING" },
            desc: { type: "STRING" },
            examplePrompt: { type: "STRING" }
          },
          required: ["stepNumber", "level", "title", "desc", "examplePrompt"]
        }
      }
    },
    required: ["title", "analysis", "steps"]
  };

  return callGemini(systemInstruction, prompt, schema);
}

// 2. 실시간 프롬프트 코치 함수
export async function getPromptFeedback(userPrompt: string, job: string) {
  const systemInstruction = `너는 프롬프트 엔지니어링 코치야. 사용자가 입력한 프롬프트를 분석하여 평가 점수(10~100점), 구체적인 개선 제안 3가지, 그리고 완성도 높게 개선된 프롬프트 예시를 JSON 형태로 제공해줘.`;

  const prompt = `
  사용자 직무: ${job}
  사용자가 작성한 프롬프트: "${userPrompt}"
  `;

  const schema = {
    type: "OBJECT",
    properties: {
      score: { type: "INTEGER" },
      suggestions: {
        type: "ARRAY",
        items: { type: "STRING" }
      },
      improvedPrompt: { type: "STRING" }
    },
    required: ["score", "suggestions", "improvedPrompt"]
  };

  return callGemini(systemInstruction, prompt, schema);
}

// 3. 엑셀 수식 및 데이터 변환 도우미 함수
export async function getExcelFormulaHelper(userRequest: string) {
  const systemInstruction = `너는 세계 최고의 마이크로소프트 엑셀 및 구글 스프레드시트 수식 전문가야.
사용자가 하고자 하는 작업이나 고민 설명을 읽고, 다음 항목들을 담은 JSON 데이터를 반환해줘:
1. formula: 핵심 수식 (가장 효율적이고 간결한 현대식 수식, 예: XLOOKUP, INDEX/MATCH, FILTER 등 우선)
2. explanation: 이 수식이 작동하는 원리와 구조에 대한 명확하고 친절한 한국어 설명
3. safeFormula: 에러 발생 시 공백을 표시하는 등 안전장치가 가미된 수식 (예: IFERROR 등 활용)
4. formulaBreakdown: 수식을 분석하여 각 인수(Argument)에 사용자가 어떤 열/셀을 입력해야 하는지 분해 설명하는 리스트
5. headers: 시각화 표에 들어갈 컬럼 이름 배열 (2~3개) (예: ["이름", "성", "풀네임"])
6. mockData: 수식이 적용되는 모습을 보여주기 위한 가상의 행 데이터 리스트 (각 행은 before와 after 값을 가짐. 3~4개 행 정도)

반드시 스키마 구조를 정확히 지켜서 응답해줘.`;

  const prompt = `사용자 요구사항: "${userRequest}"`;

  const schema = {
    type: "OBJECT",
    properties: {
      formula: { type: "STRING" },
      explanation: { type: "STRING" },
      safeFormula: { type: "STRING" },
      formulaBreakdown: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            part: { type: "STRING" },
            desc: { type: "STRING" }
          },
          required: ["part", "desc"]
        }
      },
      headers: {
        type: "ARRAY",
        items: { type: "STRING" }
      },
      mockData: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            before: {
              type: "ARRAY",
              items: { type: "STRING" }
            },
            after: {
              type: "ARRAY",
              items: { type: "STRING" }
            }
          },
          required: ["before", "after"]
        }
      }
    },
    required: ["formula", "explanation", "safeFormula", "formulaBreakdown", "headers", "mockData"]
  };

  return callGemini(systemInstruction, prompt, schema);
}

