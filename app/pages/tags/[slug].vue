<script setup lang="ts">
definePageMeta({ key: route => route.path })
const route = useRoute()
</script>
<template><TaxonomyPage type="tags" :slug="String(route.params.slug)" /></template>
