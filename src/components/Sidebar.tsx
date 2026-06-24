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
    <aside className="glass rounded-[28px] p-7 flex flex-col fade-up" style={{ minHeight: '100%' }}>
      {/* 头像 */}
      <div className="flex flex-col items-center text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          style={{
            background: 'linear-gradient(135deg, #F6D9C2 0%, #EAB78E 100%)',
            boxShadow: '0 8px 24px rgba(217, 146, 94, 0.28)',
          }}
        >
          <span className="font-serif-art text-[30px] font-bold" style={{ color: '#8A5A3C' }}>R</span>
        </div>

        {/* 名字 — 放大加粗 */}
        <h1 className="font-serif-art text-[26px] font-bold leading-none mb-2.5" style={{ color: '#3A2E28', letterSpacing: '-0.01em' }}>
          rei
        </h1>

        {/* slogan */}
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full" style={{ background: 'rgba(244, 231, 218, 0.7)' }}>
          <Sparkles size={13} style={{ color: '#C9956A' }} />
          <span className="text-[13.5px] font-medium" style={{ color: '#A56B43' }}>rei 努力学习中</span>
        </div>
      </div>

      <div className="my-6 h-px" style={{ background: 'rgba(231, 223, 212, 0.8)' }} />

      {/* 统计 */}
      <div className="space-y-3">
        <div
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
          style={{ background: 'rgba(244, 231, 218, 0.55)' }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(217, 146, 94, 0.18)' }}>
            <BookMarked size={17} style={{ color: '#C9956A' }} />
          </div>
          <div>
            <p className="text-[12px]" style={{ color: '#9C8C7C' }}>累计周记</p>
            <p className="font-serif-art text-[19px] font-bold leading-tight" style={{ color: '#B06B3E' }}>
              {reportCount} <span className="text-[13px] font-normal" style={{ color: '#B7A693' }}>篇</span>
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
          style={{ background: 'rgba(241, 236, 229, 0.6)' }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(156, 140, 124, 0.15)' }}>
            <CalendarCheck size={17} style={{ color: '#9C8C7C' }} />
          </div>
          <div>
            <p className="text-[12px]" style={{ color: '#9C8C7C' }}>本月出勤</p>
            <p className="font-serif-art text-[19px] font-bold leading-tight" style={{ color: '#6B5D54' }}>
              {attendance.done} <span className="text-[13px] font-normal" style={{ color: '#B7A693' }}>/ {attendance.total} 天</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1" />

      {/* 写周报按钮 */}
      <button
        onClick={onNewReport}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[15px] font-semibold text-white transition-all hover:opacity-92 mt-6"
        style={{
          background: 'linear-gradient(135deg, #D49263 0%, #B06B3E 100%)',
          boxShadow: '0 8px 22px rgba(176, 107, 62, 0.32)',
        }}
      >
        <PenLine size={17} />
        写周记
      </button>

      {/* 登录状态 */}
      <div className="mt-3 flex items-center justify-center">
        {user ? (
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-[12.5px] transition-all hover:opacity-70"
            style={{ color: '#B7A693' }}
          >
            <LogOut size={13} /> 退出作者登录
          </button>
        ) : (
          <button
            onClick={() => openLoginModal()}
            className="flex items-center gap-1.5 text-[12.5px] transition-all hover:opacity-70"
            style={{ color: '#B7A693' }}
          >
            <LogIn size={13} /> 作者登录
          </button>
        )}
      </div>
    </aside>
  );
}
