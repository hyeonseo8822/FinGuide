# PLAN.md — Finance Lab: ELS/ETF Interactive Simulator

> **Status**: Draft v1.0 — 2026-05-28
> **Purpose**: Implementation roadmap. No feature code is written until a phase is approved.

---

## 1. Project Overview

**App Name**: FinGuide
**Audience**: High school students and financial beginners (ages 16–25)  
**Core Mission**: Replace dense financial text with interactive simulations demonstrating ELS Knock-In risk and ETF diversification benefit.

---

## 2. Tech Stack Decision

| Layer | Choice | Rationale |
|---|---|---|
| Framework | React 18 (Vite) | Fast HMR, minimal config, aligns with CLAUDE.md |
| Language | TypeScript | Type-safe state management for simulation logic |
| Styling | styled-components | CSS-in-JS scoped to components; theme tokens via ThemeProvider |
| Charts | Recharts | Declarative React-native charts; good for animated line charts |
| Animation | Framer Motion | Smooth entrance/state transition animations |
| State | React `useState` / `useReducer` | Local component state sufficient; no server state needed |
| Package Manager | npm | Default |

---

## 3. Directory Architecture

```
FinGuide/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Site title + nav anchor links
│   │   │   └── Footer.tsx          # Data sources (FSS, KRX, KOFIA)
│   │   ├── hero/
│   │   │   └── HeroSection.tsx     # One-sentence ELS definition + lab theme intro
│   │   ├── comparison/
│   │   │   └── ComparisonMatrix.tsx # Feature C: Savings vs ETF vs ELS table
│   │   ├── els-simulator/
│   │   │   ├── ELSSimulator.tsx     # Feature A: container + orchestrator
│   │   │   ├── KnockInSlider.tsx    # Barrier level control (50%–70%)
│   │   │   ├── PriceChart.tsx       # Animated line chart (Recharts)
│   │   │   ├── StatusBanner.tsx     # Green/Red state indicator
│   │   │   └── modals/
│   │   │       ├── SuccessModal.tsx # Early redemption success state
│   │   │       └── KnockInModal.tsx # Barrier breached warning state
│   │   ├── etf-simulator/
│   │   │   ├── ETFSimulator.tsx     # Feature B: container
│   │   │   ├── PortfolioSelector.tsx # Single-stock vs ETF toggle
│   │   │   ├── ShockButton.tsx      # Trigger negative market event
│   │   │   └── GaugeBars.tsx        # Dual animated return gauges
│   │   └── quiz/
│   │       ├── QuizSection.tsx      # Feature D: container
│   │       ├── Checklist.tsx        # Receipt-style risk acknowledgement
│   │       └── OXQuiz.tsx           # 4-question speed quiz
│   ├── data/
│   │   ├── quizQuestions.ts         # OX quiz question bank
│   │   ├── checklistItems.ts        # Risk disclaimer text list
│   │   └── comparisonData.ts        # Table row data for ComparisonMatrix
│   ├── hooks/
│   │   ├── useELSSimulation.ts      # Simulation tick logic + state machine
│   │   └── useETFShock.ts           # ETF shock calculation logic
│   ├── utils/
│   │   └── priceGenerator.ts        # Pseudo-random price path generator
│   ├── types/
│   │   └── simulation.ts            # Shared TypeScript interfaces
│   ├── styles/
│   │   ├── theme.ts                 # styled-components ThemeProvider token definitions
│   │   └── GlobalStyle.ts           # createGlobalStyle: resets + base typography
│   ├── App.tsx                      # Root: section layout + scroll anchors
│   └── main.tsx                     # React DOM entry point
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── CLAUDE.md
├── PLAN.md
└── TROUBLESHOOTING.md
```

---

## 4. Component Hierarchy & Responsibility

```
App
├── Header
├── HeroSection
├── ComparisonMatrix          ← Feature C (static data, no simulation)
├── ELSSimulator              ← Feature A
│   ├── KnockInSlider
│   ├── PriceChart
│   ├── StatusBanner
│   └── (SuccessModal | KnockInModal)   ← conditional render
├── ETFSimulator              ← Feature B
│   ├── PortfolioSelector
│   ├── ShockButton
│   └── GaugeBars
├── QuizSection               ← Feature D
│   ├── Checklist
│   └── OXQuiz
└── Footer
```

---

## 5. State Management Strategy

### 5.1 ELS Simulator State (`useELSSimulation` hook)

```typescript
type ELSState = {
  knockInBarrier: number;       // 0.50 | 0.55 | 0.60 | 0.65 | 0.70
  isRunning: boolean;           // animation ticker active
  currentMonth: number;         // 0–36, increments by 6
  priceHistory: number[];       // price index values per tick
  status: 'idle' | 'running' | 'knocked-in' | 'redeemed' | 'matured-loss' | 'matured-gain';
};
```

State transitions:
- `idle → running`: User clicks "Start Simulation"
- `running → knocked-in`: Any tick price < knockInBarrier
- `running → redeemed`: Month-6-tick price ≥ 0.85 (early redemption threshold)
- `running → matured-*`: Month 36 reached; final price determines gain/loss
- Any terminal state → `idle`: User clicks "Reset"

### 5.2 ETF Simulator State (`useETFShock` hook)

```typescript
type ETFState = {
  portfolioType: 'single' | 'etf';
  shockApplied: boolean;
  singleStockReturn: number;    // default 0; shock → -0.40
  etfReturn: number;            // default 0; shock → -0.035
};
```

### 5.3 Quiz State (local to `QuizSection`)

```typescript
type QuizState = {
  checklistChecked: boolean[];  // length = checklistItems.length
  allChecked: boolean;          // derived: every item checked
  stampUnlocked: boolean;       // shown after allChecked
  currentQuestion: number;      // 0–3 for OX quiz
  score: number;
  quizComplete: boolean;
};
```

---

## 6. Key Logic Specifications

### 6.1 Price Path Generator (`utils/priceGenerator.ts`)
- Generates a random walk array of 7 values (t=0 to t=36 months, 6-month steps).
- Starts at 1.0 (100%).
- Each step: `price *= (1 + randomDrift)` where `randomDrift ~ Normal(0, 0.12)`.
- Clamp to [0.2, 1.8] to avoid unrealistic extremes.
- Seed is regenerated on each simulation start.

### 6.2 ELS Early Redemption Logic
- At each 6-month tick, check: `price >= 0.85` → trigger `redeemed` state.
- Thresholds decrease per period to reflect real ELS structure:
  - Month 6/12: 85% | Month 18/24: 80% | Month 30: 75% | Month 36: 70%

### 6.3 ETF Shock Calculation
- Single-stock shock: `-40%` (idiosyncratic risk — one company scandal).
- ETF shock: `-3.5%` (1 of 10 holdings at -40%; weighted average = -4%, with small positive drift from others = -3.5%).
- Display delta in percentage points on the GaugeBars.

---

## 7. Visual Design System

### 7.1 Color Palette

Tokens are defined in `src/styles/theme.ts` and injected via styled-components `ThemeProvider`. Access in components via `${({ theme }) => theme.colors.safeGreen}`.

| Token (`theme.colors.*`) | Hex | Usage |
|---|---|---|
| `safeGreen` | `#22c55e` | Savings, success states, safe zones |
| `cautionYellow` | `#eab308` | ETF, moderate risk indicators |
| `dangerRed` | `#ef4444` | ELS, knocked-in states, loss indicators |
| `labDark` | `#0f172a` | Background (dark lab theme) |
| `labPanel` | `#1e293b` | Card/panel backgrounds |
| `labText` | `#f1f5f9` | Primary text |

### 7.2 Key Animations
- **Price Chart**: Line draws tick-by-tick using `animationBegin` / `animationDuration` in Recharts.
- **Knock-In Breach**: Full-screen red flash overlay (Framer Motion `animate` opacity pulse).
- **ETF Gauge Bars**: Framer Motion `animate` width transition on shock trigger.
- **Stamp Unlock**: Framer Motion scale + rotation bounce on checklist completion.

### 7.3 Tooltip Convention (Educational Anchors)
All complex terms render a `?` icon that opens an inline tooltip:
- "Knock-In Barrier" → "시험 과락 기준선과 같아요. 이 선 아래로 떨어지면 원금 손실이 발생할 수 있어요."
- "Early Redemption" → "6개월마다 '합격 기준'을 통과하면 조기에 수익을 받고 종료돼요."
- "Diversification" → "여러 종목에 나눠 담으면 한 종목이 폭락해도 전체 손실이 줄어요."

---

## 8. Data Files Specification

### 8.1 `data/quizQuestions.ts` — 4 OX questions
1. "은행이 판매하는 ELS는 예적금자보호법으로 보호받는다" → **X**
2. "ELS에서 Knock-In이 발생하면 원금 손실이 확정된다" → **X** (손실 가능성이 높아질 뿐, 만기 가격에 따라 결정)
3. "ETF는 여러 종목에 분산투자하므로 단일 종목보다 변동성이 낮다" → **O**
4. "ELS 연 수익률이 10%라면 은행 예적금보다 반드시 유리하다" → **X**

### 8.2 `data/checklistItems.ts` — 5 receipt disclaimers
1. "이 상품은 원금을 보장하지 않습니다."
2. "Knock-In 발생 시 만기에 원금 손실이 발생할 수 있습니다."
3. "예적금자보호법 적용 대상이 아닙니다."
4. "중도 환매 시 손실이 발생할 수 있습니다."
5. "높은 수익률은 그만큼 높은 위험을 수반합니다."

### 8.3 `data/comparisonData.ts` — Comparison Matrix rows
Rows: 원금보장 | 수익구조 | 예적금자보호 | 위험도 | 적합 투자자  
Columns: 예적금 (green) | ETF (yellow) | ELS (red)

---

## 9. Implementation Phases

### Phase 0 — Project Scaffolding
- [ ] `npm create vite@latest finguid -- --template react-ts`
- [ ] Install dependencies: `styled-components`, `@types/styled-components`, `recharts`, `framer-motion`
- [ ] Create `src/styles/theme.ts` with ThemeProvider token definitions
- [ ] Create `src/styles/GlobalStyle.ts` with `createGlobalStyle` resets
- [ ] Wrap `App` in `ThemeProvider` + `GlobalStyle` in `main.tsx`
- [ ] Create directory structure as defined in §3
- [ ] Scaffold `App.tsx` with empty section placeholders
- [ ] Implement `Header` and `Footer` components

### Phase 1 — Static Foundation
- [ ] Implement `HeroSection` (lab theme, one-sentence definition)
- [ ] Implement `ComparisonMatrix` with static data from `comparisonData.ts`
- [ ] Verify responsive layout on mobile (375px) and desktop (1280px)

### Phase 2 — ELS Simulator (Feature A)
- [ ] Implement `priceGenerator.ts` utility
- [ ] Implement `useELSSimulation` hook with full state machine
- [ ] Implement `KnockInSlider` component
- [ ] Implement `PriceChart` with Recharts `LineChart` + animated draw
- [ ] Implement `StatusBanner` for current simulation state
- [ ] Implement `SuccessModal` and `KnockInModal`
- [ ] Add educational tooltips to all ELS-specific terms
- [ ] Integration test: run 10 simulations, verify all state transitions

### Phase 3 — ETF Simulator (Feature B)
- [ ] Implement `useETFShock` hook
- [ ] Implement `PortfolioSelector` toggle
- [ ] Implement `ShockButton` with event description
- [ ] Implement `GaugeBars` with Framer Motion animations
- [ ] Add educational tooltip for diversification concept

### Phase 4 — Quiz & Checklist (Feature D)
- [ ] Implement `Checklist` with receipt-style UI + stamp unlock animation
- [ ] Implement `OXQuiz` 4-question flow with score tracking
- [ ] Wire `stampUnlocked` derived state

### Phase 5 — Polish & QA
- [ ] Accessibility audit (keyboard navigation, ARIA labels, color contrast ≥ 4.5:1)
- [ ] Responsive polish pass
- [ ] Performance check: Lighthouse score ≥ 90
- [ ] Cross-browser test (Chrome, Safari, Firefox)
- [ ] Final copy review: all Korean text grammatically correct + pedagogically accurate
- [ ] `npm run build` clean output

---

## 10. Edge Cases & Human Review Required

> Per CLAUDE.md §3.2 Verification Hook

- **Price generator seed fairness**: Confirm the random walk doesn't produce unrealistically frequent Knock-In events (>70% of runs) which would create fatalistic bias in learners. Recommend testing 1,000 simulated runs.
- **ELS early redemption threshold accuracy**: The stepped thresholds (85/85/80/80/75/70%) are approximations of typical Korean ELS structures. A financial professional should verify these reflect real-world products before publishing.
- **Tooltip Korean text**: All simplified analogies must be reviewed by a domain educator to ensure they don't over-simplify to the point of inaccuracy.
- **Quiz answer for Q2**: The answer is X but the explanation is nuanced — Knock-In doesn't guarantee loss. The UI must make this nuance explicit to avoid students learning the wrong rule.
- **ETF shock magnitude (-3.5%)**: The exact figure is illustrative. Real 1/10 weight shock math: -40% × 10% = -4%, with slight positive buffer = -3.5%. This is clearly labeled as illustrative in the UI copy.
