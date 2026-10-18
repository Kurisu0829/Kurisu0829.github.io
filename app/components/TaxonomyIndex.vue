<script setup lang="ts">
const props = defineProps<{ type: 'tags' | 'categories' }>()
const { tags, categories, posts } = useBlog()
const items = computed(() => props.type === 'tags' ? tags : categories)
const title = computed(() => props.type === 'tags' ? '标签' : '分类')
usePageSeo(title)
</script>
<template>
  <header class="page-heading"><p class="eyebrow">{{ type === 'tags' ? 'FOLLOW A THREAD' : 'EXPLORE BY TOPIC' }}</p><h1>{{ type === 'tags' ? '从一个关键词开始' : '换个角度读日常' }}<span class="accent">。</span></h1><p>{{ posts.length }} 篇文章，{{ items.length }} 个{{ title }}。</p></header>
  <div class="taxonomy-grid"><NuxtLink v-for="item in items" :key="item.slug" :to="`/${type}/${item.slug}/`" class="taxonomy-card"><span class="taxonomy-symbol" aria-hidden="true">{{ type === 'tags' ? '#' : '▦' }}</span><h2>{{ item.name }}</h2><p>{{ item.count }} 篇文章</p><span class="taxonomy-arrow" aria-hidden="true">↗</span></NuxtLink></div>
  <p v-if="!items.length" class="empty-state">还没有{{ title }}。</p>
</template>
