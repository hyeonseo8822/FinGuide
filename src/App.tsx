import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ELSPage from './pages/ELSPage';
import HomeLearningPage from './pages/HomeLearningPage';
import QuizPage from './pages/QuizPage';

// 라우트 구조
// /            → ELS 실험 (메인 랜딩)
// /preference  → 나의 투자 성향 찾기 (카드 게임)
// /quiz        → OX 퀴즈
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeLearningPage />} />
      <Route path="/els" element={<ELSPage />} />
      <Route path="/preference" element={<HomePage />} />
      <Route path="/quiz" element={<QuizPage />} />
    </Routes>
  );
}
