<template>
  <Dialog
    v-model:visible="localVisible"
    modal
    :style="{ width: '30rem' }"
    dir="rtl"
    :breakpoints="{ '1199px': '45vw', '575px': '80vw' }"
  >
    <template #header>
      <div class="inline-flex items-center justify-center gap-2">
        <template v-if="!status">
          <i class="fa fa-triangle-exclamation text-2xl text-red-500" />
          <span class="font-bold whitespace-nowrap">
            ثبت سند با اشکال مواجه شد
          </span>
        </template>
        <template v-else>
          <i class="fa fa-circle-check text-2xl text-green-500" />
          <span class="font-bold whitespace-nowrap">
            ثبت سند مشتری
            <span class="font-bold">
              {{ userName }}
            </span>
              با موفقیت انجام شد
          </span>
        </template>
      </div>
    </template>
    <div class="rounded-lg shadow bg-gray-50 p-4 mt-2">
      <template v-if="!status">
        <p class="text-red-500 font-bold text-center">{{ message }}</p>
      </template>
      <template v-else>
        <p class="text-center">
          شماره سند:
          {{ orderId }}
        </p>
      </template>
    </div>
    <div class="flex gap-2 mt-2 items-center justify-end">
      <Button size="small" severity="help" label="خانه" @click="goToIndex" icon-pos="right"
              icon="fa fa-home" />
      <Button size="small" severity="contrast" :label="buttonLabel" @click="userNewOrder"
              icon-pos="right" icon="fa fa-rotate-right" class="whitespace-nowrap"/>
      <Button size="small" severity="info" label="ثبت سند جدید" @click="newOrder"
              icon-pos="right" icon="fa fa-rotate-right" class="whitespace-nowrap"/>
    </div>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue'
import router from '@/router/index.js'

const emit = defineEmits(['update:isOpen', 'newOrder'])
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  status: {
    type: Boolean,
    default: true
  },
  message: {
    type: String,
    default: ''
  },
  userName: {
    type: String,
    default: ''
  },
  orderId: {
    type: String,
    default: ''
  }
})


const buttonLabel = computed(()=>{
  return 'ثبت سند دیگر برای ' + props.userName
})

const localVisible = computed({
  get: () => props.isOpen,
  set: (val) => {
    emit('update:isOpen', val)
  }
})

const goToIndex = () => {
  localVisible.value = false
  router.push('/trade')
}

const newOrder = () => {
  localVisible.value = false
  emit('newOrder')
}

const userNewOrder = () => {
  localVisible.value = false
  emit('userNewOrder')
}
</script>
