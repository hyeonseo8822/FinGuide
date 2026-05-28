import styled from 'styled-components';
import { motion } from 'framer-motion';

// 히어로: ELS 한 문장 정의 + 사이트 소개
// 초보자를 위한 명확하고 간결한 첫인상 제공
const Section = styled.section`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.surfaceContainerLow} 0%, ${({ theme }) => theme.colors.white} 100%);
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.containerPadding};
  text-align: center;
`;

const Inner = styled.div`
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Badge = styled.span`
  display: inline-block;
  background: ${({ theme }) => theme.colors.primaryContainer};
  color: ${({ theme }) => theme.colors.onPrimaryContainer};
  font-size: 13px;
  font-weight: 700;
  padding: 6px 16px;
  border-radius: ${({ theme }) => theme.rounded.full};
  letter-spacing: 0.04em;
`;

const Headline = styled.h1`
  font-size: clamp(28px, 5vw, 40px);
  font-weight: 800;
  color: ${({ theme }) => theme.colors.onSurface};
  line-height: 1.3;
  letter-spacing: -0.02em;
  max-width: 720px;
`;

const Highlight = styled.em`
  font-style: normal;
  color: ${({ theme }) => theme.colors.primary};
`;

const DangerHighlight = styled.em`
  font-style: normal;
  color: ${({ theme }) => theme.colors.dangerRed};
`;

const Subtitle = styled.p`
  font-size: clamp(16px, 2.5vw, 20px);
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  line-height: 1.7;
  max-width: 600px;
`;

const ScrollHint = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.outline};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

export default function HeroSection() {
  return (
    <Section id="hero">
      <Inner>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge>고등학생을 위한 금융 교육</Badge>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Headline>
            ELS는 <Highlight>조건이 맞으면</Highlight> 수익,<br />
            조건이 어긋나면 <DangerHighlight>원금 손실</DangerHighlight>이 나는<br />
            복잡한 파생금융상품입니다.
          </Headline>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Subtitle>
            예금자보호도 없고, 원금 보장도 없습니다.
            시뮬레이터로 직접 체험하고 위험을 이해해 보세요.
          </Subtitle>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <ScrollHint>↓ 아래로 스크롤해서 알아보세요</ScrollHint>
        </motion.div>
      </Inner>
    </Section>
  );
}
