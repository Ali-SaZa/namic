<template>
  <Dialog
    v-model:visible="localVisible"
    modal
    :style="{ width: '30rem' }"
    dir="rtl"
    :breakpoints="{ '1199px': '45vw', '575px': '80vw' }"
  >
    <template #header>
      <div class="flex items-center w-full font-bold text-xl gap-1">
        <TypeIcon :type="type" />
        {{ isBuy ? 'خرید' : 'فروش' }}
        {{ ' ' + itemName }}
      </div>
    </template>
    <form @submit.prevent="handleFormSubmit" class="rounded-lg shadow bg-gray-50 p-4">
      <!-- فیلدهای نوع ۱ -->
      <template v-if="props.type === 1">
        <label class="block text-sm font-medium mb-1 text-right">وزن</label>
        <IconField>
          <InputIcon class="fa fa-weight-hanging" />
          <InputNumber
            v-model="weight"
            @update:modelValue="handleWeightInput"
            @input="handleWeightInput($event.value)"
            :invalid="!!errors.weight"
            class="w-full"
            inputId="weight"
            placeholder="مثلا: ۲"
            mode="decimal"
            :minFractionDigits="0"
            :maxFractionDigits="3"
          />
        </IconField>
        <small v-if="errors.weight" class="text-red-500 text-right block mt-1">{{ errors.weight
          }}</small>

        <label class="block text-sm font-medium mb-1 text-right mt-3">مبلغ</label>
        <IconField>
          <InputIcon class="fa fa-money-bill-wave" />
          <InputNumber
            v-model="amount"
            @update:modelValue="handleAmountInput"
            @input="handleAmountInput($event.value)"
            :invalid="!!errors.amount"
            class="w-full"
            inputId="amount"
            placeholder="مثلا: ۲۰.۰۰۰.۰۰۰"
            mode="decimal"
            :minFractionDigits="0"
            :maxFractionDigits="0"
          />
        </IconField>
        <small v-if="errors.amount" class="text-red-500 text-right block mt-1">{{ errors.amount
          }}</small>
      </template>

      <!-- فیلدهای نوع ۲ -->
      <template v-else>
        <label class="block text-sm font-medium mb-1 text-right">تعداد</label>
        <IconField>
          <InputIcon class="fa fa-layer-group" />
          <InputNumber
            v-model="count"
            :invalid="!!errors.count"
            class="w-full"
            inputId="count"
            placeholder="مثلا: ۲"
            mode="decimal"
            :minFractionDigits="0"
            :maxFractionDigits="0"
          />
        </IconField>
        <small v-if="errors.count" class="text-red-500 text-right block mt-1">{{ errors.count
          }}</small>
      </template>

      <!-- فیلد مشترک توضیحات -->
      <label class="block text-sm font-medium mb-1 text-right mt-3">توضیحات</label>
      <IconField>
        <InputIcon class="fa fa-comment" />
        <InputText
          v-model="description"
          class="w-full"
          inputId="description"
          placeholder="مثلا: بسته بندی شود"
        />
      </IconField>

      <div class="flex items-center justify-between mt-2">
        <div class="flex items-center">
          <i class="fa-solid fa-arrow-down ml-1 text-sm" />
          حداقل
          <span class="mx-1 text-blue-500 font-bold">
            {{ min }}
          </span>
          {{ type === 1 ? 'گرم' : 'عدد' }}
        </div>
        <div class="flex items-center">
          <i class="fa-solid fa-arrow-up ml-1 text-sm" />
          حداکثر
          <span class="mx-1 text-red-500 font-bold">
            {{ max }}
          </span>
          {{ type === 1 ? 'گرم' : 'عدد' }}
        </div>
      </div>

      <!-- دکمه‌های اقدام -->
      <div class="flex justify-end gap-2 mt-4">
        <div class="flex gap-2 mt-2 items-center justify-end">
          <Button size="small" severity="warn" label="بستن" @click="cancel" icon="fa fa-cancel"
                  icon-pos="right" />
          <Button size="small" severity="info" label="ثبت و ادامه" @click="handleFormSubmit"
                  icon-pos="right"
                  icon="fa fa-check-circle" />
        </div>
      </div>
    </form>
  </Dialog>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import * as z from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import TypeIcon from '@/components/TypeIcon.vue'

const emit = defineEmits(['update:isOpen', 'submit', 'cancel'])
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  header: {
    type: String,
    default: ''
  },
  type: {
    type: Number,
    default: 1
  },
  price: {
    type: Number,
    required: true
  },
  isBuy: {
    type: Boolean,
    default: true
  },
  defaultValue: {
    type: Object,
    default: () => {}
  },
  rate: {
    type: Number,
    default: 1
  },
  itemName: {
    type: String,
    default: ''
  },
  min: {
    type: Number,
    default: 1
  },
  max: {
    type: Number,
    default: 1
  }
})
const isChangingAmount = ref(false)

const schema = computed(() => {
  if (props.type === 1) {
    return z.object({
      weight: z.number({ required_error: 'وزن الزامی است', invalid_type_error: 'وزن الزامی است' }).
        min(props.min, 'وزن باید حداقل ' + props.min + ' باشد').
        max(props.max, 'وزن باید حداکثر ' + props.max + ' باشد'),
      amount: z.number({ required_error: 'مبلغ الزامی است', invalid_type_error: 'مبلغ الزامی است' }).
        min(0, 'مبلغ نمی‌تواند منفی باشد')
    })
  } else {
    return z.object({
      count: z.number({ required_error: 'تعداد الزامی است', invalid_type_error: 'تعداد الزامی است' }).
        int('تعداد باید عدد صحیح باشد').
        min(props.min, 'تعداد باید حداقل ' + props.min + ' باشد').
        max(props.max, 'تعداد باید حداکثر ' + props.max + ' باشد')
    })
  }
})

const { errors, handleSubmit, defineField, resetForm } = useForm({
  validationSchema: computed(() => {
    return toTypedSchema(schema.value)
  })
})

const [weight] = defineField('weight')
const [amount] = defineField('amount')
const [count] = defineField('count')
const [description] = defineField('description')

const localVisible = computed({
  get: () => props.isOpen,
  set: (val) => {emit('update:isOpen', val)}
})

const handleFormSubmit = handleSubmit((values) => {
  console.log('description:', description.value)
  console.log('values:', values)
  emit('submit', { ...values, description: description.value ? description.value : '', type: props.type })
})

const cancel = () => {
  emit('cancel')
}

const handleRealTimeCalculation = () => {
  if (props.type === 1 && props.price !== null && weight.value !== null) {
    isChangingAmount.value = true
    amount.value = (props.price / props.rate) * weight.value
    nextTick(() => {
      isChangingAmount.value = false
    })
  }
}

const handleWeightInput = (value) => {
  weight.value = value
  handleRealTimeCalculation()
}

const handleAmountInput = (value) => {
  if (isChangingAmount.value) return
  amount.value = value
  if (props.type === 1 && value !== null && props.price !== null && props.price !== 0) {
    isChangingAmount.value = true
    weight.value = (value * props.rate) / props.price
    nextTick(() => {
      isChangingAmount.value = false
    })
  }
}

const resetOrderForm = () => {
  console.log('resetOrderForm: in co')
  resetForm({
    values: {
      weight: null,
      amount: null,
      count: null,
      description: ''
    }
  })
}

defineExpose({
  resetOrderForm
})
</script>
