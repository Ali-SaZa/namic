import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSelectedItemsStore = defineStore('selectedItems', () => {
  const initialSelectedItems = () => {
    const saved = localStorage.getItem('selectedItems')
    return saved ? JSON.parse(saved) : []
  }

  const selectedItems = ref(initialSelectedItems())

  // ذخیره خودکار در localStorage هنگام تغییر
  watch(selectedItems, (newValue) => {
    localStorage.setItem('selectedItems', JSON.stringify(newValue))
  }, { deep: true })

  return {
    selectedItems
  }
})
