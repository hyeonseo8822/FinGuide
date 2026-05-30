import { useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import PageLayout from '../components/layout/PageLayout';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

const popIn = keyframes`
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const coinPulse = keyframes`
  0% { transform: scale(1); }
  40% { transform: scale(1.08); }
  100% { transform: scale(1); }
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
  margin-bottom: 18px;
`;


const HeroTitle = styled.h1`
  margin: 0 0 10px;
  font-size: clamp(28px, 6vw, 44px);
  line-height: 1.15;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const WalletBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.surfaceContainer};
  border-radius: 24px;
  padding: 16px 18px;
  margin-bottom: 18px;
  box-shadow: 0 8px 18px rgba(16, 24, 40, 0.04);

  @media (max-width: 720px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const WalletInfo = styled.div`
  display: grid;
  gap: 4px;
`;

const WalletLabel = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const WalletAmount = styled.div<{ $animate: boolean }>`
  font-size: 26px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.primary};
  font-variant-numeric: tabular-nums;
  ${({ $animate }) => $animate && css`animation: ${coinPulse} 0.45s ease;`}
`;

const StartButton = styled.button`
  border: none;
  border-radius: 16px;
  padding: 15px 20px;
  font-size: 15px;
  font-weight: 900;
  color: white;
  background: linear-gradient(135deg, #0059b9 0%, #006d37 100%);
  box-shadow: 0 12px 30px rgba(0, 89, 185, 0.18);
  cursor: pointer;
  transition: transform 0.12s ease, filter 0.12s ease;

  &:hover {
    filter: brightness(1.04);
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    filter: none;
  }
`;

const Board = styled.section`
  display: grid;
  gap: 16px;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const SectionCard = styled.button<{
    $accent: string;
    $selected: boolean;
    $dimmed: boolean;
}>`
  text-align: left;
  background: white;
  border: 2px solid ${({ $accent, $selected }) => $selected ? $accent : 'transparent'};
  border-radius: 26px;
  padding: 18px;
  box-shadow: ${({ $selected, $accent }) =>
        $selected ? `0 12px 28px ${$accent}22` : '0 8px 18px rgba(16, 24, 40, 0.04)'};
  opacity: ${({ $dimmed }) => $dimmed ? 0.42 : 1};
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease, border-color 0.12s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const SectionBody = styled.div`
  display: grid;
  gap: 10px;
`;

const ProbLabel = styled.div`
  font-size: 12px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  margin-bottom: 4px;
`;

const RewardsRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;



const ProbabilityText = styled.div`
  margin: 0 0 10px;
  font-size: 34px;
  font-weight: 900;
  line-height: 1;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const RewardText = styled.div<{ $accent: string }>`
  margin: 0;
  font-size: 18px;
  font-weight: 900;
  color: ${({ $accent }) => $accent};
`;

const LossText = styled.div`
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const StageCard = styled.section`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.surfaceContainer};
  border-radius: 28px;
  padding: 20px;
  box-shadow: 0 8px 18px rgba(16, 24, 40, 0.04);
`;

const StageTitle = styled.h2`
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.onSurface};
`;



const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const FlipScene = styled.div`
  perspective: 900px;
  height: 132px;
`;

const FlipInner = styled.div<{ $flipped: boolean }>`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${({ $flipped }) => $flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};
`;

const CardFace = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 22px;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  font-weight: 900;
`;

const CardBack = styled(CardFace) <{ $accent: string; $selectable: boolean }>`
  background: ${({ $accent }) => $accent};
  color: rgba(255,255,255,0.86);
  font-size: 32px;
  box-shadow: 0 8px 18px ${({ $accent }) => `${$accent}40`};
  cursor: ${({ $selectable }) => $selectable ? 'pointer' : 'default'};
`;

const CardFront = styled(CardFace) <{ $result: 'O' | 'X' }>`
  background: white;
  border: 2px solid ${({ $result }) => $result === 'O' ? '#006d37' : '#ba1a1a'};
  color: ${({ $result }) => $result === 'O' ? '#006d37' : '#ba1a1a'};
  font-size: 30px;
  transform: rotateY(180deg);
  box-shadow: 0 8px 18px rgba(16, 24, 40, 0.05);
`;

const ResultWrap = styled.div`
  animation: ${popIn} 0.35s ease;
`;

const ResultCard = styled.div<{ $accent: string }>`
  background: white;
  border: 2px solid ${({ $accent }) => $accent};
  border-radius: 28px;
  padding: 22px;
  box-shadow: 0 14px 34px ${({ $accent }) => `${$accent}20`};
`;



const ResultReward = styled.div<{ $positive: boolean }>`
  margin: 14px 0 12px;
  font-size: 24px;
  font-weight: 900;
  color: ${({ $positive }) => $positive ? '#006d37' : '#ba1a1a'};
`;



const ResultCenter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  padding: 14px 8px;
`;

const ResultLargeTitle = styled.h3`
  margin: 0;
  font-size: 26px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const ResultSummary = styled.p`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const RecommendBlock = styled.div<{ $accent: string }>`
  margin-top: 8px;
  padding: 14px 16px;
  border-radius: 14px;
  background: ${({ $accent }) => `${$accent}12`};
  border: 1px solid ${({ $accent }) => `${$accent}22`};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 160px;
`;

const RecommendTitle = styled.div`
  font-size: 13px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const RecommendName = styled.div`
  font-size: 18px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const RecommendNote = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const GuideSection = styled.section`
  margin-top: 18px;
  display: grid;
  gap: 14px;
`;

const GuideGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const GuideCard = styled.div<{ $accent: string }>`
  background: ${({ $accent }) => `${$accent}0d`};
  border: 1px solid ${({ $accent }) => `${$accent}18`};
  border-radius: 22px;
  padding: 18px;
  box-shadow: 0 6px 14px rgba(16, 24, 40, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const GuideIcon = styled.div`
  font-size: 32px;
  margin-bottom: 10px;
`;

const GuideCardTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const GuideLines = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
`;

const GuideLine = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const CTAWrap = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
`;

const CTAButton = styled.button`
  border: none;
  border-radius: 16px;
  padding: 16px 22px;
  font-size: 16px;
  font-weight: 900;
  color: white;
  background: linear-gradient(135deg, #0059b9 0%, #006d37 100%);
  box-shadow: 0 12px 30px rgba(0, 89, 185, 0.18);
  cursor: pointer;
  transition: transform 0.12s ease, filter 0.12s ease;

  &:hover {
    filter: brightness(1.04);
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    filter: none;
  }
`;

type SectionKey = 'ELS' | 'ETF' | 'SAVINGS';
type Phase = 'idle' | 'selectSection' | 'selectCard' | 'result';

interface SectionDef {
    key: SectionKey;
    name: string;
    shortLabel: string;
    emoji: string;
    accent: string;
    rewardAmount: number;
    lossPenalty: number;
    cards: ('O' | 'X')[];
}

const SECTION_GUIDES: Record<SectionKey, { typeLabel: string; fitLabel: string; icon: string; summary: string; lines: string[] }> = {
    ELS: {
        typeLabel: '위험 선호형 투자자',
        fitLabel: 'ELS에 적합합니다',
        icon: '🔥',
        summary: '큰 보상을 위해 위험을 감수하는 성향이에요.',
        lines: ['위험 높음', '수익 높음'],
    },
    ETF: {
        typeLabel: '위험 중립형 투자자',
        fitLabel: 'ETF에 적합합니다',
        icon: '⚖️',
        summary: '위험과 보상을 골고루 보는 편이에요.',
        lines: ['위험 보통', '수익 보통'],
    },
    SAVINGS: {
        typeLabel: '위험 회피형 투자자',
        fitLabel: '예금에 적합합니다',
        icon: '🛡️',
        summary: '안전하게 자산을 지키는 성향이에요.',
        lines: ['위험 낮음', '수익 낮음'],
    },
};

const PRODUCT_DESCS: Record<SectionKey, string> = {
    ELS: '높은 수익을 노리지만 원금 손실 가능성이 있어요.',
    ETF: '여러 자산에 분산 투자해 위험을 낮춰요.',
    SAVINGS: '원금 보존 중심의 안전한 예금 상품이에요.',
};

interface GameSection {
    def: SectionDef;
    cardOrder: ('O' | 'X')[];
}

function shuffle<T>(items: T[]): T[] {
    const next = [...items];
    for (let index = next.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
    }
    return next;
}

const SECTION_DEFS: SectionDef[] = [
    {
        key: 'ELS',
        name: 'ELS',
        shortLabel: 'ELS',
        emoji: '🔥',
        accent: '#0059b9',
        rewardAmount: 3000,
        lossPenalty: 1000,
        cards: ['O', 'X', 'X'],
    },
    {
        key: 'ETF',
        name: 'ETF',
        shortLabel: 'ETF',
        emoji: '⚖️',
        accent: '#006d37',
        rewardAmount: 1000,
        lossPenalty: 500,
        cards: ['O', 'O', 'X'],
    },
    {
        key: 'SAVINGS',
        name: '예금',
        shortLabel: 'S',
        emoji: '🛡️',
        accent: '#904800',
        rewardAmount: 300,
        lossPenalty: 0,
        cards: ['O', 'O', 'O'],
    },
];

export default function HomePage() {
    const [balance, setBalance] = useState(20000);
    const [walletAnim, setWalletAnim] = useState(false);
    const [phase, setPhase] = useState<Phase>('idle');
    const [gameSections, setGameSections] = useState<GameSection[]>([]);
    const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null);
    const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
    const [rewardDelta, setRewardDelta] = useState(0);

    const animateWallet = () => {
        setWalletAnim(false);
        requestAnimationFrame(() => setWalletAnim(true));
    };

    const startGame = () => {
        animateWallet();
        setGameSections(
            shuffle(SECTION_DEFS).map((definition) => ({
                def: definition,
                cardOrder: shuffle([...definition.cards]),
            })),
        );
        setSelectedSectionIndex(null);
        setSelectedCardIndex(null);
        setRewardDelta(0);
        setPhase('selectSection');
    };

    const selectSection = (index: number) => {
        if (phase !== 'selectSection') {
            return;
        }

        setSelectedSectionIndex(index);
        setSelectedCardIndex(null);
        setRewardDelta(0);
        setPhase('selectCard');
    };

    const chooseCard = (index: number) => {
        if (phase !== 'selectCard' || selectedSectionIndex === null || selectedCardIndex !== null) {
            return;
        }

        setSelectedCardIndex(index);
        const section = gameSections[selectedSectionIndex];
        const result = section.cardOrder[index];

        window.setTimeout(() => {
            const nextReward = result === 'O' ? section.def.rewardAmount : -section.def.lossPenalty;
            setRewardDelta(nextReward);
            setBalance((currentBalance) => currentBalance + nextReward);
            animateWallet();
            setPhase('result');
        }, 650);
    };

    const selectedSection = selectedSectionIndex !== null ? gameSections[selectedSectionIndex] : null;
    const visibleSections: GameSection[] | { def: SectionDef; cardOrder: ('O' | 'X')[] }[] =
        phase === 'idle' ? SECTION_DEFS.map((d) => ({ def: d, cardOrder: d.cards })) : gameSections;

    return (
        <PageLayout>
            <PageWrap>
                <Hero>
                    <HeroTitle>나의 투자 성향 찾기</HeroTitle>

                </Hero>

                <WalletBar>
                    <WalletInfo>
                        <WalletLabel>현재 코인</WalletLabel>
                        <WalletAmount $animate={walletAnim}>🪙 {balance.toLocaleString()}</WalletAmount>
                    </WalletInfo>

                    {(phase === 'idle' || phase === 'result') && (
                        <StartButton onClick={startGame}>
                            {phase === 'idle' ? '바로 시작하기' : '다시 도전하기'}
                        </StartButton>
                    )}

                </WalletBar>

                {phase !== 'idle' && (
                    <Board>
                        <SectionGrid>
                            {visibleSections.map((section, index) => {
                                const isSelected = selectedSectionIndex === index;
                                const isDimmed = selectedSectionIndex !== null && !isSelected;
                                const winCount = section.def.cards.filter((card) => card === 'O').length;
                                const clickable = phase === 'selectCard' || phase === 'selectSection';

                                return (
                                    <SectionCard
                                        key={section.def.key}
                                        type="button"
                                        $accent={section.def.accent}
                                        $selected={isSelected}
                                        $dimmed={isDimmed}
                                        onClick={() => (clickable ? selectSection(index) : undefined)}
                                        aria-disabled={!clickable}
                                    >
                                        <SectionBody>
                                            <ProbLabel>당첨 확률</ProbLabel>
                                            <ProbabilityText>{Math.round((winCount / 3) * 100)}%</ProbabilityText>
                                            <RewardsRow>
                                                <RewardText $accent={section.def.accent}>+{section.def.rewardAmount.toLocaleString()} 🪙</RewardText>
                                                <LossText>{section.def.lossPenalty > 0 ? `- ${section.def.lossPenalty.toLocaleString()} 🪙` : 'X 없음'}</LossText>
                                            </RewardsRow>
                                        </SectionBody>
                                    </SectionCard>
                                );
                            })}
                        </SectionGrid>

                        {selectedSectionIndex !== null && gameSections[selectedSectionIndex] && (
                            <StageCard>
                                <StageTitle>카드를 한 장 골라요</StageTitle>

                                <CardGrid>
                                    {gameSections[selectedSectionIndex].cardOrder.map((result, cardIndex) => {
                                        const isFlipped = selectedCardIndex === cardIndex;
                                        const canSelect = phase === 'selectCard' && selectedCardIndex === null;

                                        return (
                                            <FlipScene key={cardIndex}>
                                                <FlipInner $flipped={isFlipped}>
                                                    <CardBack $accent={gameSections[selectedSectionIndex].def.accent} $selectable={canSelect} onClick={() => chooseCard(cardIndex)}>
                                                        ?
                                                    </CardBack>
                                                    <CardFront $result={result}>{result}</CardFront>
                                                </FlipInner>
                                            </FlipScene>
                                        );
                                    })}
                                </CardGrid>
                            </StageCard>
                        )}
                        {phase === 'result' && selectedSectionIndex !== null && gameSections[selectedSectionIndex] && (
                            <ResultWrap>
                                <ResultCard $accent={gameSections[selectedSectionIndex].def.accent}>
                                    <ResultCenter>
                                        <div style={{ fontSize: 48 }}>{SECTION_GUIDES[selectedSection!.def.key].icon}</div>
                                        <ResultLargeTitle>{SECTION_GUIDES[selectedSection!.def.key].typeLabel}</ResultLargeTitle>
                                        <ResultSummary>{SECTION_GUIDES[selectedSection!.def.key].summary}</ResultSummary>

                                        <ResultReward $positive={rewardDelta >= 0}>
                                            {rewardDelta > 0 ? `+${rewardDelta.toLocaleString()}` : `${rewardDelta < 0 ? `${rewardDelta}` : '0'}`} 코인 {rewardDelta > 0 ? '보상 획득' : '손실 발생'}
                                        </ResultReward>

                                        <RecommendBlock $accent={selectedSection!.def.accent}>
                                            <div style={{ fontSize: 36 }}>{selectedSection!.def.emoji}</div>
                                            <RecommendTitle>추천 상품</RecommendTitle>
                                            <RecommendName>{selectedSection!.def.name}</RecommendName>
                                            <RecommendNote>{PRODUCT_DESCS[selectedSection!.def.key]}</RecommendNote>
                                        </RecommendBlock>

                                        <CTAWrap>
                                            <CTAButton onClick={startGame}>다시 하기</CTAButton>
                                        </CTAWrap>
                                    </ResultCenter>
                                </ResultCard>
                            </ResultWrap>
                        )}
                    </Board>
                )}
                <GuideSection>
                    <GuideGrid>
                        <GuideCard $accent={SECTION_DEFS.find((d) => d.key === 'ELS')!.accent}>
                            <GuideIcon>{SECTION_GUIDES.ELS.icon}</GuideIcon>
                            <GuideCardTitle>ELS</GuideCardTitle>
                            <GuideLines>
                                {SECTION_GUIDES.ELS.lines.map((line) => (
                                    <GuideLine key={line}>{line}</GuideLine>
                                ))}
                            </GuideLines>
                        </GuideCard>

                        <GuideCard $accent={SECTION_DEFS.find((d) => d.key === 'ETF')!.accent}>
                            <GuideIcon>{SECTION_GUIDES.ETF.icon}</GuideIcon>
                            <GuideCardTitle>ETF</GuideCardTitle>
                            <GuideLines>
                                {SECTION_GUIDES.ETF.lines.map((line) => (
                                    <GuideLine key={line}>{line}</GuideLine>
                                ))}
                            </GuideLines>
                        </GuideCard>

                        <GuideCard $accent={SECTION_DEFS.find((d) => d.key === 'SAVINGS')!.accent}>
                            <GuideIcon>{SECTION_GUIDES.SAVINGS.icon}</GuideIcon>
                            <GuideCardTitle>예금</GuideCardTitle>
                            <GuideLines>
                                {SECTION_GUIDES.SAVINGS.lines.map((line) => (
                                    <GuideLine key={line}>{line}</GuideLine>
                                ))}
                            </GuideLines>
                        </GuideCard>
                    </GuideGrid>
                </GuideSection>
            </PageWrap>
        </PageLayout>
    );
}
