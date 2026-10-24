<script setup lang="ts">
import type { SearchEntry } from '~/types/blog'
const route = useRoute()
const router = useRouter()
const query = ref('')
const entries = ref<SearchEntry[]>([])
const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
const error = ref(false)
async function refresh() {
  status.value = 'pending'
  error.value = false
  try {
    entries.value = await $fetch<SearchEntry[]>('/_content/search.json')
    status.value = 'success'
  } catch {
    error.value = true
    status.value = 'error'
  }
}
onMounted(() => {
  query.value = String(route.query.q || '')
  void refresh()
})
usePageSeo('搜索', '搜索博客中的文章标题、分类和正文。')
useSeoMeta({ robots: 'noindex, follow' })
const terms = computed(() => query.value.trim().toLocaleLowerCase('zh-CN').split(/\s+/).filter(Boolean))
const results = computed(() => !terms.value.length ? [] : entries.value.filter(entry => {
  const haystack = `${entry.title} ${entry.categories.join(' ')} ${entry.text}`.toLocaleLowerCase('zh-CN')
  return terms.value.every(term => haystack.includes(term))
}).map(entry => {
  const index = entry.text.toLocaleLowerCase('zh-CN').indexOf(terms.value[0]!)
  const start = Math.max(0, index - 32)
  return { ...entry, snippet: `${start ? '…' : ''}${entry.text.slice(start, start + 150)}…` }
}))
let timer: ReturnType<typeof setTimeout> | undefined
watch(query, value => {
  clearTimeout(timer)
  if (value === String(route.query.q || '')) return
  timer = setTimeout(() => { void router.replace({ query: value.trim() ? { q: value } : {} }) }, 250)
})
watch(() => route.query.q, value => { query.value = String(value || '') })
onBeforeUnmount(() => clearTimeout(timer))
</script>
<template>
  <h1 class="sr-only">搜索</h1>
  <form class="search-form" role="search" @submit.prevent><label for="article-search" class="sr-only">搜索文章</label><span aria-hidden="true">⌕</span><input id="article-search" v-model="query" type="search" placeholder="输入关键词，比如：房租、生活……" autocomplete="off"><button v-if="query" type="button" @click="query = ''">清除</button></form>
  <div aria-live="polite">
    <p v-if="status === 'pending'" class="empty-state">正在准备搜索…</p>
    <div v-else-if="error" class="empty-state"><p>搜索数据暂时加载失败。</p><button class="text-button" @click="refresh()">重新加载</button></div>
    <p v-else-if="!terms.length" class="search-intro">试试一个关键词，看看它出现在哪些日常里。</p>
    <template v-else><p class="search-summary">找到 {{ results.length }} 篇相关文章</p><div class="search-results"><article v-for="result in results" :key="result.path" class="search-result"><time :datetime="result.date">{{ formatDate(result.date) }}</time><h2><NuxtLink :to="result.path">{{ result.title }} ↗</NuxtLink></h2><p>{{ result.snippet }}</p></article></div><p v-if="!results.length" class="empty-state">还没有找到，换一个关键词试试。</p></template>
  </div>
</template>
