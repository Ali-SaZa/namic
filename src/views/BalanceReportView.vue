<template>
  <div class="grid grid-cols-1 gap-y-4 lg:gap-y-0 lg:gap-x-8 lg:grid-cols-4">
    <div class="col-span-1 rounded-lg shadow bg-gray-50 p-4 max-h-max">
      <div class="flex justify-between mb-2">
        <div>
          <i class="fa-solid fa-scale-balanced"/>
          مجموع تراز:
        </div>
        <span v-format-number="sumBalance" class="font-bold"/>
      </div>
      <label> تراز خلاصه براساس</label>
      <ButtonGroup class="w-full">
        <Button :severity="filteredType === 'daily' ? 'info' : 'secondary'" class="min-w-1/3"
                label="روزانه"
                size="small"
                @click="setBalanceSitting('daily')"/>
        <Button :severity="filteredType === 'all' ? 'info' : 'secondary'" class="min-w-1/3"
                label="از ابتدا"
                size="small"
                @click="setBalanceSitting('all')"/>
        <Button :severity="filteredType === 'date' ? 'info' : 'secondary'" class="min-w-1/3"
                label="تاریخ"
                size="small"
                @click="setBalanceSitting('date')"/>
      </ButtonGroup>
      <template v-if="filteredType ==='date'">
        <label class="block text-sm font-medium mt-2 text-right">تاریخ مبدا محاسبه تراز</label>
        <div class="flex items-center w-full">
          <vue-date-picker v-model="dailyFilterDate" class="w-full" color="#0ea5e9"
                           format="YYYY-MM-DD"/>
          <Button variant="outlined"
                  @click="setBalanceDateSitting"
                  size="small"
                  class="mr-2"
                  label="جستجو"
                  style="height: 40px;width: max-content;max-width: max-content; min-width: 40px"/>
        </div>
      </template>
      <div class="mt-2">
        <label>ملاک محاسبه سود طلا</label>
        <Select
          v-model="profitCalculationMethod"
          :options="units"
          class="w-full"
          optionLabel="label"
        />
      </div>
      <DateRange @submit-date-range="filterDate"/>
    </div>
    <div class="col-span-1 lg:col-span-3 rounded-lg shadow bg-gray-50 p-4 relative">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <template v-if="balance.length > 0">
          <BalanceItem v-for="(item,index) in balance" :key="index"
                       :additionalProfit="item.additionalProfit"
                       :averageBuyFee="item.fiIn"
                       :averageSellFee="item.fiOut"
                       :boardFee="item.boardFee"
                       :definiteProfit="item.definiteProfit"
                       :buy="item.buy"
                       :sell="item.sell"
                       :type="item.priceType"
                       :name="item.priceName"
                       class="col-span-1"
          />
        </template>
        <template v-else>
          <template v-if="loading">
            <div v-for="item in Array(4)" :key="item">
              <Skeleton class="w-full rounded-lg" height="10rem"/>
            </div>
          </template>
          <div class="absolute inset-0 flex items-center justify-center" v-else>
            <span class="text-gray-600 font-semibold text-lg">ترازی یافت نشد</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import DateRange from '@/components/DateRange.vue';
import BalanceItem from '@/components/BalanceItem.vue';
import { useToast } from 'primevue/usetoast';
import { computed, inject, onMounted, ref, watch } from 'vue';
import { useUserStore } from '@/stores/userStore.js';

const userStore = useUserStore();
const repository = inject('repository');
const toast = useToast();
const user = computed(() => userStore.user);

const loading = ref(true);
const filteredType = ref('daily');
const sumBalance = ref(1235459050000);
const balance = ref([]);
const dailyFilterDate = ref('');
const units = [
  { label: 'گرم', value: 'g' },
  { label: 'کیلوگرم', value: 'kg' },
];
const profitCalculationMethod = ref(units[0]);

onMounted(() => {
  if (user.value) {
    getBalance();
  }
});

const setBalanceSitting = (value) => {
  filteredType.value = value;
  if (value !== 'date')
    repository.setSetting({ value, userType: user.value.type, key: 'BIV' }).then(() => {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: 'عملیات با موفیت انجام شد',
      });
    }).catch((error) => {
      toast.add({
        severity: 'warn',
        summary: 'خطا',
        life: 3000,
        detail: error.msg,
      });
    });
};

const setBalanceDateSitting = () => {
  const value = filteredType.value + '@' + dailyFilterDate.value;
  repository.setSetting({ value: value, userType: user.value.type, key: 'BIV' }).
    then((response) => {
      console.log('re', response);
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: 'عملیات با موفیت انجام شد',
      });
    }).
    catch((error) => {
      toast.add({
        severity: 'warn',
        summary: 'خطا',
        life: 3000,
        detail: error.msg,
      });
    });
};

const getBalance = (dateFrom = null, dateTo = null) => {
  loading.value = true;
  repository.getPriceList({
    id: userStore.id,
    all: true,
  }).then((response) => {
    const prices = response.data.prices;
    console.log('prices:', prices);

    repository.getMainBalance({ userType: user.value.type, dateFrom, dateTo }).then((response) => {

      let newBalance = response.data.balance.map(balanceItem => ({
        ...balanceItem,
        profit: prices.find(priceItem => priceItem.id === balanceItem.priceId)?.profit || null,
        price: prices.find(priceItem => priceItem.id === balanceItem.priceId)?.price || null,
        type: prices.find(priceItem => priceItem.id === balanceItem.priceId)?.type || 1,
      }));

      newBalance = newBalance.map(balanceItem => ({
        ...balanceItem,
        boardFee: balanceItem.price - balanceItem.profit,
      }));

      newBalance = newBalance.map(balanceItem => ({
        ...balanceItem,
        sell: balanceItem.type === 1 ? balanceItem.weightOut : balanceItem.countOut,
        buy: balanceItem.type === 1 ? balanceItem.weightIn : balanceItem.countIn,
        additionalProfit: balanceItem.type === 1 ? (balanceItem.weightOut - balanceItem.weightIn) *
          balanceItem.fiOut /
          balanceItem.rate : (balanceItem.countOut - balanceItem.countIn) * balanceItem.profit,
        definiteProfit: balanceItem.type === 1 ? balanceItem.weightIn * balanceItem.fiIn /
          balanceItem.rate : balanceItem.countIn * balanceItem.profit,
      }));

      balance.value = newBalance;

      console.log('balance.value :', balance.value);
    }).catch((error) => {
      toast.add({
        severity: 'warn',
        summary: 'خطا',
        life: 3000,
        detail: error.msg,
      });
    }).finally(() => {
      loading.value = false;
    });
  });
};

const filterDate = (date) => {
  console.log('filterDate:', date);
  getBalance(date[0]);
};

watch(user, (newValue) => {
  if (newValue) {
    getBalance();
  }
}, { immediate: true });
</script>

<style>
.p-select-list {
  direction: rtl !important;
}

</style>
