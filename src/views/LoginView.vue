<template>
  <div class="min-h-screen flex items-center flex-col justify-center md:bg-cover md:bg-center p-4"
       :style="{ backgroundImage: `url(${bgImage})` }">
    <form @submit.prevent="onSubmit"
          class="p-2 md:p-4 md:min-h-[260px] w-full md:w-[380px] shadow-xl bg-gray-50/70 rounded-lg"
          dir="ltr">
      <h2 class="text-lg md:text-xl font-bold text-center mb-4 md:mb-6">ورود به حساب کاربری</h2>

      <div class="mb-3 md:mb-4">
        <label class="block text-sm font-medium mb-1 text-right">شماره موبایل</label>
        <IconField>
          <InputIcon class="pi pi-mobile" />
          <InputText
            v-model="mobile"
            placeholder="09121234567"
            type="text"
            :class="{'p-invalid': errors.mobile}"
            class="w-full pl-10 text-sm md:text-base"
          />
        </IconField>
        <small v-if="errors.mobile"
               class="text-red-500 text-right block mt-1 text-xs md:text-sm">{{ errors.mobile
          }}</small>
      </div>

      <template v-if="step === 2">
        <div class="mb-3 md:mb-4">
          <label class="block text-sm font-medium mb-1 text-right">کد ورود</label>
          <div class="flex flex-col md:flex-row md:justify-between gap-2">
            <InputOtp
              v-model="otp"
              integerOnly
              :class="{'p-invalid': errors.otp}"
              class="w-full"
            />
            <Button
              @click="resendCode"
              :loading="resendCodeLoading"
              :label="countdown > 0 ? `${countdown} ثانیه` : 'ارسال مجدد'"
              severity="secondary"
              size="small"
              icon="pi pi-refresh"
              class="min-w-max text-sm"
              :disabled="countdown>0"
            />
          </div>
          <small v-if="errors.otp"
                 class="text-red-500 text-right block mt-1 text-xs md:text-sm">{{ errors.otp
            }}</small>
        </div>

        <div class="mb-3 md:mb-4" v-if="userType === 1">
          <label class="block text-sm font-medium mb-1 text-right">رمز عبور</label>
          <IconField iconPosition="right">
            <InputIcon class="pi pi-lock" />
            <Password
              v-model="password"
              toggleMask
              :feedback="false"
              inputClass="w-full pl-10 text-sm md:text-base"
              :class="{'p-invalid': errors.password}"
            />
          </IconField>
          <small v-if="errors.password"
                 class="text-red-500 block mt-1 text-right text-xs md:text-sm">{{ errors.password
            }}</small>
        </div>
      </template>
      <Button
        type="submit"
        :label="step === 1 ? 'دریافت کد ورود' : 'تایید و ورود'"
        :loading="isLoading"
        class="w-full mt-2 text-sm md:text-base"
      />

      <div class="text-center mt-4 text-gray-900" dir="rtl">
        {{ jalaliDate }}
      </div>

      <div class="text-center mt-4 text-gray-900 text-xs">
        با ورود به این برنامه
        <span
          @click="$router.push({ name: 'terms' })"
          class="text-blue-500 hover:underline cursor-pointer font-bold">
          شرایط و قوانین
        </span>
        این برنامه را می‌پذیرم
      </div>
    </form>
    <div class="text-center text-gray-900 mt-2 text-black">
      {{ formattedDeviceInfo }}
    </div>
    <div class="text-center text-gray-900 mt-4 text-black">
      {{ version }}
    </div>
  </div>
</template>

<script setup>
import loginBg from '@/assets/images/login-bg.jpeg'
import loginBgDark from '@/assets/images/login-bg-dark.png'
import { computed, onUnmounted, ref, watch } from 'vue'
import { useField, useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore.js'
import { useToast } from 'primevue/usetoast'
import { useDeviceStore } from '@/stores/deviceStore.js'
import moment from 'moment-jalaali'
import { useThemeStore } from '@/stores/theme.js'
import { storeToRefs } from 'pinia'

const version = import.meta.env.VITE_VERSION

const toast = useToast()
const userStore = useUserStore()
const themeStore = useThemeStore()
const router = useRouter()
const isLoading = ref(false)
const resendCodeLoading = ref(false)
const step = ref(1)
const countdown = ref(0)
const userType = ref(1)
let countdownInterval = null
const { isDark } = storeToRefs(themeStore)

const deviceStore = useDeviceStore()
const formattedDeviceInfo = computed(() => {
  if (!deviceStore.deviceInfo) return ''

  const parts = deviceStore.deviceInfo.split('|')
  if (parts.length < 6) return ''

  const browser = parts[1]
  const osName = parts[4]
  const osVersion = parts[5]

  return `${osName} ${osVersion} (${browser})`
})

const bgImage = computed(() => {
  return isDark.value ? loginBgDark : loginBg
})

const jalaliDate = computed(() => {
  return moment().format('jD jMMMM jYYYY')
})

const mobileSchema = z.object({
  mobile: z.string({
    required_error: 'شماره موبایل الزامی است'
  }).
    min(1, { message: 'شماره موبایل الزامی است' }).
    min(11, { message: 'شماره موبایل باید ۱۱ رقمی باشد' }).
    regex(/^09[0-9]{9}$/, { message: 'شماره موبایل معتبر نیست (فرمت صحیح: 09123456789)' })
})

const adminOtpSchema = z.object({
  otp: z.string({
    required_error: 'کد ورود الزامی است'
  }).
    min(4, 'کد ورود باید ۴ رقمی باشد').
    max(4, 'کد ورود باید ۴ رقمی باشد'),
  password: z.string().nonempty('رمز عبور الزامی است').min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد')
})

const regularOtpSchema = z.object({
  otp: z.string({
    required_error: 'کد ورود الزامی است'
  }).
    min(4, 'کد ورود باید ۴ رقمی باشد').
    max(4, 'کد ورود باید ۴ رقمی باشد')
})

// تغییر اصلی اینجا است: استفاده از reactive schema
const currentSchema = ref(toTypedSchema(mobileSchema))

const { handleSubmit, errors, resetForm } = useForm({
  validationSchema: currentSchema
})

const { value: mobile } = useField('mobile')
const { value: otp } = useField('otp')
const { value: password } = useField('password')

const startCountdown = () => {
  countdown.value = 120
  countdownInterval = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(countdownInterval)
    }
  }, 1000)
}

watch(step, (newStep) => {
  currentSchema.value = toTypedSchema(
    newStep === 1 ? mobileSchema : userType.value === 1 ? adminOtpSchema : regularOtpSchema)

  resetForm({
    values: {
      mobile: mobile.value,
      otp: '',
      password: ''
    }
  })

  if (newStep === 2) {
    startCountdown()
  }
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
const handleLogin = async (values) => {
  isLoading.value = true
  if (step.value === 1) {
    requestLoginWithMobile(values)
  } else {
    userStore.verifyLoginCode(values.otp, values.password).then((response) => {
      console.log('response:', response)
      if (response.data.state) {
        toast.add({
          severity: 'success',
          summary: 'موفق',
          life: 3000,
          detail: 'عملیات ورود با موفقیت انجام شد.'
        })
        if (userType.value === 1) {
          router.push('/trade')
        } else {
          router.push('/customer-trade')
        }
      } else {
        toast.add({
          severity: 'warn',
          summary: 'خطا',
          life: 3000,
          detail: response.data.msg
        })
      }

    }).finally(() => {
      isLoading.value = false
    })
  }
}

const requestLoginWithMobile = (values) => {
  userStore.requestLoginCode(values.mobile).then((response) => {
    if (response.data.state) {
      userType.value = response.data.type
      step.value = 2
      toast.add({
        severity: 'success',
        summary: 'موفق',
        life: 3000,
        detail: 'کد تایید برای شماره موبایل شما ارسال شد'
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        life: 3000,
        detail: response.data.msg
      })
    }
  }).catch((error) => {
    console.log('error', error.msg)
    toast.add({
      severity: 'warn',
      summary: 'خطا',
      life: 3000,
      detail: error.msg
    })
  }).finally(() => {
    isLoading.value = false
  })
}

const onSubmit = handleSubmit(handleLogin)

const resendCode = () => {
  isLoading.value = true

  userStore.requestLoginCode(mobile.value).then(() => {
    startCountdown()
    toast.add({
      severity: 'success',
      summary: 'موفق',
      life: 3000,
      detail: 'کد تایید جدید برای شماره موبایل شماارسال شد'
    })
  }).catch((error) => {
    console.log('error', error.msg)
    toast.add({
      severity: 'warn',
      summary: 'خطا',
      life: 3000,
      detail: error.msg
    })
  }).finally(() => {
    resendCodeLoading.value = false
    isLoading.value = false
  })
}
</script>

<style scoped>
.login-box {
  background-color: rgba(44, 62, 80, 0.85);
}

:deep(.p-password) {
  width: 100%;
  position: relative;
}

:deep(.p-password-input) {
  width: 100%;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
}

:deep(.p-password-toggle) {
  position: absolute;
  left: 0.75rem;
  right: auto;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}

:deep(.p-inputotp) {
  gap: 0.5rem;
}

:deep(.p-inputotp-input) {
  width: 2.5rem;
  height: 2.5rem;
  font-size: 14px;
  text-align: center;
}
</style>
