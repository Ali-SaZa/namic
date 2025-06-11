<template>
  <Dialog
    v-model:visible="localVisible"
    modal
    :header="header"
    :style="{ width: '30rem', height:'70vh' }"
    dir="rtl"
    :breakpoints="{ '1199px': '45vw', '575px': '90vw' }"
  >
    <div class="rounded-lg border-gray-200 border p-2 mb-2"
         v-for="item in localUserPricesData" :key="item.id">
      <div class="grid grid-cols-10">
        <div class="col-span-7 md:col-span-8">
          <TypeIcon :type="item.type"/>
          {{ item.name }}
        </div>
        <div class="col-span-3 md:col-span-2 flex items-center gap-2 min-w-[85px]">
          <ToggleSwitch v-model="item.isActive" class="min-w-[40px]"/>
          <Button icon="fa fa-trash" size="small" outlined severity="danger" @click="removeItem(item.id)"/>
        </div>
      </div>
      <div class="grid grid-cols-10 mt-2">
        <div class="col-span-8 md:col-span-9 flex items-center">
          <div class="flex items-center">
            <label class="block text-sm font-medium text-right ml-2">خرید</label>
            <ToggleSwitch v-model="item.allowBuy"/>
          </div>
          <div class="flex items-center mr-4">
            <label class="block text-sm font-medium text-right ml-2">فروش</label>
            <ToggleSwitch v-model="item.allowSell"/>
          </div>
        </div>
        <div class="col-span-2 md:col-span-1 pr-4.5 md:pr-1.5">
          <Button size="small" severity="info" outlined icon="fa fa-caret-down" @click="openDetail(item.id)"/>
        </div>
      </div>

      <div v-if="item.isOpen">
        <form @submit.prevent="handleFormSubmit">

          <label class="block text-sm font-medium mb-1 text-right">کد حسابداری تمامی آیتم‌ها</label>
          <IconField>
            <InputIcon class="fa fa-id-card"/>
            <InputNumber
              v-model="accountId"
              class="w-full"
              inputId="integeronly"
            />
          </IconField>
          <small v-if="errors.accountId" class="text-red-500 text-right block mt-1">{{ errors.accountId }}</small>

          <label class="block text-sm font-medium mb-1 text-right mt-2">میزان افزایش|کاهش سود</label>
          <IconField>
            <InputIcon class="pi pi-sort-alt"/>
            <InputNumber
              v-model="diff"
              :invalid="errors.diff"
              class="w-full"
              inputId="integeronly"
              placeholder="مثلا: 2"
              type="text"
            />
          </IconField>
          <small v-if="errors.diff" class="text-red-500 text-right block mt-1">{{ errors.diff }}</small>

          <label class="block text-sm font-medium mb-1 text-right mt-2">حداقل میزان سفارش</label>
          <IconField>
            <InputIcon class="fa-solid fa-arrow-down"/>
            <InputNumber
              v-model="min"
              :invalid="errors.min"
              class="w-full"
              inputId="integeronly"
              placeholder="مثلا: 1"
              type="text"
            />
          </IconField>
          <small v-if="errors.min" class="text-red-500 text-right block mt-1">{{ errors.min }}</small>

          <label class="block text-sm font-medium mb-1 text-right mt-2">حداکثر میزان سفارش</label>
          <IconField>
            <InputIcon class="fa-solid fa-arrow-up"/>
            <InputNumber
              v-model="max"
              :invalid="errors.max"
              class="w-full"
              inputId="integeronly"
              placeholder="مثلا: 200"
              type="text"
            />
          </IconField>
          <small v-if="errors.max" class="text-red-500 text-right block mt-1">{{ errors.max }}</small>

          <label class="block text-sm font-medium mb-1 text-right mt-2">میزان سفارش روزانه</label>
          <IconField>
            <InputIcon class="fa-solid fa-calendar"/>
            <InputNumber
              v-model="dailyAmount"
              :invalid="errors.dailyAmount"
              class="w-full"
              inputId="integeronly"
              placeholder="مثلا: 2000"
              type="text"
            />
          </IconField>
          <small v-if="errors.dailyAmount" class="text-red-500 text-right block mt-1">{{ errors.dailyAmount }}</small>


          <div class="flex justify-end mt-2">
            <Button size="small" severity="info" label="ثبت و ذخیره" icon="fa fa-save" icon-pos="right" type="submit"/>
          </div>
        </form>
      </div>


    </div>

    <div class="flex gap-2 mt-2 items-center justify-end">
      <Button size="small" severity="warn" label="بستن" @click="cancel" icon-pos="right"
              icon="fa fa-cancel"/>
    </div>
  </Dialog>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue';
import TypeIcon from '@/components/TypeIcon.vue';
import * as z from 'zod';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { useUserStore } from '@/stores/userStore.js';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const userStore = useUserStore();
const repository = inject('repository');
const emit = defineEmits(['update:isOpen', 'getAccountGroups']);
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  header: {
    type: String,
    default: '',
  },
  userId: {
    type: Number,
    required: true,
  },
  userPricesData: {
    type: Array,
    required: true,
  },
});

const baseSchema = z.object({
  accountId: z.number({ invalid_type_error: 'کد حسابداری الزامی است' }).
    min(1, { message: 'کد حسابداری باید بیشتر از صفر باشد' }),

  diff: z.number({ invalid_type_error: 'سود الزامی است' }).min(0, { message: 'سود نمی‌تواند منفی باشد' }),

  min: z.number({ invalid_type_error: 'حداقل سفارش الزامی است' }).
    min(1, { message: 'حداقل سفارش باید بیشتر از صفر باشد' }),

  max: z.number({ invalid_type_error: 'حداکثر سفارش الزامی است' }).
    min(1, { message: 'حداکثر سفارش باید بیشتر از صفر باشد' }),

  dailyAmount: z.number({ invalid_type_error: 'سفارش روزانه الزامی است' }).
    min(1, { message: 'سفارش روزانه باید بیشتر از صفر باشد' }),
});
const { errors, handleSubmit, defineField, resetForm } = useForm({
  validationSchema: toTypedSchema(baseSchema),
});
const [accountId] = defineField('accountId');
const [diff] = defineField('diff');
const [min] = defineField('min');
const [max] = defineField('max');
const [dailyAmount] = defineField('dailyAmount');

const localUserPricesData = ref({});
const selectedPrice = ref({});

watch(() => props.userPricesData, (newVal) => {
  localUserPricesData.value = newVal;
}, { deep: true });

const localVisible = computed({
  get: () => props.isOpen,
  set: (val) => emit('update:isOpen', val),
});

const cancel = () => {
  localVisible.value = false;
};

const removeItem = (id) => {
  // localUserPricesData.value = localUserPricesData.value.filter((item) => item.id !== id);
  toast.add({
    severity: 'error',
    summary: 'خطا',
    detail: 'حذف امکان پذیر نمی‌باشد',
    life: 3000,
  });
};

const openDetail = (id) => {
  selectedPrice.value = localUserPricesData.value.find(item => item.id === id);
  console.log('selectedPrice:', selectedPrice.value);

  resetForm({
    values: {
      accountId: selectedPrice.value.accountId || 0,
      diff: selectedPrice.value.diff || 0,
      min: selectedPrice.value.min || 0,
      max: selectedPrice.value.max || 0,
      dailyAmount: selectedPrice.value.dailyAmount || 0,
    },
  });

  localUserPricesData.value = localUserPricesData.value.map((item) => {
    item.isOpen = item.id === id;
    return item;
  });
};

const handleFormSubmit = handleSubmit((values) => {
  console.log('values:', values);

  const data = {
    userPriceId: selectedPrice.value.userPriceId,
    userId: props.userId,
    min: values.min,
    max: values.max,
    dailyAmount: values.dailyAmount,
    diff: values.diff,
    accountId: values.accountId,
    isActive: selectedPrice.value.isActive ? 1 : 0,
    allowBuy: selectedPrice.value.allowBuy ? 1 : 0,
    allowSell: selectedPrice.value.allowSell ? 1 : 0,
    priceId: selectedPrice.value.id,
    uName: userStore.user.userName,
  };

  repository.updateUserPrices(data).then((response) => {
    if (response.data.state) {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: response.data.msg,
      });
      // Update the item in localUserPricesData
      localUserPricesData.value = localUserPricesData.value.map(item => {
        if (item.id === selectedPrice.value.id) {
          return {
            ...item,
            accountId: values.accountId,
            diff: values.diff,
            min: values.min,
            max: values.max,
            dailyAmount: values.dailyAmount,
            isActive: selectedPrice.value.isActive, // keep as boolean
            allowBuy: selectedPrice.value.allowBuy, // keep as boolean
            allowSell: selectedPrice.value.allowSell, // keep as boolean
            isOpen: false, // close the details after update
          };
        }
        return item;
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
});
</script>
