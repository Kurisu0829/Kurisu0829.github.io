<script setup lang="ts">
const props = withDefaults(defineProps<{ page?: number }>(), { page: 1 })
const { site, posts, pageCount, categories } = useBlog()
const currentPosts = computed(() => posts.slice((props.page - 1) * site.pageSize, props.page * site.pageSize))
usePageSeo(() => props.page === 1 ? '文章' : `文章 · 第 ${props.page} 页`)
</script>

<template>
  <h1 class="sr-only">{{ page === 1 ? '文章' : `文章 · 第 ${page} 页` }}</h1>
  <section aria-labelledby="articles-title">
    <div class="section-heading"><h2 id="articles-title">{{ page === 1 ? '最近的记录' : `更早的记录 · 第 ${page} 页` }} <span>{{ posts.length }}</span></h2><NuxtLink to="/archives/">按时间浏览 ↗</NuxtLink></div>
    <div class="filter-row"><span class="filter-pill selected">全部文章</span><NuxtLink v-for="category in categories" :key="category.slug" :to="`/categories/${category.slug}/`" class="filter-pill">{{ category.name }} <span>{{ category.count }}</span></NuxtLink></div>
    <PostList :posts="currentPosts" :offset="(page - 1) * site.pageSize" />
    <nav v-if="pageCount > 1" class="pagination" aria-label="文章分页"><NuxtLink v-if="page > 1" :to="page === 2 ? '/' : `/page/${page - 1}/`">← 较新的文章</NuxtLink><span v-else /><span>{{ page }} / {{ pageCount }}</span><NuxtLink v-if="page < pageCount" :to="`/page/${page + 1}/`">更早的文章 →</NuxtLink><span v-else /></nav>
  </section>
</template>
