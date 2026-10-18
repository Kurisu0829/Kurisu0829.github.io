<script setup lang="ts">
const dark = ref(false)
onMounted(() => { dark.value = document.documentElement.dataset.theme === 'dark' })
function toggle() {
  dark.value = !dark.value
  const theme = dark.value ? 'dark' : 'light'
  document.documentElement.dataset.theme = theme
  try { localStorage.setItem('kurisu-theme', theme) } catch { /* Storage may be unavailable. */ }
}
</script>

<template>
  <button class="theme-toggle" type="button" :aria-label="dark ? '切换为浅色主题' : '切换为深色主题'" @click="toggle">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <path v-if="dark" d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />
      <template v-else><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></template>
    </svg>
    <span>外观</span>
  </button>
</template>
