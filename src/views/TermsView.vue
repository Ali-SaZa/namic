<template>
  <div class="flex items-center justify-center my-4">
    <div class="w-full md:w-[600px] rounded-lg bg-gray-50 p-4 text-center">
      <div class="w-full text-center bg-gray-200 p-4 rounded-lg">
        {{ title }}
        <i class="fa-solid fa-circle-check"></i>
      </div>
      <div class="w-full text-right text-sm bg-gray-200 p-4 rounded-lg mt-4 mb-8">
        <p v-for="item in description" :key="item.id" :class="item.class" v-html="item.text"/>
      </div>
      <Button icon="fa-solid fa-circle-check" severity="contrast"
              @click="$router.push({ name: 'login' })"
              class="w-full" label="قوانین و شرایط را مطالعه و با آگاهی، تمامی موارد را می پذیرم" icon-pos="right"/>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue';

const title = ref('شرایط و قوانین استفاده از سرویس‌ها و خدمات این سایت');
const description = ref([
  {
    id: 1,
    text: 'کاربر گرامی لطفاً موارد زیر را جهت استفاده بهینه از خدمات و برنامه‌های کاربردی این وب سایت به دقت ملاحظه فرمایید',
  },
  {
    id: 2,
    text: 'ورود کاربران به این وب سایت، هنگام استفاده از پروفایل شخصی و امکانات این وب سایت به معنای آگاه بودن و پذیرفتن شرایط و قوانین و همچنین نحوه استفاده از سرویس‌ ها و خدمات این وب سایت است توجه داشته باشید که ثبت سفارش نیز در هر زمان به معنی پذیرفتن کامل کلیه شرایط و قوانین این وب سایت از سوی کاربر است',
    class: 'my-2',
  },
  {
    id: 3,
    text: 'کلیه اصول و رویه ‌های این وب سایت منطبق با قوانین جمهوری اسلامی ایران می باشد',
    class: 'font-bold text-green-600',
  },
  {
    id: 4,
    text: 'توجه داشته باشید مسئول هر گونه سوء استفاده از امکانات این وب سایت توسط کابران (مدیر سیستم،مشتری و ...) به عهده خود کاربر می باشد',
    class: 'font-bold text-red-600 my-2',
  },
  {
    id: 5,
    text: `شایان ذکر است که این سامانه به منظور سهولت در کار،کاهش تماس تلفنی،کاهش خطا های انسانی و به منظور سرعت بخشیدن به کار طراحی و پیاده سازی شده است<br>هر گونه سوء استفاده و نقض این موارد و قوانین به عهده کاربر می باشد<br>چنانچه قوانین مذکور نقض شوند، مسئولیت این امر با خود کاربر می باشد و طراحان این سامانه ضمن آگاه سازی و توجیح این موارد به کاربر (مدیر سیستم) به هنگام خرید و راه اندازی سامانه، مسئولیتی در این قبال ندارند`,
  },
]);
</script>


<style scoped>

</style>
