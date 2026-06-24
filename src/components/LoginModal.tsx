import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, X, PenLine } from 'lucide-react';

export default function LoginModal() {
  const { loginModalOpen, closeLoginModal, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!loginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 modal-backdrop"
      style={{ backgroundColor: 'rgba(60, 47, 47, 0.32)', backdropFilter: 'blur(3px)' }}
      onClick={closeLoginModal}
    >
      <div
        className="w-full max-w-[380px] bg-white rounded-3xl p-8 modal-content relative"
        style={{ boxShadow: '0 24px 60px rgba(120, 90, 60, 0.22)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeLoginModal}
          className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-[#F5F0E8] transition-colors"
          style={{ color: '#B5A595' }}
        >
          <X size={18} />
        </button>

        <div className="text-center mb-7">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #F6D9C2 0%, #EDB890 100%)' }}
          >
            <PenLine size={26} style={{ color: '#8A5A3C' }} />
          </div>
          <h2 className="text-[22px] font-bold mb-1.5" style={{ color: '#3C2F2F', letterSpacing: '-0.02em' }}>
            作者登录
          </h2>
          <p className="text-[13px]" style={{ color: '#A89684' }}>
            创建或编辑周报需要验证身份
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#C4B4A2' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="邮箱地址"
                autoFocus
                className="w-full pl-11 pr-3.5 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  backgroundColor: '#FAF7F2',
                  border: '1.5px solid #ECE3D8',
                  color: '#3C2F2F',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#E8A87C')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#ECE3D8')}
                required
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#C4B4A2' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="密码"
                className="w-full pl-11 pr-3.5 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  backgroundColor: '#FAF7F2',
                  border: '1.5px solid #ECE3D8',
                  color: '#3C2F2F',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#E8A87C')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#ECE3D8')}
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-[13px] px-3.5 py-2.5 rounded-xl" style={{ color: '#C0563E', backgroundColor: '#FBEEEA' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #C58A5E 0%, #A56B43 100%)' }}
          >
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>

        <p className="mt-5 text-[12px] text-center" style={{ color: '#C4B4A2' }}>
          演示账号 admin@weekly.local / admin123
        </p>
      </div>
    </div>
  );
}
