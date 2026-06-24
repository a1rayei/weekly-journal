import { useState } from 'react';
import { createPortal } from 'react-dom';
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

  const inputStyle: React.CSSProperties = {
    backgroundColor: '#FFFAF3',
    border: '1.5px solid #D6D2C4',
    color: '#514A43',
  };

  return createPortal(
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        backgroundColor: 'rgba(81, 74, 67, 0.3)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={closeLoginModal}
    >
      <div
        className="modal-content relative"
        style={{
          width: '100%', maxWidth: 400, borderRadius: 28,
          padding: '40px 36px',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 24px 60px rgba(150, 140, 131, 0.22)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeLoginModal}
          className="absolute rounded-full transition-colors"
          style={{ right: 18, top: 18, padding: 7, color: '#B6ADA3' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#FFF5EA')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <X size={18} />
        </button>

        <div className="text-center" style={{ marginBottom: 32 }}>
          <div
            className="flex items-center justify-center mx-auto"
            style={{ width: 60, height: 60, borderRadius: 18, marginBottom: 18, background: 'linear-gradient(135deg, #F7DAD9 0%, #EFC3C0 100%)' }}
          >
            <PenLine size={26} style={{ color: '#B27A75' }} />
          </div>
          <h2 className="font-serif-art font-bold tracking-cn-tight" style={{ color: '#514A43', fontSize: 23, lineHeight: 1.3, marginBottom: 8 }}>
            作者登录
          </h2>
          <p className="text-[13px] tracking-cn" style={{ color: '#968C83', lineHeight: 1.6 }}>
            创建或编辑周记需要验证身份
          </p>
        </div>

        <form onSubmit={handleSubmit} className="stack-4">
          <div className="relative">
            <Mail size={17} className="absolute top-1/2 -translate-y-1/2" style={{ left: 15, color: '#B6ADA3' }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="邮箱地址"
              autoFocus
              className="input-soft w-full outline-none tracking-cn"
              style={{ ...inputStyle, padding: '13px 16px 13px 44px', borderRadius: 14, fontSize: 14 }}
              required
            />
          </div>

          <div className="relative">
            <Lock size={17} className="absolute top-1/2 -translate-y-1/2" style={{ left: 15, color: '#B6ADA3' }} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码"
              className="input-soft w-full outline-none tracking-cn"
              style={{ ...inputStyle, padding: '13px 16px 13px 44px', borderRadius: 14, fontSize: 14 }}
              required
            />
          </div>

          {error && (
            <div className="text-[13px] tracking-cn" style={{ color: '#C0563E', backgroundColor: '#FBEEEA', padding: '11px 16px', borderRadius: 14 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full tracking-cn disabled:opacity-60"
            style={{ padding: '13px 0', borderRadius: 14, fontSize: 14.5, marginTop: 4 }}
          >
            {loading ? '登录中…' : '登 录'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
