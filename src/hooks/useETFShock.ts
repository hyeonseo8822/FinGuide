// PLAN.md §5.2, §6.3: ETF 충격 시뮬레이션 훅
// 단일 종목: -40% 충격 (기업 스캔들 등 고유 위험)
// ETF: -3.5% (10개 종목 중 1개가 -40%, 가중 평균 + 나머지 소폭 상승)
import { useState, useCallback } from 'react';
import { ETFState } from '../types/simulation';

const initialState: ETFState = {
  portfolioType: 'single',
  shockApplied: false,
  singleStockReturn: 0,
  etfReturn: 0,
};

export function useETFShock() {
  const [state, setState] = useState<ETFState>(initialState);

  const setPortfolioType = useCallback((type: 'single' | 'etf') => {
    setState(prev => ({ ...prev, portfolioType: type, shockApplied: false, singleStockReturn: 0, etfReturn: 0 }));
  }, []);

  const applyShock = useCallback(() => {
    setState(prev => ({
      ...prev,
      shockApplied: true,
      singleStockReturn: -0.40,
      etfReturn: -0.035,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return { state, setPortfolioType, applyShock, reset };
}
