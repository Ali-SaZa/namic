<template>
  <div class="p-4 bg-base rounded-lg">
    <div class="flex items-center gap-1">
      <TypeIcon :type="type" />
      <span class="font-medium">{{ name }}</span>
    </div>
    <div class="flex items-center justify-between mt-1">
      <div>
        خرید
        <span v-format-number="buy" class="text-green-500" />
      </div>
      <div>
        فروش
        <span v-format-number="sell" class="text-red-500" />
      </div>
    </div>
    <Divider />
    <div class="flex justify-between">
      سود قطعی
      <span v-format-number="{ value: definiteProfit, minDigit: 0, maxDigit: 0 }"
            dir="ltr"
            :class="definiteProfit > 0 ? 'text-green-500' : definiteProfit < 0?'text-red':''" />
    </div>
    <div class="flex justify-between mt-1">
      سود مازاد
      <span v-format-number="{ value: additionalProfit, minDigit: 0, maxDigit: 0 }"
            dir="ltr"
            :class="additionalProfit > 0 ? 'text-green-500' : additionalProfit < 0?'text-red':''" />
    </div>
    <Divider />
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <i class="fa-solid fa-scale-balanced" />
        <span v-format-number="{ value: definiteProfit+additionalProfit, minDigit: 0, maxDigit: 0 }"
              dir="ltr"
              :class="definiteProfit+additionalProfit > 0 ? 'text-green-500' : definiteProfit+additionalProfit < 0?'text-red':''" />
      </div>
      <Button :icon="showMore?'pi pi-angle-up':'pi pi-angle-down'" severity="info" size="small"
              variant="outlined"
              @click="showMore = !showMore"
              rounded />
    </div>
    <template v-if="showMore">
      <Divider />
      <div class="flex justify-between">
        فی برد
        <span v-format-number="boardFee" />
      </div>
      <div class="flex justify-between my-1">
        فی میانگین خرید
        <span v-format-number="averageBuyFee" />
      </div>
      <div class="flex justify-between">
        فی میانگین فروش
        <span v-format-number="averageSellFee" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TypeIcon from './TypeIcon.vue'

const props = defineProps({
  type: {
    type: Number,
    default: 1
  },
  name: {
    type: String,
    default: ''
  },
  buy: {
    type: Number,
    default: 0
  },
  sell: {
    type: Number,
    default: 0
  },
  definiteProfit: {
    type: Number,
    default: 0
  },
  additionalProfit: {
    type: Number,
    default: 0
  },
  boardFee: {
    type: Number,
    default: 0
  },
  averageBuyFee: {
    type: Number,
    default: 0
  },
  averageSellFee: {
    type: Number,
    default: 0
  }
})
const showMore = ref(false)
</script>

<style scoped>

</style>
