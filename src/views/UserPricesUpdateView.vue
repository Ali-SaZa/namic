<template>
  <div class="grid grid-cols-1 gap-y-4 md:gap-y-0 md:gap-x-8 md:grid-cols-4">
    <div class="col-span-1 rounded-lg shadow bg-gray-50 p-2 max-h-max">
      <label class="block text-sm font-medium mt-2 text-right">گروه حساب</label>
      <div class="flex justify-between w-full">
        <Select
          v-model="selectedAccountGroup"
          :options="accountGroup"
          optionLabel="name"
          class="w-full"
        >
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
        <Button
          @click="groupManagementDialogIsOpen = true"
          icon="pi pi-plus"
          severity="success"
          class="mr-1 min-w-10"
        />
      </div>
      <div class="flex items-center gap-2 mt-4">
        <Button
          @click="() => resetPriceGroup(true)"
          label="ریست تمام گروه‌ها"
          severity="danger"
          size="small"
          class="w-full"
          :disabled="disableButtons"
        />
        <Button
          @click="() => resetPriceGroup(false)"
          :label="'ریست گروه ' + selectedAccountGroup.name"
          severity="info"
          size="small"
          class="w-full"
          :disabled="disableButtons"
        />
      </div>
    </div>
    <div
      v-if="!isLoading"
      class="col-span-1 md:col-span-2 rounded-lg shadow bg-gray-50 p-2 grid grid-cols-2 gap-y-2 md:gap-x-2 h-max"
    >
      <div
        class="col-span-2 md:col-span-1 p-4 bg-base rounded-lg cursor-pointer max-h-max"
        v-for="item in priceItems"
        @click="selectItem(item)"
        :class="{ 'bg-primary-100': selectedItem.id === item.id }"
      >
        <i
          class="fa-solid ml-2"
          :class="item.type === 1 ? 'fa-cubes text-yellow-400' : 'fa-ring text-blue-500'"
        />
        <span class="font-medium">{{ item.name }}</span>
      </div>
    </div>
    <div
      v-else
      class="col-span-1 md:col-span-2 rounded-lg shadow bg-gray-50 p-2 grid grid-cols-2 gap-y-2 md:gap-x-2 max-h-120 md:max-h-68"
    >
      <div
        class="col-span-2 md:col-span-1 bg-gray-50 rounded-lg cursor-pointer max-h-max"
        v-for="item in Array(5)"
      >
        <Skeleton class="w-full rounded-lg" height="3rem" />
      </div>
    </div>
    <div class="col-span-1 rounded-lg shadow bg-gray-50 p-2" v-if="selectedItem.id > 0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <label class="block text-sm font-medium text-right">خرید</label>
          <ToggleSwitch v-model="formData.allowBuy" />
        </div>
        <div class="flex items-center gap-2">
          <label class="block text-sm font-medium text-right">فروش</label>
          <ToggleSwitch v-model="formData.allowSell" />
        </div>
      </div>
      <div class="my-2">
        <label class="block text-sm font-medium mb-1 text-right">سود آیتم</label>
        <IconField>
          <InputIcon class="fa fa-money-bill" />
          <InputNumber
            v-model="formData.diff"
            class="w-full"
            inputId="integeronly"
            placeholder="مثلا: 2"
            type="text"
          />
        </IconField>
      </div>
      <label class="block text-sm font-medium mb-1 text-right">حداقل میزان سفارش</label>
      <IconField>
        <InputIcon class="fa-solid fa-arrow-down" />
        <InputNumber
          v-model="formData.min"
          class="w-full"
          inputId="integeronly"
          placeholder="مثلا: 2"
          type="text"
        />
      </IconField>
      <div class="my-2">
        <label class="block text-sm font-medium mb-1 text-right">حداکثر میزان سفارش</label>
        <IconField>
          <InputIcon class="fa-solid fa-arrow-up" />
          <InputNumber
            v-model="formData.max"
            class="w-full"
            inputId="integeronly"
            placeholder="مثلا: 200"
            type="text"
          />
        </IconField>
      </div>
      <label class="block text-sm font-medium mb-1 text-right">میزان سفارش روزانه</label>
      <IconField>
        <InputIcon class="fa-solid fa-calendar" />
        <InputNumber
          v-model="formData.dailyAmount"
          class="w-full"
          inputId="integeronly"
          placeholder="مثلا: 2000"
          type="text"
        />
      </IconField>
      <Button
        @click="updatePrice"
        label="ثبت و ذخیره"
        size="small"
        icon="fa fa-save"
        icon-pos="right"
        class="w-full mt-2"
      />
    </div>
    <GroupManagementModal
      v-model:isOpen="groupManagementDialogIsOpen"
      @refresh="getAccountGroups"
    />
  </div>
</template>

<script setup>
import { ref, inject, onMounted, reactive } from 'vue'
import GroupManagementModal from '@/components/GroupManagementModal.vue'
import { useToast } from 'primevue/usetoast'

const accountGroup = ref([])
const selectedAccountGroup = ref({ id: 1, name: 'همکار', icon: 'fa-solid fa-user' })
const groupManagementDialogIsOpen = ref(false)
const selectedItem = ref({ id: 0 })
const repository = inject('repository')
const isLoading = ref(false)
const priceItems = ref([])
const toast = useToast()
const disableButtons = ref(false)

const formData = reactive({
  allowBuy: false,
  allowSell: false,
  dailyAmount: '',
  diff: '',
  max: '',
  min: '',
})

const selectItem = async (item) => {
  if (selectedItem.value.id === item.id) {
    selectedItem.value = { id: 0 }
  } else {
    selectedItem.value = item
  }

  try {
    const response = await repository.userGroupData({
      priceId: item.id,
      userGroupId: selectedAccountGroup.value.id,
    })

    if (response) {
      Object.assign(formData, response.data.info)
    }
  } catch (error) {}
}

const getAccountGroups = async () => {
  try {
    const response = await repository.getUserGroupList()

    if (response) {
      accountGroup.value = response.data.userGroup
    }
  } catch (error) {
    console.log(error, 'Error on getAccountGroups')
  } finally {
    groupManagementDialogIsOpen.value = false
  }
}

const getPriceList = async () => {
  isLoading.value = true
  try {
    const response = await repository.getPriceList({
      all: true,
    })

    if (response) {
      priceItems.value = response.data.prices
    }
  } catch (error) {
    console.log(error, 'Error on getPriceList')
  } finally {
    isLoading.value = false
  }
}

const updatePrice = async () => {
  try {
    const response = await repository.updateGroupItems({
      priceId: selectedItem.value.id,
      userGroupId: selectedAccountGroup.value.id,
      allowBuy: formData.allowBuy,
      allowSell: formData.allowSell,
      diff: formData.diff,
      min: formData.min,
      max: formData.max,
      dailyAmount: formData.dailyAmount,
    })
    if (response) {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: response.data.msg,
      })
    }
  } catch (error) {
    console.log(error, 'error on updatePrice ')
  }
}

const resetPriceGroup = async (all = false) => {
  disableButtons.value = true
  try {
    const response = await repository.resetPriceGroup({
      userGroupId: all ? 'all' : selectedAccountGroup.value.id,
    })
    if (response) {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: response.data.msg,
      })
    }
  } catch (error) {
    console.log(error, 'error on resetPriceGroup')
  } finally {
    disableButtons.value = false
  }
}

onMounted(() => {
  getAccountGroups()
  getPriceList()
})
</script>
