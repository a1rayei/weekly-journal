# 我的工作周记

一个简约手帐风的个人工作周记网站，支持在线编辑周报、日历出勤视图、访客免登录评论。

## 特性

- 📖 **公开浏览** — 打开即看到完整内容，无需登录
- ✍️ **作者编辑** — 仅作者登录后可创建/编辑/删除周记
- 💬 **免登录评论** — 任何人填写名字即可跟帖评论
- 📅 **日历导航** — 查看当月出勤，点击工作日跳转对应周记
- 🔍 **搜索** — 按标题、内容、标签快速检索
- 🎨 **手帐风设计** — 暖色调、衬线标题、呼吸感留白

> 演示账号：`admin@weekly.local` / `admin123`
> 数据存储于浏览器 localStorage（纯前端版本）。

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 部署到 GitHub Pages

1. 在 GitHub 新建一个仓库（如 `weekly-journal`）。
2. 将本目录推送到该仓库的 `main` 分支：
   ```bash
   git init
   git add .
   git commit -m "init: 个人周记网站"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/<仓库名>.git
   git push -u origin main
   ```
3. 打开仓库 **Settings → Pages**，将 **Source** 设为 **GitHub Actions**。
4. 推送后会自动触发 `.github/workflows/deploy.yml` 构建并发布。
5. 访问 `https://<你的用户名>.github.io/<仓库名>/` 即可。

> 已使用 `HashRouter` + `base: './'`，无需额外配置即可在子路径下正常运行。
