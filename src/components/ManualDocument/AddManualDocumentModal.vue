<template>
  <Dialog
    v-model:visible="localVisible"
    modal
    :header="header"
    :style="{ width: '30rem' }"
    dir="rtl"
    :breakpoints="{ '1199px': '45vw', '575px': '80vw' }"
    :draggable="false"
  >
    <form @submit.prevent="handleFormSubmit" class="rounded-lg shadow bg-gray-50 p-4">
      <label class="block text-sm font-medium mb-1 text-right">فی</label>
      <IconField>
        <InputIcon class="fa fa-tag" />
        <InputNumber
          v-model="price"
          @update:modelValue="handlePriceInput"
          @input="handlePriceInput($event.value)"
          :invalid="!!errors.price"
          class="w-full"
          inputId="price"
          placeholder="مثلا: ۲۰.۰۰۰.۰۰۰"
          mode="decimal"
          :minFractionDigits="0"
          :maxFractionDigits="2"
        />
      </IconField>
      <small v-if="errors.price" class="text-red-500 text-right block mt-1">{{ errors.price
        }}</small>

      <!-- فیلدهای نوع ۱ -->
      <template v-if="props.type === 1">
        <label class="block text-sm font-medium mb-1 text-right mt-3">وزن</label>
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
            :maxFractionDigits="2"
          />
        </IconField>
        <small v-if="errors.amount" class="text-red-500 text-right block mt-1">{{ errors.amount
          }}</small>
      </template>

      <!-- فیلدهای نوع ۲ -->
      <template v-else>
        <label class="block text-sm font-medium mb-1 text-right mt-3">تعداد</label>
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
import { computed, nextTick, ref, watch } from 'vue'
import * as z from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'

const emit = defineEmits(['update:isOpen', 'submit'])
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  header: {
    type: String,
    default: ''
  },
  itemPrice: {
    type: Number,
    default: 0
  },
  type: {
    type: Number,
    default: 1
  },
  defaultValue: {
    type: Object,
    default: () => {}
  },
  rate: {
    type: Number,
    default: 1
  }
})
const isChangingAmount = ref(false)

// تعریف اسکیمای نوع ۱
const schemaType1 = z.object({
  price: z.number({ required_error: 'فی الزامی است', invalid_type_error: 'فی الزامی است' }).
    min(0, 'فی نمی‌تواند منفی باشد'),
  weight: z.number({ required_error: 'وزن الزامی است', invalid_type_error: 'وزن الزامی است' }).
    min(0, 'وزن نمی‌تواند منفی باشد'),
  amount: z.number({ required_error: 'مبلغ الزامی است', invalid_type_error: 'مبلغ الزامی است' }).
    min(0, 'مبلغ نمی‌تواند منفی باشد')
})

// تعریف اسکیمای نوع ۲
const schemaType2 = z.object({
  price: z.number({ required_error: 'فی الزامی است', invalid_type_error: 'فی الزامی است' }).
    min(0, 'فی نمی‌تواند منفی باشد'),
  count: z.number({ required_error: 'تعداد الزامی است', invalid_type_error: 'تعداد الزامی است' }).
    int('تعداد باید عدد صحیح باشد').
    min(1, 'تعداد باید حداقل ۱ باشد')
})

const { errors, handleSubmit, defineField, resetForm } = useForm({
  validationSchema: computed(() => {
    const schema = props.type === 1 ? schemaType1 : schemaType2
    return toTypedSchema(schema)
  }),
  initialValues: {
    price: props.itemPrice || 0
  }
})

watch(() => props.itemPrice, (newValue) => {
  if (newValue) {
    price.value = newValue
  }
})

const [price] = defineField('price')
const [weight] = defineField('weight')
const [amount] = defineField('amount')
const [count] = defineField('count')
const [description] = defineField('description')

const localVisible = computed({
  get: () => props.isOpen,
  set: (val) => {emit('update:isOpen', val)}
})

const handleFormSubmit = handleSubmit((values) => {
  emit('submit', {
    ...values,
    type: props.type
  })
})

const cancel = () => {
  localVisible.value = false
}

const handleRealTimeCalculation = () => {
  // محاسبه amount وقتی price یا weight تغییر می‌کند
  if (props.type === 1 && price.value !== null && weight.value !== null) {
    isChangingAmount.value = true
    amount.value = (price.value / props.rate) * weight.value
    nextTick(() => {
      isChangingAmount.value = false
    })
  }
}

const handlePriceInput = (value) => {
  price.value = value
  handleRealTimeCalculation()
}

const handleWeightInput = (value) => {
  weight.value = value
  handleRealTimeCalculation()
}

const handleAmountInput = (value) => {
  if (isChangingAmount.value) return
  amount.value = value
  if (props.type === 1 && value !== null && price.value !== null && price.value !== 0) {
    isChangingAmount.value = true
    weight.value = (value * props.rate) / price.value
    nextTick(() => {
      isChangingAmount.value = false
    })
  }
}

const resetOrderForm = () => {
  resetForm({
    values: {
      price: props.itemPrice || 0,
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
