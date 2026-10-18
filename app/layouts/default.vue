<script setup lang="ts">
const { site, posts, tags } = useBlog()
const route = useRoute()
const menuOpen = ref(false)
watch(() => route.fullPath, () => { menuOpen.value = false })
const navigation = [
  { path: '/', name: '文章', icon: '▤' },
  { path: '/archives/', name: '归档', icon: '◷' },
  { path: '/categories/', name: '分类', icon: '▦' },
  { path: '/tags/', name: '标签', icon: '＃' },
  { path: '/about/', name: '关于', icon: '○' },
]
function active(path: string) {
  return path === '/' ? route.path === '/' || route.path.startsWith('/page/') || route.path.startsWith('/posts/') : route.path.startsWith(path)
}
</script>

<template>
  <a class="skip-link" href="#main">跳转到内容</a>
  <div class="site-shell">
    <aside class="sidebar">
      <div class="brand-row">
        <NuxtLink to="/" class="brand" aria-label="Kurisu 首页">
          <img :src="site.avatar" alt="Kurisu 的头像" width="52" height="52">
          <span><strong>{{ site.title }}<span class="brand-dot">.</span></strong><small>生活 · 学习 · 随想</small></span>
        </NuxtLink>
        <button class="menu-toggle" type="button" :aria-expanded="menuOpen" aria-controls="site-navigation" @click="menuOpen = !menuOpen">{{ menuOpen ? '收起' : '菜单' }}</button>
      </div>
      <div id="site-navigation" class="sidebar-body" :class="{ 'is-open': menuOpen }">
        <NuxtLink to="/search/" class="search-link"><span>⌕</span> 搜索文章 <span class="search-hint">搜索</span></NuxtLink>
        <nav aria-label="主导航">
          <NuxtLink v-for="item in navigation" :key="item.path" :to="item.path" :class="['nav-link', { active: active(item.path) }]" :aria-current="active(item.path) ? 'page' : undefined">
            <span class="nav-icon" aria-hidden="true">{{ item.icon }}</span>{{ item.name }}<span v-if="item.path === '/'" class="nav-count">{{ posts.length }}</span>
          </NuxtLink>
        </nav>
        <div class="sidebar-note"><span class="eyebrow">A PERSONAL SPACE</span><p>记录那些值得<br>被记住的小事。</p></div>
        <div class="sidebar-bottom">
          <div class="social-links"><a :href="site.github" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href="/feed.xml">RSS ↗</a></div>
          <ThemeToggle />
        </div>
      </div>
    </aside>
    <div class="main-shell">
      <header class="topbar"><span>{{ site.tagline }}</span><span class="topbar-right"><span class="status-dot" /> 持续记录中</span></header>
      <main id="main" tabindex="-1"><slot /></main>
      <footer class="site-footer"><span>© {{ new Date().getFullYear() }} {{ site.author }}</span><span>{{ posts.length }} 篇记录 · {{ tags.length }} 个标签</span><a href="/sitemap.xml">站点地图 ↗</a></footer>
    </div>
  </div>
</template>
