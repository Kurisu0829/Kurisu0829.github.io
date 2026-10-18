<script setup lang="ts">
const props = defineProps<{ type: 'tags' | 'categories'; slug: string }>()
const { tags, categories, posts } = useBlog()
const taxon = computed(() => (props.type === 'tags' ? tags : categories).find(item => item.slug === props.slug))
if (!taxon.value) throw createError({ statusCode: 404, statusMessage: 'Topic not found', message: '分类或标签不存在' })
const entries = computed(() => posts.filter(post => post[props.type].includes(taxon.value?.name || '')))
usePageSeo(() => `${taxon.value?.name} · ${props.type === 'tags' ? '标签' : '分类'}`)
</script>
<template>
  <NuxtLink :to="`/${type}/`" class="back-link">← 所有{{ type === 'tags' ? '标签' : '分类' }}</NuxtLink>
  <header class="page-heading"><p class="eyebrow">{{ type === 'tags' ? 'TAG' : 'CATEGORY' }}</p><h1>{{ taxon?.name }}<span class="accent">。</span></h1><p>这里有 {{ entries.length }} 篇相关记录。</p></header>
  <PostList :posts="entries" />
</template>
