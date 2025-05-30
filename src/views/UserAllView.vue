<template>
  <div class="grid grid-cols-1 gap-y-4 lg:gap-y-0 lg:gap-x-8 lg:grid-cols-4">
    <div class="col-span-1">
      <div class="rounded-lg shadow bg-gray-50 p-4">
        <ButtonGroup class="w-full">
          <Button
            label="ادمین"
            size="small"
            :severity="filteredType === 1 ? 'info' : 'secondary'"
            @click="filteredType = 1"
            class="min-w-1/4"
          />
          <Button
            label="اپراتور"
            size="small"
            :severity="filteredType === 2 ? 'info' : 'secondary'"
            @click="filteredType = 2"
            class="min-w-1/4"
          />
          <Button
            label="حسابدار"
            size="small"
            :severity="filteredType === 3 ? 'info' : 'secondary'"
            @click="filteredType = 3"
            class="min-w-1/4"
          />
          <Button
            label="مشتری"
            size="small"
            :severity="filteredType === 4 ? 'info' : 'secondary'"
            @click="filteredType = 4"
            class="min-w-1/4"
          />
        </ButtonGroup>

        <label class="block text-sm font-medium mt-4 text-right">گروه حساب</label>
        <div class="flex justify-between w-full">
          <Select
            v-model="selectedAccountGroup"
            :options="accountGroup"
            optionLabel="name"
            class="w-full"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center">
                <i :class="slotProps.value.icon" />
                <div class="mr-1">{{ slotProps.value.name }}</div>
              </div>
            </template>
            <template #option="slotProps">
              <div class="flex items-center w-full" dir="rtl">
                <i :class="slotProps.option.icon" />
                <div class="mr-1">{{ slotProps.option.name }}</div>
              </div>
            </template>
          </Select>
          <Button
            @click="groupManagementDialogIsOpen = true"
            icon="fa-solid fa-plus"
            severity="success"
            class="min-w-10 mr-2"
          />
        </div>
      </div>
    </div>
    <div
      class="col-span-1 lg:col-span-3 shadow w-full min-h-20 flex flex-col rounded-lg bg-gray-50 p-4"
    >
      <div class="text-left">
        <PrintButton class="min-w-11 mr-2" />
      </div>
      <UserTable :userData="usersData" class="mt-2" />
    </div>
    <GroupManagementModal
      v-model:isOpen="groupManagementDialogIsOpen"
      @refresh="getAccountGroups"
    />
  </div>
</template>

<script setup>
import { ref, inject, onMounted, watch } from 'vue'
import GroupManagementModal from '@/components/GroupManagementModal.vue'
import UserTable from '@/components/Tables/UserTable.vue'
import PrintButton from '@/components/PrintButton.vue'

const filteredType = ref(4)
const selectedAccountGroup = ref({ id: 'all', name: 'همه گروه ها' })
const accountGroup = ref([])
const groupManagementDialogIsOpen = ref(false)
const repository = inject('repository')
const isLoading = ref(false)
const usersData = ref([])

const getAccountGroups = async () => {
  try {
    const response = await repository.getUserGroupList()

    if (response) {
      accountGroup.value = [{ id: 'all', name: 'همه گروه ها' }, ...response.data.userGroup]
    }
  } catch (error) {
    console.log(error, 'Error on getAccountGroups')
  } finally {
    groupManagementDialogIsOpen.value = false
  }
}

const getAllUsers = async () => {
  isLoading.value = true
  try {
    const payload = {
      userType: filteredType.value,
    }

    if (selectedAccountGroup.value.id !== 'all') {
      payload.userGroupId = selectedAccountGroup.value.id
    }

    const response = await repository.getAllUsersData(payload)

    if (response) {
      usersData.value = response.data.users
    }
  } catch (error) {
    console.log(error, 'Error on getAllUsers')
  } finally {
    isLoading.value = false
  }
}

watch([filteredType, selectedAccountGroup], () => {
  getAllUsers()
})

onMounted(() => {
  getAllUsers()
  getAccountGroups()
})
</script>

<style></style>
