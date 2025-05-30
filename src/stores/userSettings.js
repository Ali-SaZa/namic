// stores/settingsStore.js
import { defineStore } from 'pinia';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useApiPollingStore } from './apiPollingStore';

const DEFAULT_SETTINGS = { /* ... */ };

export const useSettingsStore = defineStore('settings', () => {
  const apiPollingStore = useApiPollingStore();
  const settings = ref({ ...DEFAULT_SETTINGS });
  const isLoading = ref(false);
  const error = ref(null);
  let stopWatcher = null;

  const updateSettings = (newSettings) => {
    if (newSettings && typeof newSettings === 'object') {
      settings.value = { ...DEFAULT_SETTINGS, ...newSettings };
    }
  };

  const setupSettingsWatcher = () => {
    const task = apiPollingStore.getTask('getSettings');

    if (!task) {
      console.error('getSettings task not found');
      return;
    }

    // حذف watcher قبلی اگر وجود داشت
    if (stopWatcher) stopWatcher();

    stopWatcher = watch(
      () => task.lastResponse,
      (newSettings) => {
        try {
          isLoading.value = true;
          updateSettings(newSettings?.settings);
          error.value = null;
        } catch (err) {
          error.value = 'Failed to update settings';
          console.error(err);
        } finally {
          isLoading.value = false;
        }
      },
      { immediate: true },
    );
  };

  onMounted(() => {
    apiPollingStore.addPollingTask({
      requestName: 'getSettings',
      threshold: 5000,
      // TODO: enable this
      isActive: false,
    });

    setupSettingsWatcher();
  });

  onUnmounted(() => {
    if (stopWatcher) stopWatcher();
    apiPollingStore.removePollingTask('getSettings');
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings, // در صورت نیاز به بروزرسانی دستی
  };
});
