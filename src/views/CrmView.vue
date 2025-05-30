<template>
  <div class="grid grid-cols-1 gap-y-4 lg:gap-y-0 lg:gap-x-8 lg:grid-cols-4">
    <div
      class="col-span-1 rounded-lg shadow bg-gray-50 p-4 max-h-14 flex items-center justify-between"
    >
      <label class="block text-sm font-medium text-right">شارژ پنل پیامکی</label>
      <Button :label="count + ' عدد'" size="small" severity="contrast" />
    </div>
    <div class="col-span-1 lg:col-span-2 rounded-lg shadow bg-gray-50 p-4">
      <div>
        <label class="block text-sm font-bold text-right"
          >ارسال پیامک شروع / پایان فعالیت برای تمامی مشتریان</label
        >
        <Textarea
          v-model="value"
          autoResize
          rows="5"
          cols="30"
          placeholder="نام مجموعه"
          class="mt-1 w-full"
        />
      </div>
      <label class="block text-right">ارسال پیامک شروع / پایان فعالیت برای تمامی مشتریان</label>
      <div class="flex gap-2 items-center justify-center mt-1 mb-4">
        <Button
          @click="startFinishMessage('start')"
          label="ارسال پیامک شروع"
          icon-pos="right"
          icon="fa fa-share"
          size="small"
          severity="info"
        />
        <Button
          @click="startFinishMessage('stop')"
          label="ارسال پیامک پایان"
          icon-pos="right"
          icon="fa fa-share"
          size="small"
          severity="warn"
        />
      </div>
      <label class="block text-right">ارسال پیامک شروع / پایان فعالیت برای تمامی مشتریان</label>
      <div class="flex gap-2 items-center justify-center mt-1">
        <Button
          @click="bestPrice('buy')"
          label="بهترین قیمت خرید"
          icon-pos="right"
          icon="fa fa-tag"
          size="small"
        />
        <Button
          @click="bestPrice('sell')"
          label="بهترین قیمت فروش"
          icon-pos="right"
          icon="fa fa-tag"
          size="small"
          severity="danger"
        />
      </div>
    </div>

    <Dialog
      v-model:visible="userModalIsOpen"
      modal
      :style="{ width: '30rem' }"
      dir="rtl"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <template v-if="step === 1">
        <div class="w-full flex items-center justify-center">
          <div class="flex flex-col items-center justify-center w-3/4 gap-1">
            <div class="w-full flex justify-between" v-for="user in accountGroup">
              <label :for="user.id"> {{ user.name }} </label>
              <Checkbox v-model="userTypes" :inputId="user.id" :value="user.id" />
            </div>

            <Divider />

            <div class="w-full flex justify-between">
              <label for="select-all">همه موارد</label>
              <Checkbox
                inputId="select-all"
                :binary="true"
                :modelValue="isAllSelected"
                @change="toggleAll"
              />
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end mt-8 gap-2">
          <Button
            @click="userModalIsOpen = false"
            class="w-full md:max-w-max"
            size="small"
            type="submit"
            severity="secondary"
            label="بستن"
          />

          <Button
            @click="acceptUserStep"
            class="w-full md:max-w-max"
            size="small"
            type="submit"
            severity="primary"
            label="تایید و ادامه"
          />
        </div>
      </template>
      <template v-else>
        <div class="w-full flex items-center justify-center">
          <div class="flex flex-col items-center justify-center w-3/4 gap-1">
            <div class="w-full flex justify-between" v-for="item in allItems">
              <label :for="item.id"> {{ item.name }} </label>
              <Checkbox v-model="pricesNames" :inputId="item.id" :value="item.name" />
            </div>

            <Divider />

            <div class="w-full flex justify-between">
              <label for="select-all">همه موارد</label>
              <Checkbox
                inputId="select-all"
                :binary="true"
                :modelValue="isAllItemsSelected"
                @change="toggleAllItems"
              />
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end mt-8 gap-2">
          <Button
            @click="userModalIsOpen = false"
            class="w-full md:max-w-max"
            size="small"
            type="submit"
            severity="secondary"
            label="بستن"
          />

          <Button
            @click="acceptItemStep"
            class="w-full md:max-w-max"
            size="small"
            type="submit"
            severity="primary"
            label="تایید و ادامه"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="askmodalIsOpen"
      modal
      :header="askModalHeader"
      :style="{ width: '30rem' }"
      dir="rtl"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <div>
        {{ askmodalText }}
      </div>
      <div class="flex items-center justify-end mt-8 gap-2">
        <Button
          @click="closeAskModal"
          class="w-full md:max-w-max"
          size="small"
          type="submit"
          severity="secondary"
          label="بستن"
        />

        <Button
          @click="acceptAskModal"
          class="w-full md:max-w-max"
          size="small"
          type="submit"
          severity="primary"
          label="تایید و ارسال"
        />
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, watch, inject, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/userStore.js'
import { useToast } from 'primevue/usetoast'

const repository = inject('repository')
const userStore = useUserStore()
const toast = useToast()

const count = ref(0)
const value = ref('')
const selectItem = ref(false)
const userTypes = ref([])
const pricesNames = ref([])
const userModalIsOpen = ref(false)
const step = ref(1)
const askModalHeader = ref('')
const askmodalText = ref('')
const askmodalIsOpen = ref(false)
const buyOrSell = ref(0)
const onApprove = ref('')
const accountGroup = ref([])
const allItems = ref([])

const startFinishMessage = (status) => {
  if (status === 'start') {
    onApprove.value = 'start'
    userModalIsOpen.value = true
    askModalHeader.value = 'ارسال پیامک شروع فعالیت'
    askmodalText.value = 'ایا از ارسال پیامک شروع فعالیت برای مشتریان خود اطمینان دارید؟'
  } else {
    onApprove.value = 'finish'
    userModalIsOpen.value = true
    askModalHeader.value = 'ارسال پیامک پایان فعالیت'
    askmodalText.value = 'ایا از ارسال پیامک پایان فعالیت برای مشتریان خود اطمینان دارید؟'
  }
}

const bestPrice = (status) => {
  selectItem.value = true
  if (status === 'buy') {
    onApprove.value = 'buy'
    buyOrSell.value = 1
    userModalIsOpen.value = true
    askModalHeader.value = 'ارسال پیامک بهترین قیمت خرید'
    askmodalText.value = 'ایا از ارسال پیامک بهترین قیمت خرید برای مشتریان خود اطمینان دارید؟'
  } else {
    onApprove.value = 'sell'
    buyOrSell.value = 0
    userModalIsOpen.value = true
    askModalHeader.value = 'ارسال پیامک بهترین قیمت فروش'
    askmodalText.value = 'ایا از ارسال پیامک بهترین قیمت فروش برای مشتریان خود اطمینان دارید؟'
  }
}

const getAccountGroups = async () => {
  try {
    const response = await repository.getUserGroupList()

    if (response) {
      accountGroup.value = response.data.userGroup
    }
  } catch (error) {
    console.log(error, 'Error on getAccountGroups')
  }
}

const getItemsList = async () => {
  try {
    const response = await repository.getPriceList({
      id: userStore.id,
      all: true,
    })
    if (response) {
      allItems.value = response.data.prices
    }
  } catch (error) {
    console.log(error, 'error')
  }
}

const isAllItemsSelected = computed(() => {
  return allItems.value.length > 0 && pricesNames.value.length === allItems.value.length
})

const isAllSelected = computed(() => {
  return accountGroup.value.length > 0 && userTypes.value.length === accountGroup.value.length
})

const toggleAllItems = () => {
  if (isAllItemsSelected.value) {
    pricesNames.value = []
  } else {
    pricesNames.value = allItems.value.map((item) => item.name)
  }
}

const toggleAll = () => {
  if (isAllSelected.value) {
    userTypes.value = []
  } else {
    userTypes.value = accountGroup.value.map((group) => group.id)
  }
}

onMounted(() => {
  getAccountGroups()
  getItemsList()
})

const acceptUserStep = () => {
  if (selectItem.value) {
    step.value = 2
  } else {
    userModalIsOpen.value = false
    askmodalIsOpen.value = true
  }
}

const acceptItemStep = () => {
  userModalIsOpen.value = false
  step.value = 1
  askmodalIsOpen.value = true
}

const acceptAskModal = async () => {
  if (onApprove.value === 'start') {
    try {
      const response = await repository.crmStartSms({
        customerId: '-1',
        storeName: value.value,
        userGroups: userTypes.value,
        userId: userStore.id,
        userToken: userStore.token,
      })
      if (response.state) {
        toast.add({
          severity: 'success',
          summary: 'موفقیت',
          life: 3000,
          detail: 'پیام با موفقیت ارسال شد',
        })
      } else {
        toast.add({
          severity: 'warn',
          summary: 'خطا',
          life: 3000,
          detail: response.data.msg,
        })
      }
    } catch (error) {
      console.log(error, 'error')
    }
  } else if (onApprove.value === 'finish') {
    try {
      const response = await repository.crmCloseSms({
        customerId: '-1',
        storeName: value.value,
        userGroups: userTypes.value,
        userId: userStore.id,
        userToken: userStore.token,
      })
      if (response.state) {
        toast.add({
          severity: 'success',
          summary: 'موفقیت',
          life: 3000,
          detail: 'پیام با موفقیت ارسال شد',
        })
      } else {
        toast.add({
          severity: 'warn',
          summary: 'خطا',
          life: 3000,
          detail: response.data.msg,
        })
      }
    } catch (error) {
      console.log(error, 'error')
    }
  } else if (onApprove.value === 'buy' || onApprove.value === 'sell') {
    try {
      const response = await repository.crmBestPriceSms({
        customerId: '-1',
        storeName: value.value,
        userGroups: userTypes.value,
        pricesName: pricesNames.value,
        userId: userStore.id,
        userToken: userStore.token,
        buyOrSell: buyOrSell.value,
      })
      if (response.state) {
        toast.add({
          severity: 'success',
          summary: 'موفقیت',
          life: 3000,
          detail: 'پیام با موفقیت ارسال شد',
        })
      } else {
        toast.add({
          severity: 'warn',
          summary: 'خطا',
          life: 3000,
          detail: response.data.msg,
        })
      }
    } catch (error) {
      console.log(error, 'error')
    }
  }
  resetData()
}

const resetData = () => {
  askmodalIsOpen.value = false
  step.value = 1
  onApprove.value = ''
  userTypes.value = []
  pricesNames.value = []
  value.value = ''
  buyOrSell.value = 0
}
</script>
