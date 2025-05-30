<template>
  <DataTable
    :value="userData"
    scrollable
    scrollHeight="670px"
    paginator
    :rows="10"
    :rowsPerPageOptions="[10, 20, 50]"
  >
    <Column field="id" header="کد" />
    <Column field="name" header=" نام" />
    <Column field="userName" header="نام کاربری" />
    <Column field="mobile" header="موبایل" />
    <Column field="isActive" header="وضعیت">
      <template #body="slotProps">
        <span>
          {{ slotProps.data.isActive === 1 ? 'فعال' : 'غیرفعال' }}
        </span>
      </template>
    </Column>
    <Column field="allowTrade" header="مجوز معامله">
      <template #body="slotProps">
        <span>
          {{ slotProps.data.isActive === 1 ? 'فعال' : 'غیرفعال' }}
        </span>
      </template>
    </Column>
    <template #paginatorstart>
      تعداد کاربران لوده شده:
      {{ userData ? userData.length : 0 }}
    </template>
    <template #empty> دیتایی یافت نشد</template>
  </DataTable>
</template>

<script setup>
const props = defineProps({
  userData: {
    type: Array,
    required: true,
    default: () => [],
  },
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
