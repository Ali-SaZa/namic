// stores/deviceStore.js
import { defineStore } from 'pinia';
import { ref, computed, onMounted } from 'vue';
import { UAParser } from 'ua-parser-js';

// کلید ذخیره‌سازی در LocalStorage
const LS_KEY = 'device_info';

export const useDeviceStore = defineStore('device', () => {
  // وضعیت خام دستگاه
  const deviceData = ref(null);

  // وضعیت فرمت‌شده دستگاه (مطابق فرمت مورد نظر شما)
  const deviceInfo = computed(() => {
    if (!deviceData.value) return null;
    const { browser, device, os } = deviceData.value;
    return `browser|${browser.name || 'none'}|${device.type || 'none'}|${browser.version || 'none'}|${os.name || 'none'}|${os.version || 'none'}`;
  });

  // تشخیص اطلاعات دستگاه و ذخیره در LocalStorage
  const detectDevice = () => {
    const parser = new UAParser();
    const result = parser.getResult();
    deviceData.value = {
      browser: result.browser,
      device: result.device,
      os: result.os
    };
    localStorage.setItem(LS_KEY, JSON.stringify(deviceData.value));
  };

  // بارگذاری اطلاعات از LocalStorage (اگر وجود دارد)
  const loadFromLocalStorage = () => {
    const savedData = localStorage.getItem(LS_KEY);
    if (savedData) {
      deviceData.value = JSON.parse(savedData);
    }
  };

  // مقداردهی اولیه (هنگام mount شدن استور)
  onMounted(() => {
    loadFromLocalStorage();
    if (!deviceData.value) {
      detectDevice();
    }
  });

  return {
    deviceData,
    deviceInfo,
    detectDevice,
  };
});
