# Strategy Simulator 팀원 작업 가이드

## 담당 범위

`/simulator` 페이지 전체 구현.
장르·할인율·시즌·빈도·전략 목표를 입력하면 과거 분석 결과 기반으로 리스크를 진단하는 룰 기반 도구.

---

## 이미 준비된 것 (건드리지 말 것)

| 항목 | 위치 | 내용 |
|---|---|---|
| 타입 정의 | `web/types/index.ts` | `SimulatorInput`, `SimulatorResult`, `EvidenceItem`, `SimulatorRule` |
| 룰 데이터 | `web/public/data/simulator_rules.json` | 8개 룰, confidence 포함 |
| placeholder 컴포넌트 | `web/components/simulator/` | `SimulatorForm`, `StrategyResult`, `EvidenceList`, `SampleSizeWarning` |
| 공통 컴포넌트 | `web/components/common/` | `EvidenceBox`, `RiskBadge`, `WarningBox` |
| 페이지 틀 | `web/app/simulator/page.tsx` | placeholder 화면 |
| 필터 상수 | `web/lib/filter.ts` | `GENRE_OPTIONS` 등 재사용 가능 |

---

## 구현해야 할 파일

```
web/
├── app/simulator/page.tsx         ← 전체 페이지 (현재 placeholder → 실제 구현)
├── components/simulator/
│   ├── SimulatorForm.tsx          ← 입력 폼
│   ├── StrategyResult.tsx         ← 진단 결과 출력
│   ├── EvidenceList.tsx           ← 근거 목록 (이미 구조만 있음)
│   └── SampleSizeWarning.tsx      ← 표본 수 경고 (이미 구조만 있음)
└── lib/simulator.ts               ← 룰 기반 진단 로직
```

---

## 타입 정의 (변경 금지)

```ts
// web/types/index.ts 에 이미 있음

export interface SimulatorInput {
  genre: Genre                                          // "Action" | "RPG" | "Adventure" | "Casual/Lightweight" | "Strategy/Simulation"
  discount_rate: number                                 // 10 ~ 90
  is_season_sale: boolean
  annual_discount_frequency: "1회" | "2회" | "3회 이상"
  strategy_goal: "단기 유입" | "장기 유지" | "만족도 관리"
}

export interface EvidenceItem {
  title: string
  description: string
  source: string
  confidence: "strong" | "exploratory"
  chart?: string
}

export interface SimulatorResult {
  strategy_type: string          // "단기 유입형", "유지율 주의형", "만족도 리스크형", "반복 할인 피로형" 등
  summary: string                // 전체 요약 한두 문장
  response_comment: string       // 단기 반응 코멘트
  retention_comment: string      // 유지율 리스크 코멘트
  satisfaction_comment: string   // 만족도 리스크 코멘트
  fatigue_comment: string        // 반복 할인 피로도 코멘트
  evidences: EvidenceItem[]      // 근거 목록
  warnings: string[]             // 표본 수 경고 등
}
```

---

## 룰 데이터 로딩

```ts
// fetch로 가져오거나, lib/data.ts의 함수 사용
const res = await fetch("/data/simulator_rules.json")
const rules: SimulatorRule[] = await res.json()
```

`SimulatorRule` 구조:
```ts
{
  id: string
  condition: string       // 룰 조건 설명
  message: string         // 진단 문장
  evidence: string        // 근거 통계
  chart?: string          // 차트 파일명 (있으면)
  confidence: "strong" | "exploratory"
}
```

---

## 전략 목표별 코멘트 우선순위

전략 목표 입력은 계산을 바꾸는 게 아니라 **출력 코멘트 순서**를 바꾸는 역할.

| strategy_goal | 우선 표시 |
|---|---|
| 단기 유입 | `response_comment` 먼저 |
| 장기 유지 | `retention_comment` 먼저 |
| 만족도 관리 | `satisfaction_comment` 먼저 |

---

## 룰 기반 진단 로직 예시 (`lib/simulator.ts` 참고)

```ts
// 이미 stub 있음 — 실제 로직으로 교체하면 됨

if (input.discount_rate >= 60) {
  // response_comment: "높은 할인율은 단기 반응을 높일 가능성이 있습니다."
  // evidence: "p=0.004"  confidence: "strong"
}

if (input.is_season_sale) {
  // retention_comment: "시즌 세일은 유지율 주의형 전략입니다."
  // confidence: "exploratory"
}

if (input.annual_discount_frequency === "3회 이상") {
  // fatigue_comment: "반복 할인 피로도 주의"
}
```

---

## 표본 수 경고

장르별 유효 이벤트 수 (playtime=all 기준):

| 장르 | 이벤트 수 |
|---|---|
| Action | 확인 필요 |
| RPG | 확인 필요 |
| Adventure | 확인 필요 |
| Casual/Lightweight | 확인 필요 |
| Strategy/Simulation | 확인 필요 |

`web/public/data/dashboard_events.json`에서 genre별 `valid_event_count_for_genre` 값 참고.
20건 미만이면 `SampleSizeWarning` 표시 (`GENRE_SAMPLE_THRESHOLD = 20`, `web/lib/constants.ts`).

---

## 반드시 지켜야 할 표현 원칙

- **금지 표현:** "예상 반응률", "성공 확률", "확실히 효과적", "예측 결과"
- **권장 표현:** "과거 유사 조건 기준 경향", "단기 반응 가능성", "탐색적 패턴", "전략적으로 고려 가능"
- 각 진단 결과 옆에 반드시 근거(`evidence`) 표시
- 페이지 하단에 "이 결과는 예측 모델이 아니라 과거 유사 조건 기준의 전략 참고용 진단입니다." 안내 문구 포함

---

## 로컬 실행 방법

```powershell
# 프로젝트 루트에서
python scripts/build_app_data.py    # JSON 생성 (이미 있으면 생략 가능)

# web/ 폴더에서
npm install
npm run dev
# → http://localhost:3000/simulator
```

---

## 통합 시 확인 사항

- `SimulatorInput`, `SimulatorResult` 타입 그대로 사용 (변경 시 사전 협의)
- 컴포넌트는 `export function` 으로 내보낼 것
- `page.tsx`에서 `SimulatorForm`의 `onSubmit`에 `SimulatorInput`을 받아 `SimulatorResult`를 계산하는 구조로 연결
