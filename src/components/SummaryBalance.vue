<script setup>
import { ref } from 'vue';

const props = defineProps({
  balance: {
    type: Object,
    required: true,
    default: {
      weight: 0,
      count: [],
    },
  },
});

const balanceModalIsOpen = ref(false);
const balanceModalType = ref(1);
</script>

<template>
  <div class="p-4 flex items-center justify-between">
    <div>
      <i
        class="fa-solid fa-cubes text-yellow-400 text-2xl"
        @click="
              () => {
                balanceModalIsOpen = true
                balanceModalType = 1
              }
            "
      />
    </div>
    <div :class="balance.weight >= 0 ? 'text-green-500' : 'text-red'" dir="ltr">{{ balance.weight }}</div>
  </div>
  <div class="p-4 flex items-center justify-between">
    <div>
      <i
        class="fa-solid fa-ring text-blue-500 text-2xl"
        @click="
              () => {
                balanceModalIsOpen = true
                balanceModalType = 2
              }
            "
      />
    </div>
    <div>
      <div class="flex flex-row gap-y-1" v-for="(balanceItem,index) in balance.count" :key="index">
        <div :class="balanceItem.count > 0 ? 'text-green-500' : 'text-red'" dir="ltr" v-if="balanceItem.count!=0">
          {{ balanceItem.count > 0 ? balanceItem.count + '+' : balanceItem.count }}
        </div>
      </div>
    </div>
  </div>
  <Dialog
    v-model:visible="balanceModalIsOpen"
    modal
    :style="{ width: '30rem' }"
    dir="rtl"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <template #header>
      <div class="inline-flex items-center justify-center gap-2">
        <template v-if="balanceModalType === 1">
          <i class="fa-solid fa-cubes text-yellow-400 text-2xl"/>
          <span class="text-yellow-400 text-xl"> طلا </span>
        </template>
        <template v-else>
          <i class="fa-solid fa-ring text-blue-500 text-2xl"/>
          <span class="text-blue-500 text-xl"> سکه </span>
        </template>
      </div>
    </template>
    <div class="flex items-center justify-between mb-2">
      <div class="font-bold text-sm">جمع سكه و طلا</div>
      <div>
        {{ balance.weight + balance.count.length }}
      </div>
    </div>
    <div class="flex items-center justify-between mb-1">
      <div class="font-bold text-sm">جمع طلا</div>
      <div>
        {{ balance.weight }}
      </div>
    </div>
    <div class="flex items-center justify-between">
      <div class="font-bold text-sm">جمع سكه</div>
      <div>
        {{ balance.count.length }}
      </div>
    </div>
    <div class="mt-2 w-full flex justify-end">
      <Button
        size="small"
        label="بستن"
        icon="fa fa-cancel"
        icon-pos="right"
        @click="balanceModalIsOpen = false"
        severity="warn"
      />
    </div>
  </Dialog>
</template>

<style scoped>

</style>
