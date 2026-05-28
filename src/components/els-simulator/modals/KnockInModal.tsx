import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  open: boolean;
  onClose: () => void;
}

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(186, 26, 26, 0.35);
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
  border: 2px solid ${({ theme }) => theme.colors.dangerRed};
`;

const Emoji = styled.div`
  font-size: 56px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h3`
  font-size: 22px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.dangerRed};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Body = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Btn = styled.button`
  background: ${({ theme }) => theme.colors.dangerRed};
  color: ${({ theme }) => theme.colors.onError};
  border-radius: ${({ theme }) => theme.rounded.full};
  padding: 12px 32px;
  font-size: 15px;
  font-weight: 700;
  transition: opacity 0.15s;

  &:hover { opacity: 0.85; }
`;

export default function KnockInModal({ open, onClose }: Props) {
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
            <Emoji>🚨</Emoji>
            <Title>녹인(Knock-In) 발생!</Title>
            <Body>
              기초자산 가격이 녹인 배리어 아래로 떨어졌어요.<br /><br />
              마치 시험에서 과락이 난 것처럼, 이제 만기까지 가격이 회복되지 않으면
              원금의 상당 부분을 잃게 됩니다.
              <br /><br />
              <strong>배리어를 높이면 녹인 위험이 커집니다. 낮은 배리어를 설정해 다시 시도해 보세요!</strong>
            </Body>
            <Btn onClick={onClose}>계속 보기</Btn>
          </Card>
        </Overlay>
      )}
    </AnimatePresence>
  );
}
