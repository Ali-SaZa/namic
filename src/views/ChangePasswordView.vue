<template>
  <div class="w-full flex items-center justify-center">
    <form @submit.prevent="onSubmit" class="w-full md:w-[330px] shadow rounded-lg bg-gray-50 p-4">
      <div class="mb-3">
        <label class="block text-sm font-medium text-right">رمز عبور فعلی</label>
        <IconField iconPosition="right">
          <InputIcon class="pi pi-lock" />
          <Password
            v-model="currentPassword"
            toggleMask
            :feedback="false"
            inputClass="w-full pl-10 text-sm md:text-base"
            :class="{'p-invalid': errors.currentPassword}"
          />
        </IconField>
        <small v-if="errors.currentPassword" class="text-red-500 text-right block mt-1 text-xs">
          {{ errors.currentPassword }}
        </small>
      </div>

      <div class="mb-3">
        <label class="block text-sm font-medium text-right">رمز عبور جدید</label>
        <IconField iconPosition="right">
          <InputIcon class="pi pi-lock" />
          <Password
            v-model="newPassword"
            toggleMask
            :feedback="false"
            inputClass="w-full pl-10 text-sm md:text-base"
            :class="{'p-invalid': errors.newPassword}"
          />
        </IconField>
        <small v-if="errors.newPassword" class="text-red-500 text-right block mt-1 text-xs">
          {{ errors.newPassword }}
        </small>
      </div>

      <div class="mb-3">
        <label class="block text-sm font-medium text-right">تکرار رمز عبور جدید</label>
        <IconField iconPosition="right">
          <InputIcon class="pi pi-lock" />
          <Password
            v-model="newPasswordRepeat"
            toggleMask
            :feedback="false"
            inputClass="w-full pl-10 text-sm md:text-base"
            :class="{'p-invalid': errors.newPasswordRepeat}"
          />
        </IconField>
        <small v-if="errors.newPasswordRepeat" class="text-red-500 text-right block mt-1 text-xs">
          {{ errors.newPasswordRepeat }}
        </small>
      </div>

      <Button
        :loading="isLoading"
        type="submit"
        label="تغییر رمز عبور"
        size="small"
        icon="fa fa-save"
        icon-pos="right"
        class="w-full mt-2"
      />
    </form>
  </div>
</template>

<script setup>
import { useField, useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useToast } from 'primevue/usetoast'
import { inject, ref } from 'vue'
import { useUserStore } from '@/stores/userStore.js'

const repository = inject('repository')

const userStore = useUserStore()
const isLoading = ref(false)
const toast = useToast()

// regex(/[A-Z]/, 'رمز عبور باید حداقل یک حرف بزرگ داشته باشد').
//   regex(/[a-z]/, 'رمز عبور باید حداقل یک حرف کوچک داشته باشد').
//   regex(/[0-9]/, 'رمز عبور باید حداقل یک عدد داشته باشد'),

const passwordSchema = z.object({
  currentPassword: z.string({
    required_error: 'رمز عبور فعلی الزامی است'
  }).min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
  newPassword: z.string({
    required_error: 'رمز عبور جدید الزامی است'
  }).
    min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
  newPasswordRepeat: z.string({
    required_error: 'تکرار رمز عبور الزامی است'
  })
}).refine(data => data.newPassword === data.newPasswordRepeat, {
  message: 'رمزهای عبور وارد شده یکسان نیستند',
  path: ['newPasswordRepeat']
})

const { handleSubmit, errors, setFieldValue } = useForm({
  validationSchema: toTypedSchema(passwordSchema)
})

const { value: currentPassword } = useField('currentPassword')
const { value: newPassword } = useField('newPassword')
const { value: newPasswordRepeat } = useField('newPasswordRepeat')

const onSubmit = handleSubmit((values) => {
  isLoading.value = true

  const data = {
    userId: userStore.id,
    oldPassword: values.currentPassword,
    newPassword: newPassword.value,
    uName: userStore.user.userName,
    uPass: ''
  }

  repository.updateUserPassword(data).then((response) => {
    isLoading.value = false

    if (response.data.state) {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: response.data.msg
      })
      setFieldValue('currentPassword', '', false) // پارامتر سوم برای عدم اجرای اعتبارسنجی
      setFieldValue('newPassword', '', false)
      setFieldValue('newPasswordRepeat', '', false)
    } else {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        life: 3000,
        detail: response.data.msg
      })
    }
  }).finally(() => {
    isLoading.value = false
  })
})
</script>
<style scoped>
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
</style>
