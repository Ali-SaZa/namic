<template>
  <div class="w-full flex justify-center relative">
    <div class="w-full md:w-[330px] rounded-lg bg-gray-50 p-4 flex items-center justify-between">
      <div>
        <i class="fa-solid fa-store"/>
        نام مجموعه (مغازه)
      </div>
      <div>
        {{ storeName }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue';

const storeName = ref('');
const repository = inject('repository');

onMounted(() => {
  repository.getAboutUs().then((response) => {
    if (response.data.state) {
      storeName.value = response.data.aboutus.storeName;
    }
  });
});

</script>

