<template>
  <template v-if="visiblePrices.length > 0">
    <div class="flex gap-4 space-y-2" v-for="price in visiblePrices" :key="price.id">
      <div class="flex-1" :class="editable?'mt-4':'mt-2'">
        <div class="text-center mb-2">سود</div>
        <div class="shadow rounded-lg flex justify-between items-center bg-base p-2">
          <Button
            size="small"
            icon="fa-solid fa-plus"
            severity="success"
            rounded
            @click="updateValue(true, true, price)"
            :disabled="isLoading"
          />
          <div class="font-bold" v-format-number="price.profit"></div>
          <Button
            size="small"
            icon="fa-solid fa-minus"
            severity="danger"
            rounded
            @click="updateValue(false, true, price)"
            :disabled="isLoading"
          />
        </div>
      </div>

      <div class="flex-1">
        <div class="flex justify-center items-center my-2">
          {{ price.name }}
          <Button
            v-if="editable"
            size="small"
            icon="fa fa-edit"
            severity="info"
            outlined
            rounded
            @click="editPrice(price)"
            class="mr-2"
          />
        </div>
        <div class="shadow rounded-lg flex justify-between items-center bg-base p-2">
          <Button
            size="small"
            icon="fa-solid fa-plus"
            severity="success"
            rounded
            @click="updateValue(true, false, price)"
            :disabled="isLoading"
          />
          <div v-format-number="price.price" @dblclick="editPrice(price)"
               class="cursor-pointer text-center w-full font-bold" />
          <Button
            size="small"
            icon="fa-solid fa-minus"
            severity="danger"
            rounded
            @click="updateValue(false, false, price)"
            :disabled="isLoading"
          />
        </div>
      </div>
    </div>
  </template>
  <template v-else>
    <template v-if="loading">
      <div class="flex gap-4 space-y-2 mb-4" v-for="item in Array(4)" :key="item">
        <div class="flex-1">
          <Skeleton class="w-full rounded-lg h-20" height="4rem" />
        </div>
        <div class="flex-1">
          <Skeleton class="w-full rounded-lg h-20" height="4rem" />
        </div>
      </div>
    </template>
    <div class="absolute inset-0 flex items-center justify-center" v-else>
      <span class="text-gray-600 font-semibold text-lg">موردی یافت نشد</span>
    </div>
  </template>
  <Dialog
    v-model:visible="editPriceModalIsOpen"
    :header="editPriceHeader"
    modal
    :style="{ width: '30rem' }"
    dir="rtl"
    :breakpoints="{ '1199px': '45vw', '575px': '80vw' }"
  >
    <EditItemQuick :data="priceItem" @cancel="editPriceModalIsOpen = false"
                   @updated="updatedItem" />
  </Dialog>
</template>

<script setup>
import { inject, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import EditItemQuick from '@/components/EditItemQuick.vue'

const repository = inject('repository')
const toast = useToast()
const isLoading = ref(false)

const props = defineProps({
  visiblePrices: {
    type: Array,
    default: []
  },
  loading: {
    type: Boolean,
    default: false
  },
  editable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['getPrices'])

const editPriceModalIsOpen = ref(false)
const editPriceHeader = ref('')
const priceItem = ref({})

const updateValue = (increase, profit, price) => {
  let data = {
    id: price.id
  }
  let message = ''
  if (increase) {
    if (profit) {
      data.profit = price.profit + price.profitDiff
      message = 'افزایش سود ' + price.name + ' با موفقیت انجام شد.'
    } else {
      data.price = +price.price + price.priceDiff
      message = 'افزایش قیمت ' + price.name + ' با موفقیت انجام شد.'
    }
  } else {
    if (profit) {
      data.profit = price.profit - price.profitDiff
      message = 'کاهش سود ' + price.name + ' با موفقیت انجام شد.'
    } else {
      data.price = +price.price - price.priceDiff
      message = 'کاهش قیمت ' + price.name + ' با موفقیت انجام شد.'
    }
  }

  isLoading.value = true
  repository.updatePrice(data).then(() => {
    toast.add({
      severity: 'success',
      summary: 'موفقیت',
      life: 3000,
      detail: message
    })
    emit('getPrices')
  }).catch((error) => {
    toast.add({
      severity: 'warn',
      summary: 'خطا',
      life: 3000,
      detail: error.msg
    })
  }).finally(() => {
    isLoading.value = false
  })
}

const editPrice = (price) => {
  editPriceModalIsOpen.value = true
  editPriceHeader.value = 'ویرایش ' + price.name
  priceItem.value = price
}

const updatedItem = () => {
  editPriceModalIsOpen.value = false
  emit('getPrices')
}
</script>
