<template>
  <Dialog
    v-model:visible="localVisible"
    :breakpoints="{ '1199px': '45vw', '575px': '90vw' }"
    :header="header"
    :style="{ width: '30rem', height:'70vh' }"
    dir="rtl"
    modal
  >
    <form class="rounded-lg shadow bg-gray-50 p-4" @submit.prevent="handleFormSubmit">
      <label class="block text-sm font-medium mb-1 text-right">نام و نام خانوادگی</label>
      <IconField>
        <InputIcon class="fa fa-pen" />
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


      <label class="block text-sm font-medium mb-1 text-right mt-2">نام کاربری</label>
      <IconField>
        <InputIcon class="fa fa-pen" />
        <InputText
          :defaultValue="userData.userName"
          class="w-full"
          disabled=""
          type="text"
        />
      </IconField>

      <label class="block text-sm font-medium mb-1 text-right mt-2">موبایل</label>
      <IconField>
        <InputIcon class="fa fa-mobile" />
        <InputText
          v-model="mobile"
          :class="{'p-invalid': errors.mobile}"
          class="w-full pl-10"
          placeholder="09121234567"
          type="text"
        />
      </IconField>
      <small v-if="errors.mobile" class="text-red-500 text-right block mt-1">{{
          errors.mobile
        }}</small>


      <label class="block text-sm font-medium mb-1 text-right mt-2">کدملی</label>
      <IconField>
        <InputIcon class="fa fa-hashtag" />
        <InputText
          v-model="nationalCode"
          :invalid="errors.nationalCode"
          :useGrouping="false"
          class="w-full"
          inputId="withoutgrouping"
          placeholder="کدملی"
          type="text"
        />
      </IconField>
      <small v-if="errors.nationalCode" class="text-red-500 text-right block mt-1">{{
          errors.nationalCode
        }}</small>
      <label class="block text-sm font-medium mb-1 text-right mt-2">تعداد دستگاه‌های همزمان</label>
      <IconField>
        <InputIcon class="fa fa-users" />
        <InputNumber
          v-model="sessionCount"
          :invalid="errors.sessionCount"
          :max="9"
          :min="0"
          class="w-full"
          inputId="integeronly"
        />
      </IconField>
      <small v-if="errors.sessionCount" class="text-red-500 text-right block mt-1">{{
          errors.sessionCount
        }}</small>

      <div class="flex items-center justify-between mt-2">
        <Button icon="fa fa-key" icon-pos="left" label="ایجاد مجوز ورود به سیستم" outlined size="small"
                @click="addNewSession" />
        <Button icon="fa fa-trash" icon-pos="left" label="حذف تمامی دستگاه‌ها" outlined severity="warn" size="small"
                @click="removeAllSession" />
      </div>

      <label class="block text-sm font-medium mb-1 text-right mt-2">توضیحات</label>
      <IconField>
        <InputIcon class="fa fa-info" />
        <InputText
          v-model="info"
          class="w-full"
          placeholder="توضیحات"
          type="text"
        />
      </IconField>

      <label class="block text-sm font-medium mt-4 text-right">گروه حساب</label>
      <div class="flex justify-between w-full">
        <Select
          v-model="userGroupId"
          :options="accountGroup"
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
        <Button
          class="min-w-10 mr-2"
          icon="fa-solid fa-plus"
          severity="success"
          @click="groupManagementDialogIsOpen = true"
        />
      </div>
      <label class="block text-sm font-medium mt-2 text-right">نوع درخواست مشتری</label>
      <Select
        v-model="orderKind"
        :options="adminSettings.orderKinds"
        class="w-full"
        optionLabel="label"
        optionValue="id">
      </Select>
      <div class="flex items-center justify-between mt-2">
        <label class="block text-sm font-medium text-right">مجوز معامله</label>
        <ToggleSwitch v-model="allowTrade" class="min-w-10" />
      </div>
      <div class="flex items-center justify-between mt-2">
        <label class="block text-sm font-medium text-right">مجوز نمایش مانده و ریز حساب</label>
        <ToggleSwitch v-model="allowRemained" class="min-w-10" />
      </div>
    </form>

    <div class="border border-blue-500 rounded-lg p-2 my-2">
      <label class="block text-sm font-medium mb-1 text-right mt-2">کد حسابداری تمامی آیتم‌ها</label>
      <IconField>
        <InputIcon class="fa fa-id-card" />
        <InputNumber
          v-model="accountId"
          class="w-full"
          inputId="integeronly"
        />
      </IconField>
      <div class="mt-2 flex justify-end">
        <Button icon="fa fa-save" icon-pos="right" label="ثبت و ذخیره" outlined size="small" @click="saveAccountId" />
      </div>
    </div>

    <div class="flex gap-2 mt-2 items-center justify-end">
      <Button icon="fa fa-cancel" icon-pos="right" label="بستن" severity="warn" size="small"
              @click="cancel" />
      <Button icon="fa fa-check-circle" icon-pos="right" label="تایید و ثبت نهایی" severity="info"
              size="small" @click="handleFormSubmit" />
    </div>
  </Dialog>
  <GroupManagementModal
    v-model:isOpen="groupManagementDialogIsOpen"
    :parentAccountGroups="accountGroup"
    @refresh="getAccountGroups"
  />
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue'
import * as z from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import GroupManagementModal from '@/components/GroupManagementModal.vue'
import { useAdminSettingsStore } from '@/stores/adminSettings.js'
import { useToast } from 'primevue/usetoast'
import { useUserStore } from '@/stores/userStore.js'

const groupManagementDialogIsOpen = ref(false)
const adminSettings = useAdminSettingsStore()
const repository = inject('repository')
const toast = useToast()

const emit = defineEmits(['update:isOpen', 'back', 'submit', 'getAccountGroups', 'userUpdated'])
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  header: {
    type: String,
    default: ''
  },
  userData: {
    type: Object,
    required: true
  },
  accountGroup: {
    type: Array,
    default: () => []
  }
})

const schema = z.object({
  name: z.string({ required_error: 'نام کاربر الزامی است' }).
    min(3, { message: 'نام کاربر باید حداقل ۳ حرف باشد' }).
    max(50, { message: 'نام کاربر نمی‌تواند بیشتر از ۵۰ حرف باشد' }),

  mobile: z.string({ required_error: 'شماره موبایل الزامی است' }).
    min(11, { message: 'شماره موبایل باید ۱۱ رقمی باشد' }).
    regex(/^09[0-9]{9}$/, { message: 'شماره موبایل معتبر نیست (فرمت صحیح: 09123456789)' }),

  nationalCode: z.string({ required_error: 'کد ملی الزامی است' }).min(10, { message: 'کد ملی الزامی است' }),

  sessionCount: z.number({ invalid_type_error: 'تعداد دستگاه‌های همزمان الزامی است' }).
    min(1, { message: 'تعداد بیشتر از صفر باشد' }).max(9, { message: 'تعداد نمی‌تواند بیشتر از ۹ باشد' }),
  userGroupId: z.any().nullable().optional(),
  orderKind: z.number().optional(),
  info: z.string().optional()
})

// ابتدا فرم را با مقادیر خالی ایجاد کنید
const { errors, handleSubmit, defineField, resetForm } = useForm({
  validationSchema: toTypedSchema(schema)
})

const [name] = defineField('name')
const [mobile] = defineField('mobile')
const [orderKind] = defineField('orderKind')
const [nationalCode] = defineField('nationalCode')
const [sessionCount] = defineField('sessionCount')
const [userGroupId] = defineField('userGroupId')
const [info] = defineField('info')

const allowTrade = ref(false)
const allowRemained = ref(false)
const accountId = ref(null)

const userStore = useUserStore()
const user = computed(() => userStore.user)

watch(() => props.userData, (newVal) => {
  if (newVal) {
    resetForm({
      values: {
        name: newVal.name || '',
        mobile: newVal.mobile || '',
        nationalCode: newVal.nationalCode || '',
        sessionCount: newVal.sessionCount || 1,
        info: newVal.info || 1,
        userGroupId: newVal.userGroupId || null,
        orderKind: newVal.orderKind || adminSettings.orderKinds[0]?.id
      }
    })
    allowTrade.value = newVal.allowTrade === 1 || false
    allowRemained.value = newVal.allowRemained === 1 || false

    if (Object.prototype.hasOwnProperty.call(newVal, 'accountIds')) {
      accountId.value = newVal.accountIds.length ? newVal.accountIds.slice(1, -1) : null
    }

    if (newVal.userGroupId && props.accountGroup.length) {
      const selectedGroup = props.accountGroup.find(g => g.id == props.userData.userGroupId)
      if (selectedGroup) {
        resetForm({
          values: {
            userGroupId: selectedGroup
          }
        })
      }
    }
  }
}, { immediate: true, deep: true })

const handleFormSubmit = handleSubmit((values) => {
  console.log('values:', values)
  const data = {
    id: props.userData.id,
    name: values.name,
    mobile: values.mobile,
    nationalCode: values.nationalCode,
    allowTrade: allowTrade.value ? 1 : 0,
    allowRemained: allowRemained.value ? 1 : 0,
    sessionCount: values.sessionCount,
    info: values.info,
    newUserPrices: [],
    removedUserPrices: [],
    userGroupId: values.userGroupId ? values.userGroupId.id : '',
    adminPasswordStr: 'acf7ef943fdeb3cbfed8dd0d8f584731',//TODO: change this value in future
    orderKind: values.orderKind,
    uName: user.value.userName
  }
  repository.updateUser(data).then((response) => {
    if (response.data.state) {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: response.data.msg
      })
      emit('userUpdated')
    } else {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        life: 3000,
        detail: response.data.msg
      })
    }
  })
}, (errors) => {
  const errorMessages = Object.entries(errors.errors)
  errorMessages.forEach((message) => {
    toast.add({
      severity: 'error',
      summary: 'خطا',
      life: 3000,
      detail: message[1]
    })
  })
})

const localVisible = computed({
  get: () => props.isOpen,
  set: (val) => emit('update:isOpen', val)
})

const cancel = () => {
  localVisible.value = false
}

const getAccountGroups = async () => {
  emit('getAccountGroups')
  groupManagementDialogIsOpen.value = false
}

const removeAllSession = () => {
  repository.deleteToken({ userId: props.userData.id }).then((response) => {
    if (response.data.state) {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: response.data.msg
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        life: 3000,
        detail: response.data.msg
      })
    }
  })
}

const addNewSession = () => {
  repository.addLoginLog({ userName: props.userData.userName }).then((response) => {
    if (response.data.state) {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: response.data.msg
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        life: 3000,
        detail: response.data.msg
      })
    }
  })
}

const saveAccountId = () => {
  if (accountId.value === null) {
    toast.add({
      severity: 'error',
      summary: 'خطا',
      life: 3000,
      detail: 'کد حسابداری را وارد کنید'
    })
    return
  }
  repository.setAllItemsAccountId({ accountId: accountId.value, userId: props.userData.id }).then((response) => {
    if (response.data.state) {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: response.data.msg
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        life: 3000,
        detail: response.data.msg
      })
    }
  })
}
</script>
