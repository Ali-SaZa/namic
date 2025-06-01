<template>
  <Dialog
    v-model:visible="showInstallPrompt"
    :style="{ width: '90vw', maxWidth: '500px' }"
    :modal="true"
    :closable="false"
    :showHeader="false"
  >
    <div class="flex flex-col items-center p-6">
      <i class="pi pi-download text-6xl text-primary mb-4"></i>
      <h3 class="text-xl font-bold text-gray-800 mb-2">نصب اپلیکیشن</h3>
      <p class="text-gray-600 text-center mb-6">
        برای دسترسی سریع‌تر و تجربه بهتر، اپلیکیشن را روی دستگاه خود نصب کنید
      </p>
      <div class="flex gap-3 w-full">
        <Button
          label="بعداً"
          icon="pi pi-times"
          class="w-full"
          iconPos="right"
          @click="dismissPrompt"
          severity="warn"
        />
        <Button
          label="نصب برنامه"
          icon="pi pi-check"
          class="p-button-primary w-full"
          iconPos="right"
          @click="installApp"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const showInstallPrompt = ref(false);
let deferredPrompt = null;

const shouldShowPrompt = () => {
  const dismissedTime = localStorage.getItem('pwaPromptDismissed');

  if (!dismissedTime) return true;

  const now = new Date();
  const dismissedDate = new Date(dismissedTime);
  const oneWeekInMs = 7 * 24 * 60 * 60 * 1000; // ۱ هفته به میلی‌ثانیه

  return (now - dismissedDate) > oneWeekInMs;
};

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    if (shouldShowPrompt()) {
      showInstallPrompt.value = true;
    }
  });
});

const installApp = async () => {
  if (!deferredPrompt) return;

  showInstallPrompt.value = false;
  deferredPrompt.prompt();

  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    console.log('کاربر نصب را پذیرفت');
  } else {
    console.log('کاربر نصب را رد کرد');
  }

  deferredPrompt = null;
};

const dismissPrompt = () => {
  showInstallPrompt.value = false;
  localStorage.setItem('pwaPromptDismissed', new Date().toISOString());
};
</script>
