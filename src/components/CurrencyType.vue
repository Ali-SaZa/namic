<script setup>
import { useSettingsStore } from '@/stores/userSettings.js'
import { computed } from 'vue'

const settingsStore = useSettingsStore()

const currencyType = computed(() => {
  return settingsStore.settings?.MoneyUnit === '2' ? 'تومان' : 'ریال'
})
</script>

<template>
  <span>{{ currencyType }}</span>
</template>

<style scoped>

</style>
