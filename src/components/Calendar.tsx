import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Report {
  id: string;
  week_start: string;
}

interface CalendarProps {
  currentDate: Date;
  reports: Report[];
  selectedDate: string | null;
  compact: boolean;
  onDayClick: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
const weekLabels = ['一', '二', '三', '四', '五', '六', '日'];

export default function Calendar({
  currentDate, reports, selectedDate, compact,
  onDayClick, onPrevMonth, onNextMonth, onToday,
}: CalendarProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // 周一为一周起点
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const dateStrOf = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${m}-${dd}`;
  };

  const isWeekday = (day: number) => {
    const dow = new Date(year, month, day).getDay();
    return dow >= 1 && dow <= 5;
  };

  const reportForDay = (day: number) => {
    const date = new Date(year, month, day);
    return reports.find((r) => {
      const rd = new Date(r.week_start);
      const re = new Date(rd);
      re.setDate(rd.getDate() + 4);
      return date >= new Date(rd.getFullYear(), rd.getMonth(), rd.getDate()) &&
             date <= new Date(re.getFullYear(), re.getMonth(), re.getDate());
    });
  };

  const isToday = (day: number) => {
    const t = new Date();
    return day === t.getDate() && month === t.getMonth() && year === t.getFullYear();
  };

  // 选中日期所在的周（周一到周五）高亮
  const selectedWeekDays = (() => {
    if (!selectedDate) return new Set<number>();
    const sd = new Date(selectedDate);
    const dow = (sd.getDay() + 6) % 7;
    const monday = new Date(sd);
    monday.setDate(sd.getDate() - dow);
    const set = new Set<number>();
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      if (d.getMonth() === month && d.getFullYear() === year) set.add(d.getDate());
    }
    return set;
  })();

  const cellSize = compact ? 'h-9' : 'h-12 sm:h-14';
  const numSize = compact ? 'text-[13px]' : 'text-[15px] sm:text-[16px]';

  return (
    <div>
      {/* 头部 */}
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--sp-5)' }}>
        <h2 className="font-serif-art font-bold leading-none tracking-cn-tight" style={{ color: '#514A43', fontSize: compact ? 20 : 26 }}>
          {year} · {monthNames[month]}
        </h2>
        <div className="flex items-center gap-1">
          <button onClick={onToday} className="px-3 py-1.5 text-[13px] rounded-xl transition-all hover:bg-[rgba(247,218,217,0.5)] tracking-cn" style={{ color: '#968C83' }}>
            今天
          </button>
          <button onClick={onPrevMonth} className="p-2 rounded-xl transition-all hover:bg-[rgba(247,218,217,0.5)]" style={{ color: '#968C83' }}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={onNextMonth} className="p-2 rounded-xl transition-all hover:bg-[rgba(247,218,217,0.5)]" style={{ color: '#968C83' }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* 星期 */}
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {weekLabels.map((w, i) => (
          <div key={w} className="text-center text-[12px] font-medium py-1" style={{ color: i >= 5 ? '#C5BDB2' : '#968C83' }}>
            {w}
          </div>
        ))}
      </div>

      {/* 日期格 */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, idx) => {
          if (day === null) return <div key={idx} className={cellSize} />;
          const weekday = isWeekday(day);
          const report = reportForDay(day);
          const hasReport = !!report;
          const today = isToday(day);
          const inSelectedWeek = selectedWeekDays.has(day);
          const isSelected = selectedDate ? new Date(selectedDate).getDate() === day && new Date(selectedDate).getMonth() === month : false;

          let bg = 'transparent';
          if (weekday) bg = hasReport ? 'rgba(247, 218, 217, 0.45)' : 'rgba(214, 210, 196, 0.28)';
          if (inSelectedWeek) bg = 'rgba(247, 218, 217, 0.6)';
          if (isSelected) bg = 'rgba(247, 218, 217, 0.95)';

          return (
            <button
              key={idx}
              onClick={() => weekday && onDayClick(dateStrOf(day))}
              disabled={!weekday}
              className={`day-cell ${cellSize} flex flex-col items-center justify-center rounded-2xl relative`}
              style={{
                backgroundColor: bg,
                border: today ? '2px solid #E6B6B2' : '2px solid transparent',
                cursor: weekday ? 'pointer' : 'default',
              }}
            >
              <span
                className={numSize}
                style={{
                  color: weekday ? (hasReport ? '#B27A75' : '#6D635B') : '#C5BDB2',
                  fontWeight: hasReport || today || isSelected ? 700 : 500,
                }}
              >
                {day}
              </span>
              {weekday && !compact && (
                <span
                  className="mt-1 rounded-full"
                  style={{
                    width: hasReport ? 6 : 5,
                    height: hasReport ? 6 : 5,
                    backgroundColor: hasReport ? '#D49994' : '#D6D2C4',
                  }}
                />
              )}
              {weekday && compact && hasReport && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D49994' }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
