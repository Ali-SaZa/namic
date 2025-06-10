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
      <div class="grid grid-cols-3 justify-between mt-2">
        <div>
          <i class="fa fa-tag" />
          فی
        </div>
        <div class="text-center" v-format-number="orderPrice" />
        <CurrencyType class="text-left" />
      </div>
      <div class="grid grid-cols-3 justify-between mt-2">
        <template v-if="type ===1">
          <div>
            <i class="fa fa-weight-hanging" />
            وزن
          </div>
          <div class="text-center" v-format-number="count" />
          <div class="text-left">گرم</div>
        </template>
        <template v-else>
          <div>
            <i class="fa fa-layer-group" />
            تعداد
          </div>
          <div class="text-center" v-format-number="count" />
          <div class="text-left">عدد</div>
        </template>
      </div>
      <div class="grid grid-cols-3 justify-between mt-2">
        <div>
          <i class="fa fa-money-bill-1" />
          مبلغ کل
        </div>
        <div class="text-center" v-format-number="sum" />
        <CurrencyType class="text-left" />
      </div>
      <div class="grid grid-cols-2 justify-between mt-2">
        <div>
          <i class="fa fa-comment" />
          توضیحات
        </div>
        <div class="text-center">
          {{ description }}
        </div>
      </div>
      <div class="text-right text-blue text-sm font-bold" v-number-to-persian="sum" />
    </div>
    <div class="flex gap-2 mt-2 items-center justify-end">
      <Button size="small" severity="warn" label="بازگشت" @click="back" icon-pos="right"
              icon="fa fa-circle-arrow-left" />
      <Button size="small" severity="info" label="تایید و ثبت نهایی" @click="confirm"
              icon-pos="right" icon="fa fa-check-circle" />
    </div>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue'
import TypeIcon from '@/components/TypeIcon.vue'
import CurrencyType from '@/components/CurrencyType.vue'

const emit = defineEmits(['update:isOpen', 'confirm', 'back'])
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
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
    default: 0
  },
  count: {
    type: Number,
    default: 0
  },
  sum: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: Number,
    default: 1
  }
})

const localVisible = computed({
  get: () => props.isOpen,
  set: (val) => {
    emit('update:isOpen', val)
  }
})

const confirm = () => {
  emit('confirm')
}

const back = () => {
  emit('back')
}
</script>
