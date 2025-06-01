<template>
  <div class="w-full flex items-center justify-center">
    <div class="w-full md:w-[500px] rounded-lg bg-gray-50 p-4">
      <ButtonGroup class="w-full">
        <Button
          size="small"
          label="ارسال"
          icon-pos="right"
          icon="fa fa-share"
          :severity="activeTab === 1 ? 'info' : 'secondary'"
          @click="activateTab(1)"
          class="min-w-1/2"
        />
        <Button
          size="small"
          label="لیست ارسالی‌ها"
          icon-pos="right"
          icon="fa fa-list"
          :severity="activeTab === 2 ? 'info' : 'secondary'"
          @click="activateTab(2)"
          class="min-w-1/2"
        />
      </ButtonGroup>

      <template v-if="activeTab === 1">
        <div class="w-full flex justify-start mt-2">
          <FileUpload mode="basic" @select="(e) => onFileSelect(e)" chooseLabel="انتخاب فایل"
                      customUpload auto
                      severity="secondary" accept="image/*"/>
        </div>
        <img v-if="src1" :src="src1" alt="Image" class="shadow-md rounded-xl w-20 h-20 my-2"
             style="filter: grayscale(100%)"/>
        {{ src1Name }}

        <label class="block text-sm text-right mt-2">
          عنوان
        </label>
        <IconField>
          <InputIcon class="fa fa-t"/>
          <InputText
            v-model="title"
            class="w-full"
            placeholder="عنوان"
            type="text"
          />
        </IconField>
        <label class="block text-sm text-right mt-2">
          توضیحات
        </label>
        <Textarea
          v-model="description"
          autoResize
          rows="3"
          cols="20"
          placeholder="توضیحات"
          class="mt-1 w-full"
        />
        <Button
          class="w-full"
          size="small"
          severity="info"
          label="ارسال"
          @click="submitAttachment"
          icon-pos="right"
          icon="fa fa-share"
          :loading="loading"
          :disabled="loading"
        />
      </template>
      <template v-else>
        <div class="mt-2">
          <DateRange @submit-date-range="filterDateRange"/>
          <div v-if="userAttachments.length">
            <div v-for="attachment in userAttachments" :key="attachment.id" class="mt-2 bg-gray-100 rounded-lg p-2">
              <i class="fa fa-t"/>
              <span>
                {{ attachment.title }}
              </span>
              <div class="flex gap-2 mt-2">
                <img
                  :src="`${apiUrl}auth/${attachment.fileName}`"
                  class="w-40 h-40 object-contain">
                <div>
                  {{ attachment.detail }}
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <div v-if="getAttachmentsLoading">
              <Skeleton class="w-full rounded-lg h-20 mb-2" height="2.4rem" v-for="item in Array(10)"
                        :key="item"/>
            </div>
            <div v-else class="w-full mt-2 text-center">
              فیش یا فایلی یافت نشد
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { inject, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useUserStore } from '@/stores/userStore.js';
import DateRange from '@/components/DateRange.vue';

const apiUrl = import.meta.env.VITE_PICS_URL;

const toast = useToast();
const userStore = useUserStore();
const repository = inject('repository');

const activeTab = ref(1);
const src1 = ref(null);
const src1Name = ref('');
const src1File = ref(null);
const title = ref('');
const description = ref('');
const loading = ref(false);
const getAttachmentsLoading = ref(false);
const userAttachments = ref([]);
const filters = ref({
  dateFrom: null,
  dateTo: null,
});

function onFileSelect(event) {
  const file = event.files[0];
  const reader = new FileReader();

  reader.onload = async (e) => {
    src1.value = e.target.result;
    src1Name.value = file.name;
    src1File.value = file;
  };
  reader.readAsDataURL(file);
}

const submitAttachment = async () => {
  try {
    loading.value = true;
    // اعتبارسنجی که همه فایل‌ها آپلود شده باشند
    if (!src1File.value) {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        detail: 'لطفاً تصویر مورد نیاز را آپلود کنید',
        life: 3000,
      });
      return;
    }

    const formData = new FormData();
    formData.append('userId', userStore.id);
    formData.append('userName', userStore.user.name);
    formData.append('userType', userStore.userType);
    formData.append('file', src1File.value, src1Name.value);
    formData.append('title', title.value);
    formData.append('detail', description.value);

    const response = await repository.addAttachments(formData);

    if (response.data.state) {
      toast.add({
        severity: 'success',
        summary: 'موفق',
        detail: 'حواله با موفقیت ثبت شد',
        life: 3000,
      });
      activateTab(2);
    } else {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        detail: response.data.msg,
        life: 3000,
      });
    }
  } catch (error) {
    console.error('Error submitting files:', error);
  } finally {
    loading.value = false;
  }
};

const getAttachments = (filters) => {
  getAttachmentsLoading.value = true;
  repository.getAttachmentsList({ ...filters, userId: userStore.id }).then((response) => {
    userAttachments.value = response.data.attachments;
  }).catch((error) => {
    toast.add({
      severity: 'error',
      summary: 'خطا',
      life: 3000,
      detail: error.msg,
    });
  }).finally(() => {
    getAttachmentsLoading.value = false;
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

const activateTab = (tab) => {
  activeTab.value = tab;
  if (tab === 2) {
    getAttachments(filters.value);
  }
};

</script>

<style scoped>

</style>
