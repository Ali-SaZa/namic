<template>
  <div class="p-2 bg-base rounded-lg">
    <div class="flex items-center justify-between bg-gray-200 rounded-lg">
      <div class="flex items-center p-2">
        <i class="fa fa-user" />
        <div class="mx-2 font-bold">{{ logItem.userName }}</div>
      </div>
      <div class="font-bold p-2">
        <i class="fa-solid fa-file-invoice"></i>
        {{ logItem.documentsCount }}
      </div>
    </div>

    <div class="p-4">
      <div class="flex items-center justify-between text-sm mt-2" v-for="item in logItem.logs">
        <div>
          <i
            :class="
              item.priceType === 2
                ? 'fa fa-ring text-blue-500'
                : 'fa-solid fa-cubes text-xl text-yellow-400'
            "
          />
          {{ item.priceName }}
        </div>
        <div class="font-bold">
          {{ item.count }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  logItem: {
    type: Object,
    required: true,
  },
})

console.log(props.logItem)
</script>

<style scoped></style>
