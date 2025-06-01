<template>
  <div class="grid grid-cols-1 gap-y-4 lg:gap-y-0 lg:gap-x-8 lg:grid-cols-4">
    <div class="col-span-1">
      <div class="rounded-lg shadow bg-gray-50 p-4">
        <DateRange @submit-date-range="filterDateRange" class="-mt-2"/>
        <label class="block text-sm font-medium mt-2 text-right">نحوه نمایش اسناد</label>
        <div class="flex items-center">
          <Select v-model="selectedView" :options="viewTypes" optionLabel="name" class="w-full">
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center">
                <i :class="slotProps.value.icon"/>
                <div class="mr-1">{{ slotProps.value.name }}</div>
              </div>
            </template>
            <template #option="slotProps">
              <div class="flex items-center w-full" dir="rtl">
                <i :class="slotProps.option.icon"/>
                <div class="mr-1">{{ slotProps.option.name }}</div>
              </div>
            </template>
          </Select>
          <PrintButton class="min-w-11 mr-2"/>
        </div>
        <ButtonGroup class="w-full mt-2">
          <Button label="سکه و گرمی" size="small"
                  :severity="reportKind === 0 ? 'info' : 'secondary'"
                  @click="filterReportKind(0)"
                  class="min-w-1/3"/>
          <Button label="گرمی" size="small"
                  :severity="reportKind === 1 ? 'info' : 'secondary'"
                  @click="filterReportKind(1)"
                  class="min-w-1/3"/>
          <Button label="سکه" size="small"
                  :severity="reportKind === 2 ? 'info' : 'secondary'"
                  @click="filterReportKind(2)"
                  class="min-w-1/3"/>
        </ButtonGroup>
      </div>
    </div>
    <div class="col-span-1 lg:col-span-3 shadow w-full min-h-20 flex flex-col rounded-lg bg-gray-50 p-4">
      <template v-if="reportList.length">
        <template v-if="selectedView.name === 'جدول'">
          <CustomerRequestTable :data="reportList"/>
        </template>
        <template v-else>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <RequestCard v-for="item in reportList" :item="item" class="col-span-1"
                         :key="item.id"/>
          </div>
        </template>
      </template>
      <template v-else>
        <template v-if="loading">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div v-for="item in Array(20)" :key="item">
              <Skeleton class="w-full rounded-lg h-20" height="4rem"/>
            </div>
          </div>
        </template>
        <div v-else
             class="w-full flex items-center justify-center text-gray-600 font-semibold text-lg">
          دیتایی یافت نشد
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>

import { computed, inject, onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/userStore.js';
import { useToast } from 'primevue/usetoast';
import CustomerRequestTable from '@/components/Tables/CustomerRequestTable.vue';
import DateRange from '@/components/DateRange.vue';
import PrintButton from '@/components/PrintButton.vue';
import RequestCard from '@/components/RequestCard.vue';

const user = computed(() => userStore.user);

const userStore = useUserStore();
const repository = inject('repository');
const toast = useToast();

const loading = ref(true);
const reportList = ref([]);

const reportKind = ref(0);
const filteredDay = ref({});

const selectedView = ref({ name: 'کارت', icon: 'fa-solid fa-table-cells' });
const viewTypes = ref([
  { name: 'جدول', icon: 'fa-solid fa-table-cells' },
  { name: 'کارت', icon: 'fa-solid fa-window-maximize' },
]);

const filters = ref({
  dateFrom: null,
  dateTo: null,
  sort: 'sortState DESC,id DESC',
  reportKind: 0,
  diff: -1,
  userId: user.value.id,
});

onMounted(() => {
  getRequestList(filters.value);
});

const getRequestList = (filters) => {
  loading.value = true;
  repository.getCustomerRequestList(filters).then((response) => {
    reportList.value = response.data.requests;
  }).catch((error) => {
    console.log('error:', error);
    toast.add({
      severity: 'error',
      summary: 'خطا',
      life: 3000,
      detail: error.msg,
    });
  }).finally(() => {
    loading.value = false;
  });
};

const filterReportKind = (kind) => {
  reportKind.value = kind;
  filters.value.reportKind = reportKind.value;
  getRequestList(filters.value);
};

const filterDateRange = (date) => {
  if (!date.length)
    return;
  if (date[0]) {
    filters.value.dateFrom = date[0];
  }
  if (date[1]) {
    filters.value.dateTo = date[1];
  }
  filteredDay.value = {};
  filters.value.diff = -1;
  getRequestList(filters.value);
};
</script>

<style>

</style>
