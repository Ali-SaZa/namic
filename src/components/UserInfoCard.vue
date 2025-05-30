<template>
  <div class="bg-gray-100 rounded-lg flex items-center p-2">
    <div class="min-w-12">
      <img
        :src="avatarUrl && avatarUrl.length ? avatarUrl : defaultAvatar"
        class="size-12"
        alt="user avatar"
      />
    </div>
    <div class="w-full mt-2">
      <div class="flex items-center justify-between">
        <div class="font-bold">
          <UserRoleIcon :type="role"/>
          {{ firstName }}
        </div>
        <div class="flex items-center justify-between">
          <ToggleSwitch v-model="isActive"/>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-400">
          {{ userRole(userName, role) }}
        </div>
        <div>
          <Button
            type="button"
            class="font-bold"
            @click="toggleMenu"
            icon="pi pi-ellipsis-h"
            severity="contrast"
            variant="text"
            rounded
            aria-label="Star"
            :disabled="loading"
          />
          <Menu ref="menu" id="overlay_menu" :model="items" :popup="true"/>
        </div>
      </div>
    </div>
    <Dialog
      v-model:visible="messageDialogIsOpen"
      modal
      header="ارسال لینک سایت"
      :style="{ width: '50rem' }"
      dir="rtl"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <div>ارسال لینک به شماره {{ phoneNumber }}</div>

      <div class="w-full mt-1">
        <Textarea
          v-model="messageText"
          rows="5"
          cols="30"
          class="w-full leading-relaxed"
          disabled
        />
      </div>
      <Button
        @click="sendSms"
        class="w-full mt-2"
        size="small"
        type="submit"
        severity="info"
        label="ارسال پیام"
      />
    </Dialog>
    <UserEditModal v-model:isOpen="editModalIsOpen" :header="editHeader" :userData="userData"
                   :userPricesData="userPricesData"
                   :accountGroup="localAccountGroup"
                   @getAccountGroups="getAccountGroups"/>
    <UserEditItemModal v-model:isOpen="editItemsModalIsOpen"
                       :userPricesData="userPricesData"
                       :userId="id"
                       :header="editHeader"/>
  </div>
</template>

<script setup>
import defaultAvatar from '@/assets/images/avatar.png';
import { inject, ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import UserRoleIcon from './UserRoleIcon.vue';
import { useUserStore } from '@/stores/userStore.js';
import UserEditModal from '@/components/UserEditModal.vue';
import UserEditItemModal from '@/components/UserEditItemModal.vue';

const router = useRouter();
const toast = useToast();
const localAccountGroup = ref([])

const props = defineProps({
  id: Number,
  avatarUrl: String,
  role: String,
  firstName: String,
  userName: String,
  isActive: Boolean,
  phoneNumber: String,
  accountGroup: Array,
});

const emit = defineEmits(['deleteUser', 'getAccountGroups']);
const smsUrl = import.meta.env.VITE_SMS_URL;
const menu = ref();
const userStore = useUserStore();
const isActive = ref(props.isActive === 1);
const messageDialogIsOpen = ref(false);
const repository = inject('repository');
const editModalIsOpen = ref(false);
const editItemsModalIsOpen = ref(false);
const loading = ref(false);
const editHeader = ref('');
const messageText = ref(
  `برای ورود به سایت namic به لینک زیر مراجعه کنید\nhttps://www.namic-network.com`,
);
const userData = ref({});
const userPricesData = ref({});

const items = [
  { label: 'ویرایش', icon: 'fa-solid fa-edit', command: () => editUser() },
  {
    label: 'ویرایش آیتم‌ها', icon: 'fa-solid fa-bars',
    command: () => editUserItems(),
  },
  {
    label: 'پیام',
    icon: 'fa-solid fa-comments',
    command: () => (messageDialogIsOpen.value = true),
  },
  {
    label: 'آیتم‌ها', icon: 'fa-solid fa-bars',
    command: () => router.replace({
      path: '/manual-document',
      query: { userId: props.id },
    }),
  },
  {
    label: 'اسناد',
    icon: 'fa-solid fa-file-invoice',
    command: () => router.push(`/requests/customer/${props.id}`),
  },
  {
    label: 'حذف',
    icon: 'pi pi-trash',
    command: () =>
      emit('deleteUser', {
        id: props.id,
        name: props.firstName,
      }),
  },
];

const userRole = (lastName, role) => {
  const roles = {
    1: 'مدیر سیستم',
    2: 'اپراتور',
    3: 'حسابدار',
    4: 'مشتری',
  };

  return `${lastName} ( ${roles[role] || 'نقش نامشخص'} )`;
};

const toggleMenu = (event) => {
  menu.value.toggle(event);
};

const changeUserStatus = async (status) => {
  try {
    const response = await repository.updateUserStatus({
      id: props.id,
      isActive: status ? 1 : 0,
    });
    if (response) {
      toast.add({
        severity: 'success',
        summary: 'وضعیت تغییر کرد',
        life: 3000,
        detail: `کاربر ${props.firstName} با موفقیت ${status ? 'فعال' : 'غیرفعال'} شد`,
      });
    }
  } catch (error) {
    console.log(error, 'error on change user status');
  }
};

const sendSms = async () => {
  try {
    if (props.phoneNumber) {
      const response = await repository.sendSms({
        userId: userStore.id,
        uName: userStore.user.userName,
        content: messageText.value,
        mobile: props.phoneNumber,
        customerId: props.id,
        SMS_URL: smsUrl,
        userToken: userStore.token,
      });
      if (response) {
        toast.add({
          severity: 'success',
          summary: 'موفقیت',
          life: 3000,
          detail: 'پیام با موفقیت ارسال شد',
        });
      }
    } else {
      toast.add({
        severity: 'warn',
        summary: 'خطا',
        life: 3000,
        detail: 'شماره موبایل کاربر یافت نشد',
      });
    }
  } catch (error) {
    console.log(error, 'Error on send sms');
  } finally {
    messageDialogIsOpen.value = false;
  }
};

const editUser = () => {
  loading.value = true;
  editHeader.value = 'ویرایش کاربر ' + props.userName;
  repository.getUsersInfo({ id: props.id }).then((response) => {
    if (response.data.state) {
      userData.value = response.data.user;
      userPricesData.value = response.data.prices;
      editModalIsOpen.value = true;
      localAccountGroup.value = props.accountGroup;
    } else {
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

const editUserItems = () => {
  loading.value = true;
  editHeader.value = 'ویرایش آیتم‌های کاربر ' + props.userName;
  repository.getUsersInfo({ id: props.id }).then((response) => {
    console.log('response', response);
    if (response.data.state) {
      console.log('response.data.price:', response.data.price);
      userPricesData.value = response.data.prices.map(item => ({
        ...item,
        isActive: item.isActive === 1,
        allowBuy: item.allowBuy === 1,
        allowSell: item.allowSell === 1,
        isOpen: false,
      }));
      editItemsModalIsOpen.value = true;
    } else {
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

watch(isActive, (oldValue) => {
  changeUserStatus(oldValue);
});

const getAccountGroups = () => {
  emit('getAccountGroups');
};
</script>
