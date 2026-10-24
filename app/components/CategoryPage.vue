<script setup lang="ts">
const props = defineProps<{ slug: string }>()
const { categories, posts } = useBlog()
const category = computed(() => categories.find(item => item.slug === props.slug))
if (!category.value) throw createError({ statusCode: 404, statusMessage: 'Category not found', message: '分类不存在' })
const entries = computed(() => posts.filter(post => post.categories.includes(category.value?.name || '')))
usePageSeo(() => `${category.value?.name} · 分类`)
</script>
<template>
  <NuxtLink to="/categories/" class="back-link category-back-link">← 所有分类</NuxtLink>
  <h1 class="sr-only">{{ category?.name }}</h1>
  <PostList :posts="entries" />
</template>
