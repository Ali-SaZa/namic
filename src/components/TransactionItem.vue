<template>
  <div class="p-4 bg-base rounded-lg">
    <div class="flex items-center justify-between">
      <div>
        <i class="fa fa-user text-sm ml-1" />
        <span>
          {{ userName }}
        </span>
      </div>
      <div class="flex items-start">
        <i class="fa fa-eye text-sm" v-if="isSeen" />
        <span class="text-sm mx-2">
          {{ dateTime.getDate(createdAt, 'jYYYY/jMM/jDD', null, true) }}
        </span>
        <i class="fa fa-calendar-alt" />
      </div>
    </div>
    <div class="flex items-center my-2">
      <div class="text-sm">
        آیتم:
      </div>
      <div class="font-bold mr-1">
        {{ priceName }}
      </div>
      <div class="font-bold mr-1" v-if="priceType === 1">
        ({{ weight }} گرم)
      </div>
      <div class="font-bold mr-1" v-else>
        ({{ count }} عدد)
      </div>
    </div>
    <div class="flex items-center mb-2">
      <div class="text-sm">
        تحویل گیرنده:
      </div>
      <div class="font-bold mr-1">
        {{ receiver }}
      </div>
    </div>
    <div v-if="isDelivered" class="flex items-center justify-center text-green-700 text-sm">
      <i class="fa fa-motorcycle ml-1" />
      حواله به
      <span class="font-bold mx-1">
                {{ receiver }}
      </span>
      در مورخه
      <span class="font-bold mx-1">
          {{ dateTime.getDate(deliveryTime, 'jYYYY/jMM/jDD', null, true) }}
        </span>
      تحویل داده شد.
    </div>
  </div>
</template>

<script setup>

import { inject } from 'vue'

const props = defineProps({
  userName: {
    type: String,
    default: ''
  },
  createdAt: {
    type: String,
    default: ''
  },
  deliveryTime: {
    type: String,
    default: ''
  },
  priceName: {
    type: String,
    default: ''
  },
  priceType: {
    type: Number,
    default: 1
  },
  weight: {
    type: Number,
    default: 0
  },
  count: {
    type: Number,
    default: 0
  },
  receiver: {
    type: String,
    default: ''
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  isChecked: {
    type: Boolean,
    default: false
  },
  isSeen: {
    type: Boolean,
    default: false
  }
})

const dateTime = inject('dateTime')
</script>

<style scoped>

</style>
