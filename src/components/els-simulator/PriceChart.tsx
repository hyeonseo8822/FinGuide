import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from 'styled-components';
import { Theme } from '../../styles/theme';

// ELS 가격 경로 라인 차트
// 녹인 배리어 기준선을 빨간 점선으로 표시해 위험 구간을 시각화
interface Props {
  priceHistory: number[];
  knockInBarrier: number;
  hasKnockedIn: boolean;
}

const MONTHS = [0, 6, 12, 18, 24, 30, 36];

export default function PriceChart({ priceHistory, knockInBarrier, hasKnockedIn }: Props) {
  const theme = useTheme() as Theme;

  const data = priceHistory.map((price, i) => ({
    month: MONTHS[i],
    price: parseFloat((price * 100).toFixed(2)),
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.outlineVariant} />
        <XAxis
          dataKey="month"
          tickFormatter={v => `${v}개월`}
          tick={{ fontSize: 12, fill: theme.colors.onSurfaceVariant }}
          tickLine={false}
        />
        <YAxis
          domain={[20, 150]}
          tickFormatter={v => `${v}%`}
          tick={{ fontSize: 12, fill: theme.colors.onSurfaceVariant }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(v: number) => [`${v}%`, '기초자산 가격']}
          labelFormatter={l => `${l}개월`}
          contentStyle={{
            borderRadius: theme.rounded.md,
            border: `1px solid ${theme.colors.outlineVariant}`,
            fontSize: 13,
          }}
        />
        {/* 녹인 배리어 기준선 */}
        <ReferenceLine
          y={knockInBarrier * 100}
          stroke={theme.colors.dangerRed}
          strokeDasharray="6 3"
          label={{
            value: `녹인 ${(knockInBarrier * 100).toFixed(0)}%`,
            fill: theme.colors.dangerRed,
            fontSize: 11,
            position: 'insideTopRight',
          }}
        />
        {/* 조기상환 기준선 (85%) */}
        <ReferenceLine
          y={85}
          stroke={theme.colors.safeGreen}
          strokeDasharray="4 4"
          label={{
            value: '조기상환 85%',
            fill: theme.colors.safeGreen,
            fontSize: 11,
            position: 'insideTopLeft',
          }}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke={hasKnockedIn ? theme.colors.dangerRed : theme.colors.primary}
          strokeWidth={2.5}
          dot={{ r: 5, fill: hasKnockedIn ? theme.colors.dangerRed : theme.colors.primary }}
          activeDot={{ r: 7 }}
          animationDuration={600}
          isAnimationActive
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
