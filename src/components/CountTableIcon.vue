<template>
  <div class="rounded-lg shadow bg-gray-50 mt-2">
    <div class="grid grid-cols-2 px-4 pt-2" v-for="balances in requestCount">
      <div class="col-span-1" :class="getState(balances.state).class">
        <component :is="getState(balances.state).icon" />
        {{ getState(balances.state).title }}
      </div>
      <div class="col-span-1 text-left" dir="ltr" :class="getState(balances.state).class">
        {{ balances.count }}
      </div>
    </div>
    <Divider />
    <div class="grid grid-cols-2 px-4 pb-4">
      <div class="col-span-1">
        <i class="fa fa-bookmark text-lg" />
        تعداد کل
      </div>
      <div class="col-span-1 text-left" dir="ltr">
        {{ sum }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BookmarkEmpty from '@/components/icons/BookmarkEmpty.vue'
import BookmarkTick from '@/components/icons/BookmarkTick.vue'
import BookmarkStar from '@/components/icons/BookmarkStar.vue'

const props = defineProps({
  requestCount: {
    type: Array,
    required: true,
  },
})

const getState = (state) => {
  {
    if (state === 3) {
      return {
        title: 'تایید شده',
        class: 'text-green-500',
        icon: BookmarkTick,
      }
    } else if (state === 2) {
      return {
        title: 'رد شده',
        class: 'text-red-500',
        icon: BookmarkStar,
      }
    } else if (state === 4) {
      return {
        title: 'دستی',
        class: 'text-blue-500',
        icon: BookmarkStar,
      }
    } else if (state === 0) {
      return {
        title: 'بدون پاسخ',
        class: 'text-yellow-500',
        icon: BookmarkEmpty,
      }
    } else {
      return {
        title: 'نامشخص',
        class: 'text-gray-300',
        icon: BookmarkEmpty,
      }
    }
  }
}

const sum = computed(() => {
  return props.requestCount.reduce((sum, item) => sum + item.count, 0)
})
</script>

<style scoped></style>
