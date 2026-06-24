import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, FileText, LogOut, PenLine, LogIn } from 'lucide-react';

export default function Header() {
  const { user, logout, openLoginModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: '周报', icon: FileText },
    { path: '/calendar', label: '日历', icon: Calendar },
  ];

  const handleNewReport = () => {
    if (user) {
      navigate('/new');
    } else {
      openLoginModal(() => navigate('/new'));
    }
  };

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{ backgroundColor: 'rgba(247, 243, 237, 0.82)', borderBottom: '1px solid #ECE3D8' }}
    >
      <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-7">
          <Link to="/" className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #F6D9C2 0%, #EDB890 100%)' }}
            >
              <PenLine size={17} style={{ color: '#8A5A3C' }} />
            </span>
            <span className="font-serif text-[19px] font-bold tracking-tight" style={{ color: '#3A2E28' }}>
              周记本
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[14px] transition-all"
                  style={{
                    backgroundColor: isActive ? '#F6E5D6' : 'transparent',
                    color: isActive ? '#A56B43' : '#A89684',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  <Icon size={15} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleNewReport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #C58A5E 0%, #A56B43 100%)', boxShadow: '0 4px 14px rgba(165, 107, 67, 0.28)' }}
          >
            <PenLine size={15} />
            写周报
          </button>
          {user ? (
            <>
              <div className="h-5 w-px" style={{ backgroundColor: '#E4D3C0' }} />
              <span className="text-[13px]" style={{ color: '#A89684' }}>{user.name}</span>
              <button
                onClick={logout}
                className="p-2 rounded-lg transition-all hover:bg-[#F6E5D6]"
                style={{ color: '#A89684' }}
                title="退出"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={() => openLoginModal()}
              className="p-2 rounded-lg transition-all hover:bg-[#F6E5D6]"
              style={{ color: '#A89684' }}
              title="作者登录"
            >
              <LogIn size={17} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
