<script setup lang="ts">
const route = useRoute()
const { pageCount } = useBlog()
const page = computed(() => Number(route.params.number))
if (!Number.isInteger(page.value) || page.value < 2 || page.value > pageCount) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', message: '页面不存在' })
}
</script>
<template><HomePage :page="page" /></template>
