<template>
  <div class="w-full">
    <label class="block text-sm font-medium mt-2 text-right">انتخاب محدوده تاریخ</label>
    <div class="flex items-center">
      <vue-date-picker v-model="fromDate" range class="w-full" color="#0ea5e9" :format="format"
                       :displayFormat="displayFormat"/>
      <Button variant="outlined"
              @click="submitDateRange"
              size="small"
              class="mr-2"
              label="جستجو"
              style="height: 40px;width: max-content;max-width: max-content; min-width: 40px"/>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const emit = defineEmits(['submitDateRange']);

const props = defineProps({
  displayFormat: {
    type: String,
    default: 'jYYYY/jMM/jDD',
  },
  format: {
    type: String,
    default: 'YYYY-MM-DD',
  },
  initialDate: {
    type: Array,
    default: () => [],
  },
});
const fromDate = ref([...props.initialDate]);

watch(() => props.initialDate, (newVal) => {
  fromDate.value = [...newVal];
}, { deep: true });

const submitDateRange = () => {
  emit('submitDateRange', fromDate.value);
};
</script>


<style scoped>

</style>
