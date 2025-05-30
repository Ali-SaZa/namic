<template>
  <div v-if="!isCorrectPassword" class="flex items-center justify-center w-full">
    <div class="w-sm shadow">
      <PasswordBox @submit="submitAdminPassword" />
    </div>
  </div>

  <div v-else class="grid grid-cols-8 gap-y-4 md:gap-y-0 md:gap-x-8 mb-8">
    <div class="col-span-8 lg:col-span-2 rounded-lg bg-gray-50 p-4 max-h-35">
      <div class="bg-gray-200 p-2 flex items-center justify-center rounded">
        <i class="fa-solid fa-database ml-2"></i>
        <div>پشتیبان گیری اطلاعات</div>
      </div>
      <div class="text-sm mt-2 font-bold">مورخه {{ formattedDateTime }}</div>
      <Button
        class="w-full mt-2"
        size="small"
        severity="primary"
        label="شروع پشتیبان گیری از اطلاعات"
        icon-pos="right"
        icon="fa-solid fa-floppy-disk"
      />
    </div>

    <div class="col-span-8 lg:col-span-2 rounded-lg bg-gray-50 p-4 max-h-70 text-sm font-bold">
      <div class="bg-gray-200 p-2 flex items-center justify-center rounded">
        <i class="fa-solid fa-trash ml-2"></i>
        <div>حذف اطلاعات</div>
      </div>
      <div class="mt-2 font-bold text-sm">
        توجه داشته باشید که کلید حذف اطلاعات، تمامی اطلاعات شما را حذف و غیرقابل بازگشت می کند.
      </div>
      <div class="mt-1 font-bold text-sm">
        تبعات این مورد بر عهده شما بوده و شخص ارائه دهنده سرویس هیچ مسئولیتی در قبال این امر ندارد.
      </div>

      <Button
        class="w-full mt-2"
        size="small"
        severity="danger"
        label="حذف تمامی اطلاعات"
        icon-pos="right"
        icon="fa-solid fa-circle-exclamation"
      />
    </div>

    <div class="col-span-8 lg:col-span-2 rounded-lg bg-gray-50 p-4 max-h-70 text-sm font-bold">
      <div class="bg-gray-200 p-2 flex items-center justify-center rounded">
        <i class="fa-solid fa-file-zipper ml-2"></i>
        <div>آرشیو اطلاعات</div>
      </div>
      <div class="mt-2">
        ایجاد آرشیو از اطلاعات به منظور ذخیره داده های فعلی شامل تمامی اطلاعات محیط فعلی (مشتریان،
        درخواست ها، آیتم ها و ...) می باشد.
      </div>
      <div class="mt-1">
        سپس محیط فعلی خالی می شود تا بتوانید برای شروع مجدد از سیستم استفاده کنید.
      </div>

      <Button
        class="w-full mt-2"
        size="small"
        severity="primary"
        label="ایجاد آرشیو از اطلاعات از اطلاعات"
        icon-pos="right"
        icon="fa-solid fa-box-archive"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import PasswordBox from '@/components/PasswordBox.vue'

import { useUserStore } from '@/stores/userStore.js'

const userStore = useUserStore()
const isCorrectPassword = ref(false)
const repository = inject('repository')

const dateTime = inject('dateTime')
const now = dateTime.now()
const formattedDateTime = dateTime.getFaDateTime(now)

const submitAdminPassword = async (password) => {
  isCorrectPassword.value = true
  // try {
  //   const response = await repository.checkBackupPass({
  //     token: userStore.token,
  //   })

  //   if (response) {
  //     console.log('entered pass' , password);
  //     console.log('server pass',response.data.pass);

  //   }
  // } catch (error) {
  //   console.log(error, 'Error on submitAdminPassword')
  // }
}
</script>
