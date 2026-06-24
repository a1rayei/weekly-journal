// 纯前端模拟 API，使用 localStorage 存储数据
// 所有数据以 JSON 格式存储在 localStorage 中

const DB_KEY = 'weekly_report_db';

interface DB {
  users: { id: string; email: string; password: string; name: string; role: string }[];
  reports: { id: string; title: string; weekStart: string; content: string; tags: string; status: string; createdAt: string; updatedAt: string; authorId: string; commentEnabled: boolean; shareLink: string }[];
  comments: { id: string; reportId: string; authorName: string; content: string; parentId: string | null; createdAt: string }[];
  versions: { id: string; reportId: string; content: string; createdAt: string }[];
  attendance: { id: string; date: string; type: string; note: string; createdAt: string }[];
  drafts: { id: string; reportId: string; content: string; savedAt: string }[];
}

function seedDB(): DB {
  const today = new Date();
  const day = today.getDay();
  const thisMon = new Date(today);
  thisMon.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  const lastMon = new Date(thisMon);
  lastMon.setDate(thisMon.getDate() - 7);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const iso = (d: Date) => d.toISOString();

  const r1Id = 'seed-001';
  const r2Id = 'seed-002';

  return {
    users: [{ id: '1', email: 'admin@weekly.local', password: 'admin123', name: '我', role: 'admin' }],
    reports: [
      {
        id: r1Id,
        title: '本周：完成周记网站重构上线',
        weekStart: fmt(thisMon),
        content:
          '**本周完成**\n- 完成个人周记网站的整体视觉重构，采用暖色调手帐风\n- 改造为公开访问模式，访客无需登录即可查看与评论\n- 接入日历导航，可按工作日快速跳转周记\n\n**下周计划**\n- 补充 PDF 导出能力\n- 增加周记数据汇总图表\n\n**遇到的问题**\n- 静态部署环境不支持后端，改为纯前端 *localStorage* 方案\n\n**需要支持**\n- 暂无',
        tags: '产品,前端,上线',
        status: 'published',
        createdAt: iso(today),
        updatedAt: iso(today),
        authorId: '1',
        commentEnabled: true,
        shareLink: 'share-seed-001',
      },
      {
        id: r2Id,
        title: '上周：需求梳理与原型设计',
        weekStart: fmt(lastMon),
        content:
          '**本周完成**\n- 完成周记网站 PRD 文档，明确产品定位与功能清单\n- 输出配色方案与交互原型\n- 与带教确认了核心功能范围\n\n**下周计划**\n- 进入正式开发阶段\n\n**遇到的问题**\n- 权限模型在多次讨论后简化为两类角色\n\n**需要支持**\n- 暂无',
        tags: '需求,设计',
        status: 'published',
        createdAt: iso(lastMon),
        updatedAt: iso(lastMon),
        authorId: '1',
        commentEnabled: true,
        shareLink: 'share-seed-002',
      },
    ],
    comments: [
      {
        id: 'c-seed-001',
        reportId: r1Id,
        authorName: '带教阿伟',
        content: '重构后的界面清爽多了，手帐风很有质感，继续保持！',
        parentId: null,
        createdAt: iso(today),
      },
    ],
    versions: [],
    attendance: [],
    drafts: [],
  };
}

function getDB(): DB {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) return JSON.parse(raw);
  const seeded = seedDB();
  saveDB(seeded);
  return seeded;
}

function saveDB(db: DB) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function getAuthToken(): string | null {
  return localStorage.getItem('weekly_auth_token');
}

function setAuthToken(token: string) {
  localStorage.setItem('weekly_auth_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('weekly_auth_token');
}

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Auth API
export async function login(email: string, password: string) {
  await delay(300);
  const db = getDB();
  const user = db.users.find(u => u.email === email && u.password === password);
  if (!user) throw new Error('邮箱或密码错误');
  const token = btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role }));
  setAuthToken(token);
  return { user: { id: user.id, email: user.email, name: user.name, role: user.role } };
}

export async function getMe() {
  await delay(100);
  const token = getAuthToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token));
    const db = getDB();
    const user = db.users.find(u => u.id === payload.id);
    if (!user) return null;
    return { user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  } catch {
    return null;
  }
}

export async function getReports(params?: { search?: string; startDate?: string; endDate?: string; tag?: string; page?: number; pageSize?: number }) {
  await delay(200);
  const db = getDB();
  let reports = [...db.reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  if (params?.search) {
    const s = params.search.toLowerCase();
    reports = reports.filter(r => r.title.toLowerCase().includes(s) || r.content.toLowerCase().includes(s));
  }
  if (params?.startDate) {
    reports = reports.filter(r => r.weekStart >= params.startDate!);
  }
  if (params?.endDate) {
    reports = reports.filter(r => r.weekStart <= params.endDate!);
  }
  if (params?.tag) {
    reports = reports.filter(r => r.tags.includes(params.tag!));
  }
  
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const total = reports.length;
  reports = reports.slice((page - 1) * pageSize, page * pageSize);
  
  return { reports: reports.map(r => ({ ...r, tags: r.tags.split(',').filter(Boolean) })), total };
}

export async function getReportById(id: string) {
  await delay(100);
  const db = getDB();
  const report = db.reports.find(r => r.id === id);
  if (!report) throw new Error('周报不存在');
  return { report: { ...report, tags: report.tags.split(',').filter(Boolean) } };
}

export async function createReport(data: { title: string; weekStart: string; content: string; tags: string; status: string; commentEnabled: boolean }) {
  await delay(200);
  const db = getDB();
  const user = await getMe();
  if (!user) throw new Error('未登录');
  const now = new Date().toISOString();
  const report = {
    id: generateId(),
    ...data,
    createdAt: now,
    updatedAt: now,
    authorId: user.user.id,
    shareLink: generateId()
  };
  db.reports.push(report);
  db.versions.push({ id: generateId(), reportId: report.id, content: data.content, createdAt: now });
  saveDB(db);
  return { report: { ...report, tags: report.tags.split(',').filter(Boolean) } };
}

export async function updateReport(id: string, data: { title: string; weekStart: string; content: string; tags: string; status: string; commentEnabled: boolean }) {
  await delay(200);
  const db = getDB();
  const user = await getMe();
  if (!user) throw new Error('未登录');
  const idx = db.reports.findIndex(r => r.id === id && r.authorId === user.user.id);
  if (idx === -1) throw new Error('周报不存在或无权限');
  const now = new Date().toISOString();
  db.reports[idx] = { ...db.reports[idx], ...data, updatedAt: now };
  db.versions.push({ id: generateId(), reportId: id, content: data.content, createdAt: now });
  saveDB(db);
  return { report: { ...db.reports[idx], tags: db.reports[idx].tags.split(',').filter(Boolean) } };
}

export async function deleteReport(id: string) {
  await delay(200);
  const db = getDB();
  const user = await getMe();
  if (!user) throw new Error('未登录');
  const idx = db.reports.findIndex(r => r.id === id && r.authorId === user.user.id);
  if (idx === -1) throw new Error('周报不存在或无权限');
  db.reports.splice(idx, 1);
  db.comments = db.comments.filter(c => c.reportId !== id);
  db.versions = db.versions.filter(v => v.reportId !== id);
  saveDB(db);
  return { success: true };
}

export async function getComments(reportId: string) {
  await delay(100);
  const db = getDB();
  const comments = db.comments.filter(c => c.reportId === reportId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return { comments };
}

export async function createComment(reportId: string, data: { authorName: string; content: string; parentId?: string | null }) {
  await delay(200);
  const db = getDB();
  const report = db.reports.find(r => r.id === reportId);
  if (!report) throw new Error('周报不存在');
  if (!report.commentEnabled) throw new Error('评论已关闭');
  const comment = {
    id: generateId(),
    reportId,
    authorName: data.authorName,
    content: data.content,
    parentId: data.parentId || null,
    createdAt: new Date().toISOString()
  };
  db.comments.push(comment);
  saveDB(db);
  return { comment };
}

export async function deleteComment(id: string) {
  await delay(200);
  const db = getDB();
  const user = await getMe();
  const idx = db.comments.findIndex(c => c.id === id);
  if (idx === -1) throw new Error('评论不存在');
  if (!user || user.user.role !== 'admin') throw new Error('无权限');
  db.comments.splice(idx, 1);
  saveDB(db);
  return { success: true };
}

export async function getVersions(reportId: string) {
  await delay(100);
  const db = getDB();
  const versions = db.versions.filter(v => v.reportId === reportId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { versions };
}

export async function getVersion(versionId: string) {
  await delay(100);
  const db = getDB();
  const version = db.versions.find(v => v.id === versionId);
  if (!version) throw new Error('版本不存在');
  return { version };
}

export async function saveDraft(reportId: string, content: string) {
  await delay(100);
  const db = getDB();
  const idx = db.drafts.findIndex(d => d.reportId === reportId);
  if (idx !== -1) {
    db.drafts[idx].content = content;
    db.drafts[idx].savedAt = new Date().toISOString();
  } else {
    db.drafts.push({ id: generateId(), reportId, content, savedAt: new Date().toISOString() });
  }
  saveDB(db);
  return { success: true };
}

export async function getDraft(reportId: string) {
  await delay(100);
  const db = getDB();
  const draft = db.drafts.find(d => d.reportId === reportId);
  return { draft: draft || null };
}

export async function getCalendar(month: string) {
  await delay(100);
  const db = getDB();
  const [year, monthNum] = month.split('-').map(Number);
  const start = new Date(year, monthNum - 1, 1);
  const end = new Date(year, monthNum, 0);
  const startStr = start.toISOString().split('T')[0];
  const endStr = end.toISOString().split('T')[0];
  
  const reports = db.reports.filter(r => r.weekStart >= startStr && r.weekStart <= endStr);
  const attendance = db.attendance.filter(a => a.date >= startStr && a.date <= endStr);
  
  const reportDates = new Set<string>();
  reports.forEach(r => {
    const ws = new Date(r.weekStart);
    for (let i = 0; i < 5; i++) {
      const d = new Date(ws);
      d.setDate(d.getDate() + i);
      reportDates.add(d.toISOString().split('T')[0]);
    }
  });
  
  return { month, reports: reports.length, attendance, reportDates: Array.from(reportDates) };
}

export async function getShareToken(shareLink: string) {
  await delay(100);
  const db = getDB();
  const report = db.reports.find(r => r.shareLink === shareLink);
  if (!report) throw new Error('链接无效');
  return { report: { ...report, tags: report.tags.split(',').filter(Boolean) } };
}

export async function getShareReport(shareLink: string) {
  await delay(100);
  const db = getDB();
  const report = db.reports.find(r => r.shareLink === shareLink);
  if (!report) throw new Error('链接无效');
  return { report: { ...report, tags: report.tags.split(',').filter(Boolean) } };
}

export async function uploadFile(file: File) {
  await delay(500);
  // 纯前端模拟，使用 FileReader 读取文件，返回一个伪 URL
  return new Promise<{ url: string; name: string }>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const blob = new Blob([reader.result!], { type: file.type });
      const url = URL.createObjectURL(blob);
      resolve({ url, name: file.name });
    };
    reader.readAsArrayBuffer(file);
  });
}

export function resetData() {
  localStorage.removeItem(DB_KEY);
  localStorage.removeItem('weekly_auth_token');
}

export const apiRequest = async (method: string, endpoint: string, body?: any) => {
  throw new Error('请使用 mockApi 中的直接函数调用');
};
