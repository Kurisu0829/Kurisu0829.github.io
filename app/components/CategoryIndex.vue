<script setup lang="ts">
const { categories, posts } = useBlog()
usePageSeo('分类')
</script>
<template>
  <header class="page-heading"><p class="eyebrow">EXPLORE BY TOPIC</p><h1>换个角度读日常<span class="accent">。</span></h1><p>{{ posts.length }} 篇文章，{{ categories.length }} 个分类。</p></header>
  <div class="category-grid"><NuxtLink v-for="item in categories" :key="item.slug" :to="categoryPath(item.name)" class="category-card"><span class="category-symbol" aria-hidden="true">▦</span><h2>{{ item.name }}</h2><p>{{ item.count }} 篇文章</p><span class="category-arrow" aria-hidden="true">↗</span></NuxtLink></div>
  <p v-if="!categories.length" class="empty-state">还没有分类。</p>
</template>
