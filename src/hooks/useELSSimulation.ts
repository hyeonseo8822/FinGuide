// PLAN.md §5.1, §6.2: ELS 시뮬레이터 상태 머신
// idle → running → (knocked-in | redeemed | matured-*) → idle
import { useState, useCallback, useRef } from 'react';
import { ELSState, ELSStatus } from '../types/simulation';
import { generatePricePath } from '../utils/priceGenerator';

// 각 평가월(6,12,18,24,30,36)의 조기상환 기준 가격 (%)
// 실제 한국 ELS 구조를 단순화한 근사치
const REDEMPTION_THRESHOLDS = [0.85, 0.85, 0.80, 0.80, 0.75, 0.70];

const initialState: ELSState = {
  knockInBarrier: 0.60,
  isRunning: false,
  currentMonth: 0,
  priceHistory: [1.0],
  status: 'idle',
  hasKnockedIn: false,
};

export function useELSSimulation() {
  const [state, setState] = useState<ELSState>(initialState);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startSimulation = useCallback(() => {
    const fullPath = generatePricePath();

    setState(prev => ({
      ...prev,
      isRunning: true,
      status: 'running',
      currentMonth: 0,
      priceHistory: [fullPath[0]],
      hasKnockedIn: false,
    }));

    // 6개월 단계별 순차 공개 (교육적 긴장감)
    let hasKnockedIn = false;

    const runTick = (tickIndex: number) => {
      if (tickIndex >= fullPath.length) return;

      timerRef.current = setTimeout(() => {
        const price = fullPath[tickIndex];
        const periodIndex = tickIndex - 1; // 0~5 (6,12,18,24,30,36개월)
        const month = tickIndex * 6;

        let newStatus: ELSStatus = 'running';

        // 녹인 체크: 현재까지 경로상 최저값이 배리어 아래인지 확인
        if (price < 0) {
          /* never, but guard */
        }
        if (tickIndex > 0) {
          // 해당 틱에서 가격이 배리어 아래
          if (price < 0) {
            /* guard */
          }
        }

        // 실시간으로 현재 가격이 배리어 아래면 녹인 마킹
        if (tickIndex > 0 && price < state.knockInBarrier) {
          hasKnockedIn = true;
        }

        if (tickIndex > 0) {
          const threshold = REDEMPTION_THRESHOLDS[periodIndex];
          if (!hasKnockedIn && price >= threshold) {
            // 조기상환 조건 충족
            newStatus = 'redeemed';
          } else if (month === 36) {
            // 만기
            if (hasKnockedIn && price < 1.0) {
              newStatus = 'matured-loss';
            } else {
              newStatus = 'matured-gain';
            }
          } else if (hasKnockedIn) {
            newStatus = 'knocked-in';
          }
        }

        setState(prev => ({
          ...prev,
          currentMonth: month,
          priceHistory: fullPath.slice(0, tickIndex + 1),
          hasKnockedIn,
          status: newStatus,
          isRunning: newStatus === 'running' || newStatus === 'knocked-in',
        }));

        // 터미널 상태가 아니면 다음 틱 진행
        if (newStatus === 'running' || (newStatus === 'knocked-in' && month < 36)) {
          runTick(tickIndex + 1);
        } else {
          setState(prev => ({ ...prev, isRunning: false }));
        }
      }, 900);
    };

    runTick(1);
  }, [state.knockInBarrier]);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setState(prev => ({ ...initialState, knockInBarrier: prev.knockInBarrier }));
  }, []);

  const setKnockInBarrier = useCallback((barrier: number) => {
    setState(prev => ({ ...prev, knockInBarrier: barrier }));
  }, []);

  return { state, startSimulation, reset, setKnockInBarrier };
}
