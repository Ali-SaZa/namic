<template>
  <div class="w-full flex justify-center relative min-h-[75dvh]">
    <div class="w-full md:w-[80%] lg:w-[50%]">
      <div class="grid grid-cols-2 justify-between items-center">
        <div class="col-span-2 md:col-span-1">
          آخرین آپدیت قیمت:
          <span class="text-red-500">{{ lastUpdateTime }}</span>
          <span class="text-red-500 mr-1">{{ lastUpdateDay }}</span>
        </div>
        <div class="col-span-2 md:col-span-1 text-left">
          <template v-if="displayType==='page'">
            <MultiSelect
              filter
              ref="multiRef"
              v-model="selectedItems"
              :options="prices"
              optionLabel="name"
              optionValue="id"
              placeholder="انتخاب همه"
              :maxSelectedLabels="prices.length"
              appendTo="body"
              class="w-full md:w-80"
              :scrollHeight="'200px'"
              emptyFilterMessage="آیتمی یافت نشد" />
          </template>
          <template v-if="displayType==='group'">
            <ButtonGroup class="w-full">
              <Button
                label="گرمی"
                size="small"
                :severity="reportKind === 1 ? 'info' : 'secondary'"
                @click="()=>reportKind=1"
                class="min-w-1/2"
              />
              <Button
                label="سکه"
                size="small"
                :severity="reportKind === 2 ? 'info' : 'secondary'"
                @click="()=>reportKind=2"
                class="min-w-1/2"
              />
            </ButtonGroup>

          </template>
        </div>
      </div>
      <div class="shadow w-full min-h-20 flex flex-col rounded-lg bg-gray-50 mt-2">
        <div class="p-4 lg:px-26 h-full relative flex-1">
          <template v-if="visiblePrices.length > 0">
            <CustomerTrade :prices="visiblePrices" :pendingLogs="pendingLogs" />
          </template>
          <template v-else>
            <template v-if="loading">
              <div class="grid grid-cols-3 gap-2 mb-2">
                <Skeleton class="col-span-1 w-full rounded-lg h-20" height="2rem" v-for="item in Array(21)"
                          :key="item" />
              </div>
            </template>
            <div class="absolute inset-0 flex items-center justify-center" v-else>
              <span class="text-gray-600 font-semibold text-lg">موردی انتخاب نشده</span>
            </div>
          </template>
        </div>
      </div>
      <div class="shadow w-full min-h-12 flex items-center justify-center rounded-lg bg-gray-50 mt-2"
           v-if="adminMessage.length">
        {{ adminMessage }}
      </div>
      <template v-if="logs.length">
        <div v-for="log in logs"
             :key="log.id"
             class="shadow w-full grid grid-cols-5 min-h-12 flex items-center justify-center rounded-lg bg-gray-50 mt-2 text-sm md:text-lg"
             :class="getState(log.state).class">
          <div class="text-center col-span-1">
            {{ log.time }}
          </div>
          <div class="text-center col-span-1">
            {{ log.noeSanad + ' ' + log.priceName }}
          </div>
          <div class="text-center col-span-1">
            {{ log.priceType === 1 ? log.weight : log.count }}
          </div>
          <div class="text-center col-span-1" v-format-number="log.fi/1000">
          </div>
          <div class="text-center col-span-1">
            {{ log.sellerMsg ? log.sellerMsg : getState(log.state).title }}
          </div>
        </div>
      </template>
    </div>
    <Dialog
      v-model:visible="remainedConfirmationData.modalIsOpen"
      header="تایید مانده حساب"
      modal
      :style="{ width: '20rem' }"
      dir="rtl"
      :breakpoints="{ '1199px': '45vw', '575px': '80vw' }"
    >
      <div>
        <span class="text-center" v-format-number="remainedConfirmationData.geramAccountBalance" />
        گرم
      </div>
      <div>
        <span class="text-center" v-format-number="remainedConfirmationData.moneyAccountBalance" />
        <CurrencyType class="text-left" />
      </div>
      <div class="mt-2 w-full flex justify-end gap-2">
        <Button size="small" label="بعدا بررسی میکنم"
                icon="fa fa-cancel"
                icon-pos="right"
                @click="confirmLaterRemainedConfirmation"
                severity="warn" />
        <Button size="small" label="تایید میکنم"
                icon="fa fa-check-circle"
                icon-pos="right"
                @click="confirmRemainedConfirmation" />
      </div>
    </Dialog>
    <CallButton :phone="phone" class="absolute right-0 bottom-0" />
  </div>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'
import MultiSelect from 'primevue/multiselect'
import { useUserStore } from '@/stores/userStore.js'
import { useToast } from 'primevue/usetoast'
import CallButton from '@/components/CallButton.vue'
import CustomerTrade from '@/components/CustomerTrade.vue'
import moment from 'moment-jalaali'
import { useSettingsStore } from '@/stores/userSettings.js'
import { useSelectedItemsStore } from '@/stores/selectedItemsStore.js'
import CurrencyType from '@/components/CurrencyType.vue'

const repository = inject('repository')
const dateTime = inject('dateTime')
const userStore = useUserStore()
const selectedItemsStore = useSelectedItemsStore()
const settingsStore = useSettingsStore()

const toast = useToast()
const lastUpdateTime = ref('')
const lastUpdateDay = ref('')
const multiRef = ref(null)
const adminMessage = ref('')
const reportKind = ref(1)

const prices = ref([])
const loading = ref(true)
const selectedItems = computed({
  get: () => selectedItemsStore.selectedItems,
  set: (value) => { selectedItemsStore.selectedItems = value }
})

const priceInterval = ref(null)
const priceIntervalTime = ref(5000)
const remainedConfirmationData = ref({
  modalIsOpen: false,
  geramAccountBalance: 0,
  moneyAccountBalance: 0,
  id: 0
})

const logsInterval = ref(null)
const logIntervalTime = ref(10000)
const logs = ref([])

const phone = computed(() => {
  if (settingsStore && settingsStore.settings && settingsStore.settings.onCall)
    return settingsStore?.settings.onCall
  return ''
})

const displayType = computed(() => {
  if (settingsStore && settingsStore.settings && settingsStore.settings.priceBoard)
    return settingsStore?.settings.priceBoard
})

const visiblePrices = computed(() => {
  if (displayType.value === 'page') return prices.value.filter((price) => selectedItems.value.includes(price.id))
  else if (displayType.value === 'group') return prices.value.filter((price) => price.type === reportKind.value)
  else return prices.value
})

onMounted(() => {
  getPrices()
  getAdminMessage()
  getRemainedConfirmation()
  priceInterval.value = setInterval(() => {
    getPrices(false)
  }, priceIntervalTime.value)

  getLogs()

  logsInterval.value = setInterval(() => {
    getLogs()
  }, logIntervalTime.value)
})

onBeforeUnmount(() => {
  if (priceInterval.value) clearInterval(priceInterval.value)
  if (logsInterval.value) clearInterval(logsInterval.value)
})

const getPrices = (firstTime = true) => {
  repository.getPriceList({ all: true }).then((response) => {
    prices.value = response.data.prices.filter((prices) => prices.isActive)

    lastUpdateTime.value = dateTime.getDate(response.data.lastUpdateTime, 'jMM/jDD', null,
      true)

    lastUpdateDay.value = dateTime.getJalaliDay(moment(response.data.lastUpdateTime))
    if (firstTime) {
      loading.value = false
      if (selectedItems.value.length === 0 && prices.value.length > 0) {
        selectedItems.value = prices.value.slice(0, 4).map((r) => r.id)
      }
    }
  }).catch((error) => {
    console.log('error', error.msg)
    toast.add({
      severity: 'warn',
      summary: 'خطا',
      life: 3000,
      detail: error.msg
    })
  })
}

const getAdminMessage = () => {
  repository.getAdminMessage().then((response) => {
    if (response.data.message.length) {
      adminMessage.value = response.data.message
      toast.add({
        severity: 'info',
        summary: 'پیام ادمین',
        life: 8000,
        detail: response.data.message
      })
    }
  }).catch((error) => {
    toast.add({
      severity: 'warn',
      summary: 'خطا',
      life: 3000,
      detail: error.msg
    })
  })
}

const getRemainedConfirmation = () => {
  console.log('userStore.id:', userStore.id)
  repository.remainedConfirmation({ userId: userStore.id }).then((response) => {
    if (Object.prototype.hasOwnProperty.call(response.data, 'info')) {
      remainedConfirmationData.value.geramAccountBalance = response.data.info.geramAccountBalance
      remainedConfirmationData.value.moneyAccountBalance = +response.data.info.moneyAccountBalance
      remainedConfirmationData.value.id = +response.data.info.id
      remainedConfirmationData.value.modalIsOpen = true
    }
  }).catch((error) => {
    toast.add({
      severity: 'warn',
      summary: 'خطا',
      life: 3000,
      detail: error.msg
    })
  })
}

const confirmLaterRemainedConfirmation = () => {
  repository.updateRemainedConfirmation({ answer: 0, id: remainedConfirmationData.value.id }).then(() => {
    remainedConfirmationData.value.modalIsOpen = false
    toast.add({
      severity: 'success',
      summary: 'موفق',
      life: 3000,
      detail: 'رد مانده حساب با موفقیت انجام شد'
    })
  })
}

const confirmRemainedConfirmation = () => {
  repository.updateRemainedConfirmation({ answer: 1, id: remainedConfirmationData.value.id }).then(() => {
    remainedConfirmationData.value.modalIsOpen = false
    toast.add({
      severity: 'success',
      summary: 'موفق',
      life: 3000,
      detail: 'تایید مانده حساب با موفقیت انجام شد'
    })
  })
}

const getLogs = () => {
  repository.getRequestLog({ userId: userStore.id }).then((response) => {
    logs.value = response.data.requests
  })
}

const pendingLogs = computed(() => logs.value.filter(log => log.state === -1))

const getState = (state) => {
  {
    if (state === -1) {
      return {
        title: 'در انتظار',
        class: 'text-blue bg-blue-50'
      }
    }
    if (state === 2) {
      return {
        title: 'رد شده',
        class: 'text-red bg-red-50'
      }
    }
    if (state === 0) {
      return {
        title: 'بدون پاسخ',
        class: 'text-yellow bg-yellow-50'
      }
    } else if (state === 3) {
      return {
        title: 'تایید',
        class: 'text-primary bg-primary-50'
      }
    }
  }
}
</script>

<style>
.p-multiselect-list {
  direction: rtl !important;
}

.p-multiselect-header {
  direction: rtl;
}
</style>
