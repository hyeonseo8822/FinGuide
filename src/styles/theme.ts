// DESIGN.md 토큰을 styled-components ThemeProvider 형식으로 변환
// 교육 목적: 학생들이 색상 의미를 직관적으로 이해할 수 있도록 시맨틱 네이밍 사용
const theme = {
  colors: {
    // Surface (배경)
    background: '#f9f9ff',
    surface: '#f9f9ff',
    surfaceContainerLow: '#f2f3fd',
    surfaceContainer: '#ecedf7',
    surfaceContainerHigh: '#e6e8f2',
    surfaceContainerHighest: '#e0e2ec',

    // Content
    onSurface: '#181c23',
    onSurfaceVariant: '#414754',
    outline: '#727785',
    outlineVariant: '#c1c6d6',

    // Primary (Toss Blue)
    primary: '#0059b9',
    onPrimary: '#ffffff',
    primaryContainer: '#1071e5',
    onPrimaryContainer: '#fefcff',
    inversePrimary: '#acc7ff',

    // Secondary (Safe Green — 예금, 안전)
    secondary: '#006d37',
    onSecondary: '#ffffff',
    secondaryContainer: '#6bfe9c',
    onSecondaryContainer: '#00743a',

    // Tertiary (Warning Orange — ETF, 중간 위험)
    tertiary: '#904800',
    onTertiary: '#ffffff',
    tertiaryContainer: '#b55d00',
    onTertiaryContainer: '#fffbff',

    // Error (Danger Red — ELS, 고위험)
    error: '#ba1a1a',
    onError: '#ffffff',
    errorContainer: '#ffdad6',
    onErrorContainer: '#93000a',

    // 편의 시맨틱 별칭
    safeGreen: '#006d37',
    safeGreenLight: '#6bfe9c',
    cautionOrange: '#904800',
    dangerRed: '#ba1a1a',
    dangerRedLight: '#ffdad6',
    white: '#ffffff',
  },
  typography: {
    displayLg: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: '40px',
      fontWeight: 800,
      lineHeight: '52px',
      letterSpacing: '-0.02em',
    },
    headlineLg: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: '32px',
      fontWeight: 700,
      lineHeight: '40px',
      letterSpacing: '-0.01em',
    },
    headlineLgMobile: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: '26px',
      fontWeight: 700,
      lineHeight: '34px',
    },
    headlineMd: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: '24px',
      fontWeight: 700,
      lineHeight: '32px',
    },
    bodyLg: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: '20px',
      fontWeight: 500,
      lineHeight: '30px',
    },
    bodyMd: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: '18px',
      fontWeight: 500,
      lineHeight: '28px',
    },
    labelLg: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: '16px',
      fontWeight: 700,
      lineHeight: '20px',
    },
    labelMd: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: '18px',
    },
  },
  rounded: {
    sm: '0.5rem',
    DEFAULT: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    full: '9999px',
  },
  spacing: {
    base: '8px',
    xs: '4px',
    sm: '12px',
    md: '24px',
    lg: '40px',
    xl: '64px',
    containerPadding: '24px',
    gutter: '20px',
  },
  shadows: {
    card: '0px 8px 24px rgba(0, 0, 0, 0.04)',
    floating: '0px 12px 32px rgba(0, 0, 0, 0.08)',
  },
  maxWidth: '1040px',
} as const;

export type Theme = typeof theme;
export default theme;
