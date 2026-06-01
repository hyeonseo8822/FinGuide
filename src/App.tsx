import { Routes, Route } from 'react-router-dom';
import InvestmentPreferencePage from './pages/InvestmentPreferencePage';
import ELSPage from './pages/ELSPage';
import QuizPage from './pages/QuizPage';

// 라우트 구조
// /            → ELS 실험 (메인 랜딩)
// /preference  → 나의 투자 성향 찾기 (OX 퀴즈)
// /quiz        → OX 퀴즈
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ELSPage />} />
      <Route path="/preference" element={<InvestmentPreferencePage />} />
      <Route path="/quiz" element={<QuizPage />} />
    </Routes>
  );
}
