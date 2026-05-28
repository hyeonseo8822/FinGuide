import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ELSStatus } from '../../types/simulation';

// 시뮬레이션 현재 상태 배너
// 색상으로 즉각적인 위험/안전 신호를 전달
interface Props {
  status: ELSStatus;
  currentMonth: number;
  hasKnockedIn: boolean;
}

const STATUS_CONFIG: Record<ELSStatus, { bg: string; text: string; label: string; emoji: string }> = {
  idle: { bg: '#ecedf7', text: '#414754', label: '시뮬레이션 대기 중', emoji: '⏸️' },
  running: { bg: '#e8f0fe', text: '#0059b9', label: '시뮬레이션 진행 중', emoji: '📈' },
  'knocked-in': { bg: '#fff0f0', text: '#ba1a1a', label: '⚠️ 녹인 발생! 위험 구간 진입', emoji: '🚨' },
  redeemed: { bg: '#e8f5e9', text: '#006d37', label: '🎉 조기 상환 성공!', emoji: '✅' },
  'matured-loss': { bg: '#ffdad6', text: '#93000a', label: '만기 — 원금 손실 발생', emoji: '📉' },
  'matured-gain': { bg: '#e8f5e9', text: '#006d37', label: '만기 — 수익 실현!', emoji: '🎊' },
};

const Banner = styled(motion.div)<{ $bg: string; $text: string }>`
  background: ${({ $bg }) => $bg};
  color: ${({ $text }) => $text};
  border-radius: ${({ theme }) => theme.rounded.md};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const MonthTag = styled.span`
  margin-left: auto;
  font-size: 13px;
  font-weight: 600;
  opacity: 0.75;
`;

export default function StatusBanner({ status, currentMonth, hasKnockedIn }: Props) {
  const cfg = STATUS_CONFIG[status];
  return (
    <AnimatePresence mode="wait">
      <Banner
        key={status}
        $bg={cfg.bg}
        $text={cfg.text}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25 }}
      >
        <span>{cfg.emoji}</span>
        <span>{cfg.label}</span>
        {currentMonth > 0 && (
          <MonthTag>
            {currentMonth}개월차
            {hasKnockedIn && status !== 'knocked-in' ? ' (녹인 이력)' : ''}
          </MonthTag>
        )}
      </Banner>
    </AnimatePresence>
  );
}
