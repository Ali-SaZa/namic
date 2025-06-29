<template>
  <DataTable
    :value="data"
    scrollable
    scrollHeight="670px"
    paginator
    :rows="10"
    :rowsPerPageOptions="[10, 20, 50]"
  >
    <Column field="isSeen" header="مشاهده" v-if="adminSettingsStore.settings.showTick">
      <template #body="slotProps">
        <span>
          <Checkbox
            inputId="is-seen"
            :binary="true"
            :modelValue="slotProps.data.isSeen === 1"
            @update:modelValue="(val) => isSeenChanged(val, slotProps.data)"
          />
        </span>
      </template>
    </Column>
    <Column field="createdAt" header="تاریخ">
      <template #body="slotProps">
        <span>
          {{ dateTime.getDate(slotProps.data.createdAt, 'jYYYY/jMM/jDD', null, true) }}
        </span>
      </template>
    </Column>
    <Column field="id" header="شماره سند" />
    <Column field="userName" header="نام مشتری" />
    <Column field="pd" header="نوع سند">
      <template #body="slotProps">
        <span>
          {{ slotProps.data.pd === -1 ? 'خرید' : 'فروش' }}
        </span>
      </template>
    </Column>
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
    <Column field="customerMsg" header="توضیحات" />
    <Column field="state" header="وضعیت">
      <template #body="slotProps">
        <span :class="getStatus(+slotProps.data.state).class">
          {{ getStatus(+slotProps.data.state).title }}
        </span>
        <span class="block">
          {{ slotProps.data.registrarName }}
        </span>
      </template>
    </Column>
    <Column field="sum" header="جمع">
      <template #body="slotProps">
        <span
          v-format-number="slotProps.data.weight + slotProps.data.count"
          v-if="slotProps.data.pd === -1"
        />
        <span
          v-else
          v-format-number="(slotProps.data.weight + slotProps.data.count) * -1"
          dir="ltr"
        />
      </template>
    </Column>
    <template #paginatorstart>
      تعداد اسناد لوده شده:
      {{ data ? data.length : 0 }}
    </template>
    <template #empty> دیتایی یافت نشد</template>
  </DataTable>
</template>

<script setup>
import { inject } from 'vue'
import { useUserStore } from '@/stores/userStore.js'
import { useAdminSettingsStore } from '@/stores/adminSettings'

const dateTime = inject('dateTime')
const repository = inject('repository')
const userStore = useUserStore()
const adminSettingsStore = useAdminSettingsStore()

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  }
})

const getStatus = (state) => {
  {
    if (state === 3) {
      return {
        title: 'تایید',
        class: 'text-green-500'
      }
    } else if (state === 2) {
      return {
        title: 'رد',
        class: 'text-red-500'
      }
    } else if (state === 4) {
      return {
        title: 'دستی',
        class: 'text-blue-500'
      }
    } else {
      return {
        title: 'نامشخص',
        class: ''
      }
    }
  }
}

const isSeenChanged = async (val, data) => {
  try {
    await repository.updateIsSeen({
      userType: userStore.type,
      reqId: data.id,
      isSeen: val === true ? 1 : 0
    })
  } catch (error) {
    console.log(error, 'Error on change isSeen')
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
