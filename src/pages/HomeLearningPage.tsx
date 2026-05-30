import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import PageLayout from '../components/layout/PageLayout';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageWrap = styled.div`
  max-width: 1020px;
  margin: 0 auto;
  padding: 24px 16px 84px;
  animation: ${fadeIn} 0.35s ease;
`;


const StorySection = styled.section`
  background: white;
  border-radius: 30px;
  padding: 22px;
  border: 1px solid ${({ theme }) => theme.colors.surfaceContainer};
  box-shadow: 0 12px 30px rgba(16, 24, 40, 0.06);
  margin-bottom: 18px;
`;

const StoryHead = styled.div`
  margin-bottom: 18px;
`;

const StoryTag = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 9999px;
  background: #eef9f4;
  color: #00703c;
  font-size: 13px;
  font-weight: 900;
  margin-bottom: 10px;
`;


const StoryLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
`;

const QuoteColumn = styled.div`
  display: grid;
  gap: 12px;
`;

const QuoteBubble = styled.div<{ $tone: 'teacher' | 'student' | 'reward' }>`
  background: ${({ $tone }) =>
    $tone === 'teacher' ? '#f3f7ff' : $tone === 'student' ? '#f3fbf7' : '#fff8e8'};
  border: 1px solid ${({ $tone }) =>
    $tone === 'teacher' ? '#d7e3fb' : $tone === 'student' ? '#d6efe1' : '#f5deb0'};
  border-radius: 22px;
  padding: 16px 18px;
  box-shadow: 0 8px 20px rgba(16, 24, 40, 0.04);
`;

const QuoteLabel = styled.p`
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const QuoteText = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const IllustrationBoard = styled.div`
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
  border-radius: 26px;
  border: 1px solid #dbe6f7;
  padding: 16px;
`;

const IllustrationGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
`;

const IllustrationBox = styled.div<{ $accent: string }>`
  min-height: 360px;
  border-radius: 20px;
  border: 1.5px dashed ${({ $accent }) => $accent};
  background: ${({ $accent }) => `${$accent}10`};
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
`;


const InfoSection = styled.section`
  margin-top: 18px;
`;

const InfoHeader = styled.div`
  margin-bottom: 14px;
`;

const InfoTitle = styled.h2`
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.onSurface};
`;



const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const InfoCard = styled.div`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.surfaceContainer};
  border-radius: 22px;
  padding: 18px;
  box-shadow: 0 8px 18px rgba(16, 24, 40, 0.04);
`;

const InfoCardTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const InfoCardDesc = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const CTAWrap = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 12px;
`;

const CTAButton = styled.button`
  border: none;
  border-radius: 16px;
  padding: 16px 22px;
  font-size: 16px;
  font-weight: 900;
  color: white;
  background: linear-gradient(135deg, #0059b9 0%, #006d37 100%);
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(0, 89, 185, 0.2);
  transition: transform 0.12s ease, filter 0.12s ease;

  &:hover {
    filter: brightness(1.04);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const PrevButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.surfaceContainer};
  background: white;
  color: ${({ theme }) => theme.colors.onSurface};
  border-radius: 16px;
  padding: 14px 18px;
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(16,24,40,0.04);
  transition: transform 0.12s ease, filter 0.12s ease;

  &:hover { filter: brightness(0.98); }
  &:active { transform: scale(0.98); }
`;

export default function HomeLearningPage() {
  const navigate = useNavigate();
  const [storyIndex, setStoryIndex] = useState(0);

  const STORIES = [
    { src: '/img/story1.png', alt: '선생님이 상자를 건네는 장면', text: '선생님이 6개월 또는 1년 뒤 상자 상태에 따라 보상을 주겠다고 했어요.', accent: '#0059b9' },
    { src: '/img/story2.png', alt: '학생이 상자를 지키는 장면', text: '학생은 상자를 잘 보관하고 약속을 지키려 애썼어요.', accent: '#006d37' },
    { src: '/img/story3.png', alt: '선생님이 점검하는 장면', text: '몇 달 뒤 선생님이 상자를 확인해 조건을 체크했어요.', accent: '#904800' },
    { src: '/img/story4.png', alt: '보상 장면', text: '조건이 지켜져서 학생은 기쁜 마음으로 보상을 받았어요.', accent: '#f59f00' },
  ];

  return (
    <PageLayout>
      <PageWrap>
        <StorySection>
          <StoryHead>
            <StoryTag>ELS 애니메이션</StoryTag>
          </StoryHead>

          <StoryLayout>
            <IllustrationBoard>
              <IllustrationGrid>
                <IllustrationBox $accent={STORIES[storyIndex].accent}>
                  <img src={STORIES[storyIndex].src} alt={STORIES[storyIndex].alt} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                </IllustrationBox>
              </IllustrationGrid>
            </IllustrationBoard>

            <QuoteColumn>
              <QuoteBubble $tone="teacher">
                <QuoteLabel>장면 설명</QuoteLabel>
                <QuoteText>{STORIES[storyIndex].text}</QuoteText>
              </QuoteBubble>

                <CTAWrap>
                  {storyIndex > 0 && (
                    <PrevButton onClick={() => setStoryIndex(storyIndex - 1)}>
                      이전
                    </PrevButton>
                  )}

                  {storyIndex < STORIES.length - 1 && (
                    <CTAButton onClick={() => setStoryIndex(storyIndex + 1)}>
                      다음
                    </CTAButton>
                  )}
                </CTAWrap>
            </QuoteColumn>
          </StoryLayout>
        </StorySection>

        <InfoSection id="concepts">
          <InfoHeader>
            <InfoTitle>기초 개념을 한 줄로 정리해요</InfoTitle>
          </InfoHeader>
          <CardGrid>
            <InfoCard>
              <InfoCardTitle>🎲 ELS란?</InfoCardTitle>
              <InfoCardDesc>정해진 조건을 만족하면 수익을 받을 수 있는 금융상품이에요.</InfoCardDesc>
            </InfoCard>

            <InfoCard>
              <InfoCardTitle>💰 수익은 어떻게?</InfoCardTitle>
              <InfoCardDesc>조건을 통과하면 약속된 수익을 지급해요.</InfoCardDesc>
            </InfoCard>

            <InfoCard>
              <InfoCardTitle>⏰ 조기상환</InfoCardTitle>
              <InfoCardDesc>조건을 빨리 만족하면 만기 전에 수익을 받을 수 있어요.</InfoCardDesc>
            </InfoCard>

            <InfoCard>
              <InfoCardTitle>⚠️ 손실은 언제?</InfoCardTitle>
              <InfoCardDesc>조건을 크게 벗어나면 원금 손실이 발생할 수 있어요.</InfoCardDesc>
            </InfoCard>
          </CardGrid>
        </InfoSection>

        <CTAWrap>
          <CTAButton onClick={() => navigate('/els')}>ELS 실험 시작하기</CTAButton>
        </CTAWrap>
      </PageWrap>
    </PageLayout>
  );
}
