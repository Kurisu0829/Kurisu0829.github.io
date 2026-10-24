<script setup lang="ts">
definePageMeta({ key: route => route.path })
const route = useRoute()
</script>
<template><CategoryPage :slug="String(route.params.slug)" /></template>
