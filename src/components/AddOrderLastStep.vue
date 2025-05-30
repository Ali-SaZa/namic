<template>
  <Dialog
    v-model:visible="localVisible"
    modal
    :style="{ width: '30rem' }"
    dir="rtl"
    :breakpoints="{ '1199px': '45vw', '575px': '80vw' }"
  >
    <template #header>
      <div class="flex items-center w-full font-bold text-xl gap-1">
        <TypeIcon :type="type"/>
        {{ isBuy ? 'خرید' : 'فروش' }}
        {{ ' ' + itemName }}
      </div>
    </template>
    <div class="rounded-lg shadow bg-gray-50 p-4 mt-2">
      <template v-if="state === 3">
        <div class="w-full flex flex-col gap-2 items-center justify-center ">
          <i class="fa fa-check-circle text-green-500 text-6xl"/>
          <p>
            درخواست شما تایید شد
          </p>
        </div>
        <div class="grid grid-cols-3 justify-between mt-2">
          <div>
            <i class="fa fa-tag"/>
            فی
          </div>
          <div class="text-center" v-format-number="orderPrice"/>
          <div class="text-left">ریال</div>
        </div>
        <div class="grid grid-cols-3 justify-between mt-2">
          <template v-if="type ===1">
            <div>
              <i class="fa fa-weight-hanging"/>
              وزن
            </div>
            <div class="text-center" v-format-number="count"/>
            <div class="text-left">گرم</div>
          </template>
          <template v-else>
            <div>
              <i class="fa fa-layer-group"/>
              تعداد
            </div>
            <div class="text-center" v-format-number="count"/>
            <div class="text-left">عدد</div>
          </template>
        </div>
        <div class="grid grid-cols-3 justify-between mt-2">
          <div>
            <i class="fa fa-money-bill-1"/>
            مبلغ
          </div>
          <div class="text-center" v-format-number="sum"/>
          <div class="text-left">ریال</div>
        </div>
        <div class="grid grid-cols-2 justify-between mt-2">
          <div>
            <i class="fa fa-calendar-alt"/>
            زمان تایید
          </div>
          <div dir="ltr">
            {{ dateTime.getDate(updatedAt, 'jYYYY/jMM/jDD', null, true) }}
          </div>
        </div>
      </template>
      <template v-if="state === 2">
        <div class="w-full flex flex-col gap-2 items-center justify-center ">
          <i class="fa-solid fa-circle-xmark text-red-500 text-6xl"></i>
          <template v-if="sellerMsg.length">
            <p>
              درخواست شما
              به دلیل
              <span class="font-bold text-red-500">
                {{ sellerMsg }}
              </span>
              رد شد
            </p>
          </template>
          <template v-else>
            <p>
              درخواست شما رد شد
            </p>
          </template>
        </div>
      </template>
    </div>
    <div class="flex gap-2 mt-2 items-center justify-end">
      <Button size="small" severity="warn" label="بستن" @click="localVisible = false" icon-pos="right"
              icon="fa fa-close"/>
      <Button size="small" severity="info" label="تکرار درخواست" @click="repeat" icon-pos="right"
              v-if="state === 2"
              icon="fa fa-repeat"/>
    </div>
  </Dialog>
</template>

<script setup>
import { computed, inject } from 'vue';
import TypeIcon from '@/components/TypeIcon.vue';

const dateTime = inject('dateTime');

const emit = defineEmits(['update:isOpen', 'repeat']);
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  isBuy: {
    type: Boolean,
    default: true,
  },
  itemName: {
    type: String,
    default: '',
  },
  orderPrice: {
    type: Number,
    default: 0,
  },
  count: {
    type: Number,
    default: 0,
  },
  sum: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    default: '',
  },
  type: {
    type: Number,
    default: 1,
  },
  sellerMsg: {
    type: String,
    default: '',
  },
  updatedAt: {
    type: String,
    default: '',
  },
  state: {
    type: Number,
    default: 0,
  },
});

const localVisible = computed({
  get: () => props.isOpen,
  set: (val) => {
    emit('update:isOpen', val);
  },
});

const repeat = () => {
  emit('repeat');
  localVisible.value = false;
};
</script>
