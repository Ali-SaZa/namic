<template>
  <div class="w-full flex items-center justify-center">
    <div class="panelmenu-wrapper w-full md:w-[330px] rounded-lg bg-gray-50 p-4">
      <PanelMenu
        :model="mobileMenuItems"
        :expandedKeys="expandedKeys"
        @panel-click="onPanelClick"
        dir="rtl"
        class="w-full border-none bg-transparent"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore.js';
import { getRoutesBasedOnUserType } from '@/router/index.js';

const router = useRouter();
const userStore = useUserStore();
const expandedKeys = ref({});
const availableRoutes = getRoutesBasedOnUserType(userStore?.userType);
const user = computed(() => userStore.user);

// فیلتر کردن مسیرهایی که در bottom navigation نیستند
const mobileMenuItems = computed(() => {
  if (!user.value) return [];

  let mainRoutes = availableRoutes.filter(
    route => route.name && route.faName && route.meta?.requiresAuth && !route.bottomNavigationPosition);

  if (userStore?.userType === 4 && user.value.isAuthenticated === '1') {
    mainRoutes = mainRoutes.filter(r => r.name !== 'authentication');
  }

  return createPanelMenuItems(mainRoutes);
});

// ساختار منو برای پنل منو
const createPanelMenuItems = (routesArray, parentKey = '') => {
  return routesArray.map((item, index) => {
    const key = parentKey ? `${parentKey}_${index}` : `${index}`;
    const hasChildren = item.children && item.children.length > 0;

    return {
      key,
      label: item.faName,
      icon: item.icon,
      items: hasChildren ? createPanelMenuItems(item.children, key) : undefined,
      command: hasChildren
        ? () => toggleMenu(key)
        : () => {
          router.push({ name: item.name });
        },
      class: !hasChildren && router.currentRoute.value.name === item.name
        ? 'active-menu-item'
        : '',
    };
  });
};

const onPanelClick = (event) => {
  if (event.item.items) {
    toggleMenu(event.item.key);
  }
};

const toggleMenu = (key) => {
  expandedKeys.value = {
    ...expandedKeys.value,
    [key]: !expandedKeys.value[key],
  };
};
</script>

<style scoped>
.pages-view {
  height: 100vh;
  background-color: #f9fafb;
}

.dark .pages-view {
  background-color: #111827;
}

:deep(.p-panelmenu-header-link),
:deep(.p-panelmenu-content) {
  background: transparent !important;
  border: none !important;
}

:deep(.p-panelmenu-header-link:hover),
:deep(.p-menuitem-link:hover) {
  background: rgba(0, 0, 0, 0.05) !important;
}

.dark :deep(.p-panelmenu-header-link:hover),
.dark :deep(.p-menuitem-link:hover) {
  background: rgba(255, 255, 255, 0.05) !important;
}


:deep(.p-panelmenu-header-icon) {
  border: 1px solid #d3d3d3 !important;
  background: white;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark :deep(.p-panelmenu-header-icon) {
  background: #374151;
  border-color: #4b5563 !important;
}

:deep(.p-panelmenu-submenu-icon:dir(rtl)) {
  transform: rotate(90deg) !important;
}

:deep(.p-panelmenu-header-active .p-panelmenu-submenu-icon:dir(rtl)) {
  transform: rotate(180deg) !important;
}
</style>
