import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import repository from '@/api/api.repository.js';

export const useApiPollingStore = defineStore('apiPolling', () => {
  // State
  const pollingTasks = ref([]);

  const activeIntervals = ref({});

  // Actions
  const addPollingTask = (task) => {
    const existingIndex = pollingTasks.value.findIndex(
      t => t.requestName === task.requestName,
    );

    const fullTask = {
      isActive: true,
      lastResponse: null,
      lastError: null,
      isLoading: false,
      lastFetchTime: null,
      retryCount: 0,
      ...task,
    };

    if (existingIndex !== -1) {
      pollingTasks.value[existingIndex] = {
        ...pollingTasks.value[existingIndex],
        ...fullTask,
      };
    } else {
      pollingTasks.value.push(fullTask);
    }

    if (fullTask.isActive) {
      startPolling(fullTask.requestName);
    }
  };

  const removePollingTask = (requestName) => {
    stopPolling(requestName);
    pollingTasks.value = pollingTasks.value.filter(
      task => task.requestName !== requestName,
    );
  };

  const startPolling = (requestName) => {
    stopPolling(requestName); // ابتدا interval قبلی را متوقف می‌کنیم

    const task = pollingTasks.value.find(
      t => t.requestName === requestName,
    );

    if (!task) return;

    // اجرای اولیه
    executeTask(task);

    // تنظیم interval
    activeIntervals.value[requestName] = setInterval(() => {
      executeTask(task);
    }, task.threshold);
  };

  const stopPolling = (requestName) => {
    if (activeIntervals.value[requestName]) {
      clearInterval(activeIntervals.value[requestName]);
      delete activeIntervals.value[requestName];
    }
  };

  const executeTask = async (task) => {
    if (!task.isActive || task.isLoading) return;

    try {
      task.isLoading = true;

      // فراخوانی API با استفاده از repository
      const response = await repository[task.requestName](task.requestData || {});

      task.lastResponse = response.data;
      task.lastError = null;
      task.lastFetchTime = new Date().toISOString();
    } catch (error) {
      task.lastError = error;
      console.error(`Error in polling task ${task.requestName}:`, error);
    } finally {
      task.isLoading = false;
    }
  };

  const toggleTask = (requestName, isActive) => {
    const task = pollingTasks.value.find(
      t => t.requestName === requestName,
    );

    if (!task) return;

    task.isActive = isActive;

    if (isActive) {
      startPolling(requestName);
    } else {
      stopPolling(requestName);
    }
  };

  // Getters
  const getTask = (requestName) => {
    return pollingTasks.value.find(
      t => t.requestName === requestName,
    );
  };

  const activeTasks = computed(() => {
    return pollingTasks.value.filter(task => task.isActive);
  });

  // تمیز کردن intervals هنگام از بین رفتن استور
  const cleanup = () => {
    Object.keys(activeIntervals.value).forEach(requestName => {
      clearInterval(activeIntervals.value[requestName]);
    });
    activeIntervals.value = {};
  };

  pollingTasks.value.forEach(task => {
    if (task.isActive) {
      startPolling(task.requestName);
    }
  });

  return {
    pollingTasks,
    addPollingTask,
    removePollingTask,
    startPolling,
    stopPolling,
    toggleTask,
    cleanup,
    getTask,
    activeTasks,
  };
});
