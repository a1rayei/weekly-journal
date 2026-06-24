import { useState, useEffect } from 'react';
import { Send, Trash2, MessageCircle } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Comment {
  id: string;
  author_name: string;
  content: string;
  parent_id: string | null;
  created_at: string;
}

const AVATAR_COLORS = [
  ['#F6D9C2', '#B06B3E'],
  ['#E8D5C4', '#9A6B4A'],
  ['#F0E0CE', '#A8794F'],
  ['#EDD9C8', '#9E7152'],
  ['#F5DEC9', '#B47A4A'],
];

function avatarColor(name: string) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
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
  const { showToast } = useAuth();

  useEffect(() => {
    loadComments();
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
    try {
      await apiRequest('POST', `/comments/${reportId}`, { author_name: name, content });
      setContent('');
      showToast('评论已发布', 'success');
      loadComments();
    } catch (err: any) {
      showToast(err.message || '评论失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('确定删除这条评论吗？')) return;
    try {
      await apiRequest('DELETE', `/comments/${commentId}`);
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
      <div className="flex items-center gap-2 mb-5">
        <MessageCircle size={18} style={{ color: '#D9925E' }} />
        <h2 className="font-serif-art text-[18px] font-bold" style={{ color: '#3A2E28' }}>跟帖评论</h2>
        <span className="text-[13px]" style={{ color: '#B5A595' }}>{comments.length}</span>
      </div>

      {comments.length === 0 ? (
        <p className="text-[14px] text-center py-6" style={{ color: '#B5A595' }}>还没有评论，来留下第一条吧</p>
      ) : (
        <div className="space-y-5 mb-6">
          {comments.map((comment) => {
            const [bg, fg] = avatarColor(comment.author_name);
            return (
              <div key={comment.id} className="flex gap-3.5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[14px] font-bold" style={{ backgroundColor: bg, color: fg }}>
                  {comment.author_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px] font-semibold" style={{ color: '#3A2E28' }}>{comment.author_name}</span>
                    <span className="text-[12px]" style={{ color: '#C4B4A2' }}>{formatDate(comment.created_at)}</span>
                    {isAuthor && (
                      <button onClick={() => handleDelete(comment.id)} className="ml-auto p-1 rounded transition-all hover:bg-[rgba(251,238,234,0.9)]" style={{ color: '#C4B4A2' }}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <p className="text-[14px] leading-relaxed" style={{ color: '#6B5D54' }}>{comment.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {commentEnabled ? (
        <form onSubmit={handleSubmit} className="pt-5" style={{ borderTop: '1px solid rgba(231,223,212,0.8)' }}>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="你的名字（无需登录）"
              maxLength={20}
              className="input-soft w-full sm:w-52 px-4 py-2.5 rounded-2xl text-[14px] outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(231,223,212,0.9)', color: '#3A2E28' }}
            />
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="写下你的想法、建议或鼓励…"
                maxLength={1000}
                rows={3}
                className="input-soft w-full px-4 py-3 pr-12 rounded-2xl text-[14px] outline-none resize-none leading-relaxed"
                style={{ backgroundColor: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(231,223,212,0.9)', color: '#3A2E28' }}
              />
              <button
                type="submit"
                disabled={loading || !name.trim() || !content.trim()}
                className="absolute right-3 bottom-3 p-2 rounded-xl text-white disabled:opacity-30 transition-all"
                style={{ background: 'linear-gradient(135deg, #D49263 0%, #B06B3E 100%)' }}
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p className="text-[14px] text-center py-4" style={{ color: '#B5A595', borderTop: '1px solid rgba(231,223,212,0.8)' }}>该周记已关闭评论</p>
      )}
    </div>
  );
}
