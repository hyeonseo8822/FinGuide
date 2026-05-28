// PLAN.md §8.2: 투자 전 확인 체크리스트 (5개 면책 항목)

export interface ChecklistItem {
  id: number;
  text: string;
}

export const checklistItems: ChecklistItem[] = [
  { id: 1, text: '이 상품은 원금을 보장하지 않습니다.' },
  { id: 2, text: 'Knock-In 발생 시 만기에 원금 손실이 발생할 수 있습니다.' },
  { id: 3, text: '예금자보호법 적용 대상이 아닙니다.' },
  { id: 4, text: '중도 환매 시 손실이 발생할 수 있습니다.' },
  { id: 5, text: '높은 수익률은 그만큼 높은 위험을 수반합니다.' },
];
