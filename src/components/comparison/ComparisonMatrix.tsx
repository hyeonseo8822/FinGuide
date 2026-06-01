import styled from 'styled-components';
import { motion } from 'framer-motion';
import { comparisonData } from '../../data/comparisonData';

// 예적금 vs ETF vs ELS 비교 매트릭스
// 색상 코드로 위험도를 직관적으로 표현: 초록(안전) → 주황(주의) → 빨강(위험)

const Section = styled.section`
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.containerPadding};
  background: ${({ theme }) => theme.colors.background};
`;

const Inner = styled.div`
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: clamp(22px, 4vw, 32px);
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const SectionDesc = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  font-size: 16px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: ${({ theme }) => theme.rounded.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.white};
`;

const Th = styled.th<{ $color?: string }>`
  padding: ${({ theme }) => theme.spacing.md};
  font-size: 15px;
  font-weight: 700;
  text-align: center;
  background: ${({ $color, theme }) => $color ?? theme.colors.surfaceContainerHighest};
  color: ${({ theme }) => theme.colors.onSurface};
  border-bottom: 2px solid ${({ theme }) => theme.colors.outlineVariant};

  &:first-child {
    text-align: left;
    background: ${({ theme }) => theme.colors.surfaceContainerHighest};
  }
`;

const Td = styled.td<{ $level?: 'safe' | 'caution' | 'danger' }>`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  font-size: 15px;
  text-align: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  color: ${({ $level, theme }) =>
    $level === 'safe'
      ? theme.colors.safeGreen
      : $level === 'danger'
      ? theme.colors.dangerRed
      : theme.colors.cautionOrange};
  font-weight: ${({ $level }) => ($level ? 600 : 400)};

  &:first-child {
    text-align: left;
    color: ${({ theme }) => theme.colors.onSurface};
    font-weight: 600;
  }

  tr:last-child & {
    border-bottom: none;
  }
`;

const LegendRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

const LegendItem = styled.span<{ $color: string }>`
  font-size: 13px;
  font-weight: 600;
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '●';
  }
`;

export default function ComparisonMatrix() {
  return (
    <Section id="comparison">
      <Inner>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <SectionTitle>예적금 vs ETF vs ELS, 무엇이 다를까요?</SectionTitle>
          <SectionDesc>세 가지 금융상품의 핵심 차이를 한눈에 비교해 보세요.</SectionDesc>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>비교 항목</Th>
                  <Th $color="#e8f5e9">예적금 🟢</Th>
                  <Th $color="#fff3e0">ETF 🟡</Th>
                  <Th $color="#ffebee">ELS 🔴</Th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map(row => (
                  <tr key={row.feature}>
                    <Td>{row.feature}</Td>
                    <Td $level={row.depositLevel}>{row.deposit}</Td>
                    <Td $level={row.etfLevel}>{row.etf}</Td>
                    <Td $level={row.elsLevel}>{row.els}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
          <LegendRow>
            <LegendItem $color="#006d37">안전</LegendItem>
            <LegendItem $color="#904800">주의</LegendItem>
            <LegendItem $color="#ba1a1a">위험</LegendItem>
          </LegendRow>
        </motion.div>
      </Inner>
    </Section>
  );
}
