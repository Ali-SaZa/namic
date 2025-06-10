import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAdminSettingsStore = defineStore('adminSettings', () => {
  // مقادیر پیش‌فرض
  const defaultSettings = {
    orderViewId: 1,
    requestViewId: 1,
    orderItemViewId: 1,
    itemBuyAndSellId: 1,
    showTick: false,
    showAdmin: false,
    quote: 25,
    appCurrency: 1,
    dailyShowView: 1,
  }

  const accountTypes = [
    { id: 1, name: 'مدیر سیستم', icon: 'fa-solid fa-user-shield' },
    { id: 2, name: 'اپراتور', icon: 'fa-solid fa-user-gear' },
    { id: 3, name: 'حسابدار', icon: 'fa-solid fa-dollar' },
    { id: 4, name: 'مشتری', icon: 'fa-solid fa-circle-user' },
  ]

  // گزینه‌های موجود برای هر بخش
  const viewOptions = {
    orderViews: [
      { id: 1, label: 'ساده', icon: 'fa fa-box' },
      { id: 2, label: 'پیشرفته', icon: 'fa fa-table-cells-large' },
    ],
    requestViews: [
      { id: 1, label: 'با جزئیات', icon: 'fa fa-file-lines' },
      { id: 2, label: 'خلاصه', icon: 'fa fa-grip-lines' },
    ],
    orderItemViews: [
      { id: 1, label: 'صفحه', icon: 'fa fa-file-lines' },
      { id: 2, label: 'گروه', icon: 'fa fa-grip-lines' },
    ],
    itemBuyAndSellStatuses: [
      { id: 1, label: 'فیلد قیمت', icon: 'fa fa-money-check-dollar' },
      { id: 2, label: 'لیست', icon: 'fa fa-table-list' },
      { id: 3, label: 'هردو', icon: 'fa fa-xmarks-lines' },
    ],
    appCurrency: [
      { id: 1, label: 'ریالIRR' },
      { id: 2, label: 'تومان IRT' },
    ],
    dailyShowView: [
      { id: 1, label: 'جدول' },
      { id: 2, label: 'کارت' },
    ],
  }

  const orderKinds = [
    { id: -1, label: 'خریدار' },
    { id: 0, label: 'خریدار - فروشنده' },
    { id: 1, label: 'فروشنده' },
  ]
  // بارگیری تنظیمات از localStorage با اعتبارسنجی
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('adminSettings')
      if (saved) {
        const parsed = JSON.parse(saved)
        // اعتبارسنجی ساختار داده
        return Object.keys(defaultSettings).every((key) => key in parsed) ? parsed : defaultSettings
      }
      return defaultSettings
    } catch (e) {
      console.error('Error loading settings:', e)
      return defaultSettings
    }
  }

  // مقادیر reactive
  const settings = ref(loadSettings())

  // ذخیره تنظیمات در localStorage
  const saveSettings = () => {
    try {
      localStorage.setItem('adminSettings', JSON.stringify(settings.value))
      return true
    } catch (e) {
      console.error('Error saving settings:', e)
      return false
    }
  }

  // بازنشانی به تنظیمات پیش‌فرض
  const resetSettings = () => {
    settings.value = { ...defaultSettings }
    return saveSettings()
  }

  return {
    settings,
    viewOptions,
    accountTypes,
    orderKinds,
    saveSettings,
    resetSettings,
  }
})
