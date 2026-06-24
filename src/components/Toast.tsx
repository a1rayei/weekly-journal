import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

export default function Toast() {
  const { toast } = useAuth();
  if (!toast) return null;

  const config = {
    success: { icon: CheckCircle2, color: '#B27A75', bg: 'rgba(252,234,233,0.95)', border: '#F0CFC6' },
    error: { icon: XCircle, color: '#C0563E', bg: 'rgba(251,238,234,0.95)', border: '#F0CFC6' },
    info: { icon: Info, color: '#968C83', bg: 'rgba(255,245,234,0.95)', border: '#D6D2C4' },
  }[toast.type];

  const Icon = config.icon;

  return createPortal(
    <div
      className="toast-enter"
      style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1100,
        pointerEvents: 'none',
      }}
    >
      <div
        className="flex items-center"
        style={{
          gap: 10,
          padding: '14px 22px',
          borderRadius: 18,
          backgroundColor: config.bg,
          border: `1px solid ${config.border}`,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 12px 40px rgba(150, 140, 131, 0.22)',
        }}
      >
        <Icon size={19} style={{ color: config.color }} />
        <span className="text-[14px] font-medium tracking-cn" style={{ color: '#514A43' }}>
          {toast.message}
        </span>
      </div>
    </div>,
    document.body
  );
}
