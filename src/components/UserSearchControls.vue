<template>
  <div>
    <div class="grid grid-cols-6">
      <div class="col-span-6 md:col-span-2 order-2 md:order-1 my-2 md:my-0">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="localSearch"
            placeholder="جستجوی نام مشتری"
            type="text"
            class="w-full"
            @update:modelValue="handleSearchChange"
          />
        </IconField>
      </div>
      <div
        v-if="!onlySearch"
        class="col-span-6 md:col-span-4 text-left flex justify-between md:justify-end items-center gap-4  order-1 md:order-2">
        <Button if label="دریافت کاربران" icon="pi pi-sync" iconPos="right" @click="emit('refresh')" />
        <div><i class="fa-solid fa-users" /> {{ userCount }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Button from 'primevue/button'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  userCount: {
    type: Number,
    default: 0
  },
  onlySearch: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const localSearch = ref(props.modelValue)

const handleSearchChange = (value) => {
  localSearch.value = value
  emit('update:modelValue', value)
}

watch(() => props.modelValue, (newVal) => {
  localSearch.value = newVal
})
</script>
