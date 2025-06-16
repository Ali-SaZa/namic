import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import axios from 'axios'
import router from '@/router'
import { useApiPollingStore } from './apiPollingStore'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const id = ref(localStorage.getItem('id') ? parseInt(localStorage.getItem('id')) : null)
  const type = ref(localStorage.getItem('type') ? parseInt(localStorage.getItem('type')) : null)
  const loginStep = ref(1)
  const loading = ref(false)
  const error = ref(null)
  const mobile = ref('')
  const prices = ref([])
  const permissions = ref([])
  const isInitialized = ref(false)

  // API Endpoints
  const API = {
    LOGIN_REQUEST: `${import.meta.env.VITE_API_BASE_URL}users/loginRequest.php`,
    LOGIN_SMS: `${import.meta.env.VITE_API_BASE_URL}users/LoginSms.php`,
    GET_USER_INFO: `${import.meta.env.VITE_API_BASE_URL}users/info.php`
  }

  // Actions
  const requestLoginCode = async (mobileNumber) => {
    try {
      loading.value = true
      error.value = null

      const formData = new FormData()
      formData.append('mobile', mobileNumber)

      const response = await axios.post(API.LOGIN_REQUEST, formData)

      if (response.data.state) {
        mobile.value = mobileNumber
        loginStep.value = 2
        return response
      }
      throw new Error(response?.data?.msg || 'خطا در ارسال کد تایید')
    } catch (err) {
      error.value = err.response?.data?.msg || err.message || 'خطا در ارتباط با سرور'
      return err.response
    } finally {
      loading.value = false
    }
  }

  const verifyLoginCode = async (code, password) => {
    try {
      loading.value = true
      error.value = null

      const formData = new FormData()
      formData.append('mobile', mobile.value)
      formData.append('code', code)
      formData.append('password', password)

      const response = await axios.post(API.LOGIN_SMS, formData)

      if (response.data.state && response.data.token && response.data.user?.id) {
        token.value = response.data.token
        id.value = response.data.user.id
        type.value = response.data.user.type
        user.value = response.data.user

        localStorage.setItem('token', token.value)
        localStorage.setItem('id', id.value.toString())
        localStorage.setItem('type', type.value.toString())

        loginStep.value = 1
        mobile.value = ''
        return response
      }
      throw new Error(response.data.msg || 'اطلاعات وارد شده صحیح نیست')
    } catch (err) {
      error.value = err.response?.data?.msg || err.message || 'خطا در ورود به سیستم'
      return err.response
    } finally {
      loading.value = false
    }
  }

  const fetchUserInfo = async () => {
    try {
      if (!token.value || !id.value || !type.value) return

      loading.value = true
      error.value = null

      const formData = new FormData()
      formData.append('uToken', token.value)
      formData.append('id', id.value.toString())

      const response = await axios.post(API.GET_USER_INFO, formData)

      if (response.data.state) {
        user.value = response.data.user
        prices.value = response.data.prices || []
        permissions.value = response.data.permissions || []
        localStorage.setItem('type', response.data.user.type.toString())
        return response.data
      }
      throw new Error(response.data.msg || 'خطا در دریافت اطلاعات کاربر')
    } catch (err) {
      error.value = err.response?.data?.msg || err.message || 'خطا در ارتباط با سرور'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    try {
      user.value = null
      token.value = null
      id.value = null
      type.value = null
      prices.value = []
      permissions.value = []

      localStorage.removeItem('token')
      localStorage.removeItem('id')
      localStorage.removeItem('type')

      const apiPollingStore = useApiPollingStore()
      apiPollingStore.cleanup()
      router.push('/registration/login')
      return true
    } catch (error) {
      console.error('خطا در عملیات خروج:', error)
    }
  }

  const initialize = async () => {
    if (isInitialized.value || !token.value || !id.value) return

    try {
      isInitialized.value = false
      await fetchUserInfo()
    } catch (error) {
      if (error.response?.status === 401) {
        logout()
      }
      console.error('خطا در مقداردهی اولیه:', error)
    } finally {
      isInitialized.value = true
    }
  }

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!id.value)
  const userFullName = computed(() => user.value?.name || 'کاربر')
  const userPermissions = computed(() => permissions.value)
  const userId = computed(() => id.value)
  const userType = computed(() => type.value)
  // Initialize store
  initialize()

  return {
    // State
    user,
    token,
    id,
    userType,
    loginStep,
    loading,
    error,
    mobile,
    prices,
    permissions,
    isInitialized,
    type,

    // Actions
    requestLoginCode,
    verifyLoginCode,
    fetchUserInfo,
    logout,
    initialize,

    // Getters
    isAuthenticated,
    userFullName,
    userPermissions,
    userId
  }
})
