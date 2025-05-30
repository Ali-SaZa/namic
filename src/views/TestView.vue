<template>
  <div>
    <Button icon="fa-solid fa-file-invoice" />
    <h1>BalanceReportView</h1>
    <vue-date-picker v-model="date"></vue-date-picker>
    <h2>Formatted Date: {{ formattedDate }}</h2>
    <div class="card flex justify-center">
      <div class="flex flex-wrap gap-2">
        <Button label="Success" severity="success" @click="showSuccess" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'

// Access the dateTime plugin
const dateTime = inject('dateTime')

// Your date value
const date = ref(new Date())

// Computed property for formatted date
const formattedDate = computed(() => {
  return dateTime.getDate(date.value, 'jMM/jDD - HH:MM')
})

// If you want to log when component mounts
onMounted(() => {
  console.log('Initial date:', formattedDate.value)
})

const toast = useToast()

const showSuccess = () => {
  toast.add({
    severity: 'success',
    summary: 'موفقیت',
    life: 3000,
    detail: 'عملیات با موفقیت انجام شد'
  })
}
</script>
