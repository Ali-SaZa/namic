<template>
  <div class="w-full flex items-center justify-center">
    <div class="w-full md:w-[500px] rounded-lg bg-gray-50 p-4">
      <div>
        <label class="block text-sm text-right">مقدمه</label>
        <Textarea
          v-model="introduction"
          autoResize
          rows="3"
          cols="20"
          placeholder="مقدمه(پیشگفتار)"
          class="mt-1 w-full"
        />
      </div>
      <div>
        <label class="block text-sm text-right">معرفی و توضیحات مجموعه</label>
        <Textarea
          v-model="information"
          autoResize
          rows="3"
          cols="20"
          placeholder="معرفی و توضیحات مجموعه"
          class="mt-1 w-full"
        />
      </div>
      <div
        class="border border-gray-200 rounded-lg p-2 bg-gray-100 mt-2"
        v-for="(role, index) in roles"
        :key="index"
      >
        <label class="block text-sm text-right">
          عنوان
          {{ index + 1 }}
        </label>
        <IconField>
          <InputIcon class="fa fa-t" />
          <InputText
            v-model="role.title"
            class="w-full"
            :placeholder="'عنوان ' + (index + 1)"
            type="text"
          />
        </IconField>
        <label class="block text-sm text-right mt-2">
          توضیحات
          {{ index + 1 }}
        </label>
        <Textarea
          v-model="role.description"
          autoResize
          rows="3"
          cols="20"
          :placeholder="'توضیحات ' + (index + 1)"
          class="mt-1 w-full"
        />

        <div v-if="index > 0" class="text-left">
          <Button
            icon="fa-solid fa-trash"
            severity="danger"
            rounded
            size="small"
            @click="removeItem('role', index)"
            variant="outlined"
          />
        </div>
      </div>
      <Button
        label="افزودن قانون جدید"
        size="small"
        icon="fa fa-square-plus"
        icon-pos="right"
        severity="info"
        @click="addRole"
        class="w-full mt-2"
      />
      <div
        class="border border-gray-200 rounded-lg p-2 bg-gray-100 mt-2"
        v-for="(tip, index) in tips"
        :key="index"
      >
        <label class="block text-sm text-right">
          نکته (مهم)
          {{ index + 1 }}
        </label>
        <Textarea
          v-model="tips[index]"
          autoResize
          rows="3"
          cols="20"
          :placeholder="'نکته (مهم) ' + (index + 1)"
          class="mt-1 w-full"
        />

        <div v-if="index > 0" class="text-left">
          <Button
            icon="fa-solid fa-trash"
            severity="danger"
            rounded
            size="small"
            @click="removeItem('tip', index)"
            variant="outlined"
          />
        </div>
      </div>
      <Button
        label="افزودن نکته (مهم)"
        size="small"
        icon="fa fa-square-plus"
        icon-pos="right"
        severity="info"
        @click="addTip"
        class="w-full mt-2"
      />

      <Button
        label="ثبت و ذخیره قوانین"
        size="small"
        icon="fa fa-square-plus"
        icon-pos="right"
        severity="primary"
        @click="saveTerms"
        class="w-full mt-8"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useToast } from 'primevue/usetoast'

const repository = inject('repository')
const toast = useToast()

const introduction = ref('')
const information = ref('')
const version = ref(0)
const roles = ref([
  {
    title: '',
    description: '',
  },
])
const tips = ref([''])

const addRole = () => {
  roles.value.push({
    title: '',
    description: '',
  })
}

const removeItem = (type, index) => {
  if (type === 'role') roles.value.splice(index, 1)
  else tips.value.splice(index, 1)
}

const addTip = () => {
  tips.value.push('')
}

const payload = computed(() => ({
  version: version.value,
  introduction: introduction.value.trim(),
  information: information.value.trim(),
  rules: roles.value
    .filter((r) => r.title || r.description)
    .map((r) => ({
      title: r.title.trim(),
      description: r.description.trim(),
    })),
  tips: tips.value.map((t) => t.trim()).filter(Boolean),
}))

const saveTerms = async () => {
  try {
    const response = await repository.updateTerms({
      terms: JSON.stringify(payload.value),
    })
    if (response.state) {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: 'شرایط و قوانین با موفقیت اضافه شدند',
      })
    } else {
      toast.add({
        severity: 'warn',
        summary: 'خطا',
        life: 3000,
        detail: response.data.msg,
      })
    }
  } catch (error) {
    console.log(error, 'Error')
  } finally {
    introduction.value = ''
    information.value = ''
    version.value = 0
    roles.value = [
      {
        title: '',
        description: '',
      },
    ]
    tips.value = ['']
  }
}
</script>
<style scoped></style>
