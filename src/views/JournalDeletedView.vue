<template>
  <div class="grid grid-cols-1 gap-y-4 lg:gap-y-0 lg:gap-x-8 lg:grid-cols-4">
    <div class="col-span-1">
      <div class="rounded-lg shadow bg-gray-50 p-4">
        <ButtonGroup class="w-full">
          <Button
            label="سکه و گرمی"
            size="small"
            :severity="reportKind === 0 ? 'info' : 'secondary'"
            @click="filterReportKind(0)"
            class="min-w-1/3"
          />
          <Button
            label="گرمی"
            size="small"
            :severity="reportKind === 1 ? 'info' : 'secondary'"
            @click="filterReportKind(1)"
            class="min-w-1/3"
          />
          <Button
            label="سکه"
            size="small"
            :severity="reportKind === 2 ? 'info' : 'secondary'"
            @click="filterReportKind(2)"
            class="min-w-1/3"
          />
        </ButtonGroup>
        <DaysFilter
          :day-filters="dayFilters"
          :filtered-day="filteredDay"
          @selectDay="filterReportDiff"
          class="mt-2"
        />
        <DateRange @submit-date-range="filterDateRange" />
        <label class="block text-sm font-medium mt-2 text-right">نحوه نمایش اسناد</label>
        <div class="flex items-center">
          <Select v-model="selectedView" :options="viewTypes" optionLabel="name" class="w-full">
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center">
                <i :class="slotProps.value.icon" />
                <div class="mr-1">{{ slotProps.value.name }}</div>
              </div>
            </template>
            <template #option="slotProps">
              <div class="flex items-center w-full" dir="rtl">
                <i :class="slotProps.option.icon" />
                <div class="mr-1">{{ slotProps.option.name }}</div>
              </div>
            </template>
          </Select>
          <PrintButton class="min-w-11 mr-2" />
        </div>
      </div>
      <BalanceTable class="mt-2" :balanceItems="balanceItems" />
      <div class="rounded-lg shadow bg-gray-50 mt-2 p-4">
        <ItemTable :sample-data="reportItemList" />
      </div>
    </div>
    <div class="col-span-1 lg:col-span-3">
      <div class="shadow w-full min-h-20 flex flex-col rounded-lg bg-gray-50">
        <div class="p-4 h-full relative flex-1">
          <template v-if="selectedView.name === 'جدول'">
            <JournalTable :data="reportList" />
          </template>
          <template v-else>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
              <JournalCard
                v-for="item in reportList"
                :item="item"
                class="col-span-1"
                :key="item.id"
                :editable="false"
              />
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref, watch } from 'vue'
import ItemTable from '@/components/ItemTable.vue'
import BalanceTable from '@/components/BalanceTable.vue'
import { useUserStore } from '@/stores/userStore.js'
import { useAdminSettingsStore } from '@/stores/adminSettings'
import { useToast } from 'primevue/usetoast'
import JournalTable from '@/components/Tables/JournalTable.vue'
import JournalCard from '@/components/JournalCard.vue'
import DateRange from '@/components/DateRange.vue'
import DaysFilter from '@/components/DaysFilter.vue'
import PrintButton from '@/components/PrintButton.vue'

const user = computed(() => userStore.user)

const userStore = useUserStore()
const adminSettingsStore = useAdminSettingsStore()
const repository = inject('repository')
const toast = useToast()

const reportList = ref([])
const reportItemList = ref([])

const reportKind = ref(0)
const filteredDay = ref({})
const dayFilters = ref([])

const selectedView = ref(
  adminSettingsStore.settings.dailyShowView === 1
    ? { name: 'جدول', icon: 'fa-solid fa-table-cells' }
    : { name: 'کارت', icon: 'fa-solid fa-table-cells' },
)
const viewTypes = ref([
  { name: 'جدول', icon: 'fa-solid fa-table-cells' },
  { name: 'کارت', icon: 'fa-solid fa-window-maximize' },
])
const balanceItems = ref([])
const filters = ref({
  dateFrom: null,
  dateTo: null,
  reportKind: null,
  diff: null,
})

onMounted(() => {
  getDayFilters()
  if (user.value) {
    getTotalSummary()
  }
})

const getTotalSummary = () => {
  repository
    .getTotalSummaryReport({ userType: user.value.type })
    .then((response) => {
      balanceItems.value = response.data.balance
    })
    .catch((error) => {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        life: 3000,
        detail: error.msg,
      })
    })
}

const getDayFilters = () => {
  repository
    .getDataSummaryReport()
    .then((response) => {
      dayFilters.value = response.data.summary
      filteredDay.value = dayFilters.value[0]
      filters.value.diff = filteredDay.value.diff
      filters.value.reportKind = reportKind.value
      getDeletedRequestsList(filters.value)
    })
    .catch((error) => {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        life: 3000,
        detail: error.msg,
      })
    })
}

const getDeletedRequestsList = ({ dateFrom, dateTo, reportKind, diff }) => {
  repository
    .getDeletedRequestsList({ dateFrom, dateTo, reportKind, diff })
    .then((response) => {
      reformatDate(response.data.requests)
    })
    .catch((error) => {
      console.log('error:', error)
      toast.add({
        severity: 'error',
        summary: 'خطا',
        life: 3000,
        detail: error.msg,
      })
    })
}

const reformatDate = (requests) => {
  reportList.value = requests

  reportItemList.value = requests
    .map((item) => ({
      name: item.priceName.trim() === 'کیلو' ? 'طلا' : item.priceName,
      value: (Number(item.weight) + Number(item.count)) * (item.pd === 1 ? -1 : 1),
    }))
    .reduce((acc, curr) => {
      const found = acc.find((i) => i.name === curr.name)
      found ? (found.value += curr.value) : acc.push(curr)
      return acc
    }, [])
}

const filterReportKind = (kind) => {
  reportKind.value = kind
  filters.value.reportKind = reportKind.value
  getDeletedRequestsList(filters.value)
}

const filterReportDiff = (dayFilter) => {
  filteredDay.value = dayFilter
  filters.value.diff = dayFilter.diff
  getDeletedRequestsList(filters.value)
}

const filterDateRange = (date) => {
  if (!date.length) return
  if (date[0]) {
    filters.value.dateFrom = date[0]
  }
  if (date[1]) {
    filters.value.dateTo = date[1]
  }
  filteredDay.value = {}
  filters.value.diff = -1
  getDeletedRequestsList(filters.value)
}

watch(
  user,
  (newValue) => {
    if (newValue) {
      getTotalSummary()
    }
  },
  { immediate: true },
)
</script>

<style></style>
