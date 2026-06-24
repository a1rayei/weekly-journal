import { useState, useEffect } from 'react';
import { Calendar as CalIcon, Tag, Edit3, Trash2, Share2, X, Save, Bold, Italic, List, Hash, FileX } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import CommentSection from './CommentSection';

interface ReportPanelProps {
  weekStart: string;       // 选中周的周一 yyyy-mm-dd
  weekEnd: string;         // 周五
  reportId: string | null; // 该周已有周报id；null 表示无
  forceEdit?: boolean;     // 直接进入编辑/新建态
  onClose: () => void;
  onChanged: () => void;   // 周报增删改后通知父组件刷新
}

const fmtCN = (s: string) => {
  const d = new Date(s);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};

export default function ReportPanel({ weekStart, weekEnd, reportId, forceEdit, onClose, onChanged }: ReportPanelProps) {
  const { user, openLoginModal, showToast } = useAuth();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // 编辑态字段
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [commentEnabled, setCommentEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, [reportId, weekStart]);

  const load = async () => {
    setLoading(true);
    try {
      if (reportId) {
        const data = await apiRequest('GET', `/reports/${reportId}`);
        setReport(data);
        setTitle(data.title || '');
        setContent(data.content || '');
        const t = data.tags;
        setTags(Array.isArray(t) ? t.join(', ') : (t || ''));
        setCommentEnabled(data.comment_enabled !== false && data.comment_enabled !== 0);
        setEditing(!!forceEdit);
      } else {
        setReport(null);
        setTitle('');
        setContent('');
        setTags('');
        setCommentEnabled(true);
        // 无周报：作者直接进入新建态，访客只看空状态
        setEditing(!!user);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = () => {
    if (!user) { openLoginModal(() => setEditing(true)); return; }
    setEditing(true);
  };

  const handleSave = async () => {
    if (!user) { openLoginModal(() => {}); return; }
    if (!title.trim() || !content.trim()) {
      showToast('请填写标题和内容', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title,
        content,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean).join(','),
        week_start: weekStart,
        week_end: weekEnd,
        comment_enabled: commentEnabled,
      };
      if (reportId) {
        await apiRequest('PUT', `/reports/${reportId}`, payload);
        showToast('周记已更新', 'success');
      } else {
        await apiRequest('POST', '/reports', payload);
        showToast('周记已发布', 'success');
      }
      setEditing(false);
      onChanged();
    } catch (e: any) {
      showToast(e.message || '保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!reportId) return;
    if (!confirm('确定删除这篇周记吗？评论会一并清除。')) return;
    try {
      await apiRequest('DELETE', `/reports/${reportId}`);
      showToast('周记已删除', 'success');
      onChanged();
    } catch (e: any) {
      showToast(e.message || '删除失败', 'error');
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}#week=${weekStart}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('链接已复制，可分享给他人查看', 'success');
    } catch {
      showToast('复制失败，请手动复制', 'error');
    }
  };

  const insertMarkdown = (prefix: string) => {
    const ta = document.getElementById('panel-content') as HTMLTextAreaElement;
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = content.substring(s, e);
    setContent(content.substring(0, s) + prefix + sel + prefix + content.substring(e));
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + prefix.length, s + prefix.length + sel.length); }, 0);
  };

  const renderContent = (c: string) =>
    c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*)$/gm, '<li>$1</li>')
      .replace(/\n/g, '<br/>');

  const normalizeTags = (t: any): string[] => Array.isArray(t) ? t : (t ? String(t).split(',').filter(Boolean) : []);
  const inputStyle = { backgroundColor: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(231,223,212,0.9)', color: '#3A2E28' };

  if (loading) {
    return (
      <div className="glass rounded-[24px] p-8 expand-in text-center" style={{ color: '#B7A693' }}>
        加载中…
      </div>
    );
  }

  // ===== 编辑/新建态 =====
  if (editing) {
    return (
      <div className="glass-strong rounded-[24px] p-6 sm:p-7 expand-in">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(244,231,218,0.7)' }}>
            <CalIcon size={14} style={{ color: '#B06B3E' }} />
            <span className="text-[13px] font-bold" style={{ color: '#B06B3E' }}>{fmtCN(weekStart)} – {fmtCN(weekEnd)}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl transition-all hover:bg-[rgba(244,231,218,0.7)]" style={{ color: '#B7A693' }}>
            <X size={18} />
          </button>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="本周标题，例如：第 25 周 · 项目攻坚周"
          className="input-soft w-full px-4 py-3 rounded-2xl text-[18px] font-bold font-serif-art outline-none mb-4"
          style={inputStyle}
        />

        <div className="relative mb-4">
          <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#C4B4A2' }} />
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="标签，逗号分隔（如：项目A, 复盘）"
            className="input-soft w-full pl-9 pr-4 py-2.5 rounded-2xl text-[14px] outline-none"
            style={inputStyle}
          />
        </div>

        <div className="flex items-center gap-1 mb-2">
          <button onClick={() => insertMarkdown('**')} className="p-1.5 rounded-lg transition-all hover:bg-[rgba(244,231,218,0.7)]" style={{ color: '#9C8C7C' }} title="加粗"><Bold size={15} /></button>
          <button onClick={() => insertMarkdown('*')} className="p-1.5 rounded-lg transition-all hover:bg-[rgba(244,231,218,0.7)]" style={{ color: '#9C8C7C' }} title="斜体"><Italic size={15} /></button>
          <button onClick={() => insertMarkdown('- ')} className="p-1.5 rounded-lg transition-all hover:bg-[rgba(244,231,218,0.7)]" style={{ color: '#9C8C7C' }} title="列表"><List size={15} /></button>
        </div>

        <textarea
          id="panel-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={'本周完成：\n\n下周计划：\n\n遇到的问题：\n\n需要支持：'}
          rows={12}
          className="input-soft w-full px-4 py-3.5 rounded-2xl text-[15px] outline-none resize-none mb-4"
          style={{ ...inputStyle, lineHeight: 1.9 }}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-[13px] cursor-pointer" style={{ color: '#9C8C7C' }}>
            <input type="checkbox" checked={commentEnabled} onChange={(e) => setCommentEnabled(e.target.checked)} style={{ accentColor: '#C9956A' }} />
            允许跟帖评论
          </label>
          <div className="flex items-center gap-2">
            {reportId && (
              <button onClick={() => { setEditing(false); load(); }} className="px-4 py-2.5 text-[14px] transition-all" style={{ color: '#9C8C7C' }}>
                取消
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[14px] font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #D49263 0%, #B06B3E 100%)', boxShadow: '0 6px 18px rgba(176,107,62,0.3)' }}
            >
              <Save size={16} />
              {saving ? '保存中…' : '发布'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== 无周报空状态（访客） =====
  if (!reportId) {
    return (
      <div className="glass rounded-[24px] p-10 expand-in text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(244,231,218,0.7)' }}>
          <FileX size={26} style={{ color: '#C9956A' }} />
        </div>
        <p className="text-[15px] mb-1" style={{ color: '#6B5D54', fontWeight: 500 }}>这一周还没有周记</p>
        <p className="text-[13px] mb-5" style={{ color: '#B7A693' }}>{fmtCN(weekStart)} – {fmtCN(weekEnd)}</p>
        <button onClick={startEdit} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-[13.5px] font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #D49263 0%, #B06B3E 100%)' }}>
          <Edit3 size={15} /> 写这周的周记
        </button>
        <button onClick={onClose} className="block mx-auto mt-3 text-[12.5px]" style={{ color: '#B7A693' }}>收起</button>
      </div>
    );
  }

  // ===== 查看态 =====
  const tagList = normalizeTags(report?.tags);
  return (
    <div className="expand-in space-y-4">
      <article className="glass-strong rounded-[24px] p-6 sm:p-8">
        {/* 顶部：日期 + 操作 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13.5px] font-bold" style={{ background: 'rgba(244,231,218,0.85)', color: '#B06B3E' }}>
              <CalIcon size={14} />
              {fmtCN(report.week_start)} – {fmtCN(report.week_end)}
            </span>
            {tagList.map((t) => (
              <span key={t} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px]" style={{ background: 'rgba(241,236,229,0.8)', color: '#9C8C7C' }}>
                <Tag size={10} />{t}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button onClick={handleShare} className="p-2 rounded-xl transition-all hover:bg-[rgba(244,231,218,0.7)]" style={{ color: '#9C8C7C' }} title="分享">
              <Share2 size={16} />
            </button>
            {user && (
              <>
                <button onClick={startEdit} className="p-2 rounded-xl transition-all hover:bg-[rgba(244,231,218,0.7)]" style={{ color: '#9C8C7C' }} title="编辑">
                  <Edit3 size={16} />
                </button>
                <button onClick={handleDelete} className="p-2 rounded-xl transition-all hover:bg-[rgba(251,238,234,0.9)]" style={{ color: '#C49A8E' }} title="删除">
                  <Trash2 size={16} />
                </button>
              </>
            )}
            <button onClick={onClose} className="p-2 rounded-xl transition-all hover:bg-[rgba(244,231,218,0.7)]" style={{ color: '#B7A693' }} title="收起">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 标题 — 大字号衬线 */}
        <h1 className="font-serif-art text-[26px] sm:text-[30px] font-bold leading-tight mb-5" style={{ color: '#3A2E28', letterSpacing: '-0.02em' }}>
          {report.title}
        </h1>
        <div className="w-12 h-1 rounded-full mb-6" style={{ background: 'linear-gradient(90deg, #E0A86E, #F4E7DA)' }} />

        <div className="prose-art" dangerouslySetInnerHTML={{ __html: renderContent(report.content) }} />
      </article>

      <div className="glass rounded-[24px] p-6">
        <CommentSection reportId={report.id} commentEnabled={commentEnabled} isAuthor={!!user} />
      </div>
    </div>
  );
}
