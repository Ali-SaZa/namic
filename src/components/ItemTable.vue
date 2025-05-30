<template>
  <DataTable :value="sampleData" scrollable scrollHeight="600px">
    <Column field="name" header="نام آیتم" />
    <Column field="value" header="جمع">
      <template #body="slotProps">
        <span v-format-number="slotProps.data.value"
              dir="ltr" />
      </template>
    </Column>
    <template #empty> آیتمی یافت نشد</template>
  </DataTable>
</template>

<script setup>

const props = defineProps({
  sampleData: {
    type: Array,
    required: true,
    default: () => []
  }
})

</script>
<style scoped>
:deep(.p-datatable-column-header-content) {
  justify-content: center;
}

:deep(.p-datatable-tbody td) {
  text-align: center;
}
</style>
