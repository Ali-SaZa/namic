<template xmlns="http://www.w3.org/1999/html">
  <div>
    <template v-if="step === 1">
      <UserSearchControls
        v-model="searchQuery"
        :userCount="filteredFileAttachments.length"
        onlySearch
      />
      <div class="md:mt-4">
        <div class="grid md:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4 gap-2"
             v-if="filteredFileAttachments.length">
          <div
            @click="selectUser(user)"
            class="bg-gray-100 p-2 rounded-lg cursor-pointer flex items-center justify-between"
            v-for="(user, index) in filteredFileAttachments"
            :key="index"
          >
            <div class="flex items-center">
              <div class="min-w-12">
                <img
                  :src="user.avatarUrl && user.avatarUrl.length ? user.avatarUrl : defaultAvatar"
                  class="size-12"
                  alt="user avatar"
                />
              </div>
              <div class="mr-1">
                <div>
                  {{ user.userName }}
                </div>
                <div class="text-gray-700 text-sm">
                  تعداد کل: {{ user.count }}
                </div>
              </div>
            </div>
            <div>
              <Button size="small" :label="user.unSeenNum" severity="info" rounded
                      v-if="+user.unSeenNum> 0"
                      class="min-w-9"/>
            </div>
          </div>
        </div>
        <template v-else>
          <template v-if="loading">
            <div class="grid md:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4 gap-2">
              <div v-for="item in Array(20)" :key="item">
                <Skeleton class="w-full rounded-lg h-20" height="4rem"/>
              </div>
            </div>
          </template>
          <div v-else
               class="w-full flex items-center justify-center text-gray-600 font-semibold text-lg">
            فایلی یافت نشد
          </div>
        </template>
      </div>
    </template>
    <template v-if="step === 2">
      <div class="flex justify-between">
        <Button
          :label="selectedAttachment.userName"
          icon="pi pi-user"
          iconPos="right"
        />
        <Button
          @click="step = 1"
          icon="pi pi-arrow-left"
          severity="secondary"
          aria-label="Bookmark"
        />
      </div>
      <template v-if="step === 2">
        <div class="grid grid-cols-1 gap-y-4 lg:gap-y-0 lg:gap-x-8 lg:grid-cols-4 mt-2">
          <div class="col-span-1 rounded-lg shadow bg-gray-50 p-4 max-h-26">
            <DateRange @submit-date-range="filterDateRange"/>
          </div>
          <template v-if="selectedAttachment.hasOwnProperty('attachments') && selectedAttachment.attachments.length">
            <div
              class="col-span-1 lg:col-span-3 rounded-lg shadow bg-gray-50 p-4 grid grid-cols-1 lg:grid-cols-2 gap-2">
              <AttachmentItem v-for="fileAttachment in selectedAttachment.attachments"
                              :key="fileAttachment.id"
                              :id="fileAttachment.id"
                              :user-name="fileAttachment.userName"
                              :createdAt="fileAttachment.createdAt"
                              :fileName="fileAttachment.fileName"
                              :title="fileAttachment.title"
                              :isChecked="fileAttachment.isChecked ===1"
                              :isSeen="fileAttachment.isSeen ===1"
                              @check="checkImage"/>
            </div>
          </template>
          <template v-else>
            <div class="w-full col-span-1 lg:col-span-3 text-center rounded-lg shadow bg-gray-50 p-4 flex items-center justify-center text-gray-600 font-semibold text-lg">
              فایلی یافت نشد
              <br/>
              لطفا محدوده تاریخی دیگری را امتحان کنید
            </div>
          </template>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref, watch } from 'vue';
import Button from 'primevue/button';
import UserSearchControls from '@/components/UserSearchControls.vue';
import defaultAvatar from '@/assets/images/avatar.png';
import AttachmentItem from '@/components/AttachmentItem.vue';
import { useUserStore } from '@/stores/userStore.js';
import { useToast } from 'primevue/usetoast';
import DateRange from '@/components/DateRange.vue';

const user = computed(() => userStore.user);

const userStore = useUserStore();
const repository = inject('repository');
const toast = useToast();

onMounted(() => {
  if (user.value) {
    getAttachmentsGroupList();
  }
});

const loading = ref(true);
const searchQuery = ref('');
const selectedAttachment = ref(null);
const step = ref(1); // 1:searchUsers    //2:userSelected
const fileAttachments = ref([]);
const filters = ref({
  dateFrom: null,
  dateTo: null,
});

const filteredFileAttachments = computed(() => {
  if (!searchQuery.value) {
    return fileAttachments.value;
  }

  const searchTerm = searchQuery.value.toLowerCase();
  return fileAttachments.value.filter(user => user.userName.toLowerCase().includes(searchTerm));
});

const getAttachmentsGroupList = () => {
  loading.value = true;
  repository.getAttachmentsGroupList().then((response) => {
    console.log('response', response);
    fileAttachments.value = response.data.attachments;
  }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'خطا',
      life: 3000,
      detail: error.msg,
    });
  }).finally(() => {
    loading.value = false;
  });
};

const selectUser = (attachment) => {
  selectedAttachment.value = attachment;
  filters.value.userId = attachment.userId;
  filters.value.uName = user.value.userName;
  getAttachments(filters.value, attachment);
};

const getAttachments = (filters) => {
  loading.value = true;
  repository.getAttachmentsList(filters).then((response) => {
    console.log('response', response);
    step.value = 2;
    selectedAttachment.value.attachments = response.data.attachments;
  }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'خطا',
      life: 3000,
      detail: error.msg,
    });
  }).finally(() => {
    loading.value = false;
  });
};

const filterDateRange = (date) => {
  if (!date.length)
    return;
  if (date[0]) {
    filters.value.dateFrom = date[0];
  }
  if (date[1]) {
    filters.value.dateTo = date[1];
  }
  getAttachments(filters.value);
};

const checkImage = (id) => {
  repository.checkImage({ id: id, isChecked: 1, uName: user.value.userName }).then(() => {
    toast.add({
      severity: 'success',
      summary: 'موفق',
      life: 3000,
      detail: 'عملیات با موفقیت انجام شد.',
    });
    getAttachments(filters.value);
  }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'خطا',
      life: 3000,
      detail: error.msg,
    });
  });
};

watch(user, (newValue) => {
  if (newValue) {
    getAttachmentsGroupList();
  }
}, { immediate: true });
</script>

<style scoped></style>
