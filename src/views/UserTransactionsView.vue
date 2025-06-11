<template>
  <div>
    <template v-if="step === 1">
      <UserSearchControls
        v-model="searchQuery"
        :userCount="filteredTransactions.length"
        onlySearch
      />
      <div class="md:mt-4">
        <div class="grid md:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4 gap-2"
             v-if="filteredTransactions.length">
          <div
            @click="selectUser(user)"
            class="bg-gray-100 p-2 rounded-lg cursor-pointer flex items-center"
            v-for="(user, index) in filteredTransactions"
            :key="index"
          >
            <div class="min-w-12">
              <img
                :src="user.avatarUrl && user.avatarUrl.length ? user.avatarUrl : defaultAvatar"
                class="size-12"
                alt="user avatar"
              />
            </div>
            <div class="mr-1">
              <div>
                {{ user.userName }}
              </div>
              <div class="text-gray-700 text-sm">
                تعداد کل:
                {{ user.count }}
              </div>
            </div>
          </div>
        </div>
        <template v-else>
          <template v-if="loading">
            <div class="grid md:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4 gap-2">
              <div v-for="item in Array(20)" :key="item">
                <Skeleton class="w-full rounded-lg h-20" height="4rem" />
              </div>
            </div>
          </template>
          <div v-else
               class="w-full flex items-center justify-center text-gray-600 font-semibold text-lg">
            حواله ای یافت نشد
          </div>
        </template>
      </div>
    </template>
    <template v-if="step === 2">
      <div class="flex justify-between">
        <Button
          :label="selectedTransaction.userName"
          icon="pi pi-user"
          iconPos="right"
        />
        <Button
          @click="step = 1"
          icon="pi pi-arrow-left"
          severity="secondary"
          aria-label="Bookmark"
        />
      </div>
      <template v-if="step === 2">
        <div class="grid grid-cols-1 gap-y-4 lg:gap-y-0 lg:gap-x-8 lg:grid-cols-4 mt-2">
          <div class="col-span-1 rounded-lg shadow bg-gray-50 p-4 max-h-52">
            <DateRange @submit-date-range="filterDateRange"
                       :initial-date="[filters.dateFrom, '']" />
          </div>
          <div
            class="col-span-1 lg:col-span-3 rounded-lg shadow bg-gray-50 p-4 grid grid-cols-1 lg:grid-cols-2 gap-2">
            <TransactionItem v-for="transaction in selectedTransaction.transactions"
                             :key="transaction.id"
                             :user-name="selectedTransaction.userName"
                             :createdAt="transaction.createdAt"
                             :deliveryTime="transaction.deliveryTime"
                             :priceName="transaction.priceName"
                             :receiver="transaction.receiver"
                             :count="transaction.count"
                             :weight="transaction.weight"
                             :priceType="transaction.priceType"
                             :isDelivered="transaction.isDelivered ===1"
                             :isSeen="transaction.isSeen ===1" />
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref, watch } from 'vue'
import Button from 'primevue/button'
import UserSearchControls from '@/components/UserSearchControls.vue'
import defaultAvatar from '@/assets/images/avatar.png'
import { useUserStore } from '@/stores/userStore.js'
import { useToast } from 'primevue/usetoast'
import DateRange from '@/components/DateRange.vue'
import TransactionItem from '@/components/TransactionItem.vue'

const user = computed(() => userStore.user)

const userStore = useUserStore()
const repository = inject('repository')
const toast = useToast()

onMounted(() => {
  if (user.value) {
    getTransactionsGroupList()
  }
})

const loading = ref(true)
const searchQuery = ref('')
const selectedTransaction = ref(null)
const step = ref(1) // 1:searchUsers    //2:userSelected
const transactions = ref([])
const filters = ref({
  dateFrom: null,
  dateTo: null
})

const filteredTransactions = computed(() => {
  if (!searchQuery.value) {
    return transactions.value
  }

  const searchTerm = searchQuery.value.toLowerCase()
  return transactions.value.filter(user => user.userName.toLowerCase().includes(searchTerm))
})

const getTransactionsGroupList = () => {
  loading.value = true
  repository.getTransactionsGroupList({ uName: user.value.userName }).then((response) => {
    transactions.value = response.data.havale
  }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'خطا',
      life: 3000,
      detail: error.msg
    })
  }).finally(() => {
    loading.value = false
  })
}

const selectUser = (attachment) => {
  selectedTransaction.value = attachment
  filters.value.userId = attachment.userId
  filters.value.uName = user.value.userName
  filters.value.dateFrom = getDateSixMonthsAgo()
  getTransactionsList(filters.value, attachment)
}

const getTransactionsList = (filters) => {
  loading.value = true
  repository.getTransactionsList(filters).then((response) => {
    step.value = 2
    selectedTransaction.value.transactions = response.data.havale
  }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'خطا',
      life: 3000,
      detail: error.msg
    })
  }).finally(() => {
    loading.value = false
  })
}

const filterDateRange = (date) => {
  if (!date.length)
    return
  if (date[0]) {
    filters.value.dateFrom = date[0]
  }
  if (date[1]) {
    filters.value.dateTo = date[1]
  }
  getTransactionsList(filters.value)
}

watch(user, (newValue) => {
  if (newValue) {
    getTransactionsGroupList()
  }
}, { immediate: true })

const getDateSixMonthsAgo = () => {
  const currentDate = new Date()
  currentDate.setMonth(currentDate.getMonth() - 6)

  const year = currentDate.getFullYear()
  const month = String(currentDate.getMonth() + 1).padStart(2, '0') // ماه‌ها از 0 شروع می‌شوند
  const day = String(currentDate.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
</script>

<style scoped></style>
