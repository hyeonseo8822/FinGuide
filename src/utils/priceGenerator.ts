// PLAN.md §6.1: Box-Muller 변환으로 정규분포 난수 생성
// 시작값 1.0, 6개월 단계 7개 값(t=0~36), 범위 [0.2, 1.8] 클램핑

function gaussianRandom(mean: number, std: number): number {
  // Box-Muller 변환
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + std * z;
}

export function generatePricePath(): number[] {
  const prices: number[] = [1.0];
  for (let i = 1; i <= 6; i++) {
    const prev = prices[i - 1];
    const drift = gaussianRandom(0, 0.12);
    const next = Math.max(0.2, Math.min(1.8, prev * (1 + drift)));
    prices.push(parseFloat(next.toFixed(4)));
  }
  return prices;
}
