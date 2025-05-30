<template>
  <div class="w-full flex items-center justify-center">
    <div class="w-full md:w-[330px] shadow rounded-lg bg-gray-50 p-4">
      <label class="block text-sm font-medium text-right">رمز عبور فعلی</label>
      <IconField iconPosition="right">
        <InputIcon class="pi pi-lock" />
        <Password
          v-model="currentPassword"
          toggleMask
          :feedback="false"
          inputClass="w-full pl-10 text-sm md:text-base"
        />
      </IconField>
      <div class="my-2">
        <label class="block text-sm font-medium text-right">رمز عبور جدید</label>
        <IconField iconPosition="right">
          <InputIcon class="pi pi-lock" />
          <Password
            v-model="currentPassword"
            toggleMask
            :feedback="false"
            inputClass="w-full pl-10 text-sm md:text-base"
          />
        </IconField>
      </div>
      <label class="block text-sm font-medium text-right">تکرار رمز عبور جدید</label>
      <IconField iconPosition="right">
        <InputIcon class="pi pi-lock" />
        <Password
          v-model="currentPassword"
          toggleMask
          :feedback="false"
          inputClass="w-full pl-10 text-sm md:text-base"
        />
      </IconField>
      <Button label="تغییر رمز عبور" size="small" icon="fa fa-save" icon-pos="right"
              class="w-full mt-2" />
    </div>
  </div>
</template>

<script setup>

import { ref } from 'vue'

const currentPassword = ref('')
</script>
<style scoped>
:deep(.p-password) {
  width: 100%;
  position: relative;
}

:deep(.p-password-input) {
  width: 100%;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
}

:deep(.p-password-toggle) {
  position: absolute;
  left: 0.75rem;
  right: auto;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}
</style>
