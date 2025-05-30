<template>
  <div class="w-full flex items-center justify-center">
    <div class="w-full md:w-[330px] rounded-lg bg-gray-50 p-4">
      <template v-if="allItems.length">
        <VueDraggableNext :list="allItems" item-key="sortId" class="space-y-2" @change="onDragEnd">
          <div
            v-for="element in allItems"
            :key="element.id"
            class="w-full bg-gray-100 p-2 rounded-lg cursor-move shadow-sm hover:shadow-md transition-shadow mb-2"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <i
                  class="fa-solid ml-2"
                  :class="element.type === 1 ? 'fa-cubes text-yellow-400' : 'fa-ring text-blue-500'"
                />
                <span class="font-medium">{{ element.name }}</span>
              </div>
              <div class="text-gray-500 text-sm bg-base px-2 py-1 rounded-lg">
                ترتیب: {{ element.sortId || 'تعیین نشده' }}
              </div>
            </div>
          </div>
        </VueDraggableNext>
      </template>
      <template v-else>
        <template v-if="loading">
          <div v-for="item in Array(6)" :key="item">
            <Skeleton class="w-full rounded-lg h-20 mb-2" height="55px"/>
          </div>
        </template>
        <div v-else
             class="w-full flex items-center justify-center text-gray-600 font-semibold text-lg">
          آیتمی یافت نشد
        </div>
      </template>
      <Button
        @click="submitOrders"
        label="ثبت تغییرات"
        size="small"
        icon="fa fa-save"
        icon-pos="right"
        class="w-full mt-2"
      />
    </div>
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue';
import { VueDraggableNext } from 'vue-draggable-next';
import { useUserStore } from '@/stores/userStore.js';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const userStore = useUserStore();
const repository = inject('repository');
const allItems = ref([]);
const loading = ref(true);

const onDragEnd = () => {
  allItems.value.forEach((item, index) => {
    item.order = index + 1;
  });
};

const getItemsList = async () => {
  try {
    loading.value = true;
    const response = await repository.getPriceList({
      id: userStore.id,
      all: true,
    });
    if (response) {
      allItems.value = response.data.prices;
    }
  } catch (error) {
    console.log(error, 'error');
  } finally {
    loading.value = false;
  }
};

const submitOrders = async () => {
  const result = allItems.value.map((item, index) => ({
    id: item.id,
    sortId: index + 1,
  }));

  try {
    await repository.updateItemSorting({
      id: userStore.id,
      data: JSON.stringify(result),
    });
    toast.add({ severity: 'success', summary: 'با موفقیت ذخیره شد', life: 3000 });
    await getItemsList();
  } catch (error) {
    console.error('خطا در ذخیره ترتیب جدید:', error);
    toast.add({ severity: 'error', summary: 'خطا در ذخیره', detail: error.message, life: 4000 });
  }
};

onMounted(() => {
  getItemsList();
});
</script>

<style>
.sortable-ghost {
  opacity: 0.5;
  background: #c8ebfb;
  border: 2px dashed #4299e1;
}

.sortable-chosen {
  cursor: grabbing;
}
</style>
