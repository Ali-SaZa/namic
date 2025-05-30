<template>
  <DataTable
    :value="sampleData"
    scrollable
    scrollHeight="670px"
    paginator
    :rows="10"
    :rowsPerPageOptions="[10, 20, 50]"
  >
    <Column header="تاریخ سند">
      <template #body="slotProps">
        {{
          slotProps.data.confirmationTime !== null
            ? slotProps.data.confirmationTime
            : slotProps.data.documentRegisterDate || slotProps.data.createdAt
        }}
      </template>
    </Column>

    <Column field="id" header="شماره سند" />
    <Column field="pd" header="نوع سند">
      <template #body="slotProps">
        <span>
          {{ slotProps.data.pd === -1 ? 'خرید' : 'فروش' }}
        </span>
      </template>
    </Column>
    <Column field="priceName" header="نام آیتم" />
    <Column field="fi" header="فی">
      <template #body="slotProps">
        <span v-format-number="slotProps.data.fi" />
      </template>
    </Column>
    <Column field="weight" header="تعداد|گرم">
      <template #body="slotProps">
        <span v-format-number="slotProps.data.weight + slotProps.data.count" />
      </template>
    </Column>
    <Column field="amount" header="مبلغ">
      <template #body="slotProps">
        <span v-format-number="slotProps.data.amount" />
      </template>
    </Column>
    <Column field="description" header="توضیحات" />
    <Column field="state" header="وضعیت">
      <template #body="slotProps">
        <span :class="getStatus(+slotProps.data.state).class">
          {{ getStatus(+slotProps.data.state).title }}
        </span>
      </template>
    </Column>
    <template #paginatorstart>
      تعداد درخواست لوده شده:
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
const getStatus = (state) => {
  {
    if (state === 3) {
      return {
        title: 'تایید',
        class: 'text-green-500',
      }
    } else if (state === 2) {
      return {
        title: 'رد',
        class: 'text-red-500',
      }
    } else if (state === 4) {
      return {
        title: 'دستی',
        class: 'text-blue-500',
      }
    } else if (state === 0) {
      return {
        title: 'بدون پاسخ',
        class: 'text-yellow-500',
      }
    } else {
      return {
        title: 'نامشخص',
        class: '',
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
