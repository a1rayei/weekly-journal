import { useAuth } from '../contexts/AuthContext';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

export default function Toast() {
  const { toast } = useAuth();
  if (!toast) return null;

  const config = {
    success: { icon: CheckCircle2, color: '#B27A75', bg: '#FCEAE9', border: '#F0CFC6' },
    error: { icon: XCircle, color: '#C0563E', bg: '#FBEEEA', border: '#F0CFC6' },
    info: { icon: Info, color: '#968C83', bg: '#FFF5EA', border: '#D6D2C4' },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] toast-enter"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-lg backdrop-blur-sm"
        style={{
          backgroundColor: config.bg,
          border: `1px solid ${config.border}`,
          boxShadow: '0 8px 28px rgba(150, 140, 131, 0.16)',
        }}
      >
        <Icon size={18} style={{ color: config.color }} />
        <span className="text-sm font-medium" style={{ color: '#514A43' }}>
          {toast.message}
        </span>
      </div>
    </div>
  );
}
