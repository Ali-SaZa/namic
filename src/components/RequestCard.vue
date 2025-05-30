<template>
  <div
    class="p-4 bg-base rounded-lg"
    :class="item.hasRegistered ? 'border-r-3 border-green-500' : ''"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <TypeIcon :type="item.priceType"/>
        <div class="text-lg mx-2 font-bold">{{ item.priceName }}</div>
        <div :class="item.pd === -1 ? 'text-green-500' : 'text-red-500'">
          {{ item.pd === -1 ? 'خرید' : 'فروش' }}
        </div>
      </div>
      <div :class="getStatus(item.state).class" class="text-lg">
        {{ getStatus(item.state).title }}
      </div>
    </div>
    <template v-if="item.count">
      <div class="grid grid-cols-3 justify-between text-xs mt-2">
        <div>
          <i class="fa fa-window-restore"/>
          تعداد
        </div>
        <div class="text-center" v-format-number="item.count"/>
        <div class="text-left">عدد</div>
      </div>
    </template>
    <template>
      <div class="grid grid-cols-3 justify-between text-xs mt-2">
        <div>
          <i class="fa fa-weight-hanging"/>
          وزن
        </div>
        <div class="text-center" v-format-number="item.weight"/>
        >
        <div class="text-left">گرم</div>
      </div>
    </template>

    <div class="grid grid-cols-3 justify-between text-xs mt-2">
      <div>
        <i class="fa fa-tag"/>
        فی
      </div>
      <div class="text-center" v-format-number="item.fi"/>
      <div class="text-left">ریال</div>
    </div>

    <div class="grid grid-cols-3 justify-between text-xs mt-2">
      <div>
        <i class="fa fa-money-bill-1"/>
        مبلغ کل
      </div>
      <div
        class="text-center"
        v-format-number="
          (item.fi / (item.priceType === 1 ? 4.3318 : 1)) * (item.count + item.weight)
        "
      />
      <div class="text-left">ریال</div>
    </div>

    <div
      class="grid grid-cols-3 justify-between text-xs mt-2"
      v-if="item.customerMsg && item.customerMsg !== 'undefined'"
    >
      <div>
        <i class="fa fa-money-bill-1"/>
        توضیحات
      </div>
      <div class="text-center">
        {{ item.customerMsg }}
      </div>
    </div>
    <div class="flex items-center justify-between text-xs mt-2">
      <div>
        <i class="fa fa-calendar-days"/>
        {{ dateTime.getDate(item.createdAt, 'jYYYY/jMM/jDD', null, true) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue';
import TypeIcon from '@/components/TypeIcon.vue';

const dateTime = inject('dateTime');

const props = defineProps({
  item: {
    type: Object,
    required: true,
    default: () => {},
  },
});

const getStatus = (state) => {
  {
    if (state === -1) {
      return {
        title: 'در انتظار',
        class: 'text-blue',
      };
    }
    if (state === 3) {
      return {
        title: 'تایید',
        class: 'text-green-500',
      };
    } else if (state === 2) {
      return {
        title: 'رد شده',
        class: 'text-red-500',
      };
    } else if (state === 0) {
      return {
        title: 'بدون پاسخ',
        class: 'text-yellow-500',
      };
    } else {
      return {
        title: 'نامشخص',
        class: '',
      };
    }
  }
};
</script>

<style scoped></style>
