<template>
  <div class="w-full flex items-center justify-center">
    <div class="w-full md:w-[330px] rounded-lg bg-gray-50 p-4">
      <template v-if="loading">
        <div v-for="item in Array(6)" :key="item">
          <Skeleton class="w-full rounded-lg h-20 mb-2" height="55px" />
        </div>
      </template>
      <template v-else>
        <template v-if="message.length">
          <p class="text-red-500 font-bold text-center">
            {{ message }}
          </p>
        </template>
        <template v-else>
          <div class="flex flex-col items-center gap-2">
            <div class="w-full flex justify-start">
              <FileUpload accept="image/*" auto chooseLabel="تصویر کارت ملی"
                          customUpload mode="basic"
                          @select="(e) => onFileSelect(e, 1)" />
            </div>
            <img v-if="src1" :src="src1" alt="Image" class="shadow-md rounded-xl w-20 h-20"
                 style="filter: grayscale(100%)" />
            {{ src1Name }}
          </div>
          <div class="flex flex-col items-center gap-2 mt-2">
            <div class="w-full flex justify-start">
              <FileUpload accept="image/*" auto chooseLabel="تصویر پشت کارت ملی"
                          customUpload mode="basic"
                          @select="(e) => onFileSelect(e, 2)" />
            </div>
            <img v-if="src2" :src="src2" alt="Image" class="shadow-md rounded-xl w-20 h-20"
                 style="filter: grayscale(100%)" />
            {{ src2Name }}
          </div>
          <div class="flex flex-col items-center gap-2 mt-2">
            <div class="w-full flex justify-start">
              <FileUpload accept="image/*" auto chooseLabel="تصویر صفحه اول شناسنامه"
                          customUpload mode="basic"
                          @select="(e) => onFileSelect(e, 3)" />
            </div>
            <img v-if="src3" :src="src3" alt="Image" class="shadow-md rounded-xl w-20 h-20"
                 style="filter: grayscale(100%)" />
            {{ src3Name }}
          </div>
          <div class="flex flex-col items-center gap-2 mt-2">
            <div class="w-full flex justify-start">
              <FileUpload accept="image/*" auto chooseLabel="تصویر جواز کسب"
                          customUpload mode="basic"
                          @select="(e) => onFileSelect(e, 4)" />
            </div>
            <img v-if="src4" :src="src4" alt="Image" class="shadow-md rounded-xl w-20 h-20"
                 style="filter: grayscale(100%)" />
            {{ src4Name }}
          </div>
          <Button
            class="w-full mt-2"
            icon="fa fa-save"
            icon-pos="right"
            label="ذخیره فایل‌ها"
            size="small"
            @click="submitFiles"
          />
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/userStore.js'
import { useToast } from 'primevue/usetoast'

const userStore = useUserStore()
const repository = inject('repository')
const toast = useToast()

const message = ref('')
const loading = ref(true)
const src1 = ref(null)
const src1Name = ref('')
const src1File = ref(null) // اضافه شده برای ذخیره فایل باینری
const src2 = ref(null)
const src2Name = ref('')
const src2File = ref(null) // اضافه شده برای ذخیره فایل باینری
const src3 = ref(null)
const src3Name = ref('')
const src3File = ref(null) // اضافه شده برای ذخیره فایل باینری
const src4 = ref(null)
const src4Name = ref('')
const src4File = ref(null) // اضافه شده برای ذخیره فایل باینری

onMounted(() => {
  getAuthenticationStatus()
})

function onFileSelect(event, fileNumber) {
  console.log('event:', event)
  const file = event.files[0]
  const reader = new FileReader()

  reader.onload = async (e) => {
    switch (fileNumber) {
      case 1:
        src1.value = e.target.result
        src1Name.value = file.name
        src1File.value = file // ذخیره فایل باینری
        break
      case 2:
        src2.value = e.target.result
        src2Name.value = file.name
        src2File.value = file // ذخیره فایل باینری
        break
      case 3:
        src3.value = e.target.result
        src3Name.value = file.name
        src3File.value = file // ذخیره فایل باینری
        break
      case 4:
        src4.value = e.target.result
        src4Name.value = file.name
        src4File.value = file // ذخیره فایل باینری
        break
    }
  }

  reader.readAsDataURL(file)
}

const getAuthenticationStatus = () => {
  repository.getAuthenticationStatus({ userId: userStore.id }).then((response) => {
    console.log(response)
    if (response.data.state) {
      message.value = response.data.msg
    }
  }).finally(() => {
    loading.value = false
  })
}

const submitFiles = async () => {
  try {
    // اعتبارسنجی که همه فایل‌ها آپلود شده باشند
    if (!src1File.value || !src2File.value || !src3File.value || !src4File.value) {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        detail: 'لطفاً همه تصاویر مورد نیاز را آپلود کنید',
        life: 3000
      })
      return
    }

    const formData = new FormData()
    formData.append('userId', userStore.id)

    // اضافه کردن فایل‌ها به صورت باینری
    formData.append('file1', src1File.value, src1Name.value)
    formData.append('file2', src2File.value, src2Name.value)
    formData.append('file3', src3File.value, src3Name.value)
    formData.append('file4', src4File.value, src4Name.value)

    const response = await repository.addAuthentication(formData)
    if (response.data.state) {
      message.value = response.data.msg
      toast.add({
        severity: 'success',
        summary: 'موفق',
        detail: 'فایل‌ها با موفقیت ارسال شدند',
        life: 3000
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        detail: response.data.msg,
        life: 3000
      })
    }
  } catch (error) {
    console.error('Error submitting files:', error)
    toast.add({
      severity: 'error',
      summary: 'خطا',
      detail: 'خطا در ارسال فایل‌ها',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}
</script>
