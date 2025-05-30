<template>
  <div class="grid grid-cols-1 gap-y-4 lg:gap-y-0 lg:gap-x-8 lg:grid-cols-4">
    <div class="col-span-1">
      <div class="rounded-lg shadow bg-gray-50 p-4">
        <ButtonGroup class="w-full">
          <Button
            label="سکه و گرمی"
            size="small"
            :severity="filteredType === 1 ? 'info' : 'secondary'"
            @click="filteredType = 1"
            class="min-w-1/3"
          />
          <Button
            label="گرمی"
            size="small"
            :severity="filteredType === 2 ? 'info' : 'secondary'"
            @click="filteredType = 2"
            class="min-w-1/3"
          />
          <Button
            label="سکه"
            size="small"
            :severity="filteredType === 3 ? 'info' : 'secondary'"
            @click="filteredType = 3"
            class="min-w-1/3"
          />
        </ButtonGroup>
        <ButtonGroup class="w-full mt-2">
          <Button
            v-for="dayFilter in dayFilters"
            size="small"
            severity="info"
            @click="getCustomerList"
            class="w-full flex flex-col"
          >
            <div>
              <span class="font-bold">
                {{ dayFilter.dayName }}
              </span>
              ({{ dayFilter.tedad }})
            </div>
            <div class="text-xs -mt-1">
              {{ dayFilter.dateStr }}
            </div>
          </Button>
        </ButtonGroup>
        <div class="flex items-center w-full">
          <DateRange @submit-date-range="submitDateFilter" />
        </div>
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
    </div>
    <div
      class="col-span-1 lg:col-span-3 shadow w-full min-h-20 flex flex-col rounded-lg bg-gray-50"
    >
      <div class="p-4 h-full relative flex-1">
        <template v-if="selectedView.name === 'کارت'">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <ItemCard
              v-for="item in customerRequestList"
              :item="item"
              class="col-span-1"
              :key="item.id"
              @delete="deleteItem"
              @editItem="editItem"
            />
          </div>
        </template>
        <template v-else>
           <UserRequestTable :sampleData="customerRequestList"/>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { sampleData } from '@/utils/mockData.js'

import { inject, onMounted, ref, watch } from 'vue'
import DateRange from '@/components/DateRange.vue'
import ItemCard from '@/components/ItemCard.vue'
import PrintButton from '@/components/PrintButton.vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore.js'
import UserRequestTable from '@/components/Tables/UserRequestTable.vue'
const dateTime = inject('dateTime')

const lastUpdateDate = ref('')
const userStore = useUserStore()
const route = useRoute()
const userId = ref(route.params.id)
const filteredType = ref(1)
const filteredDay = ref(1)
const dayFilters = ref(null)
const fromDate = ref('')
const selectedView = ref({ name: 'کارت', icon: 'fa-solid fa-table-cells' })
const viewTypes = ref([
  { name: 'جدول', icon: 'fa-solid fa-table-cells' },
  { name: 'کارت', icon: 'fa-solid fa-window-maximize' },
])
const repository = inject('repository')
const customerRequestList = ref([])
const diff = ref(null)

const requestDateSummary = async () => {
  try {
    const response = await repository.requestDateSummary({
      uName: userStore.user.userName,
      states: filteredType.value === 1 ? '3,4' : '1',
      userId: userId.value,
    })

    if (response) {
      dayFilters.value = response.data.summary
      diff.value = dayFilters.value[0].diff
      console.log(dayFilters.value)
    }
  } catch (error) {
    console.log(error, 'error on fetch requestDateSummary')
  }
}

const getCustomerList = async () => {
  try {
    const payload = {
      dateFrom: null,
      dateTo: null,
      reportKind: filteredType.value - 1,
      diff: diff.value,
      userId: userId.value,
      uName: userStore.user.userName,
    }

    if (fromDate.value) {
      ;(payload.dateFrom = fromDate.value[0]),
        (payload.dateTo = fromDate.value[1]),
        (payload.diff = -1)
    }
    const response = await repository.getCustomerList(payload)
    if (response) {
      customerRequestList.value = response.data.requests
    }
  } catch (error) {
    console.log(error, 'error on fetch getCustomerList')
  }
}

const deleteItem = (id) => {
  repository.deleteRequestItem({ id: id, userType: userStore.user.type }).then((response) => {
    if (response.data.status) {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: response.data.msg
      })
      getCustomerList()
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

const editItem = (item) => {
  console.log('item:', item)
  let data = {
    requestId: item.id,
    registrarId: userStore.id,
    registrarType: userStore.user.type,
    registrarName: userStore.user.name,
    fi: item.price,
    customerMsg: item.customerMsg,
    uName: userStore.user.userName,
  }

  if (item.priceType === 1) {
    data.amount = Math.floor(item.amount)
    data.count = 0
    data.weight = item.weight
  } else {
    data.amount = item.price
    data.count = item.count
    data.weight = 0
  }

  repository.editRequestItem(data).then((response) => {
    if (response.data.state) {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: response.data.msg
      })
      getCustomerList()
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

const submitDateFilter = (date) => {
  fromDate.value = date
}

watch([filteredType, fromDate], () => {
  getCustomerList()
})

onMounted(async () => {
  await requestDateSummary()
  await getCustomerList()
  lastUpdateDate.value = dateTime.getDate(new Date(), 'HH:MM:SS jYYYY/jMM/jDD')
})
</script>
