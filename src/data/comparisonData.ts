// PLAN.md §8.3: 예적금 vs ETF vs ELS 비교 매트릭스 데이터

export interface ComparisonRow {
  feature: string;       // 비교 항목
  deposit: string;       // 예적금
  etf: string;           // ETF
  els: string;           // ELS
  depositLevel: 'safe' | 'caution' | 'danger';
  etfLevel: 'safe' | 'caution' | 'danger';
  elsLevel: 'safe' | 'caution' | 'danger';
}

export const comparisonData: ComparisonRow[] = [
  {
    feature: '원금 보장',
    deposit: '보장',
    etf: '비보장',
    els: '비보장',
    depositLevel: 'safe',
    etfLevel: 'caution',
    elsLevel: 'danger',
  },
  {
    feature: '수익 구조',
    deposit: '확정 금리',
    etf: '시장 연동',
    els: '조건부 확정',
    depositLevel: 'safe',
    etfLevel: 'caution',
    elsLevel: 'danger',
  },
  {
    feature: '예적금자 보호',
    deposit: '5천만 원 이하 보호',
    etf: '해당 없음',
    els: '해당 없음',
    depositLevel: 'safe',
    etfLevel: 'caution',
    elsLevel: 'danger',
  },
  {
    feature: '위험도',
    deposit: '매우 낮음',
    etf: '보통',
    els: '높음',
    depositLevel: 'safe',
    etfLevel: 'caution',
    elsLevel: 'danger',
  },
  {
    feature: '적합 투자자',
    deposit: '안정형',
    etf: '중립형',
    els: '위험 감수형',
    depositLevel: 'safe',
    etfLevel: 'caution',
    elsLevel: 'danger',
  },
];
