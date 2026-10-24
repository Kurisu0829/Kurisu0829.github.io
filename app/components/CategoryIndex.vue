<script setup lang="ts">
const { categories } = useBlog()
usePageSeo('分类')
</script>
<template>
  <h1 class="sr-only">分类</h1>
  <div class="category-grid"><NuxtLink v-for="item in categories" :key="item.slug" :to="categoryPath(item.name)" class="category-card"><span class="category-symbol" aria-hidden="true">▦</span><h2>{{ item.name }}</h2><p>{{ item.count }} 篇文章</p><span class="category-arrow" aria-hidden="true">↗</span></NuxtLink></div>
  <p v-if="!categories.length" class="empty-state">还没有分类。</p>
</template>
