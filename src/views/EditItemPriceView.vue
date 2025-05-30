<template>
  <div class="grid grid-cols-1 gap-y-4 lg:gap-y-0 lg:gap-x-8 lg:grid-cols-4">
    <div class="col-span-1">
      <div class="rounded-lg shadow bg-gray-50 p-4">
        <ButtonGroup class="w-full mt-2">
          <Button
            v-for="itemType in itemTypes"
            :key="itemType.id"
            :severity="filteredItemTypeCode === itemType.code ? 'info' : 'secondary'"
            class="min-w-1/3 flex flex-col"
            size="small"
            @click="filteredItemTypeCode = itemType.code"
          >
            <div>
              {{ itemType.name }}
            </div>
          </Button>
        </ButtonGroup>
        <div class="mt-2">
          <label>ویرایش وضعیت همه:</label>
          <div class="grid grid-cols-2 gap-2">
            <Button
              @click="activeAll"
              label="فعال"
              icon="pi pi-check-circle"
              iconPos="right"
              size="small"
            />
            <Button
              @click="inActiveAll"
              label="غیرفعال"
              icon="pi pi-times-circle"
              iconPos="right"
              size="small"
              severity="danger"
            />
          </div>
        </div>
      </div>
    </div>
    <div
      class="col-span-1 lg:col-span-3 shadow w-full min-h-20 flex flex-col rounded-lg bg-gray-50 mt-2 p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <template v-if="filteredItems.length">
          <div
            v-for="(item, index) in filteredItems"
            :key="index"
            class="bg-gray-100 p-2 rounded-lg cursor-pointer">
            <div class="flex items-center justify-between">
              <div>
                <TypeIcon :type="item.type"/>
                <div class="inline-block mr-1">
                  {{ item.name }}
                  <span class="text-gray-700 text-xs">
                  ({{
                      itemTypes.find((itemType) => {
                        return itemType.code === item.type;
                      })?.name
                    }})
                </span>
                  <span class="text-gray-700 text-xs"> ({{ item.id }}) </span>
                </div>
              </div>
              <ToggleSwitch
                v-model="item.isActive"
                @update:modelValue="onActiveToggle(item, $event)"
              />
            </div>
            <Divider/>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-2">
                  <label>خرید</label>
                  <ToggleSwitch
                    v-model="item.allowBuy"
                    @update:modelValue="onBuyToggle(item, $event)"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <label>فروش</label>
                  <ToggleSwitch
                    v-model="item.allowSell"
                    @update:modelValue="onSellToggle(item, $event)"
                  />
                </div>
              </div>
              <div>
                <Button
                  icon="fa-solid fa-edit"
                  severity="info"
                  rounded
                  size="small"
                  variant="outlined"
                  @click="openEditModal(item)"
                />
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <template v-if="isLoading">
            <div v-for="item in Array(4)" :key="item">
              <Skeleton class="w-full rounded-lg h-20 mb-2" height="5rem"/>
            </div>
          </template>
          <div v-else
               class="col-span-2 w-full flex items-center justify-center text-gray-600 font-semibold text-lg">
            آیتمی یافت نشد
          </div>
        </template>
      </div>
    </div>
    <Dialog
      v-model:visible="editDialogIsOpen"
      modal
      :header="editDialogHeader"
      :style="{ width: '80rem', height:'75vh' }"
      dir="rtl"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <EditItem :data="itemData" @updated="editDialogIsOpen = false"/>
    </Dialog>
  </div>
</template>

<script setup>
import { itemTypes } from '@/utils/mockData.js';
import { computed, inject, onMounted, ref } from 'vue';
import Button from 'primevue/button';
import ToggleSwitch from 'primevue/toggleswitch';
import EditItem from '@/components/EditItem.vue';
import { useUserStore } from '@/stores/userStore.js';
import { useToast } from 'primevue/usetoast';
import TypeIcon from '@/components/TypeIcon.vue';

const toast = useToast();
const userStore = useUserStore();
const repository = inject('repository');
const filteredItemTypeCode = ref(1);
const editDialogIsOpen = ref(false);
const editDialogHeader = ref('');
const isLoading = ref(true);
const itemData = ref(null);

const fetchedItems = ref([]);

const openEditModal = (item) => {
  itemData.value = item;
  editDialogHeader.value = 'ویرایش ' +item.name;
  editDialogIsOpen.value = true;
};

onMounted(() => {
  getItemsList();
});

const getItemsList = async () => {
  isLoading.value = true;
  try {
    const response = await repository.getPriceList({
      id: userStore.id,
      all: true,
    });
    if (response) {
      fetchedItems.value = response.data.prices.map((item) => ({
        ...item,
        isActive: item.isActive === 1,
        allowBuy: item.allowBuy === 1,
        allowSell: item.allowSell === 1,
      }));
    }
  } catch (error) {
    console.log(error, 'error');
  } finally {
    isLoading.value = false;
  }
};

const filteredItems = computed(() => {
  if (!fetchedItems.value.length) return [];
  return fetchedItems.value.filter((item) => item.type === filteredItemTypeCode.value);
});

const onActiveToggle = async (item, event) => {
  const data = {
    id: item.id,
    isActive: event === false ? 0 : 1,
  };
  try {
    const response = await repository.updateItemStatus(data);
    if (response && event) {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: `${item.name} با موفقیت فعال شد`,
      });
    } else {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: `${item.name} با موفقیت غیرفعال شد`,
      });
    }
  } catch (error) {
    console.log(error, 'error');
  }
};

const onBuyToggle = async (item, event) => {
  const data = {
    id: item.id,
    allowBuy: event === false ? 0 : 1,
  };
  try {
    const response = await repository.updateItemBuySell(data);
    if (response && event) {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: `خرید ${item.name} با موفقیت فعال شد`,
      });
    } else {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: `خرید ${item.name} با موفقیت غیرفعال شد`,
      });
    }
  } catch (error) {
    console.log(error, 'error');
  }
};

const onSellToggle = async (item, event) => {
  const data = {
    id: item.id,
    allowSell: event === false ? 0 : 1,
  };
  try {
    const response = await repository.updateItemBuySell(data);
    if (response && event) {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: `فروش ${item.name} با موفقیت فعال شد`,
      });
    } else {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: `فروش ${item.name} با موفقیت غیرفعال شد`,
      });
    }
  } catch (error) {
    console.log(error, 'error');
  }
};

const activeAll = async () => {
  const data = {
    ids: fetchedItems.value.map((item) => item.id),
    isActive: 1,
  };
  try {
    const response = await repository.updateItemStatus(data);
    if (response) {
      fetchedItems.value = fetchedItems.value.map((item) => ({
        ...item,
        isActive: true,
      }));
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: 'همه آیتم ها با موفقیت فعال شدند',
      });
    }
  } catch (error) {
    console.log(error, 'error');
  }
};

const inActiveAll = async () => {
  const data = {
    ids: fetchedItems.value.map((item) => item.id),
    isActive: 0,
  };
  try {
    const response = await repository.updateItemStatus(data);
    if (response) {
      fetchedItems.value = fetchedItems.value.map((item) => ({
        ...item,
        isActive: false,
      }));
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: 'همه آیتم ها با موفقیت غیرفعال شدند',
      });
    }
  } catch (error) {
    console.log(error, 'error');
  }
};
</script>

<style></style>
