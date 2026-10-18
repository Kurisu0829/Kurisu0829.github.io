<script setup lang="ts">
import type { NuxtError } from '#app'
defineProps<{ error: NuxtError }>()
useSeoMeta({ title: '页面未找到', robots: 'noindex' })
</script>
<template>
  <NuxtLayout><section class="error-page"><p class="eyebrow">{{ error.statusCode }}</p><h1>{{ error.statusCode === 404 ? '这一页，暂时空白。' : '页面暂时遇到了一点问题。' }}</h1><p>可以回到首页，继续翻阅其他记录。</p><a href="/" class="primary-link">返回首页 ↗</a></section></NuxtLayout>
</template>
