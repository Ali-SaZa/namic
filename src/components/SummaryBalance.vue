<template>
  <div class="p-4 flex items-center justify-between">
    <div class="flex items-center gap-1">
      <Button icon="fa fa-info-circle" severity="info" outlined rounded @click="getSummaryDetail(1)"
              :disabled="loading" />
      <i class="fa-solid fa-cubes text-yellow-400 text-2xl mr-1" />
    </div>
    <div :class="balance.weight >= 0 ? 'text-green-500' : 'text-red'" dir="ltr">{{ balance.weight }}</div>
  </div>
  <div class="p-4 flex items-center justify-between">
    <div class="flex items-center gap-1">
      <Button icon="fa fa-info-circle" severity="info" outlined rounded @click="getSummaryDetail(2)"
              :disabled="loading" />
      <i class="fa-solid fa-ring text-blue-500 text-2xl mr-1" />
    </div>
    <div>
      <div class="flex flex-row gap-y-1" v-for="(balanceItem,index) in balance.count" :key="index">
        <div :class="balanceItem.count > 0 ? 'text-green-500' : 'text-red'" dir="ltr" v-if="balanceItem.count!=0">
          {{ balanceItem.count > 0 ? balanceItem.count + '+' : balanceItem.count }}
        </div>
      </div>
    </div>
  </div>
  <Dialog
    v-model:visible="balanceModalIsOpen"
    modal
    :style="{ width: '30rem' }"
    dir="rtl"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <template #header>
      <div class="inline-flex items-center justify-center gap-2">
        <template v-if="balanceModalType === 1">
          <i class="fa-solid fa-cubes text-yellow-400 text-2xl" />
          <span class="text-yellow-400 text-xl"> طلا </span>
        </template>
        <template v-else>
          <i class="fa-solid fa-ring text-blue-500 text-2xl" />
          <span class="text-blue-500 text-xl"> سکه </span>
        </template>
      </div>
    </template>
    <div class="border-b border-gray-50 pb-4 mb-2">
      <div class="grid grid-cols-6 gap-2" v-for="(item,index) in summaryDetail" :key="index">
        <div class="col-span-3">
          {{ item.priceName }}
        </div>
        <div class="col-span-1" dir="ltr" :class="item.val > 0 ? 'text-green-500' : item.val < 0?'text-red':''">
          {{ item.val }}
        </div>
        <div class="col-span-2 text-left" v-format-number="item.fiAvg"></div>
      </div>
    </div>
    <div class="flex items-center justify-between mb-2">
      <div class="font-bold text-sm">جمع سكه و طلا</div>
      <div class="col-span-2 text-left" v-format-number="{ value: sumCoinAndGold, minDigit: 3, maxDigit: 3 }"
           dir="ltr"
           :class="sumCoinAndGold > 0 ? 'text-green-500' : sumCoinAndGold < 0?'text-red':''"></div>
    </div>
    <div class="flex items-center justify-between mb-1">
      <div class="font-bold text-sm">جمع طلا</div>
      <div class="col-span-2 text-left" v-format-number="{ value: sumGold, minDigit: 0, maxDigit: 3 }"
           dir="ltr"
           :class="sumGold > 0 ? 'text-green-500' : sumGold < 0?'text-red':''"></div>
    </div>
    <div class="flex items-center justify-between">
      <div class="font-bold text-sm">جمع سكه</div>
      <div class="col-span-2 text-left" v-format-number="{ value: sumCoin, minDigit: 3, maxDigit: 3 }"
           dir="ltr"
           :class="sumCoin > 0 ? 'text-green-500' : sumCoin < 0?'text-red':''">>
      </div>
    </div>
    <div class="mt-2 w-full flex justify-end">
      <Button
        size="small"
        label="بستن"
        icon="fa fa-cancel"
        icon-pos="right"
        @click="balanceModalIsOpen = false"
        severity="warn"
      />
    </div>
  </Dialog>
</template>

<script setup>
import { computed, inject, ref } from 'vue'
import { useUserStore } from '@/stores/userStore.js'
import { weights } from '@/utils/CoinToGeram.js'

const userStore = useUserStore()

const repository = inject('repository')
const user = computed(() => userStore.user)

const props = defineProps({
  balance: {
    type: Object,
    required: true,
    default: {
      weight: 0,
      count: []
    }
  }
})

const balanceModalIsOpen = ref(false)
const balanceModalType = ref(1)
const summaryDetail = ref([])
const sumCoinAndGold = ref(0)
const sumGold = ref(0)
const sumCoin = ref(0)
const loading = ref(false)

const getSummaryDetail = (type) => {
  loading.value = true
  repository.getTotalSummaryDetail({ BIV: 'all', userType: user.value.type }).then((response) => {
    if (type === 1) {
      summaryDetail.value = response.data.balance.type1
    } else if (type === 2) {
      summaryDetail.value = response.data.balance.type2
    }

    const result = response.data.balance.type2.map(item => {
      const coinName = item.priceName.replace('مانده از قبل ', '').trim()
      const weightItem = weights.find(w => w.name === coinName)
      return {
        ...item,
        weight: weightItem ? weightItem.weight : null
      }
    })

    loading.value = false

    sumCoin.value = result.reduce((total, item) => total + (item.val * item.weight), 0)
    sumGold.value = response.data.balance.type1.reduce((total, item) => total + item.val, 0)

    sumCoinAndGold.value = +sumCoin.value + sumGold.value

    balanceModalIsOpen.value = true
    balanceModalType.value = type

  })
}
</script>

<style scoped>

</style>
