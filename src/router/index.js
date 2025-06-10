import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import ManualDocumentView from '@/views/ManualDocumentView.vue'
import BalanceReportView from '@/views/BalanceReportView.vue'
import JournalView from '@/views/JournalView.vue'
import JournalPrintView from '@/views/JournalPrintView.vue'
import JournalDeletedView from '@/views/JournalDeletedView.vue'
import TransactionCountsView from '@/views/TransactionCountsView.vue'
import AddItemPriceView from '@/views/AddItemPriceView.vue'
import EditItemPriceView from '@/views/EditItemPriceView.vue'
import SortItemPriceView from '@/views/SortItemPriceView.vue'
import UserListView from '@/views/UserListView.vue'
import AddUserView from '@/views/AddUserView.vue'
import UserAllView from '@/views/UserAllView.vue'
import PriceLogView from '@/views/PriceLogView.vue'
import UsersStatisticView from '@/views/UsersStatisticView.vue'
import UserPricesUpdateView from '@/views/UserPricesUpdateView.vue'
import UserAuthenticationView from '@/views/UserAuthenticationView.vue'
import UserAttachmentView from '@/views/UserAttachmentView.vue'
import UserTransactionsView from '@/views/UserTransactionsView.vue'
import CrmView from '@/views/CrmView.vue'
import SettingView from '@/views/SettingView.vue'
import TermsManagementView from '@/views/TermsManagementView.vue'
import DataBaseBackupView from '@/views/DataBaseBackupView.vue'
import ChangePasswordView from '@/views/ChangePasswordView.vue'
import PagesView from '@/views/PagesView.vue'
import UserRequestsView from '@/views/UserRequestsView.vue'
import CustomerTradeView from '@/views/customerViews/CustomerTradeView.vue'
import TradeView from '@/views/TradeView.vue'
import AuthenticationView from '@/views/customerViews/AuthenticationView.vue'
import FileAttachmentView from '@/views/customerViews/FileAttachmentView.vue'
import MyRequestsView from '@/views/customerViews/MyRequestsView.vue'
import TransactionsView from '@/views/customerViews/TransactionsView.vue'
import CustomerAboutus from '../views/customerViews/CustomerAboutus.vue'
import TermsView from '../views/TermsView.vue'
import AccountBalance from '../views/customerViews/AccountBalance.vue'

const adminRoutes = [
  {
    path: '/trade',
    name: 'trade',
    faName: 'خانه',
    icon: 'fa fa-home',
    component: TradeView,
    bottomNavigationPosition: 3,
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/manual-document',
    name: 'manual-document',
    faName: 'سند دستی',
    icon: 'fa-solid fa-file-invoice-dollar',
    component: ManualDocumentView,
    bottomNavigationPosition: 1,
    props: (route) => ({
      userId: route.query.userId
    }),
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/balance-report',
    name: 'balance-report',
    faName: 'تراز',
    icon: 'fa-solid fa-scale-balanced',
    component: BalanceReportView,
    bottomNavigationPosition: 2,
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '',
    name: 'documents',
    faName: 'مدیریت اسناد',
    icon: 'fa-solid fa-file-invoice',
    bottomNavigationPosition: 4,
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    },
    children: [
      {
        path: '/docs/list/1',
        name: 'journal',
        icon: 'fa-solid fa-file-invoice',
        faName: 'دفتر روزنامه',
        component: JournalView,
        meta: {
          requiresAuth: true,
          layout: 'DefaultLayout'
        }
      },
      {
        path: '/docs/list/2',
        name: 'for-print',
        faName: 'اسناد برای چاپ',
        icon: 'pi pi-print',
        component: JournalPrintView,
        meta: {
          requiresAuth: true,
          layout: 'DefaultLayout'
        }
      },
      {
        path: '/docs/list/3',
        name: 'deleted',
        faName: 'اسناد حذف شده',
        icon: 'fa-solid fa-file-circle-minus',
        component: JournalDeletedView,
        meta: {
          requiresAuth: true,
          layout: 'DefaultLayout'
        }
      },
      {
        path: '/requests/customer/count',
        name: 'transactions',
        faName: 'تعداد تراکنش‌ها',
        icon: 'fa-solid fa-file-lines',
        component: TransactionCountsView,
        meta: {
          requiresAuth: true,
          layout: 'DefaultLayout'
        }
      }
    ]
  },
  {
    path: '/price',
    name: 'items',
    faName: 'مدیریت آیتم‌ها',
    icon: 'fa-solid fa-sitemap',
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    },
    children: [
      {
        path: '/add',
        name: 'add-item',
        faName: 'افزودن آیتم جدید',
        icon: 'fa-solid fa-file-medical',
        component: AddItemPriceView,
        meta: {
          requiresAuth: true,
          layout: 'DefaultLayout'
        }
      },
      {
        path: '/edit',
        name: 'edit-item',
        faName: 'ویرایش آیتم',
        icon: 'fa-solid fa-file-pen',
        component: EditItemPriceView,
        meta: {
          requiresAuth: true,
          layout: 'DefaultLayout'
        }
      },
      {
        path: '/sort',
        name: 'sort-item',
        faName: 'مرتب‌سازی آیتم‌های',
        icon: 'fa-solid fa-arrow-down-wide-short',
        component: SortItemPriceView,
        meta: {
          requiresAuth: true,
          layout: 'DefaultLayout'
        }
      }
    ]
  },
  {
    path: '',
    name: 'manage-users',
    faName: 'مدیریت کاربران',
    icon: 'fa-solid fa-users-gear',
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    },
    children: [
      {
        path: '/user/list',
        name: 'user-list',
        faName: 'لیست کاربران',
        icon: 'fa-solid fa-users-between-lines',
        component: UserListView,
        meta: {
          requiresAuth: true,
          layout: 'DefaultLayout'
        }
      },
      {
        path: '/registration/signup',
        name: 'add-user',
        faName: 'افزودن کاربر',
        icon: 'fa-solid fa-user-plus',
        component: AddUserView,
        meta: {
          requiresAuth: true,
          layout: 'DefaultLayout'
        }
      },
      {
        path: '/users/all',
        name: 'user-all',
        faName: 'لیست چاپی کاربران',
        icon: 'fa-solid fa-users-rectangle',
        component: UserAllView,
        meta: {
          requiresAuth: true,
          layout: 'DefaultLayout'
        }
      },
      {
        path: '/price/logView',
        name: 'price-logView',
        faName: 'آمار آیتم‌های مشاهده شده',
        icon: 'fa-solid fa-chart-line',
        component: PriceLogView,
        meta: {
          requiresAuth: true,
          layout: 'DefaultLayout'
        }
      },
      {
        path: '/users/statistic',
        name: 'user-statistic',
        faName: 'آمار کلی مشتریان',
        icon: 'fa-solid fa-chart-pie',
        component: UsersStatisticView,
        meta: {
          requiresAuth: true,
          layout: 'DefaultLayout'
        }
      },
      {
        path: '/userPrices/updateByGroup',
        name: 'users-prices',
        faName: 'ویرایش سود گروهی',
        icon: 'fa-solid fa-users',
        component: UserPricesUpdateView,
        meta: {
          requiresAuth: true,
          layout: 'DefaultLayout'
        }
      },
      {
        path: '/users/authentication',
        name: 'user-authentication',
        faName: 'احراز هویت',
        icon: 'fa-solid fa-user-check',
        component: UserAuthenticationView,
        meta: {
          requiresAuth: true,
          layout: 'DefaultLayout'
        }
      }
    ]
  },
  {
    path: '/user/file/attachment',
    name: 'file-attachment',
    faName: 'فیش|فایل‌های ارسالی',
    icon: 'fa-solid fa-paperclip',
    component: UserAttachmentView,
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/user/havale',
    name: 'user-havale',
    faName: 'حواله‌های ثبت شده',
    icon: 'fa-solid fa-money-bill-transfer',
    component: UserTransactionsView,
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/crm',
    name: 'crm',
    faName: 'مدیریت ارتباط با مشتری',
    icon: 'fa-solid fa-comments',
    component: CrmView,
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/settings',
    name: 'settings',
    faName: 'تنظیمات',
    icon: 'fa-solid fa-gear',
    component: SettingView,
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/database/backup',
    name: 'database-backup',
    faName: 'پشتیبان اطلاعات',
    icon: 'fa-solid fa-database',
    component: DataBaseBackupView,
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/registration/changePassword',
    name: 'change-password',
    faName: 'تغییر رمز عبور',
    icon: 'fa-solid fa-user-lock',
    component: ChangePasswordView,
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/terms/management',
    name: 'terms-management',
    faName: 'شرایط و قوانین',
    icon: 'fa-solid fa-info',
    component: TermsManagementView,
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/pages',
    name: 'pages',
    faName: 'صفحات',
    icon: 'fa-solid fa-ellipsis-vertical',
    component: PagesView,
    bottomNavigationPosition: 5,
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/requests/customer/:id',
    name: 'CustomerRequests',
    faName: 'تعداد تراکنش‌ کاربر',
    icon: 'fa-solid fa-file-lines',
    component: UserRequestsView,
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout',
      hideInSidebar: true
    }
  },
  {
    path: '/balance/accountBalance/:id',
    name: 'balance-accountBalance',
    faName: 'فاکتورهای‌ کاربر',
    icon: 'fa-solid fa-wallet',
    component: AccountBalance,
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout',
      hideInSidebar: true
    }
  }
]

const customerRoutes = [
  {
    path: '/customer-trade',
    name: 'customer-trade',
    faName: 'خانه',
    icon: 'fa fa-home',
    component: CustomerTradeView,
    bottomNavigationPosition: 3,
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/requests/customer/list',
    name: 'requests-customer-list',
    faName: 'حسابداری',
    icon: 'fa-solid fa-file-invoice-dollar',
    component: MyRequestsView,
    bottomNavigationPosition: 2,
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/authentication',
    name: 'authentication',
    faName: 'احراز هویت',
    icon: 'fa-solid fa-user-check',
    component: AuthenticationView,
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/user/file/attachment',
    name: 'customerFileAttachment',
    faName: 'ارسال فیش|فایل',
    icon: 'fa-solid fa-paperclip',
    component: FileAttachmentView,
    bottomNavigationPosition: 4,
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/user/havale',
    name: 'customerTransactions',
    faName: 'ثبت حواله',
    icon: 'fa-solid fa-money-bill-transfer',
    component: TransactionsView,
    bottomNavigationPosition: 1,
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/aboutus',
    name: 'terms-management',
    faName: 'درباره ما',
    icon: 'fa-solid fa-info',
    component: CustomerAboutus,
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/balance/accountBalance',
    name: 'balance-accountBalance',
    faName: 'مانده حساب',
    icon: 'fa-solid fa-wallet',
    component: AccountBalance,
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/pages',
    name: 'pages',
    faName: 'صفحات',
    icon: 'fa-solid fa-ellipsis-vertical',
    component: PagesView,
    bottomNavigationPosition: 5,
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  }
]

export const getRoutesBasedOnUserType = (userType) => {
  const baseRoutes = [
    {
      path: '',
      redirect: () => {
        const isAuthenticated = localStorage.getItem('token')
        if (userType === 4) {
          return isAuthenticated ? '/customer-trade' : '/registration/login'
        }
        return isAuthenticated ? '/trade' : '/registration/login'
      }
    },
    {
      path: '/registration/login',
      name: 'login',
      component: LoginView,
      meta: { layout: 'EmptyLayout' }
    },
    {
      path: '/login',
      redirect: '/registration/login'
    },
    {
      path: '/terms',
      name: 'terms',
      component: TermsView,
      meta: { layout: 'EmptyLayout' }
    }
  ]

  if (userType === 1) { // Admin
    return [...baseRoutes, ...adminRoutes]
  } else if (userType === 4) { // Customer
    return [...baseRoutes, ...customerRoutes]
  }

  return baseRoutes // Default case
}

const initialUserType = localStorage.getItem('type') || 1
const router = createRouter({
  history: createWebHistory(),
  routes: getRoutesBasedOnUserType(+initialUserType)
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token') && localStorage.getItem('id')
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/registration/login')
  } else if (to.path === '/manual-document' && !to.query.userId && from.query.userId) {
    next({ path: to.path, query: { userId: from.query.userId } })
  } else {
    next()
  }
})

export default router
