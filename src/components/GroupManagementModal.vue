<template>
  <Dialog
    v-model:visible="localVisible"
    modal
    :style="{ width: '30rem' }"
    dir="rtl"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <template #header>
      <div class="inline-flex items-center justify-center gap-2">
        <i class="fa-solid fa-users-line"></i>
        <span class="font-bold whitespace-nowrap">مدیریت گروه حساب</span>
      </div>
    </template>
    <div class="bg-gray-100 p-4 rounded-lg">
      <label class="block text-sm font-medium mb-1 text-right">افزودن گروه حساب</label>
      <div class="flex items-center flex-col md:flex-row md:justify-between md:gap-2">
        <div class="w-full md:w-3/4">
          <IconField>
            <InputIcon class="pi pi-users"/>
            <InputText type="text" class="w-full" v-model="accountGroup"/>
          </IconField>
        </div>
        <div class="w-full md:max-w-max mt-2 md:mt-0">
          <Button
            @click="addGroup"
            class="w-full"
            size="small"
            label="ثبت و ذخیره"
            icon="fa fa-save"
          />
        </div>
      </div>
    </div>

    <div class="bg-gray-100 p-4 rounded-lg mt-4">
      <label class="block text-sm font-medium mb-1 text-right">ویرایش گروه حساب</label>
      <div class="grid grid-cols-2 md:grid-cols-3 mb-2 gap-1">
        <Button
          v-for="group in localAccountGroups"
          :key="group.id"
          class="w-full"
          @click="selectGroup(group)"
          :variant="selectedGroupId === group.id ? 'filled' : 'outlined'"
        >
          {{ group.name }}
        </Button>
      </div>
      <div class="flex items-center flex-col md:flex-row md:justify-between md:gap-2">
        <div class="w-full md:w-3/4">
          <IconField>
            <InputIcon class="pi pi-users"/>
            <InputText
              type="text"
              class="w-full"
              v-model="groupValue"
              placeholder="نام گروه حساب جدید"
            />
          </IconField>
        </div>
        <div class="w-full md:max-w-max mt-2 md:mt-0">
          <Button
            @click="editGroup"
            class="w-full"
            size="small"
            icon="fa fa-edit"
            label="ویرایش و ذخیره"
            type="button"
          />
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { computed, inject, onMounted, ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useUserStore } from '@/stores/userStore.js';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  parentAccountGroups: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:isOpen', 'refresh']);

const userStore = useUserStore();
const toast = useToast();
const groupValue = ref('');
const selectedGroupId = ref(null);
const accountGroup = ref('');
const localAccountGroups = ref([]);
const repository = inject('repository');

const localVisible = computed({
  get: () => props.isOpen,
  set: (val) => emit('update:isOpen', val),
});

const getAccountGroups = async () => {
  try {
    const response = await repository.getUserGroupList();

    if (response) {
      localAccountGroups.value = response.data.userGroup;
    }
  } catch (error) {
    console.log(error, 'Error on getAccountGroups');
  }
};

const addGroup = async () => {
  const trimmed = accountGroup.value.trim();
  if (!trimmed) return;
  const isDuplicate = localAccountGroups.value.some(
    (g) => g.name.trim().toLowerCase() === trimmed.toLowerCase(),
  );
  if (isDuplicate) {
    toast.add({
      severity: 'warn',
      summary: 'اضافه کردن گروه حساب',
      life: 3000,
      detail: 'گروه حساب تکراری است',
    });
    return;
  }
  try {
    const response = await repository.addUserGroup({
      name: trimmed,
      uName: userStore.user.userName,
    });
    if (response) {
      if (props.parentAccountGroups.length > 0) {
        emit('refresh');
      } else {
        await getAccountGroups();
      }
      toast.add({
        severity: 'success',
        summary: 'افزودن گروه',
        life: 3000,
        detail: 'گروه جدبد باموفقیت اضافه شد',
      });
      emit('refresh');
    }
  } catch (error) {
    console.log(error, 'Error on add Group');
  } finally {
    accountGroup.value = '';
  }
};

const selectGroup = (group) => {
  selectedGroupId.value = group.id;
  groupValue.value = group.name;
};

const editGroup = async () => {
  try {
    const response = await repository.editUserGroupItem({
      name: groupValue.value,
      groupId: selectedGroupId.value,
      uName: userStore.user.userName,
    });

    if (response) {
      if (props.parentAccountGroups.length > 0) {
        emit('refresh');
      } else {
        await getAccountGroups();
      }
      toast.add({
        severity: 'success',
        summary: 'ویرایش نام گروه',
        life: 3000,
        detail: 'نام گروه باموفقیت ویرایش شد',
      });
      emit('refresh');
    }
  } catch (error) {
    console.log(error, 'Error on Edit Group');
  }
};

onMounted(() => {
  console.log('sss',props.parentAccountGroups.length)
  if (props.parentAccountGroups.length > 0) {
    localAccountGroups.value = [...props.parentAccountGroups];
  } else {
    getAccountGroups();
  }
}),
  watch(
    () => props.accountGroups,
    (newVal) => {
      localAccountGroups.value = [...newVal];
    },
    { deep: true },
  );
</script>
