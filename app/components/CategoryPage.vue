<script setup lang="ts">
const props = defineProps<{ slug: string }>()
const { categories, posts } = useBlog()
const category = computed(() => categories.find(item => item.slug === props.slug))
if (!category.value) throw createError({ statusCode: 404, statusMessage: 'Category not found', message: '分类不存在' })
const entries = computed(() => posts.filter(post => post.categories.includes(category.value?.name || '')))
usePageSeo(() => `${category.value?.name} · 分类`)
</script>
<template>
  <NuxtLink to="/categories/" class="back-link">← 所有分类</NuxtLink>
  <header class="page-heading"><p class="eyebrow">CATEGORY</p><h1>{{ category?.name }}<span class="accent">。</span></h1><p>这里有 {{ entries.length }} 篇相关记录。</p></header>
  <PostList :posts="entries" />
</template>
