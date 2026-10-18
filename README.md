# Kurisu 的个人博客

使用 Nuxt 4、Vue 3 和 TypeScript。Markdown 在构建时转换为文章数据，再由 Nuxt 预生成完整 HTML，部署在 GitHub Pages。线上不需要 Node 服务。

## 本地运行

需要 Node **24.15.0 或更新的 24.x 版本**；`.nvmrc` 指定 Node 24。包管理器版本在 `package.json` 的 `packageManager` 中锁定，可用 Corepack 或安装对应版本的 pnpm。

```sh
pnpm install
pnpm dev
```

## 写文章

继续将文章放在 `posts/YYYY-MM-DD-文章名.md`，原有文章无需修改：

```md
---
title: 一篇新的记录
date: 2026-10-18 12:00:00 +0800
categories: [日常]
tags: [生活]
---

## 从这里开始

正文支持 Markdown、代码高亮、图片和原生 HTML。
```

- 日期按 `Asia/Shanghai` 展示，文件名日期作为未填写 `date` 时的默认值。
- 默认链接沿用 `/posts/文章名/`，支持 `slug` 和 `permalink`；修改文件名时请用 `slug` 保留原链接。
- `draft: true`、`published: false` 和未来日期的文章不进入站点、搜索或 Feed。未来文章需要到期后再次构建才会发布。
- 保存文章后开发服务器会重新生成内容并刷新页面。
- 图片放入 `public/img/`，文章中通过 `/img/文件名` 引用；站点图标放入 `public/icons/`。站点配置集中在 `site.config.json`。
- 搜索覆盖标题、标签和正文，在浏览器本地进行。文章数很多时可替换搜索实现。
- 原始 HTML 只应来自可信的文章作者。

## 添加页面和交互

```text
app/
  pages/          页面路由；新增 tools.vue 即可访问 /tools/
  layouts/        共享站点布局
  components/     Vue 组件
  composables/    可复用逻辑
  assets/css/     全站样式和主题变量
scripts/
  content.mjs     Markdown、文章索引、搜索、Feed 与站点地图生成
  verify-output.mjs  静态页面、资源与内部链接校验
posts/           Markdown 文章原文
public/
  img/            文章图片与头像
  icons/          站点图标
site.config.json  站点信息
```

文章 JSON 按篇加载，首页只导入摘要索引。内容层使用 gray-matter 和 markdown-it，独立于页面组件；后续可以替换为 Nuxt Content 或 CMS。

新页面会被 Nuxt 静态生成；有参数的动态页面需要在 `nuxt.config.ts` 的 `nitro.prerender.routes` 中枚举，或确保它被预渲染页面的链接引用。新增页面后可在 `app/layouts/default.vue` 中添加导航。

GitHub Pages 可以运行浏览器中的 Vue 交互和调用外部 API，但不会运行 `server/api`、数据库或服务端鉴权。需要这些能力时可以接独立后端，或将 Nuxt 部署到支持服务端运行的平台。

## 验证与部署

```sh
pnpm test
pnpm typecheck
pnpm generate
pnpm verify
pnpm preview
```

生成目录是 `.output/public`，不要发布源码目录。仓库 Settings → Pages → Source 选择 **GitHub Actions**。推送 `main` / `master` 后，工作流会自动安装、测试、检查类型、生成页面、检查内部链接并发布。PR 只构建验证。

当前部署在 `https://kurisu0829.github.io/` 域名根路径；更换域名时同步修改 `site.config.json`。若以后迁移到 `/仓库名/` 子路径，必须同时适配 Nuxt baseURL、内容资源地址、Feed 和 sitemap。

本次迁移保留文章路径、分页、分类与标签入口；重新实现了阅读布局、全文搜索、响应式导航和深浅主题。旧版 `/sw.min.js` 保留为退役脚本，解除原 Chirpy Service Worker 的控制。首次回访若浏览器仍显示旧缓存，可刷新一次。

Jekyll 旧配置、主题和构建缓存已移除。静态资源直接由 Nuxt 的 `public/` 目录提供，不再保留重复副本。
