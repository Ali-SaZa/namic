<template>
  <div class="p-4 bg-base rounded-lg">
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <i class="fa-solid fa-user"/>
        <div class="mx-2 font-bold">{{ user.name }}</div>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <Button
          :label="user.customerDealTypeStr"
          size="small"
          :severity="severity(user.customerDealType)"
        />
        {{ user.tradeTypeStr }}
      </div>
    </div>

    <div class="flex items-center justify-between text-sm mt-2 font-bold">
      <div>
        وزن خرید: <span v-format-number="+user.buyCoinWeight + +user.buyWeight"></span>
      </div>
      <div>
        وزن فروش: <span v-format-number="+user.sellCoinWeight + +user.sellWeight"></span>
      </div>
    </div>

    <div class="flex items-center justify-between text-sm mt-2 font-bold">
      <div>
        <i class="fa fa-window-restore"/>
        تعداد کل درخواست ها
      </div>
      <div v-format-number="user.allRequestsCount"></div>
    </div>

    <div class="flex items-center justify-between text-sm mt-2 font-bold">
      <div>تعداد ثبت : {{ user.successCount }}</div>
      <div>تعداد ردشده : {{ user.noResponseCount }}</div>
    </div>

    <div class="flex items-center justify-between text-sm mt-2 font-bold">
      <div>تعداد درخواست قبول شده : {{ user.acceptedCount }}</div>
      <div>%{{ user.acceptedPercent }}</div>
    </div>

    <div class="flex items-center justify-between text-sm mt-2 font-bold">
      <div>تعداد سند دستی ثبت شده : {{ user.manualCount }}</div>
      <div>%{{ user.manualPercent }}</div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
      <Button :label="user.failedCount" size="small" severity="warn" variant="outlined"/>
      <Button :label="user.cancelCount" size="small" severity="danger" variant="outlined"/>
      <Button :label="user.acceptedCount" size="small" severity="success" variant="outlined"/>
      <Button :label="user.manualCount" size="small" severity="info" variant="outlined"/>
    </div>
  </div>
</template>

<script setup>

const severity = (type) => {
  switch (type) {
    case 1:
      return 'success';
    case 2:
      return 'info';
    default:
      return 'danger';
  }
};

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped></style>
