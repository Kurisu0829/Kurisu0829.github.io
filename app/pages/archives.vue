<script setup lang="ts">
const { posts, site } = useBlog()
usePageSeo('归档', '按时间翻阅所有生活记录与文章。')
const groups = computed(() => {
  const years = new Map<string, typeof posts>()
  for (const post of posts) {
    const year = new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: site.timezone }).format(new Date(post.date))
    if (!years.has(year)) years.set(year, [])
    years.get(year)!.push(post)
  }
  return [...years].map(([year, entries]) => ({ year, posts: entries }))
})
</script>
<template>
  <h1 class="sr-only">归档</h1>
  <section v-for="group in groups" :key="group.year" class="archive-year"><h2>{{ group.year }}<span>{{ group.posts.length }} 篇</span></h2><div class="timeline"><NuxtLink v-for="post in group.posts" :key="post.path" :to="post.path" class="timeline-entry"><time :datetime="post.date">{{ formatDate(post.date, true) }}</time><span>{{ post.title }}</span><span aria-hidden="true">↗</span></NuxtLink></div></section>
</template>
