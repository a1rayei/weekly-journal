import { useState, useEffect } from 'react';
import { Send, Trash2, MessageCircle, Pencil, Check, X } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Comment {
  id: string;
  author_name: string;
  content: string;
  parent_id: string | null;
  created_at: string;
}

// 本浏览器发布过的评论 → 记录 id 到 token 的映射，用于自助编辑/删除
function getMyTokens(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem('my_comment_tokens') || '{}');
  } catch {
    return {};
  }
}
function rememberToken(id: string, token: string) {
  const m = getMyTokens();
  m[id] = token;
  localStorage.setItem('my_comment_tokens', JSON.stringify(m));
}
function forgetToken(id: string) {
  const m = getMyTokens();
  delete m[id];
  localStorage.setItem('my_comment_tokens', JSON.stringify(m));
}
function genToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function CommentSection({
  reportId,
  commentEnabled,
  isAuthor,
}: {
  reportId: string;
  commentEnabled: boolean;
  isAuthor: boolean;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [myTokens, setMyTokens] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const { showToast } = useAuth();

  useEffect(() => {
    loadComments();
    setMyTokens(getMyTokens());
  }, [reportId]);

  const loadComments = async () => {
    try {
      const data = await apiRequest('GET', `/comments/${reportId}`);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    setLoading(true);
    const token = genToken();
    try {
      const created: any = await apiRequest('POST', `/comments/${reportId}`, { author_name: name, content, edit_token: token });
      if (created?.id) {
        rememberToken(created.id, token);
        setMyTokens(getMyTokens());
      }
      setContent('');
      showToast('评论已发布', 'success');
      loadComments();
    } catch (err: any) {
      showToast(err.message || '评论失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 可操作（编辑/删除）：作者 或 本人（持有 token）
  const canManage = (id: string) => isAuthor || !!myTokens[id];

  const startEdit = (c: Comment) => {
    setEditingId(c.id);
    setEditText(c.content);
  };

  const saveEdit = async (id: string) => {
    if (!editText.trim()) return;
    try {
      await apiRequest('PUT', `/comments/${id}`, { content: editText, edit_token: myTokens[id] });
      setEditingId(null);
      showToast('评论已更新', 'success');
      loadComments();
    } catch (err: any) {
      showToast(err.message || '更新失败', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这条评论吗？')) return;
    try {
      await apiRequest('DELETE', `/comments/${id}`, { edit_token: myTokens[id] });
      forgetToken(id);
      setMyTokens(getMyTokens());
      showToast('评论已删除', 'success');
      loadComments();
    } catch (err: any) {
      showToast(err.message || '删除失败', 'error');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div>
      {/* 标题 */}
      <div className="flex items-center gap-2" style={{ marginBottom: 'var(--sp-5)' }}>
        <MessageCircle size={18} style={{ color: '#C98D88' }} />
        <h2 className="font-serif-art text-[18px] font-bold tracking-cn" style={{ color: '#514A43' }}>跟帖评论</h2>
        <span className="text-[13px] tracking-cn" style={{ color: '#B6ADA3' }}>{comments.length}</span>
      </div>

      {/* 评论列表 */}
      {comments.length === 0 ? (
        <p className="text-[14px] text-center tracking-cn" style={{ color: '#B6ADA3', padding: 'var(--sp-6) 0' }}>
          还没有评论，来留下第一条吧
        </p>
      ) : (
        <div className="stack-4">
          {comments.map((comment) => {
            const mine = !!myTokens[comment.id];
            const editable = canManage(comment.id);
            const isEditing = editingId === comment.id;
            return (
              <div
                key={comment.id}
                className="rounded-[18px]"
                style={{ background: 'rgba(255, 250, 243, 0.6)', border: '1px solid rgba(214, 210, 196, 0.55)', padding: 'var(--sp-4) var(--sp-5)' }}
              >
                {/* 名字 + 时间 + 操作 */}
                <div className="flex items-center" style={{ gap: 'var(--sp-3)', marginBottom: 'var(--sp-2)' }}>
                  <span className="text-[15px] font-bold tracking-cn" style={{ color: '#514A43' }}>
                    {comment.author_name}
                  </span>
                  {mine && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded-md tracking-cn" style={{ background: 'rgba(247,218,217,0.7)', color: '#B27A75', fontWeight: 600 }}>
                      我
                    </span>
                  )}
                  <span className="text-[12px] tracking-cn" style={{ color: '#B6ADA3' }}>
                    {formatDate(comment.created_at)}
                  </span>
                  {editable && !isEditing && (
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        onClick={() => startEdit(comment)}
                        className="p-1 rounded-lg transition-all hover:bg-[rgba(247,218,217,0.7)]"
                        style={{ color: '#C4B4A2' }}
                        title="编辑"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="p-1 rounded-lg transition-all hover:bg-[rgba(251,238,234,0.9)]"
                        style={{ color: '#C4B4A2' }}
                        title="删除"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* 内容 / 编辑态 */}
                {isEditing ? (
                  <div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      maxLength={1000}
                      className="input-soft w-full outline-none resize-none tracking-cn"
                      style={{ backgroundColor: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(214,210,196,0.9)', color: '#514A43', borderRadius: 12, padding: '10px 14px', fontSize: 14, lineHeight: 1.8 }}
                    />
                    <div className="flex justify-end items-center" style={{ gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
                      <button onClick={() => setEditingId(null)} className="flex items-center gap-1 text-[13px] px-3 py-1.5 rounded-lg tracking-cn transition-all hover:bg-[rgba(214,210,196,0.4)]" style={{ color: '#968C83' }}>
                        <X size={14} /> 取消
                      </button>
                      <button onClick={() => saveEdit(comment.id)} className="btn btn-primary tracking-cn" style={{ padding: '6px 14px', borderRadius: 10, fontSize: 13 }}>
                        <Check size={14} /> 保存
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    className="text-[14px] tracking-cn"
                    style={{ color: '#6D635B', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {comment.content}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 发表评论 — 整体一个大框架，与列表保持距离 */}
      {commentEnabled ? (
        <form
          onSubmit={handleSubmit}
          className="rounded-[20px]"
          style={{
            marginTop: 'var(--sp-8)',
            padding: 'var(--sp-5)',
            background: 'rgba(247, 218, 217, 0.18)',
            border: '1px solid rgba(214, 210, 196, 0.6)',
          }}
        >
          <p className="text-[13px] font-semibold tracking-cn" style={{ color: '#968C83', marginBottom: 'var(--sp-3)' }}>
            发表评论
          </p>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="你的名字（无需登录）"
            maxLength={20}
            className="input-soft w-full outline-none tracking-cn"
            style={{ backgroundColor: 'rgba(255,255,255,0.75)', border: '1.5px solid rgba(214,210,196,0.9)', color: '#514A43', borderRadius: 14, padding: '11px 16px', fontSize: 14, marginBottom: 'var(--sp-3)' }}
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的想法、建议或鼓励…（支持换行）"
            maxLength={1000}
            rows={4}
            className="input-soft w-full outline-none resize-none tracking-cn"
            style={{ backgroundColor: 'rgba(255,255,255,0.75)', border: '1.5px solid rgba(214,210,196,0.9)', color: '#514A43', borderRadius: 14, padding: '12px 16px', fontSize: 14, lineHeight: 1.8 }}
          />

          <div className="flex items-center justify-between" style={{ marginTop: 'var(--sp-4)' }}>
            <span className="text-[12px] tracking-cn" style={{ color: '#C4B4A2' }}>发布后可自行编辑或删除</span>
            <button
              type="submit"
              disabled={loading || !name.trim() || !content.trim()}
              className="btn btn-primary tracking-cn disabled:opacity-40"
              style={{ padding: '10px 22px', borderRadius: 14, fontSize: 14 }}
            >
              <Send size={15} />
              {loading ? '发布中…' : '发布评论'}
            </button>
          </div>
        </form>
      ) : (
        <p
          className="text-[14px] text-center tracking-cn"
          style={{ color: '#B6ADA3', marginTop: 'var(--sp-6)', paddingTop: 'var(--sp-5)', borderTop: '1px solid rgba(214,210,196,0.7)' }}
        >
          该周记已关闭评论
        </p>
      )}
    </div>
  );
}
