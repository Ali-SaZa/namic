<template>
  <UserSearchControls
    v-model="searchQuery"
    :userCount="filteredUsers.length"
    onlySearch
  />

  <div
    v-if="filteredUsers.length"
    class="grid md:grid-cols-4 sm:grid-cols-1 xl:grid-cols-4 mt-2 gap-2">
    <div class="bg-gray-100 rounded-lg p-2" v-for="user in filteredUsers" :key="user.id">
      <div class="w-full lex items-center justify-between">
        <div>
          <i class="fa fa-user"/>
          {{ user.name }}
        </div>
        <div>
          <i class="fa fa-mobile"/>
          {{ user.mobile }}
        </div>
      </div>
      <div class="grid grid-cols-2 gap-6 px-4 my-4">
        <div class="col-span-1" @click="previewImage(`${apiUrl}auth/${user.file1}`,'روی کارت ملی')">
          <img
            :src="`${apiUrl}auth/${user.file1}`"
            class="w-full h-40 object-contain">
          <span>
            روی کارت ملی
          </span>
        </div>
        <div class="col-span-1" @click="previewImage(`${apiUrl}auth/${user.file2}`,'پشت کارت ملی')">
          <img
            :src="`${apiUrl}auth/${user.file2}`"
            class="w-full h-40 object-contain">
          <span>
            پشت کارت ملی
          </span>
        </div>
        <div class="col-span-1" @click="previewImage(`${apiUrl}auth/${user.file3}`,'تصویر شناسنامه')">
          <img
            :src="`${apiUrl}auth/${user.file3}`"
            class="w-full h-40 object-contain">
          <span>
            تصویر شناسنامه
          </span>
        </div>
        <div class="col-span-1" @click="previewImage(`${apiUrl}auth/${user.file4}`,'تصویر جواز کسب')">
          <img
            :src="`${apiUrl}auth/${user.file4}`"
            class="w-full h-40 object-contain">
          <span>
           تصویر جواز کسب
          </span>
        </div>
      </div>
      <div class="flex items-center justify-center gap-x-6">
        <Button label="تایید مدارک" size="small" icon="fa fa-check-circle" icon-pos="right"
                severity="success" @click="()=>{confirm=true;confirmDialogIsOpen=true;userId=user.userId}"/>
        <Button label="عدم پذیرش" size="small" icon="fa fa-times-circle" icon-pos="right" severity="danger"
                @click="()=>{confirm=false;confirmDialogIsOpen=true;userId=user.userId}"/>
      </div>
    </div>

  </div>
  <template v-else>
    <template v-if="loading">
      <div class="grid md:grid-cols-4 sm:grid-cols-1 xl:grid-cols-4 mt-2 gap-2">
        <div v-for="item in Array(20)" :key="item">
          <Skeleton class="w-full rounded-lg h-20" height="4rem"/>
        </div>
      </div>
    </template>
    <div v-else
         class="w-full flex items-center justify-center text-gray-600 font-semibold text-lg">
      درخواستی یافت نشد
    </div>
  </template>

  <Dialog
    v-model:visible="previewImageDialogIsOpen"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    :header="dialogHeader"
    :style="{ width: '30rem' }"
    dir="rtl"
    modal
  >
    <img
      alt=""
      :src="previewImageSrc"
      class="w-full h-60 object-contain">
    <div class="flex items-center justify-end mt-4">
      <Button size="small" label="بستن"
              icon="fa fa-cancel"
              icon-pos="right"
              @click="previewImageDialogIsOpen = false"
              severity="warn"/>
    </div>
  </Dialog>
  <Dialog
    v-model:visible="confirmDialogIsOpen"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    :header="confirm?'تایید مدارک کاربر':'عدم پذیرش مدارک کاربر'"
    :style="{ width: '30rem' }"
    dir="rtl"
    modal
  >
    <p v-if="confirm">
      آیا از تایید مدارک احراز هویت کاربر اطمینان دارید؟
    </p>
    <p v-else>
      آیا از عدم پذیرش مدارک احراز هویت کاربر اطمینان دارید؟
    </p>
    <div class="flex items-center justify-end gap-2 mt-4">
      <Button size="small" label="بستن"
              icon="fa fa-cancel"
              icon-pos="right"
              @click="confirmDialogIsOpen = false"
              severity="warn"/>
      <Button size="small" label="تایید"
              v-if="confirm"
              icon="fa fa-check-circle"
              icon-pos="right"
              @click="updateAuthenticationStatus(1)"/>
      <Button size="small" label="عدم پذیرش"
              v-else
              icon="fa fa-times-circle"
              icon-pos="right"
              @click="updateAuthenticationStatus(2)"
              severity="danger"/>
    </div>
  </Dialog>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import UserSearchControls from '@/components/UserSearchControls.vue';
import { useUserStore } from '@/stores/userStore.js';

const userStore = useUserStore();
const apiUrl = import.meta.env.VITE_PICS_URL;

const toast = useToast();

const user = computed(() => userStore.user);
const searchQuery = ref('');
const allUsersData = ref([]);
const previewImageDialogIsOpen = ref(false);
const confirmDialogIsOpen = ref(false);
const confirm = ref(false);
const userId = ref(null);
const dialogHeader = ref('');
const previewImageSrc = ref('');
const repository = inject('repository');
const loading = ref(false);

const filteredUsers = computed(() => {
  if (!searchQuery.value) {
    return allUsersData.value;
  }

  const searchTerm = searchQuery.value.toLowerCase();
  return allUsersData.value.filter(
    (user) => user.name.toLowerCase().includes(searchTerm));
});

const fetchUsers = () => {
  loading.value = true;
  repository.getPendingUsers().then((response) => {
    if (response.data.state) {
      allUsersData.value = response.data.list;
    } else {
      allUsersData.value = [];
      toast.add({
        severity: 'error',
        summary: 'خطا',
        life: 3000,
        detail: response.data.msg,
      });
    }
  }).finally(() => {
    loading.value = false;
  });
};

onMounted(() => {
  fetchUsers();
});

const previewImage = (url, header) => {
  previewImageDialogIsOpen.value = true;
  dialogHeader.value = header;
  previewImageSrc.value = url;
};

const updateAuthenticationStatus = (newStatus) => {
  confirmDialogIsOpen.value = false;
  repository.updateAuthenticationStatus({ userId: userId.value, status: newStatus, uName: user.value.userName }).
    then((response) => {
      if (response.data.state) {
        toast.add({
          severity: 'success',
          summary: 'موفق',
          life: 3000,
          detail: response.data.msg,
        });
        fetchUsers();
      } else {
        toast.add({
          severity: 'error',
          summary: 'خطا',
          life: 3000,
          detail: response.data.msg,
        });
      }
    });
};
</script>

<style>
.p-menu-list {
  direction: rtl;
}
</style>
