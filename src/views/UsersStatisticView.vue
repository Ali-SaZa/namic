<template>
  <div class="grid grid-cols-1 gap-y-4 lg:gap-y-0 lg:gap-x-8 lg:grid-cols-4">
    <div class="col-span-1">
      <div class="rounded-lg shadow border border-blue-400 p-4 bg-gray-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 font-bold text-blue-500">
            <i class="pi pi-users"></i>
            کاربران فعال
          </div>
          <div class="font-bold text-xl flex items-center gap-2 text-blue-500">
            {{ activeUsers.length }}
            <Button
              @click="showActiveUsers = !showActiveUsers"
              :icon="showActiveUsers ? 'pi pi-angle-up' : 'pi pi-angle-down'"
              size="small"
              severity="secondary"
              variant="outlined"
              class=""
              rounded
            />
          </div>
        </div>
        <div class="flex items-center flex-col gap-1 px-2 mt-2" v-if="showActiveUsers">
          <div
            class="flex items-center justify-between w-full"
            v-for="user in activeUsers"
            :key="user.id"
          >
            <div>{{ user.name }}</div>
            <div>{{ user.successCount }}</div>
          </div>
        </div>
      </div>
      <div class="rounded-lg shadow border border-red-400 bg-gray-100 p-4 mt-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 font-bold text-red-500">
            <i class="pi pi-users"></i>
            کاربران غیرفعال
          </div>
          <div class="font-bold text-xl flex items-center gap-2 text-red-500">
            {{ inActiveUsers.length }}
            <Button
              @click="showInactiveUsers = !showInactiveUsers"
              :icon="showInactiveUsers ? 'pi pi-angle-up' : 'pi pi-angle-down'"
              size="small"
              severity="secondary"
              variant="outlined"
              class=""
              rounded
            />
          </div>
        </div>
        <div class="flex items-center flex-col gap-1 px-2 mt-2" v-if="showInactiveUsers">
          <div
            class="flex items-center justify-between w-full"
            v-for="user in inActiveUsers"
            :key="user.id"
          >
            <div>{{ user.name }}</div>
            <div>{{ user.successCount }}</div>
          </div>
        </div>
      </div>

      <div class="rounded-lg shadow bg-gray-50 p-4 mt-2">
        <div class="font-bold text-yellow-500">
          <i class="fa-solid fa-circle-info" />
          راهنما
        </div>
        <p class="text-sm/6 mt-1 line-h">
          وزن خرید و فروش شامل مجموع <br /><span class="font-bold"
            >اوزان آیتم های گرمی + اوزان آیتم های تعدادی</span
          ><br />می باشد
        </p>
        <p class="mt-2">
          مشتریانی که میزان خرید آن ها بیشتر باشد <span class="font-bold">خریدار</span> و میزان فروش
          آن بیشتر باشد <span class="font-bold">فروشنده</span> تلقی میشود
        </p>
        <p class="mt-2">
          مشتریانی که تعداد اسناد ثبت شده دستی آن ها از درخواست های ثبت شده آن ها بیشتر باشند
          <span class="font-bold">تلفنی</span> تلقی می شوند
        </p>
      </div>
    </div>

    <div v-if="!isLoading" class="col-span-1 lg:col-span-3">
      <div class="shadow w-full min-h-20 flex flex-col rounded-lg bg-gray-50 p-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <UserStatisticCard v-for="user in activeUsers" :user="user" class="col-span-1" />
        </div>
      </div>
    </div>

    <div v-else class="col-span-3">
      <div class="shadow w-full min-h-20 flex flex-col rounded-lg bg-gray-50 p-4">
        <div v-for="item in Array(1)" class="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">
          <Skeleton class="w-full rounded-lg" height="14rem" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import UserStatisticCard from '@/components/UserStatisticCard.vue'

const showActiveUsers = ref(true)
const showInactiveUsers = ref(true)
const repository = inject('repository')
const isLoading = ref(false)
const activeUsers = ref([])
const inActiveUsers = ref([])

const getUsersStatistics = async () => {
  isLoading.value = true
  try {
    const response = await repository.getUsersStatistics({
      pageNo: 0,
    })

    if (response) {
      activeUsers.value = response.data.usersStatistics.filter((user) => user.successCount >= 2)
      inActiveUsers.value = response.data.usersStatistics.filter((user) => user.successCount < 2)
    }
  } catch (error) {
    console.log(error, 'Error on getUsersStatistics')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  getUsersStatistics()
})
</script>

<style></style>
