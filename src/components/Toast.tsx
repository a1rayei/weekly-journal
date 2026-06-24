import { useAuth } from '../contexts/AuthContext';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

export default function Toast() {
  const { toast } = useAuth();
  if (!toast) return null;

  const config = {
    success: { icon: CheckCircle2, color: '#D98E5F', bg: '#FBF3EC', border: '#F0DCC9' },
    error: { icon: XCircle, color: '#C0563E', bg: '#FBEEEA', border: '#F0CFC6' },
    info: { icon: Info, color: '#9E8E7E', bg: '#F7F3ED', border: '#E8E0D5' },
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
          boxShadow: '0 8px 28px rgba(120, 90, 60, 0.14)',
        }}
      >
        <Icon size={18} style={{ color: config.color }} />
        <span className="text-sm font-medium" style={{ color: '#4A3B33' }}>
          {toast.message}
        </span>
      </div>
    </div>
  );
}
