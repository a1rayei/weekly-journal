import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, FileText, Calendar, Tag, PenLine, MessageCircle } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Report {
  id: string;
  title: string;
  week_start: string;
  week_end: string;
  status: string;
  tags: string[] | string;
  content: string;
  created_at: string;
}

export default function ReportList() {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, openLoginModal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await apiRequest('GET', '/reports');
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const normalizeTags = (tags: string[] | string): string[] => {
    if (Array.isArray(tags)) return tags;
    return tags ? tags.split(',').filter(Boolean) : [];
  };

  const filteredReports = reports.filter((r) => {
    if (!search) return true;
    const query = search.toLowerCase();
    const tagStr = normalizeTags(r.tags).join(' ').toLowerCase();
    return (
      r.title.toLowerCase().includes(query) ||
      (r.content || '').toLowerCase().includes(query) ||
      tagStr.includes(query)
    );
  });

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.getMonth() + 1}.${s.getDate()} – ${e.getMonth() + 1}.${e.getDate()}`;
  };

  const getExcerpt = (content: string) => {
    const plain = content
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/^- /gm, '')
      .replace(/\n+/g, ' ')
      .trim();
    return plain.length > 80 ? plain.slice(0, 80) + '…' : plain;
  };

  const handleNew = () => {
    if (user) navigate('/new');
    else openLoginModal(() => navigate('/new'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-pulse text-[#B5A595]">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* 头部标题区 — 大字号衬线 */}
      <div className="fade-up">
        <p className="text-[13px] tracking-[0.2em] uppercase mb-2" style={{ color: '#C4A57E', fontWeight: 600 }}>
          Weekly Journal
        </p>
        <h1 className="font-serif text-[34px] leading-tight font-bold" style={{ color: '#3A2E28', letterSpacing: '-0.02em' }}>
          我的工作周记
        </h1>
        <p className="text-[14px] mt-2" style={{ color: '#A89684' }}>
          已记录 <span style={{ color: '#B06B3E', fontWeight: 700 }}>{reports.length}</span> 篇 · 持续记录每一周的成长
        </p>
      </div>

      {/* 搜索 */}
      <div className="relative fade-up" style={{ animationDelay: '0.05s' }}>
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#C4B4A2' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索标题、内容或标签…"
          className="input-soft w-full pl-11 pr-4 py-3.5 rounded-2xl text-[14px] outline-none"
          style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #ECE3D8', color: '#3A2E28' }}
        />
      </div>

      {/* 列表 */}
      {filteredReports.length === 0 ? (
        <div className="text-center py-20 fade-up">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#F6E5D6' }}
          >
            <FileText size={28} style={{ color: '#D98E5F' }} />
          </div>
          <p className="text-[15px] mb-1" style={{ color: '#6B5D54', fontWeight: 500 }}>
            {search ? '没有找到相关周记' : '还没有写过周记'}
          </p>
          <p className="text-[13px] mb-5" style={{ color: '#B5A595' }}>
            {search ? '换个关键词试试看' : '记录下这一周做了什么吧'}
          </p>
          {!search && (
            <button
              onClick={handleNew}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #C58A5E 0%, #A56B43 100%)' }}
            >
              <PenLine size={15} />
              写第一篇周记
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report, idx) => {
            const tags = normalizeTags(report.tags);
            return (
              <Link
                key={report.id}
                to={`/report/${report.id}`}
                className="card-soft block bg-white rounded-3xl p-6 fade-up"
                style={{ border: '1.5px solid #F0E8DD', animationDelay: `${0.05 * idx + 0.1}s` }}
              >
                {/* 日期 — 放大加粗，重点信息 */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[13px] font-bold"
                    style={{ backgroundColor: '#FBF3EC', color: '#B06B3E' }}
                  >
                    <Calendar size={13} />
                    {formatDateRange(report.week_start, report.week_end)}
                  </span>
                  {tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 text-[12px] px-2.5 py-1 rounded-lg"
                      style={{ backgroundColor: '#F6F1EA', color: '#A89684' }}
                    >
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 标题 — 大字号加粗，重点信息 */}
                <h3 className="font-serif text-[21px] font-bold leading-snug mb-2" style={{ color: '#3A2E28', letterSpacing: '-0.01em' }}>
                  {report.title}
                </h3>

                {/* 摘要 */}
                <p className="text-[14px] leading-relaxed" style={{ color: '#9A8B7E' }}>
                  {getExcerpt(report.content)}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
