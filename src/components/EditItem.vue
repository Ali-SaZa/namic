<template>
  <form class="grid grid-cols-4 gap-4 rounded-lg shadow bg-gray-50 p-4" @submit.prevent="onSubmit">
    <div class="col-span-4 md:col-span-2 lg:col-span-1">
      <label class="block text-sm font-medium mt-2 text-right">نوع آیتم</label>
      <Select v-model="selectedType" :options="types" class="w-full" optionLabel="name">
        <template #value="slotProps">
          <div v-if="slotProps.value" class="flex items-center">
            <i :class="slotProps.value.icon" />
            <div class="mr-1">{{ slotProps.value.name }}</div>
          </div>
        </template>
        <template #option="slotProps">
          <div class="flex items-center w-full" dir="rtl">
            <i :class="slotProps.option.icon" />
            <div class="mr-1">{{ slotProps.option.name }}</div>
          </div>
        </template>
      </Select>
    </div>
    <div class="col-span-4 md:col-span-2 lg:col-span-1">
      <label class="block text-sm font-medium mb-1 text-right">نام آیتم</label>
      <IconField>
        <InputIcon class="fa fa-bookmark" />
        <InputText
          v-model="name"
          :class="{ 'p-invalid': errors.name }"
          class="w-full"
          placeholder="مثلا: سکه"
          type="text"
        />
      </IconField>
      <small v-if="errors.name" class="text-red-500 text-right block mt-1">{{ errors.name }}</small>
    </div>
    <div class="col-span-4 md:col-span-2 lg:col-span-1">
      <label class="block text-sm font-medium mb-1 text-right">مبلغ</label>
      <IconField>
        <InputIcon class="fa fa-tag" />
        <InputNumber
          v-model="price"
          :invalid="errors.price"
          class="w-full"
          inputId="integeronly"
          placeholder="مثلا: 2,300"
          type="text"
        />
      </IconField>
      <small v-if="errors.price" class="text-red-500 text-right block mt-1">{{
        errors.price
      }}</small>
    </div>
    <div class="col-span-4 md:col-span-2 lg:col-span-1">
      <label class="block text-sm font-medium mb-1 text-right">میزان افزایش|کاهش مبلغ</label>
      <IconField>
        <InputIcon class="fa fa-tag" />
        <InputNumber
          v-model="priceChange"
          :invalid="errors.priceChange"
          class="w-full"
          inputId="integeronly"
          placeholder="مثلا: 2"
          type="text"
        />
      </IconField>
      <small v-if="errors.priceChange" class="text-red-500 text-right block mt-1">{{
        errors.priceChange
      }}</small>
    </div>
    <div class="col-span-4 md:col-span-2 lg:col-span-1">
      <label class="block text-sm font-medium mb-1 text-right">سود</label>
      <IconField>
        <InputIcon class="fa fa-money-bill" />
        <InputNumber
          v-model="profit"
          :invalid="errors.profit"
          class="w-full"
          inputId="integeronly"
          placeholder="مثلا: 2"
          type="text"
        />
      </IconField>
      <small v-if="errors.profit" class="text-red-500 text-right block mt-1">{{
        errors.profit
      }}</small>
    </div>
    <div class="col-span-4 md:col-span-2 lg:col-span-1">
      <label class="block text-sm font-medium mb-1 text-right">میزان افزایش|کاهش سود</label>
      <IconField>
        <InputIcon class="pi pi-sort-alt" />
        <InputNumber
          v-model="profitChange"
          :invalid="errors.profitChange"
          class="w-full"
          inputId="integeronly"
          placeholder="مثلا: 2"
          type="text"
        />
      </IconField>
      <small v-if="errors.profitChange" class="text-red-500 text-right block mt-1">{{
        errors.profitChange
      }}</small>
    </div>
    <div class="col-span-4 md:col-span-2 lg:col-span-1">
      <label class="block text-sm font-medium mb-1 text-right">حداقل میزان سفارش</label>
      <IconField>
        <InputIcon class="fa-solid fa-arrow-down" />
        <InputNumber
          v-model="minOrder"
          :invalid="errors.minOrder"
          class="w-full"
          inputId="integeronly"
          placeholder="مثلا: 2"
          type="text"
        />
      </IconField>
      <small v-if="errors.minOrder" class="text-red-500 text-right block mt-1">{{
        errors.minOrder
      }}</small>
    </div>
    <div class="col-span-4 md:col-span-2 lg:col-span-1">
      <label class="block text-sm font-medium mb-1 text-right">حداکثر میزان سفارش</label>
      <IconField>
        <InputIcon class="fa-solid fa-arrow-up" />
        <InputNumber
          v-model="maxOrder"
          :invalid="errors.maxOrder"
          class="w-full"
          inputId="integeronly"
          placeholder="مثلا: 200"
          type="text"
        />
      </IconField>
      <small v-if="errors.maxOrder" class="text-red-500 text-right block mt-1">{{
        errors.maxOrder
      }}</small>
    </div>
    <div class="col-span-4 md:col-span-2 lg:col-span-1">
      <label class="block text-sm font-medium mb-1 text-right">میزان سفارش روزانه</label>
      <IconField>
        <InputIcon class="fa-solid fa-calendar" />
        <InputNumber
          v-model="dayOrder"
          :invalid="errors.dayOrder"
          class="w-full"
          inputId="integeronly"
          placeholder="مثلا: 2000"
          type="text"
        />
      </IconField>
      <small v-if="errors.dayOrder" class="text-red-500 text-right block mt-1">{{
        errors.dayOrder
      }}</small>
    </div>
    <div class="col-span-4 md:col-span-2 lg:col-span-1">
      <label class="block text-xs font-medium mb-1 text-right"
        >میزان اختلاف فی با برد قیمت در درخواست مشتری</label
      >
      <IconField>
        <InputIcon class="fa-solid fa-plus-minus" />
        <InputNumber
          v-model="disagreementFee"
          :invalid="errors.disagreementFee"
          class="w-full"
          inputId="integeronly"
          placeholder="مثلا: 500"
          type="text"
        />
      </IconField>
      <small v-if="errors.disagreementFee" class="text-red-500 text-right block mt-1">{{
        errors.disagreementFee
      }}</small>
    </div>
    <div class="col-span-4 md:col-span-2 lg:col-span-1">
      <label class="block text-xs font-medium mb-1 text-right">کد کالا در سیستم حسابداری</label>
      <IconField>
        <InputIcon class="fa-solid fa-plus-minus" />
        <InputNumber
          v-model="accountingId"
          :invalid="errors.accountingId"
          class="w-full"
          inputId="integeronly"
          placeholder="مثلا: 500"
          type="text"
        />
      </IconField>
      <small v-if="errors.accountingId" class="text-red-500 text-right block mt-1">{{
        errors.accountingId
      }}</small>
    </div>

    <div class="col-span-4 md:col-span-2 lg:col-span-1">
      <label class="block text-xs font-medium mb-1 text-right">نام کالا در سیستم حسابداری</label>
      <IconField>
        <InputIcon class="fa fa-bookmark" />
        <InputText
          v-model="accountingName"
          :invalid="errors.accountingName"
          class="w-full"
          placeholder="مثلا: سکه"
          type="text"
        />
      </IconField>
      <small v-if="errors.accountingName" class="text-red-500 text-right block mt-1">{{
        errors.accountingName
      }}</small>
    </div>
    <div class="col-span-4 md:col-span-2 lg:col-span-1 flex items-center justify-between pt-4">
      <label class="block text-sm font-medium mb-1 text-right">آیتم مرتبط</label>
      <ToggleSwitch v-model="relatedChecked" />
    </div>
    <template v-if="relatedChecked">
      <div v-if="relatedItems.length" class="col-span-4 md:col-span-2 lg:col-span-1">
        <label class="block text-sm font-medium mb-1 text-right">نام آیتم مرتبط</label>
        <Select
          v-model="selectedRelatedItems"
          :options="relatedItems"
          class="w-full"
          optionLabel="name"
          :invalid="selectedRelatedItemError.length"
          placeholder="آیتم مرتبط را انتخاب کنید"
        />
        <small v-if="selectedRelatedItemError" class="text-red-500 text-right block mt-1">{{
          selectedRelatedItemError
        }}</small>
      </div>
      <div class="col-span-4 md:col-span-2 lg:col-span-1">
        <label class="block text-sm font-medium mb-1 text-right">میزان اختلاف با آیتم مرتبط</label>
        <IconField>
          <InputIcon class="fa-solid fa-plus-minus" />
          <InputNumber
            v-model="disagreementRelatedItems"
            class="w-full"
            inputId="integeronly"
            :invalid="disagreementRelatedItemsError.length"
            placeholder="مثلا: 500"
            type="text"
          />
        </IconField>
        <small v-if="disagreementRelatedItemsError" class="text-red-500 text-right block mt-1">{{
          disagreementRelatedItemsError
        }}</small>
      </div>
    </template>

    <div class="col-span-4 md:col-span-2 lg:col-span-1">
      <label class="block text-xs font-medium mb-1 text-right"
        >تاریخ ثبت درخواست برای سند اتوماتیک</label
      >
      <vue-date-picker
        displayFormat="jYYYY/jMM/jDD"
        format="YYYY-MM-DD"
        v-model="documentRegisterDate"
        class="w-full"
        color="#0ea5e9"
      />
    </div>

    <div class="col-span-4 md:col-span-2 lg:col-span-1 flex items-center justify-between pt-4">
      <label class="block text-sm font-medium mb-1 text-right"
        >آیا سند این آیتم در حسابداری ثبت شود</label
      >
      <ToggleSwitch v-model="allowDocumentRegistration" />
    </div>

    <div class="col-span-4 md:col-span-2 lg:col-span-1 flex items-center justify-between pt-4">
      <label class="block text-sm font-medium mb-1 text-right"
        >مدیریت وضعیت آیتم با شعبه اصلی</label
      >
      <ToggleSwitch v-model="handleByMaster" />
    </div>

    <div
      :class="
        relatedChecked
          ? relatedItems.length
            ? 'col-span-4 lg:col-span-4'
            : 'col-span-4'
          : 'col-span-4'
      "
      class="flex items-center justify-end mt-8 gap-2"
    >
      <Button
        size="small"
        severity="warn"
        label="بستن"
        @click="emit('updated')"
        icon="fa fa-cancel"
        icon-pos="right"
      />
      <Button
        icon="fa fa-check-circle"
        icon-pos="right"
        :loading="isLoading"
        label="ذخیره تغییرات"
        size="small"
        type="submit"
      />
    </div>
  </form>
</template>

<script setup>
import { computed, ref, watch, inject } from 'vue'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { useToast } from 'primevue/usetoast'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['updated'])

const toast = useToast()
const repository = inject('repository')
const isLoading = ref(false)
const relatedChecked = ref(false)
const types = ref([
  { id: 1, name: 'گرمی', icon: 'fa-solid fa-cubes' },
  { id: 2, name: 'تعدادی', icon: 'fa-solid fa-ring' },
  { id: 3, name: 'ارز', icon: 'fa-solid fa-dollar' },
])

const selectedType = ref(types.value.find((type) => type.id === props.data.type) || null)

const relatedItems = computed(() => {
  switch (selectedType.value.id) {
    case 1:
      return [{ id: 1, name: 'گرمی' }]
    case 2:
      return [
        { id: 3, name: 'سکه تمام' },
        { id: 4, name: 'نیم سکه' },
        { id: 0, name: 'ربع سکه' },
        { id: 6, name: 'سکه یک گرمی' },
        { id: 5, name: 'سکه پارسیان' },
      ]
    default:
      return []
  }
})

const allowDocumentRegistration = ref(false)
const handleByMaster = ref(false)

// تعریف schema پایه
const baseSchema = z.object({
  name: z
    .string({ required_error: 'نام آیتم الزامی است' })
    .min(3, { message: 'نام آیتم باید حداقل ۳ حرف باشد' })
    .max(50, { message: 'نام آیتم نمی‌تواند بیشتر از ۵۰ حرف باشد' }),

  price: z.preprocess(
    (val) => (val !== '' ? Number(val) : undefined),
    z
      .number({ invalid_type_error: 'مبلغ آیتم الزامی است' })
      .min(1, { message: 'مبلغ باید بیشتر از صفر باشد' })
      .max(1000000000, { message: 'مبلغ نمی‌تواند بیشتر از ۱ میلیارد باشد' }),
  ),

  priceChange: z.number({
    invalid_type_error: 'میزان تغییر مبلغ الزامی است',
  }),

  profit: z
    .number({ invalid_type_error: 'سود الزامی است' })
    .min(0, { message: 'سود نمی‌تواند منفی باشد' }),

  profitChange: z.number({ invalid_type_error: 'میزان تغییر سود الزامی است' }),

  minOrder: z
    .number({ invalid_type_error: 'حداقل سفارش الزامی است' })
    .min(1, { message: 'حداقل سفارش باید بیشتر از صفر باشد' }),

  maxOrder: z
    .number({ invalid_type_error: 'حداکثر سفارش الزامی است' })
    .min(1, { message: 'حداکثر سفارش باید بیشتر از صفر باشد' }),

  dayOrder: z
    .number({ invalid_type_error: 'سفارش روزانه الزامی است' })
    .min(1, { message: 'سفارش روزانه باید بیشتر از صفر باشد' }),

  disagreementFee: z.number({ invalid_type_error: 'میزان اختلاف فی الزامی است' }),

  accountingId: z.number({ invalid_type_error: '  کد کالا در سیستم حسابداری الزامی است' }),

  accountingName: z.string().optional(),

  documentRegisterDate: z.string().nullable().optional(),
})

const { handleSubmit, errors, defineField, resetForm, setErrors } = useForm({
  initialValues: {
    name: '',
    price: null,
    priceChange: null,
    profit: null,
    profitChange: null,
    minOrder: null,
    maxOrder: null,
    dayOrder: null,
    disagreementFee: null,
    selectedRelatedItems: null,
    disagreementRelatedItems: null,
    accountingId: null,
    accountingName: null,
    documentRegisterDate: null,
  },
})

// تعریف فیلدها
const [name] = defineField('name')
const [price] = defineField('price')
const [priceChange] = defineField('priceChange')
const [profit] = defineField('profit')
const [profitChange] = defineField('profitChange')
const [minOrder] = defineField('minOrder')
const [maxOrder] = defineField('maxOrder')
const [dayOrder] = defineField('dayOrder')
const [disagreementFee] = defineField('disagreementFee')
const [selectedRelatedItems] = defineField('selectedRelatedItems')
const [disagreementRelatedItems] = defineField('disagreementRelatedItems')
const [accountingId] = defineField('accountingId')
const [accountingName] = defineField('accountingName')
const [documentRegisterDate] = defineField('documentRegisterDate')
const selectedRelatedItemError = ref('')
const disagreementRelatedItemsError = ref('')

watch(
  () => props.data,
  () => {
    resetForm({
      values: {
        name: props.data.name,
        price: props.data.price,
        priceChange: props.data.priceDiff,
        profit: props.data.profit,
        profitChange: props.data.profitDiff,
        minOrder: props.data.min,
        maxOrder: props.data.max,
        dayOrder: props.data.dailyAmount,
        disagreementFee: props.data.tolerance,
        selectedRelatedItems: relatedItems.value.find((item) => item.id === props.data.relatedId),
        disagreementRelatedItems: props.data.relatedDiff,
        accountingId: props.data.accountingId,
        accountingName: props.data.accountingName,
        documentRegisterDate: props.data.documentRegisterDate,
      },
    })
    allowDocumentRegistration.value = props.data.allowDocumentRegistration === 1
    handleByMaster.value = props.data.handleByMaster === 1
  },
  { immediate: true },
)

// تابع اعتبارسنجی سفارشی
const validateForm = async () => {
  try {
    let schema = baseSchema.superRefine((data, ctx) => {
      if (data.maxOrder <= data.minOrder) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'حداکثر سفارش باید بیشتر از حداقل سفارش باشد',
          path: ['maxOrder'],
        })
      }
    })

    const values = {
      name: name.value,
      price: price.value,
      priceChange: priceChange.value,
      profit: profit.value,
      profitChange: profitChange.value,
      minOrder: minOrder.value,
      maxOrder: maxOrder.value,
      dayOrder: dayOrder.value,
      disagreementFee: disagreementFee.value,
      selectedRelatedItems: selectedRelatedItems.value,
      disagreementRelatedItems: disagreementRelatedItems.value,
      accountingId: accountingId.value,
      accountingName: accountingName.value,
      documentRegisterDate: documentRegisterDate.value,
    }

    if (relatedChecked.value) {
      if (relatedItems.value.length) {
        if (!selectedRelatedItems.value) {
          selectedRelatedItemError.value = 'انتخاب آیتم مرتبط الزامی است'
        }
        if (disagreementRelatedItems.value === null) {
          disagreementRelatedItemsError.value = 'میزان اختلاف با آیتم مرتبط الزامی است'
        }
      }
    }
    await schema.parseAsync(values)

    return true
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = {}
      error.errors.forEach((err) => {
        formattedErrors[err.path[0]] = err.message
      })
      setErrors(formattedErrors)
    }
    return false
  }
}

watch(selectedType, () => {
  selectedRelatedItems.value = null
})

watch(selectedRelatedItems, () => {
  if (selectedRelatedItems.value) {
    selectedRelatedItemError.value = ''
  } else {
    selectedRelatedItemError.value = 'انتخاب آیتم مرتبط الزامی است'
  }
})

watch(disagreementRelatedItems, () => {
  if (disagreementRelatedItems.value) {
    disagreementRelatedItemsError.value = ''
  } else {
    disagreementRelatedItemsError.value = 'میزان اختلاف با آیتم مرتبط الزامی است'
  }
})

const handleEditItem = async (values) => {
  isLoading.value = true
  try {
    const response = await repository.updatePrice(values)
    if (response) {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: 'آیتم با موفقیت ویرایش شد',
      })
    }
    relatedChecked.value = false
    emit('updated')
    resetForm()
  } catch (error) {
    console.error('Error adding item:', error)
    toast.add({
      severity: 'warn',
      summary: 'خطا',
      life: 3000,
      detail: error?.msg || error?.message || 'خطای ناشناخته‌ای رخ داده است',
    })
  } finally {
    isLoading.value = false
  }
}

const onSubmit = handleSubmit(async () => {
  const isValid = await validateForm()
  if (isValid) {
    const values = {
      id: props.data.id,
      type: selectedType.value.id,
      name: name.value,
      price: price.value,
      priceDiff: priceChange.value,
      profit: profit.value,
      profitDiff: profitChange.value,
      min: minOrder.value,
      max: maxOrder.value,
      dailyAmount: dayOrder.value,
      tolerance: disagreementFee.value,
      accountingId: accountingId.value,
      accountingName: accountingName.value,
      documentRegisterDate: documentRegisterDate.value,
      allowDocumentRegistration: allowDocumentRegistration.value ? 1 : 0,
      handleByMaster: handleByMaster.value ? 1 : 0,
    }

    if (relatedChecked.value) {
      values.relatedDiff = disagreementRelatedItems.value
      values.relatedId = selectedRelatedItems.value.id
    }
    await handleEditItem(values)
  }
})
</script>

<style scoped></style>
