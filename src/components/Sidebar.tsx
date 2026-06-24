import { useState, useEffect } from 'react';
import { PenLine, BookMarked, CalendarCheck, LogIn, LogOut, Target, Pencil, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/api';

interface SidebarProps {
  reportCount: number;
  attendance: { done: number; total: number };
  monthKey: string; // yyyy-mm，用于本月目标存储
  onNewReport: () => void;
}

export default function Sidebar({ reportCount, attendance, monthKey, onNewReport }: SidebarProps) {
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
    if (!user) { openLoginModal(() => { setGoalDraft(goal); setEditingGoal(true); }); return; }
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

        {/* 本月目标 */}
        <div className="rounded-[16px]" style={{ background: 'rgba(247, 218, 217, 0.22)', padding: 'var(--sp-4)' }}>
          <div className="flex items-center" style={{ gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)' }}>
            <div className="rounded-[10px] flex items-center justify-center flex-shrink-0"
              style={{ width: 26, height: 26, background: 'rgba(201, 141, 136, 0.16)' }}>
              <Target size={14} style={{ color: '#C98D88' }} />
            </div>
            <span className="text-[12px] tracking-cn flex-1" style={{ color: '#968C83' }}>本月目标</span>
            {!editingGoal && (
              <button
                onClick={startEditGoal}
                className="p-1 rounded-lg transition-all hover:bg-[rgba(247,218,217,0.7)]"
                style={{ color: '#C4B4A2' }}
                title="编辑本月目标"
              >
                <Pencil size={13} />
              </button>
            )}
          </div>

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
            <p className="text-[13px] tracking-cn" style={{ color: '#6D635B', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {goal}
            </p>
          ) : (
            <button onClick={startEditGoal} className="text-[12.5px] tracking-cn transition-all hover:opacity-70" style={{ color: '#B6ADA3' }}>
              + 点此设定本月目标
            </button>
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
