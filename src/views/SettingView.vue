<template>
  <div class="grid grid-cols-8 gap-y-4 md:gap-y-0 md:gap-x-8 mb-8">
    <div class="col-span-8 lg:col-span-2 rounded-lg bg-gray-50 p-4">
      <div class="bg-gray-200 p-2 flex items-center justify-center rounded">
        <i class="fa fa-shield text-sm" />
        <i class="fa fa-gear text-sm mx-2" />
        <div>تنظیمات پنل مدیریتی</div>
      </div>

      <!-- حالت نمایش بخش معاملات -->
      <label class="block text-sm font-medium text-right mt-2 mb-1">حالت نمایش بخش معاملات</label>
      <ButtonGroup class="w-full">
        <Button
          size="small"
          v-for="orderView in adminSettings.viewOptions.orderViews"
          :key="orderView.id"
          :label="orderView.label"
          :severity="adminSettings.settings.orderViewId === orderView.id ? 'info' : 'secondary'"
          @click="adminSettings.settings.orderViewId = orderView.id"
          class="min-w-1/2 flex flex-col"
        />
      </ButtonGroup>

      <!-- نمایش درخواست ها -->
      <label class="block text-sm font-medium text-right mt-2 mb-1">نمایش درخواست ها</label>
      <ButtonGroup class="w-full">
        <Button
          size="small"
          v-for="requestView in adminSettings.viewOptions.requestViews"
          :key="requestView.id"
          :label="requestView.label"
          :severity="adminSettings.settings.requestViewId === requestView.id ? 'info' : 'secondary'"
          @click="adminSettings.settings.requestViewId = requestView.id"
          class="min-w-1/2 flex flex-col"
        />
      </ButtonGroup>

      <!-- نمایش برد آیتم ها -->
      <label class="block text-sm font-medium text-right mt-2 mb-1">نمایش برد آیتم ها</label>
      <ButtonGroup class="w-full">
        <Button
          size="small"
          v-for="orderItemView in adminSettings.viewOptions.orderItemViews"
          :key="orderItemView.id"
          :label="orderItemView.label"
          :severity="
            adminSettings.settings.orderItemViewId === orderItemView.id ? 'info' : 'secondary'
          "
          @click="adminSettings.settings.orderItemViewId = orderItemView.id"
          class="min-w-1/2 flex flex-col"
        />
      </ButtonGroup>

      <!-- نمایش وضعیت خرید و فروش آیتم -->
      <label class="block text-sm font-medium text-right mt-2 mb-1"
        >نمایش وضعیت خرید و فروش آیتم</label
      >
      <ButtonGroup class="w-full">
        <Button
          size="small"
          v-for="status in adminSettings.viewOptions.itemBuyAndSellStatuses"
          :key="status.id"
          :label="status.label"
          :severity="adminSettings.settings.itemBuyAndSellId === status.id ? 'info' : 'secondary'"
          @click="adminSettings.settings.itemBuyAndSellId = status.id"
          class="min-w-1/3 flex flex-col"
        />
      </ButtonGroup>

      <!-- واحد پول برنامه -->
      <label class="block text-sm font-medium text-right mt-2 mb-1">واحد پول برنامه</label>
      <ButtonGroup class="w-full">
        <Button
          size="small"
          v-for="currency in moneyUnits"
          :key="currency.id"
          :label="currency.label"
          :severity="selectedMoneyUnit == currency.id ? 'info' : 'secondary'"
          @click="changeSettingsData('MoneyUnit', currency.id)"
          class="min-w-1/3 flex flex-col"
        />
      </ButtonGroup>

      <!-- پیش فرض نمایش روزنامه-->
      <label class="block text-sm font-medium text-right mt-2 mb-1">پیش فرض نمایش روزنامه</label>
      <ButtonGroup class="w-full">
        <Button
          size="small"
          v-for="dailyShowView in adminSettings.viewOptions.dailyShowView"
          :key="dailyShowView.id"
          :label="dailyShowView.label"
          :severity="
            adminSettings.settings.dailyShowView === dailyShowView.id ? 'info' : 'secondary'
          "
          @click="adminSettings.settings.dailyShowView = dailyShowView.id"
          class="min-w-1/3 flex flex-col"
        />
      </ButtonGroup>

      <!-- صدای برنامه -->
      <label class="block text-sm font-medium text-right mt-2 mb-1">صدای درخواست</label>
      <div class="flex items-center">
        <Select v-model="selectedSound" :options="sounds" optionLabel="name" class="w-full">
          <template #value="slotProps">
            <div v-if="slotProps.value" class="flex items-center">
              <i :class="slotProps.value.icon" />
              <div class="mr-1">{{ slotProps.value.name }}</div>
            </div>
          </template>
        </Select>
        <Button
          size="small"
          icon="fa fa-save"
          icon-pos="right"
          @click="changeSettingsData('DefReqSound', selectedSound.value)"
          class="mr-1 l"
        />
      </div>

      <hr class="my-4 text-gray-500" />
      <p class="font-bold">تلگرام</p>
      <p class="text-sm text-gray-500 mt-1">ID کانال و Api-Key</p>
      <IconField>
        <InputIcon class="pi pi-telegram" />
        <InputText v-model="telegramId" placeholder="ID تلگرام" type="text" class="w-full" />
      </IconField>
      <IconField class="mt-2">
        <InputIcon class="pi pi-key" />
        <InputText v-model="apiKey" placeholder="Api-Key" type="text" class="w-full" />
      </IconField>
      <Button
        label="انتخاب کانال"
        @click="selectChannelDialogIsOpen = true"
        size="small"
        icon="fa fa-user"
        icon-pos="right"
        class="w-full mt-4"
        severity="info"
      />
      <p class="text-sm text-gray-500 mt-4">زمان ارسال به دقیقه</p>
      <IconField>
        <InputIcon class="pi pi-clock" />
        <InputText
          v-model="telegPriceSchedule"
          placeholder="زمان ارسال"
          type="text"
          class="w-full"
        />
      </IconField>

      <Button
        label="ثبت"
        size="small"
        icon="fa fa-save"
        icon-pos="right"
        @click="saveTelegramInfo"
        class="w-full mt-2"
      />

      <hr class="my-4 text-gray-500" />

      <!-- نمایش تیک مشاهده -->
      <div class="flex items-center justify-between mt-2 gap-1">
        <div>
          <label class="block text-sm font-medium text-right">نمایش تیک مشاهده</label>
          <span class="text-gray-500 text-xs"
            >در نمایش درخواست مشتریان (دفترروزنامه،اسناد مشتری و ...) یک تیک تایید مشاهده و بررسی
            اضافه می شود</span
          >
        </div>
        <ToggleSwitch v-model="adminSettings.settings.showTick" class="min-w-10" />
      </div>
      <hr class="my-4 text-gray-500" />

      <!-- نمایش ادمین آنلاین -->
      <div class="flex items-center justify-between mt-3">
        <label class="block text-sm font-medium text-right"
          >نمایش ادمین،حسابدار،اپراتور های آنلاین</label
        >
        <ToggleSwitch v-model="adminSettings.settings.showAdmin" />
      </div>

      <hr class="my-4 text-gray-500" />
      <div class="flex items-center justify-between mt-2 gap-1">
        <div>
          <label class="block text-sm font-medium text-right"
            >ادمین فقط به صورت دستی آنلاین | آفلاین شود</label
          >
          <span class="text-gray-500 text-xs">
            درصورت فعال بودن این تنظیم با خارج شدن از برنامه و یا در مرورگر به تب دیگری بروید وضعیت
            آنلاینی ادمین تغییر نمی کند
          </span>
        </div>
        <ToggleSwitch
          v-model="adminStayOnline"
          @update:modelValue="changeSettingsData('adminStayOnline', $event)"
          class="min-w-10"
        />
      </div>

      <hr class="my-4 text-gray-500" />
      <div class="flex items-center justify-between mt-2">
        <div>
          <label class="block text-sm font-medium text-right">نمایش مجموع وزن درخواست ها</label>
          <span class="text-gray-500 text-xs">
            با فعال بودن این تنظیم مجموع وزن های درخواست ها را نمایش می دهد
          </span>
        </div>
        <ToggleSwitch
          v-model="RequestsSum"
          class="min-w-10"
          @update:modelValue="changeSettingsData('RequestsSum', $event)"
        />
      </div>

      <hr class="my-4 text-gray-500" />
      <div class="flex items-center justify-between mt-2">
        <div>
          <label class="block text-sm font-medium text-right">ثبت سند حسابداری</label>
          <span class="text-gray-500 text-xs"> سرویس ثبت سند فعال|غیرفعال شود </span>
        </div>
        <ToggleSwitch
          v-model="DocRegistration"
          class="min-w-10"
          @update:modelValue="changeSettingsData('DocRegistration', $event)"
        />
      </div>

      <hr class="my-4 text-gray-500" />
      <div class="flex items-center justify-between mt-2">
        <div>
          <label class="block text-sm font-medium text-right">آپدیت قیمت ها به صورت اتوماتیک</label>
          <span class="text-gray-500 text-xs"> آپدیت قیمت ها از سورس دیگر </span>
        </div>
        <ToggleSwitch
          v-model="PriceUpdateOtherSource"
          class="min-w-10"
          @update:modelValue="changeSettingsData('PriceUpdateOtherSource', $event)"
        />
      </div>

      <hr class="my-4 text-gray-500" />
      <!-- مظنه سند -->
      <label class="block text-sm font-medium text-right mt-2">مظنه سند</label>
      <span class="text-gray-500 text-xs">مظنه مجاز تا چند درصد فی برد باشد 25٪+ | 25٪-</span>
      <InputNumber
        v-model="quote"
        inputId="quote"
        mode="decimal"
        showButtons
        :min="-25"
        :max="25"
        prefix="%"
        fluid
      />
      <Button
        label="ثبت تغییرات"
        size="small"
        icon="fa fa-save"
        icon-pos="right"
        @click="saveSetting()"
        class="w-full mt-2"
      />
    </div>
    <div class="col-span-8 lg:col-span-2 rounded-lg bg-gray-50 p-4 max-h-86">
      <div class="bg-gray-200 p-2 flex items-center justify-center rounded">
        <i class="fa fa-user text-sm" />
        <i class="fa fa-gear text-sm mx-2" />
        <div>تنظیمات پنل مشتری</div>
      </div>
      <label class="block text-sm font-medium text-right mt-2 mb-1"
        >نمایش وضعیت خرید و فروش آیتم</label
      >
      <ButtonGroup class="w-full">
        <Button
          size="small"
          v-for="displayBoard in displayBoards"
          :key="displayBoard.id"
          :label="displayBoard.label"
          :severity="selectedDisplayBoardId === displayBoard.value ? 'info' : 'secondary'"
          @click="selectDisplayBoard(displayBoard.id, displayBoard.value)"
          class="min-w-1/3 flex flex-col"
        >
        </Button>
      </ButtonGroup>
      <label class="block text-sm font-medium text-right mt-2">موبایل ادمین</label>
      <span class="text-gray-500 text-xs"
        >موبایل ادمین برای نمایش به مشتری در صورت آفلاین بودن ادمین</span
      >
      <IconField>
        <InputIcon class="pi pi-mobile" />
        <InputText
          v-model="adminMobile"
          placeholder="09121234567"
          type="text"
          class="w-full pl-10 text-sm md:text-base"
        />
      </IconField>

      <IconField class="mt-2">
        <InputIcon class="pi pi-mobile" />
        <InputText
          v-model="adminSecondMobile"
          placeholder="موبایل دوم ادمین"
          type="text"
          class="w-full pl-10 text-sm md:text-base"
        />
      </IconField>

      <Button
        label="ثبت تغییرات"
        @click="saveAdminMobiles"
        size="small"
        icon="fa fa-save"
        icon-pos="right"
        class="w-full mt-2"
      />
    </div>
    <Dialog
      v-model:visible="selectChannelDialogIsOpen"
      modal
      header="حساب مورد نظر بابت قیمت های تلگرام"
      :style="{ width: '30rem' }"
      dir="rtl"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <div class="flex flex-row items-center justify-between mt-4">
        <IconField class="w-3/4">
          <InputIcon class="pi pi-user" />
          <InputText placeholder="جستجوی نام مشتری" type="text" class="w-full" />
        </IconField>
        <div class="flex items-center gap-2">
          <Button
            icon="fa fa-refresh"
            class="w-full md:max-w-max"
            size="small"
            type="submit"
            severity="primary"
          />
          <div>
            <i class="fa fa-user" />
            0
          </div>
        </div>
      </div>
      <div class="flex items-center justify-end mt-8 gap-2">
        <Button
          @click="selectChannelDialogIsOpen = false"
          class="w-full md:max-w-max"
          size="small"
          type="submit"
          severity="secondary"
          label="بستن"
        />
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, watch } from 'vue'
import { useAdminSettingsStore } from '@/stores/adminSettings'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const repository = inject('repository')
const adminSettings = useAdminSettingsStore()
const selectedSound = ref(null)
const settingsData = ref(null)
const player = ref(null)
const selectedDisplayBoardId = ref(1)
const selectedMoneyUnit = ref(null)
const telegramId = ref('')
const apiKey = ref('')
const telegPriceSchedule = ref('')
const selectChannelDialogIsOpen = ref(false)

const displayBoards = ref([
  {
    id: 1,
    label: 'صفحه',
    value: 'page',
    icon: 'fa fa-file-lines',
  },
  {
    id: 2,
    label: 'گروه',
    value: 'group',
    icon: 'fa fa-grip-lines',
  },
  {
    id: 3,
    label: 'لیست',
    value: 'list',
    icon: 'fa fa-table-lines',
  },
])

const sounds = ref([
  { name: 'صدا 1', value: '1', src: '/sound/sound1.mp3' },
  { name: 'صدا 2', value: '2', src: '/sound/sound2.mp3' },
  { name: 'صدا 3', value: '3', src: '/sound/sound3.mp3' },
  { name: 'صدا 4', value: '4', src: '/sound/sound4.mp3' },
  { name: 'صدا 5', value: '5', src: '/sound/sound5.mp3' },
  { name: 'صدا 6', value: '6', src: '/sound/sound6.mp3' },
  { name: 'صدا 7', value: '7', src: '/sound/sound7.mp3' },
  { name: 'صدا 8', value: '8', src: '/sound/sound8.mp3' },
  { name: 'صدا 9', value: '9', src: '/sound/sound9.mp3' },
  { name: 'صدا 10', value: '10', src: '/sound/sound10.mp3' },
])

const moneyUnits = ref([
  { id: 1, label: 'ریال IRR' },
  { id: 2, label: 'تومان IRT' },
])

console.log(settingsData.value)

const adminStayOnline = ref(false)
const RequestsSum = ref(false)
const DocRegistration = ref(false)
const PriceUpdateOtherSource = ref(false)

const quote = ref(adminSettings.settings.quote)

const adminMobile = ref('')
const adminSecondMobile = ref('')

const saveSetting = () => {
  if (adminSettings.saveSettings()) {
    toast.add({
      severity: 'success',
      summary: 'موفق',
      detail: 'تنظیمات با موفقیت ذخیره شدند',
      life: 3000,
    })
  } else {
    toast.add({
      severity: 'error',
      summary: 'خطا',
      detail: 'ذخیره تنظیمات با مشکل مواجه شد',
      life: 3000,
    })
  }
}

const saveTelegramInfo = async () => {
  await changeSettingsData('TelegramChannelId', telegramId.value)
  await changeSettingsData('TelegramApiKey', apiKey.value)
  await changeSettingsData('TelegPriceSchedule', telegPriceSchedule.value)
}

const changeSettingsData = async (key, value) => {
  try {
    const response = await repository.setSetting({
      userType: 1,
      key: key,
      value: value,
    })
    if (response) {
      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        life: 3000,
        detail: 'تنظیمات با موفقیت ذخیره شد',
      })
      getSettingInfo()
    }
  } catch (error) {
    console.log(error, 'Error on save settings')
  }
}

const selectDisplayBoard = (id, val) => {
  selectedDisplayBoardId.value = id
  changeSettingsData('priceBoard', val)
}

const saveAdminMobiles = () =>{
   changeSettingsData('onCall', adminMobile.value)
   changeSettingsData('onCall2', adminSecondMobile.value)

}

const getSettingInfo = async () => {
  try {
    const response = await repository.getSettings()
    if (response) {
      settingsData.value = response.data.settings
      selectedSound.value = sounds.value.find(
        (sound) => sound.value === settingsData.value.DefReqSound,
      )
      selectedMoneyUnit.value = settingsData.value.MoneyUnit
      telegramId.value = settingsData.value.TelegramChannelId
      apiKey.value = settingsData.value.TelegramApiKey
      telegPriceSchedule.value = settingsData.value.TelegPriceSchedule

      adminStayOnline.value = settingsData.value.adminStayOnline === 'true'
      RequestsSum.value = settingsData.value.RequestsSum === 'true'
      DocRegistration.value = settingsData.value.DocRegistration === 'true'
      PriceUpdateOtherSource.value = settingsData.value.PriceUpdateOtherSource === 'true'

      selectedDisplayBoardId.value = settingsData.value.priceBoard
      adminMobile.value = settingsData.value.onCall
      adminSecondMobile.value = settingsData.value.onCall2
    }
  } catch (error) {
    console.log(error, 'Error on get Admin settings')
  }
}

onMounted(async () => {
  getSettingInfo()
})

watch(selectedSound, (newSound, oldSound) => {
  if (!oldSound) return
  if (!newSound) return

  if (player.value) {
    player.value.pause()
    player.value.currentTime = 0
  }

  player.value = new Audio(newSound.src)
  player.value.play().catch(console.error)
})

watch(quote, (val) => {
  adminSettings.settings.quote = val
  changeSettingsData('rangePercent', val)
})
</script>
