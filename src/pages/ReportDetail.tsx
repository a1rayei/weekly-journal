import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit3, Share2, Trash2, Calendar, Tag } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import CommentSection from '../components/CommentSection';

interface Report {
  id: string;
  title: string;
  content: string;
  week_start: string;
  week_end: string;
  tags: string[] | string;
  author_id: string;
  comment_enabled: boolean | number;
  share_link?: string;
  created_at: string;
}

export default function ReportDetail() {
  const { id, token: shareToken } = useParams<{ id?: string; token?: string }>();
  const navigate = useNavigate();
  const { user, showToast } = useAuth();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [id, shareToken]);

  const loadReport = async () => {
    setLoading(true);
    try {
      let data;
      if (shareToken) {
        data = await apiRequest('GET', `/share/${shareToken}`);
      } else if (id) {
        data = await apiRequest('GET', `/reports/${id}`);
      }
      setReport(data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  const isAuthor = !!user;

  const handleDelete = async () => {
    if (!confirm('确定删除这篇周记吗？删除后评论也会一并清除。')) return;
    try {
      await apiRequest('DELETE', `/reports/${id}`);
      showToast('周记已删除', 'success');
      navigate('/');
    } catch (err: any) {
      showToast(err.message || '删除失败', 'error');
    }
  };

  const handleShare = async () => {
    if (!report) return;
    const url = `${window.location.origin}${window.location.pathname}#/report/${report.id}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('链接已复制，可分享给他人查看', 'success');
    } catch {
      showToast('复制失败，请手动复制地址栏链接', 'error');
    }
  };

  const formatContent = (content: string) => {
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*)$/gm, '<li>$1</li>')
      .replace(/\n/g, '<br/>');
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const normalizeTags = (tags: string[] | string): string[] => {
    if (Array.isArray(tags)) return tags;
    return tags ? tags.split(',').filter(Boolean) : [];
  };

  if (loading) {
    return <div className="text-center py-24 text-[#B5A595] animate-pulse">加载中...</div>;
  }

  if (!report) {
    return (
      <div className="text-center py-24">
        <p className="text-[15px]" style={{ color: '#6B5D54' }}>周记不存在或已删除</p>
        <Link to="/" className="text-[13px] mt-3 inline-block" style={{ color: '#B06B3E' }}>← 返回列表</Link>
      </div>
    );
  }

  const tags = normalizeTags(report.tags);
  const commentEnabled = report.comment_enabled === true || report.comment_enabled === 1;

  return (
    <div className="space-y-5 fade-up">
      {/* 返回 + 操作 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-[13px] px-3 py-2 rounded-lg transition-all hover:bg-[#F6E5D6]"
          style={{ color: '#A89684' }}
        >
          <ArrowLeft size={16} />
          返回
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl transition-all hover:bg-[#F6E5D6]"
            style={{ color: '#A89684' }}
            title="复制分享链接"
          >
            <Share2 size={17} />
          </button>
          {isAuthor && (
            <>
              <button
                onClick={() => navigate(`/edit/${report.id}`)}
                className="p-2.5 rounded-xl transition-all hover:bg-[#F6E5D6]"
                style={{ color: '#A89684' }}
                title="编辑"
              >
                <Edit3 size={17} />
              </button>
              <button
                onClick={handleDelete}
                className="p-2.5 rounded-xl transition-all hover:bg-[#FBEEEA]"
                style={{ color: '#C49A8E' }}
                title="删除"
              >
                <Trash2 size={17} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 周记正文卡片 */}
      <article className="bg-white rounded-3xl p-8 sm:p-10" style={{ border: '1.5px solid #F0E8DD' }}>
        {/* 日期 — 重点信息放大 */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[14px] font-bold"
            style={{ backgroundColor: '#FBF3EC', color: '#B06B3E' }}
          >
            <Calendar size={15} />
            {formatDate(report.week_start)} — {formatDate(report.week_end)}
          </span>
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 text-[12px] px-2.5 py-1.5 rounded-lg"
              style={{ backgroundColor: '#F6F1EA', color: '#A89684' }}
            >
              <Tag size={11} />
              {tag}
            </span>
          ))}
        </div>

        {/* 标题 — 大字号衬线加粗 */}
        <h1 className="font-serif text-[30px] sm:text-[34px] font-bold leading-tight mb-7" style={{ color: '#3A2E28', letterSpacing: '-0.02em' }}>
          {report.title}
        </h1>

        <div className="w-12 h-1 rounded-full mb-7" style={{ background: 'linear-gradient(90deg, #EDB890, #F6E5D6)' }} />

        {/* 正文 */}
        <div
          className="prose-art"
          dangerouslySetInnerHTML={{ __html: formatContent(report.content) }}
        />
      </article>

      <CommentSection
        reportId={report.id}
        commentEnabled={commentEnabled}
        isAuthor={isAuthor}
      />
    </div>
  );
}
