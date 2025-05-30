<template>
  <div class="rounded-lg shadow bg-gray-50 mt-2">
    <div class="pt-4 px-4">
      بالانس
    </div>
    <Divider />
    <div class="grid grid-cols-2 px-4"
         v-for="balances in balanceItems">
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
      <div class="col-span-1 text-center" dir="ltr">
        {{ sum }}
      </div>
    </div>
  </div>
</template>

<script setup>

import { computed } from 'vue'

const props = defineProps({
  balanceItems: {
    type: Array,
    required: true
  }
})

const sum = computed(() => {
  return props.balanceItems.reduce((sum, item) => sum + item.val, 0)
})
</script>

<style scoped>

</style>
