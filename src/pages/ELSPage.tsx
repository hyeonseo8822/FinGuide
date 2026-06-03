import { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';

// ELS 체험 페이지 — 8화면 스토리 게임 (큰 UI, 가로 레이아웃, 전체 주가 즉시 공개)
// 화면 0: ELS vs 예적금 비교  화면 1: 상품 정보
// 화면 2: ELS 조건 확인     화면 3: 나의 선택
// 화면 4: 삼성전자 주가 전체 공개  화면 5: 결과
// 화면 6: 위험 경고          화면 7: 교훈 + 출처

// ─── 데이터 ───────────────────────────────────────────────────

const PRINCIPAL     = 10_000_000;
const SAVINGS_RATE  = 0.035;
const SAMSUNG_START = 53_400;
const SAMSUNG_MID   = 71_400;
const SAMSUNG_END   = 119_900;
const KNOCK_IN      = 26_700;   // 시작가 × 50%
const EARLY_COND    = 45_390;   // 시작가 × 85%

const SAVINGS_GAIN  = Math.round(PRINCIPAL * SAVINGS_RATE);        // 350,000
const SAVINGS_TOTAL = PRINCIPAL + SAVINGS_GAIN;                    // 10,350,000
const ELS_GAIN      = Math.round(PRINCIPAL * 0.08 * 0.5);          // 400,000
const ELS_TOTAL     = PRINCIPAL + ELS_GAIN;                        // 10,400,000

function krw(n: number) { return n.toLocaleString('ko-KR') + '원'; }

type Choice = 'savings' | 'els';
type Screen = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

// ─── 애니메이션 ───────────────────────────────────────────────

const fadeSlide = keyframes`
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const popIn = keyframes`
  0%   { transform: scale(0.84); opacity: 0; }
  65%  { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1);    opacity: 1; }
`;

const pulseRed = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(186,26,26,0.25); }
  50%       { box-shadow: 0 0 0 16px rgba(186,26,26,0); }
`;

// ─── 공통 레이아웃 ────────────────────────────────────────────

const PageWrap = styled.div`
  max-width: 1040px;
  margin: 0 auto;
  padding: 32px 20px 120px;
`;

const ScreenWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: ${fadeSlide} 0.38s cubic-bezier(0.22, 1, 0.36, 1);
`;

const Dots = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 28px;
`;

const Dot = styled.div<{ $active: boolean; $done: boolean }>`
  width: 14px; height: 14px;
  border-radius: 50%;
  background: ${({ $active, $done }) =>
    $done ? '#006d37' : $active ? '#0059b9' : '#d0d4e8'};
  transition: background 0.3s;
`;

const BackBtn = styled.button`
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 30px; font-weight: 800;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  background: none; border: none; cursor: pointer; padding: 0; margin-bottom: 2px;
  &:hover { color: ${({ theme }) => theme.colors.onSurface}; }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 28px;
  padding: 36px 28px;
  border: 1.5px solid ${({ theme }) => theme.colors.surfaceContainer};
  box-shadow: 0 10px 32px rgba(0,0,0,0.08);
`;

const PrimaryBtn = styled.button<{ $bg?: string }>`
  width: 100%;
  background: ${({ $bg }) => $bg ?? '#0059b9'};
  color: white;
  border-radius: 20px;
  padding: 20px 22px;
  font-size: 30px;
  font-weight: 900;
  border: none; cursor: pointer;
  transition: filter 0.15s, transform 0.12s;
  &:hover  { filter: brightness(1.06); }
  &:active { transform: scale(0.98); }
`;

const GhostBtn = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.colors.surfaceContainerHigh};
  color: ${({ theme }) => theme.colors.onSurface};
  border-radius: 18px; padding: 16px;
  font-size: 30px; font-weight: 700;
  border: none; cursor: pointer;
  transition: background 0.15s;
  &:hover { background: ${({ theme }) => theme.colors.surfaceContainerHighest}; }
`;

const BigEmoji = styled.div`font-size: 96px; text-align: center; line-height: 1;`;

const ScreenTitle = styled.h2`
  font-size: clamp(30px, 6vw, 48px);
  font-weight: 900;
  color: ${({ theme }) => theme.colors.onSurface};
  text-align: center; line-height: 1.2; margin: 0;
`;

const ScreenSub = styled.p`
  font-size: 30px; font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  text-align: center; line-height: 1.6; word-break: keep-all; margin: 0;
`;

// 강조 숫자
const BigNum = styled.span<{ $color?: string }>`
  font-size: clamp(40px, 8vw, 64px);
  font-weight: 900;
  color: ${({ $color }) => $color ?? '#181c23'};
  font-variant-numeric: tabular-nums;
  line-height: 1.05;
  display: block;
`;

// 중간 숫자 (결과 카드용)
const MidNum = styled.span<{ $color?: string }>`
  font-size: clamp(30px, 6vw, 40px);
  font-weight: 900;
  color: ${({ $color }) => $color ?? '#181c23'};
  font-variant-numeric: tabular-nums;
  line-height: 1.08;
`;

// 툴팁
const TipWrap    = styled.span`position: relative; display: inline-block;`;
const TipTrigger = styled.span`
  border-bottom: 2px dotted currentColor; cursor: help;
  font-size: 30px; font-weight: 700; color: inherit;
`;
const TipBox = styled.div`
  position: absolute; bottom: 130%; left: 50%;
  transform: translateX(-50%);
  background: #181c23; color: white;
  font-size: 30px; font-weight: 600;
  padding: 8px 12px; border-radius: 10px;
  width: 200px; text-align: center;
  line-height: 1.5; word-break: keep-all;
  pointer-events: none; opacity: 0;
  transition: opacity 0.2s; z-index: 50; white-space: normal;
  ${TipWrap}:hover & { opacity: 1; }
  &::after {
    content: ''; position: absolute; top: 100%; left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent; border-top-color: #181c23;
  }
`;

function Tip({ word, explain }: { word: string; explain: string }) {
  return (
    <TipWrap>
      <TipTrigger>{word} <span style={{ fontSize: 30, opacity: 0.65 }}>(?)</span></TipTrigger>
      <TipBox>{explain}</TipBox>
    </TipWrap>
  );
}

// ─── 화면 0·1 비교 ────────────────────────────────────────────

const TwoCol = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
  @media (max-width: 440px) { grid-template-columns: 1fr; }
`;

const CmpCard = styled.div<{ $accent: string }>`
  background: white; border-radius: 22px; padding: 28px 22px;
  border: 2px solid ${({ $accent }) => $accent}33;
  box-shadow: 0 3px 12px rgba(0,0,0,0.06);
`;

const CEmoji  = styled.div`font-size: 72px; text-align: center; line-height: 1; margin-bottom: 16px;`;
const CName   = styled.h3`font-size: 30px; font-weight: 900; text-align: center; color: ${({ theme }) => theme.colors.onSurface}; margin-bottom: 18px;`;
const SamsungLogo = styled.img<{ $size?: number; $radius?: string; $fit?: 'contain' | 'cover' }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  object-fit: ${({ $fit }) => $fit ?? 'contain'};
  border-radius: ${({ $radius }) => $radius ?? '0'};
  display: block;
  margin: 0 auto;
`;

// removed unused CompanyLogo; ELS uses `SamsungLogo`, savings uses emoji
const TagList = styled.div`display: flex; flex-direction: column; gap: 10px;`;
const Tag     = styled.div<{ $t: 'good' | 'bad' | 'neutral' }>`
  display: flex; align-items: center; gap: 10px;
  background: ${({ $t }) => $t === 'good' ? '#f6fff8' : $t === 'bad' ? '#fff7f7' : '#f8f9ff'};
  border: 2px solid ${({ $t }) => $t === 'good' ? '#006d3740' : $t === 'bad' ? '#ba1a1a40' : '#545d7a40'};
  border-radius: 18px; padding: 14px 16px;
  font-size: 30px; font-weight: 900;
  color: ${({ $t }) => $t === 'good' ? '#006d37' : $t === 'bad' ? '#ba1a1a' : '#2f3647'};
  line-height: 1.35;
  box-shadow: 0 4px 14px rgba(0,0,0,0.04);
`;

// 상품 정보 카드 (화면 1)
const PCard       = styled.div<{ $accent: string }>`
  background: white; border-radius: 24px; padding: 0;
  border: 2.5px solid ${({ $accent }) => $accent}44;
  box-shadow: 0 5px 22px rgba(0,0,0,0.08); overflow: hidden;
`;
const PHdr        = styled.div<{ $bg: string }>`
  background: ${({ $bg }) => $bg}; padding: 20px 22px;
  display: flex; align-items: center; gap: 18px;
`;
const PHdrLogoWrap = styled.div`
  width: 78px; height: 78px; flex-shrink: 0;
  border-radius: 22px;
  background: rgba(255,255,255,0.96);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 20px rgba(0,0,0,0.14);
`;
const PHdrText    = styled.div`
  h3 { font-size: 30px; font-weight: 900; color: #ffffff; margin-bottom: 4px; }
  p  { font-size: 30px; font-weight: 600; color: rgba(255,255,255,0.88); }
`;
const PBody       = styled.div`padding: 20px 22px;`;
const InfoRows    = styled.div`display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;`;
const InfoRow     = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: 14px; gap: 8px;
`;
const InfoLbl     = styled.span`font-size: 30px; font-weight: 700; color: ${({ theme }) => theme.colors.onSurfaceVariant}; display: flex; align-items: center; gap: 5px;`;
const InfoVal     = styled.span<{ $color?: string }>`font-size: 30px; font-weight: 900; color: ${({ $color }) => $color ?? '#181c23'}; font-variant-numeric: tabular-nums;`;
const OneLiner    = styled.div<{ $color: string }>`
  background: ${({ $color }) => $color}10;
  border-left: 4px solid ${({ $color }) => $color};
  border-radius: 0 12px 12px 0;
  padding: 12px 16px;
  font-size: 30px; font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
  line-height: 1.6; word-break: keep-all;
`;

// ─── 화면 2: 조건 카드 ────────────────────────────────────────

const CondBlock = styled.div<{ $type: 'success' | 'danger' | 'info' }>`
  background: ${({ $type }) =>
    $type === 'success' ? '#e8f5e9' : $type === 'danger' ? '#fff0f0' : '#f2f3fd'};
  border-radius: 22px; padding: 24px 20px;
  border: 1.5px solid ${({ $type }) =>
    $type === 'success' ? '#006d3733' : $type === 'danger' ? '#ba1a1a33' : '#c1c6d633'};
`;

const CondTitle = styled.h3<{ $color: string }>`
  font-size: 30px; font-weight: 900; color: ${({ $color }) => $color};
  margin-bottom: 18px; display: flex; align-items: center; gap: 8px;
  line-height: 1.15;
`;

const CondArrowFlow = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  margin-bottom: 14px;
`;

const CondArrow = styled.div<{ $color: string }>`
  font-size: 30px; color: ${({ $color }) => $color}; font-weight: 900;
`;

const CondDesc = styled.p`
  font-size: 30px; font-weight: 600;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  line-height: 1.6; word-break: keep-all;
`;

const CondLabel = styled.p<{ $color: string }>`
  font-size: 30px;
  font-weight: 800;
  color: ${({ $color }) => $color};
  margin-bottom: 8px;
  line-height: 1.25;
`;

// ─── 화면 3: 선택 버튼 ───────────────────────────────────────

const ChoiceBtn = styled.button<{ $accent: string }>`
  background: white; border-radius: 24px; padding: 30px 18px;
  border: 2.5px solid transparent;
  box-shadow: 0 5px 18px rgba(0,0,0,0.08);
  text-align: center; cursor: pointer; width: 100%;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-5px);
    border-color: ${({ $accent }) => $accent};
    box-shadow: 0 14px 36px ${({ $accent }) => $accent}33;
  }
  &:active { transform: scale(0.97); }
`;

const ChEmoji = styled.div`font-size: 60px; line-height: 1; margin-bottom: 12px;`;
const ChName  = styled.h3`font-size: 30px; font-weight: 900; color: ${({ theme }) => theme.colors.onSurface}; margin-bottom: 8px;`;
const ChDesc  = styled.p`font-size: 30px; font-weight: 500; color: ${({ theme }) => theme.colors.onSurfaceVariant}; line-height: 1.5; margin-bottom: 12px;`;
const ChTag   = styled.span<{ $color: string }>`
  display: inline-block;
  background: ${({ $color }) => $color}18; color: ${({ $color }) => $color};
  font-size: 30px; font-weight: 800;
  padding: 6px 16px; border-radius: 9999px;
`;

// ─── 화면 4: 주가 전체 공개 ──────────────────────────────────

const StockCard = styled.div`
  background: white; border-radius: 24px; padding: 26px 22px;
  border: 1.5px solid ${({ theme }) => theme.colors.surfaceContainer};
  box-shadow: 0 4px 20px rgba(0,0,0,0.07);
`;

const SamHeader = styled.div`
  display: flex; align-items: center; gap: 18px; margin-bottom: 24px;
`;

const SamLogoWrap = styled.div`
  width: 84px; height: 84px; border-radius: 22px;
  background: #ffffff;
  border: 2px solid #d9e2ff;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 20px rgba(0,0,0,0.10);
  flex-shrink: 0;
`;

// 가로 3분할 주가 행
const PriceRow3 = styled.div`
  display: grid; grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: center; gap: 6px; margin-bottom: 20px;
`;

const PriceCell = styled.div<{ $color: string }>`
  background: ${({ $color }) => $color}12;
  border: 1.5px solid ${({ $color }) => $color}33;
  border-radius: 18px; padding: 18px 10px;
  text-align: center;
  animation: ${popIn} 0.4s ease;
`;

const PriceCellIcon  = styled.div`font-size: 36px; margin-bottom: 8px; line-height: 1;`;
const PriceCellLabel = styled.p`font-size: 30px; font-weight: 700; color: ${({ theme }) => theme.colors.onSurfaceVariant}; margin-bottom: 6px;`;
const PriceCellVal   = styled.p<{ $color: string }>`
  font-size: clamp(22px, 4.8vw, 32px); font-weight: 900;
  color: ${({ $color }) => $color}; font-variant-numeric: tabular-nums;
`;
const PriceCellSub   = styled.p<{ $color: string }>`font-size: 30px; font-weight: 800; color: ${({ $color }) => $color}; margin-top: 5px;`;

const PriceArrow = styled.div`font-size: 30px; color: #006d37; font-weight: 900; text-align: center;`;

const ArrowConnector = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin: -8px 0 -6px;
`;

const ArrowConnectorImage = styled.img`
  width: 120px;
  height: 120px;
  display: block;
  object-fit: contain;
`;

const ResultPoster = styled.div`
  background: white;
  border-radius: 28px;
  padding: 22px 18px 26px;
  border: 2px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
`;

const ResultPosterTitle = styled.h2<{ $color: string }>`
  font-size: clamp(34px, 7vw, 58px);
  font-weight: 900;
  color: ${({ $color }) => $color};
  text-align: center;
  line-height: 1.1;
  word-break: keep-all;
  margin: 0 0 18px;
`;

const ResultPosterImage = styled.img`
  width: 100%;
  display: block;
  border-radius: 22px;
  object-fit: cover;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.10);
`;

const ResultPosterStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const GChip = styled.div<{ $pos: boolean }>`
  display: inline-block;
  background: ${({ $pos }) => $pos ? '#00703c16' : '#ba1a1a16'};
  color: ${({ $pos }) => $pos ? '#ba1a1a' : '#ba1a1a'};
  font-size: 30px; font-weight: 800;
  padding: 7px 18px; border-radius: 9999px;
  border: 1.5px solid ${({ $pos }) => $pos ? '#006d3730' : '#ba1a1a30'};
`;

// ─── 화면 6: 비교 + 위험 경고 ────────────────────────────────

const ResultGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
  align-items: stretch;
  @media (max-width: 440px) { grid-template-columns: 1fr; }
`;

const RCard = styled.div<{ $accent: string; $winner?: boolean }>`
  background: white; border-radius: 22px; padding: 22px 16px;
  border: 2.5px solid ${({ $accent, $winner }) => $winner ? $accent : `${$accent}33`};
  box-shadow: ${({ $winner, $accent }) => $winner ? `0 6px 22px ${$accent}28` : 'none'};
  text-align: center; position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 300px;
  box-sizing: border-box;
`;

const WinTag = styled.div`
  position: absolute; top: -1px; right: 14px;
  background: #f59f00; color: white;
  font-size: 30px; font-weight: 800;
  padding: 3px 11px 5px; border-radius: 0 0 9px 9px;
`;

const REmoji = styled.div`font-size: 44px; margin-bottom: 8px;`;
const RName  = styled.p`font-size: 30px; font-weight: 800; color: ${({ theme }) => theme.colors.onSurface}; margin-bottom: 12px;`;

const WarnHero = styled.div`
  background: #fff0f0; border-radius: 24px; padding: 30px 22px;
  border: 2.5px solid #ba1a1a44; text-align: center;
  ${css`animation: ${pulseRed} 2.5s infinite;`}
`;

const WarnTitle = styled.h2`font-size: clamp(20px, 4vw, 28px); font-weight: 900; color: #ba1a1a; margin: 10px 0 18px;`;

const CrashRow = styled.div`
  display: flex; align-items: center; justify-content: center;
  gap: 14px; margin-bottom: 24px; flex-wrap: wrap;
`;

const CBox = styled.div<{ $danger?: boolean }>`
  background: ${({ $danger }) => $danger ? '#ffdad6' : '#f2f3fd'};
  border-radius: 16px; padding: 18px 24px; text-align: center;
  border: 1.5px solid ${({ $danger }) => $danger ? '#ba1a1a44' : '#c1c6d633'};
  min-width: 120px;
  p:first-child { font-size: 30px; font-weight: 600; color: ${({ $danger }) => $danger ? '#ba1a1a' : '#727785'}; margin-bottom: 5px; }
  p:last-child  { font-size: 30px; font-weight: 900; color: ${({ $danger }) => $danger ? '#ba1a1a' : '#181c23'}; font-variant-numeric: tabular-nums; }
`;

const CArrow = styled.div`font-size: 30px; color: #ba1a1a;`;

const WarnGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  @media (max-width: 440px) { grid-template-columns: 1fr; }
`;

const WCard = styled.div<{ $ok: boolean }>`
  background: ${({ $ok }) => $ok ? '#e8f5e9' : '#fff4f4'};
  border-radius: 18px; padding: 20px 14px;
  border: 1.5px solid ${({ $ok }) => $ok ? '#006d3733' : '#ba1a1a33'};
  text-align: center;
`;

const WEmoji  = styled.div`font-size: 38px; margin-bottom: 8px;`;
const WName   = styled.p`font-size: 30px; font-weight: 800; color: ${({ theme }) => theme.colors.onSurface}; margin-bottom: 7px;`;
const WStatus = styled.p<{ $ok: boolean }>`font-size: 30px; font-weight: 800; color: ${({ $ok }) => $ok ? '#006d37' : '#ba1a1a'}; margin-bottom: 7px;`;
const WAmt    = styled.p`font-size: 30px; font-weight: 700; color: ${({ theme }) => theme.colors.onSurface}; line-height: 1.5; word-break: keep-all;`;

const KeyMsg = styled.div`
  background: #ba1a1a; border-radius: 16px;
  padding: 16px 18px; color: white;
  font-size: 30px; font-weight: 800;
  text-align: center; line-height: 1.55; word-break: keep-all; margin-top: 18px;
`;

const MFlow  = styled.div`display: flex; flex-direction: column; align-items: center; gap: 4px; margin-bottom: 12px;`;
const MFrom  = styled.p`font-size: 30px; font-weight: 800; color: ${({ theme }) => theme.colors.onSurfaceVariant};`;
const MArrow = styled.p`font-size: 30px; color: #006d37; font-weight: 700;`;

// ─── 화면 7: 교훈 + 출처 ──────────────────────────────────────

const LessonCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 28px 22px;
  border: 1.5px solid ${({ theme }) => theme.colors.surfaceContainer};
  text-align: center;
  box-shadow: 0 4px 18px rgba(0,0,0,0.06);
  margin-bottom: 16px;
`;

const LessonTitle = styled.p`
  font-size: 30px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.onSurface};
  margin-bottom: 10px;
`;

const LessonMsg = styled.p`
  font-size: 30px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  line-height: 1.55;
  word-break: keep-all;
`;

const SourceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SItem = styled.a`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  text-decoration: none;
  color: inherit;
  padding: 14px 12px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.surfaceContainerLow};
`;

const SIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  flex-shrink: 0;
`;

const SText = styled.div`
  p:first-child { font-size: 30px; font-weight: 700; color: ${({ theme }) => theme.colors.onSurface}; margin-bottom: 2px; }
  p:last-child  { font-size: 30px; font-weight: 500; color: ${({ theme }) => theme.colors.onSurfaceVariant}; }
`;
export default function ELSPage() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>(0);
  const [choice, setChoice] = useState<Choice | null>(null);

  const TOTAL = 8;

  const go = (s: Screen) => {
    setScreen(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChoose = (c: Choice) => {
    setChoice(c);
    // 예적금 선택 시 주가 화면(4)을 건너뛰고 바로 결과(5)로
    go(c === 'savings' ? 5 : 4);
  };

  const reset = () => {
    setScreen(0);
    setChoice(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageLayout>
      <PageWrap>

        {screen > 0 && (
          <Dots>
            {Array.from({ length: TOTAL }).map((_, i) => (
              <Dot key={i} $done={screen > i} $active={screen === i} />
            ))}
          </Dots>
        )}

        {/* ══════════════════════════════════════════
            화면 0 — ELS vs 예적금 비교
        ══════════════════════════════════════════ */}
        {screen === 0 && (
          <ScreenWrap>
            <div style={{ textAlign: 'center' }}>
              <ScreenTitle style={{ marginTop: 10 }}>예적금 vs ELS</ScreenTitle>
              <ScreenSub style={{ marginTop: 8 }}>두 상품의 차이를 먼저 알아봐요</ScreenSub>
            </div>

            <TwoCol>
              <CmpCard $accent="#904800">
                <CEmoji>🐷</CEmoji>
                <CName>예적금</CName>
                <TagList>
                  <Tag $t="good">✅ 원금 보호</Tag>
                  <Tag $t="good">✅ 결과 미리 알 수 있음</Tag>
                  <Tag $t="neutral">💰 수익 적음</Tag>
                  <Tag $t="good">✅ 위험 낮음</Tag>
                </TagList>
              </CmpCard>

              <CmpCard $accent="#0059b9">
                  <SamsungLogo src="/img/image.png" alt="삼성전자 로고" $size={88} $radius="12px" />
                <CName>ELS</CName>
                <TagList>
                  <Tag $t="bad">⚠️ 원금 손실 가능</Tag>
                  <Tag $t="bad">⚠️ 결과가 달라질 수 있음</Tag>
                  <Tag $t="good">💰 수익 높음</Tag>
                  <Tag $t="bad">⚠️ 위험 높음</Tag>
                </TagList>
              </CmpCard>
            </TwoCol>

            <Card style={{ background: '#f2f3fd', border: 'none', textAlign: 'center' }}>
              <p style={{ fontSize: 30, fontWeight: 800, color: '#2f3647', lineHeight: 1.7, wordBreak: 'keep-all' }}>
                📌 예적금은 안전하지만 수익이 적어요.<br />
                ELS는 더 많이 벌 수도 있지만, 돈을 잃을 수도 있어요.
              </p>
            </Card>

            <PrimaryBtn onClick={() => go(1)}>상품 정보 자세히 보기 →</PrimaryBtn>
          </ScreenWrap>
        )}

        {/* ══════════════════════════════════════════
            화면 1 — 상품 정보 카드
        ══════════════════════════════════════════ */}
        {screen === 1 && (
          <ScreenWrap>
            <BackBtn onClick={() => go(0)}>← 뒤로</BackBtn>

            <div style={{ textAlign: 'center' }}>
              <ScreenTitle>상품 정보 확인</ScreenTitle>
              <ScreenSub style={{ marginTop: 8 }}>선택 전에 두 상품을 자세히 살펴봐요</ScreenSub>
            </div>

            <PCard $accent="#904800">
              <PHdr $bg="#904800">
                <PHdrLogoWrap>
                  <CEmoji>🐷</CEmoji>
                </PHdrLogoWrap>
                <PHdrText>
                  <h3>예적금 · 안전한 선택</h3>
                  <p>정해진 기간에 정해진 수익</p>
                </PHdrText>
              </PHdr>
              <PBody>
                <InfoRows>
                  <InfoRow>
                    <InfoLbl>💰 금리</InfoLbl>
                    <InfoVal $color="#904800">연 3.5%</InfoVal>
                  </InfoRow>
                  <InfoRow>
                    <InfoLbl>🛡️ 원금 보호</InfoLbl>
                    <InfoVal $color="#006d37">100% 보장 + α(이자)</InfoVal>
                  </InfoRow>
                  <InfoRow>
                    <InfoLbl>📋 결과</InfoLbl>
                    <InfoVal>미리 알 수 있어요</InfoVal>
                  </InfoRow>
                </InfoRows>
                <OneLiner $color="#904800">
                  💡 정해진 기간에 정해진 수익을 받을 수 있어요.
                </OneLiner>
              </PBody>
            </PCard>

            <PCard $accent="#0059b9">
              <PHdr $bg="#eaf2ff">
                <PHdrLogoWrap>
                  <SamsungLogo src="/img/image.png" alt="삼성전자 로고" $size={58} $radius="8px" />
                </PHdrLogoWrap>
                <PHdrText>
                  <h3 style={{ color: '#0059b9' }}>ELS · 높은 수익 도전</h3>
                  <p style={{ color: '#2f6ed6' }}>조건 충족 시 예적금보다 높은 수익</p>
                </PHdrText>
              </PHdr>
              <PBody>
                <InfoRows>
                  <InfoRow>
                    <InfoLbl>💰 기대 수익</InfoLbl>
                    <InfoVal $color="#0059b9">연 8%</InfoVal>
                  </InfoRow>
                  <InfoRow>
                    <InfoLbl>📈ELS 상품</InfoLbl>
                    <InfoVal>삼성전자 📱</InfoVal>
                  </InfoRow>
                  <InfoRow>
                    <InfoLbl>⚠️ <Tip word="원금 손실" explain="처음 넣은 돈보다 적게 돌려받는 거예요." /></InfoLbl>
                    <InfoVal $color="#ba1a1a">주가 급락 시 가능</InfoVal>
                  </InfoRow>
                </InfoRows>
                <OneLiner $color="#0059b9">
                  💡 조건을 만족하면 예적금보다 높은 수익을 받을 수 있어요.
                </OneLiner>
              </PBody>
            </PCard>

            <PrimaryBtn onClick={() => go(2)}>ELS 조건 확인하기 →</PrimaryBtn>
          </ScreenWrap>
        )}

        {/* ══════════════════════════════════════════
            화면 2 — ELS 조건 확인
        ══════════════════════════════════════════ */}
        {screen === 2 && (
          <ScreenWrap>
            <BackBtn onClick={() => go(1)}>← 뒤로</BackBtn>

            <div style={{ textAlign: 'center' }}>
              <BigEmoji>📋</BigEmoji>
              <ScreenTitle style={{ marginTop: 10 }}>ELS 조건 보기</ScreenTitle>
              <ScreenSub style={{ marginTop: 8 }}>이 조건을 알아야 결과를 이해할 수 있어요!</ScreenSub>
            </div>

            {/* 시작 가격 */}
            <CondBlock $type="info">
              <CondTitle $color="#0059b9">📌 시작 가격</CondTitle>
              <CondArrowFlow>
                <CondLabel $color="#0059b9">2025.01.02 삼성전자 주가</CondLabel>
                <BigNum $color="#0059b9" style={{ textAlign: 'center' }}>{krw(SAMSUNG_START)}</BigNum>
              </CondArrowFlow>
              <CondDesc>이 가격을 기준으로 ELS 조건이 결정돼요.</CondDesc>
            </CondBlock>

            {/* 성공 조건 */}
            <CondBlock $type="success" style={{ background: '#fff9c4', border: '1.5px solid #f4d03f66' }}>
              <CondTitle $color="#111111">만기 상환 조건</CondTitle>
              <CondArrowFlow>
                <CondLabel $color="#111111" style={{ fontSize: 34, textAlign: 'center' }}>{krw(KNOCK_IN)} 이상이면</CondLabel>
                <BigNum $color="#111111" style={{ textAlign: 'center' }}>시작 주가의 50% 이상</BigNum>
                <CondArrow $color="#006d37">↓</CondArrow>
                <div style={{ background: '#fff3cd', border: '1.5px solid #d4b10666', borderRadius: 12, padding: '12px 22px', textAlign: 'center' }}>
                  <p style={{ fontSize: 30, fontWeight: 900, color: '#111111' }}>🎉 정해진 수익 달성</p>
                </div>
              </CondArrowFlow>
              <CondDesc style={{ color: '#111111' }}>
                6개월마다 검사하여 삼성전자 주가가{' '}
                <strong style={{ color: '#111111' }}>{krw(KNOCK_IN)} 이상</strong>이면 <strong style={{ color: '#ba1a1a' }}>정해진 수익</strong>을 받아요!
              </CondDesc>
            </CondBlock>

            {/* 성공 조건 */}
            <CondBlock $type="success">
              <CondTitle $color="#006d37">✅조기 상환 조건</CondTitle>
              <CondArrowFlow>
                <CondLabel $color="#006d37" style={{ fontSize: 34, textAlign: 'center' }}>{krw(EARLY_COND)} 이상 이면</CondLabel>
                <BigNum $color="#006d37" style={{ textAlign: 'center' }}>시작 주가의 85%</BigNum>
                <CondArrow $color="#006d37">↓</CondArrow>
                <div style={{ background: '#006d3718', border: '1.5px solid #006d3744', borderRadius: 12, padding: '10px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: 30, fontWeight: 800, color: '#006d37' }}>🎉 약속한 수익 지급</p>
                </div>
              </CondArrowFlow>
              <CondDesc>
                6개월마다 검사하여 삼성전자 주가가{' '}
                <strong style={{ color: '#006d37' }}>{krw(EARLY_COND)} 이상</strong>이면 성공이에요!
              </CondDesc>
            </CondBlock>



            {/* 손실 조건 */}
            <CondBlock $type="danger">
              <CondTitle $color="#ba1a1a">
                ⚠️ <Tip word="원금 손실" explain="처음 넣은 돈보다 적게 돌려받는 거예요." /> 가능 조건
              </CondTitle>
              <CondArrowFlow>
                <CondLabel $color="#ba1a1a" style={{ fontSize: 34, textAlign: 'center' }}>{krw(KNOCK_IN)} 미만</CondLabel>
                <BigNum $color="#ba1a1a" style={{ textAlign: 'center' }}>시작 주가의 50% 미만</BigNum>
                <CondArrow $color="#ba1a1a">↓</CondArrow>
                <div style={{ background: '#ba1a1a18', border: '1.5px solid #ba1a1a44', borderRadius: 12, padding: '10px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: 30, fontWeight: 800, color: '#ba1a1a' }}>😢 원금 손실 위험 발생</p>
                </div>
              </CondArrowFlow>
              <CondDesc>
                투자 기간 중 단 한 번이라도 주가가{' '}
                <strong style={{ color: '#ba1a1a' }}>{krw(KNOCK_IN)} 미만</strong>으로 내려가면 위험해요!(KNOCK-IN 조건 발생)
              </CondDesc>
            </CondBlock>

            <PrimaryBtn onClick={() => go(3)}>나의 선택하기 →</PrimaryBtn>
          </ScreenWrap>
        )}

        {/* ══════════════════════════════════════════
            화면 3 — 나의 선택
        ══════════════════════════════════════════ */}
        {screen === 3 && (
          <ScreenWrap>
            <BackBtn onClick={() => go(2)}>← 뒤로</BackBtn>

            <div style={{ textAlign: 'center' }}>
              <BigEmoji>🎮</BigEmoji>
              <ScreenTitle style={{ marginTop: 10 }}>나의 선택</ScreenTitle>
              <ScreenSub style={{ marginTop: 8 }}>
                1,000만 원이 있어요.<br />어떤 상품을 선택할까요?
              </ScreenSub>
            </div>

            <TwoCol>
              <ChoiceBtn $accent="#904800" onClick={() => handleChoose('savings')}>
                <ChEmoji>🐷</ChEmoji>
                <ChName>예적금</ChName>
                <ChDesc>안전하게 이자를 받을 수 있어요</ChDesc>
                <ChTag $color="#904800">연 3.5% 이자</ChTag>
              </ChoiceBtn>

              <ChoiceBtn $accent="#0059b9" onClick={() => handleChoose('els')}>
                <SamsungLogo src="/img/image.png" alt="삼성전자 로고" $size={62} $radius="12px" />
                <ChName>ELS</ChName>
                <ChDesc>조건 충족 시 더 높은 수익</ChDesc>
                <ChTag $color="#0059b9">연 8% 기대수익</ChTag>
              </ChoiceBtn>
            </TwoCol>

            <Card style={{ background: '#f2f3fd', border: 'none' }}>
              <p style={{ fontSize: 30, fontWeight: 700, color: '#414754', textAlign: 'center', lineHeight: 1.6 }}>
                💡 2025년 실제 삼성전자 주가를 기준으로 체험해요
              </p>
            </Card>
          </ScreenWrap>
        )}

        {/* ══════════════════════════════════════════
            화면 4 — 삼성전자 주가 전체 공개
        ══════════════════════════════════════════ */}
        {screen === 4 && (
          <ScreenWrap>
            <BackBtn onClick={() => go(3)}>← 뒤로</BackBtn>

            <div style={{ textAlign: 'center' }}>
              <ScreenTitle style={{ fontSize: 'clamp(34px, 7vw, 56px)' }}>📈 2025년 삼성전자 주가</ScreenTitle>
              <ScreenSub style={{ marginTop: 10, fontSize: 'clamp(20px, 3.8vw, 28px)' }}>실제 주가 흐름을 한눈에 확인해요</ScreenSub>
            </div>

            <StockCard>
              <SamHeader>
                <SamLogoWrap>
                  <SamsungLogo src="/img/image.png" alt="삼성전자 로고" $size={66} />
                </SamLogoWrap>
                <div>
                  <p style={{ fontWeight: 900, fontSize: 30, lineHeight: 1.2 }}>삼성전자 (005930)</p>
                  <p style={{ fontSize: 30, color: '#727785', fontWeight: 700 }}>KOSPI · 2025년 실제 데이터</p>
                </div>
              </SamHeader>

              {/* 가로 3분할 주가 */}
              <PriceRow3>
                <PriceCell $color="#0059b9">
                  <PriceCellIcon>🏁</PriceCellIcon>
                  <PriceCellLabel>시작 주가</PriceCellLabel>
                  <PriceCellVal $color="#0059b9">{krw(SAMSUNG_START)}</PriceCellVal>
                  <PriceCellSub $color="#0059b9">100%</PriceCellSub>
                </PriceCell>

                <PriceArrow>→</PriceArrow>

                <PriceCell $color="#006d37">
                  <PriceCellIcon>📈</PriceCellIcon>
                  <PriceCellLabel>6개월차 주가</PriceCellLabel>
                  <PriceCellVal $color="#006d37">{krw(SAMSUNG_MID)}</PriceCellVal>
                  <PriceCellSub $color="#006d37">+34% ↑</PriceCellSub>
                </PriceCell>

                <PriceArrow>→</PriceArrow>

                <PriceCell $color="#006d37">
                  <PriceCellIcon>🚀</PriceCellIcon>
                  <PriceCellLabel>연말 주가</PriceCellLabel>
                  <PriceCellVal $color="#006d37">{krw(SAMSUNG_END)}</PriceCellVal>
                  <PriceCellSub $color="#006d37">+125% ↑</PriceCellSub>
                </PriceCell>
              </PriceRow3>
            </StockCard>

            <ArrowConnector aria-hidden="true">
              <ArrowConnectorImage src="/img/connector-arrow.svg" alt="아래 화살표" />
            </ArrowConnector>

            {/* 성공 로직 설명 */}
            <Card style={{ padding: '26px 22px', background: '#ffff4b', border: '1.5px solid #006d3733' }}>
              <p style={{ fontSize: 50, fontWeight: 800, color: '#c74848', marginBottom: 16, textAlign: 'center' }}>
                조기 상환 조건 달성!!! <br />(시작 주가의 85% 이상)
              </p>
            </Card>

            <PrimaryBtn $bg="#006d37" onClick={() => go(5)}>
              결과 확인하기 →
            </PrimaryBtn>
          </ScreenWrap>
        )}

        {/* ══════════════════════════════════════════
            화면 5 — 결과 확인
        ══════════════════════════════════════════ */}
        {screen === 5 && (
          <ScreenWrap>
            {/* 예적금 경로는 화면 4를 건너뛰었으므로 화면 3으로 */}
            <BackBtn onClick={() => go(choice === 'savings' ? 3 : 4)}>← 뒤로</BackBtn>

            <ResultPosterStack>
              <ResultPoster>
                <ResultPosterTitle $color="#904800">정기적금 연 3.5% 투자시</ResultPosterTitle>
                <ResultPosterImage src="/img/KakaoTalk_20260531_191837410.png" alt="정기적금 연 3.5% 투자시 이미지" />
              </ResultPoster>

              <ResultPoster>
                <ResultPosterTitle $color="#0059b9">삼성전자 ELS 투자시</ResultPosterTitle>
                <ResultPosterImage src="/img/KakaoTalk_20260531_191843238.png" alt="삼성전자 ELS 투자시 이미지" />
              </ResultPoster>
            </ResultPosterStack>

            <PrimaryBtn $bg={choice === 'savings' ? '#904800' : '#006d37'} onClick={() => go(6)}>
              투자 결과 비교하기 →
            </PrimaryBtn>
          </ScreenWrap>
        )}

        {/* ══════════════════════════════════════════
            화면 6 — 비교 + 위험 경고
        ══════════════════════════════════════════ */}
        {screen === 6 && (
          <ScreenWrap>
            <BackBtn onClick={() => go(5)}>← 뒤로</BackBtn>

            {/* ── 예적금 선택 경로: 예적금 장점 강조 + 소형 ELS 비교 ── */}
            {choice === 'savings' && (
              <>
                <div style={{ textAlign: 'center' }}>
                  <ScreenTitle>🐷 예적금의 장점</ScreenTitle>
                  <ScreenSub style={{ marginTop: 8 }}>예적금이 왜 안전한지 알아봐요</ScreenSub>
                </div>

                {/* 예적금 장점 카드 3개 */}
                {[
                  { emoji: '🛡️', title: '원금 보호', desc: '주가가 아무리 떨어져도 처음 넣은 돈은 그대로예요.' },
                  { emoji: '✅', title: '결과를 미리 알 수 있어요', desc: `1년 후 정확히 ${krw(SAVINGS_TOTAL)}이 된다는 걸 처음부터 알 수 있어요.` },
                  { emoji: '🏦', title: '국가가 보호해요', desc: '예적금자보호법으로 최대 5,000만 원까지 국가가 보장해요.' },
                ].map(item => (
                  <Card key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '20px 18px' }}>
                    <div style={{ fontSize: 36, flexShrink: 0, lineHeight: 1 }}>{item.emoji}</div>
                    <div>
                      <p style={{ fontSize: 30, fontWeight: 800, color: '#181c23', marginBottom: 4 }}>{item.title}</p>
                      <p style={{ fontSize: 30, fontWeight: 600, color: '#414754', lineHeight: 1.6, wordBreak: 'keep-all' }}>{item.desc}</p>
                    </div>
                  </Card>
                ))}

                {/* 소형 비교: 만약 ELS를 선택했다면 */}
                <div style={{ background: '#f2f3fd', borderRadius: 18, padding: '18px 16px' }}>
                  <p style={{ fontSize: 30, fontWeight: 700, color: '#727785', marginBottom: 12, textAlign: 'center' }}>
                    🔍 만약 ELS를 선택했다면? (2025년 기준)
                  </p>
                  <ResultGrid>
                    <RCard $accent="#904800" $winner>
                      <WinTag>✅ 내 선택</WinTag>
                      <REmoji>🐷</REmoji>
                      <RName>예적금</RName>
                      <MFlow>
                        <MFrom>{krw(PRINCIPAL)}</MFrom>
                        <MArrow>↓</MArrow>
                        <MidNum $color="#006d37">{krw(SAVINGS_TOTAL)}</MidNum>
                      </MFlow>
                      <GChip $pos>이자 35만원 수익</GChip>
                    </RCard>
                    <RCard $accent="#0059b9">
                      <SamsungLogo src="/img/image.png" alt="삼성전자 로고" $size={58} />
                      <RName>ELS</RName>
                      <MFlow>
                        <MFrom>{krw(PRINCIPAL)}</MFrom>
                        <MArrow>↓</MArrow>
                        <MidNum $color="#006d37">{krw(ELS_TOTAL)}</MidNum>
                      </MFlow>
                      <GChip $pos>6개월 조기 상환 40만원 수익</GChip>
                    </RCard>
                  </ResultGrid>
                  <p style={{ fontSize: 30, fontWeight: 600, color: '#727785', textAlign: 'center', marginTop: 12, lineHeight: 1.6, wordBreak: 'keep-all' }}>
                    2025년에는 ELS가 예적금보다 {krw(ELS_GAIN - SAVINGS_GAIN)} 더 많이 받았어요.<br />
                    하지만 주가가 떨어졌다면 손실이 날 수도 있어요.
                  </p>
                </div>
              </>
            )}

            {/* ── ELS 선택 경로: 기존 비교 + 위험 경고 ── */}
            {choice === 'els' && (
              <>
                <div style={{ textAlign: 'center' }}>
                  <ScreenTitle>📊 두 상품 투자 결과 비교</ScreenTitle>
                  <ScreenSub style={{ marginTop: 8 }}>같은 1,000만 원, 결과가 달라요</ScreenSub>
                </div>

                <ResultGrid>
                  <RCard $accent="#904800">
                    <REmoji>🐷</REmoji>
                    <RName>예적금</RName>
                    <MFlow>
                      <MFrom>{krw(PRINCIPAL)}</MFrom>
                      <MArrow>↓</MArrow>
                      <MidNum $color="#006d37">{krw(SAVINGS_TOTAL)}</MidNum>
                    </MFlow>
                    <GChip $pos>이자 35만원 수익</GChip>
                  </RCard>

                  <RCard $accent="#0059b9" $winner>
                    <WinTag>✅ 내 선택</WinTag>
                    <SamsungLogo src="/img/image.png" alt="삼성전자 로고" $size={58} />
                    <RName>ELS</RName>
                    <MFlow>
                      <MFrom>{krw(PRINCIPAL)}</MFrom>
                      <MArrow>↓</MArrow>
                      <MidNum $color="#006d37">{krw(ELS_TOTAL)}</MidNum>
                    </MFlow>
                    <GChip $pos> 6개월 조기 상환 40만원 수익</GChip>
                  </RCard>
                </ResultGrid>

                <div style={{ background: '#e8f0fe', borderRadius: 16, padding: '16px 18px', fontSize: 30, fontWeight: 700, color: '#0059b9', textAlign: 'center', lineHeight: 1.65, wordBreak: 'keep-all' }}>
                  🏆 2025년에는 ELS가 예적금보다 <strong>{krw(ELS_GAIN - SAVINGS_GAIN)}</strong> 더 많은 수익을 냈어요.
                </div>
              </>
            )}

            {/* 위험 경고 */}
            <WarnHero>
              <BigEmoji>⚠️</BigEmoji>
              <WarnTitle>만약 주가가 크게 떨어졌다면?</WarnTitle>

              <CrashRow>
                <CBox>
                  <p>투자 시작</p>
                  <p>{krw(SAMSUNG_START)}</p>
                </CBox>
                <CArrow>⬇️</CArrow>
                <CBox $danger>
                  <p>50% 미만으로 <br></br> 주가 폭락!!!</p>
                </CBox>
              </CrashRow>

              <WarnGrid>
                <WCard $ok>
                  <WEmoji>🐷</WEmoji>
                  <WName>예적금</WName>
                  <WStatus $ok>😊 원금 보호</WStatus>
                  <WAmt>{krw(SAVINGS_TOTAL)}</WAmt>
                </WCard>
                <WCard $ok={false}>
                  <SamsungLogo src="/img/image.png" alt="삼성전자 로고" $size={36} />
                  <WName>ELS</WName>
                  <WStatus $ok={false}>😢 원금 손실 가능</WStatus>
                  <WAmt>1,000만 원보다<br />적게 받을 수 있어요</WAmt>
                </WCard>
              </WarnGrid>

              <KeyMsg>
                💡 ELS는 더 많이 벌 수도 있지만,<br />돈을 잃을 수도 있어요.
              </KeyMsg>
            </WarnHero>

            <PrimaryBtn $bg="#ba1a1a" onClick={() => go(7)}>교훈 확인하기 →</PrimaryBtn>
          </ScreenWrap>
        )}

        {/* ══════════════════════════════════════════
            화면 7 — 교훈 + 출처
        ══════════════════════════════════════════ */}
        {screen === 7 && (
          <ScreenWrap>
            <BackBtn onClick={() => go(6)}>← 뒤로</BackBtn>

            <LessonCard>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📖</div>
              <LessonTitle>오늘의 교훈</LessonTitle>
              <LessonMsg>
                높은 수익에는 그만큼 위험이 따라요.<br />
                (High-risk, High-return)
              </LessonMsg>
            </LessonCard>

            {/* 나의 투자 성향 찾기 CTA */}
            <Card style={{ background: 'linear-gradient(135deg,#1428a0,#0059b9)', border: 'none', padding: '26px 22px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>🧭</div>
              <p style={{ fontSize: 30, fontWeight: 900, color: 'white', marginBottom: 6, lineHeight: 1.3 }}>
                나의 투자 성향 찾기
              </p>
              <p style={{ fontSize: 30, fontWeight: 600, color: 'rgba(255,255,255,0.82)', marginBottom: 20, lineHeight: 1.55, wordBreak: 'keep-all' }}>
                ELS를 배웠다면 이제 나의 투자 성향도 알아볼까요?
              </p>
              <PrimaryBtn
                $bg="white"
                style={{ color: '#0059b9' }}
                onClick={() => navigate('/preference')}
              >
                나의 성향 알아보기 →
              </PrimaryBtn>
            </Card>

            {/* 참고자료 */}
            <Card>
              <p style={{ fontSize: 30, fontWeight: 800, color: '#414754', marginBottom: 14 }}>📚 참고자료</p>
              <SourceList>
                <SItem href="https://data.krx.co.kr" target="_blank" rel="noopener noreferrer">
                  <SIcon>📈</SIcon>
                  <SText>
                    <p>한국거래소 (KRX)</p>
                    <p>삼성전자(005930) 2025년 일별 종가 데이터 — 주가 시나리오 반영.</p>
                  </SText>
                </SItem>

                <SItem href="https://ecos.bok.or.kr" target="_blank" rel="noopener noreferrer">
                  <SIcon>🏦</SIcon>
                  <SText>
                    <p>한국은행 경제통계시스템 (ECOS)</p>
                    <p>2025년 정기예금 수신금리 통계 — 예적금 금리 근거.</p>
                  </SText>
                </SItem>

                <SItem href="https://fine.fss.or.kr" target="_blank" rel="noopener noreferrer">
                  <SIcon>📜</SIcon>
                  <SText>
                    <p>금융감독원 파인 (FINE)</p>
                    <p>파생결합증권(ELS) 녹인·투자자 유의사항 참고.</p>
                  </SText>
                </SItem>

                <SItem href="https://kdic.or.kr" target="_blank" rel="noopener noreferrer">
                  <SIcon>🛡️</SIcon>
                  <SText>
                    <p>예금보험공사 (KDIC)</p>
                    <p>예금자보호제도 운영 기준 — 정기예금 보호 한도 근거.</p>
                  </SText>
                </SItem>
              </SourceList>
            </Card>

            <GhostBtn onClick={reset}>🔄 처음부터 다시 해보기</GhostBtn>
          </ScreenWrap>
        )}

      </PageWrap>
    </PageLayout>
  );
}
