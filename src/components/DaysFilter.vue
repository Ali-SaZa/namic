<template>
  <ButtonGroup class="w-full">
    <Button size="small"
            v-for="dayFilter in dayFilters"
            :key="dayFilter.id"
            :severity="filteredDay === dayFilter ? 'info' : 'secondary'"
            @click="selectDay(dayFilter)"
            class="min-w-1/3 flex flex-col">
      <div>
              <span class="font-bold">
              {{ dayFilter.dayName }}
            </span>
        ({{ dayFilter.tedad }})
      </div>
      <div class="text-xs -mt-1">
        {{ dayFilter.dateStr }}
      </div>
    </Button>
  </ButtonGroup>
</template>

<script setup>
const emit = defineEmits(['selectDay'])
const props = defineProps({
  filteredDay: {
    type: Object,
    required: true
  },
  dayFilters: {
    type: Array,
    required: true
  }
})

const selectDay = (dayFilter) => {
  emit('selectDay', dayFilter)
}
</script>

<style scoped>

</style>
