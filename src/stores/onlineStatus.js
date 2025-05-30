// stores/onlineStatusStore.js
import { defineStore } from 'pinia';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useApiPollingStore } from './apiPollingStore';
import { useUserStore } from './userStore.js';

const LS_KEY = 'user_online_status';

export const useOnlineStatusStore = defineStore('onlineStatus', () => {
  const authStore = useUserStore();
  const apiPollingStore = useApiPollingStore();

  // وضعیت آنلاین بودن واقعی (بررسی اینترنت)
  const isOnline = ref(true);

  // وضعیت دستی آفلاین/آنلاین (فقط برای ادمین)
  const isManualOffline = ref(
    localStorage.getItem(LS_KEY) === 'offline',
  );

  // وضعیت آنلاین ادمین (برای مشتری)
  const isAdminOnline = ref(false);

  // وضعیت نهایی کاربر
  const userStatus = computed(() => {
    if (authStore.userType === 1) {
      return isManualOffline.value ? false : isOnline.value;
    } else {
      return isAdminOnline.value;
    }
  });

  // تغییر وضعیت دستی (فقط برای ادمین)
  const toggleManualStatus = () => {
    if (authStore.userType !== 1) return;

    isManualOffline.value = !isManualOffline.value;
    localStorage.setItem(LS_KEY, isManualOffline.value ? 'offline' : 'online');
  };

  // بررسی وضعیت آنلاین/آفلاین مرورگر
  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine;
  };

  // تنظیم event listeners
  onMounted(() => {
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    // اگر کاربر مشتری است، وضعیت ادمین را رصد می‌کند
    if (authStore.userType === 4) {
      apiPollingStore.addPollingTask({
        requestName: 'getAdminState',
        threshold: 5000,
        // TODO enable this
        isActive: true,
      });

      // واکنش به تغییرات در lastResponse
      const task = apiPollingStore.getTask('getAdminState');
      if (task) {
        watch(
          () => task.lastResponse,
          (newValue) => {
            isAdminOnline.value = newValue === 1;
          },
          { immediate: true }, // برای مقداردهی اولیه
        );
      }
    }
  });

  // پاک کردن event listeners
  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus);
    window.removeEventListener('offline', updateOnlineStatus);

    if (authStore.userType === 4) {
      apiPollingStore.removePollingTask('getAdminState');
    }
  });

  return {
    isOnline,
    isManualOffline,
    isAdminOnline,
    userStatus,
    toggleManualStatus,
  };
});
