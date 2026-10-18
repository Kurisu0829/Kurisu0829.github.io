<script setup lang="ts">
import type { PostSummary } from '~/types/blog'
defineProps<{ post: PostSummary; index?: number }>()
</script>

<template>
  <article class="post-card">
    <div class="post-card-top"><time :datetime="post.date">{{ formatDate(post.date) }}</time><span>{{ post.readingMinutes }} 分钟阅读</span></div>
    <h2><NuxtLink :to="post.path">{{ post.title }}<span class="post-arrow" aria-hidden="true">↗</span></NuxtLink></h2>
    <p class="post-excerpt">{{ post.excerpt }}</p>
    <div class="post-card-bottom"><div class="tag-list"><NuxtLink v-for="tag in post.tags" :key="tag" :to="taxonomyPath('tags', tag)" class="tag"># {{ tag }}</NuxtLink></div><span class="post-number" aria-hidden="true">{{ String((index ?? 0) + 1).padStart(2, '0') }}</span></div>
  </article>
</template>
