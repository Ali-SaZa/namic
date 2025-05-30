<template>
  <div class="grid grid-cols-1 gap-y-4 lg:gap-y-0 lg:gap-x-8 lg:grid-cols-4">
    <div class="col-span-1 rounded-lg shadow bg-gray-50">
      <template v-if="adminSettingsStore.settings.orderViewId === 2">
        <ButtonGroup class="w-full mt-2 p-2">
          <Button
            v-for="page in pages"
            :key="page.id"
            :severity="selectedPage === page.id ? 'info' : 'secondary'"
            class="min-w-1/3 flex flex-col"
            size="small"
            @click="selectedPage = page.id"
          >
            <div>
              {{ page.name }}
            </div>
          </Button>
        </ButtonGroup>
      </template>
      <div class="flex justify-between px-4 pt-4">
        <div class="flex items-center">
          <div class="text-green-500 ml-4">
               <span class="mr-1 font-bold">
                {{ onlineUsers.length }}
              </span>
            <i class="fa-solid fa-user-group !text-[12px]"/>
          </div>
          <Button
            icon="fa-solid fa-comments"
            severity="secondary"
            rounded
            @click="messageModalIsOpen = true"
          />
        </div>
        <div class="flex gap-1">
          <Button asChild v-slot="slotProps" severity="secondary" rounded>
            <RouterLink to="/settings" :class="slotProps.class">
              <i class="fa-solid fa-gear"/>
            </RouterLink>
          </Button>
          <Button asChild v-slot="slotProps" severity="secondary" rounded>
            <RouterLink to="/docs/list/1" :class="slotProps.class">
              <i class="fa-solid fa-file-invoice-dollar"/>
            </RouterLink>
          </Button>
          <Button asChild v-slot="slotProps" severity="secondary" rounded>
            <RouterLink to="/balance-report" :class="slotProps.class">
              <i class="fa-solid fa-scale-balanced"/>
            </RouterLink>
          </Button>
          <Button asChild v-slot="slotProps" severity="secondary" rounded>
            <RouterLink to="/manual-document" :class="slotProps.class">
              <i class="fa-solid fa-file-invoice-dollar"/>
            </RouterLink>
          </Button>
        </div>
      </div>
      <Divider/>
      <SummaryBalance :balance="balance"/>
    </div>
    <div class="col-span-1 lg:col-span-3" v-if="selectedPage === 1">
      <div class="grid grid-cols-2 justify-between items-center">
        <div class="col-span-2 md:col-span-1">
          آخرین آپدیت قیمت:
          <span class="text-red-500">{{ lastUpdateTime }}</span>
          <span class="text-red-500 mr-1">{{ lastUpdateDay }}</span>
        </div>
        <div
          v-if="adminSettingsStore.settings.orderItemViewId === 1"
          class="col-span-2 md:col-span-1 text-left"
        >
          <MultiSelect
            filter
            ref="multiRef"
            v-model="selectedItems"
            :options="prices"
            optionLabel="name"
            optionValue="id"
            placeholder="انتخاب همه"
            :maxSelectedLabels="prices.length"
            appendTo="body"
            class="w-full md:w-80"
            :scrollHeight="'200px'"
            emptyFilterMessage="آیتمی یافت نشد"
          />
        </div>
      </div>
      <template v-if="adminSettingsStore.settings.orderItemViewId === 2">
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
      </template>
      <div class="shadow w-full min-h-20 flex flex-col rounded-lg bg-gray-50 mt-2">
        <div class="p-4 h-full relative flex-1">
          <TradeItemList :visible-prices="visiblePrices" :loading="loading" @get-prices="getPrices(false)"
                         :editable="adminSettingsStore.settings.orderViewId === 2"/>
        </div>
      </div>
    </div>
    <div class="col-span-1 lg:col-span-3" v-if="selectedPage === 2">
      <div class="shadow w-full min-h-20 flex flex-col rounded-lg bg-gray-50">
        <template v-if="pendingRequests.length">
          <div class="col-span-1 lg:col-span-3 lg:col-start-2 mt-2"
               v-for="request in pendingRequests"
               :key="request.id">
            <AdminOrderConfirmation
              :username="request.userName"
              :isBuy="request.pd === -1"
              :itemName="request.priceName"
              :orderPrice="request.fi"
              :count="request.count"
              :weight="request.weight"
              :sum="request.amount"
              :type="request.priceType"
              :orderId="request.id"
              :customerMsg="request.customerMsg"
              @confirm="confirmOrder"/>
          </div>
        </template>
        <div class="p-4 h-full relative flex-1" v-else>
          <div class="w-full text-center font-bold text-red-500">درخواستی وجود ندارد</div>
        </div>
      </div>
    </div>
    <div class="col-span-1 lg:col-span-3" v-if="selectedPage === 3">
      <ManualDoc/>
    </div>
    <template v-if="pendingRequests.length && selectedPage === 1 && adminSettingsStore.settings.orderViewId !== 2">
      <div class="col-span-1 lg:col-span-3 lg:col-start-2 mt-2"
           v-for="request in pendingRequests"
           :key="request.id">
        <AdminOrderConfirmation
          :username="request.userName"
          :isBuy="request.pd === -1"
          :itemName="request.priceName"
          :orderPrice="request.fi"
          :count="request.count"
          :weight="request.weight"
          :sum="request.amount"
          :type="request.priceType"
          :orderId="request.id"
          :customerMsg="request.customerMsg"
          @confirm="confirmOrder"/>
      </div>
    </template>

    <Dialog
      v-model:visible="messageModalIsOpen"
      modal
      :style="{ width: '30rem' }"
      dir="rtl"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <template #header>
        <div class="inline-flex items-center justify-center gap-2">
          <i class="fa fa-comments"></i>
          <span class="font-bold whitespace-nowrap">پیام مدیر سیستم</span>
        </div>
      </template>
      <Textarea
        v-model="adminMessage"
        autoResize
        prices="3"
        cols="20"
        placeholder="مقدمه(پیشگفتار)"
        class="w-full"
      />
      <div class="text-xs text-gray-400 -mt-1">{{ adminMessage.length }} / 500</div>

      <div class="mt-2 w-full flex justify-end">
        <Button
          size="small"
          label="ثبت و ذخیره پیام"
          icon="fa fa-save"
          icon-pos="right"
          @click="saveAdminMessage"
        />
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import MultiSelect from 'primevue/multiselect';
import { useUserStore } from '@/stores/userStore.js';
import { useToast } from 'primevue/usetoast';
import moment from 'moment-jalaali';
import { useAdminSettingsStore } from '@/stores/adminSettings';
import ManualDoc from '@/components/ManualDoc.vue';
import AdminOrderConfirmation from '@/components/AdminOrderConfirmation.vue';
import TradeItemList from '@/components/TradeItemList.vue';
import SummaryBalance from '@/components/SummaryBalance.vue';

const repository = inject('repository');
const dateTime = inject('dateTime');
const userStore = useUserStore();
const adminSettingsStore = useAdminSettingsStore();

const toast = useToast();
const lastUpdateTime = ref('');
const lastUpdateDay = ref('');
const multiRef = ref(null);
const user = computed(() => userStore.user);
const adminMessage = ref('');
const messageModalIsOpen = ref(false);

const prices = ref([]);
const loading = ref(true);
const selectedItems = ref([]);
const balance = ref({
  count: [],
  weight: 0,
});

const priceInterval = ref(null);
const priceIntervalTime = ref(6000);
const summaryInterval = ref(null);
const summaryIntervalTime = ref(10000);
const onlineUsersInterval = ref(null);
const onlineUsersIntervalTime = ref(8000);
const onlineUsers = ref([]);
const pendingRequestInterval = ref(null);
const pendingRequestIntervalTime = ref(2000);
const pendingRequests = ref([]);

const filteredItemTypeCode = ref(1);
const itemTypes = [
  {
    name: 'گرمی',
    code: 1,
  },
  {
    name: 'سکه',
    code: 2,
  },
  {
    name: 'ارز',
    code: 3,
  },
];

const selectedPage = ref(1);
const pages = [
  {
    name: 'برد قیمت',
    id: 1,
  },
  {
    name: 'درخواست ها',
    id: 2,
  },
  {
    name: 'سند دستی',
    id: 3,
  },
];

const audio = new Audio('/sound/sound1.mp3');

const visiblePrices = computed(() =>
  adminSettingsStore.settings.orderItemViewId === 1
    ? prices.value.filter((price) => selectedItems.value.includes(price.id)).filter(price => price.isActive === 1)
    : prices.value.filter((price) => price.type === filteredItemTypeCode.value).filter(price => price.isActive === 1),
);

onMounted(() => {
  getPrices();
  getAdminMessage();

  priceInterval.value = setInterval(() => {
    getPrices(false);
  }, priceIntervalTime.value);

  watch(
    user,
    (newValue) => {
      if (newValue) {
        getSummary();
        getOnlineUsers();
        getPendingRequests();

        summaryInterval.value = setInterval(() => {
          getSummary();
        }, summaryIntervalTime.value);

        onlineUsersInterval.value = setInterval(() => {
          getOnlineUsers();
        }, onlineUsersIntervalTime.value);

        pendingRequestInterval.value = setInterval(() => {
          getPendingRequests();
          checkExpiredRequests();
        }, pendingRequestIntervalTime.value);
      }
    },
    { immediate: true },
  );
});

onBeforeUnmount(() => {
  if (priceInterval.value) clearInterval(priceInterval.value);
  if (summaryInterval.value) clearInterval(summaryInterval.value);
  if (onlineUsersInterval.value) clearInterval(onlineUsersInterval.value);
  if (pendingRequestInterval.value) clearInterval(pendingRequestInterval.value);
});

const getPrices = (firstTime = true) => {
  repository.getPriceList({ all: true }).then((response) => {
    prices.value = response.data.prices;
    lastUpdateTime.value = dateTime.getDate(response.data.lastUpdateTime, 'jMM/jDD', null, true);
    lastUpdateDay.value = dateTime.getJalaliDay(moment(response.data.lastUpdateTime));
    if (firstTime) {
      loading.value = false;
      selectedItems.value = prices.value.slice(0, 4).map((r) => r.id);
    }
  }).catch((error) => {
    console.log('error', error.msg);
    toast.add({
      severity: 'warn',
      summary: 'خطا',
      life: 3000,
      detail: error.msg,
    });
  });
};

const getSummary = () => {
  if (!user.value) return;

  repository.getTotalSummary({ BIV: 'all', userType: user.value.type }).then((response) => {
    balance.value = response.data.balance;
  }).catch((error) => {
    toast.add({
      severity: 'warn',
      summary: 'خطا',
      life: 3000,
      detail: error.msg,
    });
  });
};

const getAdminMessage = () => {
  repository.getAdminMessage().then((response) => {
    adminMessage.value = response.data.message;
  }).catch((error) => {
    toast.add({
      severity: 'warn',
      summary: 'خطا',
      life: 3000,
      detail: error.msg,
    });
  });
};

const saveAdminMessage = () => {
  messageModalIsOpen.value = false;
  repository.setAdminMessage({ message: adminMessage.value }).then(() => {
    toast.add({
      severity: 'success',
      summary: 'موفقیت',
      life: 3000,
      detail: 'پیام ادمین با موفقیت ویرایش شد',
    });
  }).catch((error) => {
    console.log('error', error.msg);
    toast.add({
      severity: 'warn',
      summary: 'خطا',
      life: 3000,
      detail: error.msg,
    });
  });
};

const getOnlineUsers = () => {
  repository.getOnlineState().then((response) => {
    onlineUsers.value = response.data.list;
  }).catch((error) => {
    console.log('error', error.msg);
    toast.add({
      severity: 'warn',
      summary: 'خطا',
      life: 3000,
      detail: error.msg,
    });
  });
};

const getPendingRequests = () => {
  const data = {
    userId: user.value.id,
    seen: localStorage.getItem('seen') || '',
    dismiss: 1,
    maxId: localStorage.getItem('maxId') || 0,
  };
  repository.getPendingRequests(data).then((response) => {
    localStorage.setItem('maxId', response.data.maxId);
    if (response.data.requests.length > 0) {
      audio.currentTime = 0;
      audio.play();
      const newRequests = response.data.requests.map(request => ({
        ...request,
        timestamp: Date.now(),
      }));
      pendingRequests.value = [...pendingRequests.value, ...newRequests];
    }

    const seen = JSON.parse(localStorage.getItem('seen')) || [];
    pendingRequests.value.forEach((request) => {
      seen.push(request.id);
    });
    localStorage.setItem('seen', JSON.stringify(seen));

  }).catch((error) => {
    console.log('error', error.msg);
    toast.add({
      severity: 'warn',
      summary: 'خطا',
      life: 3000,
      detail: error.msg,
    });
  });
};

const checkExpiredRequests = () => {
  const now = Date.now();
  const expiredRequests = pendingRequests.value.filter(
    (request) => now - request.timestamp > 60000,
  );

  if (expiredRequests.length > 0) {
    pendingRequests.value = pendingRequests.value.filter(
      (request) => now - request.timestamp <= 60000,
    );

    expiredRequests.forEach((request) => {
      toast.add({
        severity: 'info',
        summary: 'درخواست بدون پاسخ',
        life: 6000,
        detail: `درخواست ${request.id} پس از 60 ثانیه حذف شد`,
      });
    });
  }
};

const confirmOrder = (event) => {
  const data = {
    userType: userStore.userType,
    id: event.id,
    state: event.state,
    sellerMsg: event.sellerMsg,
    registrarId: user.value.id,
    registrarType: user.value.type,
    registrarName: user.value.name,
    uName: user.value.userName,
  };
  repository.updateState(data).then((response) => {
    if (response.data.state) {
      pendingRequests.value = pendingRequests.value.filter(
        (request) => request.id !== event.id,
      );
      let text = 'درخواست ' + event.id;
      if (event.state === 3) {
        text += ' تایید شد';
      } else {
        if (event.sellerMsg.length) {
          text += ' به دلیل : ' + event.sellerMsg + ' رد شد';
        } else {
          text += ' رد شد';
        }
      }
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: text,
      });
    }

  }).catch((error) => {
    console.log('error', error.msg);
    toast.add({
      severity: 'warn',
      summary: 'خطا',
      life: 3000,
      detail: error.msg,
    });
  });
};
</script>

<style>
.p-multiselect-list {
  direction: rtl !important;
}

.p-multiselect-header {
  direction: rtl;
}
</style>
