<template>
  <div class="w-full">
    <div class="flex flex-col gap-2">
      <!-- (start) -->
      <div class="flex-1">
        <span class="text-xs block mb-1">از تاریخ</span>
        <vue-date-picker
          v-model="startDate"
          :format="format"
          :display-format="displayFormat"
          color="#0ea5e9"
          class="w-full"
        />
      </div>

      <!-- (end) -->
      <div class="flex-1">
        <span class="text-xs block mb-1">تا تاریخ</span>
        <vue-date-picker
          v-model="endDate"
          :format="format"
          :display-format="displayFormat"
          color="#0ea5e9"
          class="w-full"
        />
      </div>

      <!-- action -->
      <Button
        variant="outlined"
        @click="submitDateRange"
        size="small"
        class="w-full"
        label="جستجو"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const emit = defineEmits(['submitDateRange'])

const props = defineProps({
  displayFormat: { type: String, default: 'jYYYY/jMM/jDD' },
  format: { type: String, default: 'YYYY-MM-DD' },
  initialDate: { type: Array, default: () => [] }
})

const range = ref([...props.initialDate])

const startDate = computed({
  get: () => range.value[0] ?? null,
  set: (value) => range.value[0] = value
})
const endDate = computed({
  get: () => range.value[1] ?? null,
  set: (value) => range.value[1] = value
})

watch(() => props.initialDate, (val) => { range.value = [...val] }, { deep: true })

watch([startDate, endDate], () => {
  if (startDate.value && endDate.value && startDate.value > endDate.value) {
    [range.value[0], range.value[1]] = [endDate.value, startDate.value]
  }
})

const submitDateRange = () => emit('submitDateRange', range.value)
</script>

