import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ELSPage from './pages/ELSPage';
import ETFPage from './pages/ETFPage';
import QuizPage from './pages/QuizPage';
import StockPage from './pages/StockPage';

// 앱 라우트 정의
// 각 페이지는 PageLayout으로 감싸져 헤더/푸터를 공유
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/els" element={<ELSPage />} />
      <Route path="/etf" element={<ETFPage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/stock" element={<StockPage />} />
    </Routes>
  );
}
