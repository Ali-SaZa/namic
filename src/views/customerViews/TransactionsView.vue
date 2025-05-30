<template>
  <div class="w-full flex items-center justify-center">
    <div class="w-full md:w-[500px] rounded-lg bg-gray-50 p-4">
      <ButtonGroup class="w-full">
        <Button
          size="small"
          label="ارسال"
          icon-pos="right"
          icon="fa fa-share"
          :severity="activeTab === 1 ? 'info' : 'secondary'"
          @click="activeTab = 1"
          class="min-w-1/2"
        />
        <Button
          size="small"
          label="لیست ارسالی‌ها"
          icon-pos="right"
          icon="fa fa-list"
          :severity="activeTab === 2 ? 'info' : 'secondary'"
          @click="activeTab = 2"
          class="min-w-1/2"
        />
      </ButtonGroup>

      <template v-if="activeTab === 1">
        <div class="mt-4">
          <i class="fa-solid fa-file ml-2"></i>
          <soan class="font-bold">اطلاعات تکمیلی حواله</soan>
        </div>
        <Divider />

        <label>آیتم مورد نظر</label>
        <div class="flex items-center gap-1 mt-1">
          <Select v-model="selectedItem" :options="items" class="w-1/3" optionLabel="name" />

          <IconField class="md:w-2/3">
            <InputIcon
              :class="
                selectedItem.id === 1
                  ? 'fa-solid fa-scale-unbalanced-flip'
                  : 'fa-solid fa-layer-group'
              "
            />
            <InputNumber
              v-model="amount"
              :useGrouping="false"
              class="w-full"
              :placeholder="selectedItem.id === 1 ? 'وزن' : 'تعداد'"
              mode="decimal"
              :minFractionDigits="0"
              :maxFractionDigits="2"
            />
          </IconField>
        </div>

        <div class="w-full mt-2">
          <IconField class="flex">
            <InputIcon class="fa-solid fa-user" />
            <InputText
              class="w-full"
              type="text"
              v-model="recipientName"
              placeholder="نام تحویل گیرنده"
              :invalid="recipientName.length > 32"
            />
          </IconField>
          <div class="flex justify-end text-gray-500 text-sm p-1">
            32/{{ recipientName.length }}
          </div>
        </div>

        <Textarea
          class="w-full mt-2"
          v-model="description"
          rows="5"
          cols="30"
          placeholder="توضیحات(اختیاری)"
          :invalid="description.length > 500"
        />
        <div class="flex justify-end text-gray-500 text-sm p-1">500/{{ description.length }}</div>

        <Button
          class="w-full"
          size="small"
          severity="primary"
          label="ثبت حواله"
          @click="submitTransaction"
          icon-pos="right"
          icon="fa fa-check-circle"
        />
      </template>

      <template v-else>
        <DateRange @submit-date-range="filterDateRange" :initial-date="initialDate" />
        <template v-if="havaleList.length">
          <div
            v-for="havale in havaleList"
            class="w-full p-2 rounded-lg flex flex-col gap-1 items-center shadow-lg mt-2 bg-base"
          >
            <div class="w-full flex items-center justify-between">
              <div>آیتم</div>
              <div class="font-bold">
                {{ havale.priceName }}
                <span>{{
                  havale.priceId === 2 ? `(${havale.count}عدد)` : `(${havale.weight}گرم)`
                }}</span>
              </div>
            </div>
            <div class="w-full flex items-center justify-between">
              <div>تحویل گیرنده</div>
              <div class="font-bold">{{ havale.receiver }}</div>
            </div>
            <div v-if="havale.detail" class="w-full flex items-center justify-between">
              <div>توضیحات</div>
              <div class="font-bold">{{ havale.detail }}</div>
            </div>
            <div
              :class="getStatus(havale.state).class"
              class="flex justify-end w-full mt-2 text-sm font-bold"
            >
              {{ getStatus(havale.state).title }}
            </div>
          </div>
        </template>
        <template v-if="!havaleList.length && !isLoading">
          <div class="text-center font-bold text-red-500 my-4">حواله ای یافت نشد</div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useUserStore } from '@/stores/userStore.js'
import DateRange from '@/components/DateRange.vue'

const today = new Date()
const sixMonthsAgo = new Date(today)
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
const initialDateFrom = sixMonthsAgo.toISOString().split('T')[0]

const initialDate = ref([sixMonthsAgo, today])
const toast = useToast()
const repository = inject('repository')
const userStore = useUserStore()
const activeTab = ref(1)
const amount = ref('')
const recipientName = ref('')
const description = ref('')
const isLoading = ref(false)
const havaleList = ref([])
const dateFrom = ref(initialDateFrom)
const dateTo = ref(null)

const selectedItem = ref({ id: 1, name: 'طلا' })
const items = ref([
  { id: 1, name: 'طلا' },
  { id: 2, name: 'سکه' },
])

const submitTransaction = async () => {
  if (amount.value && recipientName.value) {
    try {
      const payload = {
        userId: userStore.id,
        priceId: selectedItem.value.id,
        receiver: recipientName.value,
        detail: description.value,
      }
      if (selectedItem.value.id === 1) {
        payload.weight = amount.value
      } else {
        payload.count = amount.value
      }
      const response = await repository.addHavale(payload)
      if (response) {
        toast.add({
          severity: 'success',
          summary: 'موفقیت',
          life: 3000,
          detail: response.data.msg,
        })
      }
    } catch (error) {
      console.log(error, 'Error on submitTransaction')
    } finally {
      resetData()
    }
  } else {
    toast.add({
      severity: 'error',
      summary: 'خطا',
      life: 3000,
      detail: 'لطفا اطلاعات را کامل وارد کنید',
    })
  }
}

const filterDateRange = (date) => {
  ;(dateFrom.value = date[0]), (dateTo.value = date[1])

  getHavaleList()
}

const resetData = () => {
  amount.value = ''
  recipientName.value = ''
  description.value = ''
  selectedItem.value = { id: 1, name: 'طلا' }
}

const getHavaleList = async () => {
  isLoading.value = true
  try {
    const response = await repository.getHavaleList({
      userId: userStore.id,
      dateFrom: dateFrom.value,
      dateTo: dateTo.value,
    })
    if (response) {
      havaleList.value = response.data.havale
      console.log(havaleList.value)
    }
  } catch (error) {
    console.log(error, 'Error on getHavaleList ')
  } finally {
    isLoading.value = false
  }
}

const getStatus = (state) => {
  {
    if (state === 0) {
      return {
        title: 'درحال بررسی',
        class: 'text-blue-500',
      }
    } else if (state === 1) {
      return {
        title: 'بررسی شده',
        class: 'text-yellow-500',
      }
    } else if (state === 2) {
      return {
        title: 'تایید شده',
        class: 'text-green-500',
      }
    } else if (state === 3) {
      return {
        title: 'رد شده',
        class: 'text-red-500',
      }
    } else {
      return {
        title: 'نامشخص',
        class: '',
      }
    }
  }
}

onMounted(() => {
  getHavaleList()
})
</script>

<style>
.p-inputtext {
  width: 100%;
}
</style>
