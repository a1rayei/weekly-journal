import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import LoginModal from './components/LoginModal';
import Toast from './components/Toast';

function App() {
  return (
    <AuthProvider>
      <div className="aurora">
        <div className="aurora-extra" />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Dashboard />
        <LoginModal />
        <Toast />
      </div>
    </AuthProvider>
  );
}

export default App;
