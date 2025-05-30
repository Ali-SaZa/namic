<script setup>
const props = defineProps({
  phone: {
    type: String,
    required: true,
  },
});

const makeCall = () => {
  // حذف همه کاراکترهای غیرعددی از شماره تلفن
  const cleanedPhone = props.phone.replace(/\D/g, '');
  window.location.href = `tel:${cleanedPhone}`;

  // یا برای باز کردن در تب جدید (در برخی دستگاه‌ها بهتر کار می‌کند)
  window.open(`tel:${cleanedPhone}`, '_blank');
};
</script>

<template>
  <div class="rounded-lg bg-gray-800 flex items-center p-2 max-w-max phone-badge cursor-pointer" @click="makeCall"
       title="تماس"
       v-if="phone.length">
  <span class="text-secondary text-lg ml-3">
    {{ phone }}
  </span>
    <div class="bg-gray-700 w-8 h-8 rounded-lg flex items-center justify-center">
      <i class="fa-solid fa-phone text-lg text-green-500"/>
    </div>
  </div>
</template>

<style scoped>
.phone-badge {
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.7;
    transform: scale(0.98);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

</style>
