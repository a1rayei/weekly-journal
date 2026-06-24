import { useState, useEffect, useMemo } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Calendar from '../components/Calendar';
import ReportPanel from '../components/ReportPanel';

interface Report {
  id: string;
  title: string;
  week_start: string;
  week_end: string;
  tags: string[] | string;
  content: string;
}

// 给定任意日期，返回所在周的周一/周五（yyyy-mm-dd）
// 本地时区解析 yyyy-mm-dd（避免 new Date('2026-06-26') 被按 UTC 解析导致跨天偏移）
function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function weekRangeOf(dateStr: string) {
  const d = parseLocalDate(dateStr);
  const dow = (d.getDay() + 6) % 7; // 周一=0
  const monday = new Date(d);
  monday.setDate(d.getDate() - dow);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  const fmt = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  return { weekStart: fmt(monday), weekEnd: fmt(friday) };
}

export default function Dashboard() {
  const { user, openLoginModal } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [forceEdit, setForceEdit] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  // 支持分享链接 #week=yyyy-mm-dd 直接定位
  useEffect(() => {
    const hash = window.location.hash;
    const m = hash.match(/week=(\d{4}-\d{2}-\d{2})/);
    if (m) {
      setSelectedDate(m[1]);
      setCurrentDate(new Date(m[1]));
    }
  }, []);

  const loadReports = async () => {
    try {
      const data = await apiRequest('GET', '/reports');
      setReports(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoaded(true);
    }
  };

  const reportForDate = (dateStr: string): Report | null => {
    const date = parseLocalDate(dateStr);
    return reports.find((r) => {
      const rd = parseLocalDate(r.week_start);
      const re = new Date(rd);
      re.setDate(rd.getDate() + 4);
      return date >= rd && date <= re;
    }) || null;
  };

  // 本月出勤统计：本月内、有对应周报的工作日数量
  const attendance = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const last = new Date(y, m + 1, 0).getDate();
    let total = 0;
    let done = 0;
    for (let d = 1; d <= last; d++) {
      const dow = new Date(y, m, d).getDay();
      if (dow >= 1 && dow <= 5) {
        total++;
        const ds = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        if (reportForDate(ds)) done++;
      }
    }
    return { done, total };
  }, [currentDate, reports]);

  // 连续坚持周数：从本周往前数，连续每周都有周报的周数
  const streakWeeks = useMemo(() => {
    if (reports.length === 0) return 0;
    const hasWeek = new Set(reports.map((r) => r.week_start));
    // 本周周一
    const today = new Date();
    const dow = (today.getDay() + 6) % 7;
    const mon = new Date(today);
    mon.setDate(today.getDate() - dow);
    const fmt = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
    let count = 0;
    const cursor = new Date(mon);
    // 若本周还没写，从上一周开始计数
    if (!hasWeek.has(fmt(cursor))) cursor.setDate(cursor.getDate() - 7);
    while (hasWeek.has(fmt(cursor))) {
      count++;
      cursor.setDate(cursor.getDate() - 7);
    }
    return count;
  }, [reports]);

  const handleDayClick = (dateStr: string) => {
    setForceEdit(false);
    setSelectedDate(dateStr);
  };

  const handleNewReport = () => {
    const today = new Date();
    const fmt = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const doOpen = () => {
      setForceEdit(true);
      setSelectedDate(fmt);
      setCurrentDate(today);
    };
    if (user) doOpen();
    else openLoginModal(doOpen);
  };

  const handlePanelClose = () => {
    setSelectedDate(null);
    setForceEdit(false);
  };

  const handleChanged = async () => {
    await loadReports();
    // 删除后若该周已无周报，保留在该周显示空态
  };

  const selectedRange = selectedDate ? weekRangeOf(selectedDate) : null;
  const selectedReport = selectedDate ? reportForDate(selectedDate) : null;
  const panelOpen = !!selectedDate;

  return (
    <div className="max-w-6xl mx-auto" style={{ padding: 'var(--sp-8) var(--sp-5)' }}>
      <div className="dash-grid">
        {/* 左窄栏 */}
        <Sidebar
          reportCount={reports.length}
          attendance={attendance}
          streakWeeks={streakWeeks}
          monthKey={`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`}
          onNewReport={handleNewReport}
        />

        {/* 右宽栏 */}
        <main className="stack-5 min-w-0">
          <div className="glass rounded-[28px] fade-up" style={{ padding: 'var(--sp-6)' }}>
            <Calendar
              currentDate={currentDate}
              reports={reports}
              selectedDate={selectedDate}
              compact={panelOpen}
              onDayClick={handleDayClick}
              onPrevMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              onNextMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              onToday={() => setCurrentDate(new Date())}
            />
            {!panelOpen && loaded && (
              <p className="text-[12.5px] text-center tracking-cn" style={{ color: '#B6ADA3', marginTop: 'var(--sp-5)' }}>
                点击任意工作日，查看或撰写当周周记
              </p>
            )}
          </div>

          {panelOpen && selectedRange && (
            <ReportPanel
              key={`${selectedRange.weekStart}-${selectedReport?.id || 'new'}-${forceEdit ? 'edit' : 'view'}`}
              weekStart={selectedRange.weekStart}
              weekEnd={selectedRange.weekEnd}
              reportId={selectedReport?.id || null}
              forceEdit={forceEdit}
              onClose={handlePanelClose}
              onChanged={handleChanged}
            />
          )}
        </main>
      </div>
    </div>
  );
}
