<template>
  <form @submit.prevent="onSubmit">
    <div class="rounded-lg shadow bg-gray-50 p-4">
      <div class="flex justify-between">
        <div class="flex items-center gap-2">
          <label class="block text-sm font-medium mb-1 text-right">وضعیت</label>
          <ToggleSwitch v-model="isActive"/>
        </div>
        <div class="flex items-center gap-2">
          <label class="block text-sm font-medium mb-1 text-right">خرید</label>
          <ToggleSwitch v-model="allowBuy"/>
        </div>
        <div class="flex items-center gap-2">
          <label class="block text-sm font-medium mb-1 text-right">فروش</label>
          <ToggleSwitch v-model="allowSell"/>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1 text-right mt-2">مبلغ</label>
        <IconField>
          <InputIcon class="fa fa-tag"/>
          <InputNumber
            v-model="price"
            :invalid="errors.price"
            class="w-full"
            inputId="integeronly"
            placeholder="مثلا: 2,300"
            type="text"
          />
        </IconField>
        <small v-if="errors.price" class="text-red-500 text-right block mt-1">{{
            errors.price
          }}</small>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1 text-right mt-2">میزان افزایش|کاهش مبلغ</label>
        <IconField>
          <InputIcon class="fa fa-tag"/>
          <InputNumber
            v-model="priceChange"
            :invalid="errors.priceChange"
            class="w-full"
            inputId="integeronly"
            placeholder="مثلا: 2"
            type="text"
          />
        </IconField>
        <small v-if="errors.priceChange" class="text-red-500 text-right block mt-1">{{
            errors.priceChange
          }}</small>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1 text-right mt-2">سود</label>
        <IconField>
          <InputIcon class="fa fa-money-bill"/>
          <InputNumber
            v-model="profit"
            :invalid="errors.profit"
            class="w-full"
            inputId="integeronly"
            placeholder="مثلا: 2"
            type="text"
          />
        </IconField>
        <small v-if="errors.profit" class="text-red-500 text-right block mt-1">{{
            errors.profit
          }}</small>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1 text-right mt-2">میزان افزایش|کاهش سود</label>
        <IconField>
          <InputIcon class="pi pi-sort-alt"/>
          <InputNumber
            v-model="profitChange"
            :invalid="errors.profitChange"
            class="w-full"
            inputId="integeronly"
            placeholder="مثلا: 2"
            type="text"
          />
        </IconField>
        <small v-if="errors.profitChange" class="text-red-500 text-right block mt-1">{{
            errors.profitChange
          }}</small>
      </div>
      <div class="flex items-center justify-between gap-2 my-2">
        <label class="block text-sm font-medium mb-1 text-right">آیا سند این آیتم در حسابداری ثبت شود</label>
        <ToggleSwitch v-model="allowDocumentRegistration"/>
      </div>
      <div class="flex items-center justify-between mb-2 gap-2">
        <label class="block text-sm font-medium mb-1 text-right">مدیریت وضعیت آیتم با شعبه اصلی</label>
        <ToggleSwitch v-model="handleByMaster"/>
      </div>
      <div>
        <label class="block text-xs font-medium mb-1 mt-2 text-right">تاریخ ثبت درخواست برای سند اتوماتیک</label>
        <vue-date-picker displayFormat="jYYYY/jMM/jDD" format="YYYY-MM-DD" v-model="documentRegisterDate" class="w-full"
                         color="#0ea5e9"/>
      </div>
    </div>

    <div class="flex justify-end gap-2 mt-4">
      <Button size="small" severity="warn" label="بستن" @click="cancel" icon="fa fa-cancel"
              icon-pos="right"/>
      <Button size="small" type="submit" label="ذخیره تغییرات"
              icon-pos="right"
              :loading="isLoading"
              icon="fa fa-check-circle"/>
    </div>
  </form>
</template>

<script setup>
import { inject, ref, watch } from 'vue';
import { useForm } from 'vee-validate';
import * as z from 'zod';
import { useToast } from 'primevue/usetoast';
import { toTypedSchema } from '@vee-validate/zod';
import { useUserStore } from '@/stores/userStore.js';

const userStore = useUserStore();

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['updated', 'cancel']);

const toast = useToast();
const repository = inject('repository');
const isLoading = ref(false);

const baseSchema = z.object({
  price: z.preprocess(
    (val) => (val !== '' ? Number(val) : undefined),
    z.number({ invalid_type_error: 'مبلغ آیتم الزامی است' }).
      min(1, { message: 'مبلغ باید بیشتر از صفر باشد' }).
      max(1000000000, { message: 'مبلغ نمی‌تواند بیشتر از ۱ میلیارد باشد' }),
  ),

  priceChange: z.number({
    invalid_type_error: 'میزان تغییر مبلغ الزامی است',
  }),

  profit: z.number({ invalid_type_error: 'سود الزامی است' }).min(0, { message: 'سود نمی‌تواند منفی باشد' }),

  profitChange: z.number({ invalid_type_error: 'میزان تغییر سود الزامی است' }),

  documentRegisterDate: z.string().nullable().optional(),
});

const { handleSubmit, errors, defineField, resetForm } = useForm({
  validationSchema: toTypedSchema(baseSchema),
  initialValues: {
    price: null,
    priceChange: null,
    profit: null,
    profitChange: null,
    documentRegisterDate: '',
  },
});

const [price] = defineField('price');
const [priceChange] = defineField('priceChange');
const [profit] = defineField('profit');
const [profitChange] = defineField('profitChange');
const [documentRegisterDate] = defineField('documentRegisterDate');

const isActive = ref(false);
const allowBuy = ref(false);
const allowSell = ref(false);
const allowDocumentRegistration = ref(false);
const handleByMaster = ref(false);

watch(
  () => props.data,
  () => {
    resetForm({
      values: {
        price: props.data.price,
        priceChange: props.data.priceDiff,
        profit: props.data.profit,
        profitChange: props.data.profitDiff,
        documentRegisterDate: props.data.documentRegisterDate,
      },
    });
    isActive.value = props.data.isActive === 1;
    allowBuy.value = props.data.allowBuy === 1;
    allowSell.value = props.data.allowSell === 1;
    allowDocumentRegistration.value = props.data.allowDocumentRegistration === 1;
    handleByMaster.value = props.data.handleByMaster === 1;
  },
  { immediate: true },
);

const onSubmit = handleSubmit((values) => {
  const data = {
    id: props.data.id,
    price: values.price,
    priceDiff: values.priceChange,
    priceDiff1: props.data.priceDiff1,
    profit: values.profit,
    profitDiff: values.profitChange,
    isActive: isActive.value ? 1 : 0,
    allowBuy: allowBuy.value ? 1 : 0,
    allowSell: allowSell.value ? 1 : 0,
    relatedId: props.data.relatedId,
    relatedDiff: props.data.relatedDiff,
    allowDocumentRegistration: allowDocumentRegistration.value ? 1 : 0,
    documentRegisterDate: values.documentRegisterDate,
    handleByMaster: handleByMaster.value ? 1 : 0,
    uName: userStore.user.userName,
  };

  isLoading.value = true;
  repository.updatePrice(data).then((response) => {
    isLoading.value = false;
    if (response.data.state) {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: response.data.msg,
      });
      emit('updated');
    } else {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        life: 3000,
        detail: response.data.msg,
      });
    }
  });
}, (onInvalidSubmit) => {
  console.log('onInvalidSubmit!', onInvalidSubmit);
});

const cancel = () => {
  emit('cancel');
};
</script>

<style scoped></style>
