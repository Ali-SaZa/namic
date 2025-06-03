<template>
  <div class="grid grid-cols-1 gap-y-4 lg:gap-y-0 lg:gap-x-8 lg:grid-cols-4">
    <div class="col-span-1">
      <div class="rounded-lg shadow bg-gray-50 mt-2 p-4 ">
        <DaysFilter :day-filters="dayFilters" :filtered-day="filteredDay"
                    @selectDay="filterReportDiff"
                    class="mt-2" />
        <BalanceTable class="mt-2" :balanceItems="balanceItems" />
      </div>
      <div class="rounded-lg shadow bg-gray-50 mt-2 p-4 ">
        <ItemTable :sample-data="reportItemList" />
      </div>
    </div>
    <div
      class="col-span-1 lg:col-span-3 shadow w-full min-h-20 flex flex-col rounded-lg bg-gray-50 mt-2 p-4">
      <div class="flex items-center gap-2 justify-end">
        <Button label="چاپ" icon="fa fa-print" iconPos="right" variant="outlined" severity="info"
                class="max-w-max" />
        <Button icon="fa fa-eye" variant="outlined" severity="warn" @click="updateIsPrinted" />
      </div>
      <JournalTable :data="reportList" class="mt-2" />
    </div>
  </div>
</template>

<script setup>
import BalanceTable from '@/components/BalanceTable.vue'
import DaysFilter from '@/components/DaysFilter.vue'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useUserStore } from '@/stores/userStore.js'
import { useToast } from 'primevue/usetoast'
import JournalTable from '@/components/Tables/JournalTable.vue'
import ItemTable from '@/components/ItemTable.vue'

const userStore = useUserStore()
const user = computed(() => userStore.user)
const repository = inject('repository')
const toast = useToast()

const reportItemList = ref([])
const reportList = ref([])
const balanceItems = ref([])
const filteredDay = ref({})
const dayFilters = ref([])
const filters = ref({
  dateFrom: null,
  dateTo: null,
  reportKind: 0,
  diff: null,
  allDates: 1,
  isPrinted: 0
})

onMounted(() => {
  getDayFilters()
  if (user.value) {
    getTotalSummary()
  }
})

const getDayFilters = () => {
  repository.getDataSummaryReport({states: '3,4'}).then((response) => {
    dayFilters.value = response.data.summary
    filteredDay.value = dayFilters.value[0]
    filters.value.diff = filteredDay.value.diff
    getRequestList(filters.value)
  }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'خطا',
      life: 3000,
      detail: error.msg
    })
  })
}

const filterReportDiff = (dayFilter) => {
  filteredDay.value = dayFilter
  filters.value.diff = dayFilter.diff
  getRequestList(filters.value)
}

const getTotalSummary = () => {
  repository.getTotalSummaryReport({ userType: user.value.type }).then((response) => {
    balanceItems.value = response.data.balance
  }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'خطا',
      life: 3000,
      detail: error.msg
    })
  })
}

const getRequestList = ({ dateFrom, dateTo, reportKind, diff, allDates, isPrinted }) => {
  repository.getRequestList({ dateFrom, dateTo, reportKind, diff, allDates, isPrinted }).
    then((response) => {
      reportList.value = response.data.requests

      reportItemList.value = response.data.requests.map(item => ({
        name: item.priceName.trim() === 'کیلو' ? 'طلا' : item.priceName,
        value: (Number(item.weight) + Number(item.count)) * (item.pd === 1 ? -1 : 1)
      })).reduce((acc, curr) => {
        const found = acc.find(i => i.name === curr.name)
        found ? found.value += curr.value : acc.push(curr)
        return acc
      }, [])
    }).
    catch((error) => {
      console.log('error:', error)
      toast.add({
        severity: 'error',
        summary: 'خطا',
        life: 3000,
        detail: error.msg
      })
    })
}

const updateIsPrinted = () => {
  if (reportList.value.length) {
    repository.updateIsPrinted(
      {
        uName: user.value.userName,
        userType: user.value.type,
        requestLastId: reportList.value[reportList.value.length - 1].id
      }).
      then((response) => {
        console.log('response:', response)
        if (response.data.state) {
          toast.add({
            severity: 'success',
            summary: 'موفق',
            life: 3000,
            detail: 'عملیات با موفقیت انجام شد.'
          })
          getRequestList(filters.value)
        } else {
          toast.add({
            severity: 'error',
            summary: 'خطا',
            life: 3000,
            detail: 'عملیات با موفقیت انجام نشد.'
          })
        }
      })
  } else {
    toast.add({
      severity: 'error',
      summary: 'خطا',
      life: 3000,
      detail: 'لیست خالی است'
    })
  }
}

watch(user, (newValue) => {
  if (newValue) {
    getTotalSummary()
  }
}, { immediate: true })
</script>

<style>

</style>
