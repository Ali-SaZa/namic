<script setup>
import { RouterView, useRoute } from 'vue-router';
import { computed, onMounted } from 'vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import EmptyLayout from '@/layouts/EmptyLayout.vue';
import { useDeviceStore } from '@/stores/deviceStore';
import PWAInstallPrompt from '@/components/PWAInstallPrompt.vue';

const deviceStore = useDeviceStore();

const route = useRoute();
const layout = computed(() => route.meta.layout === 'DefaultLayout' ? DefaultLayout : EmptyLayout);

onMounted(() => {
  deviceStore.detectDevice();
  if (localStorage.theme === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});
</script>

<template>
  <Component :is="layout">
    <PWAInstallPrompt/>
    <Toast/>
    <RouterView/>
  </Component>
</template>


<style>
:deep(.p-toast-message) {
  direction: rtl !important;
}
</style>
