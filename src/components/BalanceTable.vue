<template>
  <div class="rounded-lg shadow bg-gray-50 mt-2">
    <div class="pt-4 px-4">
      بالانس
    </div>
    <Divider />
    <div class="grid grid-cols-2 px-4"
         v-for="(balances,index) in balanceItems"
         :key="index">
      <div class="col-span-1">
        {{ balances.priceName }}
      </div>
      <div class="col-span-1 text-center" dir="ltr">
        {{ balances.val }}
      </div>
    </div>
    <Divider />
    <div class="grid grid-cols-2 px-4 pb-4">
      <div class="col-span-1">
        جمع کل(گرم)
      </div>
      <div class="col-span-1 text-center" dir="ltr" v-format-number="sum"></div>
    </div>
  </div>
</template>

<script setup>

import { computed } from 'vue'
import { weights } from '@/utils/CoinToGeram.js'

const props = defineProps({
  balanceItems: {
    type: Array,
    required: true
  }
})

const sum = computed(() => {
  let balanceType1 = props.balanceItems.filter(item => item.priceType === 1)
  let balanceType2 = props.balanceItems.filter(item => item.priceType === 2)
  balanceType2 = balanceType2.map(item => {
    const weightItem = weights.find(w => w.name === item.priceName)
    return {
      ...item,
      weight: weightItem ? weightItem.weight * item.val : null
    }
  })
  return balanceType1.reduce((sum, item) => sum + item.val, 0) +
    balanceType2.reduce((sum, item) => sum + item.weight, 0)
})
</script>

<style scoped>

</style>
