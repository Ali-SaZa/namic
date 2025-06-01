<template>
  <div>
    <div class="grid grid-cols-3">
      <div class="col-span-1 text-center text-xl text-green-500">
        بخرید
      </div>
      <div class="col-span-1 text-center col-start-3 text-xl text-red-500">
        بفروشید
      </div>
    </div>
    <div class="grid grid-cols-3 mt-2" v-for="priceItem in prices" :key="price.id">
      <Button outlined @click="addOrder(priceItem,true,+priceItem.price + priceItem.profit)">
        <span v-format-number="+priceItem.price + priceItem.profit" />
      </Button>
      <div class="text-center">
        {{ priceItem.name }}
      </div>
      <Button outlined severity="danger" @click="addOrder(priceItem,false,+priceItem.price - priceItem.profit)">
        <span v-format-number="+priceItem.price - priceItem.profit" />
      </Button>
    </div>
    <AddOrderModal v-model:isOpen="orderModalIsOpen"
                   :price="price"
                   :type="type"
                   :isBuy="isBuy"
                   :rate="rate"
                   :itemName="itemName"
                   :min="min"
                   :max="max"
                   ref="addOrderModalRef"
                   @cancel="resetForm"
                   @submit="submitOrder" />
    <AddOrderConfirmModal v-model:isOpen="confirmOrderModalIsOpen"
                          :orderPrice="price"
                          :type="type"
                          :count="orderValue"
                          :itemName="itemName"
                          :description="order.description"
                          :sum="sum"
                          @confirm="confirmOrder"
                          @back="confirmOrderModalIsOpen = false;orderModalIsOpen=true" />
    <AddOrderLastStep v-model:isOpen="lastOrderStepModalIsOpen"
                      :isBuy="isBuy"
                      :itemName="itemName"
                      :orderPrice="price"
                      :count="orderValue"
                      :sum="sum"
                      @confirm="confirmOrder"
                      :sellerMsg="order.sellerMsg"
                      :updatedAt="order.updatedAt"
                      :state="order.state"
                      @back="confirmOrderModalIsOpen = false;orderModalIsOpen=true"
                      @repeat="updateIsConfirmed" />
    <Dialog v-model:visible="timeModalIsOpen"
            :closable="false"
            modal
            :style="{ width: '30rem' }"
            dir="rtl"
            :breakpoints="{ '1199px': '45vw', '575px': '80vw' }">
      <div class="w-20 h-20 rounded-full mx-auto bg-gray-200 flex items-center justify-center text-3xl">
        {{ countdown }}
      </div>
      <div class="text-center my-4">
        درخواست شما درحال بررسی می باشد
      </div>
      <div class="text-center">
        لطفا منتظر بمانید
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, inject, onUnmounted, ref } from 'vue'
import { useApiPollingStore } from '@/stores/apiPollingStore.js'
import { useToast } from 'primevue/usetoast'
import AddOrderModal from '@/components/AddOrderModal.vue'
import AddOrderConfirmModal from '@/components/AddOrderConfirmModal.vue'
import AddOrderLastStep from '@/components/AddOrderLastStep.vue'
import { useUserStore } from '@/stores/userStore.js'

const userStore = useUserStore()
const user = computed(() => userStore.user)
const repository = inject('repository')

const emit = defineEmits(['addOrder'])
const props = defineProps({
  prices: {
    type: Array,
    required: true
  },
  pendingLogs: {
    type: Array,
    required: true
  }
})
const addOrderModalRef = ref(null)
const orderModalIsOpen = ref(false)
const selectedItem = ref({})
const price = ref(0)
const type = ref(0)
const isBuy = ref(true)
const rate = ref(1)
const itemName = ref('')
const min = ref(1)
const max = ref(1)
const confirmOrderModalIsOpen = ref(false)
const order = ref({})
const timeModalIsOpen = ref(false)
let countdownInterval = null
const countdown = ref(0)
const lastOrderStepModalIsOpen = ref(false)

const toast = useToast()

const apiPollingStore = useApiPollingStore()

const adminState = computed(() => {
  const task = apiPollingStore.getTask('getAdminState')
  return task?.lastResponse
})

const addOrder = (priceItem, isBuyStatus, itemPrice) => {
  if (adminState.value) {
    if (props.pendingLogs.length) {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        life: 3000,
        detail: 'شما 1 درخواست در انتظار دارید، بعد از اعلام وضعیت آن درخواست می توانید درخواست جدید خود را ثبت کنید'
      })
      return
    }
    selectedItem.value = priceItem
    price.value = itemPrice
    type.value = priceItem.type
    rate.value = priceItem.rate
    itemName.value = priceItem.name
    min.value = priceItem.min
    max.value = priceItem.max
    orderModalIsOpen.value = true
    isBuy.value = isBuyStatus
  } else {
    toast.add({
      severity: 'error',
      summary: 'خطا',
      life: 3000,
      detail: 'مدیر سیستم آفلاین است، ثبت درخواست امکان پذیر نمی‌باشد'
    })
  }
}

const sum = computed(() => {
  if (order.value.type === 1) {
    return Math.ceil(order.value.amount)
  } else {
    return order.value.count * (price.value)
  }
})

const submitOrder = (orderItem) => {
  order.value = orderItem
  const data = {
    userId: user.value.id,
    priceId: selectedItem.value.id,
    priceType: selectedItem.value.type,
    fi: price.value,
    amount: sum.value
  }

  if (selectedItem.value.type === 1) {
    data.weight = order.value.weight
  } else {
    data.count = order.value.count
  }
  repository.getIsDuplicated(data).then((response) => {
    if (response.data.state) {

      confirmOrderModalIsOpen.value = true
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

const orderValue = computed(() => {
  if (order.value.type === 1) {
    return order.value.weight
  } else {
    return order.value.count
  }
})

const resetForm = () => {
  if (addOrderModalRef.value) {
    addOrderModalRef.value.resetOrderForm()
  }
  orderModalIsOpen.value = false
}

const confirmOrder = () => {
  const data = {
    userId: user.value.id,
    userName: user.value.name,
    priceId: selectedItem.value.id,
    priceName: selectedItem.value.name,
    priceType: selectedItem.value.type,
    state: -1,
    customerMsg: order.value.description,
    pd: isBuy.value ? 1 : -1,
    fi: price.value,
    amount: sum.value,
    isAmountMode: 0,
    profit: selectedItem.value.profit,
    masterProfit: selectedItem.value.masterProfit
  }

  if (selectedItem.value.type === 1) {
    data.count = 0
    data.weight = order.value.weight
  } else {
    data.count = order.value.count
    data.weight = 0
  }

  repository.addOrder(data).then((response) => {
    if (response.data.state) {
      toast.add({
        severity: 'success',
        summary: 'موفق',
        life: 3000,
        detail: 'درخواست شما با موفقیت ثبت شد'
      })
      order.value.id = response.data.id
      resetForm()
      timeModalIsOpen.value = true
      confirmOrderModalIsOpen.value = false
      startCountdown()
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

const startCountdown = () => {
  countdown.value = 60
  countdownInterval = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    }
    getOrderState()
  }, 1000)
}

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})

const getOrderState = () => {
  repository.getOrderState({ id: order.value.id }).then((response) => {
    if (response.data.state) {
      if (response.data.request.state !== -1) {
        timeModalIsOpen.value = false
        clearInterval(countdownInterval)
        lastOrderStepModalIsOpen.value = true
        order.value.sellerMsg = response.data.request.sellerMsg
        order.value.updatedAt = response.data.request.updatedAt
        order.value.state = response.data.request.state
      }
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

const updateIsConfirmed = () => {
  repository.updateIsConfirmed(
    { userType: userStore.userType, reqId: order.value.id, isConfirmed: 1, uName: user.value.name }).
    then((response) => {
      if (response.data.state) {
        lastOrderStepModalIsOpen.value = false
        confirmOrderModalIsOpen.value = true
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


</script>

<style scoped>

</style>
