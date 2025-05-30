<template>
  <div>
    <div class="px-4 md:px-8 w-full h-18 flex items-center justify-between bg-gray-50">
      <div class="flex items-center justify-between w-full md:w-60">
        <OverlayBadge :severity="userIsOnline?'success':'danger'" class="inline-flex" v-if="userStore.userType===1">
          <Avatar class="p-overlay-badge"
                  shape="circle"
                  image="https://primefaces.org/cdn/primevue/images/organization/walter.jpg"
                  size="large"/>
        </OverlayBadge>
        <div class="mr-2">
          <div class="flex" v-if="userStore.userType===1">
            <div class="text-sm font-bold text-right text-green-500 mr-1">(مدیر)</div>
            <div class="text-sm text-right">
              <span class="text-sm text-right text-gray-400">{{ user?.userName }}</span>
              {{ user?.name }}
            </div>
          </div>
          <div v-else>
            <div class="text-sm text-right">
              <span class="text-sm text-right text-gray-400">{{ user?.userName }}</span>
              {{ user?.name }}
            </div>
          </div>
          <div class="flex justify-between items-center">
            <div class="flex gap-2">
              <ThemeToggle/>
              <OnlineToggle v-if="userStore.userType===1"/>
            </div>
            <Button size="small" variant="outlined" icon="fa fa-arrow-right-from-bracket"
                    @click="logOutModalIsOpen = true"
                    severity="danger" class="h-7 !w-7 ml-2"/>
          </div>
        </div>
      </div>
      <div class="hidden lg:flex items-center">
        <div
          class="bg-gray-200 border-r-2 text-gray-700 border-gray-900 p-2 rounded flex items-center gap-2 mr-4">
          <span>
            {{ currentRoute.faName }}
          </span>
          <i :class="currentRoute.icon"/>
        </div>
        <Button icon="pi pi-bars" variant="text" @click="visible = true"/>
      </div>
    </div>

    <Drawer v-model:visible="visible" position="right">
      <template #container="{ closeCallback }">
        <div class="flex flex-col h-full">
          <div class="flex items-center justify-between px-6 pt-4 shrink-0">
            <span class="font-semibold text-2xl text-primary">Your Logo</span>
            <Button type="button" @click="closeCallback" icon="pi pi-times" rounded outlined/>
          </div>
          <div class="overflow-y-auto p-4 panelmenu-wrapper min-h-[93dvh] flex flex-col justify-between gap-2">
            <div>
             <PanelMenu
              :model="panelMenuItems"
              :expandedKeys="expandedKeys"
              @panel-click="onPanelClick"
              dir="rtl"
              class="w-full border-none"
             />
            </div>
            <div>
             <Button label="خروج" @click="logOutModalIsOpen = true" severity="danger"
                    icon-pos="right"
                    class="w-full"
                    icon="fa fa-arrow-right-from-bracket"/>
            </div>
          </div>
        </div>
      </template>
    </Drawer>
    <main dir="rtl" class="p-4 pb-[68px] lg:p-8">
      <slot/>
    </main>
    <div class="inline-block lg:hidden">
      <CurvedBottomNavigation :options="options" v-model="selected"
                              :foregroundColor="foregroundColor"
                              :backgroundColor="isDark?'#262626':'#f8fafc'"
                              :class="isDark?'dark':''"
                              :replaceRoute="true"/>
    </div>
    <Dialog
      v-model:visible="logOutModalIsOpen"
      modal
      :style="{ width: '30rem' }"
      dir="rtl"
      header="خروج از برنامه"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <div class="font-bold mb-4">
        آیا از خروج خود از برنامه مطمئن هستید؟
      </div>
      <div class="flex items-center justify-end gap-2">
        <Button size="small" label="بستن"
                icon="fa fa-cancel"
                @click="logOutModalIsOpen = false"
                icon-pos="right"
                severity="warn"/>
        <Button size="small" label="خروج"
                icon="fa fa-arrow-right-from-bracket"
                icon-pos="right"
                @click="logout"
                severity="danger"/>
      </div>

    </Dialog>
  </div>
</template>

<script setup>
import { CurvedBottomNavigation } from 'bottom-navigation-vue';
import 'bottom-navigation-vue/dist/style.css';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ThemeToggle from '@/components/ThemeToggle.vue';
import { useThemeStore } from '@/stores/theme.js';
import { storeToRefs } from 'pinia';
import '@/assets/css/drawer.css';
import { useOnlineStatusStore } from '@/stores/onlineStatus.js';
import OnlineToggle from '@/components/OnlineToggle.vue';
import { useUserStore } from '@/stores/userStore.js';
import { getRoutesBasedOnUserType } from '@/router/index.js';

const onlineStatusStore = useOnlineStatusStore();
const userIsOnline = computed(() => onlineStatusStore.userStatus);

const userStore = useUserStore();
const user = computed(() => userStore.user);

const visible = ref(false);
const route = useRoute();
const router = useRouter();
const expandedKeys = ref({});
const selected = ref(3);
const logOutModalIsOpen = ref(false);
const availableRoutes = getRoutesBasedOnUserType(userStore?.userType);
const options = ref(createBottomNavigationOptions(availableRoutes));

const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);

function createBottomNavigationOptions(routes) {
  const filteredRoutes = routes.filter(route =>
    route?.bottomNavigationPosition,
  );

  const sortedRoutes = filteredRoutes.sort((a, b) =>
    a.bottomNavigationPosition - b.bottomNavigationPosition,
  );

  return sortedRoutes.map(route => ({
    id: route.bottomNavigationPosition,
    icon: 'text-2xl ' + route.icon,
    title: route.faName,
    path: route.path,
    ...(route.children && {
      childs: route.children.map(child => ({
        id: parseInt(`${route.bottomNavigationPosition}${child.path.length}`),
        icon: child?.icon || 'fa-solid fa-circle',
        title: child?.faName || child.name,
        path: child.path,
      })),
    }),
  }));
}

// ساختار کلیدها برای منوها
const createMenuKeys = (routes, parentKey = '') => {
  return routes.map((item, index) => {
    const key = parentKey ? `${parentKey}_${index}` : `${index}`;
    return {
      ...item,
      key,
      items: item.children ? createMenuKeys(item.children, key) : undefined,
    };
  });
};

const menuItemsWithKeys = computed(() => {
  // مقدار پیش‌فرض زمانی که user وجود ندارد
  if (!user.value) return [];

  let mainRoutes = availableRoutes.filter(route => route.name && route.faName && route.meta?.requiresAuth);

  if (userStore?.userType === 4 && user.value.isAuthenticated === '1') {
    mainRoutes = mainRoutes.filter(r => r.name !== 'authentication');
  }

  return createMenuKeys(mainRoutes);
});

const currentRoute = computed(() => {
  const findRouteRecursive = (routesArray, targetName) => {
    for (const routeItem of routesArray) {
      if (routeItem.name === targetName) return routeItem;
      if (routeItem.children) {
        const found = findRouteRecursive(routeItem.children, targetName);
        if (found) return found;
      }
    }
    return null;
  };

  const matchedRoute = findRouteRecursive(availableRoutes, route.name);
  return matchedRoute || '';
});

const panelMenuItems = computed(() => {
  return menuItemsWithKeys.value.map(item => ({
    key: item.key,
    label: item.faName,
    icon: item.icon,
    items: item.children?.map(child => ({
      key: child.key,
      label: child.faName,
      icon: child.icon,
      command: () => {
        router.push({ name: child.name });
        visible.value = false;
      },
      class: route.name === child.name ? 'active-submenu-item' : '',
    })),
    class: !item.children && route.name === item.name ? 'active-menu-item' : '',
    command: item.children ? () => toggleMenu(item.key) : () => {
      router.push({ name: item.name });
      visible.value = false;
    },
  }));
});

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

watch([route, menuItemsWithKeys], () => {
  const newExpandedKeys = {};

  const findActivePath = (items, parentKey = '') => {
    for (const [index, item] of items.entries()) {
      const key = parentKey ? `${parentKey}_${index}` : `${index}`;

      if (route.name === item.name) {
        if (parentKey) {
          newExpandedKeys[parentKey] = true;
        }
        return true;
      }

      if (item.children) {
        if (findActivePath(item.children, key)) {
          newExpandedKeys[key] = true;
          if (parentKey) {
            newExpandedKeys[parentKey] = true;
          }
          return true;
        }
      }
    }
    return false;
  };

  findActivePath(menuItemsWithKeys.value);
  expandedKeys.value = newExpandedKeys;
}, { immediate: true });

const foregroundColor = computed(() => {
  if (isDark.value) {
    if (!userIsOnline.value) {
      return '#f87171';
    }
    return '#34D399';
  } else {
    if (!userIsOnline.value) {
      return '#ef4444';
    }
    return '#10b981';
  }
});

const logout = () => {
  userStore.logout();
};
</script>

<style scoped>
/** bottom navigation **/
:deep(.btn-super-parent .btn-child-title) {
  display: none;
}

:deep(.btn-item .btn-title) {
  font-size: 14px;
  font-weight: bold;
  white-space: nowrap;
}

:deep(.btn-container) {
  height: 65px;
}

:deep(.btn-container_foreground) {
  height: 70px;
}

:deep(.btn-child-parent) {
  bottom: -25px;
}

:deep(.dark .active-label) {
  color: #f1f5f9;
}

:deep(.dark .btn-title) {
  color: #f1f5f9;
}

:deep(.dark .btn-child) {
  color: #f1f5f9;
}

</style>
