<template>
  <Dialog
    v-model:visible="localVisible"
    modal
    :header="header"
    :style="{ width: '30rem', height:'70vh' }"
    dir="rtl"
    :breakpoints="{ '1199px': '45vw', '575px': '90vw' }"
  >
    <form @submit.prevent="handleFormSubmit" class="rounded-lg shadow bg-gray-50 p-4">
      <label class="block text-sm font-medium mb-1 text-right">نام و نام خانوادگی</label>
      <IconField>
        <InputIcon class="fa fa-pen"/>
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
        <InputIcon class="fa fa-pen"/>
        <InputText
          :defaultValue="userData.userName"
          disabled=""
          class="w-full"
          type="text"
        />
      </IconField>

      <label class="block text-sm font-medium mb-1 text-right mt-2">موبایل</label>
      <IconField>
        <InputIcon class="fa fa-mobile"/>
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


      <label class="block text-sm font-medium mb-1 text-right mt-2">کدملی</label>
      <IconField>
        <InputIcon class="fa fa-hashtag"/>
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
      <label class="block text-sm font-medium mb-1 text-right mt-2">تعداد دستگاه‌های همزمان</label>
      <IconField>
        <InputIcon class="fa fa-users"/>
        <InputNumber
          v-model="sessionCount"
          :invalid="errors.sessionCount"
          class="w-full"
          inputId="integeronly"
          :min="0"
          :max="9"
        />
      </IconField>
      <small v-if="errors.sessionCount" class="text-red-500 text-right block mt-1">{{
          errors.sessionCount
        }}</small>

      <div class="flex items-center justify-between mt-2">
        <Button size="small" outlined label="ایجاد مجوز ورود به سیستم" icon="fa fa-key" icon-pos="left"
                @click="addNewSession"/>
        <Button size="small" severity="warn" outlined label="حذف تمامی دستگاه‌ها" icon="fa fa-trash" icon-pos="left"
                @click="removeAllSession"/>
      </div>

      <label class="block text-sm font-medium mt-4 text-right">گروه حساب</label>
      <div class="flex justify-between w-full">
        <Select
          v-model="userGroupId"
          :options="accountGroup"
          optionLabel="name"
          class="w-full"
        >
          <template #value="slotProps">
            <div v-if="slotProps.value" class="flex items-center">
              <i :class="slotProps.value.icon"/>
              <div class="mr-1">{{ slotProps.value.name }}</div>
            </div>
          </template>
          <template #option="slotProps">
            <div class="flex items-center w-full" dir="rtl">
              <i :class="slotProps.option.icon"/>
              <div class="mr-1">{{ slotProps.option.name }}</div>
            </div>
          </template>
        </Select>
        <Button
          @click="groupManagementDialogIsOpen = true"
          icon="fa-solid fa-plus"
          severity="success"
          class="min-w-10 mr-2"
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
        <ToggleSwitch v-model="allowTrade" class="min-w-10"/>
      </div>
      <div class="flex items-center justify-between mt-2">
        <label class="block text-sm font-medium text-right">مجوز نمایش مانده و ریز حساب</label>
        <ToggleSwitch v-model="allowRemained" class="min-w-10"/>
      </div>
    </form>

    <div class="border border-blue-500 rounded-lg p-2 my-2">
      <label class="block text-sm font-medium mb-1 text-right mt-2">کد حسابداری تمامی آیتم‌ها</label>
      <IconField>
        <InputIcon class="fa fa-id-card"/>
        <InputNumber
          v-model="accountId"
          class="w-full"
          inputId="integeronly"
        />
      </IconField>
      <div class="mt-2 flex justify-end">
        <Button size="small" outlined label="ثبت و ذخیره" icon="fa fa-save" icon-pos="right" @click="saveAccountId"/>
      </div>
    </div>

    <div class="flex gap-2 mt-2 items-center justify-end">
      <Button size="small" severity="warn" label="بستن" @click="cancel" icon-pos="right"
              icon="fa fa-cancel"/>
      <Button size="small" severity="info" label="تایید و ثبت نهایی" @click="confirm"
              icon-pos="right" icon="fa fa-check-circle"/>
    </div>
  </Dialog>
  <GroupManagementModal
    v-model:isOpen="groupManagementDialogIsOpen"
    @refresh="getAccountGroups"
    :parentAccountGroups="accountGroup"
  />
</template>

<script setup>
import { computed, inject, onMounted, ref, watch } from 'vue';
import * as z from 'zod';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import GroupManagementModal from '@/components/GroupManagementModal.vue';
import { useAdminSettingsStore } from '@/stores/adminSettings.js';
import { useToast } from 'primevue/usetoast';

const groupManagementDialogIsOpen = ref(false);
const adminSettings = useAdminSettingsStore();
const repository = inject('repository');
const toast = useToast();

const emit = defineEmits(['update:isOpen', 'confirm', 'back', 'submit', 'getAccountGroups']);
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  header: {
    type: String,
    default: '',
  },
  userData: {
    type: Object,
    required: true,
  },
  accountGroup: {
    type: Array,
    default: () => [],
  },
});

const schema = z.object({
  name: z.string({ required_error: 'نام کاربر الزامی است' }).
    min(3, { message: 'نام کاربر باید حداقل ۳ حرف باشد' }).
    max(50, { message: 'نام کاربر نمی‌تواند بیشتر از ۵۰ حرف باشد' }),

  mobile: z.string({ required_error: 'شماره موبایل الزامی است' }).
    min(11, { message: 'شماره موبایل باید ۱۱ رقمی باشد' }).
    regex(/^09[0-9]{9}$/, { message: 'شماره موبایل معتبر نیست (فرمت صحیح: 09123456789)' }),

  nationalCode: z.string({ required_error: 'کد ملی الزامی است' }).min(1, { message: 'کد ملی الزامی است' }),

  sessionCount: z.number({ invalid_type_error: 'تعداد دستگاه‌های همزمان الزامی است' }).
    min(1, { message: 'تعداد بیشتر از صفر باشد' }).max(9, { message: 'تعداد نمی‌تواند بیشتر از ۱۰۰ باشد' }),
  userGroupId: z.number().optional(),
  orderKind: z.number().optional(),
});

// ابتدا فرم را با مقادیر خالی ایجاد کنید
const { errors, handleSubmit, defineField, resetForm } = useForm({
  validationSchema: toTypedSchema(schema),
});

const [name] = defineField('name');
const [mobile] = defineField('mobile');
const [nationalCode] = defineField('nationalCode');
const [sessionCount] = defineField('sessionCount');
const [userGroupId] = defineField('userGroupId');

const orderKind = ref(null);
const allowTrade = ref(false);
const allowRemained = ref(false);
const accountId = ref(null);

// هنگام تغییر props.userData، فرم را مجددا تنظیم کنید
watch(() => props.userData, (newVal) => {
  if (newVal) {
    resetForm({
      values: {
        name: newVal.name || '',
        mobile: newVal.mobile || '',
        nationalCode: newVal.nationalCode || '',
        sessionCount: newVal.sessionCount || 1,
        userGroupId: null,
      },
    });
    orderKind.value = newVal.orderKind || adminSettings.orderKinds[0]?.id;
    allowTrade.value = newVal.allowTrade === 1 || false;
    allowRemained.value = newVal.allowRemained === 1 || false;
  }
}, { immediate: true, deep: true });

watch(() => props.accountGroup, (newVal) => {
  if (newVal) {
    if (props.userData.userGroupId && props.accountGroup.length) {
      const selectedGroup = props.accountGroup.find(g => g.id == props.userData.userGroupId);
      if (selectedGroup) {
        resetForm({
          values: {
            userGroupId: selectedGroup,
          },
        });
      }
    }
  }
});

const handleFormSubmit = handleSubmit((values) => {
  emit('submit', values);
});

const localVisible = computed({
  get: () => props.isOpen,
  set: (val) => emit('update:isOpen', val),
});

const confirm = () => {
  handleFormSubmit();
};

const cancel = () => {
  localVisible.value = false;
};

const getAccountGroups = async () => {
  emit('getAccountGroups');
  groupManagementDialogIsOpen.value = false;
};

const removeAllSession = () => {
  repository.deleteToken({ userId: props.userData.id }).then((response) => {
    if (response.data.state) {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: response.data.msg,
      });
    } else {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        life: 3000,
        detail: response.data.msg,
      });
    }
  });
};

const addNewSession = () => {
  repository.addLoginLog({ userName: props.userData.userName }).then((response) => {
    if (response.data.state) {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: response.data.msg,
      });
    } else {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        life: 3000,
        detail: response.data.msg,
      });
    }
  });
};

const saveAccountId = () => {
  if (accountId.value === null) {
    toast.add({
      severity: 'error',
      summary: 'خطا',
      life: 3000,
      detail: 'کد حسابداری را وارد کنید',
    });
    return;
  }
  repository.setAllItemsAccountId({ accountId: accountId.value, userId: props.userData.id }).then((response) => {
    if (response.data.state) {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: response.data.msg,
      });
    } else {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        life: 3000,
        detail: response.data.msg,
      });
    }
  });
};
</script>
