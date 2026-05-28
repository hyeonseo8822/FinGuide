import styled from 'styled-components';

// 푸터: 데이터 출처 명시 (금융감독원, 한국거래소, 금융투자협회)
// 교육 목적 사이트의 신뢰성을 위해 공식 기관 출처를 명시
const FooterEl = styled.footer`
  background: ${({ theme }) => theme.colors.surfaceContainerHighest};
  border-top: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.containerPadding};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const Inner = styled.div`
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Title = styled.p`
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const Sources = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  line-height: 1.6;
`;

const Disclaimer = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.outline};
  line-height: 1.6;
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

export default function Footer() {
  return (
    <FooterEl>
      <Inner>
        <Title>데이터 출처</Title>
        <Sources>
          금융감독원 (FSS) &nbsp;·&nbsp; 한국거래소 (KRX) &nbsp;·&nbsp; 금융투자협회 (KOFIA)
        </Sources>
        <Disclaimer>
          본 사이트의 시뮬레이션 결과는 교육 목적의 예시로, 실제 투자 결과와 다를 수 있습니다.
          투자 전 반드시 전문가와 상담하시기 바랍니다.
        </Disclaimer>
      </Inner>
    </FooterEl>
  );
}
