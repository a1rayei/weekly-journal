import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Report {
  id: string;
  week_start: string;
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reports, setReports] = useState<Report[]>([]);
  const navigate = useNavigate();
  const { user, openLoginModal } = useAuth();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await apiRequest('GET', '/reports');
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  };

  const getMonthData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const getWeekDays = () => ['日', '一', '二', '三', '四', '五', '六'];

  const isWeekday = (day: number | null) => {
    if (day === null) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dow = date.getDay();
    return dow >= 1 && dow <= 5;
  };

  const getReportForDate = (day: number | null) => {
    if (day === null) return null;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return reports.find((r) => {
      const rd = new Date(r.week_start);
      const re = new Date(rd);
      re.setDate(rd.getDate() + 4);
      return date >= rd && date <= re;
    });
  };

  const hasReport = (day: number | null) => !!getReportForDate(day);

  const isToday = (day: number | null) => {
    if (day === null) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const handleDayClick = (day: number | null) => {
    if (day === null || !isWeekday(day)) return;
    const report = getReportForDate(day);
    if (report) {
      navigate(`/report/${report.id}`);
    } else if (user) {
      navigate('/new');
    } else {
      openLoginModal(() => navigate('/new'));
    }
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const days = getMonthData();
  const submittedCount = days.filter((d) => d !== null && isWeekday(d) && hasReport(d)).length;
  const weekdayCount = days.filter((d) => d !== null && isWeekday(d)).length;

  return (
    <div className="space-y-6 fade-up">
      {/* 标题区 */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[13px] tracking-[0.2em] uppercase mb-1.5" style={{ color: '#C4A57E', fontWeight: 600 }}>
            Calendar
          </p>
          <h1 className="font-serif text-[32px] font-bold leading-tight" style={{ color: '#3A2E28', letterSpacing: '-0.02em' }}>
            {currentDate.getFullYear()} · {monthNames[currentDate.getMonth()]}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={goToToday} className="px-3 py-1.5 text-[13px] rounded-lg transition-all hover:bg-[#F6E5D6]" style={{ color: '#A89684' }}>
            今天
          </button>
          <button onClick={prevMonth} className="p-2 rounded-lg transition-all hover:bg-[#F6E5D6]" style={{ color: '#A89684' }}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={nextMonth} className="p-2 rounded-lg transition-all hover:bg-[#F6E5D6]" style={{ color: '#A89684' }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* 出勤统计 — 重点信息放大 */}
      <div className="bg-white rounded-3xl p-6 flex items-center justify-between" style={{ border: '1.5px solid #F0E8DD' }}>
        <div>
          <p className="text-[13px] mb-1" style={{ color: '#A89684' }}>本月出勤记录</p>
          <p className="font-serif">
            <span className="text-[36px] font-bold" style={{ color: '#B06B3E' }}>{submittedCount}</span>
            <span className="text-[18px] font-medium" style={{ color: '#C4B4A2' }}> / {weekdayCount} 个工作日</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#D98E5F' }} />
            <span className="text-[12px]" style={{ color: '#A89684' }}>已提交</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#E0D4C6' }} />
            <span className="text-[12px]" style={{ color: '#A89684' }}>未提交</span>
          </div>
        </div>
      </div>

      {/* 日历主体 */}
      <div className="bg-white rounded-3xl p-6" style={{ border: '1.5px solid #F0E8DD' }}>
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {getWeekDays().map((d, i) => (
            <div key={d} className="text-center text-[12px] py-2 font-semibold" style={{ color: i === 0 || i === 6 ? '#D0C2B2' : '#A89684' }}>
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {days.map((day, index) => {
            const weekday = isWeekday(day);
            const reportExists = hasReport(day);
            const today = isToday(day);

            return (
              <div
                key={index}
                onClick={() => handleDayClick(day)}
                className="aspect-square flex flex-col items-center justify-center rounded-2xl transition-all"
                style={{
                  cursor: day !== null && weekday ? 'pointer' : 'default',
                  backgroundColor:
                    day === null ? 'transparent'
                    : weekday
                      ? reportExists ? '#FBF3EC' : '#FAF7F2'
                      : 'transparent',
                  border: today ? '2px solid #E8A87C' : '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (day !== null && weekday) e.currentTarget.style.backgroundColor = reportExists ? '#F6E5D6' : '#F3EDE4';
                }}
                onMouseLeave={(e) => {
                  if (day !== null && weekday) e.currentTarget.style.backgroundColor = reportExists ? '#FBF3EC' : '#FAF7F2';
                }}
              >
                {day !== null && (
                  <>
                    <span
                      className="text-[15px]"
                      style={{
                        color: weekday ? (reportExists ? '#B06B3E' : '#6B5D54') : '#D0C2B2',
                        fontWeight: reportExists || today ? 700 : 500,
                      }}
                    >
                      {day}
                    </span>
                    {weekday && (
                      <div
                        className="mt-1 rounded-full"
                        style={{
                          width: reportExists ? 6 : 5,
                          height: reportExists ? 6 : 5,
                          backgroundColor: reportExists ? '#D98E5F' : '#E0D4C6',
                        }}
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[12px] text-center" style={{ color: '#C4B4A2' }}>
        点击有记录的工作日可查看当周周记
      </p>
    </div>
  );
}
