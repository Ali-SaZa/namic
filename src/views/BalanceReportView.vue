<template>
  <div class="grid grid-cols-1 gap-y-4 lg:gap-y-0 lg:gap-x-8 lg:grid-cols-4">
    <div class="col-span-1 rounded-lg shadow bg-gray-50 p-4 max-h-max">
      <div class="flex justify-between mb-2">
        <div>
          <i class="fa-solid fa-scale-balanced" />
          مجموع تراز:
        </div>
        <span v-format-number="{ value: sumBalance, minDigit: 0, maxDigit: 0 }"
              dir="ltr"
              :class="sumBalance > 0 ? 'text-green-500' :sumBalance < 0?'text-red':''" />
      </div>
      <label> تراز خلاصه براساس</label>
      <ButtonGroup class="w-full">
        <Button :severity="filteredType === 'daily' ? 'info' : 'secondary'" class="min-w-1/3"
                label="روزانه"
                size="small"
                @click="setBalanceSitting('daily')" />
        <Button :severity="filteredType === 'all' ? 'info' : 'secondary'" class="min-w-1/3"
                label="از ابتدا"
                size="small"
                @click="setBalanceSitting('all')" />
        <Button :severity="filteredType === 'date' ? 'info' : 'secondary'" class="min-w-1/3"
                label="تاریخ"
                size="small"
                @click="setBalanceSitting('date')" />
      </ButtonGroup>
      <template v-if="filteredType ==='date'">
        <label class="block text-sm font-medium mt-2 text-right">تاریخ مبدا محاسبه تراز</label>
        <div class="flex items-center w-full">
          <vue-date-picker v-model="dailyFilterDate" class="w-full" color="#0ea5e9"
                           format="YYYY-MM-DD" />
          <Button class="mr-2"
                  label="جستجو"
                  size="small"
                  style="height: 40px;width: max-content;max-width: max-content; min-width: 40px"
                  variant="outlined"
                  @click="setBalanceDateSitting" />
        </div>
      </template>
      <div class="mt-2">
        <label>ملاک محاسبه سود طلا</label>
        <Select
          v-model="profitCalculationMethod"
          :options="units"
          class="w-full"
          optionLabel="label"
          @change="setProfitCalculationMethod"
        />
      </div>
      <DateRange @submit-date-range="filterDate" />
    </div>
    <div class="col-span-1 lg:col-span-3 rounded-lg shadow bg-gray-50 p-4 relative">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <template v-if="balance.length > 0">
          <BalanceItem v-for="(item,index) in balance" :key="index"
                       :additionalProfit="item.additionalProfit"
                       :averageBuyFee="item.fiIn"
                       :averageSellFee="item.fiOut"
                       :boardFee="item.boardFee"
                       :buy="item.buy"
                       :definiteProfit="item.definiteProfit"
                       :name="item.priceName"
                       :sell="item.sell"
                       :type="item.priceType"
                       class="col-span-1"
          />
        </template>
        <template v-else>
          <template v-if="loading">
            <div v-for="item in Array(4)" :key="item">
              <Skeleton class="w-full rounded-lg" height="10rem" />
            </div>
          </template>
          <div v-else class="absolute inset-0 flex items-center justify-center">
            <span class="text-gray-600 font-semibold text-lg">ترازی یافت نشد</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import DateRange from '@/components/DateRange.vue'
import BalanceItem from '@/components/BalanceItem.vue'
import { useToast } from 'primevue/usetoast'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useUserStore } from '@/stores/userStore.js'

const userStore = useUserStore()
const repository = inject('repository')
const toast = useToast()
const user = computed(() => userStore.user)

const loading = ref(true)
const filteredType = ref('daily')
const sumBalance = ref(0)
const balance = ref([])
const dailyFilterDate = ref('')
const units = [
  { label: 'گرم', value: 1 },
  { label: 'کیلوگرم', value: 2 }
]
const profitCalculationMethod = ref(units[0])

const prices = ref([])
const balances = ref([])
const filters = ref({
  dateFrom: null,
  dateTo: null
})

onMounted(() => {
  if (user.value) {
    getBalance()
  }
})

const setBalanceSitting = (value) => {
  filteredType.value = value
  if (value !== 'date')
    repository.setSetting({ value, userType: user.value.type, key: 'BIV' }).then(() => {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: 'عملیات با موفیت انجام شد'
      })
    }).catch((error) => {
      toast.add({
        severity: 'warn',
        summary: 'خطا',
        life: 3000,
        detail: error.msg
      })
    })
}

const setBalanceDateSitting = () => {
  console.log('setBalanceDateSitting')
  const value = filteredType.value + '@' + dailyFilterDate.value
  repository.setSetting({ value: value, userType: user.value.type, key: 'BIV' }).
    then((response) => {
      console.log('re', response)
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: 'عملیات با موفیت انجام شد'
      })
    }).
    catch((error) => {
      toast.add({
        severity: 'warn',
        summary: 'خطا',
        life: 3000,
        detail: error.msg
      })
    })
}

const prepareBalance = (prices, balances) => {
  let newBalance = balances.map(balanceItem => ({
    ...balanceItem,
    profit: prices.find(priceItem => priceItem.id === balanceItem.priceId)?.profit || null,
    price: prices.find(priceItem => priceItem.id === balanceItem.priceId)?.price || null,
    type: prices.find(priceItem => priceItem.id === balanceItem.priceId)?.type || 1
  }))

  const gramiPrice = prices.find(priceItem => priceItem.name === 'گرمی').price
  const kiloPrice = prices.find(priceItem => priceItem.name === 'کیلو').price

  newBalance.forEach((balanceItem) => {
    if (balanceItem.type === 1) {

      if (profitCalculationMethod.value.value === 1) {
        balanceItem.boardFee = gramiPrice
      } else {
        balanceItem.boardFee = kiloPrice
      }

      balanceItem.sell = balanceItem.weightOut
      balanceItem.buy = balanceItem.weightIn

      balanceItem.definiteProfit = Math.min(balanceItem.buy, balanceItem.sell) *
        ((balanceItem.fiOut - balanceItem.fiIn) / balanceItem.rate)

      const diff = balanceItem.buy - balanceItem.sell

      console.log('diff:', diff)
      balanceItem.additionalProfit = Math.abs(diff) * (
        diff >= 0
          ? ((balanceItem.boardFee - balanceItem.fiIn) / balanceItem.rate)
          : ((balanceItem.fiOut - balanceItem.boardFee) / balanceItem.rate)
      )
    } else {
      balanceItem.boardFee = balanceItem.price
      balanceItem.sell = balanceItem.countOut
      balanceItem.buy = balanceItem.countIn

      balanceItem.definiteProfit = Math.min(balanceItem.buy, balanceItem.sell) *
        (balanceItem.fiOut - balanceItem.fiIn)

      const diff = balanceItem.buy - balanceItem.sell

      balanceItem.additionalProfit = Math.abs(diff) * (
        diff >= 0
          ? (balanceItem.boardFee - balanceItem.fiIn)
          : (balanceItem.fiOut - balanceItem.boardFee)
      )

    }
  })

  balance.value = newBalance
  sumBalance.value = newBalance.reduce(
    (acc, balanceItem) => acc + balanceItem.additionalProfit + balanceItem.definiteProfit, 0)
}

const getBalance = (dateFrom = null, dateTo = null) => {
  loading.value = true
  repository.getPriceList({
    id: userStore.id,
    all: true
  }).then((response) => {
    prices.value = response.data.prices
    repository.getMainBalance({ userType: user.value.type, dateFrom, dateTo }).then((response) => {

      balances.value = response.data.balance
      prepareBalance(prices.value, balances.value)
    }).finally(() => {
      loading.value = false
    })
  })
}

const filterDate = (date) => {
  console.log('filterDate:', date)
  filters.value.dateFrom = date[0]
  filters.value.dateTo = date[1]
  getBalance(filters.value.dateFrom, filters.value.dateTo)
}

watch(user, (newValue) => {
  if (newValue) {
    getBalance()
  }
}, { immediate: true })

const setProfitCalculationMethod = (event) => {
  repository.updateBalanceCredential({ id: event.value.value, uName: userStore.user.userName }).then((response) => {
    if (response.data.state) {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: response.data.msg
      })
      prepareBalance(prices.value, balances.value)
    } else {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        life: 3000,
        detail: response.data.msg
      })
    }
  })
}
</script>

<style>
.p-select-list {
  direction: rtl !important;
}

</style>
