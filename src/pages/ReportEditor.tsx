import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Bold, Italic, List, Hash } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function ReportEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, openLoginModal, showToast } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [commentEnabled, setCommentEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);

  // 未登录拦截：弹出登录框，登录后留在本页，否则返回首页
  useEffect(() => {
    if (!user) {
      openLoginModal(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (id && user) {
      loadReport();
    }
  }, [id, user]);

  const loadReport = async () => {
    try {
      const data = await apiRequest('GET', `/reports/${id}`);
      setTitle(data.title || '');
      setContent(data.content || '');
      const t = data.tags;
      setTags(Array.isArray(t) ? t.join(', ') : (t || ''));
      setCommentEnabled(data.comment_enabled !== 0 && data.comment_enabled !== false);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeekRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    const format = (d: Date) => d.toISOString().split('T')[0];
    return { week_start: format(monday), week_end: format(friday) };
  };

  const handleSave = async () => {
    if (!user) {
      openLoginModal(() => {});
      return;
    }
    if (!title.trim() || !content.trim()) {
      showToast('请填写标题和内容', 'error');
      return;
    }

    setSaving(true);
    try {
      const { week_start, week_end } = getWeekRange();
      const payload = {
        title,
        content,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean).join(','),
        week_start,
        week_end,
        comment_enabled: commentEnabled,
      };

      if (id) {
        await apiRequest('PUT', `/reports/${id}`, payload);
        showToast('周记已更新', 'success');
      } else {
        await apiRequest('POST', '/reports', payload);
        showToast('周记已发布', 'success');
      }
      navigate('/');
    } catch (err: any) {
      showToast(err.message || '保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  const insertMarkdown = (prefix: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);
    const newText = selectedText ? `${prefix}${selectedText}${prefix}` : prefix;
    setContent(beforeText + newText + afterText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText ? selectedText.length : 0));
    }, 0);
  };

  // 未登录时显示提示遮罩（登录框已弹出）
  if (!user) {
    return (
      <div className="text-center py-24 fade-up">
        <p className="text-[15px] mb-3" style={{ color: '#6B5D54' }}>创建周记需要先登录</p>
        <button
          onClick={() => navigate('/')}
          className="text-[13px]" style={{ color: '#B06B3E' }}
        >
          ← 返回列表
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-24 text-[#B5A595] animate-pulse">加载中...</div>;
  }

  const inputStyle = { backgroundColor: '#FAF7F2', border: '1.5px solid #ECE3D8', color: '#3A2E28' };

  return (
    <div className="space-y-6 fade-up">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-[13px] px-3 py-2 rounded-lg transition-all hover:bg-[#F6E5D6]"
          style={{ color: '#A89684' }}
        >
          <ArrowLeft size={16} />
          返回
        </button>
        <h1 className="font-serif text-[26px] font-bold" style={{ color: '#3A2E28' }}>
          {id ? '编辑周记' : '写一篇周记'}
        </h1>
      </div>

      <div className="bg-white rounded-3xl p-7 space-y-5" style={{ border: '1.5px solid #F0E8DD' }}>
        <div>
          <label className="block text-[13px] font-semibold mb-2" style={{ color: '#6B5D54' }}>标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：第 25 周 · 项目攻坚周"
            className="input-soft w-full px-4 py-3 rounded-xl text-[16px] font-semibold outline-none"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-[13px] font-semibold mb-2" style={{ color: '#6B5D54' }}>标签</label>
          <div className="relative">
            <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#C4B4A2' }} />
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="项目A, 前端开发, 复盘（逗号分隔）"
              className="input-soft w-full pl-9 pr-4 py-3 rounded-xl text-[14px] outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[13px] font-semibold" style={{ color: '#6B5D54' }}>内容</label>
            <div className="flex items-center gap-1">
              <button onClick={() => insertMarkdown('**')} className="p-1.5 rounded transition-all hover:bg-[#F6E5D6]" style={{ color: '#A89684' }} title="加粗">
                <Bold size={14} />
              </button>
              <button onClick={() => insertMarkdown('*')} className="p-1.5 rounded transition-all hover:bg-[#F6E5D6]" style={{ color: '#A89684' }} title="斜体">
                <Italic size={14} />
              </button>
              <button onClick={() => insertMarkdown('- ')} className="p-1.5 rounded transition-all hover:bg-[#F6E5D6]" style={{ color: '#A89684' }} title="列表">
                <List size={14} />
              </button>
            </div>
          </div>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={'本周完成：\n\n下周计划：\n\n遇到的问题：\n\n需要支持：'}
            rows={16}
            className="input-soft w-full px-4 py-3.5 rounded-xl text-[15px] outline-none resize-none"
            style={{ ...inputStyle, lineHeight: 1.9 }}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="commentEnabled"
            checked={commentEnabled}
            onChange={(e) => setCommentEnabled(e.target.checked)}
            className="rounded"
            style={{ accentColor: '#C58A5E' }}
          />
          <label htmlFor="commentEnabled" className="text-[13px]" style={{ color: '#A89684' }}>允许他人跟帖评论</label>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2.5 text-[14px] transition-all"
            style={{ color: '#A89684' }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #C58A5E 0%, #A56B43 100%)', boxShadow: '0 4px 14px rgba(165, 107, 67, 0.28)' }}
          >
            <Save size={16} />
            {saving ? '保存中...' : '发布周记'}
          </button>
        </div>
      </div>
    </div>
  );
}
