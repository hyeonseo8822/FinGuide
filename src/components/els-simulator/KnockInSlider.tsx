import styled from 'styled-components';

// 녹인 배리어 수준 조절 슬라이더
// 학생이 직접 배리어를 바꿔 시뮬레이션 결과가 달라짐을 체험
interface Props {
  value: number;           // 0.50 ~ 0.70
  onChange: (v: number) => void;
  disabled?: boolean;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const Value = styled.span`
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.dangerRed};
`;

const Tooltip = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  background: ${({ theme }) => theme.colors.surfaceContainerHigh};
  border-radius: ${({ theme }) => theme.rounded.full};
  padding: 2px 10px;
  cursor: help;
  border-bottom: 1px dotted ${({ theme }) => theme.colors.primary};
  title: attr(data-tip);
`;

const SliderInput = styled.input`
  width: 100%;
  accent-color: ${({ theme }) => theme.colors.dangerRed};
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TickRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.outline};
  padding: 0 2px;
`;

const STEPS = [0.50, 0.55, 0.60, 0.65, 0.70];

export default function KnockInSlider({ value, onChange, disabled }: Props) {
  // 슬라이더 값을 인덱스로 매핑 (0~4)
  const stepIndex = STEPS.indexOf(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value, 10);
    onChange(STEPS[idx]);
  };

  return (
    <Wrapper>
      <LabelRow>
        <Label>
          녹인 배리어{' '}
          <Tooltip title="시험 과락 기준선과 같아요. 이 선 아래로 떨어지면 원금 손실이 발생할 수 있어요.">
            ?
          </Tooltip>
        </Label>
        <Value>{(value * 100).toFixed(0)}%</Value>
      </LabelRow>
      <SliderInput
        type="range"
        min={0}
        max={4}
        step={1}
        value={stepIndex === -1 ? 2 : stepIndex}
        onChange={handleChange}
        disabled={disabled}
      />
      <TickRow>
        {STEPS.map(s => (
          <span key={s}>{(s * 100).toFixed(0)}%</span>
        ))}
      </TickRow>
    </Wrapper>
  );
}
