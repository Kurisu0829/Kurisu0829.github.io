<script setup lang="ts">
import type { PostSummary } from '~/types/blog'
withDefaults(defineProps<{ posts: PostSummary[]; offset?: number }>(), { offset: 0 })
</script>

<template><div class="post-grid"><PostCard v-for="(post, index) in posts" :key="post.path" :post="post" :index="offset + index" /></div><p v-if="!posts.length" class="empty-state">这里还没有文章，之后再来看看。</p></template>
