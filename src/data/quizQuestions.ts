// PLAN.md §8.1: OX 퀴즈 문제 은행 (4문제)
import { QuizQuestion } from '../types/simulation';

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: '은행이 판매하는 ELS는 예금자보호법으로 보호받는다',
    answer: 'X',
    explanation:
      'ELS는 예금자보호법 적용 대상이 아닙니다. 은행에서 판매하더라도 원금 손실 가능성이 있습니다.',
  },
  {
    id: 2,
    question: 'ELS에서 Knock-In이 발생하면 원금 손실이 확정된다',
    answer: 'X',
    // 미묘한 개념: 녹인 발생 = 손실 가능성 증가, 확정은 만기 가격에 의해 결정
    explanation:
      'Knock-In이 발생하면 손실 가능성이 크게 높아지지만, 최종 손익은 만기 시 기초자산 가격에 따라 결정됩니다.',
  },
  {
    id: 3,
    question: 'ETF는 여러 종목에 분산투자하므로 단일 종목보다 변동성이 낮다',
    answer: 'O',
    explanation:
      'ETF는 다수 종목을 담기 때문에 한 종목이 폭락해도 전체 손실이 분산됩니다.',
  },
  {
    id: 4,
    question: 'ELS 연 수익률이 10%라면 은행 예금보다 반드시 유리하다',
    answer: 'X',
    explanation:
      '높은 수익률은 그만큼 높은 위험을 수반합니다. 녹인 발생 시 원금의 상당 부분을 잃을 수 있습니다.',
  },
];
