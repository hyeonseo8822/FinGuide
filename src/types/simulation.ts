// ELS/ETF 시뮬레이터와 퀴즈에서 공유하는 TypeScript 인터페이스
// PLAN.md §5 기반

export type ELSStatus =
  | 'idle'
  | 'running'
  | 'knocked-in'
  | 'redeemed'
  | 'matured-loss'
  | 'matured-gain';

export interface ELSState {
  knockInBarrier: number;      // 0.50 ~ 0.70
  isRunning: boolean;
  currentMonth: number;        // 0, 6, 12, 18, 24, 30, 36
  priceHistory: number[];      // 가격 지수 배열 (1.0 = 100%)
  status: ELSStatus;
  hasKnockedIn: boolean;       // 한 번이라도 녹인 발생 여부
}

export interface ETFState {
  portfolioType: 'single' | 'etf';
  shockApplied: boolean;
  singleStockReturn: number;   // 기본 0; 충격 시 -0.40
  etfReturn: number;           // 기본 0; 충격 시 -0.035
}

export interface QuizQuestion {
  id: number;
  question: string;
  answer: 'O' | 'X';
  explanation: string;
}

export interface QuizState {
  checklistChecked: boolean[];
  allChecked: boolean;
  stampUnlocked: boolean;
  currentQuestion: number;     // 0~3
  score: number;
  quizComplete: boolean;
  selectedAnswer: ('O' | 'X' | null)[];
}
