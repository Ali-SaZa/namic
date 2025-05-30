import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)
  const systemPrefersDark = ref(false)

  function initializeTheme() {
    // بررسی preference سیستم
    systemPrefersDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches

    // اولویت با localStorage است، اگر وجود نداشت از سیستم استفاده می‌کند
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && systemPrefersDark.value)) {
      enableDarkMode()
    } else {
      enableLightMode()
    }

    // گوش دادن به تغییرات سیستم
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        systemPrefersDark.value = e.matches
        if (!('theme' in localStorage)) {
          e.matches ? enableDarkMode() : enableLightMode()
        }
      }
    )

  }

  function enableDarkMode() {
    isDark.value = true
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  }

  function enableLightMode() {
    isDark.value = false
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }

  function toggleDarkMode() {
    isDark.value ? enableLightMode() : enableDarkMode()
  }

  return {
    isDark,
    systemPrefersDark,
    initializeTheme,
    toggleDarkMode,
    enableDarkMode,
    enableLightMode
  }
})
