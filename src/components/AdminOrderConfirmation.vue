<template>
  <div class="p-2 border rounded-lg" :class="isBuy ? 'border-primary-500 bg-primary-50' : 'border-red-500 bg-red-50'">
    <div class="flex items-center w-full font-bold text-xl gap-1">
      <TypeIcon :type="type"/>
      {{ isBuy ? 'خرید' : 'فروش' }}
      {{ ' ' + itemName }}
    </div>
    <div class="flex items-center justify-between  w-full font-bold text-sm">
      <div>
        <i class="fa fa-user ml-1"/>
        <span>{{ username }}</span>
      </div>
      <div>
        درخواست
        {{ orderId }}
      </div>
    </div>
    <div class="rounded-lg shadow bg-gray-50 p-4 mt-2"
         :class="isBuy ? 'bg-primary-100' : 'bg-red-100'">
      <div class="grid grid-cols-3 justify-between mt-2">
        <template v-if="type ===1">
          <div>
            <i class="fa fa-weight-hanging"/>
            وزن
          </div>
          <div class="text-center" v-format-number="weight"/>
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
          <i class="fa fa-tag"/>
          فی
        </div>
        <div class="text-center" v-format-number="orderPrice"/>
        <div class="text-left">ریال</div>
      </div>
      <div class="grid grid-cols-3 justify-between mt-2">
        <div>
          <i class="fa fa-money-bill-1"/>
          مبلغ
        </div>
        <div class="text-center" v-format-number="sum"/>
        <div class="text-left">ریال</div>
      </div>
      <div class="grid grid-cols-3 justify-between mt-2">
        <div>
          <i class="fa fa-comment"/>
          توضیحات
        </div>
        <div class="text-right">
          {{ customerMsg }}
        </div>
      </div>
    </div>
    <div class="flex gap-2 mt-2 items-center justify-end">
      <Button v-if="isBuy" size="small" label="خرید" icon="fa fa-check" icon-pos="right" severity="success"
              @click="confirmOrder(3)"/>
      <Button v-else size="small" severity="danger" label="فروش" icon="fa fa-check" icon-pos="right"
              @click="confirmOrder(3)"/>

      <Button v-if="!displayRejectReasons" size="small" severity="warn" label="رد درخواست" @click="cancel"
              icon-pos="right"
              icon="fa fa-close"/>

      <template v-else>
        <Button size="small" severity="warn" label="رد شد" @click="confirmOrder(2,)"/>
        <Button size="small" severity="danger" label="تغییر مظنه" @click="confirmOrder(2,'تغییر مظنه')"/>
        <Button size="small" severity="danger" label="سقف مجاز" @click="confirmOrder(2,'سقف مجاز')"/>
        <Button size="small" v-if="isBuy" severity="danger" label="عدم خرید" @click="confirmOrder(2,'عدم خرید')"/>
        <Button size="small" v-else severity="danger" label="عدم فروش" @click="confirmOrder(2,'عدم فروش')"/>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import TypeIcon from '@/components/TypeIcon.vue';

const emit = defineEmits(['update:isOpen', 'confirm']);
const props = defineProps({
  username: {
    type: String,
    default: '',
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
  weight: {
    type: Number,
    default: 0,
  },
  sum: {
    type: Number,
    default: 0,
  },
  type: {
    type: Number,
    default: 1,
  },
  orderId: {
    type: Number,
    default: 0,
  },
  customerMsg: {
    type: String,
    default: '',
  },
});

const displayRejectReasons = ref(false);

const cancel = () => {
  displayRejectReasons.value = true;
};

const confirmOrder = (state, sellerMsg = '') => {
  emit('confirm', { id: props.orderId, state, sellerMsg });
};
</script>
