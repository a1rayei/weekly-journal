import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import LoginModal from './components/LoginModal';
import Toast from './components/Toast';
import ReportList from './pages/ReportList';
import ReportEditor from './pages/ReportEditor';
import ReportDetail from './pages/ReportDetail';
import CalendarView from './pages/CalendarView';

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F3ED' }}>
        <div className="animate-pulse text-[#B5A595]">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F3ED' }}>
      <Header />
      <main className="max-w-3xl mx-auto px-5 py-8">
        <Routes>
          <Route path="/" element={<ReportList />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/new" element={<ReportEditor />} />
          <Route path="/edit/:id" element={<ReportEditor />} />
          <Route path="/report/:id" element={<ReportDetail />} />
          <Route path="/share/:token" element={<ReportDetail />} />
        </Routes>
      </main>
      <LoginModal />
      <Toast />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
