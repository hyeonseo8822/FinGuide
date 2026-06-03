import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import PageLayout from '../components/layout/PageLayout';

type SectionKey = 'ELS' | 'SAVINGS';
type QuizAnswer = 'O' | 'X';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageWrap = styled.div`
  max-width: 1040px;
  margin: 0 auto;
  padding: 24px 16px 88px;
  animation: ${fadeIn} 0.35s ease;
`;

const Hero = styled.section`
  background: linear-gradient(135deg, #f8fbff 0%, #eef6ff 100%);
  border: 1px solid #d9e7fb;
  border-radius: 30px;
  padding: 24px;
  box-shadow: 0 10px 28px rgba(0, 89, 185, 0.08);
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(30px, 6vw, 46px);
  line-height: 1.15;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const HeroText = styled.p`
  margin: 14px 0 0;
  font-size: 30px;
  line-height: 1.55;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const IntroPanel = styled.div`
  margin-top: 18px;
  display: grid;
  gap: 14px;
  padding: 18px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(16, 24, 40, 0.08);
`;

const StartButton = styled.button`
  border: none;
  border-radius: 18px;
  padding: 16px 22px;
  font-size: 30px;
  font-weight: 900;
  color: white;
  background: #0059b9;
  box-shadow: 0 12px 30px rgba(0, 89, 185, 0.14);
  cursor: pointer;
`;

const QuizSection = styled.section`
  margin-top: 18px;
  animation: ${slideIn} 0.35s ease;
`;

const QuizCard = styled.div`
  display: grid;
  gap: 16px;
  padding: 26px 22px;
  border-radius: 26px;
  background: white;
  border: 1px solid rgba(16, 24, 40, 0.08);
  box-shadow: 0 18px 36px rgba(16, 24, 40, 0.08);
`;

const QuizProgress = styled.div`
  font-size: 30px;
  font-weight: 900;
  color: #0059b9;
`;

const QuizQuestion = styled.h2`
  margin: 0;
  font-size: 36px;
  line-height: 1.4;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const QuizOptionRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const QuizOptionButton = styled.button<{ $accent: string; $active: boolean }>`
  border: 2px solid ${({ $accent }) => $accent};
  border-radius: 22px;
  padding: 22px 18px;
  background: ${({ $accent, $active }) => ($active ? `${$accent}22` : `${$accent}10`)};
  color: ${({ $accent }) => $accent};
  display: grid;
  gap: 8px;
  text-align: center;
  cursor: pointer;
  box-shadow: ${({ $accent, $active }) => ($active ? `0 12px 24px ${$accent}26` : 'none')};
  transform: ${({ $active }) => ($active ? 'translateY(-2px)' : 'none')};
  outline: ${({ $accent, $active }) => ($active ? `4px solid ${$accent}33` : 'none')};
`;

const QuizOptionMark = styled.div<{ $accent: string }>`
  width: 78px;
  height: 78px;
  margin: 0 auto;
  border-radius: 999px;
  border: 4px solid ${({ $accent }) => $accent};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 900;
  color: ${({ $accent }) => $accent};
  background: white;
`;

const QuizOptionText = styled.div<{ $accent: string }>`
  font-size: 34px;
  font-weight: 900;
  color: ${({ $accent }) => $accent};
`;

// (removed unused QuizOptionSub to avoid TS6133 unused variable error)

const CTAWrap = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const CTAButton = styled.button<{ $highlight?: boolean }>`
  border: none;
  border-radius: 18px;
  padding: 16px 22px;
  font-size: 30px;
  font-weight: 900;
  color: ${({ $highlight }) => ($highlight ? '#000000' : 'white')};
  background: ${({ $highlight }) => ($highlight ? '#ffeb3b' : '#0059b9')};
  cursor: pointer;
`;

const ResultSection = styled.section`
  margin-top: 18px;
  display: grid;
  gap: 14px;
`;

const GuideCard = styled.div<{ $accent: string }>`
  background: ${({ $accent }) => `${$accent}0d`};
  border: 1px solid ${({ $accent }) => `${$accent}18`};
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 8px 18px rgba(16, 24, 40, 0.04);
  display: grid;
  gap: 12px;
  text-align: center;
`;

const GuideIcon = styled.div`
  font-size: 40px;
`;

const GuideTitle = styled.h2`
  margin: 0;
  font-size: 34px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const GuideSummary = styled.p`
  margin: 0;
  font-size: 30px;
  line-height: 1.5;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const GuideRecommendation = styled.p`
  margin: 0;
  font-size: 28px;
  line-height: 1.4;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const SECTION_GUIDES: Record<SectionKey, { icon: string; fitLabel: string; summary: string; recommendation: ReactNode }> = {
  ELS: {
    icon: '🔥',
    fitLabel: '위험 선호형 투자자',
    summary: '보통보다 높은 변동을 받아들이고, 더 큰 수익 가능성을 우선하는 편입니다.',
    recommendation: (
      <>
        <strong style={{ color: '#0059b9' }}>ELS</strong> 상품에 투자하는 것을 추천드립니다.
      </>
    ),
  },
  SAVINGS: {
    icon: '🛡️',
    fitLabel: '위험 회피형 투자자',
    summary: '원금 보존과 예측 가능한 안정성을 더 중요하게 보는 편입니다.',
    recommendation: (
      <>
        <strong style={{ color: '#904800' }}>예적금</strong>에 투자하는 것을 추천드립니다.
      </>
    ),
  },
};

const QUIZ_QUESTIONS: Array<{ question: string }> = [
  {
    question: '잘못하면 벌칙을 받지만, 성공하면 엄청난 보상이 기다리는 상자가 있습니다. 열어보시겠어요?',
  },
  {
    question: '바로 탈 수 있는 회전목마보다 좀 더 기다려서 더 재밌는 롤러코스터 타는 걸 더 좋아하나요?',
  },
  {
    question: '게임 점수가 마이너스가 되더라도 판을 뒤집으려고 끝까지 버티나요?',
  },
];

const RESULT_THRESHOLD = 2;

export default function InvestmentPreferencePage() {
  const navigate = useNavigate();
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Array<QuizAnswer | null>>(
    Array(QUIZ_QUESTIONS.length).fill(null),
  );
  const [quizResult, setQuizResult] = useState<SectionKey | null>(null);

  const startQuiz = () => {
    setQuizStarted(true);
    setQuizIndex(0);
    setQuizAnswers(Array(QUIZ_QUESTIONS.length).fill(null));
    setQuizResult(null);
  };

  const answerQuiz = (answer: QuizAnswer) => {
    if (!quizStarted || quizResult) {
      return;
    }

    const nextAnswers = [...quizAnswers];
    nextAnswers[quizIndex] = answer;
    setQuizAnswers(nextAnswers);

    if (quizIndex >= QUIZ_QUESTIONS.length - 1) {
      const oCount = nextAnswers.filter((item) => item === 'O').length;
      setQuizResult(oCount >= RESULT_THRESHOLD ? 'ELS' : 'SAVINGS');
      return;
    }

    setQuizIndex((currentIndex) => currentIndex + 1);
  };

  const goPrevious = () => {
    if (!quizStarted || quizResult || quizIndex === 0) {
      return;
    }

    setQuizIndex((currentIndex) => currentIndex - 1);
  };

  const restartQuiz = () => {
    setQuizStarted(false);
    setQuizIndex(0);
    setQuizAnswers(Array(QUIZ_QUESTIONS.length).fill(null));
    setQuizResult(null);
  };

  const currentQuizQuestion = QUIZ_QUESTIONS[quizIndex];
  const guide = quizResult ? SECTION_GUIDES[quizResult] : null;
  const quizProgressText = `${quizIndex + 1}/${QUIZ_QUESTIONS.length}`;
  const currentAnswer = quizAnswers[quizIndex];

  return (
    <PageLayout>
      <PageWrap>
        <Hero>
          <HeroTitle>나의 투자 성향 찾기</HeroTitle>
          <HeroText>O X 질문으로 나의 투자 성향을 알아보세요.</HeroText>

          {!quizStarted && !quizResult && (
            <IntroPanel>
              <StartButton onClick={startQuiz}>OX 퀴즈 시작하기</StartButton>
            </IntroPanel>
          )}

          {quizStarted && !quizResult && currentQuizQuestion && (
            <QuizSection>
              <QuizCard>
                <QuizProgress>Quiz {quizProgressText}</QuizProgress>
                <QuizQuestion>{currentQuizQuestion.question}</QuizQuestion>

                <QuizOptionRow>
                  <QuizOptionButton
                    $accent="#0059b9"
                    $active={currentAnswer === 'O'}
                    onClick={() => answerQuiz('O')}
                  >
                    <QuizOptionMark $accent="#0059b9">O</QuizOptionMark>
                    <QuizOptionText $accent="#0059b9">예</QuizOptionText>
                  </QuizOptionButton>

                  <QuizOptionButton
                    $accent="#b33e3a"
                    $active={currentAnswer === 'X'}
                    onClick={() => answerQuiz('X')}
                  >
                    <QuizOptionMark $accent="#b33e3a">X</QuizOptionMark>
                    <QuizOptionText $accent="#b33e3a">아니요</QuizOptionText>
                  </QuizOptionButton>
                </QuizOptionRow>

                <CTAWrap>
                  <CTAButton onClick={goPrevious} disabled={quizIndex === 0}>
                    이전
                  </CTAButton>
                </CTAWrap>
              </QuizCard>
            </QuizSection>
          )}

          {guide && (
            <ResultSection>
              <GuideCard $accent={quizResult === 'ELS' ? '#0059b9' : '#904800'}>
                <GuideIcon>{guide.icon}</GuideIcon>
                <GuideTitle>
                  당신은{' '}
                  <strong style={{ color: quizResult === 'ELS' ? '#0059b9' : '#904800' }}>
                    {guide.fitLabel}
                  </strong>
                  입니다!
                </GuideTitle>
                <GuideSummary>{guide.summary}</GuideSummary>
                  <GuideRecommendation>{guide.recommendation}</GuideRecommendation>
              </GuideCard>

              <CTAWrap>
                <CTAButton onClick={restartQuiz}>다시 하기</CTAButton>
                <CTAButton $highlight onClick={() => navigate('/quiz')}>복습 퀴즈하기</CTAButton>
              </CTAWrap>
            </ResultSection>
          )}
        </Hero>
      </PageWrap>
    </PageLayout>
  );
}