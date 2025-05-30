<template>
  <ToggleSwitch :modelValue="userIsOnline" @update:modelValue="toggleStatus">
    <template #handle="{ checked }">
      <i
        :class="[
          '!text-[9px] fa-solid',
          { 'fa-plug': checked, 'fa-plug-circle-xmark text-red-500': !checked },
        ]"
      />
    </template>
  </ToggleSwitch>
</template>

<script setup>
import { useOnlineStatusStore } from '@/stores/onlineStatus.js';
import { computed, inject } from 'vue';
import { useUserStore } from '@/stores/userStore.js';

const onlineStatusStore = useOnlineStatusStore();
const userIsOnline = computed(() => onlineStatusStore.userStatus);
const repository = inject('repository');
const userStore = useUserStore();

const user = computed(() => userStore.user);

const audio = new Audio('/sound/notif.mp3');

const toggleStatus = (event) => {
  console.log('event:', event);
  repository.setOnlineState({ userId: user.value.id, isAdmin: 1, onlineValue: event ? 1 : 0 }).then((response) => {
    if (response.data.state) {
      onlineStatusStore.toggleManualStatus();
      audio.currentTime = 0;
      audio.play();
    }
  });
};
</script>

<style scoped></style>
