<template>
  <div class="p-4 bg-base rounded-lg">
    <div class="flex items-center justify-between">
      <div>
        <i class="fa fa-user text-sm ml-1" />
        <span>
          {{ userName }}
        </span>
      </div>
      <div class="flex items-start">
        <i class="fa fa-eye text-sm" v-if="isSeen" />
        <span class="text-sm mx-2">
          {{ dateTime.getDate(createdAt, 'hh:mm:ss - jYYYY/jMM/jDD') }}
        </span>
        <i class="fa fa-calendar-alt" />
      </div>
    </div>
    <div class="flex items-center my-2">
      <i class="fa fa-t text-sm ml-1" />
      <div>
        {{ title }}
      </div>
    </div>
    <div v-if="fileName.length">
      <img
        :src="`${apiUrl}/attachments/${fileName}`"
        class="w-full max-h-50 object-contain"
      >
    </div>
    <div class="flex items-center justify-end">
      <Button
        size="small"
        severity="info"
        label="دانلود"
        icon="fa fa-download"
        icon-pos="right"
        @click="download"
      />
      <i class="fa fa-check-circle text-green-500 text-2xl mr-3" v-if="isChecked" />
      <Button
        v-else
        size="small"
        icon="fa fa-check"
        outlined
        class="mr-2"
        @click="check"
      />
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const apiUrl = import.meta.env.VITE_SERVER_ATTACHMENTS_URL
const emit = defineEmits(['check'])

const props = defineProps({
  userName: {
    type: String,
    default: ''
  },
  createdAt: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  isChecked: {
    type: Boolean,
    default: false
  },
  isSeen: {
    type: Boolean,
    default: false
  },
  fileName: {
    type: String,
    default: ''
  },
  id: {
    type: Number,
    default: 0
  }
})

const dateTime = inject('dateTime')

const download = () => {
  window.open(`${apiUrl}/attachments/${props.fileName}`, '_blank')
}

const check = () => {
  emit('check', props.id)
}
</script>
