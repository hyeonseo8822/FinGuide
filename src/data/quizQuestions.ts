// OX 퀴즈 문제 은행 — ELS·예적금·투자 위험 중심
// 목표: 고등학생·초등학생도 이해할 수 있는 쉬운 금융 상식
import { QuizQuestion } from '../types/simulation';

export const ALL_QUIZ_QUESTIONS: QuizQuestion[] = [

  // ── ELS 기본 이해 ─────────────────────────────────────────────

  {
    id: 1,
    question: 'ELS는 항상 원금을 돌려받을 수 있다.',
    answer: 'X',
    explanation: '아니에요! ELS는 조건이 맞지 않으면 처음 넣은 돈보다 적게 받을 수 있어요.',
  },
  {
    id: 2,
    question: 'ELS는 주가와 관련된 금융 상품이다.',
    answer: 'O',
    explanation: '맞아요! ELS의 결과는 삼성전자 같은 회사의 주가에 따라 달라져요.',
  },
  {
    id: 3,
    question: 'ELS의 수익률이 높으면 위험도도 높다.',
    answer: 'O',
    explanation: '맞아요! 수익이 높을수록 잃을 가능성도 커요. 이것이 투자의 기본 원칙이에요.',
  },
  {
    id: 4,
    question: 'ELS는 은행 예적금과 똑같은 상품이다.',
    answer: 'X',
    explanation: '아니에요! 예적금은 원금이 보장되지만 ELS는 원금 손실이 날 수 있어요. 완전히 다른 상품이에요.',
  },
  {
    id: 5,
    question: 'ELS는 주가가 크게 떨어져도 아무 문제가 없다.',
    answer: 'X',
    explanation: '아니에요! 주가가 위험선 아래로 내려가면 원금을 잃을 수 있어요.',
  },
  {
    id: 6,
    question: 'ELS는 투자 기간이 정해져 있다.',
    answer: 'O',
    explanation: '맞아요! ELS는 보통 1년에서 3년 정도의 정해진 기간이 있어요.',
  },

  // ── 예적금 기본 이해 ───────────────────────────────────────────

  {
    id: 7,
    question: '예적금은 원금을 보장받을 수 있다.',
    answer: 'O',
    explanation: '맞아요! 예적금은 넣은 돈을 그대로 돌려받고, 약속한 이자도 받을 수 있어요.',
  },
  {
    id: 8,
    question: '예적금은 주가가 폭락해도 돈을 잃지 않는다.',
    answer: 'O',
    explanation: '맞아요! 예적금은 주가와 상관없이 약속된 이자를 받아요.',
  },
  {
    id: 9,
    question: '예적금은 ELS보다 수익률이 높다.',
    answer: 'X',
    explanation: '아니에요! 예적금은 안전하지만 수익이 적어요. ELS가 조건을 충족하면 더 높은 수익을 낼 수 있어요.',
  },
  {
    id: 10,
    question: '예적금은 국가가 최대 5,000만 원까지 보호해 준다.',
    answer: 'O',
    explanation: '맞아요! 예적금자보호법으로 1인당 최대 5,000만 원까지 국가가 보장해 줘요.',
  },
  {
    id: 11,
    question: 'ELS도 예적금처럼 예적금자보호법의 보호를 받는다.',
    answer: 'X',
    explanation: '아니에요! ELS는 예적금자보호법 적용 대상이 아니에요. 잃어도 국가가 돌려주지 않아요.',
  },

  // ── ELS vs 예적금 비교 ─────────────────────────────────────────

  {
    id: 12,
    question: '안전을 원하는 사람에게는 ELS보다 예적금이 더 적합하다.',
    answer: 'O',
    explanation: '맞아요! 잃으면 안 되는 돈이라면 예적금처럼 안전한 상품을 선택하는 게 좋아요.',
  },
  {
    id: 13,
    question: '수익을 더 얻고 싶다면 ELS가 예적금보다 유리할 수 있다.',
    answer: 'O',
    explanation: '맞아요! ELS는 조건이 충족되면 예적금보다 높은 수익을 받을 수 있어요. 하지만 위험도 있다는 걸 잊지 마세요.',
  },
  {
    id: 14,
    question: '예적금은 투자 결과를 미리 알 수 있다.',
    answer: 'O',
    explanation: '맞아요! 예적금은 금리가 정해져 있어서 만기 때 얼마를 받을지 처음부터 알 수 있어요.',
  },
  {
    id: 15,
    question: 'ELS는 투자 결과를 미리 알 수 없다.',
    answer: 'O',
    explanation: '맞아요! ELS의 결과는 주가가 어떻게 움직이느냐에 따라 달라지기 때문에 미리 알 수 없어요.',
  },

  // ── ELS 위험 이해 ────────────────────────────────────────────

  {
    id: 16,
    question: '높은 수익률만 보고 ELS에 투자하는 것은 위험하다.',
    answer: 'O',
    explanation: '맞아요! 수익률이 높아 보여도 그만큼 잃을 위험도 있어요. 조건을 꼭 확인해야 해요.',
  },
  {
    id: 17,
    question: '주가가 크게 떨어지면 ELS에서 원금 손실이 날 수 있다.',
    answer: 'O',
    explanation: '맞아요! 주가가 위험선(녹인 배리어) 아래로 내려가면 넣은 돈보다 적게 받을 수 있어요.',
  },
  {
    id: 18,
    question: 'ELS에 투자하기 전에 조건을 확인하지 않아도 된다.',
    answer: 'X',
    explanation: '아니에요! ELS에 투자하기 전에는 반드시 성공 조건, 위험선, 만기 등을 꼭 확인해야 해요.',
  },
  {
    id: 19,
    question: 'ELS가 실패하면 예적금보다 더 적게 받을 수 있다.',
    answer: 'O',
    explanation: '맞아요! ELS가 실패하면 원금 손실이 발생해서 예적금이었다면 받았을 이자보다 훨씬 적게 받을 수 있어요.',
  },
  {
    id: 20,
    question: '생활비나 긴급하게 필요한 돈으로 ELS에 투자하는 것은 좋다.',
    answer: 'X',
    explanation: '아니에요! ELS는 중간에 꺼내기 어렵고 손실 위험도 있어요. 여유 자금으로만 투자하는 게 안전해요.',
  },
];

/**
 * 전체 문제 풀에서 n개를 무작위로 뽑아 반환.
 */
export function pickQuestions(n = 5): QuizQuestion[] {
  const shuffled = [...ALL_QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

export const quizQuestions = ALL_QUIZ_QUESTIONS.slice(0, 4);
