<script setup lang="ts">
const { site, posts, categories } = useBlog()
usePageSeo('关于', `关于 ${site.author} 和这个记录生活、学习与日常想法的地方。`)
</script>
<template>
  <h1 class="sr-only">关于</h1>
  <section class="about-profile"><img :src="site.avatar" width="100" height="100" alt="Kurisu 的头像"><div><h2>{{ site.author }}</h2><p>{{ site.tagline }}</p></div></section>
  <div class="prose about-prose"><p>欢迎来到我的个人博客。</p><h2>随处逛逛</h2><p>可以从 <NuxtLink to="/">最近的文章</NuxtLink> 开始，也可以沿着 <NuxtLink to="/archives/">时间线</NuxtLink> 找到更早的记录。如果想持续关注，可以订阅 <a href="/feed.xml">RSS</a>。</p><h2>找到我</h2><div class="about-links"><a :href="site.github" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a :href="site.twitter" target="_blank" rel="noopener noreferrer">X / Twitter ↗</a><a :href="`mailto:${site.email}`">Email ↗</a></div></div>
  <div class="about-stats"><div><strong>{{ posts.length }}</strong><span>篇文章</span></div><div><strong>{{ categories.length }}</strong><span>个分类</span></div><div><strong>{{ posts.length ? formatDate(posts[0]!.date) : '—' }}</strong><span>最近一次记录</span></div></div>
</template>
