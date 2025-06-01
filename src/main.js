// 1. imports CSS
import './assets/css/typography.css'
import './assets/css/main.css'
import './assets/css/datePicker.css'
import 'primeicons/primeicons.css'
import '@fortawesome/fontawesome-free/css/all.css'

// 2. Vue and core libraries
import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 3. PrimeVue and plugins
import PrimeVue from 'primevue/config'
import aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'

// 4. App components and plugins
import App from './App.vue'
import router from './router'
import Vue3PersianDatetimePicker from 'vue3-persian-datetime-picker'
import persianDateTime from './plugins/persianDateTime'
import repository from './plugins/repository'

// 5. UI components
import bottomNavigationVue from 'bottom-navigation-vue'
import 'bottom-navigation-vue/dist/style.css'

// Initialize Vue app
const app = createApp(App)

// ============ PWA Installation ============
let deferredPrompt

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  console.log('PWA install prompt available')

  // Store this in Pinia/Vuex if needed
  // app.config.globalProperties.$deferredPrompt = e;
})

// Add global install method
app.config.globalProperties.$triggerPWAInstall = () => {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    return deferredPrompt.userChoice.then(choiceResult => {
      deferredPrompt = null
      return choiceResult.outcome === 'accepted'
    })
  }
  return Promise.resolve(false)
}
// ============ End PWA Installation ============

// Register components and plugins
app.component('VueDatePicker', Vue3PersianDatetimePicker)

app.use(bottomNavigationVue)
app.use(createPinia())
app.use(router)
app.use(persianDateTime, { name: 'vue-date-picker' })
app.use(repository)
app.use(ToastService)
app.use(PrimeVue, {
  theme: {
    preset: aura,
    options: {
      prefix: 'p',
      darkModeSelector: 'html.dark',
      cssLayer: false
    }
  }
})

// Custom directives (unchanged)
app.directive('format-number', {
  mounted(el, binding) {
    updateFormattedNumber(el, binding)
  },
  updated(el, binding) {
    updateFormattedNumber(el, binding)
  }
})

app.directive('number-to-persian', {
  mounted(el, binding) {
    el.textContent = convertToPersianToman(binding.value)
  },
  updated(el, binding) {
    el.textContent = convertToPersianToman(binding.value)
  }
})

// ============ Service Worker ============
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {

      registration.onupdatefound = () => {
        const installingWorker = registration.installing
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('New content available; please refresh.')
            } else {
              console.log('Content is cached for offline use.')
            }
          }
        }
      }
    }).catch(error => {
      console.error('SW registration failed:', error)
    })
  })
}
// ============ End Service Worker ============

// Mount the app
app.mount('#app')

// Utility functions (unchanged)
function updateFormattedNumber(el, binding) {
  let value, minDigit, maxDigit

  // اگر binding.value یک آبجکت بود (حالت پیشرفته)
  if (typeof binding.value === 'object' && binding.value !== null) {
    value = binding.value.value
    minDigit = binding.value.minDigit ?? 0 // مقدار پیش‌فرض 0
    maxDigit = binding.value.maxDigit ?? 8 // مقدار پیش‌فرض 8
  }
  // اگر binding.value عدد یا رشته بود (حالت ساده)
  else {
    value = binding.value
    minDigit = 0 // مقدار پیش‌فرض
    maxDigit = 8 // مقدار پیش‌فرض
  }

  el.textContent = formatNumber(value, minDigit, maxDigit)
}

function formatNumber(value, minDigit = 0, maxDigit = 8) {
  if (isNaN(value)) return value
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: minDigit,
    maximumFractionDigits: maxDigit
  }).format(Number(value))
}

const units = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه']
const teens = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده']
const tens = ['', 'ده', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود']
const hundreds = ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد']
const scales = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون']

function convertToPersianToman(value) {
  const num = typeof value === 'string' ?
    parseInt(value.replace(/[٬,]/g, '')) :
    Math.floor(value)
  if (isNaN(num)) return 'عدد نامعتبر'
  const tomans = Math.floor(num / 10)
  const persianText = numberToPersianWords(tomans)
  return persianText ? `${persianText} تومان` : 'صفر تومان'
}

function numberToPersianWords(num) {
  if (num === 0) return 'صفر'
  const parts = []
  let scaleIndex = 0
  while (num > 0) {
    const chunk = num % 1000
    if (chunk !== 0) {
      let chunkText = convertLessThanOneThousand(chunk)
      if (scaleIndex > 0) chunkText += ' ' + scales[scaleIndex]
      parts.unshift(chunkText)
    }
    num = Math.floor(num / 1000)
    scaleIndex++
  }
  return parts.join(' و ')
}

function convertLessThanOneThousand(n) {
  if (n === 0) return ''
  let result = ''
  if (n >= 100) {
    result += hundreds[Math.floor(n / 100)] + ' و '
    n %= 100
  }
  if (n >= 20) {
    result += tens[Math.floor(n / 10)]
    if (n % 10 !== 0) result += ' و ' + units[n % 10]
  } else if (n >= 10) {
    result += teens[n - 10]
  } else if (n > 0) {
    result += units[n]
  }
  return result
}
