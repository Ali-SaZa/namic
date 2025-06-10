<template>
  <div class="w-full flex flex-col items-center justify-center">
    <div class="w-full md:w-[440px] mb-2 flex justify-end">
      <Button :disabled="loading"
              label="دریافت آخرین دیتا"
              severity="info"
              @click="getRemained" icon="fa-solid fa-refresh" />
      <template v-if="userId">
        <Button
          @click="back"
          icon="pi pi-arrow-left"
          severity="secondary"
          class="mr-2"
        />
      </template>
    </div>
    <div class="w-full md:w-[440px] rounded-lg bg-gray-50 p-4">
      <template v-if="loading">
        <div v-for="item in Array(2)" :key="item">
          <Skeleton class="w-full rounded-lg h-20 mb-2" height="55px" />
        </div>
      </template>
      <template v-else>
        <template v-if="paths.length">
          <a v-for="item in paths" :key="item.id"
             :href="item.path +'?'+ random()"
             target="_blank"
             download>
            <div class="rounded-lg bg-gray-200 p-2 mb-2 flex items-center gap-2 cursor-pointer">
              <i class="fa fa-file-pdf" />
              نمایش PDF کد
              {{ item.id }}
            </div>
          </a>
        </template>
        <template v-else>
          <p class="text-red-500 font-bold text-center">
            هیچ رکوردی یافت نشد!
          </p>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/userStore.js'
import { useRoute } from 'vue-router'
import Button from 'primevue/button'

const userStore = useUserStore()
const repository = inject('repository')
const route = useRoute()
const userId = ref(route.params.id)

const loading = ref(true)
const paths = ref([])

onMounted(() => {
  getRemained()
})

const getRemained = () => {
  loading.value = true
  const id = userId.value ? userId.value : userStore.id
  repository.getRemained({ userId: id }).then((response) => {
    const accountId = response.data.accountCodes
    repository.getAccountTurnover({ userId: id, accountId }).then((getAccountTurnoverResponse) => {
      paths.value = Object.values(getAccountTurnoverResponse.data.paths)
    }).finally(() => {
      loading.value = false
    })
  })
}

const random = () => {
  return Math.floor(Math.random() * 1000)
}

const back = () => {
  window.history.back()
}
</script>
