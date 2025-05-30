<template>
  <div>
    <template v-if="passwordConfirmation">
      <div class="flex items-center justify-center w-full">
        <div class="w-sm shadow">
          <PasswordBox @submit="submitAdminPassword" />
        </div>
      </div>
    </template>
    <template v-else>
      <form class="grid grid-cols-4 gap-4 rounded-lg shadow bg-gray-50 p-4"
            @submit.prevent="onSubmit">
        <div class="col-span-4 md:col-span-2 lg:col-span-1">
          <label class="block text-sm font-medium mt-2 text-right">نوع حساب</label>
          <Select
            v-model="selectedAccountType"
            :options="adminSettings.accountTypes"
            class="w-full"
            optionLabel="name"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center">
                <i :class="slotProps.value.icon" />
                <div class="mr-1">{{ slotProps.value.name }}</div>
              </div>
            </template>
            <template #option="slotProps">
              <div class="flex items-center w-full" dir="rtl">
                <i :class="slotProps.option.icon" />
                <div class="mr-1">{{ slotProps.option.name }}</div>
              </div>
            </template>
          </Select>
        </div>
        <div class="col-span-4 md:col-span-2 lg:col-span-1">
          <label class="block text-sm font-medium mt-2 text-right">گروه حساب</label>
          <div class="flex justify-between w-full">
            <Select
              v-model="selectedAccountGroup"
              :options="accountGroup"
              optionLabel="name"
              class="w-full"
            >
              <template #value="slotProps">
                <div v-if="slotProps.value" class="flex items-center">
                  <div class="mr-1">{{ slotProps.value.name }}</div>
                </div>
              </template>
            </Select>
            <Button
              @click="groupManagementDialogIsOpen = true"
              icon="pi pi-plus"
              severity="success"
              class="mr-1"
            />
          </div>
        </div>
        <div class="col-span-4 md:col-span-2 lg:col-span-1">
          <label class="block text-sm font-medium mb-1 text-right">نام و نام خانوادگی</label>
          <IconField>
            <InputIcon class="fa fa-user" />
            <InputText
              v-model="name"
              :class="{ 'p-invalid': errors.name }"
              class="w-full"
              placeholder="نام و نام خانوادگی"
              type="text"
            />
          </IconField>
          <small v-if="errors.name" class="text-red-500 text-right block mt-1">{{ errors.name
            }}</small>
        </div>
        <div class="col-span-4 md:col-span-2 lg:col-span-1">
          <label class="block text-sm font-medium mb-1 text-right">موبایل</label>
          <IconField>
            <InputIcon class="fa fa-mobile" />
            <InputText
              v-model="mobile"
              placeholder="09121234567"
              type="text"
              :class="{'p-invalid': errors.mobile}"
              class="w-full pl-10"
            />
          </IconField>
          <small v-if="errors.mobile" class="text-red-500 text-right block mt-1">{{
              errors.mobile
            }}</small>
        </div>
        <div class="col-span-4 md:col-span-2 lg:col-span-1">
          <label class="block text-sm font-medium mb-1 text-right">کدملی</label>
          <IconField>
            <InputIcon class="fa fa-hashtag" />
            <InputText
              v-model="nationalCode"
              :invalid="errors.nationalCode"
              class="w-full"
              inputId="withoutgrouping"
              :useGrouping="false"
              placeholder="کدملی"
              type="text"
            />
          </IconField>
          <small v-if="errors.nationalCode" class="text-red-500 text-right block mt-1">{{
              errors.nationalCode
            }}</small>
        </div>
        <div class="col-span-4 md:col-span-2 lg:col-span-1">
          <label class="block text-sm font-medium mb-1 text-right">نام کاربری</label>
          <IconField>
            <InputIcon class="fa fa-user" />
            <InputText
              v-model="userName"
              :class="{ 'p-invalid': errors.userName }"
              class="w-full"
              placeholder="نام کاربری"
              type="text"
            />
          </IconField>
          <small v-if="errors.userName" class="text-red-500 text-right block mt-1">{{
              errors.userName
            }}</small>
        </div>

        <div class="col-span-4 md:col-span-2 lg:col-span-1">
          <label class="block text-sm font-medium mb-1 text-right">رمزعبور</label>
          <div class="w-full">
            <Password class="w-full" v-model="password" :class="{ 'p-invalid': errors.password }"
                      toggleMask />
          </div>
          <small v-if="errors.password" class="text-red-500 text-right block mt-1">{{
              errors.password
            }}</small>
        </div>

        <div class="col-span-4 flex items-center justify-end mt-8">
          <Button
            :loading="isLoading"
            class="w-full md:max-w-max"
            label="افزودن کاربر"
            size="small"
            type="submit"
          />
        </div>
      </form>
    </template>
    <GroupManagementModal v-model:isOpen="groupManagementDialogIsOpen"
                          @refresh="getAccountGroups" />
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { useToast } from 'primevue/usetoast'
import GroupManagementModal from '@/components/GroupManagementModal.vue'
import { useAdminSettingsStore } from '@/stores/adminSettings'
import PasswordBox from '@/components/PasswordBox.vue'
import { useUserStore } from '@/stores/userStore.js'

const toast = useToast()
const repository = inject('repository')
const isLoading = ref(false)
const userStore = useUserStore()
const user = computed(() => userStore.user)
const adminSettings = useAdminSettingsStore()

const selectedAccountType = ref({ id: 4, name: 'مشتری', icon: 'fa-solid fa-circle-user' })

const accountGroup = ref([])
const selectedAccountGroup = ref({})

const passwordConfirmation = ref(true)
const groupManagementDialogIsOpen = ref(false)

const getAccountGroups = async () => {
  try {
    const response = await repository.getUserGroupList()

    if (response) {
      accountGroup.value = response.data.userGroup
      selectedAccountGroup.value = accountGroup.value[0]
    }
  } catch (error) {
    console.log(error, 'Error on getAccountGroups')
  }
}

// تعریف schema پایه
const baseSchema = z.object({
  name: z.string({ required_error: 'نام کاربر الزامی است' }).
    min(3, { message: 'نام کاربر باید حداقل ۳ حرف باشد' }).
    max(50, { message: 'نام کاربر نمی‌تواند بیشتر از ۵۰ حرف باشد' }),

  mobile: z.string({
    required_error: 'شماره موبایل الزامی است'
  }).
    min(1, { message: 'شماره موبایل الزامی است' }).
    min(11, { message: 'شماره موبایل باید ۱۱ رقمی باشد' }).
    regex(/^09[0-9]{9}$/, { message: 'شماره موبایل معتبر نیست (فرمت صحیح: 09123456789)' }),

  nationalCode: z.string({
    invalid_type_error: 'کد ملی الزامی است'
  }),

  userName: z.string({ required_error: 'نام کاربری الزامی است' }).
    min(3, { message: 'نام کاربری باید حداقل ۳ حرف باشد' }).
    max(50, { message: 'نام کاربری نمی‌تواند بیشتر از ۵۰ حرف باشد' }),

  password: z.string({ required_error: 'رمزعبور الزامی است' }).
    min(6, { message: 'رمزعبور باید حداقل ۶ کاراکتر باشد' }).
    regex(/[A-Z]/, { message: 'رمزعبور باید حداقل یک حرف بزرگ داشته باشد' }).
    regex(/[0-9]/, { message: 'رمزعبور باید حداقل یک عدد داشته باشد' })
})

const { handleSubmit, errors, defineField, resetForm, setErrors } = useForm({
  initialValues: {
    name: '',
    mobile: null,
    nationalCode: null,
    userName: '',
    password: ''
  }
})

// تعریف فیلدها
const [name] = defineField('name')
const [mobile] = defineField('mobile')
const [nationalCode] = defineField('nationalCode')
const [userName] = defineField('userName')
const [password] = defineField('password')

// تابع اعتبارسنجی سفارشی
const validateForm = async () => {
  try {
    const values = {
      name: name.value,
      mobile: mobile.value,
      nationalCode: nationalCode.value,
      userName: userName.value,
      password: password.value
    }

    await baseSchema.parseAsync(values)

    return true
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = {}
      error.errors.forEach((err) => {
        formattedErrors[err.path[0]] = err.message
      })
      setErrors(formattedErrors)
    }
    return false
  }
}

const handleAddUser = async (values) => {
  isLoading.value = true
  try {
    console.log(values)
    const response = await repository.addUser(values)
    if (response.data.state) {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: 'کاربر با موفقیت اضافه شد'
      })
      resetForm()
    }else{
      toast.add({
        severity: 'error',
        summary: 'خطا',
        life: 3000,
        detail: response.data.msg
      })
    }
  } catch (error) {
    console.error('Error adding item:', error)
    toast.add({
      severity: 'warn',
      summary: 'خطا',
      life: 3000,
      detail: error?.msg || error?.message || 'خطای ناشناخته‌ای رخ داده است'
    })
  } finally {
    isLoading.value = false
  }
}

const onSubmit = handleSubmit(async () => {
  const isValid = await validateForm()
  if (isValid) {
    const values = {
      name: name.value,
      mobile: mobile.value,
      nationalCode: nationalCode.value,
      userName: userName.value,
      password: password.value,
      type: selectedAccountType.value.id,
      groupId: selectedAccountGroup.value.id,
      allowTrade: true,
      isActive: true,
      sessionCount: 3
    }
    await handleAddUser(values)
  }
})

const submitAdminPassword = (password) => {
  repository.checkUserPass({ uName: user.value.userName, uPass: password }).then((response) => {
    if (response) {
      if (response.data.state) {
        toast.add({
          severity: 'success',
          summary: 'موفقیت',
          life: 3000,
          detail: 'عملیات بررسی با موفقیت بررسی شد'
        })
        passwordConfirmation.value = false
      } else {
        toast.add({
          severity: 'warn',
          summary: 'خطا',
          life: 3000,
          detail: 'رمزعبور اشتباه است'
        })
      }
    }
  })
}

onMounted(() => {
  getAccountGroups()
})
</script>

<style>
.p-password-input {
  width: 100% !important;
}
</style>
