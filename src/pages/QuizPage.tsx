import { useState, useCallback, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import PageLayout from '../components/layout/PageLayout';
import { pickQuestions } from '../data/quizQuestions';
import type { QuizQuestion } from '../types/simulation';

// OX 퀴즈: 4문제 순서대로, 진도 바 + 피드백 오버레이
// 큰 O/X 버튼으로 학생이 직관적으로 선택할 수 있도록 설계

const pop = keyframes`
  0% { transform: scale(0.5); opacity: 0; }
  70% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
`;

const safeGlow = css`
  box-shadow: 0 0 20px rgba(74, 225, 131, 0.3);
`;

const ProgressSection = styled.div`
  width: 100%;
  max-width: 640px;
  margin: 0 auto ${({ theme }) => theme.spacing.xl};
`;

const ProgressLabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ProgressTrack = styled.div`
  height: 16px;
  width: 100%;
  background: ${({ theme }) => theme.colors.surfaceContainerHigh};
  border-radius: 9999px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $width: number }>`
  height: 100%;
  width: ${({ $width }) => $width}%;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 9999px;
  transition: width 0.7s ease-out;
  ${safeGlow}
`;

const QuestionCard = styled.div`
  width: 100%;
  max-width: 640px;
  margin: 0 auto ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.rounded.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
  text-align: center;
  position: relative;
`;

const QuestionText = styled.h1`
  font-size: clamp(20px, 3.5vw, 26px);
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
  line-height: 1.4;

  @media (min-width: 768px) {
    font-size: 32px;
  }
`;

const ButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
`;

const OXButton = styled.button<{ $type: 'O' | 'X' }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.rounded.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
  border: 2px solid transparent;
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    background: ${({ $type, theme }) => $type === 'O' ? theme.colors.secondaryContainer + '40' : theme.colors.errorContainer};
    transform: scale(1.02);
    border-color: ${({ $type, theme }) => $type === 'O' ? theme.colors.safeGreen : theme.colors.dangerRed}40;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const OXCircle = styled.div<{ $type: 'O' | 'X' }>`
  width: 128px;
  height: 128px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 100px;
  color: ${({ $type, theme }) => $type === 'O' ? theme.colors.primary : theme.colors.dangerRed};

  @media (min-width: 768px) {
    width: 160px;
    height: 160px;
    font-size: 128px;
  }
`;

const OXLabel = styled.span<{ $type: 'O' | 'X' }>`
  margin-top: ${({ theme }) => theme.spacing.sm};
  font-size: 24px;
  font-weight: 700;
  color: ${({ $type, theme }) => $type === 'O' ? theme.colors.primary : theme.colors.dangerRed};
`;

// Feedback Overlay
const OverlayBg = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(24, 28, 35, 0.4);
  backdrop-filter: blur(4px);
  display: ${({ $visible }) => ($visible ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.md};
`;

const FeedbackCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.rounded.lg};
  width: 100%;
  max-width: 380px;
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  animation: ${pop} 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.5);
  box-shadow: 0 24px 64px rgba(0,0,0,0.2);
`;

const FeedbackIconCircle = styled.div<{ $correct: boolean }>`
  width: 96px;
  height: 96px;
  margin: 0 auto ${({ theme }) => theme.spacing.md};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $correct, theme }) => $correct ? theme.colors.secondaryContainer : theme.colors.errorContainer};

  font-size: 64px;
`;

const FeedbackTitle = styled.h2<{ $correct: boolean }>`
  font-size: 24px;
  font-weight: 700;
  color: ${({ $correct, theme }) => $correct ? theme.colors.safeGreen : theme.colors.dangerRed};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const FeedbackDesc = styled.p`
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const NextBtn = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: 16px;
  font-weight: 700;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: 9999px;
  transition: transform 0.15s;

  &:hover { transform: scale(1.05); }
  &:active { transform: scale(0.95); }
`;

// Score Screen
const ScoreScreen = styled.div`
  text-align: center;
  max-width: 480px;
  margin: 0 auto;

  h2 {
    font-size: clamp(26px, 5vw, 40px);
    font-weight: 800;
    color: ${({ theme }) => theme.colors.onSurface};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  p {
    font-size: 20px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.onSurfaceVariant};
    margin-bottom: ${({ theme }) => theme.spacing.xl};
  }
`;

const ScoreBig = styled.div`
  font-size: 80px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
  margin: ${({ theme }) => theme.spacing.lg} 0;
`;

const RestartBtn = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: 18px;
  font-weight: 700;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
  border-radius: 9999px;
  transition: transform 0.15s;

  &:hover { transform: scale(1.05); }
`;

// 세션 시작 시 문제 세트 확정 (5문제), 재도전 시 새 세트 생성
const QUIZ_SIZE = 5;

export default function QuizPage() {
  // useRef로 세션 문제를 보관 — 리렌더 시 재생성 방지
  const sessionQs = useRef<QuizQuestion[]>(pickQuestions(QUIZ_SIZE));

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [done, setDone] = useState(false);

  const questions = sessionQs.current;
  const progress = (current / questions.length) * 100;

  const handleAnswer = useCallback((answer: 'O' | 'X') => {
    const correct = answer === questions[current].answer;
    if (correct) setScore(s => s + 1);
    setLastCorrect(correct);
    setShowFeedback(true);
  }, [current, questions]);

  const closeFeedback = useCallback(() => {
    setShowFeedback(false);
    if (current + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrent(c => c + 1);
    }
  }, [current, questions.length]);

  const restart = useCallback(() => {
    // 새 세트로 교체
    sessionQs.current = pickQuestions(QUIZ_SIZE);
    setCurrent(0);
    setScore(0);
    setDone(false);
    setShowFeedback(false);
  }, []);

  if (done) {
    return (
      <PageLayout>
        <ScoreScreen>
          <h2>퀴즈 완료! 🎉</h2>
          <ScoreBig>{score} / {questions.length}</ScoreBig>
          <p>
            {score === questions.length
              ? '완벽해요! 금융 전문가 등극! 🏆'
              : score >= Math.ceil(questions.length * 0.6)
              ? '훌륭해요! 조금만 더 공부하면 만점이에요!'
              : '괜찮아요, 다시 도전해봐요!'}
          </p>
          <RestartBtn onClick={restart}>다시 도전하기</RestartBtn>
        </ScoreScreen>
      </PageLayout>
    );
  }

  const q = questions[current];

  return (
    <PageLayout>
      <ProgressSection>
        <ProgressLabelRow>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#0059b9' }}>
            {current + 1} / {questions.length} 문제
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#414754' }}>
            {score}점
          </span>
        </ProgressLabelRow>
        <ProgressTrack>
          <ProgressFill $width={progress} />
        </ProgressTrack>
      </ProgressSection>

      <QuestionCard>
        <QuestionText>{q.question}</QuestionText>
      </QuestionCard>

      <ButtonsGrid>
        <OXButton $type="O" onClick={() => handleAnswer('O')}>
          <OXCircle $type="O">○</OXCircle>
          <OXLabel $type="O">맞아요!</OXLabel>
        </OXButton>

        <OXButton $type="X" onClick={() => handleAnswer('X')}>
          <OXCircle $type="X">✕</OXCircle>
          <OXLabel $type="X">틀려요!</OXLabel>
        </OXButton>
      </ButtonsGrid>

      {/* Feedback Overlay */}
      <OverlayBg $visible={showFeedback}>
        <FeedbackCard>
          <FeedbackIconCircle $correct={lastCorrect}>
            {lastCorrect ? '✅' : '❌'}
          </FeedbackIconCircle>
          <FeedbackTitle $correct={lastCorrect}>
            {lastCorrect ? '정답이에요!' : '아쉬워요!'}
          </FeedbackTitle>
          <FeedbackDesc>{q.explanation}</FeedbackDesc>
          <NextBtn onClick={closeFeedback}>
            {current + 1 >= questions.length ? '결과 보기' : '다음 문제로 가기'}
          </NextBtn>
        </FeedbackCard>
      </OverlayBg>
    </PageLayout>
  );
}
