<template>
  <div class="grid grid-cols-1 gap-y-4 lg:gap-y-0 lg:gap-x-8 lg:grid-cols-4">
    <div class="col-span-1 rounded-lg shadow bg-gray-50 p-4 max-h-52">
      <div class="flex items-center w-full">
        <DateRange @submit-date-range="submitDateFilter"/>
      </div>
    </div>
    <div
      class="col-span-1 lg:col-span-3 shadow w-full min-h-20 flex flex-col rounded-lg bg-gray-50 p-4"
    >
      <div class="flex items-center h-full justify-center text-red-500" v-if="!dateFrom || !dateTo">
        برای نمایش لیست آیتم های مشاهده شده لطفا محدوده تاریخ را انتخاب کنید
      </div>
      <div v-else>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">
          <template v-if="logViews.length">
            <LogViewCard v-for="item in logViews" :key="item.id" :logItem="item" class="col-span-1"/>
          </template>
          <template v-else>
            <template v-if="loading">
              <div v-for="item in Array(4)" :key="item">
                <Skeleton class="w-full rounded-lg h-20 mb-2" height="10rem"/>
              </div>
            </template>
            <div v-else
                 class="col-span-2 w-full flex items-center justify-center text-gray-600 font-semibold text-lg">
              آیتمی یافت نشد
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue';
import LogViewCard from '@/components/LogViewCard.vue';
import DateRange from '@/components/DateRange.vue';
import { useUserStore } from '@/stores/userStore.js';

const dateFrom = ref(null);
const dateTo = ref(null);
const userStore = useUserStore();
const repository = inject('repository');
const logViews = ref([]);
const loading = ref(false);

const submitDateFilter = (date) => {
  dateFrom.value = date && date[0] ? date[0] : null;
  dateTo.value = date && date[1] ? date[1] : null;

  getPriceLogView();
};

const getPriceLogView = async () => {
  try {
    loading.value = true;
    const response = await repository.getAllPriceLogView({
      dateFrom: dateFrom.value,
      dateTo: dateTo.value,
      uName: userStore.user.userName,
    });
    if (response) {
      logViews.value = response.data.log;
      console.log(logViews.value);
    }
  } catch (error) {
    console.log(error, 'Error on getPriceLogView');
  }finally {
    loading.value = false;
  }
};

onMounted(() => {
  getPriceLogView();
});
</script>
