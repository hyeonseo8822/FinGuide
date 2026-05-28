import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  open: boolean;
  month: number;
  onClose: () => void;
}

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: ${({ theme }) => theme.spacing.containerPadding};
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.rounded.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.floating};
`;

const Emoji = styled.div`
  font-size: 56px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h3`
  font-size: 22px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.safeGreen};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Body = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Btn = styled.button`
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.onSecondary};
  border-radius: ${({ theme }) => theme.rounded.full};
  padding: 12px 32px;
  font-size: 15px;
  font-weight: 700;
  transition: opacity 0.15s;

  &:hover { opacity: 0.85; }
`;

export default function SuccessModal({ open, month, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <Card
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            onClick={e => e.stopPropagation()}
          >
            <Emoji>🎉</Emoji>
            <Title>조기 상환 성공!</Title>
            <Body>
              투자 {month}개월 만에 기초자산 가격이 상환 기준을 넘어서
              약정 수익률과 함께 원금이 돌아왔어요!
              <br /><br />
              하지만 항상 이렇게 운이 좋지는 않아요. 배리어 수준을 바꿔 다시 시도해 보세요.
            </Body>
            <Btn onClick={onClose}>다시 시뮬레이션 하기</Btn>
          </Card>
        </Overlay>
      )}
    </AnimatePresence>
  );
}
