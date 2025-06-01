<template>
  <div>
    <template v-if="step === 1">
      <UserSearchControls
        v-model="searchQuery"
        :userCount="filteredUsers.length"
        @refresh="getUsers"
      />
      <div class="md:mt-4">
        <div class="grid md:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4 gap-2"
             v-if="filteredUsers.length && !loading">
          <div
            @click="selectUser(user)"
            class="bg-gray-100 p-2 rounded-lg cursor-pointer"
            v-for="(user, index) in filteredUsers"
            :key="index"
          >
            {{ user.name }}
            <span class="text-sm text-gray-400" v-if="user.userName">
              ({{ user.userName }})
            </span>
          </div>
        </div>
        <template v-else>
          <template v-if="loading">
            <div class="grid md:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4 gap-2">
              <Skeleton class="w-full rounded-lg h-20" height="2.4rem" v-for="item in Array(10)"
                        :key="item"/>
            </div>
          </template>
          <div v-else
               class="w-full flex items-center justify-center text-gray-600 font-semibold text-lg">
            کاربری یافت نشد
          </div>
        </template>
      </div>
    </template>
    <template v-if="step === 2 || step === 3">
      <div class="flex justify-between">
        <div class="flex flex-row justify-center items-center gap-3">
          <Button
            @click="orderModalIsOpen = true"
            :label="selectedUser.name"
            icon="pi pi-user"
            iconPos="right"
          />
          <div class="flex justify-center items-center gap-2 font-bold" v-if="step === 3">
            <TypeIcon :type="selectedItem.type"
                      class="text-xl"/>
            {{ selectedItem.title }}
          </div>
        </div>
        <div class="flex gap-2">
          <Button
            @click="step = 1"
            icon="pi pi-home"
            severity="secondary"
            aria-label="Bookmark"
          />
          <Button
            @click="back"
            icon="pi pi-arrow-left"
            severity="secondary"
            aria-label="Bookmark"
          />
        </div>
      </div>
      <template v-if="step === 2">
        <div class="grid md:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4 gap-2 mt-4">
          <div
            class="bg-gray-100 p-2 rounded-lg cursor-pointer flex items-center gap-2"
            v-for="(item, index) in prices"
            :key="index"
            @click="selectItem(item)"
            :class="item.isActive === 0?'border-r-4 border-red':''"
          >
            <div class="flex justify-between items-center">
              <div>
                <TypeIcon :type="item.type" class="text-xl"/>
                {{ item.name }}
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-if="step === 3">
        <div class="grid grid-cols-2 mt-3 gap-6 mt-2">
          <div class="border-y-4 border-y-green-500 p-2 text-center"
               @click="openOrderModal">
            <div class="font-bold text-xl">خرید</div>
            <div class="font-bold text-sm text-green-500 mt-1">{{ selectedItem.title }}</div>
          </div>
          <div class="border-y-4 border-y-red p-2 text-center" @click="openOrderModal(false)">
            <div class="font-bold text-xl">فروش</div>
            <div class="font-bold text-sm text-red-500 mt-1">{{ selectedItem.title }}</div>
          </div>
        </div>
      </template>
    </template>
    <AddManualDocumentModal v-model:isOpen="orderModalIsOpen" :header="orderModalHeader"
                            :itemPrice="selectedItem.hasOwnProperty('itemPrice')?selectedItem.itemPrice:selectedItem.price"
                            :type="selectedItem.type"
                            :rate="selectedItem.rate"
                            @submit="submitOrder"
                            ref="addManualDocumentModal"/>
    <AddManualDocumentConfirmModal v-model:isOpen="confirmOrderModalIsOpen"
                                   :header="orderModalHeader"
                                   :orderPrice="+order.price"
                                   :type="order.type"
                                   :count="orderValue"
                                   :description="order.description"
                                   :sum="sum"
                                   :userName="selectedUser.name"
                                   @confirm="confirmOrder"
                                   @back="confirmOrderModalIsOpen = false;orderModalIsOpen=true"/>
    <AddManualDocumentLastStep v-model:isOpen="lastStepOrderModalIsOpen"
                               :message="lastStepOrderModalMessage"
                               :orderId="orderId"
                               :userName="selectedUser.name"
                               :status="lastStepOrderModalState"
                               @newOrder="resetForm"
                               @userNewOrder="step=2;selectedItem={}"/>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref, watch } from 'vue';
import Button from 'primevue/button';
import UserSearchControls from '@/components/UserSearchControls.vue';
import { useUserStore } from '@/stores/userStore.js';
import TypeIcon from '@/components/TypeIcon.vue';
import AddManualDocumentConfirmModal from '@/components/ManualDocument/AddManualDocumentConfirmModal.vue';
import AddManualDocumentModal from '@/components/ManualDocument/AddManualDocumentModal.vue';
import AddManualDocumentLastStep from '@/components/ManualDocument/AddManualDocumentLastStep.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const userStore = useUserStore();
const repository = inject('repository');
const searchQuery = ref('');
const selectedUser = ref({});
const step = ref(1);
const selectedItem = ref({});
const users = ref([]);
const loading = ref(true);
const userPricesLoading = ref(true);
const prices = ref([]);
const orderModalIsOpen = ref(false);
const confirmOrderModalIsOpen = ref(false);
const lastStepOrderModalIsOpen = ref(false);
const lastStepOrderModalMessage = ref('');
const lastStepOrderModalState = ref('');
const orderId = ref('');
const orderModalHeader = ref('تست');
const order = ref({});
const buy = ref(true);
const addManualDocumentModal = ref(null);
const user = computed(() => userStore.user);

onMounted(() => {
  getUsers();
  getItemsList();
  if (route.query.userId) {
    handleUserIdFromQuery();
  }
});

const filteredUsers = computed(() => {
  if (!searchQuery.value) {
    return users.value;
  }

  const searchTerm = searchQuery.value.toLowerCase();
  return users.value.filter(user =>
    user.name.toLowerCase().includes(searchTerm) ||
    user.userName.toLowerCase().includes(searchTerm),
  );
});

const getItemsList = () => {
  repository.getPriceList({
    id: userStore.id,
    all: true,
  }).then((response) => {
    prices.value = response.data.prices;
  });
};

const getUsers = () => {
  loading.value = true;
  repository.getUserList().then((response) => {
    users.value = response.data.users;
  }).finally(() => {
    loading.value = false;
  });
};

const selectUser = (user) => {
  selectedUser.value = user;
  step.value = 2;
};

const selectItem = (item) => {
  selectedItem.value = item;
  console.log('selectedItem.value:', selectedItem.value);
  userPricesLoading.value = true;
  step.value = 3;
};

const back = () => {
  if (step.value !== 1) {
    step.value--;
  }
};

const openOrderModal = (isBuy) => {
  buy.value = isBuy;
  if (isBuy) {
    orderModalHeader.value = 'خرید ';
    // if (selectedItem.value.type === 1) {
    selectedItem.value.itemPrice = (+selectedItem.value.price) - selectedItem.value.profit;
    // }
  } else {
    orderModalHeader.value = 'فروش ';
    // if (selectedItem.value.type === 1) {
    selectedItem.value.itemPrice = +selectedItem.value.price + selectedItem.value.profit;
    // }
  }

  orderModalHeader.value += selectedItem.value.name;

  orderModalIsOpen.value = true;
  // lastStepOrderModalIsOpen.value = true
};

const confirmOrder = () => {
  console.log('buyItem');

  const data = {
    userId: selectedUser.value.id,
    userName: selectedUser.value.name,
    priceId: selectedItem.value.id,
    priceName: selectedItem.value.name,
    priceType: selectedItem.value.type,
    registrarId: user.value.id,
    registrarType: user.value.type,
    registrarName: user.value.userName,
    state: 4,
    customerMsg: order.value.description,
    pd: buy.value ? -1 : 1,
    fi: order.value.price,
    isAmountMode: 0,
  };

  if (selectedItem.value.type === 1) {
    data.amount = Math.floor(order.value.amount);
    data.count = 0;
    data.weight = order.value.weight;
  } else {
    data.amount = order.value.price;
    data.count = order.value.count;
    data.weight = 0;
  }

  repository.addOrder(data).then((response) => {
    console.log('response', response);
    lastStepOrderModalState.value = response.data.state;
    if (response.data.state) {
      orderId.value = response.data.id;
    } else {
      lastStepOrderModalMessage.value = response.data.msg;
    }

    confirmOrderModalIsOpen.value = false;
    lastStepOrderModalIsOpen.value = true;
  }).catch((error) => {
    console.log('error', error);
  });
};

const sum = computed(() => {
  if (order.value.type === 1) {
    return (order.value.price / selectedItem.value.rate) * order.value.weight;
  } else {
    return order.value.count * (+order.value.price);
  }
});

const orderValue = computed(() => {
  if (order.value.type === 1) {
    return order.value.weight;
  } else {
    return order.value.count;
  }
});

const submitOrder = (value) => {
  console.log('value', value);
  order.value = value;
  orderModalIsOpen.value = false;
  confirmOrderModalIsOpen.value = true;
};

const resetForm = () => {
  step.value = 1;
  selectedItem.value = {};
  selectedUser.value = {};
  if (addManualDocumentModal.value) {
    addManualDocumentModal.value.resetOrderForm();
  }
};

const handleUserIdFromQuery = () => {
  loading.value = true;
  const checkUsersLoaded = setInterval(() => {
    if (users.value.length > 0) {
      clearInterval(checkUsersLoaded);
      const userId = route.query.userId;
      const userFromQuery = users.value.find(user => user.id === +userId);
      if (userFromQuery) {
        selectUser(userFromQuery);
      }
      loading.value = false;
    }
  }, 100);
};

watch(
  () => route.query.userId,
  (newUserId) => {
    if (newUserId) {
      handleUserIdFromQuery();
    }
  },
);
</script>

<style scoped></style>
