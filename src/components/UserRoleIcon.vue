<template>
  <i
    class="fa-solid"
    :class="classes"
  />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: Number,
    default: 1,
  },
});

const classes = computed(() => {
  if (props.type === 1) {
    return 'fa-user-shield';
  } else if (props.type === 2) {
    return 'fa-user-gear';
  } else if (props.type === 3) {
    return 'fa-calculator';
  } else if (props.type === 4) {
    return 'fa-circle-user';
  }
});
</script>

<style scoped>

</style>
