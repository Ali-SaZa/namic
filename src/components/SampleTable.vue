<template>
  <DataTable
    :value="sampleData"
    scrollable
    scrollHeight="670px"
    paginator
    :rows="10"
    :rowsPerPageOptions="[10, 20, 50]"
  >
    <Column field="date" header="تاریخ" />
    <Column field="code" header="شماره سند" />
    <Column field="name" header="نام مشتری" />
    <Column field="type" header="نوع سند" />
    <Column field="fee" header="فی" />
    <Column field="quantity" header="تعداد|گرم" />
    <Column field="price" header="مبلغ" />
    <Column field="description" header="توضیحات" />
    <Column field="status" header="وضعیت">
      <template #body="slotProps">
        <span :class="getStatus(slotProps.data.status).class">
          {{ getStatus(slotProps.data.status).title }}
        </span>
        <span class="block">
          {{ slotProps.data.userConfirmName }}
        </span>
      </template>
    </Column>
    <Column field="sum" header="جمع" />
    <template #paginatorstart>
      تعداد اسناد لوده شده:
      {{ sampleData ? sampleData.length : 0 }}
    </template>
    <template #empty> دیتایی یافت نشد</template>
  </DataTable>
</template>

<script setup>
const props = defineProps({
  sampleData: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const getStatus = (status) => {
  {
    if (status === 1) {
      return {
        title: 'تایید',
        class: 'text-green-500',
      }
    } else if (status === 2) {
      return {
        title: 'رد',
        class: 'text-red-500',
      }
    } else if (status === 3) {
      return {
        title: 'دستی',
        class: 'text-blue-500',
      }
    }
  }
}
</script>
<style scoped>
:deep(.p-datatable-column-header-content) {
  justify-content: center;
}

:deep(.p-datatable-tbody td) {
  text-align: center;
}
</style>
