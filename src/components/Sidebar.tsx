import { useState, useEffect } from 'react';
import { PenLine, BookMarked, CalendarCheck, LogIn, LogOut, Target, Pencil, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/api';

interface SidebarProps {
  reportCount: number;
  attendance: { done: number; total: number };
  streakWeeks: number;
  monthKey: string; // yyyy-mm，用于本月目标存储
  onNewReport: () => void;
}

// 统一的卡片头部：小圆角方块图标 + 标题（以「本月目标」样式为准）
function CardHead({ icon, title, right }: { icon: React.ReactNode; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center" style={{ gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)' }}>
      <div className="rounded-[10px] flex items-center justify-center flex-shrink-0"
        style={{ width: 28, height: 28, background: 'rgba(201, 141, 136, 0.16)' }}>
        {icon}
      </div>
      <span className="text-[13px] font-semibold tracking-cn flex-1" style={{ color: '#7D736A' }}>{title}</span>
      {right}
    </div>
  );
}

export default function Sidebar({ reportCount, attendance, streakWeeks, monthKey, onNewReport }: SidebarProps) {
  const { user, logout, openLoginModal, showToast } = useAuth();

  const [goal, setGoal] = useState('');
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState('');
  const [savingGoal, setSavingGoal] = useState(false);

  const goalSettingKey = `goal_${monthKey}`;

  useEffect(() => {
    let alive = true;
    apiRequest('GET', `/settings/${encodeURIComponent(goalSettingKey)}`)
      .then((res: any) => { if (alive) setGoal(res?.value || ''); })
      .catch(() => {});
    return () => { alive = false; };
  }, [goalSettingKey]);

  const startEditGoal = () => {
    setGoalDraft(goal);
    setEditingGoal(true);
  };

  const saveGoal = async () => {
    setSavingGoal(true);
    try {
      await apiRequest('PUT', `/settings/${encodeURIComponent(goalSettingKey)}`, { value: goalDraft.trim() });
      setGoal(goalDraft.trim());
      setEditingGoal(false);
      showToast('本月目标已更新', 'success');
    } catch (e: any) {
      showToast(e.message || '保存失败', 'error');
    } finally {
      setSavingGoal(false);
    }
  };

  const cardStyle = (bg: string) => ({ background: bg, padding: 'var(--sp-4) var(--sp-5)', borderRadius: 16 });

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

      {/* 统计卡片 —— 三张卡格式统一 */}
      <div className="stack-3">
        {/* 累计周记 */}
        <div style={cardStyle('rgba(247, 218, 217, 0.3)')}>
          <CardHead icon={<BookMarked size={15} style={{ color: '#C98D88' }} />} title="累计周记" />
          <p className="font-serif-art font-bold" style={{ color: '#B27A75', fontSize: 22, lineHeight: 1.2 }}>
            {reportCount}<span className="text-[13px] font-normal" style={{ color: '#B6ADA3', marginLeft: 4 }}>篇</span>
          </p>
        </div>

        {/* 本月出勤（含已坚持周数小字） */}
        <div style={cardStyle('rgba(247, 218, 217, 0.3)')}>
          <CardHead icon={<CalendarCheck size={15} style={{ color: '#C98D88' }} />} title="本月出勤" />
          <p className="font-serif-art font-bold" style={{ color: '#B27A75', fontSize: 22, lineHeight: 1.2 }}>
            {attendance.done}<span className="text-[13px] font-normal" style={{ color: '#B6ADA3', marginLeft: 4 }}>/ {attendance.total} 天</span>
          </p>
          {streakWeeks > 0 && (
            <p className="text-[12px] tracking-cn" style={{ color: '#B6ADA3', marginTop: 6 }}>
              已坚持记录 <span style={{ color: '#C98D88', fontWeight: 600 }}>{streakWeeks}</span> 周
            </p>
          )}
        </div>

        {/* 本月目标 */}
        <div style={cardStyle('rgba(247, 218, 217, 0.3)')}>
          <CardHead
            icon={<Target size={15} style={{ color: '#C98D88' }} />}
            title="本月目标"
            right={user && !editingGoal ? (
              <button
                onClick={startEditGoal}
                className="p-1 rounded-lg transition-all hover:bg-[rgba(247,218,217,0.7)]"
                style={{ color: '#C4B4A2' }}
                title="编辑本月目标"
              >
                <Pencil size={13} />
              </button>
            ) : undefined}
          />

          {editingGoal ? (
            <div>
              <textarea
                value={goalDraft}
                onChange={(e) => setGoalDraft(e.target.value)}
                placeholder="写下这个月想达成的目标…"
                rows={3}
                maxLength={200}
                autoFocus
                className="input-soft w-full outline-none resize-none tracking-cn"
                style={{ backgroundColor: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(214,210,196,0.9)', color: '#514A43', borderRadius: 12, padding: '9px 12px', fontSize: 13, lineHeight: 1.7 }}
              />
              <div className="flex justify-end items-center" style={{ gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
                <button onClick={() => setEditingGoal(false)} className="flex items-center gap-1 text-[12px] px-2.5 py-1 rounded-lg tracking-cn transition-all hover:bg-[rgba(214,210,196,0.4)]" style={{ color: '#968C83' }}>
                  <X size={13} /> 取消
                </button>
                <button onClick={saveGoal} disabled={savingGoal} className="btn btn-primary tracking-cn disabled:opacity-50" style={{ padding: '5px 12px', borderRadius: 9, fontSize: 12 }}>
                  <Check size={13} /> 保存
                </button>
              </div>
            </div>
          ) : goal ? (
            <p className="text-[14px] tracking-cn" style={{ color: '#6D635B', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {goal}
            </p>
          ) : user ? (
            <button onClick={startEditGoal} className="text-[13px] tracking-cn transition-all hover:opacity-70" style={{ color: '#B6ADA3' }}>
              + 点此设定本月目标
            </button>
          ) : (
            <p className="text-[13px] tracking-cn" style={{ color: '#B6ADA3' }}>暂未设定</p>
          )}
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
