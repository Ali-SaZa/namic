<template>
  <div class="grid grid-cols-1 gap-y-4 lg:gap-y-0 lg:gap-x-8 lg:grid-cols-4">
    <div class="col-span-1">
      <div class="rounded-lg shadow bg-gray-50 p-4">
        <DateRange @submit-date-range="submitDateFilter" />
      </div>
      <CountTableIcon :requestCount="requestCount" v-if="requestCount.length" />
    </div>
    <div class="col-span-1 lg:col-span-3">
      <div class="shadow w-full min-h-20 flex flex-col rounded-lg bg-gray-50">
        <div class="p-4 h-full relative flex-1">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <template v-if="requestList.length">
              <JournalCard
                v-for="item in requestList"
                :key="item.id"
                :editable="false"
                :item="item"
                class="col-span-1"
              />
            </template>
            <template v-else>
              <div class="col-span-1 lg:col-span-2 text-center mt-2 font-bold text-red-500">دیتایی یافت نشد</div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useUserStore } from '@/stores/userStore.js'
import JournalCard from '@/components/JournalCard.vue'
import DateRange from '@/components/DateRange.vue'
import CountTableIcon from '@/components/CountTableIcon.vue'

const user = computed(() => userStore.user)

const userStore = useUserStore()
const repository = inject('repository')
const requestCount = ref([])
const requestList = ref([])
const dateFrom = ref(null)
const dateTo = ref(null)

const getRequestCount = async () => {
  try {
    const response = await repository.getRequestCount({
      dateFrom: dateFrom.value,
      dateTo: dateTo.value,
      uName: user.value.userName,
    })
    if (response) {
      requestCount.value = response.data.requestCount
    }
  } catch (error) {
    console.log(error, 'error on getRequestCount')
  }
}

const getRequestList = async () => {
  try {
    const response = await repository.getRequestList(
      {
        dateFrom: dateFrom.value,
        dateTo: dateTo.value,
        uName: user.value.userName,
      },
      '3',
    )
    if(response){
      requestList.value = response.data.requests
    }
  } catch (error) {
    console.log(error, 'error on getRequestList')
  }
}

const submitDateFilter = (date) => {
  dateFrom.value = date && date[0] ? date[0] : null
  dateTo.value = date && date[1] ? date[1] : null

  getRequestCount()
  getRequestList()
}

onMounted(() => {
  getRequestCount()
  getRequestList()
})
</script>

<style></style>
