import { supabase, AUTHOR_EMAIL, AUTHOR_PASSWORD } from './supabaseClient';

// 统一的 REST 风格适配层：把 apiRequest(method, endpoint, body) 映射到 Supabase 调用
// 返回的数据字段统一为前端使用的 snake_case，与原 mock 接口保持一致。

function isAuthor(): boolean {
  return localStorage.getItem('token') === 'author-ok';
}

export function clearAuthToken() {
  localStorage.removeItem('token');
}

async function login(email: string, password: string) {
  if (email.trim().toLowerCase() === AUTHOR_EMAIL && password === AUTHOR_PASSWORD) {
    localStorage.setItem('token', 'author-ok');
    return { user: { id: '1', email: AUTHOR_EMAIL, name: 'rei', role: 'admin' } };
  }
  throw new Error('邮箱或密码错误');
}

function getMe() {
  if (isAuthor()) {
    return { user: { id: '1', email: AUTHOR_EMAIL, name: 'rei', role: 'admin' } };
  }
  return null;
}

// 计算 week_end（若缺失）
function withWeekEnd(r: any) {
  if (!r) return r;
  const out = { ...r };
  if (out.week_start && !out.week_end) {
    const d = new Date(out.week_start);
    d.setDate(d.getDate() + 4);
    out.week_end = d.toISOString().split('T')[0];
  }
  return out;
}

export async function apiRequest(method: string, endpoint: string, body?: any) {
  // ---------- 认证 ----------
  if (endpoint === '/auth/login' && method === 'POST') {
    return login(body.email, body.password);
  }
  if (endpoint === '/auth/me' && method === 'GET') {
    return getMe();
  }

  // ---------- 周报列表 ----------
  if (endpoint === '/reports' && method === 'GET') {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('week_start', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(withWeekEnd);
  }

  // ---------- 单篇周报 ----------
  if (endpoint.match(/^\/reports\/[^/]+$/) && method === 'GET') {
    const id = endpoint.split('/')[2];
    const { data, error } = await supabase.from('reports').select('*').eq('id', id).single();
    if (error) throw new Error('周报不存在');
    return withWeekEnd(data);
  }

  // ---------- 新建周报 ----------
  if (endpoint === '/reports' && method === 'POST') {
    if (!isAuthor()) throw new Error('仅作者可发布周记');
    const payload = {
      title: body.title,
      content: body.content,
      tags: body.tags || '',
      week_start: body.week_start,
      week_end: body.week_end,
      comment_enabled: body.comment_enabled ?? true,
    };
    const { data, error } = await supabase.from('reports').insert(payload).select().single();
    if (error) throw new Error(error.message);
    return withWeekEnd(data);
  }

  // ---------- 更新周报 ----------
  if (endpoint.match(/^\/reports\/[^/]+$/) && method === 'PUT') {
    if (!isAuthor()) throw new Error('仅作者可编辑周记');
    const id = endpoint.split('/')[2];
    const payload = {
      title: body.title,
      content: body.content,
      tags: body.tags || '',
      week_start: body.week_start,
      week_end: body.week_end,
      comment_enabled: body.comment_enabled ?? true,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('reports').update(payload).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return withWeekEnd(data);
  }

  // ---------- 删除周报 ----------
  if (endpoint.match(/^\/reports\/[^/]+$/) && method === 'DELETE') {
    if (!isAuthor()) throw new Error('仅作者可删除周记');
    const id = endpoint.split('/')[2];
    const { error } = await supabase.from('reports').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  }

  // ---------- 评论列表 ----------
  if (endpoint.match(/^\/comments\/[^/]+$/) && method === 'GET') {
    const reportId = endpoint.split('/')[2];
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  }

  // ---------- 发表评论（免登录）----------
  if (endpoint.match(/^\/comments\/[^/]+$/) && method === 'POST') {
    const reportId = endpoint.split('/')[2];
    const base: any = {
      report_id: reportId,
      author_name: body.author_name || body.authorName,
      content: body.content,
      parent_id: body.parent_id || body.parentId || null,
    };
    // 优先带 edit_token；若该列尚未迁移则自动降级重试
    let res = await supabase.from('comments').insert({ ...base, edit_token: body.edit_token || null }).select().single();
    if (res.error && /edit_token/.test(res.error.message)) {
      res = await supabase.from('comments').insert(base).select().single();
    }
    if (res.error) throw new Error(res.error.message);
    return res.data;
  }

  // ---------- 编辑评论（作者 或 持有 edit_token 的发布者）----------
  if (endpoint.match(/^\/comments\/[^/]+$/) && method === 'PUT') {
    const id = endpoint.split('/')[2];
    if (!isAuthor()) {
      const { data: existing } = await supabase.from('comments').select('edit_token').eq('id', id).single();
      if (!existing || !body.edit_token || (existing as any).edit_token !== body.edit_token) {
        throw new Error('无权编辑该评论');
      }
    }
    const { data, error } = await supabase.from('comments').update({ content: body.content }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  // ---------- 删除评论（作者 或 持有 edit_token 的发布者）----------
  if (endpoint.match(/^\/comments\/[^/]+$/) && method === 'DELETE') {
    const id = endpoint.split('/')[2];
    if (!isAuthor()) {
      const token = body?.edit_token;
      const { data: existing } = await supabase.from('comments').select('edit_token').eq('id', id).single();
      if (!existing || !token || (existing as any).edit_token !== token) {
        throw new Error('无权删除该评论');
      }
    }
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  }

  // ---------- 点赞 / 送花 ----------
  if (endpoint.match(/^\/reports\/[^/]+\/react$/) && method === 'POST') {
    const id = endpoint.split('/')[2];
    const field = body.type === 'flower' ? 'flowers' : 'likes';
    const { data: cur, error: e1 } = await supabase.from('reports').select(field).eq('id', id).single();
    if (e1) throw new Error(e1.message);
    const next = ((cur as any)?.[field] ?? 0) + (body.delta === -1 ? -1 : 1);
    const { data, error } = await supabase.from('reports').update({ [field]: Math.max(0, next) }).eq('id', id).select(field).single();
    if (error) throw new Error(error.message);
    return data;
  }

  throw new Error(`Not implemented: ${method} ${endpoint}`);
}
