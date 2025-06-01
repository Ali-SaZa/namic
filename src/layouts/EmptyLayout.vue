<template>
  <slot />
</template>

<script setup>
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme.js'

const themeStore = useThemeStore()
onMounted(() => {
  themeStore.initializeTheme()
})
</script>

<style scoped>

</style>
