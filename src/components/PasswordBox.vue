<template>
  <div class="p-4 bg-gray-50 w-full rounded">
    <label class="block text-sm font-medium text-right">ابتدا رمز عبور ادمین را وارد کنید</label>

    <form @submit="onSubmit">
      <IconField iconPosition="right">
        <InputIcon class="pi pi-lock" />
        <Password
          v-model="password"
          toggleMask
          :feedback="false"
          inputClass="w-full pl-10 text-sm md:text-base"
          :class="{ 'p-invalid': errors.password }"
        />
      </IconField>
      <small class="text-red-500 text-right block" v-if="errors.password">{{ errors.password
        }}</small>

      <Button
        type="submit"
        label="ثبت و ادامه"
        icon="fa fa-circle-check"
        icon-pos="right"
        class="w-full my-2 text-sm md:text-base"
        :disabled="isSubmitting"
      />
    </form>
  </div>
</template>

<script setup>
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import md5 from 'md5';

const emit = defineEmits(['submit'])

const validationSchema = toTypedSchema(
  z.object({
    password: z.string({
      required_error: 'رمز عبور الزامی است'
    }).min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد')
  })
)

const { handleSubmit, errors, defineField, isSubmitting } = useForm({
  validationSchema
})

const [password] = defineField('password')

const onSubmit = handleSubmit((values) => {
  const hashedPassword = values.password;
  emit('submit', hashedPassword);
}, (errors) => {
  console.log('Validation errors:', errors)
})

// })
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
