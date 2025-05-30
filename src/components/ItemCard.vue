<template>
  <div
    class="p-4 bg-base rounded-lg"
    :class="item.hasRegistered ? 'border-r-3 border-green-500' : ''"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <TypeIcon :type="item.priceType" />
        <div class="text-lg mx-2 font-bold">{{ item.priceName }}</div>
        <div :class="item.pd === -1 ? 'text-green-500' : 'text-red-500'">
          {{ item.pd === -1 ? 'خرید' : 'فروش' }}
        </div>
      </div>
      <div :class="getStatus(item.state).class" class="text-lg">
        {{ getStatus(item.state).title }}
      </div>
    </div>

    <div class="flex items-center justify-between text-xs mt-2">
      <div>
        <i class="fa fa-user" />
        وزن
      </div>
      <div class="font-bold">
        {{ item.weight }}
      </div>
      <div>گرم</div>
    </div>

    <template v-if="item.count">
      <div class="grid grid-cols-3 justify-between text-xs mt-2">
        <div>
          <i class="fa fa-window-restore" />
          تعداد
        </div>
        <div class="text-center" v-format-number="item.count" />
        <div class="text-left">عدد</div>
      </div>
    </template>

    <div class="grid grid-cols-3 justify-between text-xs mt-2">
      <div>
        <i class="fa fa-tag" />
        فی
      </div>
      <div class="text-center font-bold" v-format-number="item.fi" />
      <div class="text-left">ریال</div>
    </div>

    <div class="grid grid-cols-3 justify-between text-xs mt-2">
      <div>
        <i class="fa fa-money-bill-1" />
        مبلغ کل
      </div>
      <div class="text-center font-bold">
        {{ (+item.fi * item.weight).toLocaleString('fa-IR') }}
      </div>
      <div class="text-left">ریال</div>
    </div>

    <div class="grid grid-cols-3 justify-between text-xs mt-2" v-if="item.customerMsg">
      <div>
        <i class="fa fa-money-bill-1" />
        توضیحات
      </div>
      <div class="text-center">
        {{ item.customerMsg }}
      </div>
    </div>
    <div class="flex items-center justify-between text-xs mt-2">
      <div>
        <i class="fa fa-calendar-days" />
        {{ dateTime.getDate(item.createdAt, 'jYYYY/jMM/jDD', null, true) }}
      </div>
      <div v-if="item.state !== 4">
        <Button
          @click="editDialogIsOpen = true"
          icon="fa-solid fa-edit"
          severity="info"
          rounded
          size="small"
          variant="outlined"
        />
        <Button
          @click="deleteDialogIsOpen = true"
          icon="fa-solid fa-trash"
          severity="danger"
          rounded
          size="small"
          variant="outlined"
          class="mr-2"
        />
      </div>
    </div>

    <template v-if="item.hasRegistered">
      <div class="grid grid-cols-2 justify-between text-xs mt-2">
        <div class="flex items-center">
          <div>شماره فاکتور:</div>
          <div class="text-center">0</div>
        </div>
        <div class="flex items-center justify-end">
          <div>شماره ردیف سند:</div>
          <div class="text-center">0</div>
        </div>
      </div>
    </template>

    <Dialog
      v-model:visible="editDialogIsOpen"
      modal
      :style="{ width: '30rem' }"
      dir="rtl"
      :breakpoints="{ '1199px': '45vw', '575px': '80vw' }"
    >
      <template #header>
        <div class="flex items-center w-full font-bold text-xl gap-1">
          <TypeIcon :type="item.priceType" />
          {{ item.priceName }}
        </div>
      </template>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-user"></i>
          {{ item.userName }}
        </div>
        <div class="flex items-center gap-2">
          {{ item.id }}
          <i class="fa-solid fa-file"></i>
        </div>
      </div>
      <div class="flex items-center flex-col mt-4">
        <div class="flex items-center justify-between w-full text-sm">
          <label class="block text-sm font-medium mb-1 text-right">فی | مظنه</label>
          <div>
            فی سند :
            <span v-format-number="item.fi" />
          </div>
        </div>
        <div class="w-full">
          <IconField>
            <InputIcon class="fa fa-tag" />
            <InputNumber
              v-model="price"
              @update:modelValue="handlePriceInput"
              @input="handlePriceInput($event.value)"
              :invalid="!!errors.fi"
              class="w-full"
              inputId="price"
              placeholder="مثلا: ۲۰.۰۰۰.۰۰۰"
              mode="decimal"
              :minFractionDigits="0"
              :maxFractionDigits="2"
            />
          </IconField>
          <small v-if="errors.fi" class="text-red-500 text-right block mt-1">{{ errors.fi }}</small>
        </div>
        <template v-if="item.priceType === 1">
          <div class="flex items-center justify-between w-full text-sm mt-2">
            <label class="block text-sm font-medium mb-1 text-right">وزن</label>
            <div>وزن سند : {{ item.weight }}</div>
          </div>
          <div class="w-full">
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
            <small v-if="errors.weight" class="text-red-500 text-right block mt-1">{{
              errors.weight
            }}</small>
          </div>
          <div class="flex items-center justify-between w-full text-sm mt-2">
            <label class="block text-sm font-medium mb-1 text-right">مبلغ</label>
            <div>
              مبلغ سند :
              <span v-format-number="item.fi / (4.3318 * item.weight)"> </span>
            </div>
          </div>
          <div class="w-full">
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
            <small v-if="errors.amount" class="text-red-500 text-right block mt-1">{{
              errors.amount
            }}</small>
          </div>
        </template>
        <template v-else>
          <div class="flex items-center justify-between w-full text-sm mt-2">
            <label class="block text-sm font-medium mb-1 text-right">تعداد</label>
            <div>تعداد سند : {{ item.count }}</div>
          </div>
          <div class="w-full">
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
            <small v-if="errors.count" class="text-red-500 text-right block mt-1">{{
              errors.count
            }}</small>
          </div>
        </template>
        <div class="flex items-center w-full text-sm mt-2">
          <label class="block text-sm font-medium mb-1 text-right">توضیحات</label>
        </div>
        <div class="w-full">
          <IconField>
            <InputIcon class="fa fa-comment" />
            <InputText
              v-model="customerMsg"
              class="w-full"
              inputId="customerMsg"
              placeholder="مثلا: بسته بندی شود"
            />
          </IconField>
        </div>
      </div>
      <div class="mt-2 text-left flex gap-2 justify-end">
        <Button
          size="small"
          label="بستن"
          icon="fa fa-cancel"
          icon-pos="right"
          @click="editDialogIsOpen = false"
          severity="warn"
        />
        <Button
          type="submit"
          @click="handleFormSubmit"
          class="w-full md:max-w-max"
          label="ثبت و ذخیره"
          size="small"
        />
      </div>
    </Dialog>

    <Dialog
      v-model:visible="deleteDialogIsOpen"
      modal
      header="حذف سند"
      :style="{ width: '30rem' }"
      dir="rtl"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <div>
        <span v-if="item.hasRegistered"> این سند قبلا چاپ شده است، </span>

        آیا از حذف سند به شماره {{ item.id }} متعلق به {{ item.userName }} اطمینان دارید؟
      </div>
      <div class="flex items-center justify-end mt-8 gap-2">
        <Button
          @click="deleteDialogIsOpen = false"
          class="w-full md:max-w-max"
          size="small"
          type="submit"
          severity="secondary"
          label="انصراف"
        />
        <Button
          @click="deleteCard"
          class="w-full md:max-w-max"
          size="small"
          type="submit"
          severity="danger"
          label="حذف سند"
        />
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, inject, nextTick, ref } from 'vue'
import TypeIcon from '@/components/TypeIcon.vue'
import * as z from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'

const dateTime = inject('dateTime')
const editDialogIsOpen = ref(false)
const deleteDialogIsOpen = ref(false)

const props = defineProps({
  item: {
    type: Object,
    required: true,
    default: () => {},
  },
  editable: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['delete'])

const getStatus = (state) => {
  {
    if (state === 3) {
      return {
        title: 'تایید',
        class: 'text-green-500',
      }
    } else if (state === 2) {
      return {
        title: 'رد',
        class: 'text-red-500',
      }
    } else if (state === 4) {
      return {
        title: 'دستی',
        class: 'text-blue-500',
      }
    } else if (state === 0) {
      return {
        title: 'بدون پاسخ',
        class: 'text-yellow-500',
      }
    } else {
      return {
        title: 'نامشخص',
        class: '',
      }
    }
  }
}

const deleteCard = () => {
  emit('delete', props.item.id)
  deleteDialogIsOpen.value = false
}
//
const isChangingAmount = ref(false)
const schemaType1 = z.object({
  price: z
    .number({ required_error: 'فی الزامی است', invalid_type_error: 'فی الزامی است' })
    .min(0, 'فی نمی‌تواند منفی باشد'),
  weight: z
    .number({ required_error: 'وزن الزامی است', invalid_type_error: 'وزن الزامی است' })
    .min(0, 'وزن نمی‌تواند منفی باشد'),
  amount: z
    .number({ required_error: 'مبلغ الزامی است', invalid_type_error: 'مبلغ الزامی است' })
    .min(0, 'مبلغ نمی‌تواند منفی باشد'),
  customerMsg: z.string().optional(),
})

// تعریف اسکیمای نوع ۲
const schemaType2 = z.object({
  price: z
    .number({ required_error: 'فی الزامی است', invalid_type_error: 'فی الزامی است' })
    .min(0, 'فی نمی‌تواند منفی باشد'),
  count: z
    .number({ required_error: 'تعداد الزامی است', invalid_type_error: 'تعداد الزامی است' })
    .int('تعداد باید عدد صحیح باشد')
    .min(1, 'تعداد باید حداقل ۱ باشد'),
  customerMsg: z.string().optional(),
})

const { errors, handleSubmit, defineField } = useForm({
  validationSchema: computed(() => {
    const schema = props.item.priceType === 1 ? schemaType1 : schemaType2
    return toTypedSchema(schema)
  }),
  initialValues: {
    price: +props.item.fi || 0,
    weight: props.item.weight || 0,
    amount: (+props.item.fi * props.item.weight) / 4.3318 || 0, // برای نوع 1
    count: props.item.count || 0,
    customerMsg: props.item.customerMsg || '',
  },
})

const [price] = defineField('price')
const [weight] = defineField('weight')
const [amount] = defineField('amount')
const [count] = defineField('count')
const [customerMsg] = defineField('customerMsg')

const handleFormSubmit = handleSubmit(
  (values) => {
    editDialogIsOpen.value = false
    emit('editItem', {
      ...values,
      priceType: props.item.priceType,
      id: props.item.id,
    })
  },
  (errors) => {
    console.log('Validation errors:', errors)
  },
)

const handleRealTimeCalculation = () => {
  // محاسبه amount وقتی price یا weight تغییر می‌کند
  if (props.item.priceType === 1 && price.value !== null && weight.value !== null) {
    isChangingAmount.value = true
    amount.value = (price.value / 4.3318) * weight.value
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
  if (props.item.priceType === 1 && value !== null && price.value !== null && price.value !== 0) {
    isChangingAmount.value = true
    weight.value = (value * 4.3318) / price.value
    nextTick(() => {
      isChangingAmount.value = false
    })
  }
}

console.log(props.item, 'item data')
</script>

<style scoped></style>
