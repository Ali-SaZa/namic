<template>
  <UserSearchControls
    v-model="searchQuery"
    :userCount="filteredUsers.length"
    @refresh="fetchUsers"
  />

  <div
    v-if="filteredUsers.length"
    class="grid md:grid-cols-2 sm:grid-cols-1 xl:grid-cols-4 mt-2 gap-2">
    <UserInfoCard
      v-for="user in filteredUsers"
      :id="user.id"
      :key="user.id"
      :avatarUrl="user.pic"
      :firstName="user.name"
      :isActive="user.isActive"
      :phoneNumber="user.mobile"
      :role="user.type"
      :userName="user.userName"
      :accountGroup="accountGroup"
      @deleteUser="askForDeleteUser"
      @getAccountGroups="getAccountGroups"
    />
  </div>
  <template v-else>
    <template v-if="loading">
      <div class="grid md:grid-cols-2 sm:grid-cols-1 xl:grid-cols-4 mt-2 gap-2">
        <div v-for="item in Array(20)" :key="item">
          <Skeleton class="w-full rounded-lg h-20" height="4rem"/>
        </div>
      </div>
    </template>
    <div v-else
         class="w-full flex items-center justify-center text-gray-600 font-semibold text-lg">
      کاربری یافت نشد
    </div>
  </template>

  <Dialog
    v-model:visible="deleteDialogIsOpen"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    :header="deleteDialogHeader"
    :style="{ width: '30rem' }"
    dir="rtl"
    modal
  >
    <div>ایا از حذف این کاربر اطمینان دارید؟</div>
    <div class="flex items-center justify-end mt-8 gap-2">
      <Button
        class="w-full md:max-w-max"
        label="انصراف"
        severity="secondary"
        size="small"
        type="submit"
        @click="closeModal"
      />
      <Button
        class="w-full md:max-w-max"
        label="حذف کاربر"
        severity="danger"
        size="small"
        type="submit"
        @click="deleteUser"
      />
    </div>
  </Dialog>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue';
import UserInfoCard from '@/components/UserInfoCard.vue';
import { useToast } from 'primevue/usetoast';
import UserSearchControls from '@/components/UserSearchControls.vue';

const toast = useToast();

const searchQuery = ref('');
const allUsersData = ref([]);
const deleteDialogIsOpen = ref(false);
const deleteDialogHeader = ref('');
const deleteUserId = ref(null);
const deleteUserFirstname = ref('');
const repository = inject('repository');
const loading = ref(false);
const accountGroup = ref([]);

onMounted(() => {
  fetchUsers();
  getAccountGroups();
});

const askForDeleteUser = (user) => {
  deleteUserId.value = user.id;
  deleteUserFirstname.value = user.name;

  deleteDialogHeader.value = `حذف ${user.name}`;
  deleteDialogIsOpen.value = true;
};

const closeModal = () => {
  deleteDialogIsOpen.value = false;
};

const deleteUser = async () => {
  try {
    const response = repository.deleteUser({
      id: deleteUserId.value,
    });

    if (response) {
      await fetchUsers();
      closeModal();
      toast.add({
        severity: 'success',
        summary: 'حذف کاربر',
        life: 3000,
        detail: `کاربر ${deleteUserFirstname.value} با موفقیت حذف شد`,
      });
    }
  } catch (error) {
    console.log(error, 'error on delete user');
  }
};

const filteredUsers = computed(() => {
  if (!searchQuery.value) {
    return allUsersData.value;
  }

  const searchTerm = searchQuery.value.toLowerCase();
  return allUsersData.value.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm) ||
      user.userName.toLowerCase().includes(searchTerm),
  );
});

const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await repository.getUserList();
    if (response) {
      allUsersData.value = response.data.users;
    }
  } catch (error) {
    console.log(error, 'Error on fetch user');
  } finally {
    loading.value = false;
  }
};

const getAccountGroups = async () => {
  try {
    const response = await repository.getUserGroupList();
    if (response.data.state) {
      accountGroup.value = response.data.userGroup;
    }else{
      toast.add({
        severity: 'error',
        summary: 'خطا',
        life: 3000,
        detail: response.data.msg,
      })
    }
  } catch (error) {
    console.log(error, 'Error on getAccountGroups');
  }
};

</script>

<style>
.p-menu-list {
  direction: rtl;
}
</style>
