export * from './mockApi';

import {
  login as mockLogin,
  getMe,
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  getComments,
  createComment,
  deleteComment,
  getVersions,
  getVersion,
  saveDraft,
  getDraft,
  getCalendar,
  getShareToken,
  getShareReport,
} from './mockApi';

function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (obj === null || typeof obj !== 'object') return obj;
  const result: any = {};
  for (const [key, val] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
    result[snakeKey] = toSnakeCase(val);
  }
  return result;
}

function addWeekEnd(report: any): any {
  if (!report) return report;
  const r = { ...report };
  if (r.week_start && !r.week_end) {
    const d = new Date(r.week_start);
    d.setDate(d.getDate() + 4);
    r.week_end = d.toISOString().split('T')[0];
  }
  if (r.weekStart && !r.weekEnd) {
    const d = new Date(r.weekStart);
    d.setDate(d.getDate() + 4);
    r.weekEnd = d.toISOString().split('T')[0];
  }
  return r;
}

export async function apiRequest(method: string, endpoint: string, body?: any, token?: string) {
  await new Promise(r => setTimeout(r, 100 + Math.random() * 200));

  if (endpoint === '/auth/login' && method === 'POST') {
    return mockLogin(body.email, body.password);
  }
  if (endpoint === '/auth/me' && method === 'GET') {
    return getMe();
  }
  if (endpoint === '/reports' && method === 'GET') {
    const { reports } = await getReports(body);
    return reports.map((r: any) => toSnakeCase(addWeekEnd(r)));
  }
  if (endpoint.match(/^\/reports\/[^\/]+$/) && method === 'GET') {
    const id = endpoint.split('/')[2];
    const { report } = await getReportById(id);
    return toSnakeCase(addWeekEnd(report));
  }
  if (endpoint === '/reports' && method === 'POST') {
    const payload = {
      title: body.title,
      weekStart: body.week_start,
      content: body.content,
      tags: body.tags || '',
      status: body.status || 'published',
      commentEnabled: body.comment_enabled ?? true,
    };
    const { report } = await createReport(payload);
    return toSnakeCase(addWeekEnd(report));
  }
  if (endpoint.match(/^\/reports\/[^\/]+$/) && method === 'PUT') {
    const id = endpoint.split('/')[2];
    const payload = {
      title: body.title,
      weekStart: body.week_start,
      content: body.content,
      tags: body.tags || '',
      status: body.status || 'published',
      commentEnabled: body.comment_enabled ?? true,
    };
    const { report } = await updateReport(id, payload);
    return toSnakeCase(addWeekEnd(report));
  }
  if (endpoint.match(/^\/reports\/[^\/]+$/) && method === 'DELETE') {
    const id = endpoint.split('/')[2];
    return deleteReport(id);
  }
  if (endpoint.match(/^\/comments\/[^\/]+$/) && method === 'GET') {
    const reportId = endpoint.split('/')[2];
    const { comments } = await getComments(reportId);
    return toSnakeCase(comments);
  }
  if (endpoint.match(/^\/comments\/[^\/]+$/) && method === 'POST') {
    const reportId = endpoint.split('/')[2];
    const payload = {
      authorName: body.author_name || body.authorName,
      content: body.content,
      parentId: body.parent_id || body.parentId || null,
    };
    const { comment } = await createComment(reportId, payload);
    return toSnakeCase(comment);
  }
  if (endpoint.match(/^\/comments\/[^\/]+$/) && method === 'DELETE') {
    const id = endpoint.split('/')[2];
    return deleteComment(id);
  }
  if (endpoint.match(/^\/reports\/[^\/]+\/versions$/) && method === 'GET') {
    const reportId = endpoint.split('/')[2];
    const { versions } = await getVersions(reportId);
    return toSnakeCase(versions);
  }
  if (endpoint.match(/^\/versions\/[^\/]+$/) && method === 'GET') {
    const id = endpoint.split('/')[2];
    const { version } = await getVersion(id);
    return toSnakeCase(version);
  }
  if (endpoint.match(/^\/reports\/[^\/]+\/draft$/) && method === 'POST') {
    const reportId = endpoint.split('/')[2];
    return saveDraft(reportId, body.content);
  }
  if (endpoint.match(/^\/reports\/[^\/]+\/draft$/) && method === 'GET') {
    const reportId = endpoint.split('/')[2];
    const { draft } = await getDraft(reportId);
    return toSnakeCase(draft);
  }
  if (endpoint === '/calendar' && method === 'GET') {
    return getCalendar(body?.month);
  }
  if (endpoint.match(/^\/share\/[^\/]+$/) && method === 'GET') {
    const shareLink = endpoint.split('/')[2];
    const { report } = await getShareToken(shareLink);
    return toSnakeCase(addWeekEnd(report));
  }
  if (endpoint.match(/^\/share\/[^\/]+\/report$/) && method === 'GET') {
    const shareLink = endpoint.split('/')[2];
    const { report } = await getShareReport(shareLink);
    return toSnakeCase(addWeekEnd(report));
  }
  if (endpoint.match(/^\/share\/[^\/]+$/) && method === 'POST') {
    const id = endpoint.split('/')[2];
    const { report } = await getReportById(id);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return { shareUrl: `${origin}/share/${report.shareLink}` };
  }

  throw new Error(`Not implemented: ${method} ${endpoint}`);
}
