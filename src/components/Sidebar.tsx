import { PenLine, BookMarked, CalendarCheck, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  reportCount: number;
  attendance: { done: number; total: number };
  onNewReport: () => void;
}

export default function Sidebar({ reportCount, attendance, onNewReport }: SidebarProps) {
  const { user, logout, openLoginModal } = useAuth();

  return (
    <aside className="glass rounded-[28px] fade-up" style={{ alignSelf: 'start', padding: 'var(--sp-6)' }}>
      {/* 头像区 */}
      <div className="flex flex-col items-center text-center">
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: 76, height: 76,
            background: 'linear-gradient(135deg, #FCEAE9 0%, #F7DAD9 100%)',
            boxShadow: '0 6px 18px rgba(201, 141, 136, 0.22)',
            marginBottom: 'var(--sp-4)',
          }}
        >
          <span style={{ fontSize: 40, lineHeight: 1 }}>🐨</span>
        </div>

        <h1 className="font-serif-art font-bold tracking-cn-tight"
          style={{ color: '#514A43', fontSize: 26, lineHeight: 1.25, marginBottom: 'var(--sp-3)' }}>
          rei
        </h1>

        <div className="inline-flex items-center rounded-full"
          style={{ background: 'rgba(247, 218, 217, 0.5)', padding: '6px 14px', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C98D88', flexShrink: 0 }} />
          <span className="text-[13px] font-medium tracking-cn whitespace-nowrap" style={{ color: '#B27A75' }}>
            rei 努力学习中
          </span>
        </div>
      </div>

      {/* 分隔 */}
      <div style={{ height: 1, background: 'rgba(214, 210, 196, 0.7)', margin: 'var(--sp-6) 0' }} />

      {/* 统计 */}
      <div className="stack-3">
        <div className="flex items-center rounded-[16px]"
          style={{ background: 'rgba(247, 218, 217, 0.3)', padding: 'var(--sp-4)', gap: 'var(--sp-3)' }}>
          <div className="rounded-[12px] flex items-center justify-center flex-shrink-0"
            style={{ width: 40, height: 40, background: 'rgba(201, 141, 136, 0.16)' }}>
            <BookMarked size={18} style={{ color: '#C98D88' }} />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] tracking-cn" style={{ color: '#968C83', marginBottom: 2 }}>累计周记</p>
            <p className="font-serif-art font-bold" style={{ color: '#B27A75', fontSize: 21, lineHeight: 1.2 }}>
              {reportCount}<span className="text-[13px] font-normal" style={{ color: '#B6ADA3', marginLeft: 3 }}>篇</span>
            </p>
          </div>
        </div>

        <div className="flex items-center rounded-[16px]"
          style={{ background: 'rgba(214, 210, 196, 0.28)', padding: 'var(--sp-4)', gap: 'var(--sp-3)' }}>
          <div className="rounded-[12px] flex items-center justify-center flex-shrink-0"
            style={{ width: 40, height: 40, background: 'rgba(150, 140, 131, 0.16)' }}>
            <CalendarCheck size={18} style={{ color: '#968C83' }} />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] tracking-cn" style={{ color: '#968C83', marginBottom: 2 }}>本月出勤</p>
            <p className="font-serif-art font-bold" style={{ color: '#7D736A', fontSize: 21, lineHeight: 1.2 }}>
              {attendance.done}<span className="text-[13px] font-normal" style={{ color: '#B6ADA3', marginLeft: 3 }}>/ {attendance.total} 天</span>
            </p>
          </div>
        </div>
      </div>

      {/* 按钮区 */}
      <div className="stack-3" style={{ marginTop: 'var(--sp-6)' }}>
        <button
          onClick={onNewReport}
          className="btn btn-primary w-full tracking-cn"
          style={{ padding: '13px 0', borderRadius: 16, fontSize: 15 }}
        >
          <PenLine size={17} />
          写周记
        </button>

        {user ? (
          <button
            onClick={logout}
            className="btn btn-ghost w-full tracking-cn"
            style={{ padding: '11px 0', borderRadius: 16, fontSize: 13.5, fontWeight: 500 }}
          >
            <LogOut size={15} />
            退出登录
          </button>
        ) : (
          <button
            onClick={() => openLoginModal()}
            className="btn btn-ghost w-full tracking-cn"
            style={{ padding: '11px 0', borderRadius: 16, fontSize: 13.5, fontWeight: 500 }}
          >
            <LogIn size={15} />
            作者登录
          </button>
        )}
      </div>
    </aside>
  );
}
