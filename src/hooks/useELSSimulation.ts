// ELS 상태 머신 훅 (레거시 — ELSPage는 자체 상태 관리를 사용)
// 내부적으로 간단한 GBM 수치만 사용해 number[] 타입 호환성 유지
import { useState, useCallback, useRef } from 'react';
import { ELSState, ELSStatus } from '../types/simulation';

const REDEMPTION_THRESHOLDS = [0.85, 0.85, 0.80, 0.80, 0.75, 0.70];

// 간단한 로그 정규 랜덤 워크 (6단계 number[])
function simpleGBM(barrier: number): number[] {
  const path = [1.0];
  for (let i = 0; i < 6; i++) {
    const u1 = Math.random(), u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1 || 1e-10)) * Math.cos(2 * Math.PI * u2);
    const next = Math.max(0.15, Math.min(2.0, path[i] * Math.exp(-0.5 * 0.0124 + 0.113 * z)));
    path.push(parseFloat(next.toFixed(4)));
  }
  // 낮은 배리어에서 극단값 방지
  void barrier;
  return path;
}

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
    const fullPath = simpleGBM(state.knockInBarrier);
    let knocked = false;

    setState(prev => ({
      ...prev,
      isRunning: true,
      status: 'running',
      currentMonth: 0,
      priceHistory: [fullPath[0]],
      hasKnockedIn: false,
    }));

    const runTick = (tickIndex: number) => {
      if (tickIndex >= fullPath.length) return;
      timerRef.current = setTimeout(() => {
        const price = fullPath[tickIndex];
        const month = tickIndex * 6;
        let newStatus: ELSStatus = 'running';

        if (tickIndex > 0 && price < state.knockInBarrier) knocked = true;

        if (tickIndex > 0) {
          const threshold = REDEMPTION_THRESHOLDS[tickIndex - 1];
          if (!knocked && price >= threshold) {
            newStatus = 'redeemed';
          } else if (month === 36) {
            newStatus = knocked && price < 1.0 ? 'matured-loss' : 'matured-gain';
          } else if (knocked) {
            newStatus = 'knocked-in';
          }
        }

        setState(prev => ({
          ...prev,
          currentMonth: month,
          priceHistory: fullPath.slice(0, tickIndex + 1),
          hasKnockedIn: knocked,
          status: newStatus,
          isRunning: newStatus === 'running' || newStatus === 'knocked-in',
        }));

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
