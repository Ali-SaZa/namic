<template>
  <i
    class="fa-solid"
    :class="classes"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: Number,
    default: 1
  }
})

const classes = computed(() => {
  if (props.type === 1) {
    return 'fa-cubes text-yellow-400'
  } else if (props.type === 2) {
    return 'fa-ring text-blue-500'
  } else if (props.type === 3) {
    return 'fa-dollar-sign text-primary'
  }
})
</script>

<style scoped>

</style>
