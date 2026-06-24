import { PenLine, BookMarked, CalendarCheck, LogIn, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  reportCount: number;
  attendance: { done: number; total: number };
  onNewReport: () => void;
}

export default function Sidebar({ reportCount, attendance, onNewReport }: SidebarProps) {
  const { user, logout, openLoginModal } = useAuth();

  return (
    <aside className="glass rounded-[28px] px-6 py-8 fade-up" style={{ alignSelf: 'start' }}>
      {/* 头像 */}
      <div className="flex flex-col items-center text-center">
        <div
          className="w-[72px] h-[72px] rounded-full flex items-center justify-center mb-4"
          style={{
            background: 'linear-gradient(135deg, #F7DAD9 0%, #EFC3C0 100%)',
            boxShadow: '0 8px 22px rgba(201, 141, 136, 0.28)',
          }}
        >
          <span className="font-serif-art text-[30px] font-bold leading-none" style={{ color: '#B27A75' }}>R</span>
        </div>

        {/* 名字 */}
        <h1 className="font-serif-art text-[26px] font-bold mb-3" style={{ color: '#514A43', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
          rei
        </h1>

        {/* slogan */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full" style={{ background: 'rgba(247, 218, 217, 0.5)' }}>
          <Sparkles size={13} style={{ color: '#C98D88' }} />
          <span className="text-[13px] font-medium whitespace-nowrap" style={{ color: '#B27A75' }}>rei 努力学习中</span>
        </div>
      </div>

      <div className="my-7 h-px" style={{ background: 'rgba(214, 210, 196, 0.8)' }} />

      {/* 统计 */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-3 px-4 py-4 rounded-2xl" style={{ background: 'rgba(247, 218, 217, 0.32)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(201, 141, 136, 0.16)' }}>
            <BookMarked size={18} style={{ color: '#C98D88' }} />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] mb-0.5" style={{ color: '#968C83' }}>累计周记</p>
            <p className="font-serif-art font-bold" style={{ color: '#B27A75', fontSize: 22, lineHeight: 1.3 }}>
              {reportCount} <span className="text-[13px] font-normal" style={{ color: '#B6ADA3' }}>篇</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-4 rounded-2xl" style={{ background: 'rgba(214, 210, 196, 0.28)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(150, 140, 131, 0.16)' }}>
            <CalendarCheck size={18} style={{ color: '#968C83' }} />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] mb-0.5" style={{ color: '#968C83' }}>本月出勤</p>
            <p className="font-serif-art font-bold" style={{ color: '#7D736A', fontSize: 22, lineHeight: 1.3 }}>
              {attendance.done} <span className="text-[13px] font-normal" style={{ color: '#B6ADA3' }}>/ {attendance.total} 天</span>
            </p>
          </div>
        </div>
      </div>

      {/* 写周记按钮 */}
      <button
        onClick={onNewReport}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[15px] font-semibold text-white transition-all hover:opacity-92 mt-7"
        style={{
          background: 'linear-gradient(135deg, #D49994 0%, #B27A75 100%)',
          boxShadow: '0 8px 20px rgba(178, 122, 117, 0.3)',
        }}
      >
        <PenLine size={17} />
        写周记
      </button>

      {/* 登录状态 */}
      <div className="mt-4 flex items-center justify-center">
        {user ? (
          <button onClick={logout} className="flex items-center gap-1.5 text-[12.5px] transition-all hover:opacity-70" style={{ color: '#B6ADA3' }}>
            <LogOut size={13} /> 退出作者登录
          </button>
        ) : (
          <button onClick={() => openLoginModal()} className="flex items-center gap-1.5 text-[12.5px] transition-all hover:opacity-70" style={{ color: '#B6ADA3' }}>
            <LogIn size={13} /> 作者登录
          </button>
        )}
      </div>
    </aside>
  );
}
