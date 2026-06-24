import { createClient } from '@supabase/supabase-js';

// Supabase 云数据库配置（publishable/anon key 是公开可暴露的，仅前端读写，靠 RLS 策略保护）
const SUPABASE_URL = 'https://qlvhxcisibwgidxuattc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_4ikb4hsPdSWdZ2wwmYY_UQ_91BRDRCp';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

// 作者身份校验（前端门控）：只有作者能看到编辑/删除按钮。
// 由于使用公开匿名 key，数据写入由 RLS 放行，作者口令仅用于前端 UI 控制。
export const AUTHOR_EMAIL = 'admin@weekly.local';
export const AUTHOR_PASSWORD = 'admin123';
