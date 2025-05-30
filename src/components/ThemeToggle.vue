<template>
  <ToggleSwitch
    :modelValue="themeStore.isDark"
    @update:modelValue="handleToggle"
    class="theme-toggle"
    :pt="{
      root: { class: 'w-12 h-6' },
      slider: { class: 'before:w-5 before:h-5' }
    }"
  >
    <template #handle="{ checked }">
      <i :class="['!text-xs pi', { 'pi-moon': checked, 'pi-sun': !checked }]" />
    </template>
  </ToggleSwitch>
</template>

<script setup>
import { onMounted } from 'vue'
import ToggleSwitch from 'primevue/toggleswitch'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

const handleToggle = () => {
  themeStore.toggleDarkMode()
}

// مقداردهی اولیه تم
onMounted(() => {
  themeStore.initializeTheme()
})
</script>

<style scoped>
.theme-toggle {
  --primevue-switch-on-bg: #4b5563;
  --primevue-switch-off-bg: #d1d5db;
}

.dark .theme-toggle {
  --primevue-switch-on-bg: #9ca3af;
  --primevue-switch-off-bg: #374151;
}
</style>
