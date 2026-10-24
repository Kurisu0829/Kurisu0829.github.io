<script setup lang="ts">
import type { Post } from '~/types/blog'
definePageMeta({ key: route => route.path })
const route = useRoute()
const { posts, site } = useBlog()
const path = `${decodeURI(route.path).replace(/\/+$/, '')}/`
const summary = posts.find(post => post.path === path)
if (!summary) throw createError({ statusCode: 404, statusMessage: 'Post not found', message: `文章不存在：${path}` })
const { data: post, error } = await useAsyncData(`post:${summary.path}`, async () => {
  if (import.meta.server) {
    const documents = import.meta.glob('../generated/posts/*.json', { import: 'default' })
    const load = documents[`../generated/posts/${summary.contentFile.split('/').pop()}`]
    if (!load) throw new Error(`Missing post data: ${summary.path}`)
    return await load() as Post
  }
  return $fetch<Post>(summary.contentFile)
})
if (error.value || !post.value) {
  console.error('[blog] Failed to load post', summary.contentFile, error.value)
  throw createError({ statusCode: 404, statusMessage: 'Post data not found', message: '文章加载失败' })
}
usePageSeo(() => post.value!.title, () => post.value!.excerpt)
useSeoMeta({ ogType: 'article', articlePublishedTime: summary.date,
  articleModifiedTime: summary.updated || summary.date, articleAuthor: [site.author] })
useHead({ script: [{ type: 'application/ld+json', innerHTML: JSON.stringify({
  '@context': 'https://schema.org', '@type': 'BlogPosting', headline: summary.title,
  description: summary.excerpt, datePublished: summary.date, dateModified: summary.updated || summary.date,
  author: { '@type': 'Person', name: site.author, url: site.url },
  mainEntityOfPage: `${site.url}${summary.path}`,
}).replace(/</g, '\\u003c') }] })
const copied = ref(false)
const copyFailed = ref(false)
async function share() {
  copyFailed.value = false
  try {
    await navigator.clipboard.writeText(`${site.url}${summary!.path}`)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch { copied.value = false; copyFailed.value = true }
}
</script>

<template>
  <div v-if="post" class="article-page">
    <NuxtLink to="/" class="back-link">← 所有文章</NuxtLink>
    <header class="article-header">
      <div class="article-categories"><NuxtLink v-for="category in post.categories" :key="category" :to="categoryPath(category)">{{ category }}</NuxtLink></div>
      <h1>{{ post.title }}</h1>
      <div class="article-meta"><time :datetime="post.date">{{ formatDate(post.date) }}</time><span>{{ post.readingMinutes }} 分钟阅读</span><span>{{ post.words.toLocaleString('zh-CN') }} 字</span></div>
      <p v-if="post.updated" class="updated-date">更新于 {{ formatDate(post.updated) }}</p>
    </header>
    <div class="article-body-grid">
      <article class="prose" aria-label="文章正文" v-html="post.html" />
      <aside v-if="post.headings.length" class="toc" aria-label="文章目录"><details open><summary>本篇目录</summary><nav><a v-for="heading in post.headings" :key="heading.id" :href="`#${heading.id}`" :class="{ 'toc-sub': heading.level === 3 }">{{ heading.text }}</a></nav></details></aside>
    </div>
    <div class="article-end"><button type="button" class="text-button" @click="share">{{ copied ? '链接已复制 ✓' : copyFailed ? '请从地址栏复制链接' : '复制文章链接 ↗' }}</button><span class="sr-only" role="status">{{ copied ? '文章链接已复制' : copyFailed ? '复制失败，请从地址栏复制链接' : '' }}</span></div>
    <nav class="article-pagination" aria-label="相邻文章"><NuxtLink v-if="post.previous" :to="post.previous.path"><small>← 上一篇</small><span>{{ post.previous.title }}</span></NuxtLink><span v-else /><NuxtLink v-if="post.next" :to="post.next.path"><small>下一篇 →</small><span>{{ post.next.title }}</span></NuxtLink></nav>
  </div>
</template>
